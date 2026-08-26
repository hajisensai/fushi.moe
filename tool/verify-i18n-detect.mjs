#!/usr/bin/env node
/*
 * 界面语言自动判定的行为验证：用 CDP 覆盖浏览器的 Accept-Language / navigator.languages
 * 与时区，打开首页看 <html lang>。
 *
 * 规则 = Accept-Language 协商的标准做法：navigator.languages 里第一个本站支持的语言。
 * 时区只是顺带覆盖，用来证明判定**不**看时区：
 *   1. en-US 独占、美洲时区            → en
 *   2. en-US 在前、zh-CN 在后、上海时区 → en（第一项是英文就是英文，不看后面、不看时区）
 *   3. en-US 独占、上海时区            → en
 *   4. ja 在前                         → ja
 *   5. zh-TW 在前                      → zh-HK（繁体分流）
 *   6. zh-CN 在前、en 在后             → zh-CN
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

const CASES = [
  { name: '1 en-US 独占 · America/New_York', langs: 'en-US,en', tz: 'America/New_York', expect: 'en' },
  { name: '2 en-US 在前 zh-CN 在后 · Asia/Shanghai', langs: 'en-US,en,zh-CN,zh', tz: 'Asia/Shanghai', expect: 'en' },
  { name: '3 en-US 独占 · Asia/Shanghai', langs: 'en-US,en', tz: 'Asia/Shanghai', expect: 'en' },
  { name: '4 ja 在前', langs: 'ja,en-US,en', tz: 'Asia/Tokyo', expect: 'ja' },
  { name: '5 zh-TW 在前', langs: 'zh-TW,zh,en', tz: 'Asia/Taipei', expect: 'zh-HK' },
  { name: '6 zh-CN 在前 en 在后', langs: 'zh-CN,zh,en', tz: 'America/New_York', expect: 'zh-CN' },
];

function startServer() {
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    const file = resolveStaticPath(DIST, path); // NOSONAR: canonical root containment is enforced
    if (!file || !existsSync(file) || statSync(file).isDirectory()) { // NOSONAR: validated above
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
    await cdp.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/' });
    await new Promise((r) => setTimeout(r, 1500));
    await cdp.send('Runtime.evaluate', { expression: 'try { localStorage.clear() } catch (e) {}' });
    await cdp.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/' });
    // 等首页真的装好（语言选择器在、site.js 已跑完 apply）再读，最多 8s；不靠固定 sleep。
    const got = await cdp.send('Runtime.evaluate', {
      expression: '(function(){ return new Promise(function (res) { var t0 = Date.now(); (function poll(){ var s = document.querySelector(".site-nav-lang-select"); var ready = s && !document.documentElement.classList.contains("i18n-pending"); if (ready || Date.now() - t0 > 8000) return res({ lang: document.documentElement.lang, langs: navigator.languages.join(","), tz: Intl.DateTimeFormat().resolvedOptions().timeZone, auto: s ? s.querySelector("option[value=auto]").textContent : null, url: location.href }); setTimeout(poll, 100); })(); }); })()',
      returnByValue: true,
      awaitPromise: true,
    });
    const v = got.result.value;
    check(c.name + ' → ' + c.expect, v.lang === c.expect, JSON.stringify(v));
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
