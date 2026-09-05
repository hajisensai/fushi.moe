#!/usr/bin/env node
/*
 * 生成下载页的 17 个语言路由页：download.md（英文，默认路由）+ <prefix>/download.md。
 *
 * 页面本体是 .vitepress/theme/DownloadPage.vue；每个 .md 只做三件事：frontmatter 里放该语言的
 * 标题 / 描述 / og / hreflang（给不跑 JS 的链接预览爬虫），把该语言的字典整份 import 进来，
 * 挂组件。VitePress 按目录 locale 出 <html lang>，SSR 出来的 HTML 从头到尾就是该语言。
 * 别手改任何一页；改字典或组件后重跑：node tool/build_download_pages.mjs
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, PREFIX, routeFor, seoHead, yamlHead } from '../.vitepress/theme/lang-routes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const stripTags = (s) => String(s).replace(/<[^>]*>/g, '');

for (const code of LANGS) {
  const dict = JSON.parse(readFileSync(join(ROOT, 'public', 'i18n', code + '.json'), 'utf8'));
  for (const k of ['dl.title', 'dl.lead']) if (typeof dict[k] !== 'string') throw new Error(code + ': dictionary lacks ' + k);
  const title = dict['dl.title'];
  const description = stripTags(dict['dl.lead']);
  const up = PREFIX[code] ? '../' : './';
  const page = [
    '---',
    'title: ' + JSON.stringify(title),
    'description: ' + JSON.stringify(description),
    yamlHead(seoHead(code, '/download', { title, description, dyn: { title: '{dl.title} | Fushi', description: '{dl.lead}' } })),
    '---',
    '',
    '<!-- 生成文件（tool/build_download_pages.mjs），别手改；页面本体在 .vitepress/theme/DownloadPage.vue -->',
    '',
    '<script setup>',
    "import DownloadPage from '" + up + ".vitepress/theme/DownloadPage.vue'",
    "import dict from '" + up + 'public/i18n/' + code + ".json'",
    '</script>',
    '',
    '<DownloadPage lang="' + code + '" :dict="dict" />',
    '',
  ].join('\n');
  const rel = routeFor(code, '/download').slice(1) + '.md';
  mkdirSync(dirname(join(ROOT, rel)), { recursive: true });
  writeFileSync(join(ROOT, rel), page, 'utf8');
}
console.log('下载页语言路由：' + LANGS.length + ' 份');
