---
title: "Fushi 和 asbplayer、Language Reactor、Migaku、Yomitan、Anki 有什麼區別？能一起用嗎？"
description: "Yomitan 是瀏覽器查詞擴充套件，asbplayer 和 Language Reactor 主要在瀏覽器裡給影片加字幕查詞，Migaku 是付費訂閱的一體化工具，Anki 負責間隔重複複習。Fushi 是一個免費開源的獨立應用，把看番、讀輕小說、漫畫 OCR、Galgame 查詞和 Anki 制卡放在一起，並且可以和這些工具同時使用。"
category: "關於 Fushi"
order: 25
date: 2026-10-18
lang: zh-HK
---

用沉浸法學語言（見[什麼是沉浸學習](/zh-hk/immersion)）的人，工具箱裡往往已經有好幾樣東西：瀏覽器裡裝了 Yomitan，看 Netflix 用 Language Reactor 或 asbplayer，卡片進 Anki。Fushi 不是要你把這些全換掉，而是補上它們沒覆蓋到的地方。這一篇按工具逐個說清楚區別，以及怎麼搭配。

先說一句定位：**Fushi 是一個獨立安裝的應用**（Windows、macOS、Android、iOS，Linux 可自行構建，見[支援哪些平臺](/faq/platforms.zh-HK)），不是瀏覽器擴充套件。它把本地影片播放器、EPUB 閱讀器、漫畫閱讀器、有聲書、Galgame 文本 Hook 和詞典查詞放在同一個程式裡，查到的詞一鍵做成 Anki 卡。它以 GPLv3 開源、完全免費（見[Fushi 是免費的嗎](/faq/free.zh-HK)）。

下面對其他工具的描述基於它們公開的資料，功能和價格會變，以各自官網為準。

## 一張表看區別

| | 形態 | 主要場景 | 費用 | 複習（SRS） |
|---|---|---|---|---|
| **Fushi** | 獨立應用（桌面 + 手機），另帶瀏覽器擴充套件 | 本地番劇 / 影片、輕小說 EPUB、漫畫、有聲書、Galgame、網頁 | 免費、開源 | 交給 Anki |
| **Yomitan** | 瀏覽器擴充套件 | 網頁上懸停查詞 | 免費、開源 | 交給 Anki |
| **asbplayer** | 瀏覽器擴充套件 + 網頁播放器 | 流媒體網站和本地影片的字幕、句子挖掘 | 免費、開源 | 交給 Anki |
| **Language Reactor** | 瀏覽器擴充套件 | Netflix、YouTube 的雙語字幕與查詞 | 有免費版和付費 Pro | 以官網為準 |
| **Migaku** | 瀏覽器擴充套件 + 應用 | 網頁 / 影片查詞、制卡、詞彙追蹤 | 付費訂閱 | 自帶 |
| **Anki** | 獨立應用 | 間隔重複複習 | 桌面版與 AnkiDroid 免費，AnkiMobile 付費 | 它本身就是 |

## Fushi 和 Yomitan

[Yomitan](https://yomitan.wiki/)（Yomichan 的繼任者）是瀏覽器裡的彈出式詞典：按住 Shift 把滑鼠移到網頁上的詞，就彈出釋義，能把詞做成 Anki 卡。它是網頁查詞的事實標準，詞典格式也成了社群通用格式。

和 Fushi 的關係：

- **詞典通用**：Fushi 直接匯入 Yomitan 詞典 zip（也認 MDict 的 `.mdx` / `.mdd`、`.dsl`、StarDict），去屈折變形用的也是 Yomitan 的變形表。你給 Yomitan 攢的詞典可以原樣拿來用，見[怎麼匯入詞典](/faq/dictionaries.zh-HK)。
- **發音庫通用**：Yomitan「本地音訊伺服器」那份資料庫，Fushi 的「本地音訊資料庫」可以直接指向它的 `entries.db`。
- **場景不同**：Yomitan 在瀏覽器裡；Fushi 在應用裡點詞即查，覆蓋的是瀏覽器之外的東西——本地影片字幕、EPUB、漫畫圖片裡的字、Galgame 的臺詞，手機上也能用。
- **能一起用**：Fushi 自帶一個瀏覽器擴充套件，同樣是 Shift 查詞，用的是 Fushi 裡的詞典。兩個擴充套件都裝的話會各彈各的，建議網頁查詞只留一個（見[瀏覽器裡怎麼查詞](/faq/browser-lookup.zh-HK)）。Fushi 還能開一個相容 yomitan-api 協議的「Fushi API 伺服器」，讓原本對接 Yomitan 的工具改查 Fushi 的詞典。

## Fushi 和 asbplayer、Language Reactor

[asbplayer](https://github.com/asbplayer/asbplayer) 是一個開源的瀏覽器擴充套件加網頁播放器，能在流媒體網站和本地影片上顯示可選中的字幕，配合 Yomitan 查詞，並把當前這句（帶截圖和音訊）做成 Anki 卡。Fushi 瀏覽器擴充套件的流媒體字幕部分參考過它。

[Language Reactor](https://www.languagereactor.com/) 是面向 Netflix 和 YouTube 的瀏覽器擴充套件，以雙語字幕、彈出詞典、自動暫停這些功能出名，有免費版，也有提供更多功能的付費 Pro。

它們和 Fushi 最大的區別是**在哪兒看**：

- 它們主要在桌面瀏覽器裡，圍繞流媒體網站工作；
- Fushi 的影片播放器是一個本地播放器（基於 mpv），播你硬碟、NAS、Jellyfin / Emby / Plex 媒體伺服器（見[媒體伺服器](/faq/media-servers.zh-HK)）或已配對電腦上的番劇，手機上也能看。字幕點詞即查，支援[雙語 / 副字幕](/faq/secondary-subtitle.zh-HK)、字幕列表、跳句重播、字幕對軸，制卡時自動帶這句的畫面截圖或片段和原聲音訊。
- 對網頁影片，Fushi 的瀏覽器擴充套件也能在 Netflix、YouTube 等網站上疊一層可查詞的 Fushi 字幕，並把字幕抓進側邊欄。

**能一起用嗎？** 能。常見的分工是：網頁流媒體繼續用你習慣的 asbplayer 或 Language Reactor，下載到本地的番劇、手機上看番交給 Fushi。注意同一個網頁上同時開兩套字幕覆蓋層和兩個 Shift 查詞擴充套件，介面會互相打架，網頁上選一個用就好。

## Fushi 和 Migaku

[Migaku](https://migaku.com/) 是一個商業的一體化學習工具，按訂閱收費：瀏覽器擴充套件負責網頁和影片上的查詞、制卡，還帶自己的閃卡複習系統，會記錄你認識哪些詞、估計一段內容你能看懂多少。

和 Fushi 的區別：

- **費用與開源**：Migaku 是付費訂閱的商業產品；Fushi 免費、原始碼公開，沒有內購。
- **複習放在哪**：Migaku 有自己的複習系統；Fushi 不做複習，卡片全部進 Anki，用你自己的牌組、模板和 FSRS。
- **內容範圍**：Fushi 側重本地內容——本地番劇、EPUB 輕小說、漫畫 OCR、有聲書、Windows 上的 Galgame 文本 Hook。
- **資料**：Fushi 不要求註冊，資料預設只在你的裝置上（見[我的資料存在哪裡](/faq/data.zh-HK)）。

如果你已經在 Migaku 裡攢了一套複習，沒有必要為了 Fushi 搬走；兩者的卡片體系是分開的，Fushi 做的卡只進 Anki。

## Fushi 和 Anki 本身

Anki 是間隔重複複習軟體，Fushi 不替代它，而是給它供卡：

- 桌面端通過 AnkiConnect 外掛連 Anki，Android 連 AnkiDroid，iOS 連 AnkiMobile；還可以不裝 Anki，直接同步到 Anki 同步伺服器（見[怎麼連線 Anki](/faq/anki.zh-HK)）。
- 查詞彈窗裡點加號就做成一張卡，帶原句、截圖 / 影片片段、原聲和單詞發音；內建的 Lapis 模板可以一鍵建好。
- 查詞時能認出 Anki 裡已經有的詞，避免重複做卡。
- 複習、排程、FSRS 都在 Anki 裡完成；Fushi 的新手引導會提醒你在 Anki 裡開啟 FSRS。

所以「Fushi 還是 Anki」不是二選一：Fushi 負責輸入和制卡，Anki 負責複習。

## 什麼時候 Fushi 不是最合適的

實話說，有些場景別的工具更順手：

- **只在瀏覽器裡讀網頁文章**：Yomitan 就夠了，不需要裝一個完整的應用。
- **主要看 Netflix、只用桌面瀏覽器**：你已經習慣的 asbplayer / Language Reactor 照樣好用；Fushi 的瀏覽器擴充套件可以試試，但不是必須。
- **想要內建複習、不想碰 Anki**：Fushi 沒有自己的複習系統，這種需求更適合自帶 SRS 的工具。

反過來，如果你的內容大多是本地番劇、輕小說、漫畫、Galgame，或者想在手機上做到和電腦一樣的查詞制卡，Fushi 就是為這個設計的。從[下載頁](/zh-hk/download)裝好後，跟著[新手引導](/faq/onboarding.zh-HK)幾分鐘就能做出第一張卡。
