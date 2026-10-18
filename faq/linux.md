---
title: "Linux 能用 Fushi 吗？有没有 Linux 安装包？"
description: "Linux 桌面版暂无预编译安装包，只能从源码构建；阅读器、查词弹窗等 WebView 依赖 WPE WebKit，缺了也能启动。想在 Linux 服务器 / NAS 上跑 Fushi，用官方提供 Linux 包的无头服务端 fushi_server，手机看番学日语、读书查词时连它即可。"
category: "安装与配置"
order: 41.5
date: 2026-10-18
---

分两种情况回答：

- **Linux 桌面 app**：能用，但**只能从源码构建**——官方 CI 不构建 Linux App，也没有 Linux 安装包，[下载页](/zh-cn/download)上写的是「Linux 暂无预编译包，请从源码构建」。代码本身是跨平台的，构建所需的全部前提都写在仓库里，愿意自己编译就能跑起来。
- **Linux 服务器 / NAS**：有官方包。无头服务端 **fushi_server** 提供 Linux x64 版，装在家用服务器、NAS 或 VPS 上，给手机和电脑上的 Fushi 当媒体库主机，见[Fushi 服务端（fushi_server）是什么？](/faq/server)。

## 「只能从源码构建」意味着什么？

Linux 桌面版的代码就在主仓库里，随主线一起更新、随时可以编译，但：

- 发布流程不出 Linux 包，每个版本你都要自己从源码编；
- Fushi 能在 Linux 上检查新版本，但不能自动安装（也没有 Linux 安装包可装），更新就是拉新代码重新编译；
- 官方发布前不会在 Linux 桌面上逐版测试，只在 Linux 上出现的问题欢迎反馈或提交修复。

功能上和 Windows / macOS 桌面版基本一致：读 EPUB 轻小说、看漫画、看本地番剧、查词制卡（连 Anki 桌面版 + AnkiConnect）、Mihon 扩展、互联、云备份都在。**Galgame 文本 / 语音捕获只在 Windows**，Linux 上的「游戏」页是串流接收端，可以从已配对的 Windows 电脑启动游戏并串流过来。

## 阅读器和查词弹窗依赖什么？（WPE WebKit）

Fushi 的 EPUB 阅读器、查词弹窗、LNReader 小说源这些界面跑在 WebView 里。在 Linux 上，WebView 用的是 **WPE WebKit**，而且是**可选**的运行时依赖：

- **装了 WPE**：功能完整。Debian / Ubuntu 25.04 及以后装 `libwpewebkit-2.0-1 libwpebackend-fdo-1.0-1`；Fedora / Arch 装 `wpewebkit`。
- **没装 WPE**：app 照常启动，不靠 WebView 的部分正常用，阅读器 / 查词弹窗 / 小说源的位置会显示原因和安装提示，不会直接崩溃。
- **Ubuntu 24.04 要注意**：官方源里**没有** WPE；另外 Ubuntu 24.04 起的 AppArmor 默认限制非特权 user namespace，而 WPE 的沙箱需要它，被限制时 WebView 同样不可用（Fushi 会显示原因）。Docker 容器里默认也没有 user namespace。

构建时也一样：只有构建机装了 WPE 开发包，才会编出 WebView 的实现库；没装也能编出一个能启动、但没有 WebView 的版本。

## 其他运行时依赖

装 Fushi 的机器需要这些发行版包：

- **GTK 3**、**libmpv2**（视频播放）、**libkeybinder-3.0**（全局快捷键）；
- **ffmpeg / ffprobe** 在 PATH 里（Linux 版不随包带精简 ffmpeg，用系统的）；
- **parecord**（录音，PulseAudio 或 PipeWire-pulse 提供）；
- 可选：**Open JTalk**（制卡单词发音的最后兜底，能读汉字；Debian / Ubuntu 是 `open-jtalk open-jtalk-mecab-naist-jdic hts-voice-nitech-jp-atr503-m001`）或 **espeak-ng**（只能读纯假名）。

内置 BT 引擎的库是可选随包的：编的时候没带上，下载功能会改用外接 qBittorrent，见[BT 下载是什么？](/faq/bittorrent)。

## 怎么从源码构建？

完整步骤在 [GitHub 仓库的 Building 一节](https://github.com/hajisensai/Fushi#building)，Linux 的细节（依赖清单、打包注意事项、在 Docker 里验证的方法）在仓库的 `docs/agent/build.md`「Linux 桌面（源码构建）」。大致是：

1. 装 **Flutter 3.47.6**（仓库锁定这个版本，3.44 及更早版本编不过）。
2. 装构建依赖。以 Debian trixie 为例：`clang cmake ninja-build make pkg-config g++`（g++ 需要 14 以上）、`libgtk-3-dev liblzma-dev libmpv-dev libsecret-1-dev libkeybinder-3.0-dev`；要 WebView 再加 `libwpewebkit-2.0-dev libwpebackend-fdo-1.0-dev libwpe-1.0-dev libepoxy-dev libwayland-dev`。
3. 在仓库根目录跑 `bash tool/bootstrap.sh`（一次完成依赖获取和补丁），再进 `fushi/` 执行 `flutter build linux --release`。
4. 产物在 `build/linux/x64/release/bundle/`，整个 bundle 目录一起拷走运行，不要只拷可执行文件。

仓库里不带 `.desktop` 文件，文件关联和 `fushi://` 链接要自己写一个 `.desktop` 注册；Fushi 在同一会话里是单实例，第二次启动会把要打开的文件交给已经开着的窗口。

## 编好的包拷到另一台机器打不开怎么办？

在构建机上跑得好好的，换一台机器就起不来，几乎都是缺运行库。排查顺序：

1. 在目标机的 bundle 目录里执行 `ldd ./fushi | grep "not found"`，列出来的就是缺的库。正常情况下只应该缺上面「其他运行时依赖」里那些发行版包，装上即可。
2. 执行 `find lib -xtype l`，确认 `lib/` 下没有指向构建机路径的悬空链接——拷贝时要保留整个 bundle 目录结构，Fushi 的词典引擎、BT 引擎、pdfium 等原生库都是从可执行文件旁边的 `lib/` 里按绝对路径加载的。
3. 注意在构建机上检查永远是绿的：插件在构建期记下的库搜索路径会指回构建目录。想确认一份包真的能分发，要在一台干净的机器或容器里验。
4. 能启动但阅读器、查词弹窗是空的，看那块区域显示的原因：多半是没装 WPE，或者系统禁止了非特权 user namespace（见上一节）。

自己打包（比如做成发行版仓库里的包）时，把这些运行时依赖写进包的依赖声明，再附上一个 `.desktop` 文件，用户装完就能直接从菜单打开。

## 只想在 Linux 服务器上跑：用 fushi_server

如果你的 Linux 机器是放在角落里的 NAS 或服务器，不需要桌面 app，直接用 **fushi_server**：

- 从 [hajisensai/fushi-server](https://github.com/hajisensai/fushi-server/releases) 下载 `fushi_server-…-linux-x64.tar.gz`（目前发布的都是测试版 beta），解压即用，内置 BT 引擎和 OCR / 字幕识别用的 onnxruntime 都已随包；
- 需要 glibc 2.35 及以上（Debian 12 / Ubuntu 22.04 及以后），ffmpeg / ffprobe 要在 PATH 或在配置里写路径；
- 它带 WebUI，能扫描你的视频 / 书 / 漫画目录入库、整卷漫画 OCR、字幕识别、代下载，手机和电脑上的 Fushi 通过 [Fushi 互联](/faq/interconnect)配对后直接浏览和拉流。

部署步骤见[Fushi 服务端（fushi_server）是什么？](/faq/server)。其他平台见[支持哪些平台？](/faq/platforms)和[Windows 怎么安装 Fushi？](/faq/windows-install)。
