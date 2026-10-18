---
title: "Can I play the galgames on my PC from a phone or iPad, and look up words and mine cards while I play?"
description: "Yes, with Fushi's game streaming (experimental): the game and the text hook stay on the Windows PC, while picture, sound and dialogue stream to a paired phone or tablet. Tap the dialogue to look words up (using the PC's dictionaries) and mine cards (the PC writes them into its own Anki); touch and gamepad input goes back to the game, and you can even launch PC games remotely from the phone."
category: "Games"
order: 87.5
date: 2026-10-18
lang: en
---

Galgame text hooking only works on Windows (see [How do I hook a galgame into Fushi?](/faq/galgame.en)), but plenty of people would rather play lying down with a phone or an iPad. Fushi's **game streaming** is built for exactly that: the game keeps running on the PC and the hook keeps capturing dialogue on the PC, while Fushi pushes the game window's picture and sound, together with the hooked dialogue, to another device. There you watch, listen, tap words to look them up and mine cards, and your touch and gamepad input is sent back to the game on the PC.

The feature is currently **experimental**: audio/video, dialogue sync and lookup have been run on real games with Android devices, but end-to-end checks of input actually taking effect, remote launch and real card writing aren't all done yet. Problem reports are welcome via [feedback](/faq/feedback.en).

## How does it work, and which side does what?

Knowing the split saves a lot of confusion:

- **The Windows PC (host)**: runs the game, injects the hook, captures the game window's picture and the game's sound, holds the dictionaries, is connected to Anki — and makes the cards;
- **The phone / tablet (receiver)**: only shows the picture, plays the sound, shows the dialogue and sends input. The receiver **doesn't need any dictionaries installed** — the word you tap is sent to the PC, looked up with the PC's dictionaries, and the result is sent back;
- **The connection**: the two devices are paired with [Fushi interconnect](/faq/interconnect.en), negotiate over an encrypted connection, and then stream audio and video directly over the **local network**. Streaming across the internet isn't supported at the moment (there's no relay server), so the phone and the PC have to be on the same LAN.

What's streamed is **that one game window**, not the whole desktop: the stream carries on when other windows cover the game (minimising it stops the stream). One stream serves one receiving device at a time.

## Which devices can be receivers?

The Games module comes in two forms depending on the platform:

- **Windows**: the local game library plus the text-hook workspace; the game page also has a **Stream** section, so a Windows PC can act as a receiver for another Windows PC;
- **Android, iOS / iPadOS, macOS** (and a Linux build compiled from source): the Games module is the streaming client, subtitled "Launch games on your PC and stream them here".

So the host is always a Windows PC, while the receiver can be a phone, a tablet or a Mac. The iOS build lacks a few online features for App Store compliance (see [What's missing from the iOS version?](/faq/ios-limits.en)), but the game streaming client is kept.

## How do I connect the first time?

1. **Pair**: pair the phone and the PC as described in [Fushi interconnect](/faq/interconnect.en). If the receiver's game page says there's no paired Windows host yet, press **Open Interconnect settings** to do it.
2. **Turn on encryption on the host**: in the interconnect settings on Windows, turn on **Interconnect encryption (HTTPS/TLS)**. Without it the receiver tells you the host has HTTPS turned off.
3. **Keep the Games module on on the host**: the Windows side needs the "Games" module enabled; otherwise the receiver reports that the host has no game library.
4. **Start streaming on the PC**: **Launch and capture** a game as usual (you can only stream once the hook is connected — otherwise you're told to start a game with an active Hook session first), then press **Start streaming** in the capture workspace; the status changes to "Streaming is enabled. Waiting for a paired device."
5. **Join on the phone**: open the receiver's **Games** page. It lists each host ("Online · N games") and the sessions that are **Streaming now** — press **Join**.

There's also a "Join game stream" entry in Fushi's interconnect settings.

## Launching PC games straight from the phone

If you don't want to walk over to the PC and press "Launch and capture" each time, turn on **Allow remote launch** in the interconnect settings on Windows (off by default): paired devices can then pick a game from the host's library and launch and stream it directly. The phone shows "Starting the game…", "Waiting for the game window…" and "Connecting to the stream…" in turn.

A few common messages:

- "Remote launch is off on this host": turn on the switch above on the PC; even without it you can still join streams started on the PC;
- "The host is already running another game": only one game runs at a time — close it on the PC, or just join its stream;
- "The host is missing its capture helper": Fushi on the PC needs reinstalling or updating;
- "The game started, but its window did not appear in time": games with a launcher, an update prompt or a slow load do this; go and take a look at the PC.

A remotely launched session is reserved for the device that launched it.

## How do I play, look up and mine on the phone?

- **Dialogue**: next to the picture is the **Current line** panel — a side rail in landscape, a bottom panel in portrait. You can drag to resize it, or collapse it with "Show or hide dictionary" to see only the picture.
- **Lookup**: tap a character in the line and the text from that point is handed to the PC's dictionaries; the popup is the same one used for video subtitles. With a keyboard attached you can also move the cursor through the line and press Enter to look up.
- **Mining**: press the plus in the lookup result and the card is made by **the PC** and written into **the PC's Anki** — you'll see "Card created on the host". The card uses the screenshot taken for that line and that line's voice (if it has one); with no matching voice the card is written without sentence audio, never with the voice of another line. If the line went by long ago, you're told it has expired on the host and to look up the current line.
- **Touch**: there are two modes, switched from the menu — **direct touch** (where you touch is where you click in the game; a two-finger tap is a right click, a two-finger drag scrolls) and **trackpad** (move the cursor like on a laptop trackpad, tap to left-click).
- **Gamepad**: an on-screen gamepad can be shown ("Show or hide controls"), and **Configure controls** lets you remap buttons for this streaming session only; physical gamepads and hardware keyboards work too, and there's a soft keyboard. Some games don't accept touch clicks, in which case you're told to use the pad buttons.
- **Sound**: mute or play the game audio at any time.

## Choppy picture or unresponsive input — what can I tune?

**Stream settings** (with a "Recommended" button to reset everything) let you adjust:

- **Resolution limit**: 360p to 4K, default 1080p, never upscaled beyond the size of the game window on the host;
- **Frame rate**: 30 / 60 / 90 / 120, default 60; galgame screens are mostly static, so 30 is usually fine;
- **Bitrate**: 0.5–150 Mbps, default 20 Mbps; **Adaptive bitrate** is on by default and starts at half the bitrate and ramps up;
- **When bandwidth is short**: Balanced / Keep frame rate / Keep resolution, default Keep resolution — for text-heavy games keeping resolution keeps the text sharp;
- **Video codec**: Auto / H.264 / VP8 / VP9 / AV1, applied from the next connection and falling back automatically if the device can't decode it;
- **Game window input**: default **Window only** (the game can stay in the background and input goes straight to its window); some engines ignore input while in the background, so if touch does nothing switch to **Bring to front**.

Turn on "Show performance stats" to see the actual resolution, frame rate, bitrate, packet loss and dropped frames. When you see "Input was not delivered", look at the reason that follows: the game window is minimised or hidden, or it needs to be brought to the front. The stream stops automatically when the window is minimised on the PC, the game closes, the hook session ends, or no receiver has been active for 10 minutes.

Don't have Fushi yet? Both the Windows host and the phone apps are on the [download page](/download). If you'd rather have the lookup card pop up right on the game screen on the PC, see [Which engines does Fushi's galgame text hook support?](/faq/galgame-engines.en).
