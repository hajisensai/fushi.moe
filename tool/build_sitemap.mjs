/*
 * 构建后写 dist/sitemap.xml（public/robots.txt 里的 Sitemap 行指向它）。
 *
 * 收录：三个语言路由页 × 17 种语言（每条带全部 hreflang）、常见问题列表、隐私页，
 * 以及每篇不是草稿的常见问题文章（同 slug 的各语言版本互挂 hreflang，lastmod 取 frontmatter date）。
 * 地址从源文件推出来而不是扫 dist：dist 里还有 404、资源目录、VitePress 的 hashmap，扫出来要再滤一遍。
 * 写完会核对每条地址在 dist 里都有对应的 HTML，防止 sitemap 指向不存在的页。
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../.vitepress/theme/lang-routes.mjs';
import { FAQ_LANGS, faqEntries, langRouteEntries, sitemapXml } from './seo.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DIST = join(ROOT, '.vitepress', 'dist');

/** frontmatter 里双引号写法的字符串值（本仓库 title / description 一律这么写，tool/seo.test.mjs 守）。 */
const quoted = (body, key) => {
  const m = new RegExp('^' + key + ':\\s*(".*")\\s*$', 'm').exec(body);
  return m ? String(JSON.parse(m[1])) : '';
};

/** faq/<slug>.md / faq/<slug>.<lang>.md → { slug, lang, date, draft, title, description, category, order }。 */
export function readFaqArticles(dir = join(ROOT, 'faq')) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const m = /^([a-z0-9-]+)(?:\.([A-Za-z-]+))?\.md$/.exec(name);
    if (!m) continue;
    const lang = m[2] || 'zh-CN';
    if (!FAQ_LANGS.includes(lang)) throw new Error('faq/' + name + ': unknown article language ' + lang);
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(join(dir, name), 'utf8'));
    const body = fm ? fm[1] : '';
    const date = (/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m.exec(body) || [])[1] || '';
    const draft = /^draft:\s*true\s*$/m.test(body);
    const order = Number((/^order:\s*(-?\d+(?:\.\d+)?)\s*$/m.exec(body) || [])[1] ?? Infinity);
    out.push({
      slug: m[1], lang, date, draft, title: quoted(body, 'title'), description: quoted(body, 'description'),
      category: quoted(body, 'category'), order,
    });
  }
  return out;
}

/** 地址 → dist 里对应的文件（cleanUrls：/x → x.html，/x/ → x/index.html）。 */
const distFileOf = (loc) => {
  const p = decodeURI(new URL(loc).pathname);
  return join(DIST, p.endsWith('/') ? p + 'index.html' : p + '.html');
};

export function main() {
  const articles = readFaqArticles();
  // 列表页的内容就是文章清单：哪篇改了，列表（标题 / 摘要）就跟着变，取最新的那个日期
  const faqLastmod = articles.filter((a) => !a.draft).map((a) => a.date).sort().at(-1);
  const entries = [
    ...langRouteEntries(),
    { loc: SITE + '/faq', lastmod: faqLastmod },
    ...faqEntries(articles),
    { loc: SITE + '/privacy' },
  ];
  const missing = entries.filter((e) => !existsSync(distFileOf(e.loc))).map((e) => e.loc);
  if (missing.length) throw new Error('sitemap points at pages that were not built:\n  ' + missing.join('\n  '));
  writeFileSync(join(DIST, 'sitemap.xml'), sitemapXml(entries), 'utf8');
  console.log('sitemap.xml：' + entries.length + ' 个地址');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
