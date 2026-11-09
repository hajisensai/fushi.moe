import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, PAGES, SITE, routeFor } from '../.vitepress/theme/lang-routes.mjs';
import { renderHome } from './build_lang_routes.mjs';
import { readFaqArticles } from './build_sitemap.mjs';
import {
  externalizeScripts, faqArticleJsonLd, faqEntries, faqPageJsonLd, faqPath, homeJsonLd, langRouteEntries, ldScript, llmsTxt, localizeFaqHref, sitemapXml,
} from './seo.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const dictOf = (c) => JSON.parse(read('public/i18n/' + c + '.json'));

test('首页上的常见问题链接按页面语言挑文章版本', () => {
  assert.equal(localizeFaqHref('/faq/anki', 'zh-CN'), '/faq/anki');
  assert.equal(localizeFaqHref('/faq/anki', 'zh-HK'), '/faq/anki.zh-HK');
  assert.equal(localizeFaqHref('/faq/anki', 'de'), '/faq/anki.en');
  assert.equal(localizeFaqHref('/faq/anki#x', 'en'), '/faq/anki.en#x');
  assert.equal(localizeFaqHref('/faq', 'de'), '/faq', '列表页不分语言');
  assert.equal(localizeFaqHref('/faq/anki.en', 'ja'), '/faq/anki.en', '已带语言后缀的原样');
  assert.equal(localizeFaqHref('/download', 'ja'), '/download');
  assert.equal(faqPath('x', 'zh-CN'), '/faq/x');
  assert.equal(faqPath('x', 'en'), '/faq/x.en');
});

test('JSON-LD：</ 被转义；首页不编造评分；文章带面包屑', () => {
  assert.equal(ldScript({ a: '</script>' }), '<script type="application/ld+json">{"a":"<\\/script>"}</script>');
  const [site, app] = homeJsonLd('de', { title: 'T', description: 'D' });
  assert.equal(site['@type'], 'WebSite');
  assert.equal(app['@type'], 'SoftwareApplication');
  assert.equal(app.url, SITE + '/de/');
  assert.equal(app.downloadUrl, SITE + '/de/download');
  assert.equal(app.offers.price, '0');
  assert.ok(!('aggregateRating' in app) && !('review' in app), '没有真实评分就不能写 aggregateRating / review');
  const [art, crumbs] = faqArticleJsonLd({ url: SITE + '/faq/x.en', title: 'Q?', description: 'A', lang: 'en', date: '2026-10-12', faqTitle: 'FAQ' });
  assert.equal(art['@type'], 'TechArticle');
  assert.equal(art.dateModified, '2026-10-12');
  assert.deepEqual(crumbs.itemListElement.map((i) => i.item), [SITE + '/', SITE + '/faq', SITE + '/faq/x.en']);
  const [, zh] = faqArticleJsonLd({ url: SITE + '/faq/x', title: 'Q', description: '', lang: 'zh-CN', date: '', faqTitle: '常见问题' });
  assert.equal(zh.itemListElement[0].item, SITE + '/zh-cn/', '面包屑首页指向文章语言的首页');
});

test('sitemap：语言路由页带全部 hreflang，常见问题按 slug 互挂，草稿不收，地址不重复', () => {
  const routes = langRouteEntries();
  assert.equal(routes.length, PAGES.length * LANGS.length);
  for (const e of routes) {
    assert.equal(e.alternates.length, LANGS.length + 1);
    assert.equal(e.alternates.at(-1)[0], 'x-default');
  }
  const faq = faqEntries([
    { slug: 'a', lang: 'zh-CN', date: '2026-01-01', draft: false },
    { slug: 'a', lang: 'en', date: '2026-01-01', draft: false },
    { slug: 'b', lang: 'zh-CN', date: '', draft: false },
    { slug: 'c', lang: 'zh-CN', date: '', draft: true },
  ]);
  assert.deepEqual(faq.map((e) => e.loc), [SITE + '/faq/a', SITE + '/faq/a.en', SITE + '/faq/b']);
  assert.deepEqual(faq[0].alternates.at(-1), ['x-default', SITE + '/faq/a.en']);
  assert.deepEqual(faq[2].alternates, [], '只有一个语言版本的不挂 hreflang');
  const xml = sitemapXml([{ loc: SITE + '/a?x=1&y=2', lastmod: '2026-01-01', alternates: [['en', SITE + '/a']] }]);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9" xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml">/);
  assert.ok(xml.includes('<loc>' + SITE + '/a?x=1&amp;y=2</loc>'), '& 要转义');
  assert.ok(xml.includes('<xhtml:link rel="alternate" hreflang="en" href="' + SITE + '/a"/>'));
  assert.throws(() => sitemapXml([{ loc: 'x' }, { loc: 'x' }]), /duplicate/);
});

test('真实的常见问题目录：每篇文章能读出语言、双引号写的标题与摘要，原文都在', () => {
  const arts = readFaqArticles();
  assert.ok(arts.length > 0);
  for (const a of arts) {
    assert.ok(existsSync(join(ROOT, 'faq', a.slug + '.md')), a.slug + ' 缺简体原文');
    assert.ok(a.title, a.slug + '.' + a.lang + ' 的 title 要写成 title: "…"（FAQPage 标记靠它）');
    assert.ok(a.description || a.draft, a.slug + '.' + a.lang + ' 缺 description："…"——列表页没有答案文字，FAQPage 会漏掉它');
    assert.match(a.date, /^\d{4}-\d{2}-\d{2}$/, a.slug + '.' + a.lang + ' 缺 date（sitemap 的 lastmod 取它，改了内容要跟着改）');
  }
});

test('FAQPage：问题 = 标题、答案 = 摘要，没摘要的不进；列表页语言与 config.mts 的常量一致', () => {
  const ld = faqPageJsonLd([
    { title: 'Q1?', description: 'A1', url: '/faq/a.en', lang: 'en' },
    { title: 'Q2?', description: '', url: '/faq/b.en', lang: 'en' },
  ], 'en');
  assert.equal(ld['@type'], 'FAQPage');
  assert.deepEqual(ld.mainEntity, [{
    '@type': 'Question', name: 'Q1?', url: SITE + '/faq/a.en',
    acceptedAnswer: { '@type': 'Answer', text: 'A1', url: SITE + '/faq/a.en' },
  }]);
  const pageLang = /<FaqIndex lang="([^"]+)"/.exec(read('faq.md'))[1];
  assert.match(read('.vitepress/config.mts'), new RegExp("const FAQ_INDEX_LANG = '" + pageLang + "'"));
});

test('脚本外置：只抽足够大的裸内联脚本，顺序不变、同内容只写一份、带属性的不动', () => {
  const big = 'var a = "<\\/script>";' + 'x'.repeat(100);
  const html = '<script src="/site.js"></script><script type="application/json">' + 'y'.repeat(200) +
    '</script><script>small()</script><script>' + big + '</script><p>t</p><script>' + big + '</script>';
  const { html: out, files } = externalizeScripts(html, 50);
  assert.equal(files.length, 1);
  assert.equal(files[0].content, big);
  assert.match(files[0].name, /^home-[0-9a-f]{16}\.js$/);
  const tag = '<script src="/assets/' + files[0].name + '"></script>';
  assert.equal(out, '<script src="/site.js"></script><script type="application/json">' + 'y'.repeat(200) +
    '</script><script>small()</script>' + tag + '<p>t</p>' + tag);
});

test('烤好的首页：两段 JSON-LD 可解析、有功能详解区的 h2/h3，链接的常见问题在该语言下都存在', () => {
  const template = read('public/index.html');
  for (const code of LANGS) {
    const html = renderHome(template, dictOf(code), code);
    const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    assert.deepEqual(lds.map((o) => o['@type']), ['WebSite', 'SoftwareApplication'], code);
    assert.equal(lds[1].url, SITE + routeFor(code, '/'), code);
    const guide = /<section class="feature alt-band" id="guide">([\s\S]*?)<\/section>/.exec(html);
    assert.ok(guide, code + ' 缺功能详解区');
    assert.ok((guide[1].match(/<h3\b/g) || []).length >= 8, code + ' 功能详解区的 h3 太少');
    for (const [, href] of guide[1].matchAll(/href="(\/faq\/[^"#?]+)"/g)) {
      assert.ok(existsSync(join(ROOT, href.slice(1) + '.md')), code + ' 首页链到了不存在的文章 ' + href);
    }
  }
});

test('仓库说明文档（README / AGENTS / CLAUDE / docs/）不被构建成站点页面', () => {
  const m = /srcExclude:\s*\[([^\]]*)\]/.exec(read('.vitepress/config.mts'));
  assert.ok(m, 'config.mts 缺 srcExclude');
  for (const p of ['README.md', 'AGENTS.md', 'CLAUDE.md', 'docs/**']) assert.ok(m[1].includes("'" + p + "'"), 'srcExclude 缺 ' + p);
});

test('_redirects：旧地址一律 301 到现行页，不指向另一条重定向，也不自己指自己', () => {
  const rules = read('public/_redirects').replace(/\r\n/g, '\n').split('\n')
    .map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/));
  const sources = new Set(rules.map(([from]) => from));
  // 现行页：语言路由页 × 17、/faq、/privacy、常见问题文章、站点根目录静态文件
  const live = new Set([
    ...LANGS.flatMap((c) => PAGES.map((p) => routeFor(c, p))), '/faq', '/privacy',
    ...readFaqArticles().filter((a) => !a.draft).map((a) => faqPath(a.slug, a.lang)),
  ]);
  for (const [from, to, code] of rules) {
    assert.equal(code, '301', from + ' 要永久重定向（302 不传递收录）');
    if (to.includes(':splat')) continue;
    assert.notEqual(from.replace(/\/$/, ''), to.replace(/\/$/, ''), from + ' 指向自己（尾斜杠互跳会死循环）');
    assert.ok(!sources.has(to), from + ' → ' + to + ' 是重定向链');
    assert.ok(live.has(to) || existsSync(join(ROOT, 'public', to.slice(1))), from + ' → ' + to + ' 不是现行页');
  }
  for (const old of ['/features', '/guide', '/posts/features/', '/posts/5min-setup/']) assert.ok(sources.has(old), '缺旧地址 ' + old);
});

test('llms.txt：关键事实、主要页面、每个 slug 一篇（英文优先）、草稿不收、按分组与 order 排', () => {
  const txt = llmsTxt({
    description: 'Fushi is an app.',
    pages: [{ title: 'Download Fushi', url: SITE + '/download', description: 'Pick a platform.' }],
    articles: [
      { slug: 'b', lang: 'zh-CN', draft: false, title: '乙', description: '乙答', category: '关于', order: 20 },
      { slug: 'b', lang: 'en', draft: false, title: 'B?', description: 'B.', category: 'About', order: 20 },
      { slug: 'b', lang: 'zh-HK', draft: false, title: '乙', description: '乙答', category: '關於', order: 20 },
      { slug: 'a', lang: 'en', draft: false, title: 'A?', description: 'A.', category: 'About', order: 10 },
      { slug: 'z', lang: 'zh-CN', draft: false, title: '只有中文', description: '答', category: '其它', order: 5 },
      { slug: 'd', lang: 'en', draft: true, title: 'Draft?', description: 'x', category: 'About', order: 1 },
    ],
  });
  assert.match(txt, /^# Fushi\n\n> Fushi is an app\.\n/);
  assert.ok(txt.includes('- [Download Fushi](' + SITE + '/download): Pick a platform.'));
  assert.ok(txt.includes('## FAQ: About\n\n- [A?](' + SITE + '/faq/a.en): A.\n- [B?](' + SITE + '/faq/b.en): B.'));
  assert.ok(txt.includes('- [只有中文](' + SITE + '/faq/z): 答'), '没有英文版的退回简体原文');
  assert.ok(!txt.includes('Draft?') && !txt.includes('乙'), '草稿与非首选语言版本不收');
  assert.ok(txt.indexOf('## FAQ: 其它') < txt.indexOf('## FAQ: About'), '分组按组内最靠前的 order 排');
});

test('真实常见问题都读得出分组与 order（llms.txt 按它们分组排序）', () => {
  for (const a of readFaqArticles()) {
    if (a.draft) continue;
    assert.ok(a.category, a.slug + '.' + a.lang + ' 缺 category: "…"');
    assert.ok(Number.isFinite(a.order), a.slug + '.' + a.lang + ' 缺 order');
  }
});

test('robots.txt 指向 sitemap', () => {
  assert.match(read('public/robots.txt'), /^Sitemap: https:\/\/fushi\.moe\/sitemap\.xml$/m);
});

test('robots.txt：任何爬虫都不被整站挡（搜索、AI 检索、AI 训练都允许）', () => {
  const lines = read('public/robots.txt').replace(/\r\n/g, '\n').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  // 按组解析：连续的 User-agent 行是一组，后面跟它们的规则
  const blocked = new Set();
  let agents = [];
  let inRules = false;
  for (const l of lines) {
    const [k, ...rest] = l.split(':');
    const v = rest.join(':').trim();
    if (/^user-agent$/i.test(k)) { if (inRules) { agents = []; inRules = false; } agents.push(v.toLowerCase()); continue; }
    inRules = true;
    if (/^disallow$/i.test(k) && v === '/') agents.forEach((a) => blocked.add(a));
  }
  for (const bot of ['*', 'googlebot', 'bingbot', 'baiduspider', 'petalbot', 'kimibot', 'yandex', 'google-extended', 'googleother',
    'applebot', 'oai-searchbot', 'chatgpt-user', 'perplexitybot', 'claude-searchbot', 'claude-user', 'duckassistbot',
    'gptbot', 'claudebot', 'ccbot', 'applebot-extended', 'meta-externalagent']) {
    assert.ok(!blocked.has(bot), bot + ' 被整站 Disallow 了');
  }
  assert.equal(blocked.size, 0, '不应整站挡任何爬虫：' + [...blocked].join(', '));
  assert.match(read('public/robots.txt'), /^Content-Signal: search=yes, ai-input=yes, ai-train=yes$/m);
});

test('不走语言路由、也不是常见问题文章的独立页自带 canonical', () => {
  // 没有 canonical 的页面会被 http:// 等变体顶成「重复网页，用户未选定规范网页」
  for (const [file, url] of [['privacy.md', 'https://fushi.moe/privacy'], ['faq.md', 'https://fushi.moe/faq']]) {
    const fm = /^---\n([\s\S]*?)\n---/.exec(read(file).replace(/\r\n/g, '\n'));
    assert.ok(fm, file + ' 缺 frontmatter');
    assert.match(fm[1], /rel: "canonical"\s*\n\s*href: "([^"]+)"/, file + ' 缺 canonical');
    assert.equal(/href: "([^"]+)"/.exec(fm[1].slice(fm[1].indexOf('rel: "canonical"')))[1], url);
  }
});

test('meta description 服务端渲染时转义属性值', () => {
  // VitePress 1.6 原样拼 description，描述里的英文双引号会截断属性（BUG：faq/*.en 摘要只剩前几个词）
  assert.match(read('.vitepress/config.mts'), /transformHtml\([^)]*\)\s*\{[\s\S]*?escapeAttr\(raw\)/);
});
