---
title: "How do I look words up in the browser? What is Shift lookup?"
description: "Hold Shift and move the mouse over a word and the dictionary pops up — that's the Yomitan habit, and Fushi's browser extension works the same way. Inside the app, the reader and videos look up on tap; the Fushi subtitles the extension lays over videos on streaming sites accept both Shift and tap; other web page text uses Shift. Installation steps included."
category: "Browser extension"
order: 110
date: 2026-10-07
lang: en
---

## First, "Shift lookup"

In Fushi's reader and video player you look a word up by **tapping** it. On a web page, though, clicking follows links, presses buttons and selects text, so it can't be the lookup gesture. Browser lookup tools ([Yomitan](https://yomitan.wiki/), formerly Yomichan) settled on a different habit:

> **Hold Shift and move the mouse over a word** — the dictionary pops up; release Shift or move away and it closes. No clicking, no selecting.

Yomitan users have this in their muscle memory; first-timers assume the extension is broken — it's waiting for Shift.

Three places in Fushi, three triggers:

| Where | How |
|---|---|
| In-app reader, video / anime subtitles, manga | **Tap** the word (on desktop you can also enable "Look up on hover" under Settings → Lookup — resting the mouse on a word looks it up) |
| The **Fushi subtitles** the extension lays over videos on streaming sites | **Tap** and **Shift-hover** both work (turn on auto lookup for the overlay subtitles in the extension's settings and you don't need Shift) |
| Browser extension (text on any web page) | **Shift-hover** |

## Browser extension: lookups on any web page

Fushi ships its own browser extension that lets you look words up and mine cards on any web page with the app's dictionaries. Desktop only (Windows / macOS), Chromium browsers such as Chrome / Edge; on phones, read inside the app.

### Installing

**Settings → Lookup → External integrations → Extension**, follow the steps on the page:

1. Press **Prepare extension files**. Fushi turns on the lookup service (the Yomitan API server), unpacks the extension locally and copies the folder path to the clipboard.
2. Open `chrome://extensions` in the address bar (`edge://extensions` on Edge).
3. Turn on **Developer mode** at the top right.
4. Press **Load unpacked**, paste the copied path and select that folder.
5. Back in Fushi press **Check connection**; "Extension connected" means you're done. Nothing else to configure — the connection details are written in automatically.

To make sure, press **Open the test page**: a page served by Fushi itself; the extension icon at the top right should open a panel, and holding Shift over a word in the sample sentence should pop up the dictionary.

### Using it

- **Hold Shift, move the mouse over a word** → the same dictionary popup as in the app (same dictionaries, same layout).
- Press the **plus** in the popup to mine; the whole sentence is captured and the card goes to the Anki you connected.
- Another unknown word in the definition? Shift over it — lookups nest.
- Popup size is under **Settings → Lookup** ("Extension popup max width / height") and can differ from the in-app popup.

### Won't install / no reaction

- **"Lookup service is off"**: turn on "Yomitan API server" on the extension page, or press "Prepare extension files" again.
- **Port 19633 in use**: most likely the yomitan-api component (a Python process) started by a Yomitan you installed earlier. Fushi tells you; end that process directly, or disable the Yomitan API in Yomitan's advanced settings and restart Fushi's server.
- **"The extension loaded in the browser isn't the latest version"**: a Fushi update refreshed the extension files; press "Reload" on the extension at `chrome://extensions`.
- **Some pages yield no words**: text drawn on a canvas or baked into images (some manga sites, PDF previews) can't be read by the extension — expected.
- Closing Fushi disconnects the extension — it queries the dictionaries in your local Fushi.

## Web video: the extension's Fushi subtitles

On streaming sites, YouTube and the like, the extension lets you watch and look things up right in the browser:

- **Show Fushi subtitles on the video**: the current subtitle track is laid over the video; tap or Shift-hover a word to look it up. Drag the subtitles anywhere and resize them; for word-by-word captions such as YouTube's auto subtitles, "replace the site's native subtitles" shows whole sentences instead. Subtitle appearance (font, colour, backdrop) is set in the extension's settings, including fonts from Fushi's font library.
- **Subtitle sidebar**: on Netflix, YouTube, TVer, Bilibili.tv, Hulu (Japan) and Prime Video the whole episode's subtitles are captured into the subtitle list automatically — open it from the toolbar menu and click a line to jump there; other sites use generic capture. There's also a Fushi button in the site's player controls.
- **No Japanese subtitles from the site?** Search online subtitles (Jimaku / OpenSubtitles / AJATT) in the extension's subtitle panel, or drag an SRT / ASS / VTT file onto the video.
- **Mining**: mine from the lookup popup and the card joins the mining queue; generate the queued cards from the extension menu afterwards (with that line's picture and audio).
- Watching video on the web counts towards your immersion time in Fushi.

The app's former "built-in web player" (opening web video inside Fushi) is temporarily disabled; use the browser extension for web video.

## Already using Yomitan?

The two can coexist or you can keep one:

- **Keep Yomitan for web pages** if you like — Fushi's extension is simply an alternative; both use Shift, so with both installed you'll get two popups; keep one for web lookups.
- To make **tools that speak the yomitan-api protocol** (GameSentenceMiner and the like) query Fushi's dictionaries: enable Fushi's Yomitan API server (port 19633, optional key) and point the tool at it.
- Text-capture tools such as Textractor / LunaTranslator / mpv can push text straight into Fushi's "Texthooker (receive text)" (connect to their WebSocket under Settings → Lookup → External integrations) for word-by-word lookups and mining inside Fushi — no texthooker page + Yomitan needed.

## Outside the browser

- **Windows / macOS global lookup**: select a word in any application and press the "App-external lookup shortcut" (**Settings → Keyboard shortcuts → Global (app-external)**); the lookup card opens next to the mouse. On macOS, grant Fushi the Accessibility permission the first time. The same group has "Bring to front and open lookup page".
- **Android global lookup**: long-press to select text in another app, pick Fushi in the text menu (or via Share); the popup sits on top of the original app. The system-wide floating ball works too.
