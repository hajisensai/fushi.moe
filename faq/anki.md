---
title: "怎么连接 Anki？"
description: "桌面端 Anki + AnkiConnect，Android 用 AnkiDroid，iOS 用 AnkiMobile。Anki 没开时卡片先排队；不装 Anki 也能直接同步到 Anki 服务器。"
category: "Anki 与制卡"
order: 57
date: 2026-10-07
---

- **Windows / macOS**：装 Anki，再装 [AnkiConnect](https://ankiweb.net/shared/info/2055492159) 插件（Anki 开着时，Fushi 制卡设置里的「安装 AnkiConnect」可以替你下载并交给 Anki，按 Anki 的提示确认、重启即可），制卡时保持 Anki 开着；打开制卡设置里的「启动 Fushi 时自动启动 Anki」就不用每次自己开。
- **Android**：装 AnkiDroid。
- **iOS**：装 AnkiMobile。

在新手引导或 **设置 → 制卡** 里连上之后，点「创建并选用 Lapis」就能一键建好内置 Lapis 模板的牌组。

之后看番、读书、玩游戏时点词查释义，点旁边的加号就制成一张卡，卡上带原句、截图 / 视频片段和原声音频。

视频片段卡要笔记类型能播视频：用的不是 Fushi 建的 Lapis、而是自己的模板（Kiku 等）时，在 **设置 → 制卡** 的「视频播放适配」里点「启用 / 更新」改一下模板（会先备份，可以恢复原模板）；没适配的笔记类型会自动改用 GIF + 音频。

## Anki 没开或连不上怎么办

连不上 Anki 时做的卡不会丢：它们先存进本机的 **待发卡片**，下次能连上 Anki 时自动补发，也可以在 **设置 → 制卡 → 待发卡片** 里点「全部发送」。想攒一批再一次性发，就打开「批量制卡」。

还有两种不用在制卡的设备上装 Anki 的办法：

- **交给另一台设备**：手机配好 [Fushi 互联](/faq/interconnect)后打开「制卡到 Fushi 互联服务端」，卡进电脑的 Anki；电脑关机时卡先存在手机上，连上再补发。用云盘同步的话，也可以在装了 Anki 的那台设备上打开「本机负责落地其他设备的卡片」。
- **直接同步到 Anki 服务器**：**设置 → 制卡 → Anki 同步（无需安装 Anki）**，打开「直接同步到 Anki」，填自建同步服务器地址和账号，「登录并下载牌组集合」。留空服务器地址就是 AnkiWeb——但 AnkiWeb 的服务条款只允许官方客户端同步，Fushi 会如实表明身份，AnkiWeb 可能拒绝连接或对账号采取措施；自建同步服务器没有这项限制。
