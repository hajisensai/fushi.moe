import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CHROME_KEYS, DEFAULT_LANG, LANGS, NAMES, PAGES, PREFIX, PREFIX_ALTERNATION, langOfPath, localizeHref, routeFor, seoHead,
} from '../.vitepress/theme/lang-routes.mjs';
import { renderHome } from './build_lang_routes.mjs';
import { renderZhHk } from './build_faq_zh_hk.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

test('17 种语言各有前缀，英文是无前缀的默认路由', () => {
  assert.equal(LANGS.length, 17);
  assert.equal(DEFAULT_LANG, 'en');
  assert.equal(PREFIX.en, '');
  for (const c of LANGS) assert.ok(c === 'en' ? PREFIX[c] === '' : /^\/[a-z-]+$/.test(PREFIX[c]), c);
  assert.deepEqual(PAGES, ['/', '/download', '/immersion']);
});

test('routeFor / localizeHref / langOfPath 三者互逆', () => {
  assert.equal(routeFor('en', '/'), '/');
  assert.equal(routeFor('de', '/'), '/de/');
  assert.equal(routeFor('pt-BR', '/download'), '/pt-br/download');
  assert.equal(localizeHref('/download', 'ja'), '/ja/download');
  assert.equal(localizeHref('/zh-cn/immersion#faq', 'en'), '/immersion#faq');
  assert.equal(localizeHref('/de', 'ko'), '/ko/');
  assert.equal(localizeHref('/de/', 'en'), '/');
  assert.equal(localizeHref('/privacy', 'de'), '/privacy', '没有语言版本的页面原样');
  assert.equal(localizeHref('/faq', 'de'), '/faq', '常见问题不分语言');
  assert.equal(localizeHref('/faq/anki', 'ja'), '/faq/anki');
  assert.equal(langOfPath('/faq/anki'), null);
  assert.equal(localizeHref('/releases/latest/windows', 'de'), '/releases/latest/windows');
  assert.equal(localizeHref('https://github.com/x', 'de'), 'https://github.com/x');
  assert.equal(localizeHref('#top', 'de'), '#top');
  for (const c of LANGS) for (const p of PAGES) {
    assert.equal(langOfPath(routeFor(c, p)), c, c + ' ' + p);
    assert.equal(localizeHref(routeFor('en', p), c), routeFor(c, p));
  }
  assert.equal(langOfPath('/download.html'), 'en');
  assert.equal(langOfPath('/de/index.html'), 'de');
  assert.equal(langOfPath('/privacy'), null);
});

test('site.js 里的前缀表与交替式和 lang-routes.mjs 一致', () => {
  const js = read('public/site.js');
  const lit = (o) => '{ ' + Object.entries(o).map(([k, v]) => (/^[a-z]+$/.test(k) ? k : "'" + k + "'") + ': ' + (typeof v === 'string' ? "'" + v + "'" : v)).join(', ') + ' }';
  assert.ok(js.includes('var LANG_PREFIX = ' + lit(PREFIX) + ';'), 'site.js 的 LANG_PREFIX 与 PREFIX 不一致');
  assert.ok(js.includes('var LANG_PAGES = ' + lit(Object.fromEntries(PAGES.map((p) => [p, 1]))) + ';'), 'site.js 的 LANG_PAGES 与 PAGES 不一致');
  const re = /var LINK_RE = \/\^\(\?:\\\/\(([a-z|-]+)\)/.exec(js);
  assert.ok(re, 'site.js 缺 LINK_RE');
  assert.equal(re[1], PREFIX_ALTERNATION);
});

test('seoHead 覆盖全部语言的 hreflang + x-default', () => {
  const items = seoHead('de', '/download', { title: 'T', description: 'D' });
  const hreflangs = items.filter(([tag, a]) => tag === 'link' && a.hreflang).map(([, a]) => a.hreflang);
  assert.deepEqual(hreflangs, [...LANGS, 'x-default']);
  assert.ok(items.some(([, a]) => a.property === 'og:url' && a.href === undefined && a.content === 'https://fushi.moe/de/download'));
  assert.ok(items.some(([, a]) => a.rel === 'canonical' && a.href === 'https://fushi.moe/de/download'));
});

test('每种语言的沉浸页与下载页 .md 都在，且 frontmatter 指向自己的路由', () => {
  for (const c of LANGS) for (const p of ['/immersion', '/download']) {
    const rel = routeFor(c, p).slice(1) + '.md';
    assert.ok(existsSync(join(ROOT, rel)), rel);
    const md = read(rel);
    assert.ok(md.includes('content: "https://fushi.moe' + routeFor(c, p) + '"'), rel + ' og:url');
    assert.ok(md.includes('hreflang: "x-default"'), rel + ' x-default');
  }
  for (const c of LANGS) {
    const md = read(routeFor(c, '/download').slice(1) + '.md');
    assert.ok(md.includes("public/i18n/" + c + ".json'"), c + ' 下载页要 import 自己语言的字典');
    assert.ok(md.includes('<DownloadPage lang="' + c + '"'), c);
  }
});

test('页壳用到的 data-i18n 键都在 CHROME_KEYS 里，17 份字典都有；语言自称与 site.js 的 LANGS 一致', () => {
  const layout = read('.vitepress/theme/Layout.vue');
  const used = new Set();
  for (const m of layout.matchAll(/data-i18n="([^"]+)"/g)) used.add(m[1]);
  for (const m of layout.matchAll(/data-i18n-attr="([^"]+)"/g)) for (const pair of m[1].split(';')) used.add(pair.split('=')[1]);
  for (const k of used) assert.ok(CHROME_KEYS.includes(k), 'Layout.vue 用了不在 CHROME_KEYS 里的键 ' + k);
  for (const k of used) assert.ok(new RegExp("c\\('" + k.replace('.', '\\.') + "'").test(layout), k + ' 要在 SSR 时经 c() 烤进页壳');
  for (const c of LANGS) {
    const dict = JSON.parse(read('public/i18n/' + c + '.json'));
    for (const k of CHROME_KEYS) assert.equal(typeof dict[k], 'string', c + ' 缺 ' + k);
    assert.equal(typeof dict['imm.meta.desc'], 'string', c + ' 缺 imm.meta.desc（切语言时重算沉浸页描述）');
  }
  const js = read('public/site.js');
  for (const c of LANGS) assert.ok(js.includes("['" + c + "', '" + NAMES[c] + "']"), 'site.js LANGS 缺 ' + c + ' 的自称');
});

test('常见问题：每篇 faq/*.md 都有 title；顶栏 / 底栏两处页壳都有入口，且链接不带语言前缀', () => {
  const files = readdirSync(join(ROOT, 'faq')).filter((f) => f.endsWith('.md'));
  assert.ok(files.length > 0, 'faq/ 下至少要有一篇');
  for (const f of files) {
    const md = read('faq/' + f);
    const fm = /^---\n([\s\S]*?)\n---/.exec(md.split('\r\n').join('\n'));
    assert.ok(fm && /^title:\s*\S/m.test(fm[1]), 'faq/' + f + ' 缺 title（就是问题本身）');
    assert.ok(!/^\s*# /m.test(md.slice(fm[0].length)), 'faq/' + f + ' 正文不要写一级标题，页壳会渲染 title');
  }
  for (const f of ['public/index.html', '.vitepress/theme/Layout.vue']) {
    const s = read(f);
    assert.equal((s.match(/data-i18n="nav\.faq"/g) || []).length, 2, f + ' 顶栏 + 底栏各一个「常见问题」');
    assert.ok(/href="\/faq"/.test(s), f + ' 常见问题入口应是 /faq');
    assert.ok(!/href="\/[a-z-]+\/faq"/.test(s), f + ' 常见问题不分语言，不能带前缀');
    assert.ok(!s.includes('nav.blog'), f + ' 博客已并入常见问题');
  }
});

test('首页所有 data-i18n 文案在 17 份字典中都有翻译', () => {
  const home = read('public/index.html');
  const keys = new Set();
  for (const m of home.matchAll(/data-i18n="([^"]+)"/g)) keys.add(m[1]);
  for (const m of home.matchAll(/data-i18n-attr="([^"]+)"/g)) for (const pair of m[1].split(';')) keys.add(pair.split('=')[1]);
  for (const c of LANGS) {
    const dict = JSON.parse(read('public/i18n/' + c + '.json'));
    for (const k of keys) assert.equal(typeof dict[k], 'string', c + ' 缺首页文案 ' + k);
  }
});

test('没有页面再用逐链接的 nav.method_href；字典里也没有这个键', () => {
  for (const f of ['public/index.html', '.vitepress/theme/Layout.vue']) assert.ok(!read(f).includes('nav.method_href'), f);
  for (const f of readdirSync(join(ROOT, 'public', 'i18n'))) assert.ok(!('nav.method_href' in JSON.parse(read('public/i18n/' + f))), f);
});

test('renderHome：文案、属性、站内链接、head、内联字典按语言烤好，脚本里的标记不动', () => {
  const template = [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head><title>Fushi 语言习得</title>',
    '<meta name="description" content="中文描述">',
    '<script src="/site.js"></script>',
    '</head><body>',
    '<span class="site-nav-lang-current">简体中文</span><span class="site-nav-lang-sub">简体中文</span>',
    '<a class="site-nav-brand" href="/">F</a>',
    '<a href="/immersion"><span data-i18n="nav.method">怎么开始</span></a>',
    '<a class="btn" href="/download" data-i18n="nav.download">下载</a>',
    '<p data-i18n="home.x"><span>旧</span></p>',
    '<input aria-label="展开菜单" data-i18n-attr="aria-label=nav.menu">',
    '<img src="a.png" data-i18n-attr="alt=home.alt">',
    '<a href="/privacy">隐私</a>',
    '<script>var s = \'<a href="/download" data-i18n="nav.download">x</a>\'; T(\'home.card.show_answer\', \'显示答案\');</script>',
    '</body></html>',
  ].join('\n');
  const dict = {
    'meta.title': 'Fushi — Language Acquisition', 'meta.description': 'English "desc" & more',
    'nav.method': 'How to start', 'nav.download': 'Download', 'home.x': 'New <b>bold</b>', 'nav.menu': 'Open "menu"', 'home.alt': 'Alt',
    'home.card.show_answer': 'Show answer', 'home.unused': 'unused',
  };
  const html = renderHome(template, dict, 'en');
  assert.ok(html.includes('<html lang="en" dir="ltr">'));
  assert.ok(html.includes('<title>Fushi — Language Acquisition</title>'));
  assert.ok(html.includes('<meta name="description" content="English &quot;desc&quot; &amp; more">'));
  assert.ok(html.includes('<a href="/immersion"><span data-i18n="nav.method">How to start</span></a>'));
  assert.ok(html.includes('<a class="btn" href="/download" data-i18n="nav.download">Download</a>'));
  assert.ok(html.includes('<p data-i18n="home.x">New <b>bold</b></p>'));
  assert.ok(html.includes('<input aria-label="Open &quot;menu&quot;" data-i18n-attr="aria-label=nav.menu">'));
  assert.ok(html.includes('<img src="a.png" data-i18n-attr="alt=home.alt" alt="Alt">'), '没有的属性要补上');
  assert.ok(html.includes('var s = \'<a href="/download" data-i18n="nav.download">x</a>\''), '脚本字符串不动');
  assert.ok(html.includes('<link rel="canonical" href="https://fushi.moe/">'));
  assert.equal((html.match(/hreflang="/g) || []).length, 18);
  assert.ok(html.includes('<script id="fushi-dict" type="application/json">{"home.card.show_answer":"Show answer"}</script>'));
  assert.ok(html.includes('<meta name="fushi-title" content="{meta.title}">'), '切语言时重算标题的模板');
  assert.ok(html.includes('<span class="site-nav-lang-current">English</span><span class="site-nav-lang-sub">English</span>'));

  const de = renderHome(template, { ...dict, 'meta.title': 'DE', 'meta.description': 'DE' }, 'de');
  assert.ok(de.includes('<html lang="de" dir="ltr">'));
  assert.ok(de.includes('<span class="site-nav-lang-current">Deutsch</span>'));
  assert.ok(de.includes('<a class="site-nav-brand" href="/de/">F</a>'));
  assert.ok(de.includes('<a href="/de/immersion">'));
  assert.ok(de.includes('href="/de/download"'));
  assert.ok(de.includes('<a href="/privacy">隐私</a>'), '没有语言版本的页面链接原样');
  assert.ok(de.includes('<meta property="og:url" content="https://fushi.moe/de/">'));
  const ar = renderHome(template, { ...dict, 'meta.title': 'AR', 'meta.description': 'AR' }, 'ar');
  assert.ok(ar.includes('<html lang="ar" dir="rtl">'));
});

test('renderHome 拒绝缺 meta 键的字典和已经烤过的模板', () => {
  assert.throws(() => renderHome('<html lang="zh-CN"><title>x</title>', {}, 'en'), /lacks meta\.title/);
});
test('常见问题：每篇都有中文原文 faq/<slug>.md、英文版 <slug>.en.md 与繁体版 <slug>.zh-HK.md，且 order / draft / 分组成对', () => {
  const files = readdirSync(join(ROOT, 'faq')).filter((f) => f.endsWith('.md'));
  const fmOf = (f) => {
    const md = read('faq/' + f).split('\r\n').join('\n');
    const fm = /^---\n([\s\S]*?)\n---/.exec(md)[1];
    const get = (k) => { const m = new RegExp('^' + k + ':\\s*(.*)$', 'm').exec(fm); return m ? m[1].trim().replace(/^"|"$/g, '') : ''; };
    return { lang: get('lang'), category: get('category'), order: get('order'), draft: get('draft') };
  };
  const TRANSLATIONS = ['en', 'zh-HK'];
  const isTranslation = (f) => /\.[a-z]{2}(-[A-Za-z]+)?\.md$/.test(f);
  const zh = files.filter((f) => !isTranslation(f));
  const categoryMap = new Map();
  for (const f of zh) {
    const slug = f.replace(/\.md$/, '');
    const a = fmOf(f);
    assert.ok(!a.lang || a.lang === 'zh-CN', 'faq/' + f + ' 原文应是 zh-CN（翻译放 <slug>.<lang>.md）');
    for (const lang of TRANSLATIONS) {
      const tf = slug + '.' + lang + '.md';
      assert.ok(files.includes(tf), 'faq/' + f + ' 缺 ' + lang + ' 版 faq/' + tf + '（CLAUDE.md：新文章必须中 / 英 / 繁各一份）');
      const b = fmOf(tf);
      if (lang === 'zh-HK') assert.equal(read('faq/' + tf), renderZhHk(read('faq/' + f)), 'faq/' + tf + ' 与简体原文不同步：重跑 npm run faq:zh-hk（生成物不要手改）');
      assert.equal(b.lang, lang, 'faq/' + tf + ' 要写 lang: ' + lang);
      assert.equal(b.order, a.order, 'faq/' + slug + ' 的 ' + lang + ' 版 order 要和原文一致');
      assert.equal(b.draft, a.draft, 'faq/' + slug + ' 的 ' + lang + ' 版 draft 要和原文一致');
      // 同一个中文分组必须始终对应同一个译名，不然那种语言的侧栏会裂成两组
      const key = lang + '|' + a.category;
      if (categoryMap.has(key)) assert.equal(b.category, categoryMap.get(key), 'faq/' + slug + ' 分组「' + a.category + '」的 ' + lang + ' 译名与其他文章不一致');
      else categoryMap.set(key, b.category);
    }
  }
  for (const f of files.filter(isTranslation)) {
    const m = /^(.*)\.([a-z]{2}(?:-[A-Za-z]+)?)\.md$/.exec(f);
    assert.ok(zh.includes(m[1] + '.md'), 'faq/' + f + ' 没有对应的中文原文');
    assert.ok(TRANSLATIONS.includes(m[2]), 'faq/' + f + ' 的语言 ' + m[2] + ' 不在支持的翻译列表里');
    const md = read('faq/' + f);
    assert.ok(!/\]\(\/faq\/[a-z0-9-]+(#[^)]*)?\)/.test(md), 'faq/' + f + ' 站内链接要指向同语言版本 /faq/<slug>.' + m[2]);
    if (m[2] === 'en') assert.ok(!/\]\(\/zh-cn\//.test(md), 'faq/' + f + ' 不要链到 /zh-cn/ 页面，用默认路由');
  }
});

test('深浅色：chrome.css 两个深色入口的声明逐字相同；顶栏两处页壳各有一颗主题钮', () => {
  const css = read('public/chrome.css').replace(/\r/g, '');
  // ① 跟随系统（没 JS / dev 里 site.js 还没插进来时的入口）
  const auto = /@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\) \{([\s\S]*?)\n  \}\n\}/.exec(css);
  // ② /site.js 解析成实际那一档后写在 <html data-theme> 上
  const forced = /\n:root\[data-theme="dark"\] \{([\s\S]*?)\n\}/.exec(css);
  assert.ok(auto, 'chrome.css 缺 @media (prefers-color-scheme: dark) 的深色块');
  assert.ok(forced, 'chrome.css 缺 :root[data-theme="dark"] 的深色块');
  const decls = (body) => body.split(';').map((d) => d.trim()).filter(Boolean);
  assert.deepEqual(decls(auto[1]), decls(forced[1]), '两个深色入口的声明漂了：一套值只能有一份，改一处要改两处');
  assert.ok(decls(forced[1]).includes('color-scheme: dark'), '深色块要写 color-scheme: dark（滚动条 / 原生控件跟着翻面）');
  // 亮色那份 token 里出现的每个自定义属性，深色块都要给出对应值，漏一个就是半边脸
  const light = /\n:root \{([\s\S]*?)\n\}/.exec(css);
  const names = (body) => new Set(decls(body).filter((d) => d.startsWith('--')).map((d) => d.split(':')[0].trim()));
  const darkNames = names(forced[1]);
  const SKIP = /^--(app-|sans|jp|jp-sans|ass-font|nav-h)/;  // app 实拍面与字体 / 尺寸不随主题变
  for (const n of names(light[1])) {
    if (SKIP.test(n)) continue;
    assert.ok(darkNames.has(n), '深色块缺 ' + n);
  }
  for (const f of ['public/index.html', '.vitepress/theme/Layout.vue']) {
    const s = read(f);
    assert.equal((s.match(/class="site-nav-theme"/g) || []).length, 1, f + ' 顶栏要有且只有一颗主题钮');
    assert.ok(/data-i18n-attr="title=nav\.theme;aria-label=nav\.theme"/.test(s), f + ' 主题钮的标题要走 nav.theme');
    assert.ok(s.includes('site-nav-theme-sun') && s.includes('site-nav-theme-moon'), f + ' 主题钮要带太阳 / 月亮两个图标');
  }
  const js = read('public/site.js');
  assert.ok(js.includes("'fushi-theme'"), 'site.js 要用 fushi-theme 这个 localStorage 键');
  assert.ok(js.indexOf('function applyTheme') < js.indexOf('function pageSource'), '主题要排在语言前面：<body> 解析前就得把 data-theme 写好');
});
