---
title: "怎麼連線 Anki？"
description: "桌面端 Anki + AnkiConnect，Android 用 AnkiDroid，iOS 用 AnkiMobile。Anki 沒開時卡片先排隊；不裝 Anki 也能直接同步到 Anki 伺服器。"
category: "Anki 與制卡"
order: 57
date: 2026-10-07
lang: zh-HK
---

- **Windows / macOS**：裝 Anki，再裝 [AnkiConnect](https://ankiweb.net/shared/info/2055492159) 外掛（Anki 開著時，Fushi 制卡設定裡的「安裝 AnkiConnect」可以替你下載並交給 Anki，按 Anki 的提示確認、重啟即可），制卡時保持 Anki 開著；開啟制卡設定裡的「啟動 Fushi 時自動啟動 Anki」就不用每次自己開。
- **Android**：裝 AnkiDroid。
- **iOS**：裝 AnkiMobile。

在新手引導或 **設定 → 制卡** 裡連上之後，點「建立並選用 Lapis」就能一鍵建好內建 Lapis 模板的牌組。

之後看番、讀書、玩遊戲時點詞查釋義，點旁邊的加號就製成一張卡，卡上帶原句、截圖 / 影片片段和原聲音訊。

影片片段卡要筆記型別能播影片：用的不是 Fushi 建的 Lapis、而是自己的模板（Kiku 等）時，在 **設定 → 制卡** 的「影片播放適配」裡點「啟用 / 更新」改一下模板（會先備份，可以恢復原模板）；沒適配的筆記型別會自動改用 GIF + 音訊。

## Anki 沒開或連不上怎麼辦

連不上 Anki 時做的卡不會丟：它們先存進本機的 **待發卡片**，下次能連上 Anki 時自動補發，也可以在 **設定 → 制卡 → 待發卡片** 裡點「全部發送」。想攢一批再一次性發，就開啟「批次制卡」。

還有兩種不用在制卡的裝置上裝 Anki 的辦法：

- **交給另一臺裝置**：手機配好 [Fushi 互聯](/faq/interconnect.zh-HK)後開啟「制卡到 Fushi 互聯服務端」，卡進電腦的 Anki；電腦關機時卡先存在手機上，連上再補發。用雲盤同步的話，也可以在裝了 Anki 的那臺裝置上開啟「本機負責落地其他裝置的卡片」。
- **直接同步到 Anki 伺服器**：**設定 → 制卡 → Anki 同步（無需安裝 Anki）**，開啟「直接同步到 Anki」，填自建同步伺服器地址和賬號，「登入並下載牌組集合」。留空伺服器地址就是 AnkiWeb——但 AnkiWeb 的服務條款只允許官方客戶端同步，Fushi 會如實表明身份，AnkiWeb 可能拒絕連線或對賬號採取措施；自建同步伺服器沒有這項限制。
