import { describe, expect, it } from 'vitest';
import { handleDownload, manifestUrlFor } from '../src/downloads';
import { parseChannel, resolveSlot, manifestFromPublished, normalizeSha256 } from '../src/manifest';
import { fakeR2, settings, store } from './fakes';

/*
 * 发布通道 × 显式来源（?src=）。
 *
 * 分片下载器在浏览器里只能 fetch 同域：GitHub 直链没有 CORS，所以 `?src=gh` 必须
 * 由 Worker 把字节搬过来（Range 原样透传、206 原样回），绝不能 302；`?src=r2`
 * 未命中必须是 404 而不是 302——下载器靠它判「这个来源没有」。
 */

const STABLE = JSON.stringify({
  schemaVersion: 1,
  version: '1.2.3',
  tag: 'v1.2.3',
  channel: 'formal',
  assets: [
    { name: 'fushi-1.2.3-windows-setup.exe', size: 10, browser_download_url: 'https://github.com/owner/repo/releases/download/v1.2.3/fushi-1.2.3-windows-setup.exe', sha256: 'SHA256:' + 'AB'.repeat(32) },
  ],
});

const DEBUG = JSON.stringify({
  schemaVersion: 1,
  version: '1.3.0-debug.777',
  tag: 'v1.3.0-debug.777+abc1234',
  channel: 'debug',
  assets: [
    { name: 'fushi-1.3.0-debug.777-windows-setup.exe', browser_download_url: 'https://github.com/owner/repo/releases/download/v1.3.0-debug.777%2Babc1234/fushi-1.3.0-debug.777-windows-setup.exe' },
    { name: 'fushi-1.3.0-debug.777-abc1234-debug.apk', browser_download_url: 'https://github.com/owner/repo/releases/download/v1.3.0-debug.777%2Babc1234/fushi-1.3.0-debug.777-abc1234-debug.apk' },
  ],
});

interface Seen {
  url: string;
  headers: Record<string, string>;
}

/** 按 URL 路由的假 fetch，记录发出的请求头（Range 透传要看得见）。 */
function routedFetch(routes: Record<string, (seen: Seen) => Response>) {
  const seen: Seen[] = [];
  const fn = (async (input: Request | string, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.url;
    const headers: Record<string, string> = {};
    new Headers(init?.headers ?? (typeof input === 'string' ? undefined : input.headers)).forEach((v, k) => {
      headers[k] = v;
    });
    const entry = { url, headers };
    seen.push(entry);
    const key = Object.keys(routes).find((k) => url.startsWith(k));
    if (!key) throw new TypeError('no route for ' + url);
    return routes[key]!(entry);
  }) as typeof fetch;
  return { fn, seen };
}

function deps(fetcher: typeof fetch, mirror?: R2Bucket) {
  return { settings: settings(), health: store(), fetcher, mirror };
}

const RAW = 'https://raw.example/';

function manifests(seen?: (s: Seen) => void) {
  return routedFetch({
    [RAW + 'latest-stable-fushi.json']: () => new Response(STABLE),
    [RAW + 'latest-debug-fushi.json']: () => new Response(DEBUG),
    [RAW + 'latest-beta-fushi.json']: () => new Response('nope', { status: 404 }),
    'https://github.com/owner/repo/releases/download/': (s) => {
      seen?.(s);
      const range = s.headers['range'];
      if (range) {
        const m = /bytes=(\d+)-(\d+)/.exec(range)!;
        const start = Number(m[1]);
        const end = Number(m[2]);
        return new Response('x'.repeat(end - start + 1), {
          status: 206,
          headers: {
            'content-range': 'bytes ' + start + '-' + end + '/1000',
            'content-length': String(end - start + 1),
            'accept-ranges': 'bytes',
          },
        });
      }
      return new Response('FULL', { status: 200, headers: { 'content-length': '4' } });
    },
  });
}

describe('manifestUrlFor', () => {
  it('从正式版清单地址按通道派生', () => {
    const s = settings({ ghManifestUrl: 'https://raw.example/latest-stable-fushi.json' });
    expect(manifestUrlFor(s, 'stable')).toBe('https://raw.example/latest-stable-fushi.json');
    expect(manifestUrlFor(s, 'debug')).toBe('https://raw.example/latest-debug-fushi.json');
    expect(manifestUrlFor(s, 'beta')).toBe('https://raw.example/latest-beta-fushi.json');
  });

  it('地址不含 latest-stable- 时退回同目录下的约定文件名', () => {
    const s = settings({ ghManifestUrl: 'https://raw.example/custom.json' });
    expect(manifestUrlFor(s, 'debug')).toBe('https://raw.example/latest-debug-fushi.json');
  });
});

describe('normalizeSha256', () => {
  it('只认 64 位 hex，归一成小写，允许 sha256: 前缀；其它形状一律当没有', () => {
    expect(normalizeSha256('AB'.repeat(32))).toBe('ab'.repeat(32));
    expect(normalizeSha256('sha256:' + 'cd'.repeat(32))).toBe('cd'.repeat(32));
    expect(normalizeSha256('not-a-hash')).toBeUndefined();
    expect(normalizeSha256('ab'.repeat(31))).toBeUndefined();
    expect(normalizeSha256(42)).toBeUndefined();
    expect(normalizeSha256(undefined)).toBeUndefined();
  });
});

describe('parseChannel / slots', () => {
  it('latest 是 stable 的别名，未知值判空而不是当 stable', () => {
    expect(parseChannel(null)).toBe('stable');
    expect(parseChannel('latest')).toBe('stable');
    expect(parseChannel('debug')).toBe('debug');
    expect(parseChannel('nightly')).toBeNull();
  });

  it('调试版通用 APK 落到 android-universal，不会被误认成 arm64', () => {
    const m = manifestFromPublished(JSON.parse(DEBUG))!;
    expect(resolveSlot(m, 'android-universal')?.name).toBe('fushi-1.3.0-debug.777-abc1234-debug.apk');
    expect(resolveSlot(m, 'android-arm64')).toBeNull();
    expect(m.channel).toBe('debug');
    expect(m.version).toBe('1.3.0-debug.777');
  });

  it('静态清单里 channel 写 formal 也归到 stable', () => {
    expect(manifestFromPublished(JSON.parse(STABLE))!.channel).toBe('stable');
  });
});

describe('handleDownload 通道', () => {
  it('/api/latest?channel=debug 读调试清单并带回 channel', async () => {
    const f = manifests();
    const res = await handleDownload(new Request('https://fushi.moe/api/latest?channel=debug'), deps(f.fn));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { channel: string; tag: string; version: string; slots: Record<string, { url: string } | null> };
    expect(body.channel).toBe('debug');
    expect(body.tag).toBe('v1.3.0-debug.777+abc1234');
    expect(body.version).toBe('1.3.0-debug.777');
    expect(body.slots['android-universal']?.url).toBe('https://fushi.moe/releases/debug/android-universal');
    expect(body.slots['android-arm64']).toBeNull();
    expect(f.seen.some((s) => s.url.endsWith('latest-debug-fushi.json'))).toBe(true);
    expect(f.seen.some((s) => s.url.endsWith('latest-stable-fushi.json'))).toBe(false);
  });

  it('不带 channel 仍是正式版，应答也标 channel=stable', async () => {
    const res = await handleDownload(new Request('https://fushi.moe/api/latest'), deps(manifests().fn));
    const body = (await res.json()) as { channel: string; tag: string };
    expect(body.channel).toBe('stable');
    expect(body.tag).toBe('v1.2.3');
  });

  it('清单里的 sha256 透传到槽位（归一小写）；没有的槽位给 null 而不是漏掉字段', async () => {
    const res = await handleDownload(new Request('https://fushi.moe/api/latest'), deps(manifests().fn));
    const body = (await res.json()) as { slots: Record<string, { sha256: string | null } | null> };
    expect(body.slots['windows']?.sha256).toBe('ab'.repeat(32));
    const dbg = await handleDownload(new Request('https://fushi.moe/api/latest?channel=debug'), deps(manifests().fn));
    const dbody = (await dbg.json()) as { slots: Record<string, { sha256: string | null } | null> };
    expect(dbody.slots['windows']).not.toBeNull();
    expect(dbody.slots['windows']?.sha256).toBeNull();
  });

  it('未知通道 404', async () => {
    const res = await handleDownload(new Request('https://fushi.moe/api/latest?channel=nightly'), deps(manifests().fn));
    expect(res.status).toBe(404);
    const res2 = await handleDownload(new Request('https://fushi.moe/nightly/windows'), deps(manifests().fn));
    expect(res2.status).toBe(404);
  });

  it('清单拿不到的通道退回该通道的 Releases 列表，而不是正式版 latest', async () => {
    const res = await handleDownload(new Request('https://fushi.moe/beta/windows'), deps(manifests().fn));
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://github.com/owner/repo/releases');
  });

  it('/debug/<slot> 没镜像时 302 到调试版的 GitHub 直链', async () => {
    const res = await handleDownload(new Request('https://fushi.moe/debug/android-universal'), deps(manifests().fn));
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('fushi-1.3.0-debug.777-abc1234-debug.apk');
  });
});

describe('handleDownload ?src=', () => {
  it('?src=gh 由边缘代理搬字节：Range 透传、206 原样回、带 CORS 头、绝不 302', async () => {
    const f = manifests();
    const res = await handleDownload(
      new Request('https://fushi.moe/v/v1.2.3/fushi-1.2.3-windows-setup.exe?src=gh', {
        headers: { range: 'bytes=100-199' },
      }),
      deps(f.fn),
    );
    expect(res.status).toBe(206);
    expect(res.headers.get('content-range')).toBe('bytes 100-199/1000');
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('x-fushi-mirror')).toBe('github-edge');
    expect(res.headers.get('cache-control')).toContain('immutable');
    const upstream = f.seen.find((s) => s.url.includes('github.com/owner/repo/releases/download/'))!;
    expect(upstream.headers['range']).toBe('bytes=100-199');
    expect((await res.text()).length).toBe(100);
  });

  it('?src=gh 即使镜像里有也不碰 R2——它就是「另一个来源」', async () => {
    const mirror = fakeR2({ 'releases/v1.2.3/fushi-1.2.3-windows-setup.exe': 'MIRRORED' });
    const res = await handleDownload(
      new Request('https://fushi.moe/v/v1.2.3/fushi-1.2.3-windows-setup.exe?src=gh'),
      deps(manifests().fn, mirror),
    );
    expect(res.headers.get('x-fushi-mirror')).toBe('github-edge');
    expect(await res.text()).toBe('FULL');
  });

  it('?src=r2 未命中给 404 JSON，不 302（302 会把分片器带去撞 CORS）', async () => {
    const res = await handleDownload(
      new Request('https://fushi.moe/v/v1.2.3/fushi-1.2.3-windows-setup.exe?src=r2'),
      deps(manifests().fn, fakeR2({})),
    );
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(res.headers.get('location')).toBeNull();
  });

  it('镜像路径：没带 Range 的普通请求回 200 整文件，带 Range 才回 206', async () => {
    const mirror = fakeR2({ 'releases/v1.2.3/fushi-1.2.3-windows-setup.exe': 'ABCDEFGHIJ' });
    const plain = await handleDownload(
      new Request('https://fushi.moe/latest/windows'),
      deps(manifests().fn, mirror),
    );
    expect(plain.status).toBe(200);
    expect(plain.headers.get('content-range')).toBeNull();
    expect(plain.headers.get('content-length')).toBe('10');
    expect(await plain.text()).toBe('ABCDEFGHIJ');
    const ranged = await handleDownload(
      new Request('https://fushi.moe/latest/windows', { headers: { range: 'bytes=2-4' } }),
      deps(manifests().fn, mirror),
    );
    expect(ranged.status).toBe(206);
    expect(ranged.headers.get('content-range')).toBe('bytes 2-4/10');
    expect(await ranged.text()).toBe('CDE');
  });

  it('?src=r2 命中走镜像', async () => {
    const mirror = fakeR2({ 'releases/v1.2.3/fushi-1.2.3-windows-setup.exe': 'MIRRORED' });
    const res = await handleDownload(
      new Request('https://fushi.moe/v/v1.2.3/fushi-1.2.3-windows-setup.exe?src=r2'),
      deps(manifests().fn, mirror),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('x-fushi-mirror')).toBe('r2');
  });

  it('GitHub 上游 5xx 时 ?src=gh 给 502，让分片器换来源', async () => {
    const f = routedFetch({
      [RAW]: () => new Response(STABLE),
      'https://github.com/': () => new Response('boom', { status: 503 }),
    });
    const res = await handleDownload(
      new Request('https://fushi.moe/v/v1.2.3/fushi-1.2.3-windows-setup.exe?src=gh'),
      deps(f.fn),
    );
    expect(res.status).toBe(502);
  });

  it('/v/ 路径在清单挂掉时照样按 tag/文件名拼直链服务（分片器不该因清单失效而全挂）', async () => {
    const f = routedFetch({
      [RAW]: () => new Response('down', { status: 503 }),
      'https://github.com/': () => new Response('FULL', { status: 200 }),
    });
    const res = await handleDownload(
      new Request('https://fushi.moe/v/v9.9.9/anything.exe?src=gh'),
      deps(f.fn),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('FULL');
    const plain = await handleDownload(new Request('https://fushi.moe/v/v9.9.9/anything.exe'), deps(f.fn));
    expect(plain.status).toBe(302);
    expect(plain.headers.get('location')).toBe('https://github.com/owner/repo/releases/download/v9.9.9/anything.exe');
  });
});
