import type { Settings } from './config';
import { fetchWithTimeout } from './fetch-timeout';

/**
 * 边缘缓存 TTL。api.github.com 对未认证请求按来源 IP 限 60 次/小时，而所有访客
 * 经过 Worker 后共用一个出口，所以这里必须是「站点级」缓存而不是「访客级」：
 * 15 分钟 = 每小时最多 4 次回源，离限流有两个数量级的余量。
 * star 数陈旧十几分钟对用户没有任何影响，为它冒限流风险才是坏交易。
 */
const STARS_TTL_S = 900;
const STARS_CACHE_KEY = 'https://stars.fushi.invalid/repo/';

export interface StarsDeps {
  readonly settings: Settings;
  readonly fetcher: typeof fetch;
  readonly cache?: Cache;
  readonly waitUntil?: (p: Promise<unknown>) => void;
}

export interface StarsPayload {
  readonly repo: string;
  readonly stars: number;
}

function json(payload: unknown, status: number, cacheControl: string): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
      // 站点在 CF Pages / GitHub Pages / 主域三处都可能被打开，一律放行。
      'access-control-allow-origin': '*',
    },
  });
}

function cacheKey(repo: string): Request {
  return new Request(STARS_CACHE_KEY + encodeURIComponent(repo));
}

/**
 * GitHub 仓库 star 数。挂在同域 /api/stars，而不是让浏览器直接打 api.github.com：
 * 一是 api.github.com 的限流按访客 IP 算、大陆网络还经常不可达；二是同域请求能吃
 * 到边缘缓存，一次回源服务所有访客。
 *
 * 拿不到就 503 + no-store，绝不返回 0 或占位数——前端据此隐藏徽章，
 * 显示一个假的 star 数比不显示更糟。
 */
export async function handleStars(deps: StarsDeps): Promise<Response> {
  const repo = deps.settings.ghRepo;
  const key = cacheKey(repo);
  if (deps.cache) {
    const hit = await deps.cache.match(key);
    if (hit) return hit;
  }

  let upstream: Response;
  try {
    // 成员调用会让 this 变成 deps，Workers 的全局 fetch 会抛 Illegal invocation
    // （/pack 与 ?src=gh 就栽在这上面，见 github-cache.ts 的注释）。
    const fetcher = deps.fetcher;
    upstream = await fetchWithTimeout(
      fetcher,
      'https://api.github.com/repos/' + repo,
      {
        headers: {
          accept: 'application/vnd.github+json',
          'user-agent': 'fushi-moe-edge',
        },
      },
      deps.settings.timeoutMs,
    );
  } catch (err) {
    return json(
      { error: 'stars unavailable', reason: err instanceof Error ? err.name : 'fetch failed' },
      503,
      'no-store',
    );
  }

  if (!upstream.ok) {
    return json({ error: 'stars unavailable', reason: 'upstream ' + upstream.status }, 503, 'no-store');
  }

  let stars: unknown;
  try {
    stars = ((await upstream.json()) as { stargazers_count?: unknown }).stargazers_count;
  } catch {
    return json({ error: 'stars unavailable', reason: 'bad json' }, 503, 'no-store');
  }
  if (typeof stars !== 'number' || !Number.isFinite(stars) || stars < 0) {
    return json({ error: 'stars unavailable', reason: 'bad payload' }, 503, 'no-store');
  }

  const payload: StarsPayload = { repo, stars: Math.floor(stars) };
  const response = json(payload, 200, 'public, max-age=' + STARS_TTL_S);
  if (deps.cache) {
    const store = deps.cache.put(key, response.clone());
    if (deps.waitUntil) deps.waitUntil(store);
    else await store.catch(() => {});
  }
  return response;
}
