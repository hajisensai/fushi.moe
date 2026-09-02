import { describe, expect, it } from 'vitest';
import { handleStars } from '../src/stars';
import { settings } from './fakes';

/** 记录 url + headers 的假 fetch：断言「回源了几次」「打的是哪个仓库」都要看到实际请求。 */
function capturing(reply: () => Response) {
  const seen: { url: string; headers: Record<string, string> }[] = [];
  const fn = (async function (this: unknown, input: Request | string, init?: RequestInit) {
    // Workers 的全局 fetch 要求 this 是全局对象。写成 deps.fetcher(...) 的成员调用
    // 会让 this 变成 deps，生产里直接抛 Illegal invocation（/pack 与 ?src=gh 的旧病）。
    if (this !== undefined && this !== globalThis) {
      throw new TypeError('Illegal invocation: function called with incorrect `this` reference.');
    }
    const url = typeof input === 'string' ? input : input.url;
    const headers: Record<string, string> = {};
    new Headers(init?.headers).forEach((v, k) => {
      headers[k] = v;
    });
    seen.push({ url, headers });
    return reply();
  }) as typeof fetch;
  return { fn, seen };
}

function repoJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function memoryCache(): Cache & { drop: (prefix: string) => void; keys: () => string[] } {
  const store = new Map<string, Response>();
  const cache = {
    async match(request: Request) {
      return store.get(request.url)?.clone();
    },
    async put(request: Request, response: Response) {
      store.set(request.url, response.clone());
    },
    /** 模拟条目按 max-age 到期被边缘清掉。 */
    drop(prefix: string) {
      for (const k of [...store.keys()]) if (k.startsWith(prefix)) store.delete(k);
    },
    keys() {
      return [...store.keys()];
    },
  };
  return cache as unknown as Cache & { drop: (p: string) => void; keys: () => string[] };
}

const FRESH = 'https://stars.fushi.invalid/fresh/';
const STALE = 'https://stars.fushi.invalid/stale/';

function deps(fetcher: typeof fetch, cache?: Cache) {
  return { settings: settings({ ghRepo: 'owner/repo' }), fetcher, cache };
}

describe('handleStars', () => {
  it('返回 stargazers_count，并向 api.github.com 打配置里的仓库', async () => {
    const { fn, seen } = capturing(() => repoJson({ stargazers_count: 1234, forks_count: 7 }));

    const res = await handleStars(deps(fn));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ repo: 'owner/repo', stars: 1234 });
    expect(seen).toHaveLength(1);
    expect(seen[0]!.url).toBe('https://api.github.com/repos/owner/repo');
    expect(seen[0]!.headers['user-agent']).toBe('fushi-moe-edge');
  });

  it('浏览器要能跨源读到它：带 ACAO 与可缓存的 cache-control', async () => {
    const { fn } = capturing(() => repoJson({ stargazers_count: 10 }));
    const res = await handleStars(deps(fn));
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('cache-control')).toBe('public, max-age=900');
  });

  it('第二次读边缘缓存，不再回源——所有访客共用一个出口 IP，回源必须收敛', async () => {
    const { fn, seen } = capturing(() => repoJson({ stargazers_count: 42 }));
    const cache = memoryCache();

    const first = await handleStars(deps(fn, cache));
    const second = await handleStars(deps(fn, cache));

    expect(await first.json()).toEqual({ repo: 'owner/repo', stars: 42 });
    expect(await second.json()).toEqual({ repo: 'owner/repo', stars: 42 });
    expect(seen).toHaveLength(1);
  });

  it('换个仓库就是另一个缓存条目', async () => {
    const { fn, seen } = capturing(() => repoJson({ stargazers_count: 5 }));
    const cache = memoryCache();

    await handleStars({ settings: settings({ ghRepo: 'a/one' }), fetcher: fn, cache });
    await handleStars({ settings: settings({ ghRepo: 'b/two' }), fetcher: fn, cache });

    expect(seen.map((s) => s.url)).toEqual([
      'https://api.github.com/repos/a/one',
      'https://api.github.com/repos/b/two',
    ]);
  });

  it('上游 5xx / 限流：503 + no-store，绝不返回 0', async () => {
    const { fn } = capturing(() => repoJson({ message: 'rate limit exceeded' }, 403));
    const res = await handleStars(deps(fn));
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toMatchObject({ error: 'stars unavailable' });
  });

  it('上游没有 stargazers_count：判不可用，而不是把 undefined 当 0 发出去', async () => {
    const { fn } = capturing(() => repoJson({ full_name: 'owner/repo' }));
    const res = await handleStars(deps(fn));
    expect(res.status).toBe(503);
  });

  it('上游返回的不是 JSON：判不可用', async () => {
    const { fn } = capturing(() => new Response('<html>502</html>', { status: 200 }));
    const res = await handleStars(deps(fn));
    expect(res.status).toBe(503);
  });

  it('fetch 抛异常（超时/网络）：503，不冒泡成 Worker 500', async () => {
    const fn = (async () => {
      throw new TypeError('network error');
    }) as unknown as typeof fetch;
    const res = await handleStars(deps(fn));
    expect(res.status).toBe(503);
  });

  it('失败结果不进缓存，也不写陈旧副本：下次仍要真回源', async () => {
    let ok = false;
    const cache = memoryCache();
    const { fn, seen } = capturing(() =>
      ok ? repoJson({ stargazers_count: 9 }) : repoJson({ message: 'boom' }, 500),
    );

    const first = await handleStars(deps(fn, cache));
    expect(first.status).toBe(503);
    ok = true;
    const second = await handleStars(deps(fn, cache));

    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ repo: 'owner/repo', stars: 9 });
    expect(seen).toHaveLength(2);
  });

  it('成功时同时写新鲜副本与陈旧副本', async () => {
    const { fn } = capturing(() => repoJson({ stargazers_count: 77 }));
    const cache = memoryCache();
    await handleStars(deps(fn, cache));
    expect(cache.keys().some((k) => k.startsWith(FRESH))).toBe(true);
    expect(cache.keys().some((k) => k.startsWith(STALE))).toBe(true);
  });

  /*
   * 这是这个端点最要紧的一条。Worker 的出口是 Cloudflare 共享 IP，
   * api.github.com 的未认证限流按 IP 算，403 是随机撞上的、跟我们打了多少次无关。
   * 没有陈旧兜底的话，撞上的那批访客就看不到数字——上线当天第一次请求就撞到了一发。
   */
  it('新鲜期过后回源失败：返回上一次的真值，而不是 503', async () => {
    let ok = true;
    const cache = memoryCache();
    const { fn } = capturing(() =>
      ok ? repoJson({ stargazers_count: 185 }) : repoJson({ message: 'rate limited' }, 403),
    );

    await handleStars(deps(fn, cache));
    cache.drop(FRESH); // 15 分钟到了
    ok = false;
    const res = await handleStars(deps(fn, cache));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ repo: 'owner/repo', stars: 185 });
    expect(res.headers.get('x-fushi-stars')).toBe('stale');
  });

  it('陈旧兜底只锁 60 秒，好让下一批请求尽快再试回源', async () => {
    let ok = true;
    const cache = memoryCache();
    const { fn } = capturing(() =>
      ok ? repoJson({ stargazers_count: 185 }) : repoJson({ message: 'boom' }, 500),
    );
    await handleStars(deps(fn, cache));
    cache.drop(FRESH);
    ok = false;
    const res = await handleStars(deps(fn, cache));
    expect(res.headers.get('cache-control')).toBe('public, max-age=60');
  });

  it('一次都没成功过时不编数字：仍然 503', async () => {
    const cache = memoryCache();
    const { fn } = capturing(() => repoJson({ message: 'rate limited' }, 403));
    const res = await handleStars(deps(fn, cache));
    expect(res.status).toBe(503);
    expect(res.headers.get('x-fushi-stars')).toBe(null);
  });

  /*
   * 回源超时必须用自己的预算：settings.timeoutMs 是「回源自家 Pages」的 3s，
   * 对跨洲的 api.github.com 偏紧，冷启动一次 TLS 握手就可能吃掉它。
   */
  it('不复用 settings.timeoutMs：慢一点的上游照样拿得到', async () => {
    const slow = (async function (this: unknown, _i: Request | string, init?: RequestInit) {
      await new Promise((r) => setTimeout(r, 60));
      if (init?.signal?.aborted) throw new DOMException('aborted', 'AbortError');
      return repoJson({ stargazers_count: 3 });
    }) as unknown as typeof fetch;

    const res = await handleStars({
      settings: settings({ ghRepo: 'owner/repo', timeoutMs: 5 }),
      fetcher: slow,
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ repo: 'owner/repo', stars: 3 });
  });
});
