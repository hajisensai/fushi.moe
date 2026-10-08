#!/usr/bin/env node

import { existsSync } from 'node:fs';

const TIMEOUT_MS = 20_000;

async function request(url, { json = false, redirect = 'follow', logBody = false } = {}) {
  const response = await fetch(url, {
    redirect,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': 'fushi-moe-production-verify' },
  });
  const text = json ? await response.text() : '';
  let body = null;
  if (json && text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { unparsed: text.slice(0, 500) };
    }
  }
  console.log(`${response.status} ${url} -> ${response.url}`);
  if (json && logBody) console.log(JSON.stringify(body, null, 2));
  return { response, body };
}

function check(ok, message) {
  if (!ok) throw new Error(message);
  console.log(`PASS ${message}`);
}

const health = await request('https://fushi.moe/__health', { json: true, logBody: true });
check(health.response.ok && health.body?.ok === true, '/__health 正常');
check(health.body?.inSync === true, 'Worker 探测的两侧构建指纹一致');
check(health.body?.mirror?.bound === true, '应用安装包 R2 binding 已连接');
check(
  health.body?.githubManifest?.source === 'update-manifest/latest-stable-fushi.json',
  '最新版本清单使用 GitHub 静态 update-manifest',
);

const home = await request('https://fushi.moe/');
check(home.response.ok, '主站返回 2xx');

const packOrigin = await request(
  'https://github.com/hajisensai/fushi-pack/releases/latest/download/manifest.json',
  { json: true },
);
check(packOrigin.response.ok, 'GitHub Runner 可直取推荐包 manifest 资产');

const pack = await request('https://fushi.moe/pack/manifest.json', { json: true });
check(pack.response.ok && Array.isArray(pack.body?.parts) && pack.body.parts.length > 0,
  '/pack/manifest.json 含推荐包分片');

const releases = await request('https://fushi.moe/releases/api/latest', { json: true });
const slots = releases.body?.slots && Object.values(releases.body.slots).filter(Boolean);
check(releases.response.ok && Array.isArray(slots) && slots.length > 0,
  '/releases/api/latest 含应用安装包槽位');

// 站内下载计数（Durable Object）必须在线：这是硬门。GitHub 那半靠共享出口 IP 打 api.github.com，
// 第一次部署还没有陈旧副本时可能随机 403，只报不拦——它不是这次部署能决定的事。
const downloads = await request('https://fushi.moe/api/downloads', { json: true, logBody: true });
check(
  downloads.response.ok && typeof downloads.body?.site?.total === 'number',
  '/api/downloads 站内下载计数（Durable Object）在线',
);
if (typeof downloads.body?.total === 'number') {
  console.log(`PASS /api/downloads 可显示的累计下载数：${downloads.body.total}${downloads.body.stale ? '（GitHub 侧为陈旧副本）' : ''}`);
} else {
  console.log('WARN /api/downloads 暂无 GitHub 侧计数（api.github.com 未取到且无陈旧副本），页面此时不显示下载数；稍后自动恢复。');
}

const primaryBuild = await request('https://fushi.moe/__build.json', { json: true });
const cfBuild = await request('https://fushi-moe.pages.dev/__build.json', { json: true });
check(
  primaryBuild.response.ok &&
    cfBuild.response.ok &&
    primaryBuild.body?.fingerprint === cfBuild.body?.fingerprint,
  '主域与 Cloudflare Pages 构建指纹一致',
);

if (existsSync('CNAME')) {
  console.log('CNAME 仍在：GitHub Pages 独立 200 严格检查留到释放自定义域后的部署。');
} else {
  const ghBuild = await request('https://hajisensai.github.io/fushi.moe/__build.json', {
    json: true,
    redirect: 'manual',
  });
  check(ghBuild.response.status === 200, 'GitHub Pages 项目站独立返回 200（无主域重定向）');
  check(
    ghBuild.body?.fingerprint === cfBuild.body?.fingerprint,
    'Cloudflare Pages 与 GitHub Pages 构建指纹一致',
  );
}
