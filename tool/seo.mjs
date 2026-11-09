/*
 * 搜索引擎用的构建期产物，全是纯函数，由构建脚本调用、由 tool/seo.test.mjs 守：
 *   - 结构化数据（JSON-LD）：首页 SoftwareApplication + WebSite，常见问题文章 TechArticle + BreadcrumbList；
 *   - sitemap.xml：语言路由页带全部 hreflang，常见问题文章带它的各语言版本；
 *   - 首页大块内联脚本外置：17 份语言首页共用同一批 demo 脚本，烤完后抽成带内容哈希的
 *     /assets/home-<hash>.js，HTML 里只剩正文（爬虫读到的不再是 600 多 KB 的 JS 字符串）。
 */

import { createHash } from 'node:crypto';
import { DEFAULT_LANG, LANGS, PAGES, SITE, routeFor } from '../.vitepress/theme/lang-routes.mjs';

/** 常见问题文章的语言 → 文件名后缀（原文 zh-CN 没有后缀）。只有这三种语言写了文章。 */
export const FAQ_LANGS = ['zh-CN', 'en', 'zh-HK'];

/** @param {string} slug @param {string} lang FAQ_LANGS 之一 @returns {string} 站内路径 */
export const faqPath = (slug, lang) => '/faq/' + slug + (lang === 'zh-CN' ? '' : '.' + lang);

/**
 * 首页上指向某篇常见问题的链接，按页面语言挑文章版本：简体 → 原文，繁体 → .zh-HK，其余 → 英文版。
 * @param {string} href 形如 /faq/<slug>（不带语言后缀）；其它链接原样返回
 * @param {string} code 页面语言
 * @returns {string}
 */
export function localizeFaqHref(href, code) {
  const m = /^\/faq\/([a-z0-9-]+)([?#].*)?$/.exec(href);
  if (!m) return href;
  const lang = code === 'zh-CN' || code === 'zh-HK' ? code : 'en';
  return faqPath(m[1], lang) + (m[2] || '');
}

/** JSON 放进 <script> 里：`</` 必须转义，否则会提前闭合标签。 */
export const ldScript = (obj) =>
  '<script type="application/ld+json">' + JSON.stringify(obj).replace(/<\//g, '<\\/') + '</script>';

const PUBLISHER = { '@type': 'Organization', name: 'Fushi', url: SITE + '/', logo: SITE + '/fushi-icon.png' };

/**
 * 首页的结构化数据。只写可核实的事实：没有评分就不写 aggregateRating（编造评分违反 Google 结构化数据政策）。
 * @param {string} code 页面语言
 * @param {{ title: string, description: string }} meta 已去标签的标题 / 描述
 * @returns {object[]}
 */
export function homeJsonLd(code, { title, description }) {
  const url = SITE + routeFor(code, '/');
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Fushi',
      alternateName: ['fushi.moe', title],
      url: SITE + '/',
      inLanguage: code,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Fushi',
      url,
      description,
      inLanguage: code,
      applicationCategory: 'EducationalApplication',
      applicationSubCategory: 'Language learning',
      operatingSystem: 'Windows, macOS, Android, iOS',
      downloadUrl: SITE + routeFor(code, '/download'),
      image: SITE + '/fushi-icon.png',
      license: 'https://www.gnu.org/licenses/gpl-3.0.html',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      sameAs: ['https://github.com/hajisensai/Fushi'],
      publisher: PUBLISHER,
    },
  ];
}

/** 文章语言 → 面包屑第一级「首页」该指向的语言首页。 */
const homeOfLang = (lang) => SITE + routeFor(LANGS.includes(lang) ? lang : DEFAULT_LANG, '/');

/**
 * 常见问题文章的结构化数据。
 * @param {{ url: string, title: string, description: string, lang: string, date: string, faqTitle: string }} a
 * @returns {object[]}
 */
export function faqArticleJsonLd({ url, title, description, lang, date, faqTitle }) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: title,
      description,
      inLanguage: lang,
      url,
      mainEntityOfPage: url,
      ...(date ? { dateModified: date } : {}),
      about: { '@type': 'SoftwareApplication', name: 'Fushi', url: SITE + '/' },
      author: PUBLISHER,
      publisher: PUBLISHER,
      image: SITE + '/fushi-icon.png',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Fushi', item: homeOfLang(lang) },
        { '@type': 'ListItem', position: 2, name: faqTitle, item: SITE + '/faq' },
        { '@type': 'ListItem', position: 3, name: title, item: url },
      ],
    },
  ];
}

/**
 * 常见问题列表页的 FAQPage：问题 = 文章标题，答案 = 列表里显示的那句摘要 + 文章链接。
 * Google 要求标记只描述页面上可见的内容，所以条目必须与 SSR 时列出的同一组文章一致（调用方用 poolFor 挑），
 * 没写摘要的文章列表上没有答案文字，不进标记。
 * 注：Google 自 2023-08 起只给政府 / 医疗类权威站点显示 FAQ 富摘要；这份标记对本站的作用是让搜索引擎与 AI 抓取直接读到问答对。
 * @param {{ title: string, description: string, url: string, lang: string }[]} items url 为站内路径
 * @param {string} lang 列表页的语言
 */
export function faqPageJsonLd(items, lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: SITE + '/faq',
    inLanguage: lang,
    mainEntity: items.filter((it) => it.description).map((it) => ({
      '@type': 'Question',
      name: it.title,
      url: SITE + it.url,
      acceptedAnswer: { '@type': 'Answer', text: it.description, url: SITE + it.url },
    })),
  };
}

const escXml = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * @typedef {{ loc: string, lastmod?: string, alternates?: [string, string][] }} SitemapEntry
 * @param {SitemapEntry[]} entries loc / alternates 都是绝对地址
 * @returns {string} sitemap.xml 全文
 */
export function sitemapXml(entries) {
  const seen = new Set();
  const body = entries.map((e) => {
    if (seen.has(e.loc)) throw new Error('duplicate sitemap loc ' + e.loc);
    seen.add(e.loc);
    return '  <url>\n    <loc>' + escXml(e.loc) + '</loc>\n' +
      (e.lastmod ? '    <lastmod>' + escXml(e.lastmod) + '</lastmod>\n' : '') +
      (e.alternates || []).map(([hl, href]) => '    <xhtml:link rel="alternate" hreflang="' + escXml(hl) + '" href="' + escXml(href) + '"/>\n').join('') +
      '  </url>\n';
  }).join('');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    body + '</urlset>\n';
}

/** 语言路由页（首页 / 下载页 / 沉浸页）× 17 种语言，每条都带全部 hreflang + x-default。 */
export function langRouteEntries() {
  const out = [];
  for (const page of PAGES) {
    const alternates = LANGS.map((c) => [c, SITE + routeFor(c, page)]);
    alternates.push(['x-default', SITE + routeFor(DEFAULT_LANG, page)]);
    for (const code of LANGS) out.push({ loc: SITE + routeFor(code, page), alternates });
  }
  return out;
}

/**
 * 常见问题文章：同一 slug 的各语言版本互挂 hreflang（x-default 指英文版，没有英文版就指原文）。
 * @param {{ slug: string, lang: string, date: string, draft: boolean }[]} articles
 */
export function faqEntries(articles) {
  const bySlug = new Map();
  for (const a of articles) {
    if (a.draft) continue;
    if (!bySlug.has(a.slug)) bySlug.set(a.slug, []);
    bySlug.get(a.slug).push(a);
  }
  const out = [];
  for (const [slug, versions] of [...bySlug].sort(([x], [y]) => x.localeCompare(y))) {
    const alt = versions.map((v) => [v.lang, SITE + faqPath(slug, v.lang)]);
    const xd = alt.find(([l]) => l === 'en') || alt.find(([l]) => l === 'zh-CN') || alt[0];
    const alternates = alt.length > 1 ? [...alt, ['x-default', xd[1]]] : [];
    for (const v of versions) out.push({ loc: SITE + faqPath(slug, v.lang), lastmod: v.date || undefined, alternates });
  }
  return out;
}

/**
 * /llms.txt（https://llmstxt.org）：给 AI 搜索 / 问答助手的站点导读——一句话是什么、关键事实、
 * 主要页面、全部常见问题（问题 + 一句话答案 + 链接）。AI 抓取多半不跑 JS、也不读 600 KB 的首页，
 * 这一份纯文本让它们直接拿到可引用的事实与规范链接。
 * 文章用英文版（AI 助手的默认引用语言），没有英文版的退回简体原文；其它语言版本在每页的 hreflang 里。
 * 只写可核实的事实，与首页 JSON-LD 同源。
 * @param {{ description: string, pages: { title: string, url: string, description: string }[],
 *   articles: { slug: string, lang: string, draft: boolean, title: string, description: string, category: string, order: number }[] }} input
 *   pages 的 url 为绝对地址
 * @returns {string}
 */
export function llmsTxt({ description, pages, articles }) {
  const bySlug = new Map();
  for (const a of articles) {
    if (a.draft) continue;
    const cur = bySlug.get(a.slug);
    // 每个 slug 挑一篇：英文版优先，其次简体原文
    const rank = (x) => (x.lang === 'en' ? 0 : x.lang === 'zh-CN' ? 1 : 2);
    if (!cur || rank(a) < rank(cur)) bySlug.set(a.slug, a);
  }
  const picked = [...bySlug.values()].sort((x, y) => x.order - y.order || x.slug.localeCompare(y.slug));
  const groups = new Map();
  for (const a of picked) {
    const g = a.category || 'Other';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(a);
  }
  const line = (title, url, desc) => '- [' + title + '](' + url + ')' + (desc ? ': ' + desc : '');
  const out = [
    '# Fushi',
    '',
    '> ' + description,
    '',
    'Key facts:',
    '',
    '- Free and open source (GPLv3), no in-app purchases or subscriptions. Source code: https://github.com/hajisensai/Fushi',
    '- Platforms: Windows, macOS (Apple Silicon), Android, iOS (TestFlight). Linux can be built from source.',
    '- Looks words up in Yomitan, MDict (MDX), Lingvo (DSL) and StarDict dictionaries; any study language works, decided by the imported dictionaries.',
    '- Makes an Anki card with the sentence, screenshot and audio in one tap.',
    '- 17 interface languages; the website has a version in each (English at /, others under /zh-cn/, /ja/, /ko/ …).',
    '- Official website: https://fushi.moe/ (downloads at https://fushi.moe/download).',
    '',
    '## Main pages',
    '',
    ...pages.map((p) => line(p.title, p.url, p.description)),
  ];
  for (const [g, list] of groups) {
    out.push('', '## FAQ: ' + g, '', ...list.map((a) => line(a.title, SITE + faqPath(a.slug, a.lang), a.description)));
  }
  out.push('', '## Optional', '', line('GitHub repository', 'https://github.com/hajisensai/Fushi', 'source code, issues and release notes'),
    line('Sitemap', SITE + '/sitemap.xml', 'every page with its language versions'), '');
  return out.join('\n');
}

/**
 * 把 HTML 里足够大的「裸」内联脚本（`<script>` 不带任何属性——带 type / id / src 的一律不动）抽成外部文件。
 * 外部同步脚本与内联脚本执行顺序、全局作用域完全相同；文件名带内容哈希，可以放心长缓存。
 * @param {string} html
 * @param {number} minBytes 小于它的内联脚本留在页面里
 * @returns {{ html: string, files: { name: string, content: string }[] }} name 是 assets/ 下的文件名
 */
export function externalizeScripts(html, minBytes) {
  const files = [];
  const out = html.replace(/<script>([\s\S]*?)<\/script>/g, (whole, code) => {
    if (Buffer.byteLength(code, 'utf8') < minBytes) return whole;
    const name = 'home-' + createHash('sha256').update(code).digest('hex').slice(0, 16) + '.js';
    if (!files.some((f) => f.name === name)) files.push({ name, content: code });
    return '<script src="/assets/' + name + '"></script>';
  });
  return { html: out, files };
}
