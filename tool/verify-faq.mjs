#!/usr/bin/env node
/*
 * 常见问题模块的行为验证（先 docs:build）：左侧目录 / 文章页右侧「本页内容」/ 搜索 / 站内路由。
 *
 * 守住的性质：
 *   A. 列表页：左侧目录按分组列出全部文章、「常见问题」高亮；宽屏是文档式三栏，右侧没有「本页内容」
 *   B. 分组默认收起，点标题展开 / 再点收起；从列表点进收起那组里的文章，组自动展开、该文章高亮
 *   C. 文章页：右侧「本页内容」= 正文二级标题，滚动时高亮跟着走；宽屏藏掉「← 全部问题」；目录与「本页内容」钉在视口里不随页面滚走
 *   D. 目录里的链接走客户端路由（window 上的标记不丢），高亮和「本页内容」跟着换页
 *   E. 搜索：正文命中给出上下文片段；没命中给空态
 *   F. 非常见问题页没有目录
 *   G. 访客语言：中文访客看到中文页壳文案，英文访客看英文；列表按语言挑文章（en / zh-HK 各自的版本，德语等退回英文）
 *   H. 窄屏：目录收成一条「目录」按钮，点开列表、换页自动收起；「本页内容」不显示；不出横向滚动
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser, openCdp } from './cdp-client.mjs';
import { resolveStaticPath } from './static-path.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, '..', '.vitepress', 'dist');
const PORT = 8803;
const DEBUG_PORT = 9423;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
};

function startServer() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolveStaticPath(DIST, path); // NOSONAR: canonical root containment is enforced
    // cleanUrls：/faq 既是 faq.html 也是 faq/ 目录，线上 Pages 先落到 faq.html。
    if (file && !extname(file) && existsSync(file + '.html')) file += '.html';
    else if (file && existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!file || !existsSync(file) || statSync(file).isDirectory()) { // NOSONAR: validated above
      res.writeHead(404).end('not found');
      return;
    }
    const buf = readFileSync(file); // NOSONAR: validated above
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(buf);
  });
  return new Promise((r) => server.listen(PORT, '127.0.0.1', () => r(server)));
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (detail ? '  -- ' + detail : ''));
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = findBrowser();
  if (!browser) throw new Error('找不到 Chrome/Edge');
  const server = await startServer();
  const profileDir = mkdtempSync(join(tmpdir(), 'fushi-faq-profile-')); // NOSONAR: randomized dir

  const proc = spawn(
    browser,
    [
      '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--no-proxy-server',
      '--host-resolver-rules=MAP api.github.com 127.0.0.1:9',
      '--user-data-dir=' + profileDir,
      '--remote-debugging-port=' + DEBUG_PORT,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  const cleanup = () => {
    try { proc.kill(); } catch { /* 已退出 */ }
    try { server.close(); } catch { /* 已关 */ }
  };
  process.on('exit', cleanup);

  const cdp = await openCdp(DEBUG_PORT);
  const jsErrors = [];
  cdp.onEvent((m) => {
    if (m.method === 'Runtime.exceptionThrown') jsErrors.push(m.params.exceptionDetails?.exception?.description ?? 'exception');
  });
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });

  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('页面里求值失败: ' + (r.exceptionDetails.exception?.description ?? r.exceptionDetails.text));
    return r.result.value;
  };
  const evj = async (expr) => JSON.parse(await ev('JSON.stringify(' + expr + ')'));
  /** 整页导航并等到页壳 hydrate、site.js 到位 */
  const go = async (path) => {
    await cdp.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + path });
    for (let i = 0; i < 100; i++) {
      await sleep(150);
      if (await ev("!!(document.querySelector('.site-main .prose') && window.fushiI18n && window.fushiI18n.dict)").catch(() => false)) break;
    }
    await sleep(300);
  };
  /** 站内点击并等路由切换完成：路径变了还不够（页壳不重挂，旧正文还在），要等 <title> 换成新页的 */
  const clickTo = async (selector, path) => {
    const before = await ev('document.title');
    await ev(`document.querySelector(${JSON.stringify(selector)}).click()`);
    for (let i = 0; i < 60; i++) {
      await sleep(100);
      if (await ev(`location.pathname === ${JSON.stringify(path)} && document.title !== ${JSON.stringify(before)} && !!document.querySelector('.site-main .prose h1')`)) break;
    }
    await sleep(300);
  };
  const style = (sel, prop) => `getComputedStyle(document.querySelector(${JSON.stringify(sel)}))[${JSON.stringify(prop)}]`;

  // ---- A. 列表页（中文访客） ----
  await go('/faq?lang=zh-CN');
  let s = await evj(`({
    toggle: ${style('.faq-side-toggle', 'display')}, body: ${style('.faq-side-body', 'display')},
    home: document.querySelector('.faq-side-home').textContent.trim(),
    homeActive: document.querySelector('.faq-side-home').classList.contains('is-active'),
    groups: document.querySelectorAll('.faq-side-head').length,
    links: document.querySelectorAll('.faq-side-group li a').length,
    listed: document.querySelectorAll('.faq-list li a').length,
    outline: !!document.querySelector('.faq-outline'),
    cols: ${style('.faq-layout', 'gridTemplateColumns')}.split(' ').length,
    sideLeft: document.querySelector('.faq-side').getBoundingClientRect().left,
    proseLeft: document.querySelector('.prose').getBoundingClientRect().left,
  })`);
  check('列表页：左侧目录列出全部文章、分组齐、「常见问题」高亮',
    s.toggle === 'none' && s.body === 'block' && s.home === '常见问题' && s.homeActive && s.groups >= 2 && s.links === s.listed && s.links > 0, JSON.stringify(s));
  check('列表页：宽屏三栏、目录在正文左边、没有「本页内容」', s.cols === 3 && s.sideLeft < s.proseLeft && !s.outline, JSON.stringify(s));

  // ---- B. 分组默认收起；点开、再点收起；再从列表点进这组的文章 ----
  // 后面的「本页内容」断言需要一篇带二级标题的文章：从最后一组往前找，挑第一篇正文有 h2 的
  // （列表页的摘要看不出来，只能点进去探；探完回列表页）。
  const groupsMeta = await evj(`[...document.querySelectorAll('.faq-side-group')].map((g, i) => ({ i, href: g.querySelector('li a').getAttribute('href') }))`);
  let last = null;
  for (const g of [...groupsMeta].reverse()) {
    await clickTo('.faq-list a[href="' + g.href + '"]', g.href);
    const h2 = await ev(`document.querySelectorAll('.prose h2').length`);
    await clickTo('.faq-side-home', '/faq');
    if (h2 > 0) { last = g; break; }
  }
  if (!last) throw new Error('没有一组的第一篇文章带二级标题，测不了「本页内容」');
  // 探路时展开过的组收回去，回到「默认全部收起」的初始态再断言
  await ev(`[...document.querySelectorAll('.faq-side-head')].filter((b) => b.getAttribute('aria-expanded') === 'true').forEach((b) => b.click())`);
  await sleep(100);
  const groupState = () => evj(`({ exp: document.querySelectorAll('.faq-side-head')[${last.i}].getAttribute('aria-expanded'), ul: getComputedStyle(document.querySelectorAll('.faq-side-group')[${last.i}].querySelector('ul')).display, openCount: [...document.querySelectorAll('.faq-side-head')].filter((b) => b.getAttribute('aria-expanded') === 'true').length })`);
  s = await groupState();
  check('列表页：目录分组默认全部收起', s.exp === 'false' && s.ul === 'none' && s.openCount === 0, JSON.stringify(s));
  await ev(`document.querySelectorAll('.faq-side-head')[${last.i}].click()`);
  await sleep(100);
  s = await groupState();
  check('目录分组点标题展开', s.exp === 'true' && s.ul !== 'none' && s.openCount === 1, JSON.stringify(s));
  await ev(`document.querySelectorAll('.faq-side-head')[${last.i}].click()`);
  await sleep(100);
  s = await groupState();
  check('目录分组再点收起', s.exp === 'false' && s.ul === 'none', JSON.stringify(s));

  await ev('window.__m = 1');
  await clickTo('.faq-list a[href="' + last.href + '"]', last.href);
  s = await evj(`({ m: window.__m, path: location.pathname,
    exp: document.querySelectorAll('.faq-side-head')[${last.i}].getAttribute('aria-expanded'),
    active: (document.querySelector('.faq-side-group li a.is-active') || {}).getAttribute?.('href'),
    current: document.querySelectorAll('[aria-current="page"]').length,
    outline: document.querySelectorAll('.faq-outline a').length,
    h2: document.querySelectorAll('.prose h2').length,
    outlineShown: ${style('.faq-outline', 'display')}, outlineTitle: document.querySelector('.faq-outline-title').textContent,
    back: ${style('.faq-article-nav', 'display')} })`);
  check('点进收起那组的文章：走客户端路由、组自动展开、该文章高亮',
    s.m === 1 && s.path === last.href && s.exp === 'true' && s.active === last.href && s.current === 1, JSON.stringify(s));
  // ---- C. 本页内容 ----
  check('文章页：「本页内容」= 正文二级标题，宽屏显示；「← 全部问题」藏掉',
    s.outline > 0 && s.outline === s.h2 && s.outlineShown === 'block' && s.outlineTitle === '本页内容' && s.back === 'none', JSON.stringify(s));

  const slugs = await evj(`[...document.querySelectorAll('.faq-outline a')].map((a) => a.getAttribute('href').slice(1))`);
  const mid = slugs[Math.floor(slugs.length / 2)];
  // 页面开着 scroll-behavior: smooth，要 instant 才能在等待后量到终点
  await ev(`document.getElementById(${JSON.stringify(mid)}).scrollIntoView({ behavior: 'instant' }); 1`);
  await sleep(400);
  s = await evj(`({ y: scrollY, act: (document.querySelector('.faq-outline a.is-active') || {}).getAttribute?.('href') })`);
  check('文章页：滚到某一节，「本页内容」高亮它', s.act === '#' + mid, JSON.stringify(s));
  await ev("scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); 1");
  await sleep(400);
  s = await ev(`(document.querySelector('.faq-outline a.is-active') || {}).getAttribute?.('href')`);
  check('文章页：滚到底高亮最后一节', s === '#' + slugs[slugs.length - 1], s);
  s = await evj(`({ y: scrollY, side: document.querySelector('.faq-side-body').getBoundingClientRect().top, outline: document.querySelector('.faq-outline-body').getBoundingClientRect().top,
    sideLeft: document.querySelector('.faq-side-body').getBoundingClientRect().left, cellLeft: document.querySelector('.faq-side').getBoundingClientRect().left,
    navH: document.querySelector('.site-nav').getBoundingClientRect().height })`);
  check('文章页：滚到底后目录与「本页内容」仍钉在顶栏下方、目录和它的格子左对齐',
    s.y > 0 && Math.abs(s.side - (s.navH + 32)) < 2 && Math.abs(s.outline - (s.navH + 32)) < 2 && Math.abs(s.sideLeft - s.cellLeft) < 1, JSON.stringify(s));

  // ---- D. 目录链接换页 ----
  const other = await evj(`[...document.querySelectorAll('.faq-side-group li a')].map((a) => a.getAttribute('href')).find((h) => h !== ${JSON.stringify(last.href)})`);
  await clickTo('.faq-side-group li a[href="' + other + '"]', other);
  s = await evj(`({ m: window.__m, path: location.pathname, active: (document.querySelector('.faq-side-group li a.is-active') || {}).getAttribute?.('href'),
    outline: document.querySelectorAll('.faq-outline a').length, h2: document.querySelectorAll('.prose h2').length, y: scrollY })`);
  check('目录里点另一篇：客户端路由、高亮换、「本页内容」换', s.m === 1 && s.path === other && s.active === other && s.outline === s.h2, JSON.stringify(s));

  await clickTo('.faq-side-home', '/faq');
  s = await evj(`({ m: window.__m, path: location.pathname, homeActive: document.querySelector('.faq-side-home').classList.contains('is-active'), search: !!document.querySelector('.faq-search input'), outline: !!document.querySelector('.faq-outline') })`);
  check('目录顶上的「常见问题」回列表页', s.m === 1 && s.path === '/faq' && s.homeActive && s.search && !s.outline, JSON.stringify(s));

  // ---- E. 搜索 ----
  const type = async (q) => {
    await ev(`(() => { const i = document.querySelector('.faq-search input'); i.value = ${JSON.stringify(q)}; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await sleep(150);
  };
  await type('ankiconnect');
  s = await evj(`({ n: document.querySelectorAll('.faq-list li').length, groups: document.querySelectorAll('.faq-group').length, snippet: [...document.querySelectorAll('.faq-item-desc')].some((e) => /ankiconnect/i.test(e.textContent)) })`);
  check('搜索：正文命中列出结果并给上下文片段', s.n > 0 && s.groups === 0 && s.snippet, JSON.stringify(s));
  await type('zzzz-不存在的词');
  s = await evj(`({ n: document.querySelectorAll('.faq-list li').length, empty: (document.querySelector('.faq-empty') || {}).textContent })`);
  check('搜索：没命中给空态', s.n === 0 && s.empty === '没有匹配的问题。', JSON.stringify(s));
  await type('');
  s = await evj(`document.querySelectorAll('.faq-group').length`);
  check('搜索：清空回到分组列表', s >= 2, String(s));

  // ---- F. 非常见问题页 ----
  await clickTo('.site-nav-links a[href$="/immersion"]', '/zh-cn/immersion');
  s = await evj(`({ path: location.pathname, side: !!document.querySelector('.faq-side'), layout: !!document.querySelector('.faq-layout') })`);
  check('沉浸页没有目录', !s.side && !s.layout && s.path === '/zh-cn/immersion', JSON.stringify(s));

  // ---- G. 英文访客 ----
  await go(last.href + '?lang=en');
  s = await evj(`({ home: document.querySelector('.faq-side-home').textContent.trim(), out: document.querySelector('.faq-outline-title').textContent, toc: document.querySelector('.faq-side-toggle span').textContent })`);
  check('英文访客：页壳文案是英文', s.home === 'FAQ' && s.out === 'On this page' && s.toc === 'Contents', JSON.stringify(s));
  // 列表按界面语言挑文章：英文访客只看英文版，繁体访客只看繁体版，没有翻译的语言（德语）退回英文版
  const langsOf = () => evj(`[...new Set([...document.querySelectorAll('.faq-list li')].map((li) => li.getAttribute('lang')))]`);
  await go('/faq?lang=en');
  s = await langsOf();
  check('英文访客：列表只有英文文章', s.length === 1 && s[0] === 'en', JSON.stringify(s));
  await go('/faq?lang=zh-HK');
  s = await langsOf();
  check('繁体访客：列表只有繁体文章', s.length === 1 && s[0] === 'zh-HK', JSON.stringify(s));
  await go('/faq?lang=de');
  s = await langsOf();
  check('没有翻译的语言（德语）：退回英文文章', s.length === 1 && s[0] === 'en', JSON.stringify(s));
  await go('/faq?lang=zh-CN');
  s = await langsOf();
  check('中文访客：列表只有简体文章', s.length === 1 && s[0] === 'zh-CN', JSON.stringify(s));

  // ---- H. 窄屏 ----
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await go(last.href + '?lang=zh-CN');
  s = await evj(`({ toggle: ${style('.faq-side-toggle', 'display')}, body: ${style('.faq-side-body', 'display')}, outline: ${style('.faq-outline', 'display')},
    back: ${style('.faq-article-nav', 'display')}, label: document.querySelector('.faq-side-toggle span').textContent, w: document.documentElement.scrollWidth })`);
  check('窄屏：目录收成「目录」按钮，「本页内容」不显示，「← 全部问题」回来，不出横向滚动',
    s.toggle === 'flex' && s.body === 'none' && s.outline === 'none' && s.back !== 'none' && s.label === '目录' && s.w <= 390, JSON.stringify(s));
  await ev(`document.querySelector('.faq-side-toggle').click()`);
  await sleep(100);
  s = await evj(`({ body: ${style('.faq-side-body', 'display')}, exp: document.querySelector('.faq-side-toggle').getAttribute('aria-expanded') })`);
  check('窄屏：点「目录」展开列表', s.body === 'block' && s.exp === 'true', JSON.stringify(s));
  await clickTo('.faq-side-group li a[href="' + other + '"]', other);
  s = await evj(`({ path: location.pathname, body: ${style('.faq-side-body', 'display')} })`);
  check('窄屏：换页后列表自动收起', s.path === other && s.body === 'none', JSON.stringify(s));

  check('全程没有 JS 异常', jsErrors.length === 0, jsErrors.slice(0, 2).join(' | '));

  cdp.socket.close();
  cleanup();
  await sleep(500);
  try { rmSync(profileDir, { recursive: true, force: true }); } catch { /* 浏览器还没放手就留给系统清 */ }

  const failed = results.filter((r) => !r.ok);
  console.log('\n' + (results.length - failed.length) + '/' + results.length + ' 项通过');
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
