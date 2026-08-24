#!/usr/bin/env node
/*
 * 给构建产物打指纹，写进 dist/__build.json。
 *
 * 为什么需要它：两个来源必须是同一次构建的同一份产物。VitePress 的资源文件名
 * 带内容哈希，一旦两侧产物不一致，用户在切换瞬间就会拿 A 的 HTML 去请求
 * B 没有的资源，整页 404。Worker 的 /__health 会同时拉两侧的 __build.json 比对，
 * 让「两侧同步」这个不变式被持续监控，而不是靠祈祷。
 */

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, '..', '.vitepress', 'dist');
const OUT = join(DIST, '__build.json');

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

// 指纹要在写 __build.json 之前算完，否则它会把自己算进去、每次都不一样
const files = walk(DIST)
  .filter((p) => p !== OUT)
  // 用 path.sep 而不是反斜杠字面量：Windows 上分隔符不同，指纹必须与平台无关
  .map((p) => relative(DIST, p).split(sep).join('/'))
  .sort((a, b) => a.localeCompare(b));

/* 分隔符防止「文件名+内容」的拼接歧义：a/b + c 与 a + /bc 不能撞同一个指纹 */
const h = createHash('sha256');
for (const rel of files) {
  h.update(rel);
  h.update('\0');
  h.update(readFileSync(join(DIST, rel)));
  h.update('\0');
}

const payload = {
  fingerprint: h.digest('hex'),
  fileCount: files.length,
  commit: process.env.GITHUB_SHA ?? 'local',
  ref: process.env.GITHUB_REF_NAME ?? 'local',
  builtAt: process.env.SOURCE_DATE_EPOCH
    ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
    : new Date().toISOString(),
};

writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log('构建指纹 ' + payload.fingerprint.slice(0, 16) + '…  文件数 ' + payload.fileCount);
