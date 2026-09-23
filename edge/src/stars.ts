import type { Settings } from './config';
import { fetchGithubJson, jsonResponse, readThrough } from './stale-cache';

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
 * 只要一周内成功过一次，页面上的数字就一直在。三层逻辑在 stale-cache.ts。
 */
const STARS_STALE_TTL_S = 7 * 24 * 60 * 60;
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

function validateStars(raw: unknown): StarsPayload | null {
  const parsed = raw as Partial<StarsPayload> | null;
  if (typeof parsed?.stars !== 'number' || typeof parsed?.repo !== 'string') return null;
  return { repo: parsed.repo, stars: parsed.stars };
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
  const key = encodeURIComponent(repo);
  const result = await readThrough<StarsPayload>({
    cache: deps.cache,
    freshKey: STARS_FRESH_KEY + key,
    staleKey: STARS_STALE_KEY + key,
    freshTtlS: STARS_TTL_S,
    staleTtlS: STARS_STALE_TTL_S,
    waitUntil: deps.waitUntil,
    validate: validateStars,
    load: async () => {
      const r = await fetchGithubJson(deps.fetcher, 'https://api.github.com/repos/' + repo);
      if (!r.ok) return r;
      const stars = (r.value as { stargazers_count?: unknown } | null)?.stargazers_count;
      if (typeof stars !== 'number' || !Number.isFinite(stars) || stars < 0) {
        return { ok: false, reason: 'bad payload' };
      }
      return { ok: true, value: { repo, stars: Math.floor(stars) } };
    },
  });

  if (result.value === null) {
    return jsonResponse({ error: 'stars unavailable', reason: result.reason }, 503, 'no-store');
  }
  // 回源失败：上一次成功的值仍然是真值，只是旧一点。给它一个短 max-age，
  // 好让下一批请求尽快再试一次回源，而不是把陈旧值也锁上 15 分钟。
  if (result.stale) return jsonResponse(result.value, 200, 'public, max-age=60', 'x-fushi-stars');
  return jsonResponse(result.value, 200, 'public, max-age=' + STARS_TTL_S);
}
