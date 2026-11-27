---
title: "Does Fushi run on Linux? Is there a Linux package?"
description: "Yes: the Linux desktop app ships as an official Flatpak (x86_64) with WPE WebKit, mpv and the other dependencies inside, updates from within the app, and is on the download page; you can also build it from source. To run Fushi on a Linux server or NAS, use the headless fushi_server, which also ships official Linux packages."
category: "Setup"
order: 41.5
date: 2026-10-18
lang: en
---

There are two answers, depending on what you mean:

- **The Linux desktop app**: there is an official package — a **Flatpak (x86_64)**, on the Linux row of the [download page](/download). Formal releases include it from 3.4.0, and every debug build ships one. You can still build it from source yourself if you prefer (see below).
- **Linux servers / NAS**: there is an official package. The headless server **fushi_server** ships a Linux x64 build that you install on a home server, NAS or VPS as the media library host for Fushi on your phones and computers; see [What is the Fushi server (fushi_server)?](/faq/server.en)

## How do I install the Flatpak?

1. You need Flatpak on the system (most distributions ship it or install it with one command; Steam Deck desktop mode has it built in).
2. Get `fushi-<version>-linux-x86_64.flatpak` from the download page and run `flatpak install --user fushi-<version>-linux-x86_64.flatpak`. The GNOME runtime it needs is pulled from Flathub automatically.
3. Or skip the file and install straight from Fushi's Flatpak repository: `flatpak install --user https://hajisensai.github.io/Fushi/app.fushi.reader.flatpakref` (debug builds: `app.fushi.reader.debug.flatpakref`).

Then open Fushi from your application menu. Updates: the in-app "Check for updates" pulls the new version through the Flatpak portal and restarts, or just run `flatpak update`. The update channel follows the branch you installed (`stable` for formal releases, `debug` for debug builds); to switch channels, install the other branch.

The Flatpak already carries **WPE WebKit** (the WebView behind the reader, lookup popup and novel sources) and **mpv** (video playback), so you don't install those distribution packages yourself.

Feature-wise it's essentially the same as the Windows / macOS desktop apps: EPUB light novels, manga, local anime, lookup and mining (with Anki desktop + AnkiConnect), Mihon extensions, interconnect and cloud backup are all there. **Galgame text / voice capture is Windows-only**; on Linux the "Games" page is a streaming client that can launch games on a paired Windows PC and stream them over. Releases are not tested on every Linux distribution one by one; if something only breaks on Linux, feedback and fixes are welcome.

## Building from source: what do the reader and lookup popup depend on? (WPE WebKit)

The next few sections only apply to a build **you compile from source**; the Flatpak already bundles these dependencies.

Fushi's EPUB reader, lookup popup, LNReader novel sources and similar screens run inside a WebView. On Linux that WebView is **WPE WebKit**, and it's an **optional** runtime dependency:

- **With WPE installed**: everything works. On Debian / Ubuntu 25.04 and later install `libwpewebkit-2.0-1 libwpebackend-fdo-1.0-1`; on Fedora / Arch install `wpewebkit`.
- **Without WPE**: the app still starts and everything that doesn't need a WebView works; where the reader / lookup popup / novel sources would be, it shows the reason and an install hint instead of crashing.
- **Watch out on Ubuntu 24.04**: the official repositories **don't have** WPE. On top of that, from Ubuntu 24.04 AppArmor restricts unprivileged user namespaces by default, and WPE's sandbox needs them — when that's restricted the WebView is unavailable too (Fushi shows the reason). Docker containers don't have user namespaces by default either.

The same goes for building: the WebView implementation library is only built when the build machine has the WPE development packages; without them you still get a build that starts, just without a WebView.

## Other runtime dependencies (source builds)

The machine running a build you compiled needs these distribution packages:

- **GTK 3**, **libmpv2** (video playback), **libkeybinder-3.0** (global shortcuts);
- **ffmpeg / ffprobe** on PATH (the Linux build doesn't bundle the slimmed-down ffmpeg; it uses the system one);
- **parecord** (recording; provided by PulseAudio or PipeWire-pulse);
- optional: **Open JTalk** (the last-resort fallback for word audio on cards, can read kanji; on Debian / Ubuntu: `open-jtalk open-jtalk-mecab-naist-jdic hts-voice-nitech-jp-atr503-m001`) or **espeak-ng** (kana only).

The built-in BitTorrent engine library is bundled only if present: if your build doesn't include it, downloads fall back to an external qBittorrent; see [What is BitTorrent?](/faq/bittorrent.en)

## How do I build it from source?

The full steps are in the [Building section of the GitHub repository](https://github.com/hajisensai/Fushi#building); Linux specifics (dependency list, packaging notes, how to verify in Docker) are in the repository's `docs/agent/build.md`, section "Linux 桌面（源码构建）" (Linux desktop, build from source). Roughly:

1. Install **Flutter 3.50.0** (the repository is locked to this version; 3.44 and earlier can't build it).
2. Install the build dependencies. On Debian trixie, for example: `clang cmake ninja-build make pkg-config g++` (g++ 14 or newer), `libgtk-3-dev liblzma-dev libmpv-dev libsecret-1-dev libkeybinder-3.0-dev`; for the WebView, add `libwpewebkit-2.0-dev libwpebackend-fdo-1.0-dev libwpe-1.0-dev libepoxy-dev libwayland-dev`.
3. Run `bash tool/bootstrap.sh` in the repository root (fetches dependencies and applies patches in one go), then in `fushi/` run `flutter build linux --release`.
4. The result is in `build/linux/x64/release/bundle/`. Copy the whole bundle directory to run it, not just the executable.

The repository doesn't ship a `.desktop` file, so for file associations and `fushi://` links you need to write and register one yourself. Fushi is single-instance within a session: launching it again hands the file to open to the window that's already running.

## My build won't start on another machine — what now?

When it runs fine on the build machine but not on another one, it's almost always a missing runtime library. Check in this order:

1. In the bundle directory on the target machine, run `ldd ./fushi | grep "not found"`; whatever it lists is missing. Normally only the distribution packages from "Other runtime dependencies" above should be missing — install them.
2. Run `find lib -xtype l` to make sure there are no dangling links under `lib/` pointing back at the build machine. Keep the whole bundle directory structure when copying: Fushi's dictionary engine, BitTorrent engine, pdfium and other native libraries are loaded by absolute path from the `lib/` next to the executable.
3. Note that checks on the build machine are always green: plugins record library search paths at build time that point back into the build directory. To be sure a package really is distributable, verify it on a clean machine or container.
4. If it starts but the reader or lookup popup is blank, read the reason shown in that area: usually WPE isn't installed, or the system forbids unprivileged user namespaces (see above).

If you package it for the community (for example in a distribution repository), declare these runtime dependencies in the package and include a `.desktop` file so users can open it from the menu right after installing.

## Just want it on a Linux server? Use fushi_server

If your Linux machine is a NAS or server sitting in a corner and you don't need the desktop app, use **fushi_server** directly:

- Download `fushi_server-…-linux-x64.tar.gz` from [hajisensai/fushi-server](https://github.com/hajisensai/fushi-server/releases) (all current releases are betas) and unpack it; the built-in BitTorrent engine and the onnxruntime used for OCR / subtitle recognition are bundled;
- it needs glibc 2.35 or newer (Debian 12 / Ubuntu 22.04 and later), and ffmpeg / ffprobe on PATH or their paths in the config;
- it has a WebUI and can scan your video / book / manga folders into a library, OCR whole manga volumes, recognise subtitles and download on your behalf; Fushi on your phones and computers pairs with it through [Fushi interconnect](/faq/interconnect.en) and browses and streams from it directly.

For deployment steps, see [What is the Fushi server (fushi_server)?](/faq/server.en) For other platforms, see [Which platforms are supported?](/faq/platforms.en) and [How do I install Fushi on Windows?](/faq/windows-install.en)
