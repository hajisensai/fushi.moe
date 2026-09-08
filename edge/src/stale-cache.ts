import { fetchWithTimeout } from './fetch-timeout';

/**
 * 「新鲜缓存 → 回源 → 陈旧兜底」三层读取，给所有打 api.github.com 的端点共用
 * （/api/stars、/api/downloads）。
 *
 * 为什么必须三层（/api/stars 上线当天踩到的）：Worker 的出口是 Cloudflare 的共享 IP，
 * api.github.com 对未认证请求按来源 IP 限流，那份配额和全球其它 Worker 共用——403 是
 * 随机撞上的，跟我们打了多少次无关。只做「缓存 N 分钟 + 失败就 503」，撞上的那批访客
 * 就是拿不到数据。所以成功时额外写一份长 TTL 的陈旧副本，回源失败就还它；一次都没
 * 成功过才算不可用，绝不编数字。
 */

export type LoadResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly reason: string };

export interface ReadThroughOptions<T> {
  readonly cache?: Cache;
  /** 新鲜副本的缓存键（必须是合法 URL，用 .invalid 域避免和真实请求撞车）。 */
  readonly freshKey: string;
  readonly staleKey: string;
  readonly freshTtlS: number;
  readonly staleTtlS: number;
  /** 真回源。失败返回 { ok: false, reason }，不抛。 */
  readonly load: () => Promise<LoadResult<T>>;
  /** 缓存里读出来的东西必须过一遍形状校验：缓存条目跨部署存活，旧形状不能当新值用。 */
  readonly validate: (raw: unknown) => T | null;
  readonly waitUntil?: (p: Promise<unknown>) => void;
}

export type ReadThroughResult<T> =
  | { readonly value: T; readonly stale: boolean }
  | { readonly value: null; readonly reason: string };

async function readCached<T>(
  cache: Cache,
  key: string,
  validate: (raw: unknown) => T | null,
): Promise<T | null> {
  const hit = await cache.match(new Request(key));
  if (!hit) return null;
  try {
    return validate(await hit.json());
  } catch {
    return null;
  }
}

function storeCached<T>(
  opts: ReadThroughOptions<T>,
  cache: Cache,
  key: string,
  value: T,
  ttlS: number,
): void {
  const body = new Response(JSON.stringify(value), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'max-age=' + ttlS,
    },
  });
  const p = cache.put(new Request(key), body);
  if (opts.waitUntil) opts.waitUntil(p);
  else void p.catch(() => {});
}

export async function readThrough<T>(opts: ReadThroughOptions<T>): Promise<ReadThroughResult<T>> {
  const cache = opts.cache;
  if (cache) {
    const fresh = await readCached(cache, opts.freshKey, opts.validate);
    if (fresh !== null) return { value: fresh, stale: false };
  }

  const loaded = await opts.load();
  if (loaded.ok) {
    if (cache) {
      storeCached(opts, cache, opts.freshKey, loaded.value, opts.freshTtlS);
      storeCached(opts, cache, opts.staleKey, loaded.value, opts.staleTtlS);
    }
    return { value: loaded.value, stale: false };
  }

  if (cache) {
    const stale = await readCached(cache, opts.staleKey, opts.validate);
    if (stale !== null) return { value: stale, stale: true };
  }
  return { value: null, reason: loaded.reason };
}

/**
 * 回源超时。不复用 settings.timeoutMs：那是「回源自家 Pages」的预算（3s），
 * 对跨洲的 api.github.com 偏紧，冷启动时一次 TLS 握手就可能吃掉它。
 * 这些统计数字都不是关键路径，宁可多等几秒，也不要把本来能拿到的响应判死。
 */
export const GITHUB_API_TIMEOUT_MS = 8000;

/** 回源 GitHub REST 取 JSON：统一 UA / accept / 超时，失败一律收敛成 { ok: false, reason }，不抛。 */
export async function fetchGithubJson(
  fetcher: typeof fetch,
  url: string,
): Promise<LoadResult<unknown>> {
  let upstream: Response;
  try {
    // 只能把 fetcher 当普通函数值传下去：成员调用会让 this 变成宿主对象，
    // Workers 的全局 fetch 会抛 Illegal invocation（/pack 与 ?src=gh 都栽过）。
    upstream = await fetchWithTimeout(
      fetcher,
      url,
      { headers: { accept: 'application/vnd.github+json', 'user-agent': 'fushi-moe-edge' } },
      GITHUB_API_TIMEOUT_MS,
    );
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.name : 'fetch failed' };
  }
  if (!upstream.ok) return { ok: false, reason: 'upstream ' + upstream.status };
  try {
    return { ok: true, value: await upstream.json() };
  } catch {
    return { ok: false, reason: 'bad json' };
  }
}
