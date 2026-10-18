---
title: "Linux 能用 Fushi 嗎？有沒有 Linux 安裝包？"
description: "Linux 桌面版暫無預編譯安裝包，只能從原始碼構建；閱讀器、查詞彈窗等 WebView 依賴 WPE WebKit，缺了也能啟動。想在 Linux 伺服器 / NAS 上跑 Fushi，用官方提供 Linux 包的無頭服務端 fushi_server，手機看番學日語、讀書查詞時連它即可。"
category: "安裝與配置"
order: 41.5
date: 2026-10-18
lang: zh-HK
---

分兩種情況回答：

- **Linux 桌面 app**：能用，但**只能從原始碼構建**——官方 CI 不構建 Linux App，也沒有 Linux 安裝包，[下載頁](/zh-hk/download)上寫的是「Linux 暫無預編譯包，請從原始碼構建」。程式碼本身是跨平臺的，構建所需的全部前提都寫在倉庫裡，願意自己編譯就能跑起來。
- **Linux 伺服器 / NAS**：有官方包。無頭服務端 **fushi_server** 提供 Linux x64 版，裝在家用伺服器、NAS 或 VPS 上，給手機和電腦上的 Fushi 當媒體庫主機，見[Fushi 服務端（fushi_server）是什麼？](/faq/server.zh-HK)。

## 「只能從原始碼構建」意味著什麼？

Linux 桌面版的程式碼就在主倉庫裡，隨主線一起更新、隨時可以編譯，但：

- 釋出流程不出 Linux 包，每個版本你都要自己從原始碼編；
- Fushi 能在 Linux 上檢查新版本，但不能自動安裝（也沒有 Linux 安裝包可裝），更新就是拉新程式碼重新編譯；
- 官方釋出前不會在 Linux 桌面上逐版測試，只在 Linux 上出現的問題歡迎反饋或提交修復。

功能上和 Windows / macOS 桌面版基本一致：讀 EPUB 輕小說、看漫畫、看本地番劇、查詞制卡（連 Anki 桌面版 + AnkiConnect）、Mihon 擴充套件、互聯、雲備份都在。**Galgame 文本 / 語音捕獲只在 Windows**，Linux 上的「遊戲」頁是串流接收端，可以從已配對的 Windows 電腦啟動遊戲並串流過來。

## 閱讀器和查詞彈窗依賴什麼？（WPE WebKit）

Fushi 的 EPUB 閱讀器、查詞彈窗、LNReader 小說源這些介面跑在 WebView 裡。在 Linux 上，WebView 用的是 **WPE WebKit**，而且是**可選**的執行時依賴：

- **裝了 WPE**：功能完整。Debian / Ubuntu 25.04 及以後裝 `libwpewebkit-2.0-1 libwpebackend-fdo-1.0-1`；Fedora / Arch 裝 `wpewebkit`。
- **沒裝 WPE**：app 照常啟動，不靠 WebView 的部分正常用，閱讀器 / 查詞彈窗 / 小說源的位置會顯示原因和安裝提示，不會直接崩潰。
- **Ubuntu 24.04 要注意**：官方源裡**沒有** WPE；另外 Ubuntu 24.04 起的 AppArmor 預設限制非特權 user namespace，而 WPE 的沙箱需要它，被限制時 WebView 同樣不可用（Fushi 會顯示原因）。Docker 容器裡預設也沒有 user namespace。

構建時也一樣：只有構建機裝了 WPE 開發包，才會編出 WebView 的實現庫；沒裝也能編出一個能啟動、但沒有 WebView 的版本。

## 其他執行時依賴

裝 Fushi 的機器需要這些發行版包：

- **GTK 3**、**libmpv2**（影片播放）、**libkeybinder-3.0**（全域性快捷鍵）；
- **ffmpeg / ffprobe** 在 PATH 裡（Linux 版不隨包帶精簡 ffmpeg，用系統的）；
- **parecord**（錄音，PulseAudio 或 PipeWire-pulse 提供）；
- 可選：**Open JTalk**（制卡單詞發音的最後兜底，能讀漢字；Debian / Ubuntu 是 `open-jtalk open-jtalk-mecab-naist-jdic hts-voice-nitech-jp-atr503-m001`）或 **espeak-ng**（只能讀純假名）。

內建 BT 引擎的庫是可選隨包的：編的時候沒帶上，下載功能會改用外接 qBittorrent，見[BT 下載是什麼？](/faq/bittorrent.zh-HK)。

## 怎麼從原始碼構建？

完整步驟在 [GitHub 倉庫的 Building 一節](https://github.com/hajisensai/Fushi#building)，Linux 的細節（依賴清單、打包注意事項、在 Docker 裡驗證的方法）在倉庫的 `docs/agent/build.md`「Linux 桌面（原始碼構建）」。大致是：

1. 裝 **Flutter 3.47.6**（倉庫鎖定這個版本，3.44 及更早版本編不過）。
2. 裝構建依賴。以 Debian trixie 為例：`clang cmake ninja-build make pkg-config g++`（g++ 需要 14 以上）、`libgtk-3-dev liblzma-dev libmpv-dev libsecret-1-dev libkeybinder-3.0-dev`；要 WebView 再加 `libwpewebkit-2.0-dev libwpebackend-fdo-1.0-dev libwpe-1.0-dev libepoxy-dev libwayland-dev`。
3. 在倉庫根目錄跑 `bash tool/bootstrap.sh`（一次完成依賴獲取和補丁），再進 `fushi/` 執行 `flutter build linux --release`。
4. 產物在 `build/linux/x64/release/bundle/`，整個 bundle 目錄一起拷走執行，不要只拷執行檔。

倉庫裡不帶 `.desktop` 檔案，檔案關聯和 `fushi://` 連結要自己寫一個 `.desktop` 註冊；Fushi 在同一會話裡是單例項，第二次啟動會把要開啟的檔案交給已經開著的視窗。

## 編好的包拷到另一臺機器打不開怎麼辦？

在構建機上跑得好好的，換一臺機器就起不來，幾乎都是缺執行庫。排查順序：

1. 在目標機的 bundle 目錄裡執行 `ldd ./fushi | grep "not found"`，列出來的就是缺的庫。正常情況下只應該缺上面「其他執行時依賴」裡那些發行版包，裝上即可。
2. 執行 `find lib -xtype l`，確認 `lib/` 下沒有指向構建機路徑的懸空連結——複製時要保留整個 bundle 目錄結構，Fushi 的詞典引擎、BT 引擎、pdfium 等原生庫都是從執行檔旁邊的 `lib/` 裡按絕對路徑載入的。
3. 注意在構建機上檢查永遠是綠的：外掛在構建期記下的庫搜尋路徑會指回構建目錄。想確認一份包真的能分發，要在一臺乾淨的機器或容器裡驗。
4. 能啟動但閱讀器、查詞彈窗是空的，看那塊區域顯示的原因：多半是沒裝 WPE，或者系統禁止了非特權 user namespace（見上一節）。

自己打包（比如做成發行版倉庫裡的包）時，把這些執行時依賴寫進包的依賴宣告，再附上一個 `.desktop` 檔案，使用者裝完就能直接從選單開啟。

## 只想在 Linux 伺服器上跑：用 fushi_server

如果你的 Linux 機器是放在角落裡的 NAS 或伺服器，不需要桌面 app，直接用 **fushi_server**：

- 從 [hajisensai/fushi-server](https://github.com/hajisensai/fushi-server/releases) 下載 `fushi_server-…-linux-x64.tar.gz`（目前釋出的都是測試版 beta），解壓即用，內建 BT 引擎和 OCR / 字幕識別用的 onnxruntime 都已隨包；
- 需要 glibc 2.35 及以上（Debian 12 / Ubuntu 22.04 及以後），ffmpeg / ffprobe 要在 PATH 或在配置裡寫路徑；
- 它帶 WebUI，能掃描你的影片 / 書 / 漫畫目錄入庫、整卷漫畫 OCR、字幕識別、代下載，手機和電腦上的 Fushi 通過 [Fushi 互聯](/faq/interconnect.zh-HK)配對後直接瀏覽和拉流。

部署步驟見[Fushi 服務端（fushi_server）是什麼？](/faq/server.zh-HK)。其他平臺見[支援哪些平臺？](/faq/platforms.zh-HK)和[Windows 怎麼安裝 Fushi？](/faq/windows-install.zh-HK)。
