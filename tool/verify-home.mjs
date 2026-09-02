#!/usr/bin/env node
/*
 * 首页拆分后的实测验证。
 *
 * 拆分动的是一个 14MB 的生成文件，光看体积下降说明不了任何事——
 * 必须证明页面还能跑：没有 JS 报错、抽出去的媒体真能播、异步词库真填进去了、
 * 查词交互真能弹出结果。
 *
 * 断言一律要「真的执行那条路径」。只查 typeof 是没用的：三态提示函数
 * 第一版就是 typeof 通过、真调用必抛 ReferenceError（toast 在页面自己的
 * IIFE 作用域里，全局函数看不见它）。
 *
 * 这页在 headless 下截图恒黑（.rev 揭示 + 平铺伪影），所以取证一律走
 * CDP Runtime.evaluate 读真实 DOM 状态，不依赖像素。
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
const PUBLIC_DIR = join(HERE, '..', 'public');
const PORT = 8788;
const DEBUG_PORT = 9333;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/*
 * 既有噪声，与本次拆分无关：
 * - /favicon.ico：浏览器自己去探的，本站从来就没有这个文件。
 * - image://：查词弹窗里的词典配图用的是 App 内部 scheme，网页环境本就解析不了。
 *   已用拆分前的原始 index.html 做过对照实验：同样点击、同样报这 2 条、
 *   弹窗同样增长 113 个元素，说明是既有行为而不是拆分引入的。
 */
const PREEXISTING_NOISE = ['/favicon.ico', 'image://', '/api/stars'];
/*
 * 第三方外链（Google Fonts 等）连不连得上取决于跑测试那台机器的外网，本机实测会
 * 间歇性 ERR_CONNECTION_TIMED_OUT 把「无未捕获 JS 异常」打红。它们不是本站产物，
 * 只作诊断打印，不参与判定；本站资源（127.0.0.1）的失败照常算红。
 */
function isThirdParty(text) {
  return /https?:\/\/(?!127\.0\.0\.1|localhost)[^\s/]+/i.test(text);
}
function isNoise(text) {
  return PREEXISTING_NOISE.some((n) => text.includes(n)) || isThirdParty(text);
}

/*
 * /api/stars 在生产是边缘 Worker 的路由，本地静态服务里必须自己扮演它：
 * 一来 404 会被「无失败请求」判红，二来断言要能确定性地走「拿到 / 拿不到」两条路径，
 * 不能取决于这台机器能不能连上 api.github.com。
 */
const STARS_FIXTURE = 1234;
const starsMode = { fail: true, stars: STARS_FIXTURE };

function startServer() {
  const requested = [];
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    requested.push(path);

    if (path === '/__set-stars') {
      starsMode.fail = url.searchParams.get('mode') === 'fail';
      const value = Number(url.searchParams.get('value'));
      if (Number.isFinite(value) && value > 0) starsMode.stars = value;
      res.writeHead(200, { 'content-type': 'text/plain', 'cache-control': 'no-store' });
      res.end(starsMode.fail ? 'fail' : String(starsMode.stars));
      return;
    }
    if (path === '/api/stars') {
      const body = starsMode.fail
        ? JSON.stringify({ error: 'stars unavailable' })
        : JSON.stringify({ repo: 'hajisensai/Fushi', stars: starsMode.stars });
      res.writeHead(starsMode.fail ? 503 : 200, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      });
      res.end(body);
      return;
    }
    const file = resolveStaticPath(PUBLIC_DIR, path); // NOSONAR: canonical root containment is enforced
    if (!file || !existsSync(file) || statSync(file).isDirectory()) { // NOSONAR: validated above
      res.writeHead(404).end('not found');
      return;
    }
    const buf = readFileSync(file); // NOSONAR: validated above
    res.writeHead(200, {
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      'content-length': buf.length,
      'accept-ranges': 'bytes',
    });
    res.end(buf);
  });
  return new Promise((resolve) =>
    server.listen(PORT, '127.0.0.1', () => resolve({ server, requested })),
  );
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (detail ? '  -- ' + detail : ''));
}

async function main() {
  const browser = findBrowser();
  if (!browser) throw new Error('找不到 Chrome/Edge');

  const { server, requested } = await startServer();
  const profileDir = mkdtempSync(join(tmpdir(), 'fushi-home-profile-')); // NOSONAR: randomized dir
  console.log('静态服务器: http://127.0.0.1:' + PORT + '  (' + PUBLIC_DIR + ')');

  const proc = spawn(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--no-proxy-server',
      // star 数拿不到时 site.js 会兜底打 api.github.com。断言必须只由本地
      // /api/stars 决定，所以把这个兜底源解析到一个必然连不上的地址。
      '--host-resolver-rules=MAP api.github.com 127.0.0.1:9',
      '--user-data-dir=' + profileDir,
      '--remote-debugging-port=' + DEBUG_PORT,
      '--autoplay-policy=no-user-gesture-required',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  const cdp = await openCdp(DEBUG_PORT);
  const ws = cdp.socket;

  const jsErrors = [];
  const failedRequests = [];
  const noise = [];
  cdp.onEvent((msg) => {
    if (msg.method === 'Runtime.exceptionThrown') {
      jsErrors.push(msg.params.exceptionDetails?.exception?.description ?? 'exception');
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      const line = msg.params.entry.text + ' ' + (msg.params.entry.url ?? '');
      (isNoise(line) ? noise : jsErrors).push(line);
    }
    if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) {
      const url = msg.params.response.url;
      (isNoise(url) ? noise : failedRequests).push(
        msg.params.response.status + ' ' + url,
      );
    }
  });

  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Network.enable');
  await cdp.send('Page.enable');

  const t0 = Date.now();
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/' });
  let pageLoaded = false;
  cdp.onEvent((m) => {
    if (m.method === 'Page.loadEventFired') pageLoaded = true;
  });
  let interactiveReady = false;
  while (Date.now() - t0 < 25000) {
    const state = await cdp.send('Runtime.evaluate', {
      expression: 'typeof FUSHI_DEMO_DATA !== "undefined" && typeof FUSHI_TERMMAP !== "undefined"',
      returnByValue: true,
    });
    if (state.result?.value === true) {
      interactiveReady = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const readyMs = Date.now() - t0;

  const evaluate = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: expr,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description ?? 'eval failed');
    }
    return r.result.value;
  };

  console.log('\n--- 断言 ---');
  check(
    '首页交互脚本就绪（不等待第三方字体）',
    interactiveReady,
    readyMs + 'ms' + (pageLoaded ? ' / load 已触发' : ' / load 仍等待第三方资源'),
  );

  const title = await evaluate('document.title');
  check('标题非空', typeof title === 'string' && title.length > 0, JSON.stringify(title));

  const gameCardImage = await evaluate(`(function(){
    var img = document.querySelector('.pcell[href="#sec-g"] img');
    return img ? {
      src: img.getAttribute('src'),
      complete: img.complete,
      width: img.naturalWidth,
      height: img.naturalHeight
    } : null;
  })()`);
  check(
    '游戏入口卡片使用当前 Hook 演示图且成功加载',
    gameCardImage && gameCardImage.src === '/demo/media/e6c5fafa4c001798.jpg' &&
      gameCardImage.complete && gameCardImage.width > 0 && gameCardImage.height > 0,
    JSON.stringify(gameCardImage),
  );

  const giftLink = await evaluate(`(function(){
    var a = document.querySelector('.site-footer-gift > a');
    var code = document.querySelector('.site-footer-gift code');
    return a && code ? {
      href: a.href,
      target: a.target,
      rel: a.rel,
      recipient: code.textContent.trim()
    } : null;
  })()`);
  check(
    '首页礼赠入口只指向 Claude 官方页面并显示收件邮箱',
    giftLink && giftLink.href === 'https://claude.ai/gift' &&
      giftLink.target === '_blank' && giftLink.rel.includes('noopener') &&
      giftLink.recipient === 'vw6cnhd9f7@privaterelay.appleid.com',
    JSON.stringify(giftLink),
  );

  const termmap = await evaluate(
    'FUSHI_DEMO_DATA.termmapPromise.then(function(){ return { ready: FUSHI_DEMO_DATA.termmapReady, failed: FUSHI_DEMO_DATA.termmapFailed, keys: Object.keys(FUSHI_TERMMAP).length }; })',
  );
  check('异步词库加载成功', termmap.ready === true && termmap.failed === false, JSON.stringify(termmap));
  // 不拿魔数比：设计稿每次改演示词库，键数就变一次，硬编码只会周期性假红。
  // 这条要守的是「原地填充没丢数据」——那就跟 JSON 源文件自己的键数比。
  const srcKeys = await evaluate(
    "fetch('/demo/data/termmap.json').then(function(r){return r.json()}).then(function(d){return Object.keys(d).length})",
  );
  check(
    '词库原地填充无损（与 JSON 源键数一致）',
    typeof srcKeys === 'number' && srcKeys > 0 && termmap.keys === srcKeys,
    'JSON ' + srcKeys + ' 键 / 页面 ' + termmap.keys + ' 键',
  );

  // 三态提示必须真的能调用。第一版这里 typeof 通过、真调用抛 ReferenceError。
  const missStates = await evaluate(`(function(){
    var got = [];
    var stub = function (m) { got.push(m); };
    var saved = [FUSHI_DEMO_DATA.termmapReady, FUSHI_DEMO_DATA.termmapFailed];
    try {
      FUSHI_DEMO_DATA.termmapReady = false; FUSHI_DEMO_DATA.termmapFailed = false;
      fushiTermMiss(stub);
      FUSHI_DEMO_DATA.termmapFailed = true;
      fushiTermMiss(stub);
      FUSHI_DEMO_DATA.termmapFailed = false; FUSHI_DEMO_DATA.termmapReady = true;
      fushiTermMiss(stub);
      return { ok: true, msgs: got };
    } catch (e) {
      return { ok: false, err: String(e) };
    } finally {
      FUSHI_DEMO_DATA.termmapReady = saved[0]; FUSHI_DEMO_DATA.termmapFailed = saved[1];
    }
  })()`);
  check(
    '三态提示可真实调用且文案区分',
    missStates.ok === true &&
      missStates.msgs.length === 3 &&
      new Set(missStates.msgs).size === 3,
    JSON.stringify(missStates).slice(0, 200),
  );

  // 真正点一个字符，验证同步 TERMMAP[key] 查得到、弹窗真的开。
  // 这是「异步填充 + 同步调用点」这条设计的唯一有效证据。
  //
  // 必须排在音视频断言之前：那些断言会调 v.load() 扰动播放器状态，
  // 而查词回调里要 pauseForLookup(video)，在被扰动的页面上断言交互不作数。
  const lookup = await evaluate(`(function(){
    function deepCount(root){
      var n = 0, els = root.querySelectorAll('*');
      n += els.length;
      for (var i = 0; i < els.length; i++) { if (els[i].shadowRoot) n += deepCount(els[i].shadowRoot); }
      return n;
    }
    var spans = [].slice.call(document.querySelectorAll('span.ch'));
    var before = deepCount(document);
    for (var i = 0; i < Math.min(spans.length, 20); i++) {
      spans[i].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      var after = deepCount(document);
      if (after > before + 5) {
        return { ok: true, index: i, grew: after - before, text: spans[i].textContent, inMap: !!FUSHI_TERMMAP[spans[i].textContent] };
      }
    }
    return { ok: false, spans: spans.length, before: before };
  })()`);
  check('点字符能触发查词弹窗（同步读到异步填充的词库）', lookup.ok === true, JSON.stringify(lookup).slice(0, 220));

  const popupOuterScroll = await evaluate(`(function(){
    return new Promise(function(resolve){
      var before = window.scrollY;
      window.dispatchEvent(new Event('scroll'));
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        resolve({
          before: before,
          after: window.scrollY,
          popupCount: document.querySelectorAll('.hibiki-popup-card').length,
          bodyOverflow: document.body.style.overflow || ''
        });
      }); });
    });
  })()`);
  check(
    '外层 scroll 首帧关闭查词栈且不锁 body',
    popupOuterScroll.popupCount === 0 &&
      popupOuterScroll.bodyOverflow !== 'hidden',
    JSON.stringify(popupOuterScroll),
  );

  const audioShape = await evaluate(
    '(function(){ var ks = Object.keys(FUSHI_AUDIO); var v = FUSHI_AUDIO[ks[0]]; return { n: ks.length, sample: String(v).slice(0, 40), isDataUri: String(v).startsWith("data:") }; })()',
  );
  check(
    '词音频已换成文件 URL（非 data URI）',
    audioShape.isDataUri === false && audioShape.sample.startsWith('/demo/media/'),
    JSON.stringify(audioShape),
  );

  // 用真的音频元素验证，而不是 fetch()——媒体能不能播才是要保证的事，
  // 而 fetch() 取媒体类型在 Chrome 下会被特殊处理，不能代表播放路径。
  const audioPlayable = await evaluate(`(function(){
    var ks = Object.keys(FUSHI_AUDIO);
    var url = FUSHI_AUDIO[ks[0]];
    return new Promise(function (resolve) {
      var a = new Audio();
      var done = false;
      var finish = function (r) { if (!done) { done = true; resolve(r); } };
      a.addEventListener('loadedmetadata', function () {
        finish({ ok: true, duration: Math.round(a.duration * 1000) / 1000, url: url });
      });
      a.addEventListener('error', function () {
        finish({ ok: false, code: a.error && a.error.code, url: url });
      });
      setTimeout(function () { finish({ ok: false, err: 'timeout', url: url }); }, 8000);
      a.preload = 'metadata';
      a.src = url;
    });
  })()`);
  check('抽出的词音频真能解码播放', audioPlayable.ok === true, JSON.stringify(audioPlayable));

  const videoPlayable = await evaluate(`(function(){
    var v = document.querySelector('video');
    if (!v) return { ok: false, err: '无 video 元素' };
    var src = String(v.getAttribute('src') || '');
    if (!src.startsWith('/demo/media/')) return { ok: false, err: 'src 未换成文件: ' + src.slice(0, 30) };
    return new Promise(function (resolve) {
      var done = false;
      var finish = function (r) { if (!done) { done = true; resolve(r); } };
      if (v.readyState >= 1) return finish({ ok: true, duration: v.duration, src: src });
      v.addEventListener('loadedmetadata', function () { finish({ ok: true, duration: v.duration, src: src }); });
      v.addEventListener('error', function () { finish({ ok: false, code: v.error && v.error.code }); });
      setTimeout(function () { finish({ ok: false, err: 'timeout', readyState: v.readyState }); }, 10000);
      v.load();
    });
  })()`);
  check('抽出的 demo 视频真能解码', videoPlayable.ok === true, JSON.stringify(videoPlayable).slice(0, 160));

  const videoContinues = await evaluate(`(function(){
    var v = document.getElementById('demo-video');
    if (!v) return Promise.resolve({ ok: false, err: 'missing demo-video' });
    v.currentTime = 0;
    return v.play().then(function(){
      return new Promise(function(resolve){
        setTimeout(function(){
          var r = { ok: !v.paused && v.currentTime > 2.5, paused: v.paused, currentTime: v.currentTime };
          v.pause();
          resolve(r);
        }, 3200);
      });
    }).catch(function(e){ return { ok: false, err: String(e) }; });
  })()`);
  check('交互视频点击播放后持续超过 3 秒', videoContinues.ok === true, JSON.stringify(videoContinues));

  const visibleShotPlays = await evaluate(`(function(){
    var active = document.getElementById('shot-a');
    var inactive = document.getElementById('shot-c');
    if (!active || !inactive) return Promise.resolve({ ok: false, err: 'missing shot video' });
    active.scrollIntoView({ block: 'center' });
    return new Promise(function(resolve){
      setTimeout(function(){
        resolve({
          ok: !active.paused && active.currentTime > 0.5 && inactive.paused,
          activePaused: active.paused,
          activeTime: active.currentTime,
          activeNeedsPlay: active.closest('.shotbox').classList.contains('needs-play'),
          inactivePaused: inactive.paused
        });
      }, 1800);
    });
  })()`);
  check('实机录屏进入视口才播放，离屏录屏保持暂停', visibleShotPlays.ok === true, JSON.stringify(visibleShotPlays));

  const shotPlayFallback = await evaluate(`(function(){
    var v = document.getElementById('shot-a');
    var box = v && v.closest('.shotbox');
    var button = box && box.querySelector('.shotplay');
    if (!v || !box || !button) return Promise.resolve({ ok: false, err: 'missing fallback control' });
    v.pause();
    return new Promise(function(resolve){
      setTimeout(function(){
        var shown = box.classList.contains('needs-play');
        button.click();
        setTimeout(function(){
          resolve({ ok: shown && !v.paused, shown: shown, pausedAfterClick: v.paused });
        }, 350);
      }, 0);
    });
  })()`);
  check('录屏暂停时显示播放按钮，点击可恢复', shotPlayFallback.ok === true, JSON.stringify(shotPlayFallback));

  const imgOk = await evaluate(`(function(){
    var imgs = [].slice.call(document.images).filter(function (i) { return String(i.getAttribute('src') || '').startsWith('/demo/media/'); });
    var broken = imgs.filter(function (i) { return i.complete && i.naturalWidth === 0; });
    return { total: imgs.length, broken: broken.length, sample: imgs.length ? imgs[0].getAttribute('src') : null };
  })()`);
  check('抽出的图片无破图', imgOk.broken === 0 && imgOk.total > 0, JSON.stringify(imgOk));

  /*
   * star 数的两条路径都要真跑一遍。页面首帧加载时端点就是 503（starsMode 初值），
   * 所以这里读到的是「拿不到」的真实状态，不是构造出来的。
   */
  const starsDown = await evaluate(`(async function(){
    await window.fushiStars.refresh();
    var nav = document.querySelector('.site-nav-star');
    var box = document.querySelector('.star-box-count');
    return {
      exists: !!nav && !!box,
      navOn: nav ? nav.classList.contains('on') : null,
      navDisplay: nav ? getComputedStyle(nav).display : null,
      boxOn: box ? box.classList.contains('on') : null,
      boxDisplay: box ? getComputedStyle(box).display : null,
      boxWidth: box ? box.getBoundingClientRect().width : null,
      text: ((nav ? nav.textContent : '') + '|' + (box ? box.textContent : '')).trim(),
      count: window.fushiStars.count
    };
  })()`);
  check(
    'star 数拿不到时徽章保持隐藏，绝不显示 0 / NaN 占位',
    starsDown.exists === true &&
      starsDown.navOn === false && starsDown.boxOn === false &&
      starsDown.navDisplay === 'none' && starsDown.boxDisplay === 'none' &&
      starsDown.boxWidth === 0 && starsDown.count === null &&
      !/\d/.test(starsDown.text),
    JSON.stringify(starsDown),
  );

  await evaluate("fetch('/__set-stars?mode=ok').then(function(r){return r.text();})");
  const starsUp = await evaluate(`(async function(){
    await window.fushiStars.refresh();
    var nav = document.querySelector('.site-nav-star [data-fushi-stars]');
    var num = document.querySelector('.star-box-num');
    var box = document.querySelector('.star-box-count');
    var host = document.querySelector('.site-nav-star');
    return {
      navText: nav ? nav.textContent : null,
      navOn: host ? host.classList.contains('on') : null,
      navDisplay: host ? getComputedStyle(host).display : null,
      numText: num ? num.textContent : null,
      boxOn: box ? box.classList.contains('on') : null,
      boxDisplay: box ? getComputedStyle(box).display : null,
      boxWidth: box ? box.getBoundingClientRect().width : null,
      boxHref: box ? box.getAttribute('href') : null,
      count: window.fushiStars.count,
      stored: localStorage.getItem('fushi-stars')
    };
  })()`);
  check(
    '拿到 star 数后顶栏徽章与首页卡片都显示真实数字',
    starsUp.count === 1234 &&
      starsUp.navOn === true && starsUp.navDisplay !== 'none' &&
      starsUp.boxOn === true && starsUp.boxDisplay === 'flex' && starsUp.boxWidth > 0 &&
      starsUp.numText === '1,234' &&
      /\d/.test(starsUp.navText ?? '') && (starsUp.navText ?? '').length <= 8,
    JSON.stringify(starsUp),
  );
  check(
    'star 数落本地缓存（回访先画上次的数字，不闪空位）',
    typeof starsUp.stored === 'string' && JSON.parse(starsUp.stored).n === 1234,
    String(starsUp.stored),
  );
  /*
   * 换语言要走 applyDict：它按 data-i18n 重写 innerHTML，一不小心就会把徽章里的
   * 数字连同宿主一起擦掉；紧凑格式也得跟着 CLDR 换（zh 到一万才缩写，en 是 1.2K）。
   */
  await evaluate("window.fushiI18n.set('en')");
  const starsEn = await evaluate(`(function(){
    var nav = document.querySelector('.site-nav-star [data-fushi-stars]');
    var num = document.querySelector('.star-box-num');
    var title = document.querySelector('.star-box-title');
    return {
      lang: window.fushiI18n.lang,
      navText: nav ? nav.textContent : null,
      numText: num ? num.textContent : null,
      title: title ? title.textContent : null
    };
  })()`);
  check(
    '切语言后 star 数不被 i18n 重写擦掉，且按新语言重排格式',
    starsEn.lang === 'en' && starsEn.numText === '1,234' && starsEn.navText === '1.2K' &&
      /Star/.test(starsEn.title ?? ''),
    JSON.stringify(starsEn),
  );
  await evaluate("window.fushiI18n.set('zh-CN')");

  check(
    '数字块链到 stargazers 页，引导按钮链到仓库',
    starsUp.boxHref === 'https://github.com/hajisensai/Fushi/stargazers' &&
      (await evaluate("document.querySelector('.star-box-btn').getAttribute('href')")) ===
        'https://github.com/hajisensai/Fushi',
  );

  check('无未捕获 JS 异常', jsErrors.length === 0, jsErrors.slice(0, 3).join(' | '));
  check('无失败请求（排除既有 favicon 噪声与第三方外链）', failedRequests.length === 0, failedRequests.slice(0, 5).join(' | '));
  if (noise.length) console.log('  [诊断] 已忽略的噪声/第三方外链: ' + noise.slice(0, 4).join(' | '));

  const mediaRequests = requested.filter((p) => p.startsWith('/demo/media/'));
  check(
    '媒体按需加载（首屏未拉全 430 个）',
    mediaRequests.length < 100,
    mediaRequests.length + ' / 430 个',
  );

  console.log(
    '\n首屏共请求 ' + requested.length + ' 个资源；忽略的既有噪声 ' + noise.length + ' 条' +
      (noise.length ? '（' + noise[0].slice(0, 60) + '）' : ''),
  );

  /*
   * 回访路径：localStorage 里已经有上次的数字。它只是首帧种子，不是缓存——
   * 重新进站必须照常刷一遍并覆盖掉。上一版在这里压了 6 小时 TTL，结果用户刷新
   * 多少次都还是旧值，服务端明明早就更新了。这条断言钉住这个不变式。
   * 放在最后：它要重新加载页面，不能扰动前面那些按首屏请求计数的断言。
   */
  const errorsBeforeReload = jsErrors.length;
  await evaluate("fetch('/__set-stars?mode=ok&value=4321').then(function(r){return r.text();})");
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/' });
  const tReload = Date.now();
  let revisit = null;
  while (Date.now() - tReload < 15000) {
    try {
      revisit = await evaluate(`(function(){
        if (!window.fushiStars) return null;
        var num = document.querySelector('.star-box-num');
        return {
          count: window.fushiStars.count,
          numText: num ? num.textContent : null,
          stored: localStorage.getItem('fushi-stars')
        };
      })()`);
    } catch { revisit = null; }
    if (revisit && revisit.count === 4321) break;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  check(
    '回访时本地旧值只当首帧种子，仍会刷到服务端的新值',
    revisit !== null && revisit.count === 4321 && revisit.numText === '4,321' &&
      typeof revisit.stored === 'string' && JSON.parse(revisit.stored).n === 4321,
    JSON.stringify(revisit),
  );
  check(
    '回访这一趟没有新增 JS 异常',
    jsErrors.length === errorsBeforeReload,
    jsErrors.slice(errorsBeforeReload, errorsBeforeReload + 2).join(' | '),
  );

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
