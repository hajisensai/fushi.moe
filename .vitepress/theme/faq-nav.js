/*
 * 常见问题的列表 / 侧栏共用的两个纯函数：按界面语言挑文章、按 category 分组。
 * 数据是 faq.data.mts 构建时收集的、已经排好序的文章数组（见那边的 FaqItem）。
 */

/**
 * 按当前界面语言挑文章：有这个语言写的问题就只列它们；一篇都没有（德语访客之类）就退回英文版；
 * 连英文都没有才全列（免得看到空页）。文章的翻译是同 slug 的 faq/<slug>.<lang>.md，见 README「常见问题」。
 * @template {{ lang: string }} T
 * @param {T[]} items
 * @param {string} lang
 * @returns {T[]}
 */
export function poolFor(items, lang) {
  const mine = items.filter((it) => it.lang === lang)
  if (mine.length) return mine
  const fallback = items.filter((it) => it.lang === 'en')
  return fallback.length ? fallback : items
}

/**
 * 按 category 分组；分组顺序 = 排序后第一次出现的顺序，没写 category 的归到最后一组（空标题）。
 * @template {{ category: string }} T
 * @param {T[]} items
 * @returns {{ category: string, items: T[] }[]}
 */
export function groupsOf(items) {
  const map = new Map()
  for (const it of items) {
    const key = it.category || ''
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(it)
  }
  const list = [...map.entries()].map(([category, entries]) => ({ category, items: entries }))
  return list.sort((a, b) => (a.category === '' ? 1 : 0) - (b.category === '' ? 1 : 0))
}

/**
 * 路由路径 → 和 faq.data.mts 里的 url 同形（cleanUrls：无 .html、无尾斜杠）。
 * @param {string} path
 * @returns {string}
 */
export function cleanPath(path) {
  let p = path.split('#')[0].split('?')[0]
  try { p = decodeURIComponent(p) } catch (_) { /* 保持原样 */ }
  p = p.replace(/\.html$/, '').replace(/\/index$/, '')
  if (p.length > 1) p = p.replace(/\/+$/, '')
  return p || '/'
}
