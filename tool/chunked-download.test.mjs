// node --test chunked-download.test.mjs
// 全部用假 fetch，不联网。假来源实现真实 Range 语义并可注入各种故障。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomFillSync } from 'node:crypto';

import {
  DEFAULT_CHUNK_BYTES,
  probeSources,
  downloadChunked,
  createBrowserSink,
  createMemorySink,
  parseContentRange,
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
 * @typedef {{ id: string, delayMs?: number, ignoresSignal?: boolean, behavior?: (req: RequestInfo) => Mode }} OriginSpec
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
 * @param {Uint8Array} file
 * @param {{ start: number, end: number }} range
 * @param {Mode} mode
 * @returns {Response}
 */
function buildResponse(file, range, mode) {
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
  return new Response(body, {
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
    ...spec,
    url: `https://fushi.moe/releases/${spec.id}/fushi-setup.exe`,
    requests: 0,
    served: 0,
    /** @type {{ start: number, mode: Mode }[]} */
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
      const mode = origin.behavior({ ...range, requestNo });
      const res = buildResponse(file, range, mode);
      origin.log.push({ start: range.start, mode });
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
