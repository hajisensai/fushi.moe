import type { HealthStore } from './breaker';
import type { Settings } from './config';
import {
  manifestFromGithub,
  mirrorKey,
  resolveSlot,
  SLOTS,
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
export const GH_API_BREAKER = 'gh-api';

/**
 * 取最新发布清单。
 *
 * 顺序是有意的：GitHub API 是唯一权威（新版本先在那里出现），
 * R2 里的 manifest.json 是镜像同步时写下的副本，只在 GitHub 不可达时接管——
 * 这正是「GitHub 挂了下载还能活」的那一环。
 */
export async function loadManifest(deps: DownloadDeps): Promise<ReleaseManifest | null> {
  const cached = await readCachedManifest(deps);
  if (cached) return cached;

  if (!(await deps.health.isDown(GH_API_BREAKER))) {
    const fromApi = await fetchGithubManifest(deps);
    if (fromApi) {
      await deps.health.markUp(GH_API_BREAKER);
      await writeCachedManifest(deps, fromApi);
      return fromApi;
    }
    await deps.health.markDown(GH_API_BREAKER, deps.settings.cooldownS);
  }

  const fromMirror = await readMirrorManifest(deps);
  if (fromMirror) {
    await writeCachedManifest(deps, fromMirror);
    return fromMirror;
  }
  return null;
}

async function fetchGithubManifest(deps: DownloadDeps): Promise<ReleaseManifest | null> {
  const url = 'https://api.github.com/repos/' + deps.settings.ghRepo + '/releases/latest';
  try {
    const res = await deps.fetcher(url, {
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'fushi-moe-edge',
      },
      signal: AbortSignal.timeout(deps.settings.timeoutMs),
    } as RequestInit);
    if (!res.ok) return null;
    return manifestFromGithub(await res.json());
  } catch {
    return null;
  }
}

async function readMirrorManifest(deps: DownloadDeps): Promise<ReleaseManifest | null> {
  if (!deps.mirror) return null;
  try {
    const obj = await deps.mirror.get('manifest.json');
    if (!obj) return null;
    const parsed = JSON.parse(await obj.text()) as ReleaseManifest;
    if (typeof parsed?.tag !== 'string' || !Array.isArray(parsed?.assets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function readCachedManifest(deps: DownloadDeps): Promise<ReleaseManifest | null> {
  if (!deps.manifestCache) return null;
  const hit = await deps.manifestCache.match(new Request(MANIFEST_CACHE_KEY));
  if (!hit) return null;
  try {
    return (await hit.json()) as ReleaseManifest;
  } catch {
    return null;
  }
}

async function writeCachedManifest(deps: DownloadDeps, m: ReleaseManifest): Promise<void> {
  if (!deps.manifestCache) return;
  const res = new Response(JSON.stringify(m), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'max-age=' + MANIFEST_TTL_S,
    },
  });
  const p = deps.manifestCache.put(new Request(MANIFEST_CACHE_KEY), res);
  if (deps.waitUntil) deps.waitUntil(p);
  else await p.catch(() => {});
}

function contentRange(offset: number, length: number, size: number): string {
  return 'bytes ' + offset + '-' + (offset + length - 1) + '/' + size;
}

/** 从 R2 镜像吐文件，支持 Range（断点续传）。R2 出网免费，所以它是首选路径。 */
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

function notFound(message: string): Response {
  return new Response(message, {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}

async function serveAsset(
  request: Request,
  deps: DownloadDeps,
  tag: string,
  asset: ReleaseAsset,
): Promise<Response> {
  const mirrored = await serveFromMirror(request, deps, tag, asset);
  if (mirrored) return mirrored;
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

function latestManifestResponse(manifest: ReleaseManifest | null, deps: DownloadDeps): Response {
  if (!manifest) {
    return new Response(JSON.stringify({ error: 'manifest unavailable' }), {
      status: 503,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
      },
    });
  }

  const slots: Record<string, { url: string; name: string; size: number } | null> = {};
  for (const slot of Object.keys(SLOTS)) {
    const asset = resolveSlot(manifest, slot);
    slots[slot] = asset
      ? {
          url:
            'https://' +
            deps.settings.canonicalHost +
            deps.settings.downloadPrefix +
            '/latest/' +
            slot,
          name: asset.name,
          size: asset.size,
        }
      : null;
  }
  return new Response(
    JSON.stringify({ tag: manifest.tag, publishedAt: manifest.publishedAt, slots }, null, 2),
    {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=300',
        'access-control-allow-origin': '*',
      },
    },
  );
}

function githubLatestRedirect(deps: DownloadDeps): Response {
  return new Response(null, {
    status: 302,
    headers: {
      location: 'https://github.com/' + deps.settings.ghRepo + '/releases/latest',
      'cache-control': 'no-store',
      'x-fushi-mirror': 'github-fallback',
    },
  });
}

function resolveVersionedAsset(
  manifest: ReleaseManifest,
  deps: DownloadDeps,
  tag: string,
  name: string,
): ReleaseAsset {
  const known = manifest.tag === tag ? manifest.assets.find((asset) => asset.name === name) : undefined;
  return known ?? {
    name,
    size: 0,
    url: githubAssetUrl(deps.settings.ghRepo, tag, name),
  };
}

/** fushi.moe/releases 下的全部下载路由。入口已先剥掉 downloadPrefix。 */
export async function handleDownload(request: Request, deps: DownloadDeps): Promise<Response> {
  const parts = new URL(request.url).pathname.split('/').filter((part) => part !== '');
  if (parts.length === 0) {
    return Response.redirect('https://' + deps.settings.canonicalHost + '/download', 302);
  }

  const manifest = await loadManifest(deps);
  if (parts[0] === 'api' && parts[1] === 'latest') {
    return latestManifestResponse(manifest, deps);
  }
  if (!manifest) return githubLatestRedirect(deps);

  if (parts[0] === 'latest' && parts.length === 2) {
    const asset = resolveSlot(manifest, parts[1]!);
    if (!asset) return notFound('unknown download slot: ' + parts[1]);
    return serveAsset(request, deps, manifest.tag, asset);
  }

  if (parts[0] === 'v' && parts.length === 3) {
    const tag = decodeURIComponent(parts[1]!);
    const name = decodeURIComponent(parts[2]!);
    return serveAsset(request, deps, tag, resolveVersionedAsset(manifest, deps, tag, name));
  }

  return notFound('not found');
}
