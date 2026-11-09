/*
 * 构建后写 dist/llms.txt（AI 搜索 / 问答助手的站点导读，格式见 https://llmstxt.org）。
 * 内容由 tool/seo.mjs 的 llmsTxt 拼：英文首页描述、主要页面（frontmatter 的 title / description）、
 * 全部非草稿常见问题。写完核对里面每个站内链接在 dist 里都有 HTML，防止把 AI 指向 404。
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../.vitepress/theme/lang-routes.mjs';
import { readFaqArticles } from './build_sitemap.mjs';
import { llmsTxt } from './seo.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DIST = join(ROOT, '.vitepress', 'dist');

/** 页面 .md 的 frontmatter 里双引号或裸写的 title / description。 */
function pageMeta(file) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(join(ROOT, file), 'utf8'));
  const get = (key) => {
    const m = new RegExp('^' + key + ':\\s*(.*?)\\s*$', 'm').exec(fm ? fm[1] : '');
    if (!m) throw new Error(file + ': frontmatter missing ' + key);
    return m[1].startsWith('"') ? String(JSON.parse(m[1])) : m[1];
  };
  return { title: get('title'), description: get('description') };
}

/** @param {string} url 站内绝对地址 @returns {boolean} dist 里有没有对应的 HTML */
const builtPage = (url) => {
  const p = decodeURI(new URL(url).pathname);
  return existsSync(join(DIST, p.endsWith('/') ? p + 'index.html' : p + '.html'));
};

export function main() {
  const en = JSON.parse(readFileSync(join(ROOT, 'public', 'i18n', 'en.json'), 'utf8'));
  const pages = [
    { title: 'Home', url: SITE + '/', description: en['meta.title'] },
    { url: SITE + '/download', ...pageMeta('download.md') },
    { url: SITE + '/immersion', ...pageMeta('immersion.md') },
    { url: SITE + '/faq', ...pageMeta('faq.md') },
    { url: SITE + '/privacy', ...pageMeta('privacy.md') },
  ];
  const txt = llmsTxt({ description: en['meta.description'], pages, articles: readFaqArticles() });
  const links = [...txt.matchAll(/\]\((https:\/\/fushi\.moe\/[^)]*)\)/g)].map((m) => m[1]);
  const missing = links.filter((u) => !/\.(xml|txt)$/.test(u) && !builtPage(u));
  if (missing.length) throw new Error('llms.txt links to pages that were not built:\n  ' + missing.join('\n  '));
  writeFileSync(join(DIST, 'llms.txt'), txt, 'utf8');
  console.log('llms.txt：' + links.length + ' 个链接');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
