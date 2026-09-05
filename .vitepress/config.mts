import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { vitepressLocales } from './theme/lang-routes.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
/** 各语言的站点字典：locale 的默认描述与页壳（顶栏 / 底栏）文案都从这里取，SSR 时就是该语言。 */
const dictOf = (code: string): Record<string, string> =>
  JSON.parse(readFileSync(join(HERE, '..', 'public', 'i18n', code + '.json'), 'utf8'))

export default defineConfig({
  title: 'Fushi',
  /*
   * 目录即语言：根目录是英文（默认路由），/zh-cn/ /ja/ … 下是各语言的静态版。
   * locale 决定每页的 <html lang> / dir 与默认描述；页面文案本身由各语言的 .md 烤好。
   */
  locales: vitepressLocales(dictOf),
  cleanUrls: true,
  lastUpdated: false,
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/icon-placeholder.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    // 顶栏 / 底栏 / 设计 token 的唯一真相源，与手写首页 public/index.html 共用。
    ['link', { rel: 'stylesheet', href: '/chrome.css' }],
    // 界面语言 + 顶栏语言菜单 + 回顶钮。data-manual：VitePress 页要等 hydrate 完
    // 再由 Layout.vue 调 fushiI18n.apply()，否则 Vue 会把改过的文本按 vnode 改回去。
    ['script', { src: '/site.js', 'data-manual': '1' }],
    // 多来源故障切换 SW：CF 线路不通时改从 GitHub 侧取内容，地址栏不变。
    ['script', { src: '/sw-register.js', defer: '' }],
  ],
  // themeConfig 是 VitePress 默认主题的配置面。本站跑的是 .vitepress/theme/
  // 下的自定义页壳（下载页 / 沉浸页 / 隐私页，用不上侧边栏 / 搜索 / 上下页导航），
  // 顶栏底栏的内容直接写在 Layout.vue 里，所以这里不再配任何东西。
})
