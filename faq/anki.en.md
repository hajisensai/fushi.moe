---
title: "How do I connect Anki?"
description: "Desktop Anki + AnkiConnect; AnkiDroid on Android; AnkiMobile on iOS. Cards wait in a queue while Anki is closed, and you can even sync straight to an Anki server without installing Anki."
category: "Anki & mining"
order: 57
date: 2026-10-07
lang: en
---

- **Windows / macOS**: install Anki, then the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on (with Anki running, "Install AnkiConnect" in Fushi's card creation settings downloads it and hands it to Anki — confirm and restart when Anki asks), and keep Anki open while mining — or turn on "Launch Anki when Fushi starts" in the card creation settings so you don't have to.
- **Android**: install AnkiDroid.
- **iOS**: install AnkiMobile.

Once connected in the onboarding wizard or under **Settings → Card creation**, "Create and use Lapis" sets up a deck with the built-in Lapis note type in one tap.

From then on, whenever you look a word up while watching, reading or gaming, the plus next to the definition makes a card carrying the original sentence, a screenshot / video clip and the original audio.

Video clip cards need a note type that can play video: if you use your own template (Kiku and the like) rather than the Lapis deck Fushi creates, press "Enable / update" under "Video playback adaptation" in **Settings → Card creation** to adapt it (a backup is made first and the original template can be restored); note types that aren't adapted fall back to GIF + audio.

## What if Anki is closed or unreachable?

Cards made while Anki can't be reached are not lost: they go into the device's **Pending cards** and are sent automatically the next time Anki is reachable; you can also hit "Send all" under **Settings → Card creation → Pending cards**. To collect a batch and send it in one go, turn on "Batch mining".

Two more ways to mine on a device without Anki:

- **Hand cards to another device**: once your phone is paired through [Fushi interconnect](/faq/interconnect.en), turn on "Mine to Fushi Interconnect server" and cards go into your computer's Anki; while the computer is off they wait on the phone and are delivered once it's reachable. With cloud sync, you can instead turn on "Deliver cards from other devices" on the device that has Anki.
- **Sync straight to an Anki server**: **Settings → Card creation → Anki sync (no Anki needed)** — turn on "Sync cards straight to Anki", enter your self-hosted sync server and account, then "Sign in and download collection". Leaving the server empty means AnkiWeb — but AnkiWeb's terms only allow official clients to sync; Fushi identifies itself honestly, so AnkiWeb may refuse the connection or act against your account. A self-hosted sync server has no such restriction.
