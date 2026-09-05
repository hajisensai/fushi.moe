#!/usr/bin/env node
/*
 * 构建后把手写静态首页烤成 17 种语言各一份：
 *   dist/index.html（英文，默认路由）+ dist/<prefix>/index.html（其余 16 种）。
 *
 * 首页源文件 public/index.html 是简体中文（作者语言 = 字典源语言），VitePress 原样拷进 dist。
 * 这里读它一次当模板，按各语言字典做 site.js 在浏览器里做的同一套替换
 * （data-i18n → innerHTML、data-i18n-attr → 属性、站内链接 → 该语言路由、<html lang>/dir、
 * <title>/description），再补 canonical / og / hreflang 给不跑 JS 的链接预览爬虫。
 * 页面里内联脚本用 T('key') 取的文案（demo 卡片按钮、toast）也内联进页面，
 * 这样同语言访客不用再拉一份字典。
 *
 * VitePress 页（下载页 / 沉浸页）不走这里：它们每种语言各有一份 .md，SSR 时就是该语言。
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, NAMES, PREFIX, RTL, htmlHead, localizeHref, seoHead } from '../.vitepress/theme/lang-routes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, '..', '.vitepress', 'dist');
const I18N = join(HERE, '..', 'public', 'i18n');

const escAttr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escText = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const stripTags = (s) => String(s).replace(/<[^>]*>/g, '');

/** <script>…</script> 的区间：里面的标记只是 JS 字符串，替换必须绕开。 */
function scriptRanges(html) {
  const out = [];
  const re = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
  for (let m; (m = re.exec(html));) out.push([m.index, m.index + m[0].length]);
  return out;
}
const inScript = (ranges, i) => ranges.some(([a, b]) => i >= a && i < b);

/** 从起始标签末尾找同名元素的闭合标签起点（同名嵌套按深度配对）。 */
function closeTagIndex(html, tag, from) {
  const re = new RegExp('<(/?)' + tag + '\\b[^>]*?(/?)>', 'gi');
  re.lastIndex = from;
  let depth = 1;
  for (let m; (m = re.exec(html));) {
    if (m[2] === '/') continue;
    depth += m[1] === '/' ? -1 : 1;
    if (depth === 0) return m.index;
  }
  throw new Error('unclosed <' + tag + '> at ' + from);
}

/** data-i18n="key"：把元素 innerHTML 换成字典值（字典值可含内联标记，全是本仓库自己的文件）。 */
function applyText(html, dict) {
  const ranges = scriptRanges(html);
  const re = /<([a-zA-Z][\w-]*)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>/g;
  const edits = [];
  for (let m; (m = re.exec(html));) {
    if (inScript(ranges, m.index)) continue;
    const value = dict[m[2]];
    if (typeof value !== 'string') continue;
    const start = m.index + m[0].length;
    edits.push([start, closeTagIndex(html, m[1], start), value]);
  }
  return splice(html, edits);
}

/** data-i18n-attr="a=key;b=key"：改起始标签上的属性。 */
function applyAttrs(html, dict) {
  const ranges = scriptRanges(html);
  const re = /<[a-zA-Z][\w-]*\b[^>]*\sdata-i18n-attr="([^"]+)"[^>]*>/g;
  const edits = [];
  for (let m; (m = re.exec(html));) {
    if (inScript(ranges, m.index)) continue;
    let tag = m[0];
    for (const pair of m[1].split(';')) {
      const eq = pair.indexOf('=');
      if (eq < 0) continue;
      const attr = pair.slice(0, eq).trim();
      const value = dict[pair.slice(eq + 1).trim()];
      if (typeof value !== 'string') continue;
      tag = setAttr(tag, attr, value);
    }
    if (tag !== m[0]) edits.push([m.index, m.index + m[0].length, tag]);
  }
  return splice(html, edits);
}

function setAttr(tag, attr, value) {
  const re = new RegExp('(\\s' + attr + '=")[^"]*(")');
  if (re.test(tag)) return tag.replace(re, '$1' + escAttr(value) + '$2');
  return tag.replace(/\s*\/?>$/, (end) => ' ' + attr + '="' + escAttr(value) + '"' + end);
}

/** 站内 <a href> 指到该语言的页面。 */
function applyLinks(html, code) {
  const ranges = scriptRanges(html);
  const re = /<a\b[^>]*\shref="(\/[^"]*)"[^>]*>/g;
  const edits = [];
  for (let m; (m = re.exec(html));) {
    if (inScript(ranges, m.index)) continue;
    const to = localizeHref(m[1], code);
    if (to !== m[1]) edits.push([m.index, m.index + m[0].length, setAttr(m[0], 'href', to)]);
  }
  return splice(html, edits);
}

/** 从后往前替换，前面的区间不受后面长度变化影响。 */
function splice(html, edits) {
  let out = html;
  for (const [a, b, v] of edits.sort((x, y) => y[0] - x[0])) out = out.slice(0, a) + v + out.slice(b);
  return out;
}

const once = (s, re, to, what) => {
  const n = (s.match(new RegExp(re.source, 'g')) || []).length;
  if (n !== 1) throw new Error(what + ': expected exactly one match, got ' + n);
  return s.replace(re, to);
};

/** 内联脚本 T('key', zh) 用到的键：随页面内联，同语言访客不必再拉整份字典。 */
function inlineKeys(html) {
  const keys = new Set();
  for (const m of html.matchAll(/\bT\('([\w.]+)'/g)) keys.add(m[1]);
  return [...keys].sort();
}

/**
 * @param {string} template 简体中文模板（public/index.html 的内容）
 * @param {Record<string, string>} dict 目标语言字典
 * @param {string} code 目标语言
 * @returns {string}
 */
export function renderHome(template, dict, code) {
  for (const k of ['meta.title', 'meta.description']) if (typeof dict[k] !== 'string') throw new Error(code + ': dictionary lacks ' + k);
  // <head> 单独处理：正文的内联脚本里嵌着 demo 文档（<html>、<title>、</head> 都有），不能整页匹配。
  // 首页省略了 </head>，head 到顶栏 <nav> 为止。
  const headEnd = Math.min(...['</head>', '\n<nav'].map((s) => template.indexOf(s)).filter((i) => i >= 0));
  if (!isFinite(headEnd)) throw new Error('cannot find end of <head>');
  let head = template.slice(0, headEnd);
  head = once(head, /<html\b[^>]*>/, '<html lang="' + code + '" dir="' + (RTL[code] ? 'rtl' : 'ltr') + '">', 'html tag');
  head = once(head, /<title>[^<]*<\/title>/, '<title>' + escText(dict['meta.title']) + '</title>', 'title');
  head = once(head, /(<meta name="description" content=")[^"]*(")/, '$1' + escAttr(dict['meta.description']) + '$2', 'description');
  const seo = htmlHead(seoHead(code, '/', {
    title: dict['meta.title'], description: stripTags(dict['meta.description']),
    dyn: { title: '{meta.title}', description: '{meta.description}' },
  }));
  const inline = {};
  for (const k of inlineKeys(template)) if (typeof dict[k] === 'string') inline[k] = dict[k];
  const dictTag = '<script id="fushi-dict" type="application/json">' + JSON.stringify(inline).replace(/<\//g, '<\\/') + '</script>';
  head = once(head, /<script src="\/site\.js"><\/script>/, seo + '\n' + dictTag + '\n$&', 'site.js tag');

  let html = head + template.slice(headEnd);
  // 语言菜单按钮上的当前语言名（site.js 装好后也会同步，这里烤好让不跑 JS 时也对）
  html = once(html, /<span class="site-nav-lang-current">[^<]*<\/span>/, '<span class="site-nav-lang-current">' + escText(NAMES[code]) + '</span>', 'lang current');
  html = once(html, /<span class="site-nav-lang-sub">[^<]*<\/span>/, '<span class="site-nav-lang-sub">' + escText(NAMES[code]) + '</span>', 'lang auto sub');
  html = applyText(html, dict);
  html = applyAttrs(html, dict);
  html = applyLinks(html, code);
  return html;
}

export function main() {
  const template = readFileSync(join(DIST, 'index.html'), 'utf8');
  if (!/<html lang="zh-CN">/.test(template)) throw new Error('dist/index.html is not the zh-CN source template; already rendered?');
  const dicts = Object.fromEntries(LANGS.map((c) => [c, JSON.parse(readFileSync(join(I18N, c + '.json'), 'utf8'))]));
  for (const code of LANGS) {
    const dir = join(DIST, ...(PREFIX[code] ? [PREFIX[code].slice(1)] : []));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), renderHome(template, dicts[code], code), 'utf8');
  }
  console.log('首页语言路由：' + LANGS.length + ' 份（默认 ' + LANGS.filter((c) => !PREFIX[c]).join(',') + '）');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
