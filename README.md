# fushi.moe

[Fushi](https://github.com/hajisensai/Fushi) 官方网站，[VitePress](https://vitepress.dev/) + 自定义页壳。GitHub Actions 一次构建后把同一产物部署到 Cloudflare Pages 与 GitHub Pages，Cloudflare Worker 负责回源切换。

## 结构

```
.vitepress/config.mts   # 站点配置（head：chrome.css / site.js / SW 注册；locales：目录即语言）
.vitepress/theme/       # 自定义页壳 Layout.vue + prose.css + i18n.js + chunked-download.mjs + DownloadPage.vue
.vitepress/theme/lang-routes.mjs  # 语言路由真相源：17 种语言的路径前缀（英文无前缀 = 默认路由）、有语言版本的页面、hreflang/og
public/index.html       # 首页源文件（手写静态页，简体中文，含可交互 demo）；构建后 tool/build_lang_routes.mjs 按字典烤成 17 份：/ 英文 + /<lang>/
download.md             # 下载页英文版；<lang>/download.md 是其余 16 种语言，都是 tool/build_download_pages.mjs 生成的薄壳（本体 DownloadPage.vue，SSR 时就是该语言）
immersion.md            # 沉浸学习指南英文版；<lang>/immersion.md 是其余 16 种语言，17 页 + 字典键 imm.* 由 tool/build_immersion_i18n.mjs 生成（文案在 tool/immersion_translations_extra.mjs）
faq.md                  # 常见问题列表页（/faq，不分语言，带搜索；本体 .vitepress/theme/FaqIndex.vue，数据 faq.data.mts，左侧目录 FaqSidebar.vue，文章页右侧「本页内容」FaqOutline.vue）
faq/<slug>.md           # 常见问题的文章，一个问题一个文件 → /faq/<slug>；见下面「常见问题」
public/chrome.css       # 顶栏 / 底栏 / 设计 token，两种页面共用
public/site.js          # 界面语言（17 种，与 app 同集）+ 顶栏语言菜单 + 浮动回顶
public/i18n/<code>.json # 站点文案字典；zh-CN 是源语言，键与标记上的 data-i18n 同一份
edge/                   # Worker：站点故障切换、R2 安装包、通道清单、分片来源代理、推荐包 Workers Cache
public/icon-placeholder.png  # 占位图标（待正式 logo 替换）
```

## 本地预览

```bash
npm ci
npm run docs:dev       # http://localhost:5173（首页的 17 条语言路由由 config.mts 的 dev 插件现烤，和构建产物同一套 renderHome）
npm run docs:build     # 产物在 .vitepress/dist
npm run verify         # 单测 + 首页/下载页/常见问题/SW 的无头浏览器验证（先 docs:build）
```

无头验证默认找本机的 Chrome / Edge；Chrome 起不来 CDP 端口时用 `FUSHI_BROWSER=<浏览器路径>` 指定另一个。

## 常见问题

常见问题就是一个小博客：外层 `/faq` 是问题列表 + 搜索框，点进去是一篇文章；两种页都套文档式布局——左侧是按分组、默认收起（只展开当前文章所在组）的
目录（当前文章高亮，窄屏收成一条「目录」按钮），文章页右侧还有正文二级标题的「本页内容」。一个问题就是 `faq/` 下的一个 markdown 文件，
文件名即地址（`faq/anki.md` → `/faq/anki`），列表和搜索索引构建时自动收集，不用改任何别的文件。frontmatter：

```yaml
---
title: "怎么连接 Anki？"     # 必填，就是问题本身；正文里不要再写一级标题，页壳会渲染
description: "一句话摘要"    # 选填，列表里的摘要 + 分享链接预览
category: "Anki 与制卡"     # 选填，列表和左侧目录的分组标题；同名归一组，组的顺序按第一次出现
order: 60                  # 选填，数字，列表里小的在前；没写的排最后
date: 2026-09-19           # 选填，YYYY-MM-DD，文章页显示「更新于」；同 order 时新的在前
lang: zh-CN                # 选填，文章写的语言，默认 zh-CN；翻译文件必须写（faq/x.en.md → lang: en）
draft: true                # 选填，不进列表也不进搜索（页面仍会构建）
---
```

搜索在浏览器里做：标题 + 摘要 + 正文纯文本的子串匹配（空格分词、全部命中才算，不分大小写、全角半角归一），
只在正文里命中时列表项显示命中处的一段上下文。列表按当前界面语言挑文章（有这个语言写的就只列它们，一篇都没有就全列）。

常见问题不走语言路由，文章的翻译是同目录下的 `faq/<slug>.<lang>.md`（frontmatter `lang` 同值，链接 `/faq/<slug>.<lang>`）：
每篇都要有简体原文 `faq/<slug>.md`、英文 `faq/<slug>.en.md`（人翻）和繁体 `faq/<slug>.zh-HK.md`（`npm run faq:zh-hk` 从简体机器
转换生成，不要手改），`tool/lang-routes.test.mjs` 守着三份齐全、繁体版不过期、分组译名一致；规则全文见 `CLAUDE.md`。列表和侧栏按界面
语言挑文章（没有该语言的就退回英文，再没有才全列），文章页壳的几句文案（`faq.*`）在字典里，访客切语言时照旧由 site.js 换；
config.mts 给同一篇的各语言版本互挂 hreflang。样板见 `faq/free.md`。正文用二级标题分节（`##`），它们就是右侧「本页内容」。

## 界面语言

三个页面（首页 / 下载页 / 沉浸页）每种语言各有一条静态路由：英文是默认路由（`/`、`/download`、`/immersion`），
其余 16 种在 `/<prefix>/` 下（`/zh-cn/`、`/ja/download`、`/pt-br/immersion` …，表在 `.vitepress/theme/lang-routes.mjs`）。
每页烤好该语言的正文、`<html lang>`、标题 / 描述 / og / hreflang——链接预览爬虫不跑 JS，分享哪个链接预览就是哪个语言。
源标记（`public/index.html`、页壳）写简体中文；其它语言的文案在 `public/i18n/<code>.json`。构建时首页由
`tool/build_lang_routes.mjs` 按字典烤出 17 份，VitePress 页按目录 locale 出 `<html lang>`、页壳文案从 `themeConfig.chrome` 取。

访客语言（`?lang=ja` 可强制，选择记在 localStorage，默认按浏览器语言列表（Accept-Language 顺序）取第一个支持的语言，
不看地区/时区；规则由 `tool/verify-i18n-detect.mjs` 守）与本页烤的语言不同时，`public/site.js` 按 `data-i18n="key"`
在浏览器里替换，站内链接改到该语言的路由，标题 / 描述按页面声明的 `<meta name="fushi-title">` 模板重算。
改中文文案后要同步改各语言字典里的同一键；新增可翻译元素就挂 `data-i18n`（属性用 `data-i18n-attr="alt=key"`），
JS 里的动态文案走 `fushiI18n.t(key, '中文')`；改了字典要重跑 `node tool/build_download_pages.mjs` 与
`node tool/build_immersion_i18n.mjs`（`npm run verify` 里的 `tool/lang-routes.test.mjs` 守生成页与字典一致）。

## 部署

推送到 `main` 后 `.github/workflows/deploy.yml` 自动构建发布。完整的 Cloudflare 资源、DNS 切换、GitHub 项目站路径与回退步骤见 [`docs/failover.md`](docs/failover.md)。

正式激活前，根目录 `CNAME` 继续维持现有 GitHub Pages 自定义域；只在 `fushi.moe` 已切到 Cloudflare Pages + Worker 后删除。
