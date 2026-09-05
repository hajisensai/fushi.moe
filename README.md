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
public/chrome.css       # 顶栏 / 底栏 / 设计 token，两种页面共用
public/site.js          # 界面语言（17 种，与 app 同集）+ 顶栏语言菜单 + 浮动回顶
public/i18n/<code>.json # 站点文案字典；zh-CN 是源语言，键与标记上的 data-i18n 同一份
edge/                   # Worker：站点故障切换、R2 安装包、通道清单、分片来源代理、推荐包 Workers Cache
public/icon-placeholder.png  # 占位图标（待正式 logo 替换）
```

## 本地预览

```bash
npm ci
npm run docs:dev       # http://localhost:5173
npm run docs:build     # 产物在 .vitepress/dist
npm run verify         # 单测 + 首页/下载页/SW 的无头浏览器验证（先 docs:build）
```

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
