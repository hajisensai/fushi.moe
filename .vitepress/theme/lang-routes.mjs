/*
 * 站点语言路由的唯一真相源：哪些语言、各自的路径前缀、哪些页面有语言版本。
 *
 * 英文是默认路由（无前缀，hreflang x-default）；其余 16 种语言在 /<prefix>/ 下各有一份
 * 烤好该语言的静态版——链接预览爬虫不跑 JS，分享哪个链接预览就是哪个语言。
 * 三处消费：config.mts 的 locales（<html lang>/dir、默认描述）、Layout.vue 的站内链接、
 * tool/ 下的页面生成器与首页渲染器。public/site.js 在浏览器里有一份同样的前缀表
 * （它挂在 <head> 里、不能 import），tool/lang-routes.test.mjs 守两边一致。
 */

export const SITE = 'https://fushi.moe';

/** 与 app 同集（17 种）；顺序即语言菜单顺序。 */
export const LANGS = ['zh-CN', 'zh-HK', 'en', 'ja', 'ko', 'de', 'es', 'fr', 'it', 'nl', 'pt-BR', 'ru', 'tr', 'vi', 'th', 'id', 'ar'];

export const DEFAULT_LANG = 'en';

/** 语言 → 路径前缀（不带尾斜杠）；英文是默认路由，没有前缀。 */
export const PREFIX = {
  en: '',
  'zh-CN': '/zh-cn',
  'zh-HK': '/zh-hk',
  ja: '/ja',
  ko: '/ko',
  de: '/de',
  es: '/es',
  fr: '/fr',
  it: '/it',
  nl: '/nl',
  'pt-BR': '/pt-br',
  ru: '/ru',
  tr: '/tr',
  vi: '/vi',
  th: '/th',
  id: '/id',
  ar: '/ar',
};

/** 有语言版本的页面（无前缀的规范路径）。/privacy 只有英文，不在这里。 */
export const PAGES = ['/', '/download', '/immersion'];

export const RTL = { ar: true };

export const OG_LOCALE = {
  'zh-CN': 'zh_CN', 'zh-HK': 'zh_HK', en: 'en_US', ja: 'ja_JP', ko: 'ko_KR',
  de: 'de_DE', es: 'es_ES', fr: 'fr_FR', it: 'it_IT', nl: 'nl_NL', 'pt-BR': 'pt_BR',
  ru: 'ru_RU', tr: 'tr_TR', vi: 'vi_VN', th: 'th_TH', id: 'id_ID', ar: 'ar_AR',
};

const PREFIX_TO_LANG = Object.fromEntries(
  Object.entries(PREFIX).filter(([, p]) => p).map(([code, p]) => [p.slice(1), code]),
);

/** 前缀交替式（zh-cn|zh-hk|…），site.js 里有一份同样的字面量。 */
export const PREFIX_ALTERNATION = Object.keys(PREFIX_TO_LANG).join('|');

const LINK_RE = new RegExp('^(?:/(' + PREFIX_ALTERNATION + ')(?=/|$))?(/[^?#]*)?([?#].*)?$');

/**
 * @param {string} code 语言码
 * @param {string} page PAGES 之一
 * @returns {string} 该语言下这一页的路径，如 ('de', '/download') → '/de/download'，('en', '/') → '/'
 */
export function routeFor(code, page) {
  const prefix = PREFIX[code];
  if (prefix === undefined) throw new Error('unknown language ' + code);
  if (!PAGES.includes(page)) throw new Error('page without language routes: ' + page);
  if (!prefix) return page;
  return page === '/' ? prefix + '/' : prefix + page;
}

/**
 * 把站内链接改到指定语言的版本。只动 PAGES 里的页面；其它路径（/privacy、/releases/…、
 * 外链、纯锚点）原样返回。
 * @param {string} href
 * @param {string} code
 * @returns {string}
 */
export function localizeHref(href, code) {
  if (href.charAt(0) !== '/') return href;
  const m = LINK_RE.exec(href);
  if (!m) return href;
  const page = m[2] || '/';
  if (!PAGES.includes(page)) return href;
  return routeFor(code, page) + (m[3] || '');
}

/**
 * 路径 → 这一页烤的语言；不是语言路由页（/privacy、静态资源）返回 null。
 * @param {string} pathname
 * @returns {string | null}
 */
export function langOfPath(pathname) {
  const p = pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
  const m = LINK_RE.exec(p || '/');
  if (!m) return null;
  const page = m[2] || '/';
  if (!PAGES.includes(page)) return null;
  return m[1] ? PREFIX_TO_LANG[m[1]] : DEFAULT_LANG;
}

/** 各语言的自称（语言菜单按钮上显示的名字，不翻译）；public/site.js 的 LANGS 表同一份。 */
export const NAMES = {
  'zh-CN': '简体中文', 'zh-HK': '繁體中文', en: 'English', ja: '日本語', ko: '한국어', de: 'Deutsch', es: 'Español',
  fr: 'Français', it: 'Italiano', nl: 'Nederlands', 'pt-BR': 'Português (Brasil)', ru: 'Русский', tr: 'Türkçe',
  vi: 'Tiếng Việt', th: 'ไทย', id: 'Bahasa Indonesia', ar: 'العربية',
};

/**
 * 页壳（Layout.vue 顶栏 / 底栏）用到的字典键。VitePress 页 SSR 时按 locale 从 themeConfig.chrome
 * 取这几句烤进 HTML；访客切语言时 site.js 再按同名 data-i18n 键换。
 */
export const CHROME_KEYS = [
  'nav.menu', 'nav.method', 'nav.qq', 'nav.language', 'nav.lang_auto', 'nav.download',
  'footer.gift_claude', 'footer.gift_recipient', 'footer.legal', 'nav.totop',
];

/**
 * VitePress 的 locales 配置：目录名 → { lang, dir, description, themeConfig.chrome }，root 是英文。
 * @param {(code: string) => Record<string, string>} dictOf 读该语言的整份字典
 */
export function vitepressLocales(dictOf) {
  const out = {};
  for (const code of LANGS) {
    const dict = dictOf(code);
    const chrome = {};
    for (const k of CHROME_KEYS) {
      if (typeof dict[k] !== 'string') throw new Error(code + ': dictionary lacks chrome key ' + k);
      chrome[k] = dict[k];
    }
    const key = PREFIX[code] ? PREFIX[code].slice(1) : 'root';
    out[key] = {
      label: NAMES[code],
      lang: code,
      dir: RTL[code] ? 'rtl' : 'ltr',
      title: 'Fushi',
      description: dict['meta.description'],
      themeConfig: { chrome, langName: NAMES[code] },
    };
  }
  return out;
}

/**
 * 链接预览 / SEO 用的 head 项：canonical、og、twitter、全部语言的 hreflang；
 * dyn 是访客在页面上切语言时 site.js 重算 <title> / description 用的模板（{key} 取字典值）。
 */
export function seoHead(code, page, { title, description, type = 'website', dyn }) {
  const url = SITE + routeFor(code, page);
  return [
    ...(dyn ? [
      ['meta', { name: 'fushi-title', content: dyn.title }],
      ['meta', { name: 'fushi-description', content: dyn.description }],
    ] : []),
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:type', content: type }],
    ['meta', { property: 'og:site_name', content: 'Fushi' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:locale', content: OG_LOCALE[code] }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ...LANGS.map((lc) => ['link', { rel: 'alternate', hreflang: lc, href: SITE + routeFor(lc, page) }]),
    ['link', { rel: 'alternate', hreflang: 'x-default', href: SITE + routeFor(DEFAULT_LANG, page) }],
  ];
}

/** 把 head 项序列化成 VitePress frontmatter 的 `head:` 块。 */
export function yamlHead(items) {
  return 'head:\n' + items.map(([tag, attrs]) => {
    const ents = Object.entries(attrs);
    return '  - - ' + tag + '\n' + ents.map(([k, v], i) => (i === 0 ? '    - ' : '      ') + k + ': ' + JSON.stringify(v)).join('\n');
  }).join('\n');
}

/** 同一批 head 项序列化成 HTML（给手写静态页用）。 */
export function htmlHead(items) {
  const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return items.map(([tag, attrs]) => '<' + tag + Object.entries(attrs).map(([k, v]) => ' ' + k + '="' + esc(v) + '"').join('') + '>').join('\n');
}
