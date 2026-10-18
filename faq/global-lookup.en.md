---
title: "Can I look words up in any app on my computer? Fushi's global lookup, floating ball and clipboard lookup"
description: "Yes. On Windows and macOS, select a word in any program and press Ctrl+Alt+D (⌘⌥D on macOS): Fushi's lookup card opens next to the pointer, with nested lookups, word audio and one-tap Anki mining. The floating ball adds clipboard lookup and screen OCR outside the app. Android uses the system text menu, and web pages have the browser extension."
category: "Lookup & dictionaries"
order: 124
date: 2026-10-18
lang: en
---

Yes. Fushi's dictionaries aren't limited to its own reader and player: while Fushi is running you can look words up in your browser, PDF viewer, chat apps, games — any program where you can select text — and what pops up is the very same lookup card as inside the app: same dictionaries, same pitch accent and frequency, same plus for mining.

Platforms first:

| Platform | What you get |
|---|---|
| **Windows** | Global lookup shortcut, floating ball outside the app (clipboard lookup / screen OCR), browser extension |
| **macOS** | Same as Windows (grant "Accessibility" the first time) |
| **Linux** | No lookup card or floating ball outside the app yet; the browser extension works for web pages |
| **Android** | System text menu / Share lookup, floating ball outside the app |
| **iOS** | The system doesn't let apps pop up over other apps, so there's no app-external lookup; paste text into Fushi's lookup page instead |

## Windows / macOS: select text, press the shortcut

1. **Highlight a word** in any program and keep it selected.
2. Press **Ctrl+Alt+D** (**⌘⌥D** on macOS).
3. Fushi grabs the selection and opens a lookup card **next to the pointer**.

The important bits:

- **The card doesn't steal focus**: it floats above the current program, but that program stays in the foreground, so typing and game input are unaffected. Press Esc or click outside the card to dismiss it.
- **Pressing again looks up the new selection**: select another word and press the shortcut; the card switches to the new word without closing first.
- **You can keep looking things up inside the card**: tap a word in a definition and the next card opens beside it; drill down layer by layer (nested lookup), just like the in-app popup — see [How does the lookup popup work?](/faq/lookup-popup.en)
- **Audio and mining work**: the speaker plays word audio, the plus makes an Anki card; if the word is already in Anki, the ✓ lets you overwrite a card, open it in Anki or add a duplicate.
- **Fushi has to be running**: lookups use the dictionaries in the main Fushi process; quit Fushi and the shortcut is gone. Minimised or in the background is fine.

### Changing the shortcut, using mouse side buttons or a gamepad

**Settings → Keyboard shortcuts → Global (app-external)** has two entries:

- **App-external lookup shortcut**: the action above, Ctrl+Alt+D by default. Change it to another combination, or bind a **mouse side button** (back / forward) — mouse triggers accept side buttons only, because other buttons keep their normal meaning in other apps and are rejected. Gamepad buttons can be bound too (none by default, because the binding takes priority over in-page gamepad controls).
- **Bring to front and open lookup page**: Ctrl+Alt+F by default. It grabs no selection; it just brings Fushi's main window to the front on the lookup page so you can type or paste.

The onboarding wizard has a "Look up outside Fushi" step that demonstrates this and shows the key you currently have bound.

### Bringing the whole sentence along: Capture selection context

By default the shortcut only gets the characters you selected (Fushi simulates a copy to read the selection). Turn on "**Capture selection context**" under **Settings → Lookup → Lookup trigger** and Fushi also reads the text around the selection from the foreground app, shows the current sentence in the lookup card and uses it as the example sentence when you mine (Windows / macOS).

It's off by default: it reads text from other programs' windows, which is privacy-sensitive, so turn it on only if you want it. Programs that don't expose their text through accessibility interfaces automatically fall back to looking up just the selection.

### macOS: grant "Accessibility" first

macOS needs Accessibility access to read the text selected in other apps; without it the shortcut looks up the current clipboard text. Fushi asks for it the first time you press the shortcut, or you can use "**Grant Accessibility permission for app-external lookup**" under **Settings → Lookup → Lookup trigger**. Enable Fushi under Privacy & Security > Accessibility in System Settings, then press the shortcut again.

### Keeping the card out of screenshots, recordings and streams

"**Block screen capture**" under **Settings → Lookup → Popup window** excludes the lookup popup window from screenshots, screen recording and live streaming (Windows / macOS). It's off by default, so screenshots capture the card; turn it on when you stream or record tutorials and don't want viewers to see your lookups.

## The floating ball outside the app: clipboard lookup, screen OCR

Some text can't be selected, or you'd rather tap a button. Turn on "**Show over other apps**" under **Settings → Floating ball** and the ball keeps floating above other programs after you switch away from Fushi. When expanded it can hold these buttons:

- **App-external lookup**: looks up the text currently selected in the foreground program — the same thing as the shortcut.
- **Look up clipboard**: reads the text on the clipboard and opens a lookup card next to the ball. Handy for "copy first, then look up" — e.g. when a tool such as Textractor copies game lines to the clipboard, one tap on the ball looks them up.
- **Screen OCR**: captures the display the ball is on, finds the text with the system's built-in text recognition and lays a frozen copy of the screen on top so you can **tap characters to look them up**. Text in images, game screens, video frames and UI text you can't select all works this way.
- **Look up**: brings Fushi to the front and opens the lookup page.
- **Open Fushi**, sync now and so on.

The first three lookup buttons need the "Lookup" module turned on (**Settings → Appearance and interaction → Feature modules**). The ball's buttons are chosen separately per context (book reader, manga reader, video player, other pages, outside the app).

Note that Fushi **does not monitor the clipboard in the background**: it reads the clipboard once, only when you tap "Look up clipboard". For a game setup where every copied line shows up automatically, use the text hook described below.

## Android: the text menu and the floating ball

Android hands selected text to Fushi through the text menu or Share sheet:

1. **Long-press a word** in another app and adjust the handles to cover it.
2. Tap **Fushi** in the text menu, or tap Share and pick Fushi.
3. The lookup opens on top of the other app; close it to return. Nested lookups, audio and mining all work there too.

Android has a floating ball outside the app as well: turn on "Show over other apps" in **Settings → Floating ball**; it needs the display-over-other-apps permission to stay on screen. On Android the ball offers "App-external lookup" (opens a lookup window with a search bar without entering the main app), "Look up clipboard", "Screen OCR" and "Photo lookup" (photograph a paper book, a sign or another device's screen, then tap the text).

## Browsers, games and other tools

- **Web pages**: hold Shift and move over a word on any page using Fushi's browser extension (Chrome, Edge and other Chromium browsers on a computer); installation steps are in [How do I look words up in the browser?](/faq/browser-lookup.en) It shares its dictionaries with global lookup, and on web pages it's smoother than the shortcut.
- **Galgames**: on Windows Fushi can hook the game's dialogue directly and let you tap words and mine in an overlay; see [How do I hook a galgame into Fushi?](/faq/galgame.en)
- **Text-grabbing tools such as Textractor / LunaTranslator / mpv**: "Texthooker (receive text)" under **Settings → Lookup → External integrations** connects to their WebSocket; lines are pushed into Fushi, where you tap words to look them up.
- **Tools that speak the yomitan-api protocol, such as GameSentenceMiner**: turn on the "Fushi API server" so they query Fushi's dictionaries instead.
- **Dictionary cross-references on Anki cards**: when mining, Fushi rewrites dictionary-internal links in definitions into `fushi://lookup` links; on Windows and Android, clicking one opens Fushi and looks up that word.

## Common problems

- **The shortcut does nothing**: make sure Fushi is running and the "Lookup" module isn't turned off; the shortcut may clash with another program — pick another combination under Settings → Keyboard shortcuts → Global (app-external).
- **It looks up some other word / whatever I copied last**: some programs don't respond to the simulated copy, so the selection wasn't captured. Try another program, or copy manually and use the floating ball's "Look up clipboard".
- **On macOS it only looks up the clipboard**: Accessibility isn't granted; see above.
- **No example sentence in the card**: "Capture selection context" is off by default; if it's on and there's still nothing, that program doesn't expose the surrounding text.
- **Screen OCR doesn't recognise the text**: the system's text recognition struggles with tiny text, stylised fonts and low contrast; when the text can be selected, prefer the shortcut.
- **No shortcut lookup or floating ball on Linux**: Linux currently has in-app lookups and the browser extension only; platform differences are in [Which platforms are supported?](/faq/platforms.en)
