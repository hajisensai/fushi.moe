import type { Settings } from './config';

/**
 * 推荐包分发路由（`/pack/*`）。
 *
 * 包分片放在 `hajisensai/fushi-pack` 的 release：public 仓库的 release 资产不计
 * 流量，单资产上限 2 GB，所以按 256 MiB 切片（分片同时是重试粒度）。
 *
 * 对外只有两条路径，**都不带版本以外的可变部分**：
 *
 *   /pack/manifest.json   → 最新 release 里的 manifest.json（滚动）
 *   /pack/<tag>/<name>    → 该 release 的具体切片（版本化）
 *
 * 于是换包 = 在 fushi-pack 发一个新 release。客户端只硬编码 `/pack/manifest.json`
 * 一个地址，清单里的切片 URL 自带 tag，app 一个字都不用改、也不用发版。
 *
 * **两条路径都不经过 GitHub API**：GitHub 自己就提供
 * `releases/latest/download/<name>` 这个会 302 到最新 release 的稳定端点，
 * 版本化资产的 URL 更是纯拼接。少一个 API 就少一份限流、熔断和缓存一致性负担。
 *
 * 这条路由与 GitHub 直链**逐字节相同**（本来就是它的边缘代理），所以下载器可以
 * 把两者挂到同一个分片上并发拉，拼完的 sha256 一定对得上。
 */

/** 只允许 GitHub tag / 资产名里真实会出现的字符，挡掉路径穿越与跨仓库改写。 */
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

function isSafeSegment(seg: string): boolean {
  return seg !== '.' && seg !== '..' && SAFE_SEGMENT.test(seg);
}

export interface PackDeps {
  readonly settings: Settings;
  readonly fetcher: typeof fetch;
}

function notFound(message: string): Response {
  return new Response(message, {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/**
 * 把上游响应原样转出，只重写缓存策略。
 *
 * `immutable` 只给带 tag 的切片：滚动路径配长缓存会让同一次下载拿到新旧混合的
 * 分片，逐片 sha256 会红、9.5 GB 白下——这正是切片路径必须带 tag 的原因。
 */
function relay(upstream: Response, cacheControl: string): Response {
  const headers = new Headers();
  for (const key of [
    'content-type',
    'content-length',
    'content-range',
    'accept-ranges',
    'etag',
    'last-modified',
  ]) {
    const v = upstream.headers.get(key);
    if (v !== null) headers.set(key, v);
  }
  headers.set('cache-control', cacheControl);
  headers.set('access-control-allow-origin', '*');
  headers.set('x-fushi-pack-origin', 'github');
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

async function proxy(url: string, request: Request, deps: PackDeps, cacheControl: string): Promise<Response> {
  const headers = new Headers();
  const range = request.headers.get('range');
  // Range 必须透传：分片下载器靠它并发取区间，吞掉就退化成整片重下。
  if (range !== null) headers.set('range', range);
  const ifRange = request.headers.get('if-range');
  if (ifRange !== null) headers.set('if-range', ifRange);
  headers.set('user-agent', 'fushi-moe-edge');
  try {
    const upstream = await deps.fetcher(url, {
      method: request.method === 'HEAD' ? 'HEAD' : 'GET',
      headers,
      redirect: 'follow',
    } as RequestInit);
    if (upstream.status >= 500) {
      return new Response('pack origin unavailable', {
        status: 502,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
      });
    }
    return relay(upstream, cacheControl);
  } catch {
    return new Response('pack origin unreachable', {
      status: 502,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
}

/** `/pack` 前缀已由调用方剥掉，这里拿到的是 `/manifest.json` 或 `/<tag>/<name>`。 */
export async function handlePack(request: Request, deps: PackDeps): Promise<Response> {
  const parts = new URL(request.url).pathname.split('/').filter((s) => s !== '');
  const repo = deps.settings.packRepo;

  if (parts.length === 1 && parts[0] === 'manifest.json') {
    // 滚动：短 TTL + 允许再验证，换包后最多 5 分钟内生效。
    return proxy(
      'https://github.com/' + repo + '/releases/latest/download/manifest.json',
      request,
      deps,
      'public, max-age=300, must-revalidate',
    );
  }

  if (parts.length === 2) {
    const [tag, name] = parts as [string, string];
    if (!isSafeSegment(tag) || !isSafeSegment(name)) {
      return notFound('bad pack path');
    }
    return proxy(
      'https://github.com/' + repo + '/releases/download/' + tag + '/' + name,
      request,
      deps,
      'public, max-age=31536000, immutable',
    );
  }

  return notFound('pack路径只有 /pack/manifest.json 与 /pack/<tag>/<name>');
}
