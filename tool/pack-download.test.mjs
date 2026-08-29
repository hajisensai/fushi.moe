// node --test pack-download.test.mjs
// 推荐包编排层的单测：清单校验、分片来源选择、逐片下载与逐片 sha256。
// 不联网：downloadChunked 被替换成一个按分片名吐字节的假实现。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomFillSync } from 'node:crypto';

import {
  PACK_FILENAME,
  PACK_MANIFEST_PATH,
  downloadPack,
  fetchPackManifest,
  packPartUrl,
  preferredPartBaseUrl,
  validatePackManifest,
} from '../.vitepress/theme/pack-download.mjs';
import { createMemorySink } from '../.vitepress/theme/chunked-download.mjs';

const ORIGIN = 'https://fushi.moe';
const GH_BASE = 'https://github.com/hajisensai/fushi-pack/releases/download/pack-2026-08-14';
const CF_BASE = `${ORIGIN}/pack/pack-2026-08-14`;

/** @param {Uint8Array} bytes */
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * 造一份 n 片的合法清单 + 每片的真实字节。
 * @param {number[]} lengths
 */
function makeFixture(lengths) {
  let offset = 0;
  const parts = [];
  const bodies = new Map();
  const whole = new Uint8Array(lengths.reduce((a, b) => a + b, 0));
  for (let i = 0; i < lengths.length; i += 1) {
    const body = randomFillSync(new Uint8Array(lengths[i]));
    whole.set(body, offset);
    const name = `fushi-recommended.fushi.zip.${String(i).padStart(3, '0')}`;
    bodies.set(name, body);
    parts.push({ name, offset, length: lengths[i], sha256: sha256(body) });
    offset += lengths[i];
  }
  const raw = {
    version: 'pack-2026-08-14',
    url: 'https://drive.usercontent.google.com/download?id=x&export=download&confirm=t',
    sha256: sha256(whole),
    size_bytes: whole.length,
    part_size_bytes: lengths[0],
    part_base_urls: [GH_BASE, CF_BASE],
    parts,
  };
  return { raw, bodies, whole };
}

/**
 * 假 downloadChunked：按 URL 末段取出对应分片字节，一次性写进 sink 并 close。
 * @param {Map<string, Uint8Array>} bodies
 * @param {{ failOn?: string, corrupt?: string, calls?: object[] }} [opts]
 */
function fakeDownloadChunked(bodies, opts = {}) {
  return async (job) => {
    opts.calls?.push({ url: job.sources[0].url, size: job.size, conc: job.perSourceConcurrency });
    const name = decodeURIComponent(job.sources[0].url.split('/').pop());
    if (opts.failOn === name) {
      await job.sink.abort?.();
      throw new Error('all sources failed');
    }
    const body = bodies.get(name);
    assert.ok(body, `fake source has no part named ${name}`);
    const payload = opts.corrupt === name ? body.slice().fill(0, 0, 1) : body;
    job.onProgress?.({ bytesDone: payload.length, bytesTotal: payload.length, bytesPerSecond: 1, perSource: {}, activeSources: [], chunksDone: 1, chunksTotal: 1 });
    await job.sink.write(0, payload);
    await job.sink.close();
    return { bytes: payload.length, perSource: {}, droppedSources: [] };
  };
}

// ---------------------------------------------------------------------------
// 清单校验
// ---------------------------------------------------------------------------

test('接受真实形状的清单并归一化', () => {
  const { raw } = makeFixture([64, 64, 17]);
  const m = validatePackManifest(raw);
  assert.equal(m.version, 'pack-2026-08-14');
  assert.equal(m.sizeBytes, 145);
  assert.equal(m.parts.length, 3);
  assert.equal(m.parts[2].offset, 128);
  assert.deepEqual(m.partBaseUrls, [GH_BASE, CF_BASE]);
  assert.equal(m.wholeUrl?.startsWith('https://drive.'), true);
});

test('分片之间有空洞或重叠时拒绝', () => {
  const { raw } = makeFixture([64, 64]);
  raw.parts[1].offset = 65; // 与前一片之间空出 1 字节
  assert.throws(() => validatePackManifest(raw), /gap or overlap/);
});

test('分片总长与 size_bytes 对不上时拒绝', () => {
  const { raw } = makeFixture([64, 64]);
  raw.size_bytes = 129;
  assert.throws(() => validatePackManifest(raw), /parts cover 128 bytes/);
});

test('sha256 不是 64 位 hex 时拒绝', () => {
  const { raw } = makeFixture([64]);
  raw.parts[0].sha256 = 'nope';
  assert.throws(() => validatePackManifest(raw), /sha256/);
});

test('分片名不允许带路径分隔符', () => {
  const { raw } = makeFixture([64]);
  raw.parts[0].name = '../etc/passwd';
  assert.throws(() => validatePackManifest(raw), /bare file name/);
});

test('没有 part_base_urls 时拒绝', () => {
  const { raw } = makeFixture([64]);
  raw.part_base_urls = [];
  assert.throws(() => validatePackManifest(raw), /part_base_urls/);
});

// ---------------------------------------------------------------------------
// 来源选择
// ---------------------------------------------------------------------------

test('优先选同源的 base，而不是清单里排在前面的 GitHub 直链', () => {
  const { raw } = makeFixture([64]);
  const m = validatePackManifest(raw);
  assert.equal(preferredPartBaseUrl(m, ORIGIN), CF_BASE);
});

test('清单里没有同源 base 时退回第一个', () => {
  const { raw } = makeFixture([64]);
  raw.part_base_urls = [GH_BASE];
  const m = validatePackManifest(raw);
  assert.equal(preferredPartBaseUrl(m, ORIGIN), GH_BASE);
});

test('分片 URL 拼接会转义文件名且不重复斜杠', () => {
  const part = { name: 'a b.zip.000', offset: 0, length: 1, sha256: '0'.repeat(64) };
  assert.equal(packPartUrl(CF_BASE + '/', part), `${CF_BASE}/a%20b.zip.000`);
});

// ---------------------------------------------------------------------------
// 下载编排
// ---------------------------------------------------------------------------

test('逐片下载后拼出与整包逐字节一致的文件', async () => {
  const { raw, bodies, whole } = makeFixture([64, 64, 17]);
  const m = validatePackManifest(raw);
  const sink = createMemorySink(m.sizeBytes);
  const calls = [];
  const progress = [];

  const out = await downloadPack({
    manifest: m,
    sink,
    baseUrl: CF_BASE,
    onProgress: (p) => progress.push(p),
    deps: { downloadChunked: fakeDownloadChunked(bodies, { calls }), sha256Hex: async (b) => sha256(b) },
  });

  assert.equal(out.parts, 3);
  assert.equal(out.bytes, whole.length);
  assert.deepEqual(sink.bytes(), whole);
  assert.equal(sink.closed, true);
  assert.equal(calls.length, 3);
  assert.equal(calls[0].url, `${CF_BASE}/fushi-recommended.fushi.zip.000`);
  assert.equal(calls[0].conc, 4);
  // 进度是全局字节数，不是分片内的局部值。
  assert.equal(progress.at(-1).bytesDone, whole.length);
  assert.equal(progress.at(-1).partsDone, 3);
  assert.equal(progress.at(-1).bytesTotal, whole.length);
});

test('某片 sha256 对不上时整体失败，且坏字节一个都不落盘', async () => {
  const { raw, bodies } = makeFixture([64, 64]);
  const m = validatePackManifest(raw);
  const sink = createMemorySink(m.sizeBytes);
  const bad = m.parts[1].name;

  await assert.rejects(
    downloadPack({
      manifest: m,
      sink,
      baseUrl: CF_BASE,
      deps: { downloadChunked: fakeDownloadChunked(bodies, { corrupt: bad }), sha256Hex: async (b) => sha256(b) },
    }),
    /SHA-256 不匹配/,
  );
  // 第一片已经写进去了（它是好的），坏的第二片没有：后半段仍是全零。
  assert.deepEqual(sink.bytes().slice(64), new Uint8Array(64));
  assert.equal(sink.aborted, true);
  assert.equal(sink.closed, false);
});

test('分片下载失败时 abort sink，不留半个文件', async () => {
  const { raw, bodies } = makeFixture([64, 64]);
  const m = validatePackManifest(raw);
  const sink = createMemorySink(m.sizeBytes);

  await assert.rejects(
    downloadPack({
      manifest: m,
      sink,
      baseUrl: CF_BASE,
      deps: { downloadChunked: fakeDownloadChunked(bodies, { failOn: m.parts[0].name }), sha256Hex: async (b) => sha256(b) },
    }),
    /all sources failed/,
  );
  assert.equal(sink.aborted, true);
});

test('已中止的 signal 会在第一片之前就退出', async () => {
  const { raw, bodies } = makeFixture([64, 64]);
  const m = validatePackManifest(raw);
  const sink = createMemorySink(m.sizeBytes);
  const ctrl = new AbortController();
  ctrl.abort(new Error('用户取消'));
  const calls = [];

  await assert.rejects(
    downloadPack({
      manifest: m,
      sink,
      baseUrl: CF_BASE,
      signal: ctrl.signal,
      deps: { downloadChunked: fakeDownloadChunked(bodies, { calls }), sha256Hex: async (b) => sha256(b) },
    }),
    /用户取消/,
  );
  assert.equal(calls.length, 0);
  assert.equal(sink.aborted, true);
});

// ---------------------------------------------------------------------------
// 清单拉取
// ---------------------------------------------------------------------------

test('fetchPackManifest 走给定 URL 并做校验', async () => {
  const { raw } = makeFixture([64]);
  const seen = [];
  const m = await fetchPackManifest({
    url: PACK_MANIFEST_PATH,
    fetch: async (url, init) => {
      seen.push({ url, cache: init?.cache });
      return { ok: true, status: 200, json: async () => raw };
    },
  });
  assert.equal(m.parts.length, 1);
  assert.equal(seen[0].url, '/pack/manifest.json');
  // 滚动清单必须绕开 HTTP 缓存，否则换包后老用户会拿到旧分片表。
  assert.equal(seen[0].cache, 'no-store');
});

test('清单 HTTP 失败时抛错而不是静默拿空清单', async () => {
  await assert.rejects(
    fetchPackManifest({ fetch: async () => ({ ok: false, status: 502, json: async () => ({}) }) }),
    /HTTP 502/,
  );
});

test('对外文件名是 app 备份导入认的扩展名', () => {
  assert.equal(PACK_FILENAME.endsWith('.fushi.zip'), true);
});
