# fushi.moe

[Fushi](https://github.com/hajisensai/Fushi) 官方网站，[VitePress](https://vitepress.dev/) 默认主题。GitHub Actions 一次构建后把同一产物部署到 Cloudflare Pages 与 GitHub Pages，Cloudflare Worker 负责回源切换。

## 结构

```
.vitepress/config.mts   # 站点配置（导航、侧栏、社交链接、本地搜索）
index.md                # 首页（hero + 功能九宫格）
guide.md                # 「5 分钟配好 Fushi」上手教程
features.md             # 功能一览
download.md             # 下载页
public/images/guide/    # 教程配图（来自主仓库 docs/static-assets/user-guide）
public/icon-placeholder.png  # 占位图标（待正式 logo 替换）
```

## 本地预览

```bash
npm ci
npm run docs:dev       # http://localhost:5173
npm run docs:build     # 产物在 .vitepress/dist
```

## 部署

推送到 `main` 后 `.github/workflows/deploy.yml` 自动构建发布。完整的 Cloudflare 资源、DNS 切换、GitHub 项目站路径与回退步骤见 [`docs/failover.md`](docs/failover.md)。

正式激活前，根目录 `CNAME` 继续维持现有 GitHub Pages 自定义域；只在 `fushi.moe` 已切到 Cloudflare Pages + Worker 后删除。
