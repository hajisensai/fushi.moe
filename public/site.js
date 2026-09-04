/*
 * fushi.moe 站点脚本：界面语言 + 顶栏语言菜单 + 浮动「回到顶部」。
 *
 * 语言集合与 app 的界面语言完全一致（17 种，fushi/lib/i18n/*.i18n.json）。
 * 标记里写死的是简体中文（SOURCE）；其余语言的文案在 /i18n/<code>.json，
 * 按 data-i18n="key" 把元素 innerHTML 换掉（字典值可含 <b>/<a> 等内联标记，
 * 全部是本仓库自己的文件，不接收任何外部输入）。
 *
 * 这个文件**同步**挂在 <head> 里：非中文用户第一帧之前就得把 body 藏住，
 * 否则会先闪一屏中文再换语言。字典拿不到或超时就照常显示中文——脚本的
 * 任何失败都只能退化成「看到中文」，不能是白屏。
 *
 * VitePress 页（有 #app）由 Layout.vue 在 hydrate 之后调 fushiI18n.apply()：
 * hydrate 之前改 DOM 文本，Vue 会按服务端 vnode 把它改回去。静态首页
 * 在 DOMContentLoaded 自动应用。
 */
(function () {
  'use strict';

  /** 与 app 同集；顺序即菜单顺序。第二项是该语言的自称，菜单里不翻译。 */
  var LANGS = [
    ['zh-CN', '简体中文'],
    ['zh-HK', '繁體中文'],
    ['en', 'English'],
    ['ja', '日本語'],
    ['ko', '한국어'],
    ['de', 'Deutsch'],
    ['es', 'Español'],
    ['fr', 'Français'],
    ['it', 'Italiano'],
    ['nl', 'Nederlands'],
    ['pt-BR', 'Português (Brasil)'],
    ['ru', 'Русский'],
    ['tr', 'Türkçe'],
    ['vi', 'Tiếng Việt'],
    ['th', 'ไทย'],
    ['id', 'Bahasa Indonesia'],
    ['ar', 'العربية'],
  ];
  var SOURCE = 'zh-CN';
  /**
   * 这一页烤在 HTML 里的语言。手写页（首页 / 下载页）是简体中文；沉浸页默认路由 /immersion
   * 是英文，/zh-cn/ /zh-hk/ /ja/ /ko/ /de/ … 下是各语言的静态版（17 种语言各一份）。判定必须同步（脚本在 <head> 里跑，
   * body 还没解析），所以只能看路径。中文用户打开 /immersion 会按 zh-CN 字典把英文换掉，
   * 英文用户打开 /zh-cn/immersion 同理反过来。
   */
  var PAGE_LANG = { '/immersion': 'en' };
  var PREFIX_LANG = { 'zh-cn': 'zh-CN', 'zh-hk': 'zh-HK', 'pt-br': 'pt-BR', en: 'en', ja: 'ja', ko: 'ko', de: 'de', es: 'es', fr: 'fr', it: 'it', nl: 'nl', ru: 'ru', tr: 'tr', vi: 'vi', id: 'id', th: 'th', ar: 'ar' };
  function pageSource() {
    var p = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '') || '/';
    var m = p.match(/^\/(zh-cn|zh-hk|pt-br|en|ja|ko|de|es|fr|it|nl|ru|tr|vi|id|th|ar)(\/|$)/);
    if (m) return PREFIX_LANG[m[1]];
    return PAGE_LANG[p] || SOURCE;
  }
  var PAGE_SOURCE = pageSource();
  var STORE = 'fushi-lang';
  var RTL = { ar: true };
  var PENDING_CLASS = 'i18n-pending';
  var PENDING_TIMEOUT_MS = 2500;

  var root = document.documentElement;
  var codes = LANGS.map(function (l) { return l[0]; });

  function nameOf(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i][0] === code) return LANGS[i][1];
    return code;
  }

  /** 浏览器语言 → 站点语言。zh 按字形分流（繁体/港台澳 → zh-HK，其余 → zh-CN），pt 归 pt-BR。 */
  function matchTag(tag) {
    var t = String(tag || '').toLowerCase();
    if (!t) return null;
    for (var i = 0; i < codes.length; i++) if (codes[i].toLowerCase() === t) return codes[i];
    var primary = t.split('-')[0];
    if (primary === 'zh') {
      return /hant|tw|hk|mo/.test(t) ? 'zh-HK' : 'zh-CN';
    }
    if (primary === 'pt') return 'pt-BR';
    for (var j = 0; j < codes.length; j++) {
      if (codes[j].toLowerCase().split('-')[0] === primary) return codes[j];
    }
    return null;
  }

  /**
   * 浏览器语言列表 → 站点语言：navigator.languages（= 请求头 Accept-Language 的顺序）里
   * 第一个本站支持的语言，都不支持才退回英文。这是 Accept-Language 协商的标准做法，
   * 不掺任何地区/时区猜测——用户的浏览器把什么语言排在第一，就给什么。
   * 判定过程打到 console，用户核对「为什么给了我这个语言」时一眼能看到列表。
   */
  function detect() {
    var list = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || 'en'];
    var code = 'en';
    for (var i = 0; i < list.length; i++) {
      var hit = matchTag(list[i]);
      if (hit) { code = hit; break; }
    }
    try { console.info('[fushi i18n] navigator.languages', Array.prototype.slice.call(list), '->', code); } catch (_) { /* 无 console 也无妨 */ }
    return code;
  }

  function readStored() {
    try {
      var v = localStorage.getItem(STORE);
      if (v === 'auto' || codes.indexOf(v) >= 0) return v;
    } catch (_) { /* 隐私模式读不到 → 自动 */ }
    return 'auto';
  }

  function writeStored(choice) {
    try { localStorage.setItem(STORE, choice); } catch (_) { /* 存不了不影响本次 */ }
  }

  /** ?lang= 只在这一跳生效并顺手记住，分享带语言的链接才有意义。 */
  function readChoice() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q) {
      var m = q === 'auto' ? 'auto' : matchTag(q);
      if (m) { writeStored(m); return m; }
    }
    return readStored();
  }

  function resolve(choice) { return choice === 'auto' ? detect() : choice; }

  var dicts = {};
  function loadDict(code) {
    if (dicts[code]) return dicts[code];
    dicts[code] = fetch('/i18n/' + code + '.json', { cache: 'default' })
      .then(function (r) { if (!r.ok) throw new Error('i18n ' + r.status); return r.json(); })
      .catch(function (e) { delete dicts[code]; throw e; });
    return dicts[code];
  }

  var state = { choice: readChoice(), lang: SOURCE, dict: null, ready: null };
  state.lang = resolve(state.choice);

  // 语言与本页烤的不同：第一帧前藏住 body。超时兜底保证任何情况下页面都会露出来。
  if (state.lang !== PAGE_SOURCE) {
    root.classList.add(PENDING_CLASS);
    setTimeout(function () { root.classList.remove(PENDING_CLASS); }, PENDING_TIMEOUT_MS);
  }

  function setAttrs(el, spec, dict) {
    spec.split(';').forEach(function (pair) {
      var eq = pair.indexOf('=');
      if (eq < 0) return;
      var attr = pair.slice(0, eq).trim();
      var key = pair.slice(eq + 1).trim();
      if (typeof dict[key] === 'string') el.setAttribute(attr, dict[key]);
    });
  }

  function applyDict(dict, code) {
    root.lang = code;
    root.dir = RTL[code] ? 'rtl' : 'ltr';
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      if (typeof dict[key] === 'string') els[i].innerHTML = dict[key];
    }
    var attrEls = document.querySelectorAll('[data-i18n-attr]');
    for (var j = 0; j < attrEls.length; j++) {
      setAttrs(attrEls[j], attrEls[j].getAttribute('data-i18n-attr'), dict);
    }
    if (typeof dict['meta.title'] === 'string') document.title = dict['meta.title'];
    var desc = document.querySelector('meta[name="description"]');
    if (desc && typeof dict['meta.description'] === 'string') desc.setAttribute('content', dict['meta.description']);
    state.dict = dict;
    state.lang = code;
    syncLangMenus();
    root.classList.remove(PENDING_CLASS);
    document.dispatchEvent(new CustomEvent('fushi:i18n', { detail: { lang: code, dict: dict } }));
  }

  /** 把当前语言应用到页面。与本页烤的语言相同且从未切过 → 什么都不用换。 */
  function apply() {
    var code = resolve(state.choice);
    if (code === PAGE_SOURCE && !state.dict) {
      state.lang = code;
      root.lang = code; root.dir = RTL[code] ? 'rtl' : 'ltr';
      syncLangMenus();
      root.classList.remove(PENDING_CLASS);
      document.dispatchEvent(new CustomEvent('fushi:i18n', { detail: { lang: code, dict: {} } }));
      return Promise.resolve();
    }
    return loadDict(code).then(function (dict) { applyDict(dict, code); }, function () {
      root.classList.remove(PENDING_CLASS);
    });
  }

  function t(key, fallback) {
    var d = state.dict;
    return d && typeof d[key] === 'string' ? d[key] : fallback;
  }

  function set(choice) {
    if (choice !== 'auto' && codes.indexOf(choice) < 0) return Promise.resolve();
    state.choice = choice;
    writeStored(choice);
    return apply();
  }

  /** 顶栏语言菜单：按钮上显示当前生效的语言，列表里标出当前选择（auto 或语言码），「自动」项带上实际检出的语言名。 */
  function syncLangMenus() {
    var roots = document.querySelectorAll('.site-nav-lang');
    for (var i = 0; i < roots.length; i++) {
      var root_ = roots[i];
      var cur = root_.querySelector('.site-nav-lang-current');
      if (cur) cur.textContent = nameOf(resolve(state.choice));
      var items = root_.querySelectorAll('.site-nav-lang-menu button[data-lang]');
      for (var j = 0; j < items.length; j++) {
        var code = items[j].getAttribute('data-lang');
        var on = code === state.choice;
        items[j].classList.toggle('on', on);
        items[j].setAttribute('aria-selected', on ? 'true' : 'false');
        if (code === 'auto') {
          var sub = items[j].querySelector('.site-nav-lang-sub');
          if (sub) sub.textContent = nameOf(resolve('auto'));
        }
      }
    }
  }

  function closeLangMenus(except) {
    var roots = document.querySelectorAll('.site-nav-lang');
    for (var i = 0; i < roots.length; i++) {
      if (roots[i] === except) continue;
      var menu = roots[i].querySelector('.site-nav-lang-menu');
      var btn = roots[i].querySelector('.site-nav-lang-btn');
      if (menu) menu.hidden = true;
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  }

  function wireLangMenus() {
    var roots = document.querySelectorAll('.site-nav-lang');
    for (var i = 0; i < roots.length; i++) {
      (function (root_) {
        var btn = root_.querySelector('.site-nav-lang-btn');
        var menu = root_.querySelector('.site-nav-lang-menu');
        if (!btn || !menu) return;
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var open = menu.hidden;
          closeLangMenus(root_);
          menu.hidden = !open;
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        menu.addEventListener('click', function (e) {
          var item = e.target.closest('button[data-lang]');
          if (!item) return;
          e.stopPropagation();
          closeLangMenus();
          set(item.getAttribute('data-lang'));
        });
      })(roots[i]);
    }
    document.addEventListener('click', function () { closeLangMenus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLangMenus(); });
  }

  /* --------------------------- GitHub star 数 --------------------------- */
  /*
   * 数据走同域 /api/stars（Worker 侧边缘缓存 15 分钟，一次回源服务所有访客）。
   * 让浏览器直接打 api.github.com 会按访客 IP 限流，大陆网络也常常连不上——
   * 那个地址只在同域端点不存在时兜底（本地 dev、GitHub Pages 直连这类没有 Worker 的场景）。
   *
   * 本地存的那个数只是「首帧种子」：进站先用上次的数字把徽章画出来，不闪空位，
   * 然后每次访问都照常刷一遍。它不是缓存，所以没有 TTL——限流该由服务端那 15 分钟
   * 边缘缓存负责，客户端再自作主张压一层，只会让页面上的数字锁死好几个小时
   * （上一版就是这样：localStorage 压 6 小时，用户刷新多少次都还是旧值）。
   * 一次都没成功过就什么都不显示——显示一个假的 star 数比不显示更糟。
   */
  var STAR_KEY = 'fushi-stars';
  var STAR_ENDPOINT = '/api/stars';
  var STAR_FALLBACK = 'https://api.github.com/repos/hajisensai/Fushi';
  var starCount = null;

  function readStars() {
    try {
      var v = JSON.parse(localStorage.getItem(STAR_KEY));
      if (!v || typeof v.n !== 'number' || !isFinite(v.n)) return null;
      return v;
    } catch (e) { return null; }
  }

  function writeStars(n) {
    try { localStorage.setItem(STAR_KEY, JSON.stringify({ n: n })); } catch (e) {}
  }

  /* 顶栏窄，用当前语言的紧凑写法（1234 → 1.2K / 1.2万）；卡片宽，给完整数字。 */
  function formatStars(n, mode) {
    try {
      if (mode === 'full') return new Intl.NumberFormat(state.lang).format(n);
      return new Intl.NumberFormat(state.lang, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
    } catch (e) { return String(n); }
  }

  function renderStars() {
    if (starCount === null) return;
    var els = document.querySelectorAll('[data-fushi-stars]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = formatStars(starCount, els[i].getAttribute('data-fushi-stars'));
      els[i].classList.add('on');
      var host = els[i].closest && els[i].closest('[data-fushi-stars-host]');
      if (host) host.classList.add('on');
    }
  }

  /* 两个来源的字段名不同：自家端点给 stars，GitHub 原样给 stargazers_count。 */
  function starsFrom(url, init) {
    return fetch(url, init)
      .then(function (r) { if (!r.ok) throw new Error('stars ' + r.status); return r.json(); })
      .then(function (j) {
        var n = j && typeof j.stars === 'number' ? j.stars : j && j.stargazers_count;
        if (typeof n !== 'number' || !isFinite(n) || n < 0) throw new Error('stars payload');
        return Math.floor(n);
      });
  }

  function refreshStars() {
    // no-cache 不是 no-store：照样发条件请求、照样吃 Worker 那层边缘缓存，
    // 只是不认浏览器本地那份被 zone 改写成 4 小时的副本。
    return starsFrom(STAR_ENDPOINT, { cache: 'no-cache' })
      .catch(function () {
        return starsFrom(STAR_FALLBACK, { cache: 'no-cache', headers: { accept: 'application/vnd.github+json' } });
      })
      .then(function (n) { starCount = n; writeStars(n); renderStars(); }, function () {});
  }

  /* wire 是公开 API，可能被页壳再调；重复注册监听或重复回源都没有意义。 */
  var starsWired = false;
  function wireStars() {
    if (starsWired) return;
    if (!document.querySelector('[data-fushi-stars]')) return;
    starsWired = true;
    // 换语言要重排数字格式（1,234 / 1234 / 1.2万）。
    document.addEventListener('fushi:i18n', renderStars);
    var cached = readStars();
    if (cached) { starCount = cached.n; renderStars(); }
    // 每次访问都刷：服务端 15 分钟的边缘缓存已经是限流那一层，这里再压就是把数字锁死。
    refreshStars();
  }

  function wireChrome() {
    wireLangMenus();
    var totop = document.querySelector('.site-totop');
    if (totop) {
      var threshold = function () { return Math.max(400, window.innerHeight * 0.8); };
      var tick = function () { totop.classList.toggle('show', window.scrollY > threshold()); };
      window.addEventListener('scroll', tick, { passive: true });
      tick();
      totop.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    syncLangMenus();
    wireStars();
  }

  var manual = !!(document.currentScript && document.currentScript.getAttribute('data-manual'));

  function onReady() {
    wireChrome();
    if (!manual) state.ready = apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
  else onReady();

  // 预热字典：和 HTML 解析并行拉，DOMContentLoaded 时多半已经到了。
  if (state.lang !== PAGE_SOURCE) loadDict(state.lang).catch(function () {});

  window.fushiI18n = {
    LANGS: LANGS,
    SOURCE: SOURCE,
    get lang() { return state.lang; },
    get choice() { return state.choice; },
    get dict() { return state.dict; },
    t: t,
    set: set,
    apply: function () { state.ready = apply(); return state.ready; },
    wire: wireChrome,
    detect: detect,
  };

  window.fushiStars = {
    get count() { return starCount; },
    format: formatStars,
    render: renderStars,
    refresh: refreshStars,
  };
})();
