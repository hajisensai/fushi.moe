---
title: "Fushi 功能一览"
date: 2026-08-20
summary: "查词、制卡、有声书、视频、漫画、下载、同步、Galgame——所有场景共用同一套词典、统计与复习流。"
tags: ["介绍"]
---

所有场景共用同一套词典、统计与复习流。适合相信「大量输入 + 只做自己卡」的沉浸式学习者。任意语种——可查语言由导入的词典决定，与界面语言无关。

## 查词

- 导入 [Yomitan](https://github.com/yomidevs/yomitan) / MDict (MDX) / ABBYY Lingvo (DSL) / Migaku 词典。
- 多词典并行查询，音调、词频标注；释义里的词可**递归再查**（嵌套弹窗）。
- 变形还原覆盖全部 Yomitan 转换语言，查询前自动做大小写 / 变音符号等归一化。
- 应用外划词查询（手机 + 桌面），另有浏览器扩展。

## 制卡（Anki）

- 经 AnkiDroid / AnkiConnect 一键制卡，内置 [Lapis](https://github.com/donkuri/lapis) 笔记模板一键建牌组。
- 自动填充语境句，支持录音与截图裁剪、多导出配置与自定义字段映射。

## 阅读与有声书

- EPUB 纵排 / 横排、分页 / 滚动、注音假名、自定义主题与字体。
- SRT / LRC / VTT / ASS 字幕自动对齐 EPUB 正文；播放时**逐句高亮、自动翻页**，任意句子起播、跨章无缝续播。
- 五色高亮、阅读统计（字数、时长、速度实时显示）。

## 视频

- 内置 [media_kit](https://github.com/media-kit/media-kit)（libmpv 核心）播放器，内嵌 + 外挂字幕、m3u8 导入。
- 播放中**在字幕上直接查词制卡**；媒体库支持标签、系列分组与批量操作。

## 漫画

- 页漫 / 条漫两种模式，**直接在图上框词查询**——内置 OCR 引擎，或接入你已有的 mokuro 流程。

## 下载

- AniList / Nyaa 应用内搜索，单集、整季、整卷漫画一键下载自动入库，**边下边看**。
- 订阅系列自动追更（运行时每 15 分钟检查），放送日历显示下一集时间。
- 内置 libtorrent 引擎，无需外部客户端；粘贴磁力链接直接下载。

## 同步

- 七种后端：Google Drive / OneDrive / Dropbox / WebDAV / FTP / SFTP / **Fushi 互联**。
- Fushi 互联：局域网设备直连配对，一台做主机、另一台远程读库，制卡可委托给对端的 Anki——不经任何云账号。

## Galgame 语音挖掘（仅 Windows）

- Hook 运行中的视觉小说，抓取当前句文本**和原声语音**一并做进卡片。
- 独立游戏库与逐作统计；hook 组件随主包离线安装，运行期不下载任何组件。

## 平台与语言

| 平台 | 状态 |
|---|---|
| Android（7.0+） | ✅ |
| Windows | ✅ |
| macOS | ✅ |
| iOS | ✅ |
| Linux | 🔧 从源码构建 |

17 种界面语言，全平台 Material Design 3。自由软件，GPLv3 许可发布，[源码在 GitHub](https://github.com/hajisensai/Fushi)。
