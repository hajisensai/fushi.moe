import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Fushi',
  description:
    'Fushi：免费开源的沉浸式语言学习应用。读小说、听有声书、看视频、读漫画，点一下查词，再点一下做成带原文语境的 Anki 卡。',
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
  // 下的自定义页壳（只有首页 + 下载页两页，用不上侧边栏 / 搜索 / 上下页导航），
  // 顶栏底栏的内容直接写在 Layout.vue 里，所以这里不再配任何东西。
})
