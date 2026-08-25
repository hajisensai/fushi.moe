import { describe, expect, it } from 'vitest';
import { handlePack } from '../src/pack';
import { settings } from './fakes';

/** 捕获 url + init 的假 fetch：Range 透传这类断言必须看到实际发出的请求头。 */
function capturing(reply: () => Response) {
  const seen: {
    url: string;
    headers: Record<string, string>;
    method: string;
  }[] = [];
  const fn = (async (input: Request | string, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.url;
    const headers: Record<string, string> = {};
    new Headers(init?.headers).forEach((v, k) => {
      headers[k] = v;
    });
    seen.push({
      url,
      headers,
      method: init?.method ?? 'GET',
    });
    return reply();
  }) as typeof fetch;
  return { fn, seen };
}

function ok(body = 'x', status = 200, headers: Record<string, string> = {}): Response {
  return new Response(body, { status, headers });
}

function deps(fetcher: typeof fetch, cache?: Cache) {
  return { settings: settings({ packRepo: 'owner/pack' }), fetcher, cache };
}

function req(path: string, init?: RequestInit): Request {
  return new Request('https://fushi.moe' + path, init);
}

/** 模拟 Workers 全局 fetch：this 不是 undefined/globalThis 就抛 Illegal invocation。 */
function strictThisFetch(reply: () => Response): typeof fetch {
  return async function (this: unknown, _input: Request | string, _init?: RequestInit) {
    if (this !== undefined && this !== globalThis) {
      throw new TypeError('Illegal invocation: function called with incorrect `this` reference.');
    }
    return reply();
  } as typeof fetch;
}

describe('proxyGithubCached 调用 fetch 的方式', () => {
  it('以 Workers 的严格 this 语义调用也能回源，而不是落到 302 兜底', async () => {
    const res = await handlePack(
      req('/manifest.json'),
      deps(strictThisFetch(() => ok('{"ok":1}', 200, { 'content-type': 'application/json' }))),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('x-fushi-pack-origin')).toBe('github-workers-cache');
    expect(await res.text()).toBe('{"ok":1}');
  });
});

describe('handlePack', () => {
  it('manifest.json 走 GitHub 的 latest/download 稳定端点，不碰 API', async () => {
    const { fn, seen } = capturing(() => ok('{}'));
    await handlePack(req('/manifest.json'), deps(fn));
    expect(seen).toHaveLength(1);
    expect(seen[0]!.url).toBe(
      'https://github.com/owner/pack/releases/latest/download/manifest.json',
    );
    // 不该出现任何 api.github.com 调用：少一个 API 就少一份限流与熔断负担。
    expect(seen.some((s) => s.url.includes('api.github.com'))).toBe(false);
  });

  it('滚动的 manifest 绝不能 immutable，带 tag 的切片才可以', async () => {
    // 这是本模块最要命的一条：滚动 URL 配长缓存会让同一次下载拿到新旧混合的分片，
    // 逐片 sha256 会红、9.5 GB 白下。切片路径带 tag 正是为了让长缓存变安全。
    const a = capturing(() => ok('{}'));
    const m = await handlePack(req('/manifest.json'), deps(a.fn));
    expect(m.headers.get('cache-control')).toContain('must-revalidate');
    expect(m.headers.get('cache-control')).not.toContain('immutable');

    const b = capturing(() => ok('bytes'));
    const s = await handlePack(req('/pack-2026-08-14/demo.zip.000'), deps(b.fn));
    expect(s.headers.get('cache-control')).toContain('immutable');
    expect(b.seen[0]!.url).toBe(
      'https://github.com/owner/pack/releases/download/pack-2026-08-14/demo.zip.000',
    );
  });

  it('普通 GET 写入 caches.default，第二次不再回源 GitHub', async () => {
    const { fn, seen } = capturing(() => ok('cached-bytes'));
    let stored: Response | undefined;
    const cache = {
      async match() {
        return stored?.clone();
      },
      async put(_request: Request, response: Response) {
        stored = response.clone();
      },
    } as unknown as Cache;

    const first = await handlePack(req('/v1/x.000'), deps(fn, cache));
    const second = await handlePack(req('/v1/x.000'), deps(fn, cache));
    expect(await first.text()).toBe('cached-bytes');
    expect(await second.text()).toBe('cached-bytes');
    expect(seen).toHaveLength(1);
  });

  it('Range 与 If-Range 原样透传', async () => {
    // 吞掉 Range 会让分片下载器退化成整片重下——一片 256 MiB。
    const { fn, seen } = capturing(() =>
      ok('part', 206, { 'content-range': 'bytes 0-3/1000' }),
    );
    const res = await handlePack(
      req('/v1/x.000', { headers: { range: 'bytes=0-3', 'if-range': '"etag-1"' } }),
      deps(fn),
    );
    expect(seen[0]!.headers['range']).toBe('bytes=0-3');
    expect(seen[0]!.headers['if-range']).toBe('"etag-1"');
    expect(res.status).toBe(206);
    expect(res.headers.get('content-range')).toBe('bytes 0-3/1000');
  });

  it('HEAD 不被改写成 GET', async () => {
    const { fn, seen } = capturing(() => ok(''));
    await handlePack(req('/v1/x.000', { method: 'HEAD' }), deps(fn));
    expect(seen[0]!.method).toBe('HEAD');
  });

  it('路径段只收安全字符，挡掉穿越与跨仓库改写', async () => {
    const { fn, seen } = capturing(() => ok('x'));
    for (const bad of ['/../secret', '/v1/..', '/a/b/c', '/']) {
      const res = await handlePack(req(bad), deps(fn));
      expect(res.status, bad).toBe(404);
    }
    expect(seen, '任何一次都不该真的打到上游').toHaveLength(0);
  });

  it('上游 5xx 时 302 到同一个 GitHub 公开资产，不把错误缓存', async () => {
    const { fn } = capturing(() => ok('boom', 503));
    const res = await handlePack(req('/v1/x.000'), deps(fn));
    expect(res.status).toBe(302);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('location')).toContain('github.com/owner/pack/releases/download/');
  });

  it('上游不可达时同样 302 到 GitHub，让客户端直连', async () => {
    const fn = (async () => {
      throw new TypeError('network down');
    }) as typeof fetch;
    const res = await handlePack(req('/v1/x.000'), deps(fn));
    expect(res.status).toBe(302);
    expect(res.headers.get('x-fushi-pack-origin')).toBe('github-direct-fallback');
  });
});
