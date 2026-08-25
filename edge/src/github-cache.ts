const FORWARDED_HEADERS = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'etag',
  'last-modified',
] as const;

interface WorkerCacheInit extends RequestInit {
  readonly cf: {
    readonly cacheEverything: true;
    readonly cacheTtl: number;
    readonly cacheTtlByStatus: Readonly<Record<string, number>>;
  };
}

export interface GithubCacheProxyOptions {
  readonly url: string;
  readonly request: Request;
  readonly fetcher: typeof fetch;
  readonly ttlS: number;
  readonly cacheControl: string;
  readonly markerHeader: string;
  readonly markerValue: string;
}

/**
 * 通过普通 Workers Cache 代理公开 GitHub Release 资产。
 *
 * `cf.cacheEverything` 是免费计划自带的边缘缓存，不涉及 Cache Reserve。
 * 调用方只可给带版本 tag 的不可变 URL 配一年 TTL。
 */
export async function proxyGithubCached(
  options: GithubCacheProxyOptions,
): Promise<Response | null> {
  const headers = new Headers();
  for (const name of ['range', 'if-range'] as const) {
    const value = options.request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  headers.set('user-agent', 'fushi-moe-edge');

  try {
    const init: WorkerCacheInit = {
      method: options.request.method === 'HEAD' ? 'HEAD' : 'GET',
      headers,
      redirect: 'follow',
      cf: {
        cacheEverything: true,
        cacheTtl: options.ttlS,
        cacheTtlByStatus: {
          '200-299': options.ttlS,
          '300-399': 60,
          '400-599': 0,
        },
      },
    };
    const upstream = await options.fetcher(options.url, init);
    if (upstream.status >= 500) return null;

    const responseHeaders = new Headers();
    for (const name of FORWARDED_HEADERS) {
      const value = upstream.headers.get(name);
      if (value !== null) responseHeaders.set(name, value);
    }
    responseHeaders.set('cache-control', options.cacheControl);
    responseHeaders.set('access-control-allow-origin', '*');
    responseHeaders.set(options.markerHeader, options.markerValue);
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return null;
  }
}
