<script setup>
/*
 * 常见问题的左侧目录：列表页与文章页共用，按 category 分组、每组可展开 / 收起，当前文章高亮。
 * 数据与列表页同源（faq.data.mts + faq-nav.js 的分组规则），文章标题按各自语言原样列出。
 *
 * 分组默认收起，只展开当前文章所在的那一组（列表页上一组都不展开，分组标题本身就是目录）。
 * 展开状态只存在内存里：页壳在站内路由切换时不重新挂载，所以手动展开的组换页后还开着；
 * 换到别的文章时它所在的组会自动展开。
 * 窄屏（≤ 960px）整块目录收成正文上方的一条「目录」按钮，点开再看；换页自动收起。
 */
import { useData, useRoute } from 'vitepress'
import { computed, ref, watch } from 'vue'
import { data as items } from './faq.data.mts'
import { cleanPath, groupsOf, poolFor } from './faq-nav.js'
import { useSiteI18n } from './i18n.js'

const { lang: pageLang, theme } = useData()
/** 页壳文案：SSR 按本页 locale 烤（themeConfig.chrome），元素上带 data-i18n 供访客切语言时替换 */
const c = (key, zh) => (theme.value.chrome && typeof theme.value.chrome[key] === 'string' ? theme.value.chrome[key] : zh)
const { lang } = useSiteI18n({ lang: pageLang.value })

const groups = computed(() => groupsOf(poolFor(items, lang.value)))

const route = useRoute()
const current = computed(() => cleanPath(route.path))
const isIndex = computed(() => current.value === '/faq')

/** category → 展开了（默认全部收起） */
const expanded = ref({})
const isCollapsed = (category) => !expanded.value[category]
const toggle = (category) => { expanded.value = { ...expanded.value, [category]: !expanded.value[category] } }

const mobileOpen = ref(false)

watch(current, (path) => {
  mobileOpen.value = false
  const g = groups.value.find((x) => x.items.some((it) => it.url === path))
  if (g && g.category && !expanded.value[g.category]) expanded.value = { ...expanded.value, [g.category]: true }
}, { immediate: true })
</script>

<template>
  <aside class="faq-side" :class="{ 'is-open': mobileOpen }">
    <button type="button" class="faq-side-toggle" :aria-expanded="mobileOpen" aria-controls="faq-side-body" @click="mobileOpen = !mobileOpen">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
      <span data-i18n="faq.toc">{{ c('faq.toc', '目录') }}</span>
      <svg class="faq-side-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
    </button>
    <nav id="faq-side-body" class="faq-side-body" :aria-label="c('faq.toc', '目录')" data-i18n-attr="aria-label=faq.toc">
      <a class="faq-side-home" :class="{ 'is-active': isIndex }" :aria-current="isIndex ? 'page' : undefined" href="/faq"><span data-i18n="faq.title">{{ c('faq.title', '常见问题') }}</span></a>
      <section v-for="g in groups" :key="g.category" class="faq-side-group" :class="{ 'is-collapsed': g.category && isCollapsed(g.category) }">
        <button v-if="g.category" type="button" class="faq-side-head" :aria-expanded="!isCollapsed(g.category)" @click="toggle(g.category)">
          <span>{{ g.category }}</span>
          <svg class="faq-side-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <ul v-show="!g.category || !isCollapsed(g.category)">
          <li v-for="it in g.items" :key="it.url" :lang="it.lang">
            <a :href="it.url" :class="{ 'is-active': current === it.url }" :aria-current="current === it.url ? 'page' : undefined">{{ it.title }}</a>
          </li>
        </ul>
      </section>
    </nav>
  </aside>
</template>
