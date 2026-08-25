const FORWARDED_HEADERS = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'etag',
  'last-modified',
] as const;

export interface GithubCacheProxyOptions {
  readonly url: string;
  readonly request: Request;
  readonly fetcher: typeof fetch;
  readonly ttlS: number;
  readonly cacheControl: string;
  readonly markerHeader: string;
  readonly markerValue: string;
  readonly cache?: Cache;
  readonly waitUntil?: (promise: Promise<unknown>) => void;
  /** 回源失败时把原因交回调用方（上游状态码或异常文本），否则失败就是一个哑巴 null。 */
  readonly onFailure?: (reason: string) => void;
}

/**
 * 通过普通 Workers Cache 代理公开 GitHub Release 资产。
 *
 * `caches.default` 是免费计划自带的边缘缓存，不涉及 Cache Reserve。
 * 调用方只可给带版本 tag 的不可变 URL 配一年 TTL。
 */
export async function proxyGithubCached(
  options: GithubCacheProxyOptions,
): Promise<Response | null> {
  const cacheKeyHeaders = new Headers();
  for (const name of ['range', 'if-range'] as const) {
    const value = options.request.headers.get(name);
    if (value !== null) cacheKeyHeaders.set(name, value);
  }
  const cacheKey = new Request(options.url, { method: 'GET', headers: cacheKeyHeaders });
  if (options.cache) {
    const hit = await options.cache.match(cacheKey);
    if (hit) return hit;
  }

  const headers = new Headers();
  for (const name of ['range', 'if-range'] as const) {
    const value = options.request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  headers.set('user-agent', 'fushi-moe-edge');

  // 不能写成 options.fetcher(...)：那是成员调用，this 会是 options。Workers 的全局
  // fetch 要求 this 是全局对象，否则抛 "Illegal invocation"——生产里 /pack 与 ?src=gh
  // 全部因此走到兜底，从上线起就没真正代理过一次（2026-08-25 从 502 体里抓到的）。
  const fetcher = options.fetcher;
  try {
    const upstream = await fetcher(options.url, {
      method: options.request.method === 'HEAD' ? 'HEAD' : 'GET',
      headers,
      redirect: 'follow',
    } as RequestInit);
    if (upstream.status >= 500) {
      options.onFailure?.('upstream status ' + upstream.status + ' from ' + new URL(upstream.url || options.url).hostname);
      return null;
    }

    const responseHeaders = new Headers();
    for (const name of FORWARDED_HEADERS) {
      const value = upstream.headers.get(name);
      if (value !== null) responseHeaders.set(name, value);
    }
    responseHeaders.set('cache-control', options.cacheControl);
    responseHeaders.set('access-control-allow-origin', '*');
    responseHeaders.set(options.markerHeader, options.markerValue);
    const response = new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
    if (
      options.cache &&
      options.request.method === 'GET' &&
      !options.request.headers.has('range') &&
      response.status === 200
    ) {
      const store = options.cache.put(new Request(options.url), response.clone());
      options.waitUntil ? options.waitUntil(store) : await store.catch(() => {});
    }
    return response;
  } catch (err) {
    options.onFailure?.('fetch threw: ' + (err instanceof Error ? err.name + ': ' + err.message : String(err)));
    return null;
  }
}
