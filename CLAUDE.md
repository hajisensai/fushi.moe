# fushi.moe — 给 AI 助手的约定

站点结构、构建与验证见 README.md；这里只写协作规则。

## 常见问题（faq/）

- **每篇文章必须有三个语言版本**：简体原文 `faq/<slug>.md`、英文 `faq/<slug>.en.md`（`lang: en`，人翻）、
  繁体 `faq/<slug>.zh-HK.md`（`lang: zh-HK`，由 `npm run faq:zh-hk` 从简体机器转换生成，**不要手改**）。
  只写一种语言不算完成；`tool/lang-routes.test.mjs` 会因缺文件或繁体版过期而失败。
- 英文版和原文的 `order` / `date` / `draft` 保持一致；`category` 用各自语言（中文「视频」↔ 英文 "Video"，
  已有的对照表见任一篇现有文章），同一个中文分组在英文里必须始终是同一个译名。新分组要在两种语言里各出现一次。
- 英文版里的站内链接：`/faq/<slug>` → `/faq/<slug>.en`，`/zh-cn/download` → `/download`，`/zh-cn/immersion` → `/immersion`。
- 流程：写简体 → 写英文 → 跑 `npm run faq:zh-hk` → 跑单测。
- 改了中文原文的事实性内容（步骤、设置项名、支持情况）时，英文版同步改、繁体重新生成；纯措辞润色英文可以不动，繁体仍要重新生成。
- 文章 frontmatter 的字段、`title` 就是问题本身、正文不写一级标题——见 README「常见问题」和 `faq/free.md` 里的样板注释。
- 写 Fushi 功能时以 [hajisensai/Fushi](https://github.com/hajisensai/Fushi) 仓库的字符串表（`fushi/lib/i18n/strings_zh-CN.i18n.json`）
  和 `docs/specs`、`docs/bugs` 为准，设置项名称照抄，不臆测。
- 不写盗版资源的获取渠道；网络代理相关内容不写。

## 改动范围

- 只在被要求时改常见问题之外的页面（首页 `public/index.html`、下载页、沉浸页）。
- 不主动提交、不推送；PR 由用户决定。

## 验证

- `node --test tool/lang-routes.test.mjs` 必过；改了页壳 / 侧栏 / 样式还要 `npm run docs:build` 后跑 `node tool/verify-faq.mjs`
  （本机 Chrome 不开 CDP 端口时 `FUSHI_BROWSER` 指向 Edge）。
