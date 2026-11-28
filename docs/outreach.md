# Fushi 外链投放清单与投稿文案

> 调研日期：2026-10-12。本文件只做调研和起草：没有发帖、注册账号、开 PR，也没有提交任何表单。
> 每个目标都核对过真实 URL。awesome 列表另外通过 GitHub API 查了最近一次合并的 PR 和贡献规则。查不到的项一律写「未核实 / 不确定」。

## 0. 投放前必读（三条硬约束）

1. **文案必须由作者本人改写后再发。** V2EX 站规禁止发布 AI 生成内容，站长公开说过发 AI 内容是最快的封号方式。r/languagelearning 的 moderation policy 原文是："If you have had an AI generate a full text from only a single prompt, we kindly ask that you delete it… People can tell even if you remove the em-dashes."。本文第 5 节的文案只能当提纲和事实清单用，不能直接粘贴。
2. **AI 相关要如实披露，但不要拿 AI 当卖点。** r/LearnJapanese 规则 4 写着 "Do not recommend AI as a learning tool"。awesome-japanese 规定：产品里用了生成式 AI，或者产品 >50% 由 AI 写成，都必须标 `:robot:`，新条目还要先进 AI 区观察 3–6 个月。Fushi 代码里有可选的 AI 助手（`fushi/lib/src/ai/`）。按该列表的口径要不要标 `:robot:`，由作者自己判断，并如实填写 PR 模板里的 AI Assistance 问卷。
3. **自荐要表明身份。** 所有渠道都写明「我是开发者」。awesome-japanese 要勾 "I'm affiliated with this item"，知乎回答要写「利益相关：作者」。

### Fushi 的资格事实（据此判断门槛）

| 事实 | 值 | 来源 |
|---|---|---|
| 仓库创建 | 2026-04-14 | GitHub API |
| 首个公开发布 | v0.1.0，2026-04-23 | GitHub Releases |
| Star 数 | 419（2026-10-12） | GitHub API |
| 最新正式版 | v2.9.1（2026-10-03） | GitHub Releases |
| Android APK 体积 | 每个 ABI 164–180 MB | v2.9.1 assets |
| Android 非自由依赖 | `com.google.android.gms:play-services-mlkit-text-recognition*`、`google_sign_in` | `fushi/android/app/build.gradle:331-334`，`fushi/pubspec.yaml:89` |

---

## 1. 总表

| 目标 | URL | 类型 | 规则要点 | 预期价值 | 状态 |
|---|---|---|---|---|---|
| awesome-japanese | https://github.com/yudataguy/awesome-japanese | awesome 列表 | 先开 issue，拿到 `approved` 标签后再开 PR（PR 里写 `Closes #N`，否则机器人自动关闭）。自荐的条目要满 6 个月（Fushi 从 **2026-10-23** 起才满足），并附证明。描述少于 100 字符，不写 "free"。如适用要标 `:robot:` | 高 | 待提交（10-23 后） |
| TheMoeWay Resources | https://learnjapanese.moe/resources/（源仓库 https://github.com/shoui520/shoui520.github.io） | 沉浸资源站 | 直接对 `docs/resources.md` 开 PR。2026-06～10 合过多个「Add X to resources」PR，包括第三方工具 Anki Miner 和 Yomine | 高 | 待提交 |
| r/LearnJapanese 每周自推帖 | https://www.reddit.com/r/LearnJapanese/ | Reddit | 规则 10：推广产品或服务有限制，详见扩展规则（NO KANA APPS）。每周三有置顶的 "Self Advertisement Weekly Thread: Material Recs and Self-Promo Wednesdays!"。subreddit karma 低的账号不能发主帖 | 高 | 待提交 |
| AlternativeTo | https://alternativeto.net/（Fushi 尚无条目：/software/fushi/ 返回 404） | 软件目录 | 先建 Fushi 条目，再挂到已有条目的 Alternatives 下：asbplayer（4 个替代）、Language Reactor（24 个）、Yomitan（13 个）、Memento Video Player。**Migaku 在 AlternativeTo 上不存在**（/software/migaku/ 返回 404） | 高 | 待提交 |
| V2EX 分享创造 | https://www.v2ex.com/go/create | 中文社区 | 节点说明是「爱意满满的作品展示区」，有 3.7 万多个主题，常见标题前缀是「[开源自荐]」。禁 AI 生成内容。厂商推广应发到 /go/promotions，个人开源作品发分享创造 | 高 | 待提交 |
| HelloGitHub 月刊 | https://github.com/521xueweihan/HelloGitHub/issues | 中文开源月刊 | 以 issue 自荐，标题前缀「[开源自荐]」。2026-10-12 当天仍有新自荐 | 高 | 待提交 |
| 阮一峰《科技爱好者周刊》 | https://github.com/ruanyf/weekly/issues | 中文周刊 | README 写明「欢迎投稿文章/软件/资源，请提交 issue」，常见前缀「【开源自荐】」 | 中 | 待提交 |
| awesome-open-source-flutter-apps（Flutter Gems） | https://github.com/fluttergems/awesome-open-source-flutter-apps | awesome 列表 | 先开 issue，维护者分配后再 PR。项目须 3 年内有更新。最近一次合并是 2026-10-10 | 中 | 待提交 |
| Open App Scout（tortuvshin/open-source-flutter-apps） | https://github.com/tortuvshin/open-source-flutter-apps | awesome 列表 / 目录站 | 每个 app 一个文件 `content/records/<slug>.md`，可以在站点 `/submit` 生成 PR。要求是可用的应用、开源许可证可核实。最近一次合并是 2026-10-11 | 中 | 待提交 |
| awesome-flutter（Solido） | https://github.com/Solido/awesome-flutter | awesome 列表 | 至少 35 star。只能改 `source.md`，不能改 README。格式为 `[name](link) - Desc by [Author](link)`，描述里不写 "Flutter"。最近一次合并是 2026-09-03 | 中 | 待提交 |
| awesome-jellyfin（Clients） | https://github.com/awesome-jellyfin/awesome-jellyfin | awesome 列表 | 只能改 `assets/clients/clients.yaml`（CLIENTS.md 是生成的）。Conventional Commits，按字母序（有机器人检查），描述不能写成推广口吻。项目至少 4 周、持续维护。最近一次合并是 2026-10-02 | 中 | 待提交 |
| Vuizur/awesome-language-learning | https://github.com/Vuizur/awesome-language-learning | awesome 列表 | 直接发 PR 或开 issue。最近一次合并是 2025-10-06（刚好在一年内） | 中 | 待提交 |
| awesome-anki | https://github.com/tianshanghong/awesome-anki | awesome 列表 | 「Feel free to suggest new projects in Issues or PR directly」。最近一次合并是 2026-01-02，合并比较慢 | 中 | 待提交 |
| Obtainium 应用配置站 | https://github.com/ImranR98/apps.obtainium.imranr.dev | Android 分发目录 | 至少 35 star、项目至少 4 个月，只收官方来源，Fushi 都满足。可以开 app request issue，也可以直接 PR 配置 | 中 | 待提交 |
| Product Hunt | https://www.producthunt.com/ | 发布平台 | 必须用个人账号（不能用公司号），新账号要先完成 onboarding。描述最多 260 字符，图库至少 2 张图（推荐 1270×760），缩略图 240×240。可以自己当 hunter。不要拉票 | 中 | 待提交 |
| 少数派 Matrix「开发者说」 | https://sspai.com/matrix | 中文媒体 | 欢迎独立开发者以作者身份撰文自荐。禁止冒充第三方或用户评测自己的产品，禁止发通稿。Matrix 是邀请制，没资格的要申请并在理由里说明要自荐产品（约 3 个工作日答复） | 中 | 待提交 |
| 知乎 | https://www.zhihu.com/ | 中文问答 | 在已有的「看番学日语工具」类问题下用作者身份回答，写明「利益相关」；或者写专栏长文。不要批量发营销回答（具体规范未逐条核实） | 中 | 待提交 |
| r/Anki | https://www.reddit.com/r/Anki/ | Reddit | 版规（2026-07 存档）：Keep posts on-topic / Do not spam / No research for other products/services / No low-effort AI content | 中 | 待提交 |
| r/languagelearning | https://www.reddit.com/r/languagelearning/ | Reddit | 自有内容少于每月 1 次。征求产品反馈或调查只能发在「Share your resources」置顶帖。只针对单一语言的资源应发到该语言的子版。不收低质 AI 套壳 app，非核心的 AI 功能允许。另有 wiki「rules_for_promotion」 | 低–中 | 待提交 |
| TheMoeWay Discord | https://discord.gg/nhqjydaR8j（来自 https://learnjapanese.moe/join/） | Discord | 官网要求先读站内内容再进群。频道规则需要进群后查看（未核实） | 中 | 待提交 |
| naghim/Awesome-Japanese-Study-Materials | https://github.com/naghim/Awesome-Japanese-Study-Materials | awesome 列表 | 45 star，2026-09-30 有合并，Apps 分区可放。没有 CONTRIBUTING | 低 | 待提交 |
| F-Droid | https://f-droid.org/docs/Inclusion_Policy/ | Android 商店 | 必须完全从源码构建，禁止 Google Play Services / Firebase 等专有库，或者要提供一个不含它们的 flavor。**Fushi 目前不满足** | 低（现状不可行） | 不提交 |
| IzzyOnDroid | https://izzyondroid.org/docs/general/AppInclusionPolicy/ | Android 仓库 | 每个 app 大约 30 MB 的空间上限（单个 APK 也是这个上限）。不能有专有组件（只容忍核心功能必需的），不能有追踪器。**Fushi 单个 ABI 的 APK 有 164–180 MB，不满足** | 低（现状不可行） | 不提交 |
| Flathub | https://flathub.org/ | Linux 商店 | 仅面向 Linux。CI 已出 Linux Flatpak（自建仓库 hajisensai.github.io/Fushi，下载页有 Linux 行）；上 Flathub 要另走其审核与构建规范，尚未决定 | 待定 | 暂不提交 |
| djt.js.org | https://djt.js.org/ | 沉浸资源站 | 当前返回 JS.ORG 占位页（标题 "302 djt - JS.ORG"），没有收录入口。对应的 djtguide/djtguide.github.io 最近一次提交是 2024-11，没有 PR 历史 | 不适用 | 不提交 |

已排除的停更列表：nakopylov/awesome-immersion（最后推送 2023-12）、EngJpDiscordExchange/Awesome-Japanese（最后推送 2024-04，最近一次合并 2022）、HUYDGD/awesome-japanese（2023-04 起停更）、nachologic/awesome-language-learning（最后推送 2024-06）。这些仓库发 PR 大概率没人看。

---

## 2. GitHub awesome 列表（逐条细则 + 现成条目）

### 2.1 yudataguy/awesome-japanese（2372 star，高价值）

- 地址：https://github.com/yudataguy/awesome-japanese 。贡献指南见 `contributing.md`。
- 活跃度：最近一次合并在 2026-10-01（Added Yomimaru）。
- 流程：先用 "Suggest a resource" 表单开 issue，等 `approved` 标签，再开 PR 并在描述里写 `Closes #<issue>`。少了任何一步，机器人都会自动关闭 PR。
- 自荐门槛：首次公开满 6 个月（Fushi 从 2026-10-23 起满足），证明材料可以用 v0.1.0 Release 页的日期。付费产品才要求 100 个用户，Fushi 免费，不适用。PR 里要勾 "I'm affiliated with this item"。
- 格式：`- [Name](https://…) - Description ending with a period.`。描述要少于 100 个可见字符，不写 "free"，平台 emoji 放在句号前。
- 应放章节：`## Video` → `- Players`，和 Memento、asbplayer、miteiru 同组。如果按规则要标 `:robot:`，条目要先进 `## AI` → `- Video` 观察 3–6 个月。
- 条目（英文，描述 89 字符）：

```markdown
  - [Fushi](https://github.com/hajisensai/Fushi) - Cross-platform app for subtitle lookup, EPUB, manga OCR, VN text hooking and Anki mining :computer: :iphone:.
```

- 如需标 AI（放在 AI 区的 Video 组下）：

```markdown
  - [Fushi](https://github.com/hajisensai/Fushi) - Cross-platform app for subtitle lookup, EPUB, manga OCR, VN text hooking and Anki mining :computer: :iphone: :robot:.
```

### 2.2 TheMoeWay Resources（384 star 的站点源仓库，高价值）

- 页面：https://learnjapanese.moe/resources/ ，源文件在 https://github.com/shoui520/shoui520.github.io/blob/main/docs/resources.md 。站点导航栏有 "Open a pull request" 入口。
- 活跃度：最近一次合并在 2026-10-03。2026-06-27 合并过第三方的 "add Anki Miner to Resources"，PR 正文只有一句「adds Anki Miner under Resources->Immersion Environment & Mining->Video Content」，门槛低。
- 应放章节：`## Immersion Environment & Mining` → `### Video Content`。也可以只放一处，然后在 `### Visual Novels` 里补一行说明 Hook 功能，但别同时塞好几个分区，那样像刷屏。
- 格式：`- [Name](URL) - description`（这个列表不强制句号和大小写；带 `※` 的加粗条目是站长推荐，不要自己加）。
- 条目：

```markdown
- [Fushi](https://github.com/hajisensai/Fushi) - Free, open-source (GPLv3) app for Windows/macOS/Android/iOS: subtitle lookup while watching anime, EPUB reader, manga OCR, audiobook sync, Windows VN text hook, and one-tap Anki cards with sentence, screenshot and audio.
```

### 2.3 Vuizur/awesome-language-learning（223 star）

- 地址：https://github.com/Vuizur/awesome-language-learning 。最近一次合并在 2025-10-06。Contributing 写的是「send a pull request or open an issue」。
- 应放章节：`### Video Players (or extensions)`，和 mpvacious、voracious 同组。
- 条目：

```markdown
* [Fushi](https://github.com/hajisensai/Fushi) - A cross-platform app (Windows, macOS, Android, iOS) that combines subtitle word lookup for videos, an EPUB reader, manga OCR, audiobook sync and one-tap Anki card creation.
```

### 2.4 tianshanghong/awesome-anki（2106 star）

- 地址：https://github.com/tianshanghong/awesome-anki 。README 写明可以开 issue 或直接 PR。最近一次合并在 2026-01-02，审得慢。
- 应放章节：`## Tools`。现有子类只有 Browser extensions / Command-line tools / iOS helper apps / Telegram bots / Programming libraries，没有合适的，建议在 PR 里提议新增 `### Sentence mining apps` 子类，或者先发 issue 问维护者。
- 条目（按该列表 `owner/repo + stars 徽章` 的格式）：

```markdown
* [hajisensai/Fushi ![GitHub stars](https://img.shields.io/github/stars/hajisensai/Fushi.svg)](https://github.com/hajisensai/Fushi) - Immersion app that creates Anki cards with the original sentence, a screenshot and the source audio from videos, EPUBs, manga (OCR), audiobooks and Windows visual novels.
```

### 2.5 fluttergems/awesome-open-source-flutter-apps（3159 star）

- 地址：https://github.com/fluttergems/awesome-open-source-flutter-apps 。流程：先开 issue，被分配后在 fork 里改 README 再提 PR。最近一次合并在 2026-10-10。
- 应放章节：`### Education`（按字母序放在 `fujiten` 之后）。
- 条目：

```markdown
| Fushi | [Link](https://github.com/hajisensai/Fushi) | Immersion language-learning app: subtitle lookup, EPUB reader, manga OCR, audiobook sync and Anki mining. |
```

### 2.6 Open App Scout / tortuvshin/open-source-flutter-apps（4362 star）

- 地址：https://github.com/tortuvshin/open-source-flutter-apps 。流程：在站点 `/submit` 粘贴仓库 URL，回答问题后生成 PR；也可以手写一个记录文件。最近一次合并在 2026-10-11。
- 分类取值（来自 `data/taxonomy/`）：category `education`，stack `flutter`，platforms `android / ios / macos / windows`。
- 记录文件 `content/records/fushi.md`：

```markdown
---
name: Fushi
repoUrl: https://github.com/hajisensai/Fushi
category: education
stack: flutter
description: Immersion language-learning suite with subtitle lookup, EPUB reader, manga OCR and one-tap Anki mining.
platforms:
  - android
  - ios
  - macos
  - windows
tags:
  - language-learning
  - anki
addedAt: 2026-10-XX
submittedBy: <你的 GitHub 用户名>
---

## Why it's listed

A large real-world Flutter app (GPLv3) shipping on four platforms: video subtitle lookup, an EPUB reader, manga OCR, audiobook sync, a Windows-only visual-novel text hook, and Anki card creation with sentence, screenshot and audio.
```

### 2.7 Solido/awesome-flutter（6.1 万 star）

- 地址：https://github.com/Solido/awesome-flutter 。规则：至少 35 star（满足）；只改 `source.md`；每条建议单独一个 PR，加在分类末尾；描述里不出现 "Flutter"，用 AP 标题式大小写。最近一次合并在 2026-09-03。
- 应放章节：`## Open Source Apps` → `### Top`（末尾）。
- 条目：

```markdown
- [Fushi](https://github.com/hajisensai/Fushi) <!--stargazers:hajisensai/Fushi--> - Immersion language-learning suite with subtitle lookup, EPUB reader, manga OCR and one-tap Anki mining by [hajisensai](https://github.com/hajisensai)
```

### 2.8 awesome-jellyfin（9565 star，Clients）

- 地址：https://github.com/awesome-jellyfin/awesome-jellyfin 。只改 `assets/clients/clients.yaml`，CLIENTS.md 会自动生成。commit 用 Conventional Commits（例如 `feat(clients): add fushi`）。最近一次合并在 2026-10-02。
- 适配性：Fushi 能浏览 Jellyfin / Emby / Plex 服务器并播放视频，但它的定位是学习工具，不是通用客户端。描述要写清这一点，免得被当成蹭分类。
- 条目（targets 只写官方出包平台）：

```yaml
  - name: "Fushi"
    targets: [Windows, macOS, Android, iOS]
    oss: https://github.com/hajisensai/Fushi
    official: false
    beta: false
    price:
      free: true
    downloads:
      - type: github
        owner: hajisensai
        repo: Fushi
```

### 2.9 naghim/Awesome-Japanese-Study-Materials（45 star，低价值）

- 地址：https://github.com/naghim/Awesome-Japanese-Study-Materials 。最近一次合并在 2026-09-30。应放章节：`### Apps 📱` → `#### Other apps:`。
- 条目：`- [Fushi](https://github.com/hajisensai/Fushi) - Watch anime, read EPUBs and manga, and mine Anki cards with sentence, screenshot and audio.`

---

## 3. 软件目录 / 分发渠道

### 3.1 AlternativeTo（高）

- Fushi 还没有条目（https://alternativeto.net/software/fushi/about/ 返回 404），要先注册账号，再用 "Add new app" 新建条目。
- 已确认存在、可以挂「Fushi 是它的替代品」的条目：
  - asbplayer：https://alternativeto.net/software/asbplayer/about/ （分类 Video & Movies，标签 anki-flashcards / Subtitles，有 4 个替代）
  - Language Reactor：https://alternativeto.net/software/language-learning-with-netflix/about/ （slug 是旧名 language-learning-with-netflix，分类 Education & Reference / Video & Movies，有 24 个替代）
  - Yomitan：https://alternativeto.net/software/yomitan/about/ （分类 Web Browsers / Education & Reference，有 13 个替代）
  - Memento Video Player：https://alternativeto.net/software/memento-by-ripose-jp/about （有 9 个替代，排第一的是 LLPlayer）
  - Yomichan（已标停更）：https://alternativeto.net/software/yomichan
  - **Migaku：不存在**（/software/migaku/ 返回 404，搜索也没找到），只能在 Fushi 条目的描述里提一句，或者由别人新建 Migaku 条目。
- 条目要点：License 填 Open Source (GPL-3.0)，Pricing 填 Free；平台填 Windows / Mac / Android / iPhone；分类 Education & Reference，次分类 Video & Movies。标签可用 anki-flashcards、subtitles、language-learning、japanese、epub-reader、ocr。只挂真正同类的条目（上面 4 个），别四处乱挂。

### 3.2 Product Hunt（中）

- 规则（官方帮助页 How to post a product）：用个人账号，新账号先完成 onboarding；可以自己当 hunter。要准备 URL、名字、tagline、几个 topics、240×240 缩略图（GIF 小于 3 MB）、价格标签（Free）、至少 2 张图库图（推荐 1270×760）、最多 260 字符的描述。可选项有 YouTube 演示视频和 first comment。
- 注意：拉票、互刷会被识别并处罚（第三方指南的说法，官方帮助页没有写到这条，按常识遵守）。PH 用户大多是泛科技人群，不是日语学习者，所以排名不是重点，主要价值是一条外链和一个可展示的页面。
- 建议 topics：Education、Language Learning、Open Source、Android、Mac。

### 3.3 F-Droid（现状不可行）

- 政策：https://f-droid.org/docs/Inclusion_Policy/ 。要求 FLOSS，审核者从源码构建，工具链也要是 FLOSS。专有的追踪、广告、分析库（例如 Google Play Services、Firebase）禁止，或者上游要提供去掉它们的 flavor。Flutter SDK 可以用官方预编译。应用不能在用户没有主动同意的情况下下载可执行代码。
- Fushi 现状：Android 端直接依赖 `play-services-mlkit-text-recognition`（含日文、中文、韩文模型）和 `google_sign_in`；原生部分还有 libtorrent、ffmpeg、mpv、onnxruntime 这类重型依赖，F-Droid 都要求从源码构建。**结论：现在不满足**。要上架得先做一个不含 GMS 的 FOSS flavor，并逐个解决原生依赖从源码构建的问题，工作量大，是否值得要由所有者决定。另外，扩展、插件下载功能要确认有「用户主动同意」的步骤（目前扩展仓库默认为空、由用户自己添加，大概率满足，未核实）。

### 3.4 IzzyOnDroid（现状不可行）

- 政策：https://izzyondroid.org/docs/general/AppInclusionPolicy/ 。每个 app 大约 30 MB 的空间（单个 APK 也是这个上限），有少量例外；超限的常见解决办法是按 ABI 拆包。不能有专有组件（只容忍核心功能必需的），不能有追踪器。
- Fushi 现状：已经按 ABI 拆包，但 arm64 包仍有 180 MB，是上限的 6 倍。**结论：现在不满足，例外能不能批也不确定**。

### 3.5 Obtainium 配置站（中，可行）

- https://github.com/ImranR98/apps.obtainium.imranr.dev （最近一次合并在 2026-10-10）。APP_CRITERIA 要求：只收官方来源；GitHub 仓库至少 35 star（Fushi 有 419）；项目至少 4 个月（Fushi 创建于 2026-04-14）；12 个月内有更新。**都满足**。
- 做法：开 app request issue，附上 GitHub Releases 链接；或者直接 PR 一份配置（只收正式版，不勾 "Include prereleases"，arm64-v8a APK 优先）。仓库还提供 "Get it on Obtainium" 徽章（BADGING.md），可以放到 fushi.moe 的下载页。

### 3.6 Flathub（待定）

- Flathub 只面向 Linux。Fushi 的 CI 现在会构建 Linux Flatpak（x86_64），发布到自建 Flatpak 仓库（hajisensai.github.io/Fushi）并挂在下载页；要不要再上 Flathub（需按 Flathub 的规范从源码构建、过审核）尚未决定。

---

## 4. 社区规则逐条

> Reddit 直连和 API 都拒绝了自动访问。下面的规则来自 Internet Archive 的快照：r/LearnJapanese 是 2026-08-15 的 old.reddit 侧栏，r/languagelearning 是 2026-08-15 的侧栏和 2026-08-02 的 moderation_policy，r/Anki 是 2026-07-17 的侧栏。**发帖前请再打开一次版规确认。**

### 4.1 r/LearnJapanese（高）

- 规则 10："If you want to advertise a product or service (NO KANA APPS), certain restrictions apply. See the extended rules"。扩展规则在 https://www.reddit.com/r/LearnJapanese/wiki/subredditrules （存档没抓到，需要人工阅读）。
- 固定帖：每天有 "Daily Thread: for simple questions, minor posts & newcomers"；每周三有 **"Self Advertisement Weekly Thread: Material Recs and Self-Promo Wednesdays!"**，这是开发者自推的正确位置。
- subreddit karma 低的账号只能评论，不能发主帖。
- 规则 4："Do not recommend AI as a learning tool"，所以文案里完全不提 AI 功能。
- 规则 5：不能链接或索要盗版资源。帖子和截图里不要出现片源站，也不要演示「在线源扩展」。
- 做法：在周三帖里发一条评论，用第 5.3 节的短版英文改写，附 GitHub 链接和 1–2 张截图；平时在别人的「看番怎么查词 / 怎么制卡」帖下按需回复，并标明身份。

### 4.2 r/Anki（中）

- 版规（2026-07 侧栏）：Keep your posts on-topic. / Be polite and kind. / Do not spam. / Do not routinely remove answered questions / No research for other products/services / No low-effort AI content。
- 有每周的 "Weekly Small Questions Thread"。工具类主帖只要和 Anki 相关就算 on-topic；重点讲 Anki 集成本身（卡片里有原句、截图、原声，Android 走 AnkiDroid，桌面走 AnkiConnect），不要写成泛泛的产品介绍。
- 不要在帖子里做问卷或用户调研（"No research for other products/services"）。

### 4.3 r/languagelearning（低–中）

- 自有内容少于每月 1 次，而且要质量好。
- 征求产品反馈或调查只能发在 "Share your resources" 置顶帖。
- 只针对单一流行语言的内容应发到对应语言的子版。Fushi 主打日语用户，主帖更适合 r/LearnJapanese；在这里只强调「多语言、通用工具」，并且发在 Share your resources 置顶帖里。
- 禁止低质的 AI 套壳 app，非核心的 AI 功能允许，但要合理披露。全文由 AI 生成的帖子会被要求删除。
- 推广细则：https://www.reddit.com/r/languagelearning/wiki/rules_for_promotion/ （未抓到全文，需人工阅读）。

### 4.4 V2EX（高）

- 节点：**分享创造** https://www.v2ex.com/go/create 。标题可以用「[开源自荐]」前缀，和节点里的现有习惯一致。厂商推广节点 /go/promotions 不适合个人开源项目。
- 关于页的要求：分享自己正在做的事；尊重原创；**禁止 AI 生成内容**。
- 做法：作者用自己的话写正文；在回复里坦率回应和 asbplayer、Yomitan、Memento 的比较；不要开小号顶帖。

### 4.5 知乎 / 少数派

- 知乎：在已有问题下回答（例如「看动漫学日语有什么好用的工具」「有什么好用的日语查词制卡软件」），开头写「利益相关：本人是 Fushi 开发者」。也可以发专栏长文，讲沉浸学习的工作流，再自然引出工具。不要在多个问题下复制粘贴同一篇回答。（知乎社区规范没有逐条核实，按反营销导流的常识执行。）
- 少数派 Matrix：走「开发者说」栏目，以开发者身份写设计思路和使用流程，不能冒充用户评测，也不能发通稿；文中不放二维码或生硬的推广文案。Matrix 是邀请制，要先申请，理由里写明「自荐自己的开源产品」。

### 4.6 日语沉浸资源站 / Discord

- **TheMoeWay**（learnjapanese.moe）：接受 PR，见第 2.2 节。Discord 邀请链接 https://discord.gg/nhqjydaR8j ，来自站内 /join/ 页，页面要求先读站内内容再进群提问。群内有没有自推频道、规则是什么，要进群后查看（未核实）。建议先合入 Resources，再在群里有人问相关问题时回答，不要进群就发广告。
- **djt.js.org**：当前是 JS.ORG 占位页，没有收录入口。DJT 指南镜像 https://djtguide.github.io/learn/guide.html 的仓库最近一次提交是 2024-11，没有 PR 历史。**结论：不投**。
- 其他 Discord（Refold、各类 Yomitan 群等）：没有找到公开、可核实的邀请链接和收录规则，本清单不列。

### 4.7 中文 GitHub 月刊 / 周刊

- HelloGitHub：https://github.com/521xueweihan/HelloGitHub/issues ，issue 标题用「[开源自荐] Fushi：……」，正文写项目地址、一句话简介、亮点、截图。
- 阮一峰周刊：https://github.com/ruanyf/weekly/issues ，标题用「【开源自荐】Fushi——……」，正文写一段话、链接、一张图。

---

## 5. 投稿文案（只当提纲用，作者必须改写成自己的话）

> 功能事实只用以下这些：免费、开源（GPLv3）；看番或视频时点字幕里的词查词；EPUB 轻小说阅读；漫画 OCR；有声书同步；Windows 上 Galgame 文本 Hook 查词；一键制作带原句、截图、原声的 Anki 卡片；支持 Windows / macOS（Apple Silicon）/ Android / iOS；界面 17 种语言。**不写用户数、评分、下载量。**

### 5.1 中文长版（V2EX 分享创造 / 知乎专栏）

**标题**：[开源自荐] Fushi：看番、读轻小说、看漫画、推 Galgame 时点词查词，一键做带原句截图原声的 Anki 卡（GPLv3，Win/Mac/安卓/iOS）

正文：

我是 Fushi 的开发者。做这个的起因很简单：靠看番和读原作学日语时，我的工具链是浏览器扩展、mpv 脚本、电子书阅读器、漫画 OCR 工具、Textractor 各一套，而且每台设备都要单独配，Anki 卡片模板也得分别对齐。Fushi 想把这些合进一个 App 里。

它目前能做的：

- **视频**：看番或视频时点字幕里的词就能查，查到的词一键做成 Anki 卡，卡里自动带上原句、当时的截图和那一句的原声。
- **EPUB 轻小说**：阅读器里点词查词、制卡。
- **漫画**：OCR 识别气泡里的文字后点词查。
- **有声书**：音频和文本同步。
- **Galgame（仅 Windows）**：Hook 游戏文本后查词。
- 平台：Windows、macOS（Apple Silicon）、Android、iOS，界面有 17 种语言。
- 免费，开源，GPLv3。

和现有工具比，我自己的看法是：asbplayer、Yomitan、Memento、Language Reactor 都很好用，各自解决「浏览器里的视频」「网页文本」「桌面 mpv」这类单一场景；Migaku 覆盖面广，但要订阅。Fushi 的不同在于把视频、书、漫画、有声书、Galgame 放进同一个原生 App，并且手机上也能用，制卡流程和卡片格式在各种媒体之间保持一致。代价是它不是浏览器扩展，看流媒体网站时没有 asbplayer 那么顺手；Galgame Hook 也只支持 Windows。

项目还在快速迭代，问题和需求欢迎提 issue。如果你现在有一套用得顺手的组合，也很想听听 Fushi 哪里还不如它。

- 官网：https://fushi.moe
- 代码：https://github.com/hajisensai/Fushi

### 5.2 中文短版（HelloGitHub / 阮一峰周刊 issue / 知乎短回答）

> **Fushi**（https://github.com/hajisensai/Fushi）是一款免费开源（GPLv3）的沉浸式语言学习应用：看番时点字幕查词，读 EPUB 轻小说、看漫画（OCR）、听有声书（同步），在 Windows 上还能 Hook Galgame 文本查词；查到的词可以一键做成带原句、截图和原声的 Anki 卡片。支持 Windows / macOS（Apple Silicon）/ Android / iOS，界面 17 种语言。（利益相关：我是开发者）

### 5.3 英文长版（Reddit：r/Anki 主帖 / r/LearnJapanese 周三帖可删减）

**Title**: I built a free, open-source app that mines Anki cards (sentence + screenshot + audio) from anime, EPUBs, manga and VNs

Hi, I'm the developer of Fushi, so take this as a self-post.

My immersion setup used to be a browser extension for streaming, an mpv script for local files, a separate EPUB reader, a manga OCR tool and a text hooker for visual novels, and each one had to be configured again on every device. Fushi is my attempt to put that workflow into one app.

What it does today:

- **Video**: tap a word in the subtitles to look it up, then create an Anki card in one tap. The card includes the original sentence, a screenshot and the audio of that line.
- **EPUB light novels**: look up words and mine while reading.
- **Manga**: OCR the speech bubbles, then look up words.
- **Audiobooks**: audio synced with the text.
- **Visual novels (Windows only)**: text hook with in-game lookup.
- Windows, macOS (Apple Silicon), Android and iOS; the UI is available in 17 languages.
- Free and open source (GPLv3).

How it compares, honestly: asbplayer, Yomitan and Memento are excellent at what they do (browser video, web text, desktop mpv). Fushi isn't a browser extension, so for streaming sites asbplayer is still smoother. What Fushi adds is one native app across video, books, manga, audiobooks and VNs, including on phones, with the same mining flow and card format everywhere. The VN hook is Windows-only.

Feedback and bug reports are very welcome, especially from people with an existing setup they like.

- Site: https://fushi.moe
- Code: https://github.com/hajisensai/Fushi

### 5.4 英文短版（Product Hunt / 周三自推帖评论 / AlternativeTo 简介）

- **Product Hunt tagline**（60 字符以内）：`Mine Anki cards from anime, books, manga and visual novels`
- **Product Hunt description**（260 字符以内）：

> Free, open-source (GPLv3) immersion app. Tap subtitle words while watching anime, read EPUBs, OCR manga, sync audiobooks, hook Windows visual novels, and make Anki cards with the sentence, screenshot and audio in one tap. Windows, macOS, Android, iOS.

- **First comment（作者首评）**：

> Hi PH, I'm the developer. I was learning Japanese from anime and novels and got tired of juggling five tools across devices, so I built one app for the whole immersion-and-mining loop. It's free and GPLv3. I'd love to hear what's missing from your workflow.

- **r/LearnJapanese 周三帖评论**：

> (Dev here.) Fushi is a free, open-source app for Windows/macOS/Android/iOS: tap words in anime subtitles, EPUBs or OCR'd manga to look them up, and create Anki cards with the sentence, screenshot and audio in one tap. It also has a text hook for VNs on Windows. https://github.com/hajisensai/Fushi

---

## 6. 建议投放顺序

1. **现在就能做**：TheMoeWay PR、AlternativeTo 建条目并挂到 asbplayer / Language Reactor / Yomitan / Memento、Obtainium 配置、Flutter 系列三个列表、Vuizur、awesome-jellyfin。
2. **作者亲自写**：V2EX 分享创造、HelloGitHub、阮一峰周刊、知乎、少数派（申请 Matrix）。
3. **10-23 之后**：awesome-japanese（先开 issue）。
4. **需要账号积累**：r/LearnJapanese（karma 门槛，周三帖），r/Anki 主帖，r/languagelearning 的 Share your resources 置顶帖（每月最多 1 次）。
5. **Product Hunt**：等图库截图和演示视频准备好再发，选一个工作日。
6. **不做**：F-Droid / IzzyOnDroid（等有 FOSS flavor、包体缩小后再评估）、Flathub、djt.js.org。

## 7. 来源

- awesome-japanese 贡献指南：https://github.com/yudataguy/awesome-japanese/blob/main/contributing.md
- TheMoeWay 资源页源文件：https://github.com/shoui520/shoui520.github.io/blob/main/docs/resources.md ；加入页：https://learnjapanese.moe/join/
- awesome-jellyfin 贡献指南：https://github.com/awesome-jellyfin/awesome-jellyfin/blob/main/CONTRIBUTING.md
- Flutter Gems 贡献指南：https://github.com/fluttergems/awesome-open-source-flutter-apps/blob/main/CONTRIBUTING.md
- Open App Scout 贡献指南：https://github.com/tortuvshin/open-source-flutter-apps/blob/main/CONTRIBUTING.md
- awesome-flutter 贡献指南：https://github.com/Solido/awesome-flutter/blob/master/contributing.md
- Obtainium 收录标准：https://github.com/ImranR98/apps.obtainium.imranr.dev/blob/main/APP_CRITERIA.md
- F-Droid Inclusion Policy：https://f-droid.org/docs/Inclusion_Policy/
- IzzyOnDroid App Inclusion Policy：https://izzyondroid.org/docs/general/AppInclusionPolicy/
- Product Hunt 发帖帮助：https://help.producthunt.com/en/articles/479557-how-to-post-a-product
- V2EX 分享创造：https://www.v2ex.com/go/create ；推广节点：https://www.v2ex.com/go/promotions ；关于：https://www.v2ex.com/about
- 少数派 Matrix 社区规则：https://sspai.com/page/community-rules ；什么是 Matrix：https://sspai.com/post/65521
- AlternativeTo：asbplayer https://alternativeto.net/software/asbplayer/about/ ，Language Reactor https://alternativeto.net/software/language-learning-with-netflix/about/ ，Yomitan https://alternativeto.net/software/yomitan/about/ ，Memento https://alternativeto.net/software/memento-by-ripose-jp/about
- Reddit 版规存档：r/LearnJapanese http://web.archive.org/web/20260815001305/https://old.reddit.com/r/LearnJapanese/ ，r/languagelearning http://web.archive.org/web/20260815000907/https://old.reddit.com/r/languagelearning/ 与 http://web.archive.org/web/20260802105449/https://old.reddit.com/r/languagelearning/wiki/moderation_policy ，r/Anki http://web.archive.org/web/20260717122259/https://old.reddit.com/r/Anki/
- HelloGitHub：https://github.com/521xueweihan/HelloGitHub ；阮一峰周刊：https://github.com/ruanyf/weekly
