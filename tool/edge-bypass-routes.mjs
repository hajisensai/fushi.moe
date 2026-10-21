#!/usr/bin/env node
/**
 * 让纯静态资源绕过边缘 Worker，直接由 DNS 背后的 Cloudflare Pages 出。
 *
 * 为什么：`fushi.moe/*` 这条 Worker Route 会把每个请求都算一次 Worker 调用，而 Workers
 * Free 是**整个账户**每天 10 万次（rank.fushi.moe 等同账户 Worker 共用）。首页一次浏览
 * 要拉 30–40 个资源，且 Pages 给它们的是 `max-age=0, must-revalidate`，每次回访都逐个
 * 304 再验证——2026-10-21 实测 fushi-moe-edge 一天 7.8 万次调用里 68% 是这些静态文件，
 * 账户当天撞了 75% 告警。Pages 的静态请求不计费也不限量，所以把它们交给 Pages。
 *
 * 做法：Cloudflare 对同一 URL 取**最具体**的 Route；给下面这些路径各建一条**不挂脚本**
 * 的 Route，请求就跳过 Worker 直达 origin（fushi.moe 是 Pages 项目的自定义域）。
 * wrangler.toml 写不了不挂脚本的 Route，所以由本脚本按清单幂等同步，部署 workflow
 * 在 `wrangler deploy` 之后调用。
 *
 * 代价（docs/failover.md「静态资源绕过 Worker」）：这些路径不再享受 Worker 的
 * 「CF Pages 坏了回源 GitHub」与陈旧兜底；回访用户仍有 Service Worker 那层切换。
 * HTML 页面、/releases、/pack、/api、/__health 继续走 Worker。
 *
 * 用法：CLOUDFLARE_API_TOKEN=… node tool/edge-bypass-routes.mjs [--dry-run]
 */

import { pathToFileURL } from 'node:url';

export const ZONE_NAME = 'fushi.moe';

/** 不挂脚本的 Route 清单（唯一真相源）。改动后部署 workflow 自动增删。 */
export const BYPASS_PATTERNS = Object.freeze([
  // 目录：VitePress 带哈希的产物、首页 demo 素材、预览视频与海报、概览截图、界面字典。
  'fushi.moe/assets/*',
  'fushi.moe/demo/*',
  'fushi.moe/preview/*',
  'fushi.moe/overview/*',
  'fushi.moe/i18n/*',
  // 根目录单文件（不带通配符的 Route 只匹配这一个路径）。
  'fushi.moe/fushi-icon.png',
  'fushi.moe/site.js',
  'fushi.moe/chrome.css',
  'fushi.moe/sw-register.js',
  'fushi.moe/sw.js',
  'fushi.moe/vp-icons.css',
  'fushi.moe/hashmap.json',
  'fushi.moe/robots.txt',
  'fushi.moe/sitemap.xml',
  // 来路不明的空 UA 连通性探测（站点没有这两个路径，一天约 1800 次 404），
  // 交给 Pages 回 404，不再白占 Worker 调用。
  'fushi.moe/ping',
  'fushi.moe/generate_204',
]);

/** 必须留在 Worker 上的路径：清单里任何一条都不许盖住它们。 */
export const WORKER_ONLY_PATHS = Object.freeze([
  '/',
  '/__health',
  '/__build.json',
  '/releases',
  '/releases/api/latest',
  '/pack/manifest.json',
  '/api/stars',
  '/api/downloads',
  '/zh-cn/',
  '/download',
]);

/**
 * 按 Cloudflare Route 语义判断 pattern 是否命中某个 path（只处理本清单用到的形态：
 * 尾部 `/*` 前缀匹配或精确路径；主机名固定为 ZONE_NAME）。
 */
export function patternMatchesPath(pattern, path) {
  const prefix = ZONE_NAME;
  if (!pattern.startsWith(prefix + '/')) return false;
  const rest = pattern.slice(prefix.length);
  if (rest.endsWith('*')) return path.startsWith(rest.slice(0, -1));
  return path === rest;
}

/**
 * 根据现有 Route 算出要做的变更。只管理**不挂脚本**的 Route；挂了脚本的
 * （`fushi.moe/*` → fushi-moe-edge 等）一律不动，除非它的 pattern 正好在清单里，
 * 那说明有人手工把排除路由挂回了脚本，改回不挂脚本。
 *
 * @param {ReadonlyArray<{id: string, pattern: string, script?: string | null}>} existing
 * @param {ReadonlyArray<string>} desired
 */
export function planRouteSync(existing, desired) {
  const want = new Set(desired);
  const byPattern = new Map(existing.map((r) => [r.pattern, r]));
  const create = [];
  const detach = [];
  const remove = [];
  for (const pattern of desired) {
    const route = byPattern.get(pattern);
    if (!route) create.push(pattern);
    else if (route.script) detach.push(route);
  }
  for (const route of existing) {
    if (route.script) continue;
    if (!route.pattern.startsWith(ZONE_NAME + '/')) continue;
    if (!want.has(route.pattern)) remove.push(route);
  }
  return { create, detach, remove };
}

async function cf(token, method, path, body) {
  const res = await fetch('https://api.cloudflare.com/client/v4' + path, {
    method,
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json?.errors ?? json)}`);
  }
  return json.result;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error('缺少 CLOUDFLARE_API_TOKEN');

  const zones = await cf(token, 'GET', `/zones?name=${ZONE_NAME}`);
  const zoneId = zones[0]?.id;
  if (!zoneId) throw new Error(`找不到 zone ${ZONE_NAME}`);

  const existing = await cf(token, 'GET', `/zones/${zoneId}/workers/routes`);
  const plan = planRouteSync(existing, BYPASS_PATTERNS);
  console.log(
    `bypass routes: create ${plan.create.length}, detach ${plan.detach.length}, remove ${plan.remove.length}` +
      (dryRun ? ' (dry run)' : ''),
  );
  for (const pattern of plan.create) {
    console.log(`  + ${pattern}`);
    if (!dryRun) await cf(token, 'POST', `/zones/${zoneId}/workers/routes`, { pattern });
  }
  for (const route of plan.detach) {
    console.log(`  ~ ${route.pattern} (was ${route.script})`);
    if (!dryRun) {
      await cf(token, 'PUT', `/zones/${zoneId}/workers/routes/${route.id}`, {
        pattern: route.pattern,
      });
    }
  }
  for (const route of plan.remove) {
    console.log(`  - ${route.pattern}`);
    if (!dryRun) await cf(token, 'DELETE', `/zones/${zoneId}/workers/routes/${route.id}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
