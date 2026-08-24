import assert from 'node:assert/strict';
import { test } from 'node:test';
import { join, resolve } from 'node:path';
import { resolveStaticPath } from './static-path.mjs';

const ROOT = resolve('fixture-root');

test('普通路径与首页都落在静态根内', () => {
  assert.equal(resolveStaticPath(ROOT, '/'), join(ROOT, 'index.html'));
  assert.equal(resolveStaticPath(ROOT, '/assets/app.js'), join(ROOT, 'assets', 'app.js'));
});

test('拒绝目录穿越、坏编码和 NUL', () => {
  assert.equal(resolveStaticPath(ROOT, '/../secret'), null);
  assert.equal(resolveStaticPath(ROOT, '/%2e%2e/secret'), null);
  assert.equal(resolveStaticPath(ROOT, '/%E0%A4%A'), null);
  assert.equal(resolveStaticPath(ROOT, '/bad%00name'), null);
});

test('项目站 base path 必须匹配且会被正确剥掉', () => {
  assert.equal(
    resolveStaticPath(ROOT, '/fushi.moe/assets/app.js', '/fushi.moe'),
    join(ROOT, 'assets', 'app.js'),
  );
  assert.equal(resolveStaticPath(ROOT, '/assets/app.js', '/fushi.moe'), null);
});
