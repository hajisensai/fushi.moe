#!/usr/bin/env node
/*
 * 界面语言判定与「地址 == 语言」不变式的行为验证：用 CDP 覆盖浏览器的
 * Accept-Language / navigator.languages 与时区，打开页面看 <html lang> 和地址栏。
 *
 * 默认路由（英文，无前缀）上语言按 Accept-Language 协商的标准做法定：
 * navigator.languages 里第一个本站支持的语言。时区只是顺带覆盖，用来证明判定**不**看时区：
 *   1. en-US 独占、美洲时区            → en
 *   2. en-US 在前、zh-CN 在后、上海时区 → en（第一项是英文就是英文，不看后面、不看时区）
 *   3. en-US 独占、上海时区            → en
 *   4. ja 在前                         → ja
 *   5. zh-TW 在前                      → zh-HK（繁体分流）
 *   6. zh-CN 在前、en 在后             → zh-CN，且地址栏跟到 /zh-cn/
 *
 * 带语言前缀的路由上，地址就是访客要的语言，浏览器语言不得顶掉它（7-9）；
 * 从菜单换语言，地址栏也要跟着换（10-11）。这两条一起保证分享出去的链接、
 * 刷新、加书签拿到的语言和眼前看到的一致——违反它的表现就是
 * 「地址栏 /zh-cn 页面却是英文」。
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser, openCdp } from './cdp-client.mjs';
import { resolveStaticPath } from './static-path.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, '..', '.vitepress', 'dist');
const PORT = 8813;
const DEBUG_PORT = 9433;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

/*
 * path 省略即默认路由 /；expectUrl 省略即断言地址不变（还在 path 上）；
 * act 是打开页面后要跑的一段脚本（模拟点语言菜单）。
 */
const CASES = [
  { name: '1 en-US 独占 · America/New_York', langs: 'en-US,en', tz: 'America/New_York', expect: 'en' },
  { name: '2 en-US 在前 zh-CN 在后 · Asia/Shanghai', langs: 'en-US,en,zh-CN,zh', tz: 'Asia/Shanghai', expect: 'en' },
  { name: '3 en-US 独占 · Asia/Shanghai', langs: 'en-US,en', tz: 'Asia/Shanghai', expect: 'en' },
  { name: '4 ja 在前 · 地址跟到 /ja/', langs: 'ja,en-US,en', tz: 'Asia/Tokyo', expect: 'ja', expectUrl: '/ja/' },
  { name: '5 zh-TW 在前 · 地址跟到 /zh-hk/', langs: 'zh-TW,zh,en', tz: 'Asia/Taipei', expect: 'zh-HK', expectUrl: '/zh-hk/' },
  { name: '6 zh-CN 在前 en 在后 · 地址跟到 /zh-cn/', langs: 'zh-CN,zh,en', tz: 'America/New_York', expect: 'zh-CN', expectUrl: '/zh-cn/' },
  // 7-9：地址里写了语言，就按地址来——浏览器语言、时区都不得顶掉它。
  { name: '7 en 浏览器打开 /zh-cn/', langs: 'en-US,en', tz: 'America/New_York', path: '/zh-cn/', expect: 'zh-CN' },
  { name: '8 en 浏览器打开 /ja/download', langs: 'en-US,en', tz: 'America/New_York', path: '/ja/download', expect: 'ja' },
  { name: '9 zh-CN 浏览器打开默认路由的 /download · 地址跟到 /zh-cn/download', langs: 'zh-CN,zh,en', tz: 'Asia/Shanghai', path: '/download', expect: 'zh-CN', expectUrl: '/zh-cn/download' },
  // 10-11：菜单换语言 → 地址栏跟着换（默认路由 ↔ 前缀路由 两个方向）。
  {
    name: '10 在 / 上切成日语 · 地址跟到 /ja/',
    langs: 'en-US,en', tz: 'America/New_York', expect: 'ja', expectUrl: '/ja/',
    act: 'window.fushiI18n.set("ja")',
  },
  {
    name: '11 在 /zh-cn/ 上切成英语 · 地址回到 /',
    langs: 'en-US,en', tz: 'America/New_York', path: '/zh-cn/', expect: 'en', expectUrl: '/',
    act: 'window.fushiI18n.set("en")',
  },
];

/*
 * 按 Pages（CF / GitHub）真实提供静态站的方式解析：目录取其 index.html，
 * 无扩展名的路径取同名 .html。语言路由测的就是 `/zh-cn/`、`/ja/download` 这类地址，
 * 本地服务若只认 `/ja/download`，用例就会把本地才有的扩展名固化成期望。
 */
function resolvePage(pathname) {
  const file = resolveStaticPath(DIST, pathname); // NOSONAR: canonical root containment is enforced
  if (!file) return null;
  if (existsSync(file)) { // NOSONAR: validated above
    if (!statSync(file).isDirectory()) return file; // NOSONAR: validated above
    const index = join(file, 'index.html');
    return existsSync(index) ? index : null; // NOSONAR: validated above
  }
  if (extname(file)) return null;
  const html = file + '.html';
  return existsSync(html) ? html : null; // NOSONAR: validated above
}

function startServer() {
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    const file = resolvePage(path);
    if (!file) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file)); // NOSONAR: validated above
  });
  return new Promise((r) => server.listen(PORT, '127.0.0.1', () => r(server)));
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok });
  console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (detail ? '  -- ' + detail : ''));
}

async function main() {
  const browser = findBrowser();
  if (!browser) throw new Error('找不到 Chrome/Edge');
  if (!existsSync(join(DIST, 'index.html'))) throw new Error('先跑 npm run docs:build');

  const server = await startServer();
  const profileDir = mkdtempSync(join(tmpdir(), 'fushi-i18n-profile-')); // NOSONAR: randomized dir
  const proc = spawn(
    browser,
    ['--headless=new', '--disable-gpu', '--no-first-run', '--no-proxy-server', '--user-data-dir=' + profileDir, '--remote-debugging-port=' + DEBUG_PORT, 'about:blank'],
    { stdio: 'ignore' },
  );
  const cdp = await openCdp(DEBUG_PORT);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');

  for (const c of CASES) {
    // navigator.languages 跟随 Accept-Language 覆盖；时区单独覆盖。每个场景清掉记住的选择。
    await cdp.send('Network.setUserAgentOverride', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
      acceptLanguage: c.langs,
    });
    await cdp.send('Emulation.setTimezoneOverride', { timezoneId: c.tz });
    const path = c.path ?? '/';
    await cdp.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/' });
    await new Promise((r) => setTimeout(r, 1500));
    await cdp.send('Runtime.evaluate', { expression: 'try { localStorage.clear() } catch (e) {}' });
    await cdp.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + path });
    if (c.act) {
      await new Promise((r) => setTimeout(r, 1500));
      await cdp.send('Runtime.evaluate', { expression: c.act, awaitPromise: true });
      await new Promise((r) => setTimeout(r, 800));
    }
    // 等页面真的装好（语言选择器在、site.js 已跑完 apply）再读，最多 8s；不靠固定 sleep。
    const got = await cdp.send('Runtime.evaluate', {
      expression: '(function(){ return new Promise(function (res) { var t0 = Date.now(); (function poll(){ var s = document.querySelector(".site-nav-lang [data-lang=auto] .site-nav-lang-sub"); var ready = s && s.textContent && !document.documentElement.classList.contains("i18n-pending"); if (ready || Date.now() - t0 > 8000) return res({ lang: document.documentElement.lang, langs: navigator.languages.join(","), tz: Intl.DateTimeFormat().resolvedOptions().timeZone, auto: s ? s.textContent : null, url: location.pathname }); setTimeout(poll, 100); })(); }); })()',
      returnByValue: true,
      awaitPromise: true,
    });
    const v = got.result.value;
    // 地址栏没写期望就是「不该动」：还停在打开时那个路径上。
    const expectUrl = c.expectUrl ?? path;
    check(c.name + ' → ' + c.expect, v.lang === c.expect, JSON.stringify(v));
    check(c.name + ' → 地址 ' + expectUrl, v.url === expectUrl, JSON.stringify(v));
  }

  cdp.socket.close();
  proc.kill();
  server.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log('\n' + (results.length - failed) + '/' + results.length + ' 项通过');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
