import type { Settings } from './config';
import { fetchWithTimeout } from './fetch-timeout';

/**
 * 新鲜期。api.github.com 对未认证请求按来源 IP 限流，而 Worker 的出口是
 * Cloudflare 的共享 IP——那份配额是和全球其它 Worker 共用的，不是我们自己
 * 打得多就能占住。所以这是「站点级」缓存而不是「访客级」：15 分钟 = 每小时
 * 最多 4 次回源。star 数陈旧十几分钟对谁都没有影响。
 */
const STARS_TTL_S = 900;
/**
 * 陈旧兜底期。共享 IP 上的 403 是随机撞上的，跟我们打了多少次无关，
 * 所以「这次回源失败」必须能靠上一次的成功值兜住——上线当天第一次请求就
 * 撞到了一发 503（reason 12 字符，upstream 403 / fetch failed 那一档）。
 * 只要一周内成功过一次，页面上的数字就一直在。
 */
const STARS_STALE_TTL_S = 7 * 24 * 60 * 60;
/**
 * 回源超时。不复用 settings.timeoutMs：那是「回源自家 Pages」的预算（3s），
 * 对跨洲的 api.github.com 偏紧，冷启动时一次 TLS 握手就可能吃掉它。
 * star 数不是关键路径，宁可多等几秒，也不要把本来能拿到的响应判死。
 */
const STARS_TIMEOUT_MS = 8000;
const STARS_FRESH_KEY = 'https://stars.fushi.invalid/fresh/';
const STARS_STALE_KEY = 'https://stars.fushi.invalid/stale/';

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

function json(payload: unknown, status: number, cacheControl: string, stale = false): Response {
  const headers: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': cacheControl,
    // 站点在 CF Pages / GitHub Pages / 主域三处都可能被打开，一律放行。
    'access-control-allow-origin': '*',
  };
  if (stale) headers['x-fushi-stars'] = 'stale';
  return new Response(JSON.stringify(payload), { status, headers });
}

function keyFor(prefix: string, repo: string): Request {
  return new Request(prefix + encodeURIComponent(repo));
}

async function readPayload(cache: Cache, key: Request): Promise<StarsPayload | null> {
  const hit = await cache.match(key);
  if (!hit) return null;
  try {
    const parsed = (await hit.json()) as Partial<StarsPayload>;
    if (typeof parsed?.stars !== 'number' || typeof parsed?.repo !== 'string') return null;
    return { repo: parsed.repo, stars: parsed.stars };
  } catch {
    return null;
  }
}

function store(deps: StarsDeps, cache: Cache, key: Request, payload: StarsPayload, ttlS: number): void {
  const body = new Response(JSON.stringify(payload), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'max-age=' + ttlS,
    },
  });
  const p = cache.put(key, body);
  if (deps.waitUntil) deps.waitUntil(p);
  else void p.catch(() => {});
}

/** 回源拿一次 star 数。失败一律返回 null 加一句人话原因，不抛。 */
async function fetchStars(
  deps: StarsDeps,
  repo: string,
): Promise<{ stars: number } | { reason: string }> {
  let upstream: Response;
  try {
    // 成员调用会让 this 变成 deps，Workers 的全局 fetch 会抛 Illegal invocation
    // （/pack 与 ?src=gh 就栽在这上面，见 github-cache.ts 的注释）。
    const fetcher = deps.fetcher;
    upstream = await fetchWithTimeout(
      fetcher,
      'https://api.github.com/repos/' + repo,
      { headers: { accept: 'application/vnd.github+json', 'user-agent': 'fushi-moe-edge' } },
      STARS_TIMEOUT_MS,
    );
  } catch (err) {
    return { reason: err instanceof Error ? err.name : 'fetch failed' };
  }

  if (!upstream.ok) return { reason: 'upstream ' + upstream.status };

  let stars: unknown;
  try {
    stars = ((await upstream.json()) as { stargazers_count?: unknown }).stargazers_count;
  } catch {
    return { reason: 'bad json' };
  }
  if (typeof stars !== 'number' || !Number.isFinite(stars) || stars < 0) {
    return { reason: 'bad payload' };
  }
  return { stars: Math.floor(stars) };
}

/**
 * GitHub 仓库 star 数。挂在同域 /api/stars，而不是让浏览器直接打 api.github.com：
 * 一是那边的限流按访客 IP 算、大陆网络还经常不可达；二是同域请求能吃到边缘缓存，
 * 一次回源服务所有访客。
 *
 * 三层：新鲜缓存 → 回源 → 陈旧兜底。三层都没有才 503 + no-store，
 * 前端据此隐藏徽章——显示一个假的 0 比不显示更糟。
 */
export async function handleStars(deps: StarsDeps): Promise<Response> {
  const repo = deps.settings.ghRepo;
  const cache = deps.cache;

  if (cache) {
    const fresh = await cache.match(keyFor(STARS_FRESH_KEY, repo));
    if (fresh) return fresh;
  }

  const result = await fetchStars(deps, repo);
  if ('stars' in result) {
    const payload: StarsPayload = { repo, stars: result.stars };
    const response = json(payload, 200, 'public, max-age=' + STARS_TTL_S);
    if (cache) {
      store(deps, cache, keyFor(STARS_FRESH_KEY, repo), payload, STARS_TTL_S);
      store(deps, cache, keyFor(STARS_STALE_KEY, repo), payload, STARS_STALE_TTL_S);
    }
    return response;
  }

  // 回源失败：上一次成功的值仍然是真值，只是旧一点。给它一个短 max-age，
  // 好让下一批请求尽快再试一次回源，而不是把陈旧值也锁上 15 分钟。
  if (cache) {
    const stale = await readPayload(cache, keyFor(STARS_STALE_KEY, repo));
    if (stale) return json(stale, 200, 'public, max-age=60', true);
  }
  return json({ error: 'stars unavailable', reason: result.reason }, 503, 'no-store');
}
