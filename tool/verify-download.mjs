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
import { existsSync, mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser, openCdp } from './cdp-client.mjs';
import { resolveStaticPath } from './static-path.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, '..', '.vitepress', 'dist');
const PORT = 8801;
const DEBUG_PORT = 9421;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

const FAKE_RELEASE = {
  channel: 'stable',
  tag: 'v9.9.9',
  version: '9.9.9',
  publishedAt: '2026-08-24T00:00:00Z',
  slots: {
    'android-arm64': { url: '/releases/latest/android-arm64', githubUrl: 'https://github.com/hajisensai/Fushi/releases/download/v9.9.9/fushi-9.9.9-arm64-v8a.apk', name: 'fushi-9.9.9-arm64-v8a.apk', size: 138412032 },
    'android-arm32': { url: '/releases/latest/android-arm32', githubUrl: 'https://github.com/hajisensai/Fushi/releases/download/v9.9.9/fushi-9.9.9-armeabi-v7a.apk', name: 'fushi-9.9.9-armeabi-v7a.apk', size: 135266304 },
    'android-x64': { url: '/releases/latest/android-x64', githubUrl: 'https://github.com/hajisensai/Fushi/releases/download/v9.9.9/fushi-9.9.9-x86_64.apk', name: 'fushi-9.9.9-x86_64.apk', size: 119537664 },
    windows: { url: '/releases/latest/windows', githubUrl: 'https://github.com/hajisensai/Fushi/releases/download/v9.9.9/fushi-9.9.9-windows-setup.exe', name: 'fushi-9.9.9-windows-setup.exe', size: 246415360 },
    macos: { url: '/releases/latest/macos', githubUrl: 'https://github.com/hajisensai/Fushi/releases/download/v9.9.9/fushi-9.9.9-macos.zip', name: 'fushi-9.9.9-macos.zip', size: 298844160 },
    ios: { url: '/releases/latest/ios', githubUrl: 'https://github.com/hajisensai/Fushi/releases/download/v9.9.9/fushi-9.9.9-ios.ipa', name: 'fushi-9.9.9-ios.ipa', size: 66060288 },
  },
};

const GH_STATIC_MANIFEST = {
  tag: 'v9.9.9',
  version: '9.9.9',
  channel: 'formal',
  assets: Object.values(FAKE_RELEASE.slots).map((s) => ({
    name: s.name,
    size: s.size,
    browser_download_url: s.githubUrl,
  })),
};

/* 调试通道：Android 只有一个含全部架构的通用包，桌面三件套照旧。 */
const FAKE_DEBUG_RELEASE = {
  channel: 'debug',
  tag: 'v9.9.10-debug.123+abc1234',
  version: '9.9.10-debug.123',
  publishedAt: '2026-08-25T00:00:00Z',
  slots: {
    'android-universal': { url: '/releases/debug/android-universal', githubUrl: 'https://github.com/hajisensai/Fushi/releases/download/v9.9.10-debug.123%2Babc1234/fushi-9.9.10-debug.123-abc1234-debug.apk', name: 'fushi-9.9.10-debug.123-abc1234-debug.apk', size: 0 },
    windows: { url: '/releases/debug/windows', githubUrl: 'https://github.com/hajisensai/Fushi/releases/download/v9.9.10-debug.123%2Babc1234/fushi-9.9.10-debug.123-windows-setup.exe', name: 'fushi-9.9.10-debug.123-windows-setup.exe', size: 0 },
    macos: { url: '/releases/debug/macos', githubUrl: 'https://github.com/hajisensai/Fushi/releases/download/v9.9.10-debug.123%2Babc1234/fushi-9.9.10-debug.123-macos.zip', name: 'fushi-9.9.10-debug.123-macos.zip', size: 0 },
    ios: { url: '/releases/debug/ios', githubUrl: 'https://github.com/hajisensai/Fushi/releases/download/v9.9.10-debug.123%2Babc1234/fushi-9.9.10-debug.123-ios.ipa', name: 'fushi-9.9.10-debug.123-ios.ipa', size: 0 },
  },
};

const GH_STATIC_DEBUG_MANIFEST = {
  tag: FAKE_DEBUG_RELEASE.tag,
  version: FAKE_DEBUG_RELEASE.version,
  channel: 'debug',
  assets: Object.values(FAKE_DEBUG_RELEASE.slots).map((s) => ({
    name: s.name,
    browser_download_url: s.githubUrl,
  })),
};

function startServer() {
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    const file = resolveStaticPath(DIST, path); // NOSONAR: canonical root containment is enforced
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
      const parsed = new URL(url);
      if (parsed.pathname === '/releases/api/latest') {
        if (!scenario.cfUp) {
          await cdp.send('Fetch.failRequest', { requestId, errorReason: 'ConnectionFailed' });
          return;
        }
        // Worker 按 ?channel= 回对应通道的清单，并在应答里带回 channel（页面靠它识别老 Worker）。
        const debug = parsed.searchParams.get('channel') === 'debug';
        await cdp.send('Fetch.fulfillRequest', {
          requestId,
          responseCode: 200,
          responseHeaders: [
            { name: 'content-type', value: 'application/json' },
            { name: 'access-control-allow-origin', value: '*' },
          ],
          body: b64(JSON.stringify(debug ? FAKE_DEBUG_RELEASE : FAKE_RELEASE)),
        });
        return;
      }
      if (url.includes('raw.githubusercontent.com')) {
        if (!scenario.ghUp) {
          await cdp.send('Fetch.failRequest', { requestId, errorReason: 'ConnectionFailed' });
          return;
        }
        const debug = parsed.pathname.endsWith('latest-debug-fushi.json');
        await cdp.send('Fetch.fulfillRequest', {
          requestId,
          responseCode: 200,
          responseHeaders: [
            { name: 'content-type', value: 'application/json' },
            { name: 'access-control-allow-origin', value: '*' },
          ],
          body: b64(JSON.stringify(debug ? GH_STATIC_DEBUG_MANIFEST : GH_STATIC_MANIFEST)),
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

async function runScenario(cdp, label, { cfUp, ghUp, channel }) {
  scenario.cfUp = cfUp;
  scenario.ghUp = ghUp;

  // 每个场景都从干净状态开始，否则 localStorage 里上一轮的手动选择会污染结论
  await cdp.send('Runtime.evaluate', { expression: 'try { localStorage.clear() } catch (e) {}' });

  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/download.html' });
  await new Promise((r) => setTimeout(r, 6500));

  if (channel) {
    // 通道切换是页内状态：点按钮 → 重新取该通道清单 → 表格按通道换行。
    await cdp.send('Runtime.evaluate', {
      expression: '(function(){' +
        'var b = [].slice.call(document.querySelectorAll(".dl-channels button")).find(function (x) { return x.textContent.indexOf(' + JSON.stringify(channel) + ') >= 0; });' +
        'if (b) b.click(); return !!b; })()',
      returnByValue: true,
    });
    await new Promise((r) => setTimeout(r, 3000));
  }

  const state = await cdp.send('Runtime.evaluate', {
    expression: `(function(){
      var status = document.querySelector('.dl-status');
      var btns = [].slice.call(document.querySelectorAll('.dl-buttons button')).map(function (b) {
        return { text: b.textContent.replace(/\s+/g, ' ').trim(), on: b.classList.contains('on'), dead: b.classList.contains('dead') };
      });
      var links = [].slice.call(document.querySelectorAll('.dl-table a')).map(function (a) { return a.getAttribute('href'); });
      var warn = document.querySelector('.dl-warn');
      var channels = [].slice.call(document.querySelectorAll('.dl-channels button')).map(function (b) {
        return { text: b.textContent.replace(/\s+/g, ' ').trim(), on: b.classList.contains('on') };
      });
      var rows = [].slice.call(document.querySelectorAll('.dl-table tbody tr')).map(function (tr) {
        return tr.querySelector('td b') ? tr.querySelector('td b').textContent.trim() : '';
      });
      return {
        status: status ? status.textContent.replace(/\s+/g, ' ').trim() : null,
        buttons: btns,
        channels: channels,
        rows: rows,
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
  const browser = findBrowser();
  if (!browser) throw new Error('找不到 Chrome/Edge');
  if (!existsSync(join(DIST, 'download.html'))) throw new Error('先跑 npm run docs:build');

  const server = await startServer();
  const profileDir = mkdtempSync(join(tmpdir(), 'fushi-download-profile-')); // NOSONAR: randomized dir
  const proc = spawn(
    browser,
    [
      '--headless=new', '--disable-gpu', '--no-first-run', '--no-proxy-server',
      '--user-data-dir=' + profileDir,
      '--remote-debugging-port=' + DEBUG_PORT, 'about:blank',
    ],
    { stdio: 'ignore' },
  );

  const cdp = await openCdp(DEBUG_PORT);
  const ws = cdp.socket;
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
  check('B 仍取到版本清单（走 GitHub 静态 JSON 兜底）', (b.status ?? '').includes('v9.9.9'), b.status);

  console.log('\n--- 场景 C：两边都不通 ---');
  const c = await runScenario(cdp, 'C 两边都不通', { cfUp: false, ghUp: false });
  check('C 两个源都标成连不上', c.buttons.filter((x) => x.dead).length === 2, JSON.stringify(c.buttons));
  check(
    'C 页面没变空壳，链接退回 Releases 页面',
    c.allLinks.length > 0 && c.allLinks.every((h) => h === 'https://github.com/hajisensai/Fushi/releases/latest'),
    c.firstLink,
  );
  check('C 给出了说明文案', (c.warn ?? '').length > 0, c.warn);

  console.log('\n--- 场景 D：切到调试版 ---');
  const d = await runScenario(cdp, 'D 调试版', { cfUp: true, ghUp: true, channel: '调试版' });
  check('D 调试版按钮处于选中', d.channels.some((x) => x.text.includes('调试版') && x.on), JSON.stringify(d.channels));
  check('D 状态行显示调试版 tag', (d.status ?? '').includes('v9.9.10-debug.123'), d.status);
  check('D 表格换成调试版槽位（通用 Android 包，无 arm64 行）', d.rows.includes('Android') && !d.rows.some((r) => r.includes('arm64')), JSON.stringify(d.rows));
  check('D 链接指向调试版通道', d.allLinks.length > 0 && d.allLinks.every((h) => h.includes('/releases/debug/') || h.includes('-debug.')), JSON.stringify(d.allLinks));

  console.log('\n--- 场景 E：CF 不通时切调试版走 GitHub 静态清单 ---');
  const e = await runScenario(cdp, 'E CF 不通 + 调试版', { cfUp: false, ghUp: true, channel: '调试版' });
  check('E 仍取到调试版清单', (e.status ?? '').includes('v9.9.10-debug.123'), e.status);
  check('E 链接走调试版 GitHub 直链', (e.firstLink ?? '').includes('-debug.'), e.firstLink);

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
