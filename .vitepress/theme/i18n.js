import { onMounted, onUnmounted, ref } from 'vue'

/**
 * VitePress 页里响应式区域（选源器、下载表）的界面语言入口。
 *
 * 字典本体由 /site.js（挂在 <head>）加载并通过 `fushi:i18n` 事件广播；静态正文走
 * data-i18n 由它直接改 DOM，这里只给模板里 `{{ t('key', '中文') }}` 用。
 * 服务端渲染阶段没有 window，t() 返回中文原文——与标记里写死的语言一致。
 */
export function useSiteI18n() {
  const dict = ref({})
  const lang = ref('zh-CN')

  /** @returns {void} */
  function sync() {
    const i18n = typeof window !== 'undefined' ? window.fushiI18n : undefined
    if (!i18n) return
    dict.value = i18n.dict || {}
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
