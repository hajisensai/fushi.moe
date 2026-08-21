# fushi.moe

[Fushi](https://github.com/hajisensai/Fushi) 官方网站，[Hugo](https://gohugo.io/) + [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 主题（git submodule），GitHub Actions 自动部署到 GitHub Pages。

## 结构

```
hugo.toml                  # 站点配置（菜单、首页简介、社交链接）
content/posts/5min-setup.md   # 「5 分钟配好 Fushi」上手教程
content/posts/features.md     # 功能一览
content/download.md           # 下载页
static/images/guide/          # 教程配图（来自主仓库 docs/static-assets/user-guide）
static/icon-placeholder.png   # 占位图标（待正式 logo 替换）
themes/PaperMod               # 主题 submodule
```

## 本地预览

```bash
git clone --recurse-submodules https://github.com/hajisensai/fushi.moe
hugo server        # http://localhost:1313
```

## 部署

推送到 `main` 后 `.github/workflows/hugo.yml` 自动构建发布（Pages 源已设为 GitHub Actions）。自定义域名 fushi.moe 在仓库 Pages 设置中配置；DNS 需在服务商处把 A 记录指向 GitHub Pages：

- `fushi.moe` A → `185.199.108.153` / `185.199.109.153` / `185.199.110.153` / `185.199.111.153`
- 或 CNAME → `hajisensai.github.io`
