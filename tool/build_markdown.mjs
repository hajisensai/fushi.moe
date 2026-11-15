/*
 * 构建后给 dist 里每个 HTML 页面写一份同名的 Markdown 副本（/download → download.md，/ → index.md，
 * /faq/anki.en → faq/anki.en.md）。边缘 Worker（edge/src/agent.ts）在请求带 `Accept: text/markdown`
 * 时回这份副本——AI 助手 / agent 读 Markdown 比读带页壳的 HTML 省得多（Cloudflare「Markdown for Agents」
 * 同一个约定：https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/）。
 *
 * 取已渲染的 HTML 来转，而不是各页的 .md 源文件：下载页 / 沉浸页是 Vue 组件渲染的、首页是手写 HTML、
 * 17 种语言是构建时烤的，只有产物里才是访客真正看到的文字。正文取 <article class="…prose…">；
 * 首页没有它，取 <body> 去掉顶栏 / 底栏 / 脚本 / 交互 demo。站内链接改成绝对地址，离开本站也能用。
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { SITE } from '../.vitepress/theme/lang-routes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, '..', '.vitepress', 'dist');

/** 不是页面的 HTML：404 页，以及首页 demo / 预览 / 概览目录下的素材。 */
const SKIP = /^(404\.html|demo\/|preview\/|overview\/)/;

/** @param {string} dir @param {string[]} [acc] @returns {string[]} dir 下全部文件的绝对路径 */
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

/** @param {string} s HTML 属性值或文本 @returns {string} 还原常见实体 */
const unescapeHtml = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** @param {string} html @param {RegExp} re 第一个捕获组是要取的值 @returns {string} */
const pick = (html, re) => {
  const m = re.exec(html);
  return m ? unescapeHtml(m[1]).trim() : '';
};

/**
 * dist 里的相对路径 → 页面的规范地址（cleanUrls：去 .html，index 收成目录）。
 * @param {string} rel 如 `zh-cn/index.html`、`faq/anki.en.html`
 * @returns {string}
 */
export function pageUrl(rel) {
  const p = rel.replace(/\.html$/, '');
  if (p === 'index') return SITE + '/';
  return SITE + '/' + (p.endsWith('/index') ? p.slice(0, -'index'.length) : p);
}

/** @returns {TurndownService} 配好规则的转换器 */
function converter() {
  const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', emDelimiter: '*' });
  td.use(gfm);
  // 不是正文的东西：脚本样式、图标、表单控件、页壳导航、首页各节的交互 demo 舞台（.stage：播放器、模拟下载列表等只在浏览器里有意义的标记）。
  td.remove(['script', 'style', 'title', 'noscript', 'template', 'svg', 'iframe', 'video', 'audio', 'button', 'input', 'select', 'dialog']);
  td.remove((node) => {
    const cls = ' ' + (node.getAttribute && node.getAttribute('class') || '') + ' ';
    if (/ (site-nav|site-footer|faq-side|stage|mediaload) /.test(cls)) return true;
    return Boolean(node.getAttribute && (node.getAttribute('aria-hidden') === 'true' || node.hasAttribute('hidden')));
  });
  // 站内链接 / 图片改成绝对地址；锚点与外链原样。
  const abs = (href) => (href && href.startsWith('/') && !href.startsWith('//') ? SITE + href : href);
  td.addRule('absLink', {
    filter: (node) => node.nodeName === 'A' && Boolean(node.getAttribute('href')),
    replacement: (content, node) => {
      const text = content.replace(/\s+/g, ' ').trim();
      // VitePress 给每个标题挂的 "​" 锚点链接没有可读文字，丢掉。
      if (!text || text === '​' || /header-anchor/.test(node.getAttribute('class') || '')) return '';
      return '[' + text + '](' + abs(node.getAttribute('href')) + ')';
    },
  });
  td.addRule('absImage', {
    filter: 'img',
    replacement: (_c, node) => {
      const src = node.getAttribute('src');
      const alt = (node.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
      return src && alt ? '![' + alt + '](' + abs(src) + ')' : '';
    },
  });
  return td;
}

/** YAML 双引号标量。 */
const yaml = (s) => JSON.stringify(String(s));

/**
 * 一页 HTML → Markdown（带 title / description / url / lang 的 frontmatter）。
 * @param {string} html 完整页面
 * @param {string} url 规范地址
 * @param {TurndownService} [td]
 * @returns {string}
 */
export function htmlToMarkdown(html, url, td = converter()) {
  const title = pick(html, /<title>([\s\S]*?)<\/title>/);
  const description = pick(html, /<meta name="description" content="([^"]*)"/);
  const lang = pick(html, /<html[^>]*\blang="([^"]*)"/);
  const article = /<article\b[^>]*\bclass="[^"]*\bprose\b[^"]*"[^>]*>[\s\S]*<\/article>/.exec(html);
  const body = /<body[^>]*>([\s\S]*)<\/body>/.exec(html);
  const source = article ? article[0] : body ? body[1] : html;
  let md = td.turndown(source).replace(/​/g, '').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
  // 正文自己没有一级标题（首页的 hero 是图 + 标语）时，用页面标题补一个。
  if (title && !/^# /m.test(md)) md = '# ' + title + '\n\n' + md;
  const fm = ['---', 'title: ' + yaml(title), ...(description ? ['description: ' + yaml(description)] : []),
    'url: ' + url, ...(lang ? ['lang: ' + lang] : []), '---'];
  return fm.join('\n') + '\n\n' + md + '\n';
}

export function main() {
  const td = converter();
  const pages = walk(DIST)
    .map((p) => relative(DIST, p).split(sep).join('/'))
    .filter((rel) => rel.endsWith('.html') && !SKIP.test(rel))
    .sort((a, b) => a.localeCompare(b));
  let bytes = 0;
  for (const rel of pages) {
    const md = htmlToMarkdown(readFileSync(join(DIST, rel), 'utf8'), pageUrl(rel), td);
    // 转出来几乎是空的，说明页面结构变了、正文没取到——宁可构建失败，也不给 agent 发空页。
    if (md.length < 300) throw new Error(rel + ': markdown twin is nearly empty (' + md.length + ' chars)');
    writeFileSync(join(DIST, rel.replace(/\.html$/, '.md')), md, 'utf8');
    bytes += Buffer.byteLength(md);
  }
  console.log('Markdown 副本：' + pages.length + ' 页，共 ' + Math.round(bytes / 1024) + ' KB');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
