import type { Settings } from './config';
import { fetchWithTimeout } from './fetch-timeout';
import { GITHUB_API_TIMEOUT_MS, readThrough, type LoadResult } from './stale-cache';

/**
 * App 设置项目录（给 AI 读）：`/settings.md` 与 `/settings.json`。
 *
 * 内容不在本仓：Fushi 主仓每次推送 develop / main 时，由 app 自己的设置 schema 生成
 * （fushi/test/settings/settings_catalog_export_test.dart），推到 `update-manifest` 分支的
 * `settings-catalog-<channel>.{json,md}`（tool/publish_settings_catalog.sh）。这里只做同域
 * 代理 + 边缘缓存，所以 app 加减设置项后官网不用重新构建、不用任何人同步。
 *
 * 通道：`?channel=stable|debug`。不带参数 = 正式版；正式版那份还没发布过时退回调试版
 * （目录是 2026-11 才开始生成的，下一次正式发布前 stable 文件不存在）。
 * 应答头 `x-fushi-settings-channel` 说明实际给的是哪一份。
 */

export type CatalogFormat = 'md' | 'json';
export type CatalogChannel = 'stable' | 'debug';

/** 新鲜期：目录只在 app 的设置 schema 变化时才变，十分钟足够新。 */
const CATALOG_TTL_S = 600;
/** 陈旧兜底期：raw.githubusercontent.com 抖动时继续给上一次成功的那份。 */
const CATALOG_STALE_TTL_S = 7 * 24 * 60 * 60;
const FRESH_KEY = 'https://settings-catalog.fushi.invalid/fresh/';
const STALE_KEY = 'https://settings-catalog.fushi.invalid/stale/';

const CONTENT_TYPES: Readonly<Record<CatalogFormat, string>> = {
  md: 'text/markdown; charset=utf-8',
  json: 'application/json; charset=utf-8',
};

/** 目录 JSON 的格式版本（与导出器的 kSettingsCatalogSchema 同步）。 */
export const CATALOG_SCHEMA = 1;

export interface SettingsCatalogDeps {
  readonly settings: Settings;
  readonly fetcher: typeof fetch;
  readonly cache?: Cache;
  readonly waitUntil?: (p: Promise<unknown>) => void;
}

interface CatalogCopy {
  readonly channel: CatalogChannel;
  readonly body: string;
}

/** 路径 → 格式；不是目录路径则为 null。 */
export function catalogFormatOf(pathname: string): CatalogFormat | null {
  if (pathname === '/settings.md') return 'md';
  if (pathname === '/settings.json') return 'json';
  return null;
}

/** `?channel=`：缺省 / 空 = 自动（正式版优先）；不认识的值为 null。 */
export function parseCatalogChannel(raw: string | null): CatalogChannel | 'auto' | null {
  if (raw === null || raw === '') return 'auto';
  return raw === 'stable' || raw === 'debug' ? raw : null;
}

export function catalogSourceUrl(repo: string, channel: CatalogChannel, format: CatalogFormat): string {
  return (
    'https://raw.githubusercontent.com/' + repo + '/update-manifest/settings-catalog-' + channel + '.' + format
  );
}

/** 上游给的东西像不像一份目录：别把 GitHub 的错误页或半截文件缓存七天。 */
export function looksLikeCatalog(body: string, format: CatalogFormat): boolean {
  if (format === 'md') return body.startsWith('# ') && body.includes('\n| Key |');
  try {
    const parsed = JSON.parse(body) as { schema?: unknown; settings?: unknown } | null;
    return parsed?.schema === CATALOG_SCHEMA && Array.isArray(parsed.settings) && parsed.settings.length > 0;
  } catch {
    return false;
  }
}

function validateCopy(raw: unknown): CatalogCopy | null {
  const copy = raw as Partial<CatalogCopy> | null;
  if (typeof copy?.body !== 'string' || copy.body === '') return null;
  if (copy.channel !== 'stable' && copy.channel !== 'debug') return null;
  return { channel: copy.channel, body: copy.body };
}

async function fetchCopy(
  deps: SettingsCatalogDeps,
  channel: CatalogChannel,
  format: CatalogFormat,
): Promise<LoadResult<CatalogCopy>> {
  let upstream: Response;
  try {
    upstream = await fetchWithTimeout(
      deps.fetcher,
      catalogSourceUrl(deps.settings.ghRepo, channel, format),
      { headers: { 'user-agent': 'fushi-moe-edge' } },
      GITHUB_API_TIMEOUT_MS,
    );
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.name : 'fetch failed' };
  }
  if (!upstream.ok) {
    void upstream.body?.cancel().catch(() => {});
    return { ok: false, reason: 'upstream ' + upstream.status };
  }
  const body = await upstream.text();
  if (!looksLikeCatalog(body, format)) return { ok: false, reason: 'bad payload' };
  return { ok: true, value: { channel, body } };
}

function textResponse(body: string, status: number, type: string, cacheControl: string): Response {
  return new Response(body, {
    status,
    headers: {
      'content-type': type,
      'cache-control': cacheControl,
      'access-control-allow-origin': '*',
    },
  });
}

export async function handleSettingsCatalog(
  request: Request,
  format: CatalogFormat,
  deps: SettingsCatalogDeps,
): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return textResponse('method not allowed', 405, 'text/plain; charset=utf-8', 'no-store');
  }
  const wanted = parseCatalogChannel(new URL(request.url).searchParams.get('channel'));
  if (wanted === null) {
    return textResponse('unknown channel; use stable or debug', 404, 'text/plain; charset=utf-8', 'no-store');
  }

  const key = encodeURIComponent(deps.settings.ghRepo) + '/' + wanted + '.' + format;
  const result = await readThrough<CatalogCopy>({
    cache: deps.cache,
    freshKey: FRESH_KEY + key,
    staleKey: STALE_KEY + key,
    freshTtlS: CATALOG_TTL_S,
    staleTtlS: CATALOG_STALE_TTL_S,
    waitUntil: deps.waitUntil,
    validate: validateCopy,
    load: async () => {
      if (wanted !== 'auto') return fetchCopy(deps, wanted, format);
      const stable = await fetchCopy(deps, 'stable', format);
      // 只有「正式版那份不存在」才退回调试版；超时 / 5xx 交给陈旧兜底，不拿另一个通道顶替。
      if (stable.ok || stable.reason !== 'upstream 404') return stable;
      return fetchCopy(deps, 'debug', format);
    },
  });

  if (result.value === null) {
    return textResponse(
      'settings catalog unavailable (' + result.reason + ')',
      503,
      'text/plain; charset=utf-8',
      'no-store',
    );
  }
  const res = textResponse(
    request.method === 'HEAD' ? '' : result.value.body,
    200,
    CONTENT_TYPES[format],
    // 陈旧兜底值给短 max-age，让下一批请求尽快再试回源。
    result.stale ? 'public, max-age=60' : 'public, max-age=' + CATALOG_TTL_S,
  );
  res.headers.set('x-fushi-settings-channel', result.value.channel);
  if (result.stale) res.headers.set('x-fushi-settings', 'stale');
  return res;
}
