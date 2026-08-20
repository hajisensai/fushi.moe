# fushi.moe

[Fushi](https://github.com/hajisensai/Fushi) 官方网站源码，纯静态 HTML/CSS，无构建步骤，由 GitHub Pages 托管。

## 结构

```
index.html        # 官网首页（功能、截图、下载）
guide/index.html  # 「5 分钟配好 Fushi」上手教程
assets/site.css   # 共享样式（和纸 · 墨 · 朱印）
assets/img/       # 截图与教程配图（来自主仓库 docs/static-assets，已压缩）
CNAME             # 自定义域名 fushi.moe
```

## 本地预览

直接用浏览器打开 `index.html` 即可（无任何构建依赖）。

## 部署

推送到 `main` 分支后 GitHub Pages 自动发布。自定义域名解析需要在 DNS 服务商处配置：

- `fushi.moe` A 记录 → `185.199.108.153` / `185.199.109.153` / `185.199.110.153` / `185.199.111.153`
- `www.fushi.moe` CNAME 记录 → `hajisensai.github.io`（可选）

## 更新截图

截图源文件在主仓库 `docs/static-assets/`，大图用 ffmpeg 压缩后放入 `assets/img/`：

```bash
ffmpeg -i src.png -vf "scale='min(1600,iw)':-2" -q:v 3 assets/img/dst.jpg
```
