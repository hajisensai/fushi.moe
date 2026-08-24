#!/usr/bin/env node
/*
 * 下载页选源的行为验证。
 *
 * 用 CDP 请求拦截构造确定性场景，不碰真实网络——否则「CF 通不通」
 * 取决于跑测试那台机器当时的网络，测不出结论。
 *
 * 三个场景对应三条必须成立的性质：
 *   A. 两边都通    -> 自动挑更快的那个，链接指向它
 *   B. CF 不通     -> 自动切到 GitHub，且 CF 按钮标成连不上
 *   C. 两边都不通  -> 不能变成空壳，链接退回 GitHub Releases 页面并给出说明
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, '..', '.vitepress', 'dist');
const PORT = 8801;
const DEBUG_PORT = 9421;

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

const FAKE_RELEASE = {
  tag: 'v9.9.9',
  publishedAt: '2026-08-24T00:00:00Z',
  slots: {
    'android-arm64': { url: 'https://dl.fushi.moe/latest/android-arm64', name: 'fushi-9.9.9-arm64-v8a.apk', size: 138412032 },
    'android-arm32': { url: 'https://dl.fushi.moe/latest/android-arm32', name: 'fushi-9.9.9-armeabi-v7a.apk', size: 135266304 },
    'android-x64': { url: 'https://dl.fushi.moe/latest/android-x64', name: 'fushi-9.9.9-x86_64.apk', size: 119537664 },
    windows: { url: 'https://dl.fushi.moe/latest/windows', name: 'fushi-9.9.9-windows-setup.exe', size: 246415360 },
    macos: { url: 'https://dl.fushi.moe/latest/macos', name: 'fushi-9.9.9-macos.zip', size: 298844160 },
    ios: { url: 'https://dl.fushi.moe/latest/ios', name: 'fushi-9.9.9-ios.ipa', size: 66060288 },
  },
};

const GH_API_RELEASE = {
  tag_name: 'v9.9.9',
  assets: Object.values(FAKE_RELEASE.slots).map((s) => ({ name: s.name, size: s.size })),
};

function startServer() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(req.url.split('?')[0]);
    const file = normalize(join(DIST, path === '/' ? '/index.html' : path));
    if (!file.startsWith(normalize(DIST)) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404).end('not found');
      return;
    }
    const buf = readFileSync(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(buf);
  });
  return new Promise((r) => server.listen(PORT, '127.0.0.1', () => r(server)));
}

async function cdpConnect() {
  for (let i = 0; i < 80; i++) {
    try {
      const list = await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/list').then((r) => r.json());
      const page = list.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* 还没起来 */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('连不上 CDP');
}

function makeClient(ws) {
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id !== undefined) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
    } else {
      for (const l of listeners) l(msg);
    }
  });
  return {
    onEvent: (fn) => listeners.push(fn),
    send(method, params = {}) {
      const myId = ++id;
      return new Promise((resolve, reject) => {
        pending.set(myId, { resolve, reject });
        ws.send(JSON.stringify({ id: myId, method, params }));
      });
    },
  };
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok });
  console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (detail ? '  -- ' + detail : ''));
}

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');

/* 拦截器只装一次，读这个可变状态。
   每个场景各装一个 onEvent 的话，先注册的那个会一直抢先应答请求，
   后面的场景就永远是第一个场景的结果——第一版就是这么假绿的。 */
const scenario = { cfUp: true, ghUp: true };

function installInterceptor(cdp) {
  cdp.onEvent(async (msg) => {
    if (msg.method !== 'Fetch.requestPaused') return;
    const { requestId, request } = msg.params;
    const url = request.url;
    try {
      if (url.includes('dl.fushi.moe')) {
        if (!scenario.cfUp) {
          await cdp.send('Fetch.failRequest', { requestId, errorReason: 'ConnectionFailed' });
          return;
        }
        await cdp.send('Fetch.fulfillRequest', {
          requestId,
          responseCode: 200,
          responseHeaders: [
            { name: 'content-type', value: 'application/json' },
            { name: 'access-control-allow-origin', value: '*' },
          ],
          body: b64(JSON.stringify(FAKE_RELEASE)),
        });
        return;
      }
      if (url.includes('api.github.com')) {
        if (!scenario.ghUp) {
          await cdp.send('Fetch.failRequest', { requestId, errorReason: 'ConnectionFailed' });
          return;
        }
        await cdp.send('Fetch.fulfillRequest', {
          requestId,
          responseCode: 200,
          responseHeaders: [
            { name: 'content-type', value: 'application/json' },
            { name: 'access-control-allow-origin', value: '*' },
          ],
          body: b64(JSON.stringify(GH_API_RELEASE)),
        });
        return;
      }
      if (url.includes('github.com')) {
        if (!scenario.ghUp) {
          await cdp.send('Fetch.failRequest', { requestId, errorReason: 'ConnectionFailed' });
          return;
        }
        await cdp.send('Fetch.fulfillRequest', {
          requestId,
          responseCode: 200,
          responseHeaders: [{ name: 'content-type', value: 'text/html' }],
          body: b64('<html></html>'),
        });
        return;
      }
      await cdp.send('Fetch.continueRequest', { requestId });
    } catch {
      /* 请求可能已被取消 */
    }
  });
}

async function runScenario(cdp, label, { cfUp, ghUp }) {
  scenario.cfUp = cfUp;
  scenario.ghUp = ghUp;

  // 每个场景都从干净状态开始，否则 localStorage 里上一轮的手动选择会污染结论
  await cdp.send('Runtime.evaluate', { expression: 'try { localStorage.clear() } catch (e) {}' });

  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/download.html' });
  await new Promise((r) => setTimeout(r, 6500));

  const state = await cdp.send('Runtime.evaluate', {
    expression: `(function(){
      var status = document.querySelector('.dl-status');
      var btns = [].slice.call(document.querySelectorAll('.dl-buttons button')).map(function (b) {
        return { text: b.textContent.replace(/\s+/g, ' ').trim(), on: b.classList.contains('on'), dead: b.classList.contains('dead') };
      });
      var links = [].slice.call(document.querySelectorAll('.dl-table a')).map(function (a) { return a.getAttribute('href'); });
      var warn = document.querySelector('.dl-warn');
      return {
        status: status ? status.textContent.replace(/\s+/g, ' ').trim() : null,
        buttons: btns,
        firstLink: links[0] || null,
        allLinks: links,
        warn: warn ? warn.textContent.replace(/\s+/g, ' ').trim() : null
      };
    })()`,
    returnByValue: true,
  });

  console.log('\n[' + label + ']');
  console.log('  状态行: ' + state.result.value.status);
  console.log('  按钮: ' + JSON.stringify(state.result.value.buttons));
  console.log('  首个下载链接: ' + state.result.value.firstLink);
  return state.result.value;
}

async function main() {
  const browser = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!browser) throw new Error('找不到 Chrome/Edge');
  if (!existsSync(join(DIST, 'download.html'))) throw new Error('先跑 npm run docs:build');

  const server = await startServer();
  const proc = spawn(
    browser,
    [
      '--headless=new', '--disable-gpu', '--no-first-run', '--no-proxy-server',
      '--user-data-dir=' + join(process.env.TEMP ?? '.', 'fushi-dl-verify'),
      '--remote-debugging-port=' + DEBUG_PORT, 'about:blank',
    ],
    { stdio: 'ignore' },
  );

  const ws = new WebSocket(await cdpConnect());
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  const cdp = makeClient(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  installInterceptor(cdp);

  console.log('--- 场景 A：两边都通 ---');
  const a = await runScenario(cdp, 'A 两边都通', { cfUp: true, ghUp: true });
  check('A 自动选中了某个源', a.buttons.some((b) => b.on), JSON.stringify(a.buttons.map((b) => b.on)));
  check('A 无源被标成连不上', !a.buttons.some((b) => b.dead));
  check('A 链接是具体安装包而非 Releases 首页', a.firstLink !== null && !a.firstLink.endsWith('/releases/latest'), a.firstLink);
  check('A 显示了版本号', (a.status ?? '').includes('v9.9.9'), a.status);

  console.log('\n--- 场景 B：CF 不通 ---');
  const b = await runScenario(cdp, 'B CF 不通', { cfUp: false, ghUp: true });
  check('B 自动切到 GitHub 直连', (b.status ?? '').includes('GitHub 直连'), b.status);
  check('B CF 按钮标成连不上', b.buttons.some((x) => x.text.includes('Cloudflare') && x.dead), JSON.stringify(b.buttons));
  check('B 链接走 github.com 直链', (b.firstLink ?? '').includes('github.com/hajisensai/Fushi/releases/download/'), b.firstLink);
  check('B 仍取到版本清单（走 api.github.com 兜底）', (b.status ?? '').includes('v9.9.9'), b.status);

  console.log('\n--- 场景 C：两边都不通 ---');
  const c = await runScenario(cdp, 'C 两边都不通', { cfUp: false, ghUp: false });
  check('C 两个源都标成连不上', c.buttons.filter((x) => x.dead).length === 2, JSON.stringify(c.buttons));
  check(
    'C 页面没变空壳，链接退回 Releases 页面',
    c.allLinks.length > 0 && c.allLinks.every((h) => h === 'https://github.com/hajisensai/Fushi/releases/latest'),
    c.firstLink,
  );
  check('C 给出了说明文案', (c.warn ?? '').length > 0, c.warn);

  ws.close();
  proc.kill();
  server.close();

  const failed = results.filter((r) => !r.ok);
  console.log('\n' + (results.length - failed.length) + '/' + results.length + ' 项通过');
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('验证脚本自身出错:', e);
  process.exit(2);
});
