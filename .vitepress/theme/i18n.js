import { onMounted, onUnmounted, ref } from 'vue'

/**
 * VitePress 页里响应式区域（选源器、下载表）的界面语言入口。
 *
 * 字典本体由 /site.js（挂在 <head>）加载并通过 `fushi:i18n` 事件广播；页壳的静态文案走
 * data-i18n 由它直接改 DOM，这里只给模板里 `{{ t('key', '中文') }}` 用。
 *
 * initial 是这一页烤的语言与它的整份字典（各语言的 .md 把 /i18n/<code>.json import 进来传给
 * 组件）：服务端渲染没有 window，t() 按它取值，静态 HTML 就是该语言；访客语言与之相同时
 * site.js 不拉字典（广播的 dict 为空），这里保持 initial 不动。不传 initial 的页面退回
 * 「缺键返回中文原文」的旧行为。
 *
 * @param {{ lang: string, dict: Record<string, string> } | undefined} initial
 */
export function useSiteI18n(initial) {
  const dict = ref(initial && initial.dict ? initial.dict : {})
  const lang = ref(initial && initial.lang ? initial.lang : 'zh-CN')

  /** @returns {void} */
  function sync() {
    const i18n = typeof window !== 'undefined' ? window.fushiI18n : undefined
    if (!i18n || !i18n.dict) return
    dict.value = i18n.dict
    lang.value = i18n.lang
  }

  onMounted(() => {
    sync()
    document.addEventListener('fushi:i18n', sync)
  })
  onUnmounted(() => {
    if (typeof document !== 'undefined') document.removeEventListener('fushi:i18n', sync)
  })

  /**
   * @param {string} key
   * @param {string} zh 标记源语言原文，字典缺键时原样返回
   * @returns {string}
   */
  function t(key, zh) {
    const v = dict.value[key]
    return typeof v === 'string' ? v : zh
  }

  return { t, lang }
}
