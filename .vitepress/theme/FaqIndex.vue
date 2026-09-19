<script setup>
/*
 * 常见问题列表页本体（faq.md 只是一层薄壳）：问题列表 + 搜索框。数据来自 faq.data.mts（构建时扫 faq/*.md）。
 *
 * 常见问题不走语言路由：文章各写各的语言，列表只有 /faq 一条路由（root locale = 英文）。
 * 列表页自己的几句文案（标题 / 导语 / 搜索框 / 空态）SSR 时按传进来的英文字典烤好，访客语言不同时
 * site.js 广播 fushi:i18n、useSiteI18n 跟着换。
 *
 * 列表按当前界面语言挑文章、按 category 分组，规则在 faq-nav.js（左侧目录 FaqSidebar.vue 用同一份）。
 * 搜索在浏览器里做：标题 + 摘要 + 正文纯文本的子串匹配，空格分词、全部命中才算；
 * 不分大小写、全角半角归一。问题数量级是几十篇，不需要更重的索引。
 */
import { computed, ref } from 'vue'
import { data as items } from './faq.data.mts'
import { groupsOf, poolFor } from './faq-nav.js'
import { useSiteI18n } from './i18n.js'

const props = defineProps({
  /** 这一页烤的语言（faq.md 传 en） */
  lang: { type: String, required: true },
  /** 该语言的整份字典 */
  dict: { type: Object, required: true },
})

const { t, lang } = useSiteI18n({ lang: props.lang, dict: props.dict })
const q = ref('')

const norm = (s) => String(s).normalize('NFKC').toLowerCase()

const pool = computed(() => poolFor(items, lang.value))

const terms = computed(() => norm(q.value).split(/\s+/).filter(Boolean))

/** 搜索结果：每条带命中位置（标题 / 摘要里命中就不给片段；只在正文里命中才截一段上下文出来） */
const results = computed(() => {
  if (!terms.value.length) return null
  const out = []
  for (const it of pool.value) {
    const head = norm(it.title + ' ' + it.description)
    const body = norm(it.text)
    if (!terms.value.every((w) => head.includes(w) || body.includes(w))) continue
    let snippet = ''
    const inBody = terms.value.find((w) => !head.includes(w) && body.includes(w))
    if (inBody) {
      const i = body.indexOf(inBody)
      const a = Math.max(0, i - 40)
      const b = Math.min(it.text.length, i + inBody.length + 60)
      // norm 不改变长度（NFKC 极少数字符除外），直接用同一区间切原文
      snippet = (a > 0 ? '…' : '') + it.text.slice(a, b) + (b < it.text.length ? '…' : '')
    }
    out.push({ item: it, snippet })
  }
  return out
})

/** 不搜索时按分组列出（分组规则见 faq-nav.js，和侧栏同一份） */
const groups = computed(() => groupsOf(pool.value))
</script>

<template>
  <div class="faq">
    <h1>{{ t('faq.title', '常见问题') }}</h1>
    <p class="lead">{{ t('faq.lead', '装之前、装之后最常被问到的几件事，点进去看详细解答。') }}</p>

    <p v-if="!items.length" class="faq-empty">{{ t('faq.empty', '还没有内容。') }}</p>
    <template v-else>
      <div class="faq-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input v-model="q" type="search" autocomplete="off" :placeholder="t('faq.search', '搜索问题…')" :aria-label="t('faq.search', '搜索问题…')">
      </div>

      <template v-if="results">
        <p v-if="!results.length" class="faq-empty">{{ t('faq.no_results', '没有匹配的问题。') }}</p>
        <ul v-else class="faq-list">
          <li v-for="r in results" :key="r.item.url" :lang="r.item.lang">
            <a :href="r.item.url">
              <span class="faq-item-title">{{ r.item.title }}</span>
              <span v-if="r.snippet" class="faq-item-desc">{{ r.snippet }}</span>
              <span v-else-if="r.item.description" class="faq-item-desc">{{ r.item.description }}</span>
            </a>
          </li>
        </ul>
      </template>

      <template v-else>
        <section v-for="g in groups" :key="g.category" class="faq-group">
          <h2 v-if="g.category">{{ g.category }}</h2>
          <ul class="faq-list">
            <li v-for="it in g.items" :key="it.url" :lang="it.lang">
              <a :href="it.url">
                <span class="faq-item-title">{{ it.title }}</span>
                <span v-if="it.description" class="faq-item-desc">{{ it.description }}</span>
              </a>
            </li>
          </ul>
        </section>
      </template>
    </template>

    <p class="faq-more" v-html="t('faq.more', '没找到答案？来 <a href=&quot;https://discord.gg/WhjwyGmm7f&quot;>Discord</a> 或 <a href=&quot;https://qm.qq.com/q/Sx2nWTvJCw&quot;>QQ 群</a>问。')"></p>
  </div>
</template>
