import type { HealthStore } from './breaker';
import type { Settings } from './config';
import { downSet, isOriginFailure, pickOrder, type OriginName, type OriginSpec } from './origins';

export interface SiteDeps {
  readonly settings: Settings;
  readonly health: HealthStore;
  readonly fetcher: typeof fetch;
  readonly rand: () => number;
  /** 陈旧兜底缓存；未提供则跳过 stale-if-error。 */
  readonly staleCache?: Cache;
  readonly waitUntil?: (p: Promise<unknown>) => void;
}

/** 把源站主机名写回规范主机名，避免 gh./cf. 子域泄漏给用户。 */
function rewriteLocation(res: Response, deps: SiteDeps): Response {
  const loc = res.headers.get('location');
  if (!loc) return res;
  let target: URL;
  try {
    target = new URL(loc, `https://${deps.settings.canonicalHost}/`);
  } catch {
    return res;
  }
  const isOriginHost = deps.settings.origins.some((o) => o.host === target.hostname);
  if (!isOriginHost) return res;
  target.hostname = deps.settings.canonicalHost;
  const headers = new Headers(res.headers);
  headers.set('location', target.toString());
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

async function tryOrigin(
  origin: OriginSpec,
  request: Request,
  deps: SiteDeps,
): Promise<Response | null> {
  const url = new URL(request.url);
  url.hostname = origin.host;
  url.protocol = 'https:';
  url.port = '';

  const upstream = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual',
  });

  try {
    const res = await deps.fetcher(upstream, {
      signal: AbortSignal.timeout(deps.settings.timeoutMs),
    } as RequestInit);
    if (isOriginFailure(res.status)) return null;
    return res;
  } catch {
    return null;
  }
}

function tag(res: Response, origin: OriginName, extra?: Record<string, string>): Response {
  const headers = new Headers(res.headers);
  headers.set('x-fushi-origin', origin);
  for (const [k, v] of Object.entries(extra ?? {})) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

const OUTAGE_BODY = `<!doctype html><meta charset="utf-8">
<title>Fushi — 站点暂时不可用</title>
<style>body{font:16px/1.7 system-ui,sans-serif;max-width:34em;margin:18vh auto;padding:0 1.5em;color:#222}
code{background:#f4f4f5;padding:.15em .4em;border-radius:4px}</style>
<h1>站点暂时不可用</h1>
<p>Cloudflare 与 GitHub 两个来源都没有响应，这通常是上游平台故障，几分钟后会自行恢复。</p>
<p>下载可直接走 <a href="https://github.com/hajisensai/Fushi/releases/latest">GitHub Releases</a>。</p>`;

/**
 * 站点聚合：按权重挑源，失败即熔断并换另一个源，两个都失败才降级到陈旧缓存 / 503。
 */
export async function handleSite(request: Request, deps: SiteDeps): Promise<Response> {
  const { settings } = deps;
  const names = settings.origins.map((o) => o.name);
  const down = await downSet(deps.health, names);
  const order = pickOrder(settings.origins, down, settings.cfWeight, deps.rand());

  const cacheable = request.method === 'GET' || request.method === 'HEAD';

  for (const origin of order) {
    const res = await tryOrigin(origin, request, deps);
    if (res === null) {
      await deps.health.markDown(origin.name, settings.cooldownS);
      continue;
    }
    await deps.health.markUp(origin.name);
    const out = rewriteLocation(res, deps);
    if (cacheable && out.status === 200 && deps.staleCache) {
      const copy = out.clone();
      const store = deps.staleCache.put(new Request(request.url), copy);
      deps.waitUntil ? deps.waitUntil(store) : await store.catch(() => {});
    }
    return tag(out, origin.name);
  }

  if (cacheable && deps.staleCache) {
    const stale = await deps.staleCache.match(new Request(request.url));
    if (stale) return tag(stale, order[0]!.name, { 'x-fushi-stale': '1' });
  }

  return new Response(OUTAGE_BODY, {
    status: 503,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'retry-after': '120',
      'x-fushi-origin': 'none',
    },
  });
}
