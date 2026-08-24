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
    // 多来源故障切换 SW：CF 线路不通时改从 GitHub 侧取内容，地址栏不变。
    ['script', { src: '/sw-register.js', defer: '' }],
  ],
  themeConfig: {
    logo: '/icon-placeholder.png',
    nav: [
      { text: '5 分钟上手', link: '/guide' },
      { text: '功能', link: '/features' },
      { text: '下载', link: '/download' },
    ],
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '下载 Fushi', link: '/download' },
          { text: '5 分钟配好 Fushi', link: '/guide' },
          { text: '功能一览', link: '/features' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hajisensai/Fushi' },
      { icon: 'discord', link: 'https://discord.gg/WhjwyGmm7f' },
    ],
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一页', next: '下一页' },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    footer: {
      message: '自由软件 · GPLv3 许可发布',
      copyright: '© 2026 Fushi',
    },
    search: { provider: 'local' },
  },
})
