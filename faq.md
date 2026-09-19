---
title: "FAQ"
description: "Frequently asked questions about Fushi, before and after installing."
head:
  - - link
    - rel: "canonical"
      href: "https://fushi.moe/faq"
  - - meta
    - property: "og:type"
      content: "website"
  - - meta
    - property: "og:site_name"
      content: "Fushi"
  - - meta
    - property: "og:title"
      content: "Fushi FAQ"
  - - meta
    - property: "og:description"
      content: "Frequently asked questions about Fushi, before and after installing."
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/faq"
  - - meta
    - name: "twitter:card"
      content: "summary"
  - - meta
    - name: "fushi-title"
      content: "{faq.title} | Fushi"
  - - meta
    - name: "fushi-description"
      content: "{faq.lead}"
---

<!--
  常见问题列表页：只有这一条路由（/faq，不分语言），问题各写各的语言。
  要加一个问题就在 faq/ 下新建一个 .md（格式见 README「常见问题」一节或 faq/free.md），
  列表和搜索索引由 .vitepress/theme/faq.data.mts 构建时自动收集，这里不用改。
-->

<script setup>
import FaqIndex from './.vitepress/theme/FaqIndex.vue'
import dict from './public/i18n/en.json'
</script>

<FaqIndex lang="en" :dict="dict" />
