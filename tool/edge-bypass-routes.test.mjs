import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import {
  BYPASS_PATTERNS,
  WORKER_ONLY_PATHS,
  ZONE_NAME,
  patternMatchesPath,
  planRouteSync,
} from './edge-bypass-routes.mjs';

test('排除清单不盖住任何必须走 Worker 的路径', () => {
  for (const path of WORKER_ONLY_PATHS) {
    const hit = BYPASS_PATTERNS.filter((p) => patternMatchesPath(p, path));
    assert.deepEqual(hit, [], `${path} 被排除路由 ${hit.join(', ')} 盖住`);
  }
});

test('排除清单命中实际的静态资源路径', () => {
  for (const path of ['/assets/app.DluNi9Ct.js', '/demo/media/a.mp4', '/site.js', '/sw.js']) {
    assert.ok(
      BYPASS_PATTERNS.some((p) => patternMatchesPath(p, path)),
      `${path} 应当绕过 Worker`,
    );
  }
  assert.equal(patternMatchesPath(`${ZONE_NAME}/site.js`, '/site.jsx'), false);
});

test('排除清单都在本 zone 内、无重复，且通配符只出现在尾部', () => {
  assert.equal(new Set(BYPASS_PATTERNS).size, BYPASS_PATTERNS.length);
  for (const p of BYPASS_PATTERNS) {
    assert.ok(p.startsWith(`${ZONE_NAME}/`), p);
    assert.ok(!p.slice(0, -1).includes('*'), p);
  }
});

// public/ 下的文件改名或删掉时，清单里的旧条目会悄悄变成死路由；这里钉住它们还在。
// assets/、vp-icons.css、hashmap.json、sitemap.xml 是构建产物，探测路径不是站点文件。
const BUILD_OUTPUTS = new Set(['assets', 'vp-icons.css', 'hashmap.json', 'sitemap.xml']);
const PROBE_NOISE = new Set(['ping', 'generate_204']);

test('排除清单里的 public/ 条目在源码里真实存在', () => {
  for (const p of BYPASS_PATTERNS) {
    const name = p.slice(ZONE_NAME.length + 1).replace(/\/\*$/, '');
    if (BUILD_OUTPUTS.has(name) || PROBE_NOISE.has(name)) continue;
    assert.ok(existsSync(`public/${name}`), `public/${name} 不存在，排除路由已过期`);
  }
});

test('同步计划：缺的建、挂了脚本的摘掉、清单外的无脚本路由删掉、带脚本的主路由不动', () => {
  const existing = [
    { id: 'main', pattern: 'fushi.moe/*', script: 'fushi-moe-edge', request_limit_fail_open: true },
    { id: 'a', pattern: 'fushi.moe/assets/*', script: null },
    { id: 'b', pattern: 'fushi.moe/demo/*', script: 'fushi-moe-edge' },
    { id: 'old', pattern: 'fushi.moe/legacy/*', script: null },
    { id: 'other', pattern: 'rank.fushi.moe/*', script: null },
  ];
  const plan = planRouteSync(existing, ['fushi.moe/assets/*', 'fushi.moe/demo/*', 'fushi.moe/sw.js']);
  assert.deepEqual(plan.create, ['fushi.moe/sw.js']);
  assert.deepEqual(plan.detach.map((r) => r.id), ['b']);
  assert.deepEqual(plan.remove.map((r) => r.id), ['old']);
  assert.deepEqual(plan.failOpen, []);
});

test('挂脚本的主路由被 wrangler deploy 重建成 fail-closed 时改回 fail-open；别的 zone 不碰', () => {
  const existing = [
    { id: 'main', pattern: 'fushi.moe/*', script: 'fushi-moe-edge', request_limit_fail_open: false },
    { id: 'rank', pattern: 'rank.fushi.moe/*', script: 'fushi-leaderboard', request_limit_fail_open: false },
  ];
  const plan = planRouteSync(existing, []);
  assert.deepEqual(plan.failOpen.map((r) => r.id), ['main']);
});

test('同步计划幂等：已经一致时无任何变更', () => {
  const existing = BYPASS_PATTERNS.map((pattern, i) => ({ id: String(i), pattern, script: null }));
  existing.push({ id: 'main', pattern: 'fushi.moe/*', script: 'fushi-moe-edge', request_limit_fail_open: true });
  assert.deepEqual(planRouteSync(existing, BYPASS_PATTERNS), {
    create: [],
    detach: [],
    remove: [],
    failOpen: [],
  });
});
