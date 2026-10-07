---
title: "Stream anime or download it? Which of the two should I pick?"
description: "Streaming: install a video source extension and press play. Downloading: find the work under Browse → Discover, hit \"Search resources\" and pick a release (or just ask the AI to download it); play while downloading, auto-match Jimaku Japanese subtitles, subscribe for new episodes. For mining, downloading wins."
category: "Downloads"
order: 90
date: 2026-10-07
lang: en
---

There are two ways to watch anime in Fushi, each with its own use:

| | Streaming (video source extensions) | Downloading |
|---|---|---|
| How | Install an Aniyomi video source extension, press play | Find the work → pick a release (BitTorrent) → download → added to the library |
| Subtitles | Whatever the stream carries, not necessarily Japanese | [Jimaku](https://jimaku.cc) Japanese subtitles matched automatically, episode by episode |
| Library / offline | Can be added to the library or downloaded | In the library, grouped by show, metadata scraped automatically |
| New episodes | Check by hand | Subscribe: new episodes download and shelve themselves |
| Best for | A quick look at something | Serious immersion + mining |

If you're learning Japanese and want to tap words and mine, **download first**: raw video + Jimaku subtitles is the smoothest combination for lookups and cards. Streaming is covered in [How do I stream anime through a video source?](/faq/anime-online.en); the rest is about downloading.

**Windows, macOS and Android; the iOS build has no search or download per App Store rules.**

## Finding the work

Bottom bar **Browse → Discover** (the video library's "Discover" tab works the same): search movies, series and anime, or pick from the popular picks, this season's anime or the airing calendar. On a work's page:

- **Search resources**: Fushi searches the resource indexes with the work's original title / aliases — Nyaa for anime, apibay / Knaben for movies and series, plus any Torznab indexers you add (see [the BitTorrent article](/faq/bittorrent.en)). Results are grouped into "versions" by release group and resolution; switch to "All releases" for the raw list.
- **Subscribe**: for a show still airing, follow new episodes from the release group and resolution you choose.
- **Search subtitles**: look for subtitles for this work on their own.
- **⋯ → Ask AI to download a work**: one sentence and the AI finds the work and picks a release — see [What is AI download?](/faq/ai-download.en).

When you fill in missing episodes of a collection already in your library, or go to download from "related works", the **Anime download** dialog opens: pick the work on AniList and the "Nyaa search terms" are filled in with its original title; results can be filtered by **Raw / English-translated / Non-English** (pick raw for Japanese), limited to **Trusted only**, and sorted by **Seeders / Published / Size**; season packs are marked "Batch".

If nothing turns up, it's usually the search terms — see [Can't find an anime?](/faq/search-tips.en).

## Download

Pick a release and download; the task joins the queue, with progress under **Browse → Downloads**. libtorrent is built in, no separate client needed; you can also connect qBittorrent and "Push download" to hand tasks over.

- **Play while downloading**: once a task starts it can be shelved and played from the video library.
- Finished downloads are added automatically, grouped by show / folder, with metadata matched.
- Uploading (seeding) is off by default; to give back to the swarm, turn on "Enable upload / seeding" in the download settings.
- Have a magnet link or torrent file? **Add task** at the top right of **Browse → Downloads** — paste the magnet link or "Choose torrent file"; on desktop you can also drag a `.torrent` file onto the window.
- With [Fushi interconnect](/faq/interconnect.en) set up, "Download on" can point at the interconnect host, so your computer or Fushi server downloads on the phone's behalf.

## Subtitles

Choose **Include subtitles** (or "Subtitles required") and Fushi matches the show's Japanese subtitles on Jimaku, pairing files with episodes once the download finishes; if the video already carries an embedded subtitle track, the timing is also corrected against it automatically. You need a Jimaku API key first under **Settings → Online services → Subtitle sources** (free on the Jimaku website). Episodes that didn't match can be filled in by hand.

With subtitles in place, tap words during playback to look them up and the plus to mine; the card carries the picture and audio of that line.

## Subscriptions

**Subscribe** from the work's page or the search results: "Ongoing" checks for new episodes periodically and queues, downloads and shelves them on a hit; "One-shot" only fetches the current batch. Per-episode status is under **Browse → Downloads → Subscriptions**.

Already have video files? No need to search — import them into the video library from a local folder or a remote source such as WebDAV.
