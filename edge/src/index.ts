import { CacheHealthStore } from './breaker';
import { settingsFrom, type Env } from './config';
import { handleDownload } from './downloads';
import { handleHealth } from './health';
import { handleStars } from './stars';
import { handleSite } from './site';
import { handlePack } from './pack';
import { originUrl } from './origins';

/**
 * 兜底代理：不走熔断、不走权重、不读缓存，直接把请求扔给 GitHub 侧。
 *
 * Worker 本身是这条链路上唯一的新增单点。任何未预料的异常都必须落到这里，
 * 而不是变成 500——一个边缘脚本的 bug 不该让整个站点消失。
 */
async function failOpen(request: Request, env: Env): Promise<Response> {
  const settings = settingsFrom(env);
  const url = new URL(request.url);
  if (
    url.hostname === settings.canonicalHost &&
    (url.pathname === settings.downloadPrefix ||
      url.pathname.startsWith(settings.downloadPrefix + '/'))
  ) {
    return Response.redirect('https://github.com/' + settings.ghRepo + '/releases/latest', 302);
  }
  const target = originUrl(settings.origins[1]!, url);
  try {
    const res = await fetch(
      new Request(target.toString(), {
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
    // Route 下 Worker 发生未捕获异常或平台超限时，直接落回 DNS 背后的 Pages，
    // 因此 fushi.moe 的 DNS 必须是真实 Pages 自定义域，不能指向占位黑洞 IP。
    ctx.passThroughOnException();
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

      // GitHub star 数：同域端点 + 边缘缓存，一次回源服务所有访客。
      // 让浏览器自己打 api.github.com 会按访客 IP 限流，大陆网络还常常不可达。
      if (url.hostname === settings.canonicalHost && url.pathname === '/api/stars') {
        return await handleStars({
          settings,
          fetcher: fetch,
          cache: caches.default,
          waitUntil,
        });
      }

      // 推荐包：不碰 GitHub API、不碰 R2，纯粹是 fushi-pack release 的边缘代理。
      // 与下载路由前缀不同、彼此独立，谁先判都一样，这里就近放在它前面。
      if (
        url.hostname === settings.canonicalHost &&
        (url.pathname === settings.packPrefix ||
          url.pathname.startsWith(settings.packPrefix + '/'))
      ) {
        const packUrl = new URL(url.toString());
        packUrl.pathname = url.pathname.slice(settings.packPrefix.length) || '/';
        return await handlePack(new Request(packUrl.toString(), request), {
          settings,
          fetcher: fetch,
          cache: caches.default,
          waitUntil,
        });
      }

      if (
        url.hostname === settings.canonicalHost &&
        (url.pathname === settings.downloadPrefix ||
          url.pathname.startsWith(settings.downloadPrefix + '/'))
      ) {
        const routedUrl = new URL(url.toString());
        routedUrl.pathname = url.pathname.slice(settings.downloadPrefix.length) || '/';
        return await handleDownload(new Request(routedUrl.toString(), request), {
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
