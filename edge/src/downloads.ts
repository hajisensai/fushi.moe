import type { HealthStore } from './breaker';
import type { Settings } from './config';
import { fetchWithTimeout } from './fetch-timeout';
import { proxyGithubCached } from './github-cache';
import {
  manifestFromPublished,
  mirrorKey,
  parseChannel,
  resolveSlot,
  SLOTS,
  type Channel,
  type ReleaseAsset,
  type ReleaseManifest,
} from './manifest';

export interface DownloadDeps {
  readonly settings: Settings;
  readonly health: HealthStore;
  readonly fetcher: typeof fetch;
  readonly mirror?: R2Bucket;
  readonly manifestCache?: Cache;
  readonly waitUntil?: (p: Promise<unknown>) => void;
}

const MANIFEST_TTL_S = 600;
const MANIFEST_CACHE_KEY = 'https://manifest.fushi.invalid/latest';
export const MIRROR_BREAKER = 'r2';
export const GH_MANIFEST_BREAKER = 'github-manifest';

/** 分片下载器可显式点名的同域来源。缺省沿用「R2 优先、未命中 302 GitHub」。 */
type AssetSource = 'r2' | 'gh' | null;

function manifestBreaker(channel: Channel): string {
  return channel === 'stable' ? GH_MANIFEST_BREAKER : GH_MANIFEST_BREAKER + '-' + channel;
}

/** 各通道的静态清单 URL：配置里只给正式版那份，其余按文件名规则派生。 */
export function manifestUrlFor(settings: Settings, channel: Channel): string {
  if (channel === 'stable') return settings.ghManifestUrl;
  const derived = settings.ghManifestUrl.replace('latest-stable-', 'latest-' + channel + '-');
  if (derived !== settings.ghManifestUrl) return derived;
  const slash = settings.ghManifestUrl.lastIndexOf('/');
  return settings.ghManifestUrl.slice(0, slash + 1) + 'latest-' + channel + '-fushi.json';
}

/**
 * 取某通道的最新发布清单。
 *
 * 顺序是有意的：update-manifest 分支的静态 JSON 是发布权威，完全不碰 GitHub
 * REST API；R2 里的 manifest.json 是镜像同步时写下的副本（只有正式版），只在
 * GitHub 不可达时接管——这正是「GitHub 挂了下载还能活」的那一环。
 */
export async function loadManifest(
  deps: DownloadDeps,
  channel: Channel = 'stable',
): Promise<ReleaseManifest | null> {
  const cached = await readCachedManifest(deps, channel);
  if (cached) return cached;

  const breaker = manifestBreaker(channel);
  if (!(await deps.health.isDown(breaker))) {
    const published = await fetchPublishedManifest(deps, channel);
    if (published) {
      await deps.health.markUp(breaker);
      await writeCachedManifest(deps, channel, published);
      return published;
    }
    await deps.health.markDown(breaker, deps.settings.cooldownS);
  }

  if (channel !== 'stable') return null;
  const fromMirror = await readMirrorManifest(deps);
  if (fromMirror) {
    await writeCachedManifest(deps, channel, fromMirror);
    return fromMirror;
  }
  return null;
}

async function fetchPublishedManifest(
  deps: DownloadDeps,
  channel: Channel,
): Promise<ReleaseManifest | null> {
  try {
    const res = await fetchWithTimeout(
      deps.fetcher,
      manifestUrlFor(deps.settings, channel),
      {
        headers: {
          accept: 'application/json',
          'user-agent': 'fushi-moe-edge',
        },
      },
      deps.settings.timeoutMs,
    );
    if (!res.ok) return null;
    const parsed = manifestFromPublished(await res.json());
    // 静态 JSON 自带 channel；发布流程写错通道时宁可判不可用，也不把正式版当调试版发。
    if (parsed && parsed.channel !== channel) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function readMirrorManifest(deps: DownloadDeps): Promise<ReleaseManifest | null> {
  if (!deps.mirror) return null;
  try {
    const obj = await deps.mirror.get('manifest.json');
    if (!obj) return null;
    const parsed = JSON.parse(await obj.text()) as Partial<ReleaseManifest>;
    if (typeof parsed?.tag !== 'string' || !Array.isArray(parsed?.assets)) return null;
    return {
      tag: parsed.tag,
      publishedAt: typeof parsed.publishedAt === 'string' ? parsed.publishedAt : '',
      assets: parsed.assets,
      channel: 'stable',
      version: typeof parsed.version === 'string' ? parsed.version : '',
    };
  } catch {
    return null;
  }
}

function cacheKeyFor(channel: Channel): Request {
  return new Request(MANIFEST_CACHE_KEY + '/' + channel);
}

async function readCachedManifest(
  deps: DownloadDeps,
  channel: Channel,
): Promise<ReleaseManifest | null> {
  if (!deps.manifestCache) return null;
  const hit = await deps.manifestCache.match(cacheKeyFor(channel));
  if (!hit) return null;
  try {
    return (await hit.json()) as ReleaseManifest;
  } catch {
    return null;
  }
}

async function writeCachedManifest(
  deps: DownloadDeps,
  channel: Channel,
  m: ReleaseManifest,
): Promise<void> {
  if (!deps.manifestCache) return;
  const res = new Response(JSON.stringify(m), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'max-age=' + MANIFEST_TTL_S,
    },
  });
  const p = deps.manifestCache.put(cacheKeyFor(channel), res);
  if (deps.waitUntil) deps.waitUntil(p);
  else await p.catch(() => {});
}

function contentRange(offset: number, length: number, size: number): string {
  return 'bytes ' + offset + '-' + (offset + length - 1) + '/' + size;
}

/** 从 R2 镜像吐文件，支持 Range（断点续传 / 分片并发）。R2 出网免费，所以它是首选路径。 */
async function serveFromMirror(
  request: Request,
  deps: DownloadDeps,
  tag: string,
  asset: ReleaseAsset,
): Promise<Response | null> {
  if (!deps.mirror) return null;
  if (await deps.health.isDown(MIRROR_BREAKER)) return null;

  const key = mirrorKey(tag, asset.name);
  const filename = asset.name.replaceAll('"', '');
  try {
    if (request.method === 'HEAD') {
      const head = await deps.mirror.head(key);
      if (!head) return null;
      const headers = new Headers();
      head.writeHttpMetadata(headers);
      headers.set('etag', head.httpEtag);
      headers.set('content-length', String(head.size));
      headers.set('accept-ranges', 'bytes');
      headers.set('x-fushi-mirror', 'r2');
      return new Response(null, { status: 200, headers });
    }

    const obj = await deps.mirror.get(key, { range: request.headers });
    if (!obj) return null;
    const body = (obj as R2ObjectBody).body;
    if (!body) return null;

    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('etag', obj.httpEtag);
    headers.set('accept-ranges', 'bytes');
    headers.set('content-disposition', 'attachment; filename="' + filename + '"');
    headers.set('x-fushi-mirror', 'r2');

    const range = obj.range as { offset?: number; length?: number } | undefined;
    if (range && typeof range.offset === 'number' && typeof range.length === 'number') {
      headers.set('content-range', contentRange(range.offset, range.length, obj.size));
      headers.set('content-length', String(range.length));
      return new Response(body, { status: 206, headers });
    }
    headers.set('content-length', String(obj.size));
    return new Response(body, { status: 200, headers });
  } catch {
    await deps.health.markDown(MIRROR_BREAKER, deps.settings.cooldownS);
    return null;
  }
}

function redirectToGithub(asset: ReleaseAsset): Response {
  return new Response(null, {
    status: 302,
    headers: {
      location: asset.url,
      'cache-control': 'no-store',
      'x-fushi-mirror': 'github',
    },
  });
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
  });
}

function notFound(message: string): Response {
  return new Response(message, {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/**
 * 边缘代理 GitHub 直链（流式透传，Range 原样带过去）。
 *
 * 浏览器里的分片下载器只能 fetch 同域：GitHub 的 release 资产没有 CORS 头，
 * 302 过去就是一次失败的跨域请求。所以 `?src=gh` 必须在这里把字节搬过来，
 * 而不是像默认路径那样把人送走。带 tag 的版本化 URL 内容不可变，可配长缓存；
 * 分片请求都带 Range，Workers Cache 只存整文件的 200 应答，不会把 300 MB 写进边缘缓存。
 */
async function serveViaEdge(
  request: Request,
  deps: DownloadDeps,
  asset: ReleaseAsset,
  immutable: boolean,
): Promise<Response> {
  let failure = '';
  const proxied = await proxyGithubCached({
    url: asset.url,
    request,
    fetcher: deps.fetcher,
    ttlS: immutable ? 31_536_000 : 300,
    cacheControl: immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=300, must-revalidate',
    markerHeader: 'x-fushi-mirror',
    markerValue: 'github-edge',
    cache: deps.manifestCache,
    waitUntil: deps.waitUntil,
    onFailure: (reason) => {
      failure = reason;
    },
  });
  // 502 体里带上原因：Worker 出口到 GitHub 失败在生产里只能从这里看，没有别的日志面。
  if (!proxied) return jsonError(502, 'github upstream unavailable: ' + (failure || 'unknown'));
  return proxied;
}

function sourceOf(request: Request): AssetSource {
  const src = new URL(request.url).searchParams.get('src');
  return src === 'r2' || src === 'gh' ? src : null;
}

async function serveAsset(
  request: Request,
  deps: DownloadDeps,
  tag: string,
  asset: ReleaseAsset,
  immutable: boolean,
): Promise<Response> {
  const source = sourceOf(request);
  if (source === 'gh') return serveViaEdge(request, deps, asset, immutable);

  const mirrored = await serveFromMirror(request, deps, tag, asset);
  if (mirrored) return mirrored;
  // 点名要镜像就只给镜像：分片下载器靠这个 404 判定「该来源不可用」，302 会把它带去撞 CORS。
  if (source === 'r2') return jsonError(404, 'not mirrored');
  return redirectToGithub(asset);
}

function githubAssetUrl(repo: string, tag: string, name: string): string {
  return (
    'https://github.com/' +
    repo +
    '/releases/download/' +
    encodeURIComponent(tag) +
    '/' +
    encodeURIComponent(name)
  );
}

function latestManifestResponse(
  manifest: ReleaseManifest | null,
  channel: Channel,
  deps: DownloadDeps,
): Response {
  if (!manifest) {
    return new Response(JSON.stringify({ error: 'manifest unavailable', channel }), {
      status: 503,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
      },
    });
  }

  const slots: Record<
    string,
    { url: string; githubUrl: string; name: string; size: number } | null
  > = {};
  const channelPath = channel === 'stable' ? 'latest' : channel;
  for (const slot of Object.keys(SLOTS)) {
    const asset = resolveSlot(manifest, slot);
    slots[slot] = asset
      ? {
          url:
            'https://' +
            deps.settings.canonicalHost +
            deps.settings.downloadPrefix +
            '/' +
            channelPath +
            '/' +
            slot,
          githubUrl: asset.url,
          name: asset.name,
          size: asset.size,
        }
      : null;
  }
  return new Response(
    JSON.stringify(
      {
        channel,
        tag: manifest.tag,
        version: manifest.version,
        publishedAt: manifest.publishedAt,
        slots,
      },
      null,
      2,
    ),
    {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=300',
        'access-control-allow-origin': '*',
      },
    },
  );
}

function githubReleasesRedirect(deps: DownloadDeps, channel: Channel): Response {
  return new Response(null, {
    status: 302,
    headers: {
      location:
        'https://github.com/' +
        deps.settings.ghRepo +
        '/releases' +
        (channel === 'stable' ? '/latest' : ''),
      'cache-control': 'no-store',
      'x-fushi-mirror': 'github-fallback',
    },
  });
}

function resolveVersionedAsset(
  manifest: ReleaseManifest | null,
  deps: DownloadDeps,
  tag: string,
  name: string,
): ReleaseAsset {
  const known =
    manifest && manifest.tag === tag
      ? manifest.assets.find((asset) => asset.name === name)
      : undefined;
  return known ?? {
    name,
    size: 0,
    url: githubAssetUrl(deps.settings.ghRepo, tag, name),
  };
}

/**
 * fushi.moe/releases 下的全部下载路由。入口已先剥掉 downloadPrefix。
 *
 *   /api/latest[?channel=stable|debug|beta]   清单（槽位 → 下载地址）
 *   /latest/<slot>  /stable/<slot>            正式版某槽位（latest 是 stable 的别名）
 *   /debug/<slot>  /beta/<slot>               其它通道
 *   /v/<tag>/<name>[?src=r2|gh]               版本化文件；src 点名同域来源给分片下载器用
 */
export async function handleDownload(request: Request, deps: DownloadDeps): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter((part) => part !== '');
  if (parts.length === 0) {
    return Response.redirect('https://' + deps.settings.canonicalHost + '/download', 302);
  }

  if (parts[0] === 'api' && parts[1] === 'latest') {
    const channel = parseChannel(url.searchParams.get('channel'));
    if (!channel) return notFound('unknown channel: ' + url.searchParams.get('channel'));
    return latestManifestResponse(await loadManifest(deps, channel), channel, deps);
  }

  // 版本化路径不依赖清单：清单只用来补 size，拿不到就按 tag/文件名直接拼 GitHub 直链。
  if (parts[0] === 'v' && parts.length === 3) {
    const tag = decodeURIComponent(parts[1]!);
    const name = decodeURIComponent(parts[2]!);
    const manifest = await loadManifest(deps, 'stable');
    return serveAsset(request, deps, tag, resolveVersionedAsset(manifest, deps, tag, name), true);
  }

  if (parts.length === 2) {
    const channel = parseChannel(parts[0]!);
    if (!channel) return notFound('not found');
    const manifest = await loadManifest(deps, channel);
    if (!manifest) return githubReleasesRedirect(deps, channel);
    const asset = resolveSlot(manifest, parts[1]!);
    if (!asset) return notFound('unknown download slot: ' + parts[1]);
    return serveAsset(request, deps, manifest.tag, asset, false);
  }

  return notFound('not found');
}
