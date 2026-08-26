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

  // 非中文：第一帧前藏住 body。超时兜底保证任何情况下页面都会露出来。
  if (state.lang !== SOURCE) {
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
    syncSelects();
    root.classList.remove(PENDING_CLASS);
    document.dispatchEvent(new CustomEvent('fushi:i18n', { detail: { lang: code, dict: dict } }));
  }

  /** 把当前语言应用到页面。中文源语言且从未切过 → 什么都不用换。 */
  function apply() {
    var code = resolve(state.choice);
    if (code === SOURCE && !state.dict) {
      state.lang = code;
      root.lang = code; root.dir = 'ltr';
      syncSelects();
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

  /** 原生 <select> 会按最长的选项撑宽；量一下当前选中项的文字，让它只占自己那么宽。 */
  function fitSelect(sel) {
    var opt = sel.options[sel.selectedIndex];
    if (!opt) return;
    var probe = document.createElement('span');
    probe.textContent = opt.textContent;
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit;';
    sel.parentNode.appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    probe.remove();
    var pad = 14 + 2; // 右侧留给壳上的下拉箭头
    sel.style.width = Math.ceil(w + pad) + 'px';
  }

  /** 顶栏 <select>：值 = 选择（auto 或语言码）；「自动」项带上实际检出的语言名。 */
  function syncSelects() {
    var sels = document.querySelectorAll('select.site-nav-lang-select');
    for (var i = 0; i < sels.length; i++) {
      var sel = sels[i];
      sel.value = state.choice;
      var auto = sel.querySelector('option[value="auto"]');
      if (auto) auto.textContent = t('nav.lang_auto', '自动') + ' · ' + nameOf(resolve('auto'));
      fitSelect(sel);
    }
  }

  function wireChrome() {
    var sels = document.querySelectorAll('select.site-nav-lang-select');
    for (var i = 0; i < sels.length; i++) {
      sels[i].addEventListener('change', function (e) { set(e.target.value); });
    }
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
    syncSelects();
  }

  var manual = !!(document.currentScript && document.currentScript.getAttribute('data-manual'));

  function onReady() {
    wireChrome();
    if (!manual) state.ready = apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
  else onReady();

  // 预热字典：和 HTML 解析并行拉，DOMContentLoaded 时多半已经到了。
  if (state.lang !== SOURCE) loadDict(state.lang).catch(function () {});

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
})();
