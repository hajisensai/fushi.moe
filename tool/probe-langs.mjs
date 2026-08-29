#!/usr/bin/env node
/*
 * 语言墙的一次性取证脚本（不进 npm run verify，只在改这块时手动跑）。
 *
 * 干两件事：
 *  1) 把 .rev 全部揭示掉再滚到 #languages 截视口——这页在 headless 下不揭示就是黑的。
 *  2) 读真实 DOM：chip 数、格子列数、有没有横向溢出，以及 ?lang=en 下第二行
 *     是不是真的被 Intl.DisplayNames 换成了英文名（aii / tok 该回落 data-en）。
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser, openCdp } from './cdp-client.mjs';
import { resolveStaticPath } from './static-path.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(HERE, '..', 'public');
const OUT_DIR = process.env.PROBE_OUT ?? tmpdir();
const PORT = 8791;
const DEBUG_PORT = 9337;
const PROXY = process.env.PROBE_PROXY ?? '';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function startServer() {
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    const file = resolveStaticPath(PUBLIC_DIR, path);
    if (!file || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404).end('not found');
      return;
    }
    const buf = readFileSync(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'content-length': buf.length });
    res.end(buf);
  });
  return new Promise((r) => server.listen(PORT, '127.0.0.1', () => r(server)));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = findBrowser();
  if (!browser) throw new Error('找不到 Chrome/Edge');
  const server = await startServer();
  const profileDir = mkdtempSync(join(tmpdir(), 'fushi-langs-'));

  const args = [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--user-data-dir=' + profileDir, '--remote-debugging-port=' + DEBUG_PORT,
    '--hide-scrollbars', 'about:blank',
  ];
  args.splice(4, 0, PROXY ? '--proxy-server=' + PROXY : '--no-proxy-server');
  const proc = spawn(browser, args, { stdio: 'ignore' });

  const cdp = await openCdp(DEBUG_PORT);
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');

  const evaluate = async (expression) => {
    const r = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'eval failed');
    return r.result.value;
  };

  const shoot = async (name, width, height) => {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: false });
    await evaluate("document.querySelectorAll('.rev').forEach(el => el.classList.add('in'));");
    await evaluate("document.getElementById('languages').scrollIntoView({block:'start'});");
    await sleep(900);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const file = join(OUT_DIR, name);
    writeFileSync(file, Buffer.from(shot.data, 'base64'));
    console.log('截图 ' + file);
  };

  const facts = async () => evaluate(`(() => {
    const wall = document.querySelector('.lang-wall');
    const chips = [...document.querySelectorAll('.lang')];
    const cols = getComputedStyle(wall).gridTemplateColumns.split(' ').length;
    const pick = (iso) => {
      const i = document.querySelector('.lang i[data-iso="' + iso + '"]');
      return i ? i.closest('.lang').querySelector('b').textContent + ' / ' + i.textContent : null;
    };
    const overflow = chips.filter(c => c.scrollWidth > c.clientWidth + 1).map(c => c.textContent);
    return {
      chips: chips.length,
      cols,
      docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      chipOverflow: overflow,
      title: document.querySelector('.langs .h-section').textContent,
      eyebrow: document.querySelector('.langs .eyebrow').textContent,
      note: document.querySelector('.lang-note').textContent.slice(0, 40),
      sample: ['ja','en','aii','tok','grc','yue','sga','ar','km','kn'].map(pick),
    };
  })()`);

  const go = async (url) => {
    await cdp.send('Page.navigate', { url });
    for (let i = 0; i < 120; i++) {
      const ok = await evaluate("document.readyState === 'complete' && !!document.querySelector('.lang-wall')").catch(() => false);
      if (ok) break;
      await sleep(100);
    }
    await sleep(700);
  };

  const base = 'http://127.0.0.1:' + PORT + '/';

  await go(base);
  console.log('\n--- zh-CN（源语言） ---');
  console.log(JSON.stringify(await facts(), null, 1));
  await shoot('langs-zh-1280.png', 1280, 900);

  await go(base + '?lang=en');
  console.log('\n--- ?lang=en（Intl.DisplayNames 路径） ---');
  console.log(JSON.stringify(await facts(), null, 1));
  await shoot('langs-en-1280.png', 1280, 900);

  await go(base + '?lang=ja');
  console.log('\n--- ?lang=ja ---');
  console.log(JSON.stringify((await facts()).sample, null, 1));

  await go(base + '?lang=zh-CN');
  console.log('\n--- 宽度扫描（列数 / 横向溢出 / 格内溢出） ---');
  for (const w of [320, 360, 390, 430, 480, 560, 740, 900, 1024, 1440]) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 741 });
    await sleep(250);
    const f = await facts();
    console.log('  ' + String(w).padStart(4) + 'px  cols=' + f.cols + '  docOverflow=' + f.docOverflow + '  chipOverflow=' + f.chipOverflow.length);
  }
  await shoot('langs-zh-390.png', 390, 844);
  await shoot('langs-zh-1440.png', 1440, 950);

  proc.kill();
  server.close();
  process.exit(0);
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
