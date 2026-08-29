// node --test chunked-download.test.mjs
// 全部用假 fetch，不联网。假来源实现真实 Range 语义并可注入各种故障。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomFillSync } from 'node:crypto';

import {
  DEFAULT_CHUNK_BYTES,
  probeSources,
  downloadChunked,
  createBrowserSink,
  createMemorySink,
  parseContentRange,
  sha256Hex,
  verifySink,
} from '../.vitepress/theme/chunked-download.mjs';

const KiB = 1024;
const MiB = 1024 * KiB;
const CHUNK = 64 * KiB;
/** 所有假来源共享的同一份随机文件 */
const FILE = randomFillSync(new Uint8Array(1.5 * MiB));
const CHUNKS_TOTAL = Math.ceil(FILE.length / CHUNK); // 24

// ---------------------------------------------------------------------------
// 假来源 / 假 fetch
// ---------------------------------------------------------------------------

/**
 * @typedef {'ok' | '500' | 'throw' | 'wrongTotal' | 'ignoreRange' | 'truncate'} Mode
 * @typedef {{ start: number, end: number, requestNo: number }} RequestInfo
 * @typedef {{ pieces?: number, firstDelayMs?: number, pauseAt?: number, pauseMs?: number, hangAt?: number, onPiece?: (i: number) => void }} StreamPlan
 *   流式响应计划：body 切成 pieces 段（默认 4）；firstDelayMs：发头后第 0 段延迟；pauseAt/pauseMs：发第 pauseAt 段前停顿；
 *   hangAt：第 hangAt 段永远不发；onPiece：每段发出前回调（测试用来拨假时钟）。
 * @typedef {{ id: string, delayMs?: number, ignoresSignal?: boolean, behavior?: (req: RequestInfo) => Mode, stream?: (req: RequestInfo) => StreamPlan | undefined }} OriginSpec
 * @typedef {{ start: number, mode: Mode, requestNo: number, signal: AbortSignal | undefined, cancelled: boolean, streamed: boolean }} LogEntry
 */

/** @returns {Error} */
function abortError() {
  const e = new Error('aborted');
  e.name = 'AbortError';
  return e;
}

/**
 * @param {number} ms
 * @param {AbortSignal | undefined} signal
 * @returns {Promise<void>}
 */
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(t);
      reject(abortError());
    };
    const t = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * @param {string | null} header
 * @param {number} fileLength
 * @returns {{ start: number, end: number }}
 */
function parseRangeHeader(header, fileLength) {
  const m = /^bytes=(\d+)-(\d*)$/.exec(header ?? '');
  if (!m) throw new Error(`fake origin: bad Range header ${header}`);
  const start = Number(m[1]);
  const end = m[2] === '' ? fileLength - 1 : Number(m[2]);
  return { start, end };
}

/**
 * 可控的流式 body：按计划分段、延迟、停顿或永远挂住；被 reader.cancel 时记到 entry.cancelled 并清掉挂着的定时器。
 * @param {Uint8Array} body
 * @param {StreamPlan} plan
 * @param {LogEntry} entry
 * @returns {ReadableStream<Uint8Array>}
 */
function buildStreamingBody(body, plan, entry) {
  const count = plan.pieces ?? 4;
  const pieceLen = Math.ceil(body.length / count);
  /** @type {Uint8Array[]} */
  const pieces = [];
  for (let i = 0; i < count; i += 1) pieces.push(body.slice(i * pieceLen, (i + 1) * pieceLen));
  let next = 0;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;
  /** @param {number} ms */
  const wait = (ms) => new Promise((resolve) => {
    timer = setTimeout(resolve, ms);
  });
  entry.streamed = true;
  return new ReadableStream({
    async pull(controller) {
      if (next === 0 && plan.firstDelayMs) await wait(plan.firstDelayMs);
      if (plan.hangAt === next) await new Promise(() => {});
      if (plan.pauseAt === next && plan.pauseMs) await wait(plan.pauseMs);
      if (entry.cancelled) return;
      if (next >= pieces.length) {
        controller.close();
        return;
      }
      if (plan.onPiece) plan.onPiece(next);
      controller.enqueue(pieces[next]);
      next += 1;
    },
    cancel() {
      entry.cancelled = true;
      clearTimeout(timer);
    },
  });
}

/**
 * @param {Uint8Array} file
 * @param {{ start: number, end: number }} range
 * @param {Mode} mode
 * @param {StreamPlan | undefined} plan
 * @param {LogEntry} entry
 * @returns {Response}
 */
function buildResponse(file, range, mode, plan, entry) {
  if (mode === '500') return new Response('boom', { status: 500 });
  if (mode === 'throw') throw new TypeError('fetch failed');
  if (mode === 'ignoreRange') {
    return new Response(file.slice(), {
      status: 200,
      headers: { 'accept-ranges': 'bytes', 'content-length': String(file.length) },
    });
  }
  const start = range.start;
  const end = Math.min(range.end, file.length - 1);
  const total = mode === 'wrongTotal' ? file.length + 1 : file.length;
  let body = file.slice(start, end + 1);
  if (mode === 'truncate') body = body.slice(0, body.length >> 1);
  return new Response(plan ? buildStreamingBody(body, plan, entry) : body, {
    status: 206,
    headers: {
      'content-range': `bytes ${start}-${end}/${total}`,
      'accept-ranges': 'bytes',
      'content-length': String(body.length),
    },
  });
}

/**
 * @param {Uint8Array} file
 * @param {OriginSpec[]} specs
 */
function createFakeWorld(file, specs) {
  let active = 0;
  const stats = { peakActive: 0, totalRequests: 0 };
  const origins = specs.map((spec) => ({
    delayMs: 0,
    ignoresSignal: false,
    behavior: /** @type {(req: RequestInfo) => Mode} */ (() => 'ok'),
    stream: /** @type {(req: RequestInfo) => StreamPlan | undefined} */ (() => undefined),
    ...spec,
    url: `https://fushi.moe/releases/${spec.id}/fushi-setup.exe`,
    requests: 0,
    served: 0,
    /** @type {LogEntry[]} */
    log: [],
  }));

  /** @type {typeof fetch} */
  const fetchImpl = async (input, init = {}) => {
    const url = String(input);
    const origin = origins.find((o) => o.url === url);
    if (!origin) return new Response('not found', { status: 404 });
    const signal = origin.ignoresSignal ? undefined : init.signal ?? undefined;
    if (signal?.aborted) throw abortError();
    origin.requests += 1;
    const requestNo = origin.requests; // 发起时编号（响应时再读计数会被并发请求推高）
    stats.totalRequests += 1;
    active += 1;
    stats.peakActive = Math.max(stats.peakActive, active);
    try {
      await sleep(origin.delayMs, signal);
      const range = parseRangeHeader(new Headers(init.headers).get('range'), file.length);
      const req = { ...range, requestNo };
      const mode = origin.behavior(req);
      /** @type {LogEntry} */
      const entry = { start: range.start, mode, requestNo, signal: init.signal ?? undefined, cancelled: false, streamed: false };
      const res = buildResponse(file, range, mode, mode === 'ok' ? origin.stream(req) : undefined, entry);
      origin.log.push(entry);
      if (mode === 'ok') origin.served += 1;
      return res;
    } finally {
      active -= 1;
    }
  };

  return {
    fetch: fetchImpl,
    stats,
    sources: origins.map((o) => ({ id: o.id, url: o.url })),
    /** @param {string} id */
    origin(id) {
      const o = origins.find((x) => x.id === id);
      if (!o) throw new Error(`no origin ${id}`);
      return o;
    },
  };
}

/**
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {boolean}
 */
function sameBytes(a, b) {
  return a.byteLength === b.byteLength && Buffer.compare(
    Buffer.from(a.buffer, a.byteOffset, a.byteLength),
    Buffer.from(b.buffer, b.byteOffset, b.byteLength),
  ) === 0;
}

/**
 * 包一层 sink，记录 write 调用。
 * @param {ReturnType<typeof createMemorySink>} inner
 */
function recordingSink(inner) {
  const log = { writes: 0, maxWriteBytes: 0, abortCalls: 0 };
  return {
    log,
    inner,
    /** @param {number} p @param {Uint8Array} d */
    async write(p, d) {
      log.writes += 1;
      log.maxWriteBytes = Math.max(log.maxWriteBytes, d.byteLength);
      return inner.write(p, d);
    },
    close: () => inner.close(),
    async abort() {
      log.abortCalls += 1;
      return inner.abort();
    },
  };
}

/** @param {ReturnType<typeof createFakeWorld>} world @param {Partial<Parameters<typeof downloadChunked>[0]>} [extra] */
function baseJob(world, extra = {}) {
  return {
    sources: world.sources,
    size: FILE.length,
    chunkBytes: CHUNK,
    fetch: world.fetch,
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

test('parseContentRange 解析与拒绝', () => {
  assert.deepEqual(parseContentRange('bytes 0-65535/1572864'), { start: 0, end: 65535, total: 1572864 });
  assert.deepEqual(parseContentRange('  BYTES 10-19/20 '), { start: 10, end: 19, total: 20 });
  assert.equal(parseContentRange('bytes 0-10/*'), null);
  assert.equal(parseContentRange('bytes 10-5/100'), null);
  assert.equal(parseContentRange('bytes 0-100/100'), null);
  assert.equal(parseContentRange('bytes 0-10'), null);
  assert.equal(parseContentRange(null), null);
  assert.equal(DEFAULT_CHUNK_BYTES, 8 * MiB);
});

test('1. 双源正常：逐字节相等、两边都出力、进度单调到 size', async () => {
  const world = createFakeWorld(FILE, [{ id: 'A', delayMs: 2 }, { id: 'B', delayMs: 3 }]);
  const sink = createMemorySink(FILE.length);
  /** @type {import('./chunked-download.mjs').ChunkProgress[]} */
  const progress = [];
  const result = await downloadChunked(baseJob(world, { sink, onProgress: (p) => progress.push(p) }));

  assert.ok(sameBytes(sink.bytes(), FILE), 'bytes differ');
  assert.equal(sink.closed, true);
  assert.equal(result.bytes, FILE.length);
  assert.ok(result.perSource.A > 0 && result.perSource.B > 0, `perSource ${JSON.stringify(result.perSource)}`);
  assert.equal(result.perSource.A + result.perSource.B, FILE.length);
  assert.deepEqual(result.droppedSources, []);

  assert.equal(progress.length, CHUNKS_TOTAL);
  const last = progress[progress.length - 1];
  assert.equal(last.chunksDone, last.chunksTotal);
  assert.equal(last.chunksTotal, CHUNKS_TOTAL);
  assert.equal(last.bytesDone, FILE.length);
  assert.equal(last.bytesTotal, FILE.length);
  for (let i = 1; i < progress.length; i += 1) {
    assert.ok(progress[i].bytesDone > progress[i - 1].bytesDone, 'bytesDone must strictly increase');
    assert.equal(progress[i].chunksDone, progress[i - 1].chunksDone + 1);
  }
  for (const p of progress) {
    assert.ok(Number.isFinite(p.bytesPerSecond) && p.bytesPerSecond >= 0);
    assert.deepEqual([...p.activeSources].sort(), ['A', 'B']);
  }
});

test('2. 一个来源探测就挂（500）：probeSources 只返回另一个，下载仍完整', async () => {
  const world = createFakeWorld(FILE, [{ id: 'A', delayMs: 2 }, { id: 'B', behavior: () => '500' }]);
  const probed = await probeSources(world.sources, { fetch: world.fetch, probeBytes: 16 * KiB });
  assert.equal(probed.size, FILE.length);
  assert.deepEqual(probed.sources.map((s) => s.id), ['A']);
  assert.ok(typeof probed.sources[0].probeMs === 'number' && probed.sources[0].probeMs >= 0);

  const sink = createMemorySink(probed.size);
  const result = await downloadChunked(baseJob(world, { sources: probed.sources, sink }));
  assert.ok(sameBytes(sink.bytes(), FILE));
  assert.equal(result.perSource.A, FILE.length);
  assert.equal(world.origin('B').requests, 1, 'B 只被探测碰过一次');
});

test('probeSources 按耗时升序，超时来源剔除，全挂时 size=0', async () => {
  const world = createFakeWorld(FILE, [
    { id: 'slow', delayMs: 30 },
    { id: 'fast', delayMs: 2 },
    { id: 'stuck', delayMs: 5000 },
  ]);
  const probed = await probeSources(world.sources, { fetch: world.fetch, timeoutMs: 200 });
  assert.deepEqual(probed.sources.map((s) => s.id), ['fast', 'slow']);
  assert.ok(probed.sources[0].probeMs < probed.sources[1].probeMs);

  const dead = createFakeWorld(FILE, [{ id: 'X', behavior: () => 'throw' }, { id: 'Y', behavior: () => '500' }]);
  assert.deepEqual(await probeSources(dead.sources, { fetch: dead.fetch }), { sources: [], size: 0 });
});

test('probeSources 探测小文件：服务端把 end 夹到 total-1 也算可用', async () => {
  const small = randomFillSync(new Uint8Array(1000));
  const world = createFakeWorld(small, [{ id: 'A' }]);
  const probed = await probeSources(world.sources, { fetch: world.fetch, probeBytes: 64 * KiB });
  assert.equal(probed.size, 1000);
  assert.deepEqual(probed.sources.map((s) => s.id), ['A']);
});

test('probeSources 接外部 signal：中途取消立刻返回，已取消则一个请求都不发', async () => {
  // 下载页的「取消」按钮要能当场掐断探测。signal 不透传下来的话，取消之后这几个探测
  // 请求还在飞，调用方只能干等到 timeoutMs——页面上就是「点了取消没反应，过一会儿
  // 自己恢复原样」。
  const world = createFakeWorld(FILE, [{ id: 'stuck', delayMs: 3000 }]);
  const ctrl = new AbortController();
  const t0 = Date.now();
  const pending = probeSources(world.sources, { fetch: world.fetch, timeoutMs: 3000, signal: ctrl.signal });
  setTimeout(() => ctrl.abort(), 30);
  assert.deepEqual(await pending, { sources: [], size: 0 });
  const elapsed = Date.now() - t0;
  assert.ok(elapsed < 1000, '取消后应当立刻返回，实测 ' + elapsed + 'ms');

  const world2 = createFakeWorld(FILE, [{ id: 'A', delayMs: 2 }]);
  const aborted = new AbortController();
  aborted.abort();
  assert.deepEqual(
    await probeSources(world2.sources, { fetch: world2.fetch, signal: aborted.signal }),
    { sources: [], size: 0 },
  );
  assert.equal(world2.origin('A').requests, 0, '已经取消了就不该再发探测请求');
});

test('3. 一个来源中途永久失败：分片被另一来源接管，结果正确，该来源进 droppedSources', async () => {
  const world = createFakeWorld(FILE, [
    { id: 'A', delayMs: 3 },
    { id: 'B', delayMs: 3, behavior: ({ requestNo }) => (requestNo > 4 ? 'throw' : 'ok') },
  ]);
  const sink = createMemorySink(FILE.length);
  const result = await downloadChunked(baseJob(world, { sink, maxSourceFailures: 3 }));

  assert.ok(sameBytes(sink.bytes(), FILE));
  assert.deepEqual(result.droppedSources, ['B']);
  const b = world.origin('B');
  assert.equal(b.served, 4);
  assert.equal(world.origin('A').served, CHUNKS_TOTAL - 4);
  // 3 次连续失败即退出；两条 worker 最多再多带出 1 个已在飞的失败请求
  assert.ok(b.requests >= 4 + 3 && b.requests <= 4 + 3 + 1, `B requests = ${b.requests}`);
  assert.equal(result.perSource.B, 4 * CHUNK);
  assert.equal(result.perSource.A, FILE.length - 4 * CHUNK);
});

test('3b. 失败分片放回队列后优先由别的来源接手，失败方不自己重试', async () => {
  const world = createFakeWorld(FILE, [
    { id: 'A', delayMs: 2 },
    { id: 'B', delayMs: 2, behavior: ({ requestNo }) => (requestNo === 2 ? '500' : 'ok') },
  ]);
  const sink = createMemorySink(FILE.length);
  const result = await downloadChunked(baseJob(world, { sink }));
  assert.ok(sameBytes(sink.bytes(), FILE));
  assert.deepEqual(result.droppedSources, []);
  const failed = world.origin('B').log.find((e) => e.mode === '500');
  assert.ok(failed, 'B 应当失败过一次');
  const retriedByB = world.origin('B').log.filter((e) => e.start === failed.start && e.mode === 'ok');
  const retriedByA = world.origin('A').log.filter((e) => e.start === failed.start && e.mode === 'ok');
  assert.equal(retriedByB.length, 0, 'B 还有别的来源活着时不该重试自己失败的分片');
  assert.equal(retriedByA.length, 1, '失败分片由 A 接手');
});

test('4. 来源返回 200 忽略 Range → 视为失败，整文件绝不会当分片写进 sink', async () => {
  const world = createFakeWorld(FILE, [
    { id: 'A', delayMs: 2 },
    { id: 'B', delayMs: 1, behavior: () => 'ignoreRange' },
  ]);
  const sink = recordingSink(createMemorySink(FILE.length));
  const result = await downloadChunked(baseJob(world, { sink }));

  assert.ok(sameBytes(sink.inner.bytes(), FILE));
  assert.deepEqual(result.droppedSources, ['B']);
  assert.equal(result.perSource.B, 0);
  assert.equal(sink.log.maxWriteBytes, CHUNK);
  assert.equal(sink.log.writes, CHUNKS_TOTAL);
  assert.equal(world.origin('B').served, 0);
});

test('5. 全部来源失败 → reject all sources failed，sink 未 close', async () => {
  const world = createFakeWorld(FILE, [
    { id: 'A', delayMs: 1, behavior: () => '500' },
    { id: 'B', delayMs: 1, behavior: () => 'throw' },
  ]);
  const sink = recordingSink(createMemorySink(FILE.length));
  await assert.rejects(downloadChunked(baseJob(world, { sink, maxSourceFailures: 3 })), { message: 'all sources failed' });
  assert.equal(sink.inner.closed, false);
  assert.equal(sink.log.writes, 0);
  for (const id of ['A', 'B']) {
    const o = world.origin(id);
    assert.ok(o.requests >= 3 && o.requests <= 4, `${id} requests = ${o.requests}`);
  }
});

for (const ignoresSignal of [false, true]) {
  test(`6. AbortSignal 中止（fetch ${ignoresSignal ? '不' : ''}响应 signal）→ AbortError、sink.abort 被调、无后续 fetch`, async () => {
    const world = createFakeWorld(FILE, [
      { id: 'A', delayMs: 50, ignoresSignal },
      { id: 'B', delayMs: 50, ignoresSignal },
    ]);
    const sink = recordingSink(createMemorySink(FILE.length));
    const ac = new AbortController();
    const job = downloadChunked(baseJob(world, { sink, signal: ac.signal, maxTotalConcurrency: 4 }));
    await sleep(10, undefined);
    ac.abort();
    await assert.rejects(job, (err) => err.name === 'AbortError');

    const requestsAtAbort = world.stats.totalRequests;
    assert.equal(requestsAtAbort, 4, '中止前正好发出 maxTotalConcurrency 个请求');
    assert.equal(sink.log.abortCalls, 1);
    assert.equal(sink.inner.aborted, true);
    assert.equal(sink.inner.closed, false);

    await sleep(150, undefined); // 让在飞的假请求跑完
    assert.equal(world.stats.totalRequests, requestsAtAbort, '中止后不得再发 fetch');
    assert.equal(sink.log.writes, 0, '中止后不得再写 sink');
  });
}

test('6b. 传入时已中止的 signal → 立即 AbortError，一个 fetch 都不发', async () => {
  const world = createFakeWorld(FILE, [{ id: 'A' }]);
  const sink = recordingSink(createMemorySink(FILE.length));
  const ac = new AbortController();
  ac.abort();
  await assert.rejects(downloadChunked(baseJob(world, { sink, signal: ac.signal })), (err) => err.name === 'AbortError');
  assert.equal(world.stats.totalRequests, 0);
  assert.equal(sink.log.abortCalls, 1);
});

test('7. probeSources expectedSize 不匹配的来源被剔除；下载中 total 不对同样算失败', async () => {
  const world = createFakeWorld(FILE, [
    { id: 'A', delayMs: 3 },
    { id: 'B', delayMs: 1, behavior: () => 'wrongTotal' },
  ]);
  const probed = await probeSources(world.sources, { fetch: world.fetch, expectedSize: FILE.length });
  assert.equal(probed.size, FILE.length);
  assert.deepEqual(probed.sources.map((s) => s.id), ['A']);

  // 不传 expectedSize：B 更快但少数派，多数票仍选正确 total
  const three = createFakeWorld(FILE, [
    { id: 'A', delayMs: 3 },
    { id: 'B', delayMs: 1, behavior: () => 'wrongTotal' },
    { id: 'C', delayMs: 3 },
  ]);
  const voted = await probeSources(three.sources, { fetch: three.fetch });
  assert.equal(voted.size, FILE.length);
  assert.deepEqual(voted.sources.map((s) => s.id).sort(), ['A', 'C']);

  // 调用方硬塞 B 进下载：每个分片 total 校验失败 → B 被丢，A 兜底
  const sink = createMemorySink(FILE.length);
  const result = await downloadChunked(baseJob(world, { sink }));
  assert.ok(sameBytes(sink.bytes(), FILE));
  assert.deepEqual(result.droppedSources, ['B']);
  assert.equal(result.perSource.B, 0);
});

test('8. 并发上限：任一时刻在飞请求数 ≤ maxTotalConcurrency', async () => {
  const world = createFakeWorld(FILE, [
    { id: 'A', delayMs: 3 },
    { id: 'B', delayMs: 3 },
    { id: 'C', delayMs: 3 },
  ]);
  const sink = createMemorySink(FILE.length);
  await downloadChunked(baseJob(world, { sink, perSourceConcurrency: 2, maxTotalConcurrency: 4 }));
  assert.ok(sameBytes(sink.bytes(), FILE));
  assert.ok(world.stats.peakActive <= 4, `peak ${world.stats.peakActive}`);
  assert.ok(world.stats.peakActive >= 2, '并发确实发生了');

  const serial = createFakeWorld(FILE, [{ id: 'A', delayMs: 1 }, { id: 'B', delayMs: 1 }]);
  const sink2 = createMemorySink(FILE.length);
  await downloadChunked(baseJob(serial, { sink: sink2, maxTotalConcurrency: 1 }));
  assert.ok(sameBytes(sink2.bytes(), FILE));
  assert.equal(serial.stats.peakActive, 1);
});

test('9. 快慢来源：快来源承担的分片数明显更多（工作窃取）', async () => {
  const world = createFakeWorld(FILE, [{ id: 'slow', delayMs: 80 }, { id: 'fast', delayMs: 4 }]);
  const sink = createMemorySink(FILE.length);
  const t0 = performance.now();
  const result = await downloadChunked(baseJob(world, { sink }));
  const elapsed = performance.now() - t0;

  assert.ok(sameBytes(sink.bytes(), FILE));
  const fast = world.origin('fast').served;
  const slow = world.origin('slow').served;
  assert.equal(fast + slow, CHUNKS_TOTAL);
  assert.ok(slow >= 1, 'slow 至少拿到了开头的分片');
  assert.ok(fast >= 16 && slow <= 8, `fast=${fast} slow=${slow}`);
  assert.ok(fast > slow * 2, `fast=${fast} slow=${slow}`);
  assert.deepEqual(result.droppedSources, []);
  // 全给 slow 做要 12 轮 × 80ms ≈ 960ms；窃取生效应远快于此
  assert.ok(elapsed < 600, `elapsed ${elapsed.toFixed(0)}ms`);
});

test('10. 中途断连（body 短于 Content-Range）算失败，成功一次清零连续失败计数', async () => {
  const world = createFakeWorld(FILE, [
    { id: 'A', delayMs: 2 },
    { id: 'B', delayMs: 2, behavior: ({ requestNo }) => (requestNo === 3 || requestNo === 6 ? 'truncate' : 'ok') },
  ]);
  const sink = createMemorySink(FILE.length);
  const result = await downloadChunked(baseJob(world, { sink, maxSourceFailures: 2 }));
  assert.ok(sameBytes(sink.bytes(), FILE));
  assert.deepEqual(result.droppedSources, [], '非连续失败不能把来源踢掉');
  assert.ok(world.origin('B').requests >= 7);
});

test('11. 单来源失败后重试自己的分片（没别人可接手），非连续失败不退出', async () => {
  const bad = new Set([2, 5, 8]);
  const world = createFakeWorld(FILE, [{ id: 'A', delayMs: 1, behavior: ({ requestNo }) => (bad.has(requestNo) ? '500' : 'ok') }]);
  const sink = createMemorySink(FILE.length);
  const result = await downloadChunked(baseJob(world, { sink, maxSourceFailures: 2 }));
  assert.ok(sameBytes(sink.bytes(), FILE));
  assert.deepEqual(result.droppedSources, []);
  assert.equal(world.origin('A').requests, CHUNKS_TOTAL + 3);
});

test('12. sink.write 抛错是致命错误：原错误 reject，sink.abort 被调，停止后续 fetch', async () => {
  const world = createFakeWorld(FILE, [{ id: 'A', delayMs: 5 }, { id: 'B', delayMs: 5 }]);
  const inner = createMemorySink(FILE.length);
  let abortCalls = 0;
  const sink = {
    /** @param {number} p @param {Uint8Array} d */
    async write(p, d) {
      if (p === 0) throw new Error('disk full');
      return inner.write(p, d);
    },
    close: () => inner.close(),
    async abort() {
      abortCalls += 1;
    },
  };
  await assert.rejects(downloadChunked(baseJob(world, { sink })), { message: 'disk full' });
  assert.equal(abortCalls, 1);
  assert.equal(inner.closed, false);
  const at = world.stats.totalRequests;
  await sleep(60, undefined);
  assert.equal(world.stats.totalRequests, at);
});

test('13. size=0：不发请求，直接 close', async () => {
  const world = createFakeWorld(FILE, [{ id: 'A' }]);
  const sink = createMemorySink(0);
  const result = await downloadChunked(baseJob(world, { sink, size: 0 }));
  assert.deepEqual(result, { bytes: 0, perSource: { A: 0 }, droppedSources: [] });
  assert.equal(sink.closed, true);
  assert.equal(world.stats.totalRequests, 0);
});

test('14. 参数校验', async () => {
  const world = createFakeWorld(FILE, [{ id: 'A' }]);
  const sink = createMemorySink(FILE.length);
  await assert.rejects(downloadChunked(baseJob(world, { sink, size: -1 })), TypeError);
  await assert.rejects(downloadChunked(baseJob(world, { sink, chunkBytes: 0 })), TypeError);
  await assert.rejects(downloadChunked(baseJob(world, { sink: /** @type {any} */ ({}) })), TypeError);
  await assert.rejects(downloadChunked(baseJob(world, { sink, fetch: /** @type {any} */ (42) })), TypeError); // null 会被 ?? 当成未传而回落真 fetch
  assert.throws(() => createMemorySink(-1), TypeError);
});

test('createMemorySink：越界 / 关后写 / abort 语义', async () => {
  const sink = createMemorySink(10);
  await sink.write(0, new Uint8Array([1, 2, 3]));
  await sink.write(7, new Uint8Array([7, 8, 9]));
  await assert.rejects(sink.write(8, new Uint8Array(3)), RangeError);
  await assert.rejects(sink.write(-1, new Uint8Array(1)), RangeError);
  await assert.rejects(sink.write(0, /** @type {any} */ ([1])), TypeError);
  assert.deepEqual([...sink.bytes()], [1, 2, 3, 0, 0, 0, 0, 7, 8, 9]);
  await sink.close();
  assert.equal(sink.closed, true);
  await assert.rejects(sink.write(0, new Uint8Array(1)), /after close/);

  const aborted = createMemorySink(4);
  await aborted.abort();
  assert.equal(aborted.aborted, true);
  await assert.rejects(aborted.close(), /after abort/);
});

test('createBrowserSink forceMemory：close 时把完整 Blob 交给注入的 save', async () => {
  /** @type {{ blob: Blob, filename: string }[]} */
  const saved = [];
  const sink = await createBrowserSink({
    filename: 'fushi-setup.exe',
    size: FILE.length,
    forceMemory: true,
    save: async (blob, filename) => {
      saved.push({ blob, filename });
    },
  });
  assert.equal(sink.kind, 'memory');

  const world = createFakeWorld(FILE, [{ id: 'A', delayMs: 1 }, { id: 'B', delayMs: 1 }]);
  await downloadChunked(baseJob(world, { sink }));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].filename, 'fushi-setup.exe');
  assert.equal(saved[0].blob.size, FILE.length);
  assert.ok(sameBytes(new Uint8Array(await saved[0].blob.arrayBuffer()), FILE));
});

test('createBrowserSink：内存分配失败 → reject RangeError；没有 showSaveFilePicker 时自动走内存分支', async () => {
  assert.equal(typeof globalThis.showSaveFilePicker, 'undefined');
  await assert.rejects(createBrowserSink({ filename: 'x.zip', size: Number.MAX_SAFE_INTEGER, forceMemory: true }), RangeError);
  await assert.rejects(createBrowserSink({ filename: 'x.zip', size: Number.MAX_SAFE_INTEGER }), RangeError);

  let saves = 0;
  const sink = await createBrowserSink({ filename: 'x.zip', size: 3, save: async () => { saves += 1; } });
  assert.equal(sink.kind, 'memory');
  await sink.write(0, new Uint8Array([1, 2, 3]));
  await sink.close();
  assert.equal(saves, 1);
  await assert.rejects(createBrowserSink({ filename: '', size: 1, forceMemory: true }), TypeError);
});

test('createBrowserSink：showSaveFilePicker 存在时走文件系统分支；用户取消 → AbortError', async () => {
  /** @type {{ position: number, data: Uint8Array }[]} */
  const writes = [];
  let truncated = -1;
  let closed = 0;
  const fakeHandle = {
    async createWritable() {
      return {
        /** @param {number} n */
        async truncate(n) { truncated = n; },
        /** @param {{ type: string, position: number, data: Uint8Array }} chunk */
        async write(chunk) {
          assert.equal(chunk.type, 'write');
          writes.push({ position: chunk.position, data: chunk.data });
        },
        async close() { closed += 1; },
        async abort() {},
      };
    },
  };
  const g = /** @type {any} */ (globalThis);
  g.showSaveFilePicker = async () => fakeHandle;
  try {
    const sink = await createBrowserSink({ filename: 'a.apk', size: 10 });
    assert.equal(sink.kind, 'filesystem');
    assert.equal(truncated, 10);
    await sink.write(5, new Uint8Array([5]));
    await sink.write(0, new Uint8Array([0]));
    await sink.close();
    assert.deepEqual(writes.map((w) => w.position), [5, 0]);
    assert.equal(closed, 1);

    g.showSaveFilePicker = async () => { throw abortError(); };
    await assert.rejects(createBrowserSink({ filename: 'a.apk', size: 10 }), (err) => err.name === 'AbortError');

    g.showSaveFilePicker = async () => { throw new Error('SecurityError: needs user activation'); };
    const fallback = await createBrowserSink({ filename: 'a.apk', size: 10, save: async () => {} });
    assert.equal(fallback.kind, 'memory');
  } finally {
    delete g.showSaveFilePicker;
  }
});

// ---------------------------------------------------------------------------
// 分片看门狗（流式读取）
// ---------------------------------------------------------------------------

test('15. 首字节超过 firstByteMs：该分片请求被 abort、放回队列，由别的来源完成', async () => {
  const world = createFakeWorld(FILE, [
    { id: 'A', delayMs: 2 },
    { id: 'B', delayMs: 2, stream: ({ requestNo }) => (requestNo === 1 ? { firstDelayMs: 400 } : undefined) },
  ]);
  const sink = createMemorySink(FILE.length);
  const t0 = performance.now();
  const result = await downloadChunked(baseJob(world, { sink, firstByteMs: 80 }));
  const elapsed = performance.now() - t0;

  assert.ok(sameBytes(sink.bytes(), FILE), 'bytes differ');
  assert.deepEqual(result.droppedSources, []);
  assert.ok(elapsed < 350, `不该等到 400ms 的首字节延迟：elapsed ${elapsed.toFixed(0)}ms`);
  const stalled = world.origin('B').log.find((e) => e.requestNo === 1);
  assert.ok(stalled && stalled.streamed, 'B 的第 1 次请求应是流式响应');
  assert.equal(stalled.cancelled, true, '假流的 cancel 应被调（请求确实被 abort）');
  assert.equal(stalled.signal?.aborted, true, '该次请求自己的 signal 应已 aborted');
  assert.equal(world.origin('B').log.filter((e) => e.start === stalled.start).length, 1, 'A 活着时 B 不重试自己卡住的分片');
  assert.equal(world.origin('A').log.filter((e) => e.start === stalled.start && e.mode === 'ok').length, 1, '卡住的分片由 A 接手');
});

test('16. 中途停顿超过 stallMs：分片被 abort 重新入队并由别的来源完成', async () => {
  const world = createFakeWorld(FILE, [
    { id: 'A', delayMs: 2 },
    { id: 'B', delayMs: 2, stream: ({ requestNo }) => (requestNo === 2 ? { pauseAt: 2, pauseMs: 400 } : undefined) },
  ]);
  const sink = createMemorySink(FILE.length);
  const t0 = performance.now();
  const result = await downloadChunked(baseJob(world, { sink, stallMs: 80 }));
  const elapsed = performance.now() - t0;

  assert.ok(sameBytes(sink.bytes(), FILE), 'bytes differ');
  assert.deepEqual(result.droppedSources, []);
  assert.ok(elapsed < 350, `不该等完 400ms 的停顿：elapsed ${elapsed.toFixed(0)}ms`);
  const stalled = world.origin('B').log.find((e) => e.requestNo === 2);
  assert.ok(stalled && stalled.streamed);
  assert.equal(stalled.cancelled, true, '停顿的流应被 cancel');
  assert.equal(stalled.signal?.aborted, true);
  assert.equal(world.origin('B').log.filter((e) => e.start === stalled.start).length, 1);
  assert.equal(world.origin('A').log.filter((e) => e.start === stalled.start && e.mode === 'ok').length, 1, '由 A 接手');
});

test('16b. 停顿小于 stallMs：正常完成，不算失败（maxSourceFailures=1 也不退出、无重试）', async () => {
  const world = createFakeWorld(FILE, [
    { id: 'A', delayMs: 1, stream: ({ requestNo }) => (requestNo === 3 ? { pauseAt: 2, pauseMs: 30 } : undefined) },
  ]);
  const sink = createMemorySink(FILE.length);
  const result = await downloadChunked(baseJob(world, { sink, stallMs: 300, maxSourceFailures: 1 }));
  assert.ok(sameBytes(sink.bytes(), FILE));
  assert.deepEqual(result.droppedSources, []);
  assert.equal(result.perSource.A, FILE.length);
  const a = world.origin('A');
  assert.equal(a.requests, CHUNKS_TOTAL, '没有任何重试');
  assert.ok(a.log.every((e) => !e.cancelled), '没有请求被 abort');
  assert.ok(a.log.some((e) => e.streamed), '确实走过流式响应');
});

test('17. 单来源卡住：自己重试成功不退出；连续卡住达 maxSourceFailures 才退出并 reject', async () => {
  const world = createFakeWorld(FILE, [
    { id: 'A', delayMs: 1, stream: ({ requestNo }) => (requestNo === 2 ? { hangAt: 1 } : undefined) },
  ]);
  const sink = createMemorySink(FILE.length);
  const result = await downloadChunked(baseJob(world, { sink, stallMs: 50, maxSourceFailures: 2 }));
  assert.ok(sameBytes(sink.bytes(), FILE));
  assert.deepEqual(result.droppedSources, []);
  const a = world.origin('A');
  assert.equal(a.requests, CHUNKS_TOTAL + 1, '恰好多一次重试');
  const hung = a.log.find((e) => e.requestNo === 2);
  assert.ok(hung && hung.cancelled, '挂住的请求被 abort');
  assert.equal(a.log.filter((e) => e.start === hung.start).length, 2, '同一分片由 A 自己重试');

  const dead = createFakeWorld(FILE, [{ id: 'A', delayMs: 1, stream: () => ({ hangAt: 1 }) }]);
  const sink2 = recordingSink(createMemorySink(FILE.length));
  await assert.rejects(
    downloadChunked(baseJob(dead, { sink: sink2, stallMs: 50, maxSourceFailures: 2 })),
    { message: 'all sources failed' },
  );
  const d = dead.origin('A');
  assert.ok(d.requests >= 2 && d.requests <= 3, `requests ${d.requests}`);
  assert.ok(d.log.length >= 2 && d.log.every((e) => e.cancelled), '每次卡住的请求都被 abort');
  assert.equal(sink2.log.abortCalls, 1);
  assert.equal(sink2.log.writes, 0);
  assert.equal(sink2.inner.closed, false);
});

test('18. 外层 signal 中止：正在流式读取的请求立刻中止，AbortError、sink.abort 被调、不再发 fetch', async () => {
  const world = createFakeWorld(FILE, [{ id: 'A', delayMs: 1, stream: () => ({ hangAt: 1 }) }]);
  const sink = recordingSink(createMemorySink(FILE.length));
  const ac = new AbortController();
  const job = downloadChunked(baseJob(world, { sink, signal: ac.signal, firstByteMs: 5000, stallMs: 5000 }));
  await sleep(30, undefined);
  const inflight = world.origin('A').log.slice();
  assert.equal(inflight.length, 2, 'perSourceConcurrency=2 → 两个请求在飞');
  assert.ok(inflight.every((e) => e.streamed && !e.cancelled && e.signal?.aborted === false), '中止前流都还挂着');

  ac.abort();
  assert.ok(inflight.every((e) => e.cancelled && e.signal?.aborted === true), 'abort() 返回时在飞请求已同步被 abort');
  await assert.rejects(job, (err) => err.name === 'AbortError');
  assert.equal(sink.log.abortCalls, 1);
  assert.equal(sink.inner.aborted, true);
  assert.equal(sink.log.writes, 0);
  await sleep(20, undefined);
  assert.equal(world.stats.totalRequests, 2, '中止后不得再发 fetch');
});

test('19. firstByteMs / stallMs 参数校验', async () => {
  const world = createFakeWorld(FILE, [{ id: 'A' }]);
  const sink = createMemorySink(FILE.length);
  await assert.rejects(downloadChunked(baseJob(world, { sink, stallMs: 0 })), TypeError);
  await assert.rejects(downloadChunked(baseJob(world, { sink, firstByteMs: 1.5 })), TypeError);
  assert.equal(world.stats.totalRequests, 0);
});

test('20. bytesPerSecond 滑窗吃到分片内的字节段（假时钟：窗口只剩后两段）', async () => {
  const small = randomFillSync(new Uint8Array(256 * KiB));
  let clock = 1000;
  const perf = /** @type {any} */ (globalThis.performance);
  perf.now = () => clock;
  try {
    const world = createFakeWorld(small, [
      { id: 'A', stream: () => ({ pieces: 4, onPiece: (i) => { if (i > 0) clock += 2000; } }) },
    ]);
    const sink = createMemorySink(small.length);
    /** @type {import('../.vitepress/theme/chunked-download.mjs').ChunkProgress[]} */
    const progress = [];
    await downloadChunked(baseJob(world, {
      sink,
      size: small.length,
      chunkBytes: small.length,
      firstByteMs: 60_000,
      stallMs: 60_000,
      onProgress: (p) => progress.push(p),
    }));
    assert.ok(sameBytes(sink.bytes(), small));
    assert.equal(progress.length, 1);
    // 四段分别在 t=1000/3000/5000/7000 收到；快照在 t=7000，3 秒窗 [4000,7000] 只含后两段 128KiB
    const expected = (128 * KiB * 1000) / 3000;
    assert.ok(
      Math.abs(progress[0].bytesPerSecond - expected) < 1,
      `bytesPerSecond ${progress[0].bytesPerSecond} != ${expected}（按整片记样本会得到 ${(256 * KiB * 1000) / 3000}）`,
    );
    assert.equal(progress[0].bytesDone, small.length);
  } finally {
    delete perf.now;
  }
  assert.equal(Object.hasOwn(performance, 'now'), false, '假时钟已摘掉，回到原型上的真 performance.now');
});

// ---------------------------------------------------------------------------
// SHA-256 校验
// ---------------------------------------------------------------------------

const SHA_EMPTY = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const SHA_ABC = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';

test('21. sha256Hex 已知向量；verifySink 对内存 sink 判 ok / 不 ok，大小写不敏感', async () => {
  assert.equal(await sha256Hex(new Uint8Array(0)), SHA_EMPTY);
  assert.equal(await sha256Hex(new ArrayBuffer(0)), SHA_EMPTY);
  assert.equal(await sha256Hex(new Blob([])), SHA_EMPTY);
  assert.equal(await sha256Hex(new TextEncoder().encode('abc')), SHA_ABC);
  assert.equal(await sha256Hex(new Blob(['abc'])), SHA_ABC);
  assert.equal(await sha256Hex(new TextEncoder().encode('xabcx').subarray(1, 4)), SHA_ABC, '带 byteOffset 的视图');
  await assert.rejects(sha256Hex(/** @type {any} */ ('abc')), TypeError);

  const sink = createMemorySink(3);
  await sink.write(0, new TextEncoder().encode('abc'));
  await sink.close();
  assert.deepEqual(await verifySink(sink, SHA_ABC), { ok: true, actual: SHA_ABC });
  assert.deepEqual(await verifySink(sink, ` ${SHA_ABC.toUpperCase()} `), { ok: true, actual: SHA_ABC });
  assert.deepEqual(await verifySink(sink, SHA_EMPTY), { ok: false, actual: SHA_ABC });
  await assert.rejects(verifySink(sink, /** @type {any} */ (undefined)), TypeError);
  await assert.rejects(verifySink({ write: async () => {}, close: async () => {} }, SHA_ABC), TypeError);

  // 整个下载结果与 node:crypto 交叉验证
  const world = createFakeWorld(FILE, [{ id: 'A', delayMs: 1 }, { id: 'B', delayMs: 1 }]);
  const full = createMemorySink(FILE.length);
  await downloadChunked(baseJob(world, { sink: full }));
  const expected = createHash('sha256').update(FILE).digest('hex');
  assert.deepEqual(await verifySink(full, expected), { ok: true, actual: expected });
  assert.equal((await verifySink(full, SHA_EMPTY)).ok, false);
});

test('22. 文件系统 sink：file() 只在 close 后可用，verifySink 走 file() 校验整个下载', async () => {
  /** @type {{ position: number, data: Uint8Array }[]} */
  const writes = [];
  let size = 0;
  const fakeHandle = {
    async createWritable() {
      return {
        /** @param {number} n */
        async truncate(n) { size = n; },
        /** @param {{ type: string, position: number, data: Uint8Array }} chunk */
        async write(chunk) { writes.push({ position: chunk.position, data: chunk.data.slice() }); },
        async close() {},
        async abort() {},
      };
    },
    async getFile() {
      const buf = new Uint8Array(size);
      for (const w of writes) buf.set(w.data, w.position);
      return new File([buf], 'fushi-setup.exe');
    },
  };
  const g = /** @type {any} */ (globalThis);
  g.showSaveFilePicker = async () => fakeHandle;
  try {
    const sink = await createBrowserSink({ filename: 'fushi-setup.exe', size: FILE.length });
    assert.equal(sink.kind, 'filesystem');
    assert.equal(typeof sink.file, 'function');
    await assert.rejects(/** @type {any} */ (sink).file(), /after close/);

    const world = createFakeWorld(FILE, [{ id: 'A', delayMs: 1 }, { id: 'B', delayMs: 1 }]);
    await downloadChunked(baseJob(world, { sink }));
    const file = await /** @type {any} */ (sink).file();
    assert.ok(file instanceof File);
    assert.equal(file.size, FILE.length);
    assert.equal(writes.length, CHUNKS_TOTAL);

    const expected = createHash('sha256').update(FILE).digest('hex');
    assert.deepEqual(await verifySink(sink, expected), { ok: true, actual: expected });
    const flipped = (expected[0] === '0' ? '1' : '0') + expected.slice(1);
    assert.deepEqual(await verifySink(sink, flipped), { ok: false, actual: expected });

    // abort 过的 sink 拿不到文件
    const aborted = await createBrowserSink({ filename: 'x.bin', size: 4 });
    await aborted.abort?.();
    await assert.rejects(/** @type {any} */ (aborted).file(), /after close/);
  } finally {
    delete g.showSaveFilePicker;
  }
});
