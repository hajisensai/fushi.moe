#!/usr/bin/env node
/*
 * 把首页里体积最大的纯数据常量抽成独立 JSON，改成到达后原地填充。
 *
 * 为什么能零改动下游：每个大常量都只有「一处声明 + 一处别名引用」
 * （const TERMMAP = FUSHI_TERMMAP），别名持有的是同一个对象引用。
 * 所以声明处换成空对象、数据到达后 Object.assign 填进去，
 * 所有同步调用点 TERMMAP[key] 一行都不用改。
 *
 * 唯一要处理的副作用：数据到达前查词会落到「未收录」提示上，
 * 那是假话。所以把那句 toast 换成能区分「加载中 / 加载失败 / 真的没收录」
 * 的三态提示。
 *
 * 幂等：已经拆过就直接跳过。
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const HTML_PATH = join(ROOT, 'public', 'index.html');
const DATA_DIR = join(ROOT, 'public', 'demo', 'data');

/** 数据到达前那句「未收录」是假话，换成三态提示。 */
const MISS_TOAST = "toast('演示词库未收录——App 内可查完整词典')";
const MISS_CALL = 'fushiTermMiss(toast)';

const LOADER = `
/* --- 演示词库改为异步加载（见 tool/split-demo-data.mjs） --- */
const FUSHI_DEMO_DATA = { termmapReady: false, termmapFailed: false };
FUSHI_DEMO_DATA.termmapPromise = fetch('/demo/data/termmap.json')
  .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then(function (d) {
    /* 原地填充：下游 const TERMMAP = FUSHI_TERMMAP 持有的是同一个引用 */
    Object.assign(FUSHI_TERMMAP, d);
    FUSHI_DEMO_DATA.termmapReady = true;
    document.documentElement.removeAttribute('data-demo-loading');
  })
  .catch(function () {
    FUSHI_DEMO_DATA.termmapFailed = true;
    document.documentElement.removeAttribute('data-demo-loading');
  });
/* toast 定义在页面自己的 IIFE 作用域里，这个函数是全局的——
   必须把 toast 当参数传进来，否则调用时按作用域链找不到它。 */
function fushiTermMiss(toast) {
  if (FUSHI_DEMO_DATA.termmapFailed) { toast('演示词库加载失败，刷新页面重试'); return; }
  if (!FUSHI_DEMO_DATA.termmapReady) { toast('演示词库加载中，请稍候…'); return; }
  toast('演示词库未收录——App 内可查完整词典');
}
`;

function human(n) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(2) + ' MB';
}

function findLiteral(html, name) {
  const decl = new RegExp('\\bconst\\s+' + name + '\\s*=\\s*');
  const m = decl.exec(html);
  if (!m) return null;
  const start = m.index + m[0].length;
  // 用括号配平找到字面量结尾，字符串内的括号不计。
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (c === String.fromCharCode(92)) {
      esc = true;
      continue;
    }
    if (c === '"') {
      inStr = !inStr;
      continue;
    }
    if (inStr) continue;
    if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') {
      depth--;
      if (depth === 0) return { declStart: m.index, start, end: i + 1 };
    }
  }
  return null;
}

function main() {
  let html = readFileSync(HTML_PATH, 'utf8');
  const before = Buffer.byteLength(html, 'utf8');
  const beforeGz = gzipSync(Buffer.from(html, 'utf8'), { level: 9 }).length;

  if (html.includes('FUSHI_DEMO_DATA')) {
    console.log('已经拆过（检测到 FUSHI_DEMO_DATA），跳过');
    return;
  }

  // 顺序要紧：必须先改调用点，再注入 loader。
  // 反过来的话，loader 里 fushiTermMiss 自己那句 toast 也会被换成
  // fushiTermMiss(toast)，变成无条件自递归、一点词就爆栈。
  const missCount = html.split(MISS_TOAST).length - 1;
  if (missCount === 0) {
    throw new Error('没找到未收录提示，拆分会导致加载期间误报「未收录」，中止');
  }
  html = html.split(MISS_TOAST).join(MISS_CALL);

  const loc = findLiteral(html, 'FUSHI_TERMMAP');
  if (!loc) throw new Error('找不到 FUSHI_TERMMAP 声明');

  const literal = html.slice(loc.start, loc.end);
  const parsed = JSON.parse(literal);
  const keys = Object.keys(parsed).length;

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const jsonPath = join(DATA_DIR, 'termmap.json');
  writeFileSync(jsonPath, literal, 'utf8');

  // 声明换成空对象，并在其后插入加载器
  html = html.slice(0, loc.start) + '{}' + LOADER + html.slice(loc.end);

  writeFileSync(HTML_PATH, html, 'utf8');

  const after = Buffer.byteLength(html, 'utf8');
  const afterGz = gzipSync(Buffer.from(html, 'utf8'), { level: 9 }).length;
  const dataGz = gzipSync(Buffer.from(literal, 'utf8'), { level: 9 }).length;

  console.log('抽出 FUSHI_TERMMAP -> public/demo/data/termmap.json');
  console.log('  词条键数: ' + keys);
  console.log('  数据文件: ' + human(Buffer.byteLength(literal, 'utf8')) + '（gzip ' + human(dataGz) + '，按需加载）');
  console.log('  改写未收录提示: ' + missCount + ' 处 -> 三态（加载中/加载失败/真未收录）');
  console.log('  index.html: ' + human(before) + ' -> ' + human(after));
  console.log('  首屏 gzip: ' + human(beforeGz) + ' -> ' + human(afterGz));
}

main();
