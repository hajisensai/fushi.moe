import type { Settings } from './config';
import { SLOTS, type Channel } from './manifest';
import {
  fetchGithubJson,
  inBackground,
  jsonResponse,
  readThrough,
  type LoadResult,
  type ReadThroughResult,
} from './stale-cache';

/*
 * 站内下载统计。
 *
 * 计什么：fushi.moe/releases 是站内下载的唯一必经点，三种出口各计一次「下载开始」——
 *   r2           Worker 自己从 R2 镜像吐字节——唯一没经过 GitHub 的出口
 *   github-edge  Worker 边缘代理 GitHub 直链吐字节（?src=gh，只在 R2 没镜像时兜底）
 *   github       302 把人送去 GitHub 直链
 * 后两种都会命中 GitHub 的 releases/download URL，GitHub 自己的 download_count 已经计过；
 * 页面显示的 total = GitHub 计数 + 只有 r2 这一种（served），否则同一次下载被加两遍。
 * site 里三种出口的分布仍然完整保留，看趋势用。
 *
 * 「一次下载」的判据在 isDownloadStart：安装包被分片下载器切成 8 MiB 的 Range 请求并发拉，
 * 按请求数计会把一个 247 MB 的包算成三十几次；按「从字节 0 开始、且不是探测的那一次」计
 * 才是一次点击。分片重试时第 0 片会被重拉，那一次会多计——弱网下的个位数误差，接受。
 *
 * 存在哪：单实例 SQLite Durable Object（download-stats-object.ts）。KV 的累加不是原子的，
 * 并发下会丢；Analytics Engine 读数要账号级 API token；D1 要先在账号里建库。DO 三者都不要，
 * 首次部署由 migrations 自动建类，SQLite 版免费计划可用。
 */

/**
 * 探测的上限长度。页面在点「下载」时会对每个来源发两种探测：`bytes=0-0`（describeSource，
 * 只看状态码）和 `bytes=0-65535`（chunked-download.mjs 的 DEFAULT_PROBE_BYTES，量首字节
 * 耗时）。两种都是在问「这个来源活着吗」，不是下载；安装包动辄上百 MB，从 0 起、不超过
 * 64 KiB 的 Range 只可能是探测。与 DEFAULT_PROBE_BYTES 同值由 test/download-stats.test.ts 守。
 */
export const PROBE_BYTES = 64 * 1024;

export type DownloadOutcome = 'r2' | 'github' | 'github-edge';
/** 没经过 GitHub、GitHub 自己计不到的出口——只有这一种能和 GitHub 的 download_count 相加。 */
export const SERVED_OUTCOME: DownloadOutcome = 'r2';

export interface DownloadEvent {
  readonly channel: Channel;
  readonly tag: string;
  readonly slot: string;
  readonly source: DownloadOutcome;
}

export interface SiteDownloadSummary {
  /** 三种出口合计。 */
  readonly total: number;
  /** 只算 r2（Worker 从镜像吐字节）——其余两种 GitHub 自己会计。 */
  readonly served: number;
  readonly byChannel: Record<string, number>;
  readonly bySlot: Record<string, number>;
  readonly bySource: Record<string, number>;
  readonly byTag: Record<string, number>;
  /** 最近 30 天，键 YYYY-MM-DD（UTC），按日期升序。 */
  readonly byDay: Record<string, number>;
}

/** 计数器。生产实现是 Durable Object stub；测试用内存对象。 */
export interface DownloadCounter {
  record(event: DownloadEvent): Promise<void>;
  summary(): Promise<SiteDownloadSummary>;
}

/**
 * 这个请求算不算「一次下载开始」。
 *
 * - HEAD / 非 GET：不算。
 * - 没有 Range：普通 <a> 点击、curl、更新器——算。
 * - Range 从 0 开始：分片下载器的第一片、aria2/IDM 的第一条连接、`bytes=0-` 整文件——算，
 *   但长度不超过 PROBE_BYTES 的那些不算：那是探测（`bytes=0-0` / `bytes=0-65535`）。
 * - Range 从别处开始：续传、第 N 片、多线程下载器的其它连接——不算，同一次下载已经在
 *   第一片上计过了。
 * - 多段 / 后缀 Range：不算。
 */
export function isDownloadStart(request: Request): boolean {
  if (request.method !== 'GET') return false;
  const range = request.headers.get('range');
  if (range === null) return true;
  const m = /^bytes=(\d+)-(\d*)$/i.exec(range.trim());
  if (!m || m[1] !== '0') return false;
  if (m[2] === '') return true;
  return Number(m[2]) + 1 > PROBE_BYTES;
}

/** 资产文件名 → 下载槽位；不在槽位表里的（旧 Hibiki 包、vendor 二进制、源码包）归 other。 */
export function slotOf(assetName: string): string {
  for (const [slot, pattern] of Object.entries(SLOTS)) {
    if (pattern.test(assetName)) return slot;
  }
  return 'other';
}

/**
 * 版本化路径 /v/<tag>/<name> 没有清单告诉我们通道，按 tag 形状判。
 * 滚动 debug 的 GitHub tag 带产品前缀（`fushi-debug-rolling`；`debug-rolling` 是桥包旧族），
 * 清单里的版本化 tag 是 `v<ver>-debug.<seq>+<sha>`，两种都归 debug。
 */
export function channelOfTag(tag: string): Channel {
  if (tag.endsWith('debug-rolling') || /-debug\./.test(tag)) return 'debug';
  if (/-beta\./.test(tag)) return 'beta';
  return 'stable';
}

export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** DO 的 ctx.storage.sql 与测试里的 node:sqlite 都收敛到这个最小形状。 */
export interface SqlLike {
  exec(query: string, ...bindings: unknown[]): { toArray(): Record<string, unknown>[] };
}

const DAY_WINDOW = 30;

function bump(map: Record<string, number>, key: string, n: number): void {
  map[key] = (map[key] ?? 0) + n;
}

function sortedDesc(map: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(map).sort((a, b) => b[1] - a[1]));
}

/**
 * 账本：一行 = (天, 通道, tag, 槽位, 出口) 的计数。天粒度就够了——要的是趋势和分布，
 * 不是逐次日志；行数上界 = 天数 × 槽位数 × 出口数，十年也才几万行，所以汇总就是
 * 一条 SELECT 全读出来在 JS 里分组，不为几个标量跑六次全表扫描。
 */
export class DownloadLedger {
  constructor(private readonly sql: SqlLike) {
    sql.exec(
      'CREATE TABLE IF NOT EXISTS downloads (' +
        'day TEXT NOT NULL, channel TEXT NOT NULL, tag TEXT NOT NULL, ' +
        'slot TEXT NOT NULL, source TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, ' +
        'PRIMARY KEY (day, channel, tag, slot, source)) WITHOUT ROWID',
    );
  }

  record(event: DownloadEvent, day: string): void {
    this.sql.exec(
      'INSERT INTO downloads (day, channel, tag, slot, source, n) VALUES (?, ?, ?, ?, ?, 1) ' +
        'ON CONFLICT (day, channel, tag, slot, source) DO UPDATE SET n = n + 1',
      day,
      event.channel,
      event.tag,
      event.slot,
      event.source,
    );
  }

  summary(today: string): SiteDownloadSummary {
    const since = utcDay(new Date(Date.parse(today + 'T00:00:00Z') - (DAY_WINDOW - 1) * 86_400_000));
    let total = 0;
    let served = 0;
    const byChannel: Record<string, number> = {};
    const bySlot: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byTag: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    const rows = this.sql
      .exec('SELECT day, channel, tag, slot, source, n FROM downloads ORDER BY day')
      .toArray();
    for (const row of rows) {
      const n = Number(row['n']);
      total += n;
      if (row['source'] === SERVED_OUTCOME) served += n;
      bump(byChannel, String(row['channel']), n);
      bump(bySlot, String(row['slot']), n);
      bump(bySource, String(row['source']), n);
      bump(byTag, String(row['tag']), n);
      const day = String(row['day']);
      if (day >= since) bump(byDay, day, n);
    }
    return {
      total,
      served,
      byChannel: sortedDesc(byChannel),
      bySlot: sortedDesc(bySlot),
      bySource: sortedDesc(bySource),
      byTag: sortedDesc(byTag),
      byDay,
    };
  }
}

// ---------------------------------------------------------------------------
// /api/downloads

const GITHUB_TTL_S = 900;
const GITHUB_STALE_TTL_S = 7 * 24 * 60 * 60;
/** 整份应答的边缘缓存：每个访客一进下载页就打一次，DO 与 GitHub 都不该按访客次数挨打。 */
const SUMMARY_TTL_S = 60;
const GITHUB_FRESH_KEY = 'https://downloads.fushi.invalid/github/fresh/';
const GITHUB_STALE_KEY = 'https://downloads.fushi.invalid/github/stale/';
const SUMMARY_KEY = 'https://downloads.fushi.invalid/summary/';
const RELEASES_PER_PAGE = 100;
/** 正式版与 beta 永不删除、约三天一个，十页 = 一千个 release，够用很多年。 */
const RELEASES_MAX_PAGES = 10;

export interface GithubDownloadSummary {
  /** 只算认得出槽位的 Fushi 资产；仓库里的旧 Hibiki 包、vendor 二进制不进这个数（bySlot.other 里能看到）。 */
  readonly total: number;
  readonly byTag: Record<string, number>;
  readonly bySlot: Record<string, number>;
}

export interface DownloadStatsDeps {
  readonly settings: Settings;
  readonly fetcher: typeof fetch;
  readonly cache?: Cache;
  readonly waitUntil?: (p: Promise<unknown>) => void;
  readonly counter?: DownloadCounter;
}

function isCountMap(raw: unknown): raw is Record<string, number> {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    Object.values(raw as Record<string, unknown>).every((v) => typeof v === 'number')
  );
}

function validateGithubSummary(raw: unknown): GithubDownloadSummary | null {
  const r = raw as Partial<GithubDownloadSummary> | null;
  if (typeof r?.total !== 'number' || !isCountMap(r.byTag) || !isCountMap(r.bySlot)) return null;
  return { total: r.total, byTag: r.byTag, bySlot: r.bySlot };
}

/** GET /repos/:repo/releases 的应答（各页拼起来）→ 各资产 download_count 汇总。形状不对判失败，不编数字。 */
export function githubSummaryFromReleases(raw: unknown): GithubDownloadSummary | null {
  if (!Array.isArray(raw)) return null;
  let total = 0;
  const byTag: Record<string, number> = {};
  const bySlot: Record<string, number> = {};
  for (const release of raw as { tag_name?: unknown; assets?: unknown }[]) {
    if (typeof release?.tag_name !== 'string' || !Array.isArray(release.assets)) return null;
    let tagSum = 0;
    for (const asset of release.assets as { name?: unknown; download_count?: unknown }[]) {
      if (typeof asset?.name !== 'string' || typeof asset.download_count !== 'number') return null;
      const n = Math.max(0, Math.floor(asset.download_count));
      const slot = slotOf(asset.name);
      bump(bySlot, slot, n);
      if (slot === 'other') continue;
      tagSum += n;
      total += n;
    }
    byTag[release.tag_name] = tagSum;
  }
  return { total, byTag, bySlot };
}

/** 跟着 per_page 翻页直到不满一页；一页都拿不全就整体判失败，不拿半截数据当全集。 */
async function loadGithubReleases(deps: DownloadStatsDeps): Promise<LoadResult<GithubDownloadSummary>> {
  const base = 'https://api.github.com/repos/' + deps.settings.ghRepo + '/releases?per_page=' + RELEASES_PER_PAGE;
  const releases: unknown[] = [];
  for (let page = 1; page <= RELEASES_MAX_PAGES; page++) {
    const r = await fetchGithubJson(deps.fetcher, base + '&page=' + page);
    if (!r.ok) return r;
    if (!Array.isArray(r.value)) return { ok: false, reason: 'bad payload' };
    releases.push(...r.value);
    if (r.value.length < RELEASES_PER_PAGE) break;
  }
  const summary = githubSummaryFromReleases(releases);
  return summary ? { ok: true, value: summary } : { ok: false, reason: 'bad payload' };
}

function githubSummary(deps: DownloadStatsDeps): Promise<ReadThroughResult<GithubDownloadSummary>> {
  const key = encodeURIComponent(deps.settings.ghRepo);
  return readThrough<GithubDownloadSummary>({
    cache: deps.cache,
    freshKey: GITHUB_FRESH_KEY + key,
    staleKey: GITHUB_STALE_KEY + key,
    freshTtlS: GITHUB_TTL_S,
    staleTtlS: GITHUB_STALE_TTL_S,
    waitUntil: deps.waitUntil,
    validate: validateGithubSummary,
    load: () => loadGithubReleases(deps),
  });
}

async function siteSummary(deps: DownloadStatsDeps): Promise<SiteDownloadSummary | null> {
  if (!deps.counter) return null;
  try {
    return await deps.counter.summary();
  } catch {
    // DO 抖一下不该让整个端点 503：GitHub 那半照常给。
    return null;
  }
}

/**
 * GET /api/downloads
 *
 *   { total, site, github, stale }
 *
 * total 是给页面显示的一个数：GitHub 各 release 资产 download_count 之和 + 站内从 R2 镜像
 * 吐出的下载数（其余出口 GitHub 已计）。GitHub 一次都没拿到过时 total 为 null——页面据此
 * 不显示，绝不显示假的 0。site / github 两份原始分布并排给出，方便看趋势与平台分布。
 *
 * 只有两边都拿到新鲜值的完整应答才进 60 秒边缘缓存；降级应答（哪一半是 null 或陈旧）
 * 逐请求重算，好让 DO 抖一下或 GitHub 撞一发 403 之后下一个请求就能恢复。
 */
export async function handleDownloadStats(deps: DownloadStatsDeps): Promise<Response> {
  const cache = deps.cache;
  if (cache) {
    const hit = await cache.match(new Request(SUMMARY_KEY));
    if (hit) return hit;
  }

  const [site, github] = await Promise.all([siteSummary(deps), githubSummary(deps)]);
  if (site === null && github.value === null) {
    return jsonResponse({ error: 'downloads unavailable', reason: github.reason }, 503, 'no-store');
  }

  const total = github.value === null ? null : github.value.total + (site?.served ?? 0);
  const stale = github.value !== null && github.stale;
  const response = jsonResponse(
    { total, site, github: github.value, stale },
    200,
    'public, max-age=' + SUMMARY_TTL_S,
    stale ? 'x-fushi-downloads' : undefined,
  );
  if (cache && site !== null && github.value !== null && !stale) {
    inBackground(cache.put(new Request(SUMMARY_KEY), response.clone()), deps.waitUntil);
  }
  return response;
}
