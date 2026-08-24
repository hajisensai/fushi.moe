import { CacheHealthStore } from './breaker';
import { settingsFrom, type Env } from './config';
import { handleDownload } from './downloads';
import { handleHealth } from './health';
import { handleSite } from './site';

/**
 * 兜底代理：不走熔断、不走权重、不读缓存，直接把请求扔给 GitHub 侧。
 *
 * Worker 本身是这条链路上唯一的新增单点。任何未预料的异常都必须落到这里，
 * 而不是变成 500——一个边缘脚本的 bug 不该让整个站点消失。
 */
async function failOpen(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  url.hostname = env.ORIGIN_GH_HOST || 'www.fushi.moe';
  url.protocol = 'https:';
  url.port = '';
  try {
    const res = await fetch(
      new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'manual',
      }),
    );
    const headers = new Headers(res.headers);
    headers.set('x-fushi-origin', 'gh');
    headers.set('x-fushi-failopen', '1');
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  } catch {
    return new Response('upstream unavailable', {
      status: 503,
      headers: { 'cache-control': 'no-store', 'x-fushi-origin': 'none' },
    });
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const settings = settingsFrom(env);
      const url = new URL(request.url);
      const health = new CacheHealthStore(caches.default);
      const waitUntil = (p: Promise<unknown>): void => ctx.waitUntil(p.catch(() => {}));

      if (url.pathname === '/__health') {
        return await handleHealth({
          settings,
          health,
          fetcher: fetch,
          hasMirror: env.MIRROR !== undefined,
        });
      }

      if (url.hostname === settings.downloadHost) {
        return await handleDownload(request, {
          settings,
          health,
          fetcher: fetch,
          mirror: env.MIRROR,
          manifestCache: caches.default,
          waitUntil,
        });
      }

      return await handleSite(request, {
        settings,
        health,
        fetcher: fetch,
        rand: Math.random,
        staleCache: caches.default,
        waitUntil,
      });
    } catch {
      return failOpen(request, env);
    }
  },
};
