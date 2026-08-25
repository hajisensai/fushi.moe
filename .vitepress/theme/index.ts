/*
 * 自定义主题：不继承 VitePress 默认主题。
 *
 * 站点只有两页（首页 + 下载页），默认主题那套侧边栏 / 搜索 / 上下页导航既用不上，
 * 又和手写首页是两种观感。这里只保留一个页壳，正文排版走 prose.css。
 */
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import './prose.css'

export default { Layout } satisfies Theme
