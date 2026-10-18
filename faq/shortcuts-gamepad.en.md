---
title: "Does Fushi support keyboard shortcuts and gamepads? What are the default keys?"
description: "Yes. The reader, manga, video, home screen and dictionary popup all have default keyboard and gamepad bindings, and every one of them can be remapped, looked up by key and de-conflicted in Keyboard shortcuts. Turn on keyboard & gamepad focus navigation and you can skip the mouse and touchscreen entirely — watch anime, read light novels, look up words and mine cards from the couch with a controller. Includes default key tables and platform differences."
category: "Setup"
order: 57.9
date: 2026-10-18
lang: en
---

Yes. Fushi's shortcuts are one unified registry: keyboard, gamepad, mouse buttons and the mouse wheel can all be bound to the same action, and almost every action can be remapped. Typical uses are turning pages and looking up words with the keyboard at your desk, or plugging the computer into a TV and watching anime and reading from the couch with a controller.

## Where to change bindings

**Settings → System and about → General → Keyboard shortcuts**.

The page is grouped by scope: **Back / Exit**, **Global**, **Global (app-external)**, **Home**, **Reader**, **Audiobook**, **Manga**, **Video**, **Gamepad**, **Dictionary popup**. Each action lists its current keyboard, gamepad and mouse bindings; tap one to record a new binding (Esc cancels).

A few handy features:

- **Search**: the search box at the top matches action names or keys.
- **Look up by pressing a key**: press a key or a controller button and it lists the actions bound to it — the first thing to try when a key seems to do nothing.
- **Conflicts**: if the new key is already taken, you're told which action holds it and can **Replace** (move it to the current action), **Swap**, or **Keep both** (when both are live, scope order decides which one fires).
- **Controller layout**: besides the list view you can switch to a controller diagram showing what each button does; "Gamepad button style" picks Xbox, PlayStation or Nintendo Switch button labels.
- **Restore defaults**: per group, or "Restore all defaults". Actions you've changed are marked as customized.

On **macOS**, Ctrl in the default bindings becomes Cmd automatically, and a few keys that the system would swallow are replaced with free equivalents: audiobook play / pause is Option+Space, and window fullscreen is Ctrl+Cmd+F.

## Common default bindings (desktop)

### Reader (EPUB / light novels)

| Action | Keyboard | Gamepad |
|---|---|---|
| Next page | PageDown / → / ↓ / Space | RB, D-pad right |
| Previous page | PageUp / ← / ↑ / Shift+Space | LB, D-pad left |
| Show / hide controls | M | Y |
| Enter the lookup cursor / look up | Enter | A |
| Create a card from the popup | Ctrl+Enter | — |
| Open the settings menu | T | — |
| Open navigation (table of contents) | Ctrl+F | — |
| Open the illustration gallery | G | — |
| Open reading statistics | I | — |
| Open the audiobook panel | B | — |
| Pause / resume the reading timer | P | — |
| Toggle furigana | — | R3 (click the right stick) |

In vertical right-to-left books (the Japanese default), ← is the next page and → the previous one, matching the direction the book turns.

The lookup cursor is for when there's no mouse: press Enter or gamepad A to bring up the cursor, move it onto the word with the arrow keys, and confirm to look it up — no tapping needed. While the cursor is on the dictionary popup, `]` / `[` jump to the next / previous dictionary and `.` / `,` to the next / previous entry; on a gamepad these are RT / LT.

### Audiobook (listening inside the reader)

| Action | Keyboard | Gamepad |
|---|---|---|
| Play / pause | Ctrl+Space (Option+Space on macOS) | L3 (click the left stick) |
| Next sentence | Ctrl+→ | X |
| Previous sentence | Ctrl+← | B |

While an audiobook is active, a plain Space also switches from "turn page" to "play / pause", as in most players. Note that gamepad B then belongs to "previous sentence" instead of going back — to leave the book while listening, use Esc on the keyboard or the on-screen back button.

### Manga

| Action | Keyboard | Gamepad |
|---|---|---|
| Next / previous page | PageDown, →, ↓, Space / PageUp, ←, ↑ | RB, D-pad right / LB, D-pad left |
| Toggle the manga interface | M | Y |
| Pan (when zoomed) | Ctrl+arrow keys | — |

Left and right are corrected automatically for the manga's reading direction (right-to-left by default for Japanese manga).

### Video

The video page has a lot of bindings and mostly follows asbplayer's conventions: Space / P play-pause, ← / → seek, Ctrl+← / Ctrl+→ previous / next subtitle, R replay the current line, F fullscreen, L subtitle list, B subtitle blur, S screenshot. On a gamepad: A play-pause, X / Y previous / next line, LB / RB seek, D-pad up / down volume, RT fullscreen, Start opens the subtitle list, Select enters the subtitle word cursor, LT replays the current line. The full list is in [What are the video shortcuts?](/faq/video-shortcuts.en)

### Home and global

| Action | Keyboard | Gamepad |
|---|---|---|
| Back / exit one level | Esc / Alt+← | B |
| Bookshelf / Dictionary / Settings tab | Ctrl+1 / Ctrl+2 / Ctrl+3 | — |
| Previous / next tab | — | LT / RT |
| Focus search | Ctrl+F | Y |
| Scroll down / up one screen | PageDown / PageUp | RB / LB |
| Scroll down / up one line | ↓ / ↑ | — |
| Scroll to top / bottom | Home / End | — |
| Toggle fullscreen | F11 (Ctrl+Cmd+F on macOS) | — |

There is exactly one "Back / exit one level" action: in the reader and manga it closes the dictionary popup first if there is one, otherwise it leaves the book; in video it backs out step by step (subtitle list, side panel, fullscreen and so on first, the page last). Rebind it once and every page follows.

### Dictionary popup

| Action | Default |
|---|---|
| Next / previous entry | Alt+wheel down / Alt+wheel up; gamepad D-pad down / up |
| Create card (plus button) | Ctrl+Enter; gamepad X |
| Play word audio | Gamepad Y |

These work while the pointer is over the popup. The bare wheel is always reserved for scrolling the popup's content, so wheel bindings need a modifier key.

### Lookup outside the app (Windows / macOS)

Select text in any program and press the "App-external lookup shortcut" (Ctrl+Alt+D by default), and a lookup card appears next to the mouse; "Bring to front and open lookup page" defaults to Ctrl+Alt+F (on macOS Ctrl again becomes Cmd). Mouse triggers in this group accept side buttons only. On phones it's triggered by the system (text selection menu, share, floating ball) and can't be remapped. See [global lookup](/faq/global-lookup.en).

## Focus navigation: no mouse at all

**Settings → System and about → General → Keyboard & gamepad focus navigation**, off by default. When it's on:

- Arrow keys or the gamepad stick move the focus, and the selected control shows a focus ring;
- **Enter or gamepad A confirms** (presses buttons, flips switches); sliders and segmented controls are adjusted with the arrow keys;
- A plain Space never activates a button — confirming always goes through Enter / A, so you don't trigger things by accident while reading;
- Up / down inside a text field moves you out of it;
- Back is always Esc / Alt+← / gamepad B.

With focus navigation off, ↑ / ↓ still scroll the page and PageUp / PageDown still scroll a screen at a time; there's just no focus ring.

## Gamepad support by platform

- **Windows**: controllers are read through the system's GameInput component. If Keyboard shortcuts says "GameInput component not detected — gamepad support is unavailable", install Windows Gaming Services.
- **macOS / iOS**: uses the system controller framework; pair over Bluetooth and it works.
- **Android**: the system hands controller buttons to the app as key events; connect a Bluetooth or USB controller and it works.
- **Linux** (built from source): read from the system's input devices.

On phones and tablets the home-screen keyboard shortcuts are off by default (only gamepad bindings remain), but keyboard bindings in the reader, manga and video pages and for "Back / exit one level" stay active — attach a Bluetooth keyboard to turn pages and control playback.

## Common questions

- **A key does nothing**: use "Look up by pressing a key" to see which action owns it. A key triggers only one action on a given page; an earlier scope silently wins over a later one.
- **I bound Esc to another action and now can't leave the page**: page-specific keys take priority over "Back / exit one level", and this override doesn't raise a conflict warning. Change it back in Keyboard shortcuts, or restore the defaults.
- **Playing galgames**: for in-game lookup and mining see [galgame lookup and mining](/faq/galgame.en); for playing on your phone with touch or a controller see [game streaming](/faq/game-streaming.en).
