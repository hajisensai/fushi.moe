---
title: "连平泽唯都能五分钟配好的 Fushi 教程"
date: 2026-08-21
summary: "三步走：装上 → 一键导入推荐词典和发音音频 → 接上 Anki。没有繁琐设置，照着点就行。"
tags: ["教程"]
---

三步走：**装上 → 一键导入推荐词典和发音音频 → 接上 Anki**。词典是一整个打包好的备份，不用一本一本挑；Anki 那步照着图点两个按钮就完事。

| 时间 | 做什么 |
|---|---|
| 第 1 分钟 | 下载安装（Android 选 arm64，Windows 选 .exe） |
| 第 2 分钟 | 导入推荐词典包（设置 → 同步与备份 → 导入备份） |
| 第 3–5 分钟 | 接上 Anki（刷新牌组 → 一键创建 Lapis 牌组） |

## 一、下载并安装 Fushi（约 1 分钟）

去 [GitHub Releases](https://github.com/hajisensai/Fushi/releases/latest) 下最新版：

1. **Android**：选 `arm64` 的 .apk（需 Android 7.0 及以上）。
2. **Windows**：选 `.exe` 安装包。
3. **macOS / iOS**：按 Release 页说明选择对应文件。

## 二、一键导入推荐词典 + 发音音频（约 1 分钟操作）

这是一个打包好的备份文件，含**推荐单词词典、音调词典、词频词典**，以及**日语 / 英语本地发音音频库**。新手强烈推荐——省去逐本找词典的所有麻烦（也可以跳过，之后自己导入词典）。

- [Cloudflare 直链（9.5 GB）](https://dl.wrds.xyz/fushi-recommended-2026-08-14.fushi.zip)
- [Google Drive](https://drive.google.com/file/d/1W0Civ-b9NAyCu6LpXYMcNI_wZJWB9xjp/view?usp=sharing)

文件较大，下载可以挂在后台——教程说的五分钟不含这段下载时间。

下载完成后，打开 Fushi：**设置 → 同步与备份 → 点「导入备份」**，选中刚下好的文件。

> ⚠️ **注意**：导入备份会清空本地已有数据。请在刚装好、还没导入自己内容时做这一步（该流程会在后续版本改进）。

![导入备份界面](/images/guide/import-backup.png)

## 三、接上 Anki（约 2–3 分钟）

Anki——名字来自「暗記（あんき）」——是世界上使用最广的[间隔重复（SRS）](https://zh.wikipedia.org/wiki/%E9%97%B4%E9%9A%94%E9%87%8D%E5%A4%8D)软件。你在 Fushi 里查到的词，一键送进 Anki，用最少的复习时间达到最好的记忆效果。先从 [Anki 官网](https://apps.ankiweb.net/)装好它。

> 💡 **务必做一件事**：Anki 默认算法是 30 多年前的 SM2，效果很差。请在牌组选项里把算法切换成内置的 **FSRS**——世界上最好的间隔重复算法之一。

### Android（AnkiDroid）

1. 安装并打开 Anki（AnkiDroid）。
2. 回到 Fushi，进入 **设置 → 制卡**。
3. 点 **「刷新牌组与笔记模板」**（图中 ①）；Fushi 会请求权限，点允许。
4. 点 **「创建 Lapis 牌组」**（图中 ②）。
5. 没有红色警告或报错，就配置成功了。

![Android 端 Anki 配置](/images/guide/anki-android-setup.png)

### Windows（AnkiConnect）

1. 安装并打开 Anki。
2. 点左上角 **「工具」** 菜单 → 附加组件 → 获取插件。
3. 粘贴插件代码安装 AnkiConnect：`2055492159`，然后重启 Anki。
4. 回到 Fushi，进入 **设置 → 制卡**。
5. 点 **「刷新牌组与笔记模板」**（图中 ①）。
6. 点 **「创建 Lapis 牌组」**（图中 ②）。
7. 没有红色警告或报错，就配置成功了。

![Anki Windows 工具菜单](/images/guide/anki-windows-tools-menu.png)

![Windows 端 Anki 配置](/images/guide/anki-windows-setup.png)

## 四、（可选）过一遍设置

阅读主题、字体、注音假名、界面缩放、同步后端……设置页里逛一圈，看看有没有想按自己习惯调整的。不调也完全能用。

---

配好了，剩下的就是看你想看的：导入一本 EPUB、拖进一集番、或者直接在应用里搜索下载——遇到不认识的词，点一下查，再点一下记住它。

有问题来 [Discord](https://discord.gg/WhjwyGmm7f) 问，反馈会被很快处理。更多语言版本的完整指南见[简体中文（飞书）](https://ncnies6wfjok.feishu.cn/wiki/OZbww3T3IiEAx5kBhHkcF07vncb)和 [English Guide](https://github.com/hajisensai/Fushi/blob/main/docs/user-guide.md)。
