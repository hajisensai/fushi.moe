<script setup>
/*
 * 常见问题文章页右侧的「本页内容」：正文二级标题的锚点列表，滚到哪一节高亮哪一节。
 * 标题数据是 VitePress 构建时抽的（config.mts 的 markdown.headers），不用扫 DOM；
 * 高亮靠滚动时量各标题离顶栏的距离，宽屏（≥ 1200px）才显示，样式在 prose.css（外层 aside 占格子，内层 .faq-outline-body 钉在视口）。
 */
import { useData, useRoute } from 'vitepress'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const { page, theme } = useData()
const c = (key, zh) => (theme.value.chrome && typeof theme.value.chrome[key] === 'string' ? theme.value.chrome[key] : zh)

const headers = computed(() => (page.value.headers || []).filter((h) => h.level === 2))
const active = ref('')

let raf = 0
function measure() {
  raf = 0
  const list = headers.value
  if (!list.length) { active.value = ''; return }
  const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 52
  const doc = document.documentElement
  // 已经滚到底：最后一节可能永远到不了顶栏下方，直接算它
  if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) { active.value = list[list.length - 1].slug; return }
  let slug = ''
  for (const h of list) {
    const el = document.getElementById(h.slug)
    if (!el) continue
    if (el.getBoundingClientRect().top - navH - 40 <= 0) slug = h.slug
    else break
  }
  active.value = slug
}
function schedule() { if (!raf) raf = requestAnimationFrame(measure) }

const route = useRoute()
watch(() => route.path, async () => { await nextTick(); schedule() }, { flush: 'post' })
onMounted(() => {
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  schedule()
})
onUnmounted(() => {
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <aside v-if="headers.length" class="faq-outline" :aria-label="c('faq.outline', '本页内容')" data-i18n-attr="aria-label=faq.outline">
    <div class="faq-outline-body">
      <p class="faq-outline-title" data-i18n="faq.outline">{{ c('faq.outline', '本页内容') }}</p>
      <ul>
        <li v-for="h in headers" :key="h.slug">
          <a :href="'#' + h.slug" :class="{ 'is-active': active === h.slug }">{{ h.title }}</a>
        </li>
      </ul>
    </div>
  </aside>
</template>
