---
title: "How do I hook a galgame into Fushi?"
description: "On Windows, drag the game's exe into the game library and press \"Launch and capture\": Fushi hooks the dialogue out of the game and shows it in a floating window — tap characters to look up, tap the plus to mine, and the card automatically carries that line's voice and a screenshot. It can also switch the locale automatically and upscale old games' windows with Magpie."
category: "Games"
order: 86
date: 2026-09-20
lang: en
---

Galgames are close to perfect immersion material: sound, picture and text, with the text delivered one line at a time. It used to take Textractor + Yomitan + ShareX / GSM chained together; Fushi folds that chain into one module (**Windows only**).

## Step 1: add the game

Bottom bar **Games** → **Add game**, pick the game's exe — or drag the exe straight into the game library. Added games get a cover automatically (from the game folder or the program icon), and you can **Scrape metadata** to pull synopsis and cover from VNDB / Bangumi (see [scraping](/faq/scraping.en)).

## Step 2: launch and capture

Press **Launch and capture**: Fushi starts the game, injects its hook component and begins collecting dialogue. If the game is already running, use **Attach and capture**.

At launch Fushi handles two things on the side:

- **Japanese locale**: it judges whether the game needs a locale switch (Shift-JIS evidence in the folder / executable) and if so starts it in a Japanese locale through the built-in Locale Emulator — 32-bit games only. Garbled text or script errors? Set "Japanese locale" for that game to Always / Never in the game's settings.
- **Window upscaling**: old games have low native resolutions; set "Window upscaling" to **Auto** in the game's settings and Fushi uses its bundled Magpie to scale the window to full screen (if Magpie is already running on your machine, yours is used). If it doesn't kick in automatically, press **Win+Shift+A**. It uses the GPU and is set per game.

## Step 3: pick the dialogue thread

Most engines produce several **text threads** on first contact (dialogue, character names, system messages, character-by-character repeat artifacts…); pick the **clean dialogue thread** in the session panel and capture begins in earnest. The one marked "N lines with audio" is usually the dialogue; ignore the ones marked "artifact".

For games the engine doesn't recognise (injected but no text before the timeout) you can paste a **special code** (a Textractor-style H-code such as `/HQN4@4CE90:game.exe`, usually findable in the community; it binds to that exe and is reused next time). No code either? The engine isn't supported yet — wait for an update.

## Step 4: read, look up and mine in the floating window

Dialogue appears in the **dialogue overlay** floating over the game window:

- **tap a character to look it up**, the same popup as the reader;
- **plus to mine**: the card carries the line, **its voice**, and a screenshot from that moment, straight into Anki;
- overlay buttons: follow new lines / lock position / stay on top / click-through to the game / toggle backdrop (transparent, desktop-lyrics style) / replay this line's voice / re-record voice (missed it? replay the line in the game) / open the **mining workbench** (review every line of this session and mine from it);
- font, size, colour, outline and backdrop opacity live under **Settings → Galgame dialogue overlay**.

One step further is **in-game lookup**: skip the overlay and tap characters right on the game screen. **Most KiriKiri (krkr) and SiglusEngine games work directly**; other engines are waiting for support. Some games need a one-time calibration of the text area (tap three probe glyphs in the game), and a bare left click may also advance the dialogue or trigger a choice, so Fushi asks you to accept that risk first, for that exe only. The "In-game lookup" section of the session panel shows the status for the current engine.

## Where the voice comes from

The sentence audio on cards is taken from the game's own voice first (its resource files or the engine's playback buffer — clean, no BGM); only when neither works does it fall back to recording the system mix. Lines without voice acting are mined as usual, just without audio.

## Health

The **Health** section of the session panel shows at a glance which link is missing: game process / game window / text source / audio source / hook helper / window upscaling / Anki output. Whatever's red, open it for the reason.

## Common situations

- **Injection blocked / component not responding**: add Fushi and the game to your antivirus whitelist and check the quarantine.
- **The game runs with higher privileges**: start Fushi as administrator, then launch the game.
- **Bitness mismatch / version mismatch**: close the game completely and relaunch; if that doesn't help, run the Fushi installer again (the game was open during the last update, so the component file couldn't be replaced).
- **Injected but no text**: engine not supported yet — try a special code (step 3), otherwise wait.
- **Garbled text**: set Japanese locale to "Always"; 64-bit games can't be switched — install a system-wide Japanese locale.
- **A previous capture session is still lingering**: restart the game once.
- **"Window not found yet, can't screenshot"**: normal; it binds as soon as the window appears.
