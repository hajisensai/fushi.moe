---
title: "How do I look words up in the browser? What is Shift lookup?"
description: "Hold Shift and move the mouse over a word and the dictionary pops up — that's the Yomitan habit, and Fushi's browser extension works the same way. Inside the app, the reader and local videos look up on tap; the Fushi subtitle layer in the built-in web player accepts both Shift and tap; every other web page is Shift only. Installation steps included."
category: "Browser extension"
order: 110
date: 2026-09-20
lang: en
---

## First, "Shift lookup"

In Fushi's reader and video player you look a word up by **tapping** it. On a web page, though, clicking follows links, presses buttons and selects text, so it can't be the lookup gesture. Browser lookup tools ([Yomitan](https://yomitan.wiki/), formerly Yomichan) settled on a different habit:

> **Hold Shift and move the mouse over a word** — the dictionary pops up; release Shift or move away and it closes. No clicking, no selecting.

Yomitan users have this in their muscle memory; first-timers assume the extension is broken — it's waiting for Shift.

Three places in Fushi, three triggers:

| Where | How |
|---|---|
| In-app reader, local video / anime subtitles, manga | **Tap** the word (on desktop you can also enable "Hover to look up" in settings — resting the mouse on a word looks it up) |
| The **Fushi subtitle** layer in the built-in web player | **Shift-hover** and **tap** both work |
| Browser extension (any web page) | **Shift-hover** only |

## Browser extension: lookups on any web page

Fushi ships its own browser extension that lets you look words up and mine cards on any web page with the app's dictionaries. Desktop only (Windows / macOS), Chromium browsers such as Chrome / Edge; phone browsers can't load extensions, so read inside the app there.

### Installing

**Settings → Browser extension**, follow the steps on the page:

1. Press **Prepare extension files**. Fushi turns on the lookup service (the Yomitan API server), unpacks the extension locally and copies the folder path to the clipboard.
2. Open `chrome://extensions` in the address bar (`edge://extensions` on Edge).
3. Turn on **Developer mode** at the top right.
4. Press **Load unpacked**, paste the copied path and select that folder.
5. Back in Fushi press **Check connection**; "Extension connected" means you're done. Nothing else to configure — the connection details are written in automatically.

To make sure, press **Open test page**: a page served by Fushi itself; the extension icon at the top right should open a panel, and holding Shift over a word in the sample sentence should pop up the dictionary.

### Using it

- **Hold Shift, move the mouse over a word** → the same dictionary popup as in the app (same dictionaries, same layout).
- Press the **plus** in the popup to mine; the whole sentence is captured and the card goes to the Anki you connected.
- Another unknown word in the definition? Shift over it — lookups nest.
- Popup size is under **Settings → Lookup** ("Extension popup max width / height") and can differ from the in-app popup.

### Won't install / no reaction

- **"Lookup service is off"**: turn on "Yomitan API server" under Settings → Browser extension, or press "Prepare extension files" again.
- **Port 19633 in use**: most likely the yomitan-api component (a Python process) started by a Yomitan you installed earlier. Fushi tells you; end that process directly, or disable the Yomitan API in Yomitan's advanced settings and restart Fushi's server.
- **"The extension loaded in the browser isn't the latest version"**: a Fushi update refreshed the extension files; press "Reload" on the extension at `chrome://extensions`.
- **Some pages yield no words**: text drawn on a canvas or baked into images (some manga sites, PDF previews) can't be read by the extension — expected.
- Closing Fushi disconnects the extension — it queries the dictionaries in your local Fushi.

## Built-in web player: web video

Streaming sites, Bilibili, YouTube and the like can be watched with lookups without downloading: **Video → Import**, paste the page URL (not a direct file link) and it opens in the built-in web player.

- **Playback mode**: **Built-in** (1080p, upscaling and screenshot mining available) or **Native window** (for 4K and hardware-DRM sites; mining queues up, and "Switch to built-in mode to make the queued cards" makes them in one go afterwards).
- **Subtitle tracks**: Fushi captures the page's subtitles live and renders them as its own layer — the "Fushi subtitle" from the table above, **Shift-hover and tap both look up**. Turn on **Hide site subtitles** to leave only Fushi's layer.
- If the site has no subtitles, or they're painted into the picture, there's nothing to capture and only Shift over other page text remains.

## Already using Yomitan?

The two can coexist or you can keep one:

- **Keep Yomitan for web pages** if you like — Fushi's extension is simply an alternative; both use Shift, so with both installed you'll get two popups; keep one for web lookups.
- To make **tools that speak the yomitan-api protocol** (GameSentenceMiner and the like) query Fushi's dictionaries: enable Fushi's Yomitan API server (port 19633, optional key) and point the tool at it.
- Text-capture tools such as Textractor / LunaTranslator / mpv can push text straight into Fushi's texthooker (connect to their WebSocket in settings) for word-by-word lookups and mining inside Fushi — no texthooker page + Yomitan needed.

## Outside the browser

- **Windows global lookup**: select a word in any application and press the shortcut (Settings → Shortcuts → Global); the lookup card opens next to the mouse.
- **Android global lookup**: long-press to select text in another app, pick Fushi in the text menu (or via Share); the popup sits on top of the original app.
