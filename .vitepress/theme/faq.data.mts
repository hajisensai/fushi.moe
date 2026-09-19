/*
 * 常见问题列表 + 搜索索引的数据源：构建时扫 faq/*.md，给 FaqIndex.vue 渲染列表并在浏览器里搜。
 *
 * 一个问题就是一个 .md 文件（faq/<slug>.md → /faq/<slug>），frontmatter 见 README「常见问题」一节；
 * 正文渲染成纯文本一并带上，搜索才能命中答案里的词。文章页本身由 VitePress 照常渲染，这里不碰。
 */
import { createContentLoader } from 'vitepress'

export interface FaqItem {
  /** 问题（frontmatter title） */
  title: string
  url: string
  /** 列表里的一句话摘要，可空 */
  description: string
  /** 分组标题，可空；列表按它分段，段的顺序 = 排序后第一次出现的顺序 */
  category: string
  /** 文章写的语言（app 支持的 17 种之一），默认 zh-CN */
  lang: string
  /** YYYY-MM-DD，可空 */
  date: string
  /** 正文纯文本（搜索用；页面上不显示） */
  text: string
}

declare const data: FaqItem[]
export { data }

/** YAML 里不带引号的 2026-09-19 会被解析成 Date；带引号的是字符串。两种都收成 YYYY-MM-DD；没写就空。 */
const isoDay = (v: unknown): string => {
  if (v === undefined || v === null || v === '') return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const s = String(v).trim()
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) throw new Error('faq date must be YYYY-MM-DD, got ' + JSON.stringify(v))
  return s.slice(0, 10)
}

/** 渲染后的 HTML → 纯文本：去标签、还原常见实体、压空白。只用来搜，不用来显示。 */
const plainText = (html: string): string =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

const num = (v: unknown, dflt: number): number => {
  if (v === undefined || v === null || v === '') return dflt
  const n = Number(v)
  if (!Number.isFinite(n)) throw new Error('faq order must be a number, got ' + JSON.stringify(v))
  return n
}

export default createContentLoader('faq/*.md', {
  render: true,
  transform(raw): FaqItem[] {
    return raw
      .filter(({ frontmatter }) => !frontmatter.draft)
      .map(({ url, frontmatter, html }) => {
        if (!frontmatter.title) throw new Error('faq article without title: ' + url)
        return {
          title: String(frontmatter.title),
          url,
          description: frontmatter.description ? String(frontmatter.description) : '',
          category: frontmatter.category ? String(frontmatter.category) : '',
          lang: frontmatter.lang ? String(frontmatter.lang) : 'zh-CN',
          date: isoDay(frontmatter.date),
          text: plainText(html || ''),
          order: num(frontmatter.order, Number.MAX_SAFE_INTEGER),
        }
      })
      // order 小的在前（没写的排最后），同 order 按日期新的在前，再按标题
      .sort((a, b) => a.order - b.order || b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
      .map(({ order: _order, ...item }) => item)
  },
})
