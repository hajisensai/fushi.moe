# fushi.moe

[Fushi](https://github.com/hajisensai/Fushi) 官方网站，[VitePress](https://vitepress.dev/) 默认主题，GitHub Actions 自动部署到 GitHub Pages。

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

推送到 `main` 后 `.github/workflows/deploy.yml` 自动构建发布（Pages 源为 GitHub Actions）。自定义域名 fushi.moe 在仓库 Pages 设置中配置；DNS 需在服务商处把 A 记录指向 GitHub Pages：

- `fushi.moe` A → `185.199.108.153` / `185.199.109.153` / `185.199.110.153` / `185.199.111.153`
- 或 CNAME → `hajisensai.github.io`
