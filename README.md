# fushi.moe

[Fushi](https://github.com/hajisensai/Fushi) 官方网站，[VitePress](https://vitepress.dev/) + 自定义页壳。GitHub Actions 一次构建后把同一产物部署到 Cloudflare Pages 与 GitHub Pages，Cloudflare Worker 负责回源切换。

## 结构

```
.vitepress/config.mts   # 站点配置（head：chrome.css / site.js / SW 注册）
.vitepress/theme/       # 自定义页壳 Layout.vue + prose.css + i18n.js + chunked-download.mjs
public/index.html       # 首页（手写静态页，含可交互 demo）
download.md             # 下载页（通道 / 选源 / 分片加速 + 上手教程）
immersion.md            # 沉浸学习指南（正文 + 右侧侧注；仅中文）
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

标记里写死简体中文；其它 16 种语言的文案在 `public/i18n/<code>.json`，由 `public/site.js` 按
`data-i18n="key"` 在浏览器里替换（`?lang=ja` 可强制，选择记在 localStorage，默认按浏览器语言列表（Accept-Language 顺序）取第一个支持的语言，不看地区/时区；规则由 `tool/verify-i18n-detect.mjs` 守）。
改中文文案后要同步改各语言字典里的同一键；新增可翻译元素就挂 `data-i18n`（属性用 `data-i18n-attr="alt=key"`），
JS 里的动态文案走 `fushiI18n.t(key, '中文')`。

## 部署

推送到 `main` 后 `.github/workflows/deploy.yml` 自动构建发布。完整的 Cloudflare 资源、DNS 切换、GitHub 项目站路径与回退步骤见 [`docs/failover.md`](docs/failover.md)。

正式激活前，根目录 `CNAME` 继续维持现有 GitHub Pages 自定义域；只在 `fushi.moe` 已切到 Cloudflare Pages + Worker 后删除。
