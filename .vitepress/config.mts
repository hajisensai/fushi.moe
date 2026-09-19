import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import type { Plugin } from 'vite'
import { LANGS, PREFIX, SITE, vitepressLocales } from './theme/lang-routes.mjs'
import { renderHome } from '../tool/build_lang_routes.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
/** 各语言的站点字典：locale 的默认描述与页壳（顶栏 / 底栏）文案都从这里取，SSR 时就是该语言。 */
const dictOf = (code: string): Record<string, string> =>
  JSON.parse(readFileSync(join(HERE, '..', 'public', 'i18n', code + '.json'), 'utf8'))

/**
 * dev 专用：首页不在 VitePress 路由表里——线上的 / 与 /zh-cn/ 等 17 条语言路由是构建时
 * tool/build_lang_routes.mjs 从 public/index.html 烤出来的静态文件，dev server 里没有，
 * 点 logo 回首页只会看到 VitePress 的空 404。这里在 dev 里用同一个 renderHome 现烤一份：
 * 每次请求重读模板与字典，改 public/index.html 或字典刷新即见。build 不装这个插件。
 */
function devHomePlugin(): Plugin {
  const homeOf = new Map(LANGS.map((code) => [PREFIX[code] ? PREFIX[code] + '/' : '/', code]))
  return {
    name: 'fushi-dev-home',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '/').split('?')[0]
        const code = homeOf.get(path) ?? (path !== '/' ? homeOf.get(path + '/') : undefined)
        if (!code || (req.method !== 'GET' && req.method !== 'HEAD')) return next()
        const template = readFileSync(join(HERE, '..', 'public', 'index.html'), 'utf8')
        res.setHeader('content-type', 'text/html; charset=utf-8')
        res.end(renderHome(template, dictOf(code), code))
      })
    },
  }
}

export default defineConfig({
  title: 'Fushi',
  vite: { plugins: [devHomePlugin()] },
  /*
   * 目录即语言：根目录是英文（默认路由），/zh-cn/ /ja/ … 下是各语言的静态版。
   * locale 决定每页的 <html lang> / dir 与默认描述；页面文案本身由各语言的 .md 烤好。
   */
  locales: vitepressLocales(dictOf),
  cleanUrls: true,
  // 常见问题文章页右侧的「本页内容」（FaqOutline.vue）用 pageData.headers，要让 markdown 渲染时把二级标题抽出来。
  markdown: { headers: { level: [2] } },
  lastUpdated: false,
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/fushi-icon.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    // 顶栏 / 底栏 / 设计 token 的唯一真相源，与手写首页 public/index.html 共用。
    ['link', { rel: 'stylesheet', href: '/chrome.css' }],
    // 界面语言 + 顶栏语言菜单 + 回顶钮。data-manual：VitePress 页要等 hydrate 完
    // 再由 Layout.vue 调 fushiI18n.apply()，否则 Vue 会把改过的文本按 vnode 改回去。
    ['script', { src: '/site.js', 'data-manual': '1' }],
    // 多来源故障切换 SW：CF 线路不通时改从 GitHub 侧取内容，地址栏不变。
    ['script', { src: '/sw-register.js', defer: '' }],
  ],
  /*
   * 常见问题的文章（faq/<slug>.md）的链接预览 head：canonical / og / 更新时间。
   * 常见问题不走语言路由；文章的翻译是同目录的 faq/<slug>.<lang>.md（frontmatter lang 同值，目前 en / zh-HK），
   * 中文原文与翻译之间互相挂 hreflang（x-default 指英文版，没有英文版就指原文）。
   * 标题 / 描述 VitePress 已按 frontmatter 出 <title> 与 description。
   */
  transformPageData(pageData) {
    const fm = pageData.frontmatter
    if (!/^faq\/[^/]+\.md$/.test(pageData.relativePath)) return
    if (!fm.title) throw new Error(pageData.relativePath + ': faq article needs a title (the question)')
    const url = SITE + '/' + pageData.relativePath.replace(/\.md$/, '')
    const date = fm.date ? String(fm.date instanceof Date ? fm.date.toISOString() : fm.date).slice(0, 10) : ''
    // faq/mihon.md → slug mihon（原文，zh-CN）；faq/mihon.en.md → slug mihon，翻译 en
    const m = /^faq\/([^/.]+)(?:\.([A-Za-z-]+))?\.md$/.exec(pageData.relativePath)
    const slug = m ? m[1] : ''
    const lang = m && m[2] ? m[2] : String(fm.lang || 'zh-CN')
    if (m && m[2] && fm.lang && fm.lang !== m[2]) throw new Error(pageData.relativePath + ': frontmatter lang must be ' + m[2])
    const alternates: [string, string][] = []
    if (slug && existsSync(join(HERE, '..', 'faq', slug + '.md'))) alternates.push(['zh-CN', SITE + '/faq/' + slug])
    for (const l of ['en', 'zh-HK']) {
      if (slug && existsSync(join(HERE, '..', 'faq', slug + '.' + l + '.md'))) alternates.push([l, SITE + '/faq/' + slug + '.' + l])
    }
    const xDefault = alternates.find(([l]) => l === 'en') || alternates[0]
    fm.head = [
      ...(fm.head || []),
      ['link', { rel: 'canonical', href: url }],
      ...(alternates.length > 1 ? alternates.map(([l, href]) => ['link', { rel: 'alternate', hreflang: l, href }]) : []),
      ...(alternates.length > 1 && xDefault ? [['link', { rel: 'alternate', hreflang: 'x-default', href: xDefault[1] }]] : []),
      ['meta', { property: 'og:locale', content: lang.replace('-', '_') }],
      ['meta', { property: 'og:type', content: 'article' }],
      ['meta', { property: 'og:site_name', content: 'Fushi' }],
      ['meta', { property: 'og:title', content: String(fm.title) }],
      ['meta', { property: 'og:description', content: fm.description ? String(fm.description) : '' }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { name: 'twitter:card', content: 'summary' }],
      ...(date ? [['meta', { property: 'article:modified_time', content: date }]] : []),
    ]
  },
  // themeConfig 是 VitePress 默认主题的配置面。本站跑的是 .vitepress/theme/
  // 下的自定义页壳（下载页 / 沉浸页 / 隐私页，用不上侧边栏 / 搜索 / 上下页导航），
  // 顶栏底栏的内容直接写在 Layout.vue 里，所以这里不再配任何东西。
})
