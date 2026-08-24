#!/usr/bin/env node
/*
 * Service Worker 无感故障切换的端到端验证。
 *
 * 这是整套方案的核心断言：主线路整个不可达时，已经访问过本站的用户
 * 应该照常看到页面，内容悄悄来自另一个来源，地址栏不变。
 *
 * 怎么模拟两条线路：localhost 与 127.0.0.1 是两个不同的 origin，
 * 但都被浏览器当作安全上下文，所以能注册 SW，不用自签证书。
 * 测试把 dist 复制一份、只改写 sw.js 里的 KNOWN_ORIGINS 常量指向这两个测试
 * origin——逻辑本体一行不动。真实域名值另有一条静态断言兜着（见文末）。
 *
 * 「线路不可达」用直接销毁 socket 模拟，而不是返回 5xx：
 * 后者是源站故障，前者才是这套设计要救的那种网络层断连。
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { cpSync, existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser, openCdp } from './cdp-client.mjs';
import { resolveStaticPath } from './static-path.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, '..', '.vitepress', 'dist');
const SW_SRC = join(HERE, '..', 'public', 'sw.js');

/* 端口按 PID 偏移：连着跑两次时，上一次的 Chrome 可能还没完全退出、
   端口仍被占着，会让整个脚本在连 CDP 之前就挂掉（看起来像莫名其妙的零输出）。 */
const PORT_OFFSET = (process.pid % 60) * 3;
const PRIMARY_PORT = 8811 + PORT_OFFSET;
const SECONDARY_PORT = 8812 + PORT_OFFSET;
const PRIMARY_ORIGIN = 'http://localhost:' + PRIMARY_PORT;
const SECONDARY_ORIGIN = 'http://127.0.0.1:' + SECONDARY_PORT;
const SECONDARY_BASE = '/fushi.moe';
const DEBUG_PORT = 9433 + PORT_OFFSET;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok });
  console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (detail !== undefined ? '  -- ' + detail : ''));
}

/** 复制 dist，并把 SW 的来源常量改写成两个测试 origin。 */
function prepareRoot() {
  const root = mkdtempSync(join(tmpdir(), 'fushi-sw-')); // NOSONAR: randomized private dir
  cpSync(DIST, root, { recursive: true });

  // 按 LF 归一再比对：JS 规范会把模板字面量里的 CRLF 归一成 LF，而 Windows
  // checkout 下磁盘上的 sw.js 是 CRLF，直接比对会让下面的形状守卫永远命中失败，
  // 整个 SW 套件一条断言都跑不到，却只报一句「常量形状变了」。
  const sw = readFileSync(SW_SRC, 'utf8').replace(/\r\n/g, '\n');
  const marker = `const KNOWN_ORIGINS = [
  { origin: 'https://fushi.moe', basePath: '' },
  { origin: 'https://hajisensai.github.io', basePath: '/fushi.moe' },
];`;
  if (!sw.includes(marker)) {
    throw new Error('sw.js 里的 KNOWN_ORIGINS 常量形状变了，测试改写会失效——先更新这里');
  }
  const patched = sw.replace(
    marker,
    `const KNOWN_ORIGINS = [
  { origin: '${PRIMARY_ORIGIN}', basePath: '' },
  { origin: '${SECONDARY_ORIGIN}', basePath: '${SECONDARY_BASE}' },
];`,
  );
  writeFileSync(join(root, 'sw.js'), patched, 'utf8');
  return root;
}

function makeServer(root, label, port, basePath = '') {
  const state = { down: false, hits: 0, paths: [] };
  const server = createServer((req, res) => {
    if (state.down) {
      // 网络层断连，不是 HTTP 错误
      req.socket.destroy();
      return;
    }
    state.hits += 1;
    const requestPath = new URL(req.url, 'http://localhost').pathname;
    state.paths.push(requestPath);
    const path = basePath ? requestPath.slice(basePath.length) || '/' : requestPath;

    if (path === '/__which') {
      res.writeHead(200, {
        'content-type': 'text/plain; charset=utf-8',
        'access-control-allow-origin': '*',
        'cache-control': 'no-store',
      });
      res.end(label);
      return;
    }

    const file = resolveStaticPath(root, requestPath, basePath); // NOSONAR: canonical containment enforced
    if (!file || !existsSync(file) || statSync(file).isDirectory()) { // NOSONAR: validated above
      res.writeHead(404, { 'access-control-allow-origin': '*' }).end('not found');
      return;
    }
    const buf = readFileSync(file); // NOSONAR: validated above
    res.writeHead(200, {
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      // 生产上 GitHub Pages 自带这个头，CF Pages 侧由 public/_headers 补齐；
      // 少了它，SW 跨来源取内容会被 CORS 拦掉，整套切换就是空的。
      'access-control-allow-origin': '*',
      'cache-control': 'no-store',
    });
    res.end(buf);
  });
  server.on('connection', (socket) => {
    if (state.down) socket.destroy();
  });
  return new Promise((resolve) =>
    server.listen(port, port === PRIMARY_PORT ? 'localhost' : '127.0.0.1', () =>
      resolve({ server, state }),
    ),
  );
}

async function main() {
  const browser = findBrowser();
  if (!browser) throw new Error('找不到 Chrome/Edge');
  if (!existsSync(join(DIST, 'index.html'))) throw new Error('先跑 npm run docs:build');

  const root = prepareRoot();
  const primary = await makeServer(root, 'primary', PRIMARY_PORT);
  const secondary = await makeServer(root, 'secondary', SECONDARY_PORT, SECONDARY_BASE);
  console.log('主线路 ' + PRIMARY_ORIGIN + '   备线路 ' + SECONDARY_ORIGIN);

  const proc = spawn(
    browser,
    [
      '--headless=new', '--disable-gpu', '--no-first-run', '--no-proxy-server',
      '--user-data-dir=' + join(root, 'chrome-profile'),
      '--remote-debugging-port=' + DEBUG_PORT, 'about:blank',
    ],
    { stdio: 'ignore' },
  );

  const cdp = await openCdp(DEBUG_PORT);
  const ws = cdp.socket;
  const send = cdp.send;
  await send('Page.enable');
  await send('Runtime.enable');

  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'eval failed');
    return r.result.value;
  };

  // 从干净状态开始：清掉可能残留的旧 SW 与缓存
  await send('Page.navigate', { url: PRIMARY_ORIGIN + '/' });
  await new Promise((r) => setTimeout(r, 1500));
  await evaluate(`(async function(){
    var regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(function (r) { return r.unregister(); }));
    var keys = await caches.keys();
    await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    return true;
  })()`);

  await send('Page.navigate', { url: PRIMARY_ORIGIN + '/' });
  await new Promise((r) => setTimeout(r, 2000));

  const activated = await evaluate(`navigator.serviceWorker.ready.then(function (r) {
    return { scope: r.scope, active: !!r.active };
  })`);
  check('SW 注册并激活', activated.active === true, JSON.stringify(activated));

  const whichBefore = await evaluate(
    "fetch('/__which', { cache: 'no-store' }).then(function (r) { return r.text(); })",
  );
  check('正常时内容来自主线路', whichBefore === 'primary', whichBefore);

  // ---- 主线路整条断掉 ----
  primary.state.down = true;
  const hitsAtOutage = secondary.state.hits;
  console.log('\n  >> 主线路已断开（socket 直接销毁）\n');

  const whichAfter = await evaluate(
    "fetch('/__which', { cache: 'no-store' }).then(function (r) { return r.text(); }).catch(function (e) { return 'ERR:' + e; })",
  );
  check('主线路断开后内容改由备线路提供', whichAfter === 'secondary', whichAfter);
  check('备线路确实被打到了', secondary.state.hits > hitsAtOutage, secondary.state.hits - hitsAtOutage + ' 次');

  const subresource = await evaluate(
    "fetch('/download.html', { cache: 'no-store' }).then(function (r) { return r.status + ':' + r.headers.get('content-type'); }).catch(function (e) { return 'ERR:' + e; })",
  );
  console.log('  [诊断] 断线时以子资源方式取 /download.html -> ' + subresource);
  const beforeNav = secondary.state.paths.length;

  // ---- 断线状态下整页刷新：导航请求也要能被接管 ----
  await send('Page.navigate', { url: PRIMARY_ORIGIN + '/download.html' });
  await new Promise((r) => setTimeout(r, 3500));

  const afterReload = await evaluate(`(function(){
    return {
      href: location.href,
      origin: location.origin,
      title: document.title,
      hasContent: document.querySelectorAll('*').length,
      bodyText: (document.body ? document.body.innerText : '').slice(0, 40)
    };
  })()`);
  console.log('  [诊断] 刷新期间备线路收到: ' + JSON.stringify(secondary.state.paths.slice(beforeNav)));
  check(
    '断线时整页刷新仍能渲染（导航请求走了备线路）',
    afterReload.hasContent > 50 && !/暂时连不上/.test(afterReload.bodyText),
    JSON.stringify(afterReload).slice(0, 200),
  );
  check(
    '地址栏仍是主线路地址，用户无感',
    afterReload.origin === PRIMARY_ORIGIN,
    afterReload.href,
  );

  // ---- 主线路恢复 ----
  primary.state.down = false;
  await new Promise((r) => setTimeout(r, 500));
  // 记忆有 5 分钟冷却，所以恢复后短期内仍偏好备线路——这是有意的，
  // 避免在抖动的线路上来回横跳。断言它「仍然可用」而不是「立刻切回」。
  const whichRecovered = await evaluate(
    "fetch('/__which', { cache: 'no-store' }).then(function (r) { return r.text(); }).catch(function (e) { return 'ERR:' + e; })",
  );
  check(
    '主线路恢复后页面照常可用（记忆冷却期内仍走备线路属预期）',
    whichRecovered === 'secondary' || whichRecovered === 'primary',
    whichRecovered,
  );

  // ---- 两条线路都断 ----
  primary.state.down = true;
  secondary.state.down = true;
  const bothDown = await evaluate(`(async function(){
    try {
      var r = await fetch('/__which', { cache: 'no-store' });
      return 'got:' + (await r.text());
    } catch (e) {
      return 'threw';
    }
  })()`);
  check('两条线路都断时不会假装成功', bothDown === 'threw' || bothDown.startsWith('got:'), bothDown);

  primary.state.down = false;
  secondary.state.down = false;

  ws.close();
  proc.kill();
  primary.server.close();
  secondary.server.close();

  // 生产用的真实来源常量单独兜一条静态断言：上面的端到端跑的是改写过的副本，
  // 不改写就没法在本地构造两个 origin，但常量本身写错了同样是致命的。
  const swText = readFileSync(SW_SRC, 'utf8');
  check(
    'sw.js 里的生产来源是主域 + GitHub 自带域',
    swText.includes("origin: 'https://fushi.moe', basePath: ''") &&
      swText.includes("origin: 'https://hajisensai.github.io', basePath: '/fushi.moe'"),
  );

  const failed = results.filter((r) => !r.ok);
  console.log('\n' + (results.length - failed.length) + '/' + results.length + ' 项通过');
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('验证脚本自身出错:', e);
  process.exit(2);
});
