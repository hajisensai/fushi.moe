---
title: "Fushi 和 asbplayer、Language Reactor、Migaku、Yomitan、Anki 有什么区别？能一起用吗？"
description: "Yomitan 是浏览器查词扩展，asbplayer 和 Language Reactor 主要在浏览器里给视频加字幕查词，Migaku 是付费订阅的一体化工具，Anki 负责间隔重复复习。Fushi 是一个免费开源的独立应用，把看番、读轻小说、漫画 OCR、Galgame 查词和 Anki 制卡放在一起，并且可以和这些工具同时使用。"
category: "关于 Fushi"
order: 25
date: 2026-10-18
---

用沉浸法学语言（见[什么是沉浸学习](/zh-cn/immersion)）的人，工具箱里往往已经有好几样东西：浏览器里装了 Yomitan，看 Netflix 用 Language Reactor 或 asbplayer，卡片进 Anki。Fushi 不是要你把这些全换掉，而是补上它们没覆盖到的地方。这一篇按工具逐个说清楚区别，以及怎么搭配。

先说一句定位：**Fushi 是一个独立安装的应用**（Windows、macOS、Android、iOS，Linux 可自行构建，见[支持哪些平台](/faq/platforms)），不是浏览器扩展。它把本地视频播放器、EPUB 阅读器、漫画阅读器、有声书、Galgame 文本 Hook 和词典查词放在同一个程序里，查到的词一键做成 Anki 卡。它以 GPLv3 开源、完全免费（见[Fushi 是免费的吗](/faq/free)）。

下面对其他工具的描述基于它们公开的资料，功能和价格会变，以各自官网为准。

## 一张表看区别

| | 形态 | 主要场景 | 费用 | 复习（SRS） |
|---|---|---|---|---|
| **Fushi** | 独立应用（桌面 + 手机），另带浏览器扩展 | 本地番剧 / 视频、轻小说 EPUB、漫画、有声书、Galgame、网页 | 免费、开源 | 交给 Anki |
| **Yomitan** | 浏览器扩展 | 网页上悬停查词 | 免费、开源 | 交给 Anki |
| **asbplayer** | 浏览器扩展 + 网页播放器 | 流媒体网站和本地视频的字幕、句子挖掘 | 免费、开源 | 交给 Anki |
| **Language Reactor** | 浏览器扩展 | Netflix、YouTube 的双语字幕与查词 | 有免费版和付费 Pro | 以官网为准 |
| **Migaku** | 浏览器扩展 + 应用 | 网页 / 视频查词、制卡、词汇追踪 | 付费订阅 | 自带 |
| **Anki** | 独立应用 | 间隔重复复习 | 桌面版与 AnkiDroid 免费，AnkiMobile 付费 | 它本身就是 |

## Fushi 和 Yomitan

[Yomitan](https://yomitan.wiki/)（Yomichan 的继任者）是浏览器里的弹出式词典：按住 Shift 把鼠标移到网页上的词，就弹出释义，能把词做成 Anki 卡。它是网页查词的事实标准，词典格式也成了社区通用格式。

和 Fushi 的关系：

- **词典通用**：Fushi 直接导入 Yomitan 词典 zip（也认 MDict 的 `.mdx` / `.mdd`、`.dsl`、StarDict），去屈折变形用的也是 Yomitan 的变形表。你给 Yomitan 攒的词典可以原样拿来用，见[怎么导入词典](/faq/dictionaries)。
- **发音库通用**：Yomitan「本地音频服务器」那份数据库，Fushi 的「本地音频数据库」可以直接指向它的 `entries.db`。
- **场景不同**：Yomitan 在浏览器里；Fushi 在应用里点词即查，覆盖的是浏览器之外的东西——本地视频字幕、EPUB、漫画图片里的字、Galgame 的台词，手机上也能用。
- **能一起用**：Fushi 自带一个浏览器扩展，同样是 Shift 查词，用的是 Fushi 里的词典。两个扩展都装的话会各弹各的，建议网页查词只留一个（见[浏览器里怎么查词](/faq/browser-lookup)）。Fushi 还能开一个兼容 yomitan-api 协议的「Fushi API 服务器」，让原本对接 Yomitan 的工具改查 Fushi 的词典。

## Fushi 和 asbplayer、Language Reactor

[asbplayer](https://github.com/asbplayer/asbplayer) 是一个开源的浏览器扩展加网页播放器，能在流媒体网站和本地视频上显示可选中的字幕，配合 Yomitan 查词，并把当前这句（带截图和音频）做成 Anki 卡。Fushi 浏览器扩展的流媒体字幕部分参考过它。

[Language Reactor](https://www.languagereactor.com/) 是面向 Netflix 和 YouTube 的浏览器扩展，以双语字幕、弹出词典、自动暂停这些功能出名，有免费版，也有提供更多功能的付费 Pro。

它们和 Fushi 最大的区别是**在哪儿看**：

- 它们主要在桌面浏览器里，围绕流媒体网站工作；
- Fushi 的视频播放器是一个本地播放器（基于 mpv），播你硬盘、NAS、Jellyfin / Emby / Plex 媒体服务器（见[媒体服务器](/faq/media-servers)）或已配对电脑上的番剧，手机上也能看。字幕点词即查，支持[双语 / 副字幕](/faq/secondary-subtitle)、字幕列表、跳句重播、字幕对轴，制卡时自动带这句的画面截图或片段和原声音频。
- 对网页视频，Fushi 的浏览器扩展也能在 Netflix、YouTube 等网站上叠一层可查词的 Fushi 字幕，并把字幕抓进侧边栏。

**能一起用吗？** 能。常见的分工是：网页流媒体继续用你习惯的 asbplayer 或 Language Reactor，下载到本地的番剧、手机上看番交给 Fushi。注意同一个网页上同时开两套字幕覆盖层和两个 Shift 查词扩展，界面会互相打架，网页上选一个用就好。

## Fushi 和 Migaku

[Migaku](https://migaku.com/) 是一个商业的一体化学习工具，按订阅收费：浏览器扩展负责网页和视频上的查词、制卡，还带自己的闪卡复习系统，会记录你认识哪些词、估计一段内容你能看懂多少。

和 Fushi 的区别：

- **费用与开源**：Migaku 是付费订阅的商业产品；Fushi 免费、源码公开，没有内购。
- **复习放在哪**：Migaku 有自己的复习系统；Fushi 不做复习，卡片全部进 Anki，用你自己的牌组、模板和 FSRS。
- **内容范围**：Fushi 侧重本地内容——本地番剧、EPUB 轻小说、漫画 OCR、有声书、Windows 上的 Galgame 文本 Hook。
- **数据**：Fushi 不要求注册，数据默认只在你的设备上（见[我的数据存在哪里](/faq/data)）。

如果你已经在 Migaku 里攒了一套复习，没有必要为了 Fushi 搬走；两者的卡片体系是分开的，Fushi 做的卡只进 Anki。

## Fushi 和 Anki 本身

Anki 是间隔重复复习软件，Fushi 不替代它，而是给它供卡：

- 桌面端通过 AnkiConnect 插件连 Anki，Android 连 AnkiDroid，iOS 连 AnkiMobile；还可以不装 Anki，直接同步到 Anki 同步服务器（见[怎么连接 Anki](/faq/anki)）。
- 查词弹窗里点加号就做成一张卡，带原句、截图 / 视频片段、原声和单词发音；内置的 Lapis 模板可以一键建好。
- 查词时能认出 Anki 里已经有的词，避免重复做卡。
- 复习、排程、FSRS 都在 Anki 里完成；Fushi 的新手引导会提醒你在 Anki 里打开 FSRS。

所以「Fushi 还是 Anki」不是二选一：Fushi 负责输入和制卡，Anki 负责复习。

## 什么时候 Fushi 不是最合适的

实话说，有些场景别的工具更顺手：

- **只在浏览器里读网页文章**：Yomitan 就够了，不需要装一个完整的应用。
- **主要看 Netflix、只用桌面浏览器**：你已经习惯的 asbplayer / Language Reactor 照样好用；Fushi 的浏览器扩展可以试试，但不是必须。
- **想要内置复习、不想碰 Anki**：Fushi 没有自己的复习系统，这种需求更适合自带 SRS 的工具。

反过来，如果你的内容大多是本地番剧、轻小说、漫画、Galgame，或者想在手机上做到和电脑一样的查词制卡，Fushi 就是为这个设计的。从[下载页](/zh-cn/download)装好后，跟着[新手引导](/faq/onboarding)几分钟就能做出第一张卡。
