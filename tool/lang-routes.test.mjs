import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CHROME_KEYS, DEFAULT_LANG, LANGS, NAMES, PAGES, PREFIX, PREFIX_ALTERNATION, langOfPath, localizeHref, routeFor, seoHead,
} from '../.vitepress/theme/lang-routes.mjs';
import { renderHome } from './build_lang_routes.mjs';

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
