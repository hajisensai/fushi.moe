---
title: "Stream anime or download it? Which of the two should I pick?"
description: "Streaming: install a video source extension and press play. Downloading: search the title under the bottom-bar \"Downloads\" (Nyaa), grab a whole season, play while downloading, auto-match Jimaku Japanese subtitles, subscribe for new episodes. For mining, downloading wins."
category: "Downloads"
order: 90
date: 2026-09-20
lang: en
---

There are two ways to watch anime in Fushi, each with its own use:

| | Streaming (video source extensions) | Downloading (anime downloads) |
|---|---|---|
| How | Install an Aniyomi video source extension, press play | Search the title (Nyaa) → torrent download → auto-added to the library |
| Subtitles | Whatever the stream carries, not necessarily Japanese | [Jimaku](https://jimaku.cc) Japanese subtitles matched automatically, episode by episode |
| Offline / library | Not added to the library, no download yet | In the library, grouped by show, metadata scraped automatically |
| New episodes | Check by hand | Subscribe: new episodes download and shelve themselves |
| Best for | A quick look at something | Serious immersion + mining |

If you're learning Japanese and want to tap words and mine, **download first**: raw video + Jimaku subtitles is the smoothest combination for lookups and cards. Streaming is covered in [How do I stream anime through a video source?](/faq/anime-online.en); the rest is about downloading.

**Windows, macOS and Android; the iOS build has no search or download per App Store rules.**

## Search

Bottom bar **Downloads** → Anime downloads, type the title in the search box at the top (data from Nyaa). Results can be:

- filtered by **raw / English-subbed / non-English-subbed** — pick raw for Japanese;
- limited to **Trusted only**, i.e. trusted uploaders;
- sorted by **seeders / date / size**; season batches are marked "Batch".

If the site is unreachable, configure a network proxy in the download settings.

## Download

Press **Download** and the task enters the queue; libtorrent is built in, no separate client needed. If qBittorrent is installed you can also **Push download** to hand it over.

- **Play while downloading**: once a task starts it can be shelved and played from the video library.
- Finished downloads are added automatically, grouped by show / folder, with metadata matched.
- Uploading (seeding) is off by default; turn it on in settings to give back to the swarm.
- Have a magnet link? **Paste link to download**.

## Subtitles

Tick **With subtitles** when searching and Fushi matches the show's Japanese subtitles on Jimaku, pairing files with episodes once the download finishes. You need a Jimaku API key first under **Settings → Services** (free on the Jimaku website). Episodes that didn't match can be filled in by hand.

With subtitles in place, tap words during playback to look them up and the plus to mine; the card carries the screenshot and audio of that line.

## Subscriptions

**Subscribe** from the search results: "Follow" mode checks for new episodes periodically and queues, downloads and shelves them on a hit; "Once" only fetches the current batch. Per-episode status is on the subscriptions page.

Already have video files? No need to search — import them into the video library from a local folder or WebDAV.
