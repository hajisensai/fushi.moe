/*
 * Fushi 官网多来源故障切换 Service Worker。
 *
 * 为什么要有它：fushi.moe 这一个主机名在 DNS 上只能落在一边——Cloudflare 代理的
 * 主机名只会返回 CF 的 anycast IP，没法和 GitHub Pages 的 IP 并列在同一组 A 记录里。
 * 所以「连不上 CF 就走 GitHub、连不上 GitHub 就走 CF」这件事没法在解析层完成，
 * 只能落到浏览器本地：SW 跑在用户机器上，CF 整条线路不可达时它照样在跑，
 * 于是可以悄悄改从另一边取内容，而地址栏始终是用户熟悉的那一个。
 *
 * 铁律：这里的任何异常都必须退化成一次普通的 fetch。一个边缘脚本的 bug
 * 不该把已经装了 SW 的回访用户永久挡在门外。
 */

const VERSION = 'v1';
const CACHE = 'fushi-' + VERSION;
const STATE_CACHE = 'fushi-state-' + VERSION;

/** 两个来源各自锚定一边线路，谁通用谁。顺序不重要，当前页所在的那个永远排第一。 */
const KNOWN_ORIGINS = ['https://fushi.moe', 'https://www.fushi.moe'];

const ORIGIN_TIMEOUT_MS = 6000;
/** 某个来源失败后，多久之内不再优先尝试它。 */
const COOLDOWN_MS = 5 * 60 * 1000;

const STATE_KEY = 'https://fushi.invalid/preferred-origin';

/** 当前页所在来源永远排第一：这样从哪边进来的用户，另一边就自动成为它的备份。 */
function originCandidates() {
  const here = self.location.origin;
  const rest = KNOWN_ORIGINS.filter((o) => o !== here);
  return [here].concat(rest);
}

async function readState() {
  try {
    const cache = await caches.open(STATE_CACHE);
    const hit = await cache.match(STATE_KEY);
    if (!hit) return null;
    const state = await hit.json();
    if (!state || typeof state.origin !== 'string') return null;
    if (typeof state.until === 'number' && Date.now() > state.until) return null;
    return state;
  } catch (_) {
    return null;
  }
}

async function writeState(origin) {
  try {
    const cache = await caches.open(STATE_CACHE);
    const body = JSON.stringify({ origin: origin, until: Date.now() + COOLDOWN_MS });
    await cache.put(STATE_KEY, new Response(body));
  } catch (_) {
    /* 状态写不进去只是下次少一点记忆，不影响正确性 */
  }
}

async function clearState() {
  try {
    const cache = await caches.open(STATE_CACHE);
    await cache.delete(STATE_KEY);
  } catch (_) {
    /* 同上 */
  }
}

/** 把候选顺序按「上次成功的那个」重排；没有记忆时保持默认顺序。 */
async function orderedOrigins() {
  const all = originCandidates();
  const state = await readState();
  if (!state) return all;
  const preferred = all.filter((o) => o === state.origin);
  if (preferred.length === 0) return all;
  return preferred.concat(all.filter((o) => o !== state.origin));
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/**
 * 重建响应，剥掉 redirected 标记。
 *
 * 浏览器拒绝把 redirected=true 的响应交给一次导航（"a redirected response was used
 * for a request whose redirect mode is not follow"），源站的目录规范化 301 会稳定踩中。
 */
function rebuild(res) {
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}

async function fetchFrom(origin, request) {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, origin);
  const init = {
    method: request.method,
    headers: request.headers,
    credentials: 'omit',
    redirect: 'follow',
    mode: target.origin === self.location.origin ? 'same-origin' : 'cors',
  };
  const res = await withTimeout(fetch(target.toString(), init), ORIGIN_TIMEOUT_MS);
  if (res.status >= 500) throw new Error('origin ' + res.status);
  return rebuild(res);
}

async function putCache(request, res) {
  try {
    if (res.status !== 200) return;
    const cache = await caches.open(CACHE);
    await cache.put(new Request(request.url), res.clone());
  } catch (_) {
    /* 缓存写失败不影响本次响应 */
  }
}

const OFFLINE_BODY =
  '<!doctype html><meta charset="utf-8"><title>Fushi</title>' +
  '<style>body{font:16px/1.7 system-ui,sans-serif;max-width:32em;margin:18vh auto;padding:0 1.5em;color:#222}</style>' +
  '<h1>暂时连不上</h1><p>Cloudflare 与 GitHub 两条线路都没有响应，请检查网络后重试。</p>' +
  '<p>安装包可直接从 <a href="https://github.com/hajisensai/Fushi/releases/latest">GitHub Releases</a> 取。</p>';

function offlineResponse() {
  return new Response(OFFLINE_BODY, {
    status: 503,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/** 逐个来源尝试，成功即记住它；全挂才回落到缓存。 */
async function fetchWithFailover(request, isNavigation) {
  const origins = await orderedOrigins();
  let lastError = null;

  for (let i = 0; i < origins.length; i++) {
    const origin = origins[i];
    try {
      const res = await fetchFrom(origin, request);
      if (origin === self.location.origin) await clearState();
      else await writeState(origin);
      await putCache(request, res.clone());
      return res;
    } catch (err) {
      lastError = err;
    }
  }

  const cached = await caches.open(CACHE).then((c) => c.match(new Request(request.url)));
  if (cached) return cached;
  if (isNavigation) return offlineResponse();
  throw lastError || new Error('all origins failed');
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith('fushi-') && k !== CACHE && k !== STATE_CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'fushi-sw-unregister') {
    event.waitUntil(
      (async () => {
        await self.registration.unregister();
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k.startsWith('fushi-')).map((k) => caches.delete(k)));
      })(),
    );
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isNavigation = request.mode === 'navigate';

  // 只接管本站自己的资源；下载直链、第三方脚本一律放行。
  if (KNOWN_ORIGINS.indexOf(url.origin) === -1) return;
  // SW 自身与健康探针必须走真实网络，否则永远更新不掉。
  if (url.pathname === '/sw.js' || url.pathname === '/__health') return;

  const hashed = url.pathname.startsWith('/assets/');

  event.respondWith(
    (async () => {
      try {
        if (hashed) {
          const cache = await caches.open(CACHE);
          const hit = await cache.match(new Request(request.url));
          if (hit) return hit;
        }
        return await fetchWithFailover(request, isNavigation);
      } catch (_) {
        // 任何意料之外的失败都退回一次最普通的请求，绝不把用户卡死在 SW 里。
        try {
          return await fetch(request);
        } catch (_e) {
          return isNavigation ? offlineResponse() : Response.error();
        }
      }
    })(),
  );
});
