---
title: "How do I stream anime through a video source?"
description: "With an Aniyomi video source extension installed: find the show → pick an episode → pick a stream → it plays in the built-in player, auto-continues, and any subtitle track the stream carries loads as an external subtitle — with Japanese subtitles you can tap words and mine. Currently browse-and-play only, nothing is added to the library; for offline files and Jimaku subtitles use anime downloads."
category: "Video"
order: 80
date: 2026-09-20
lang: en
---

You need at least one video source extension installed first (see [What are Mihon / Aniyomi extensions?](/faq/mihon.en); video source extensions are currently only in the "debug" channel).

## Find → episode → stream → play

Open a video source: Popular / Latest / Search, as with manga. A series page shows details plus the **episode** list; tap an episode:

- one playable stream and it goes straight into the built-in player; several (different qualities / hosters) and **Choose stream** pops up — pick once and it's remembered for that episode;
- the next episode plays automatically at the end; playback position, subtitle position and sync offset are remembered per episode;
- "Open on website" at the top right jumps to the source site.

## Where subtitles come from

If the stream carries a subtitle track (mostly WebVTT in the Aniyomi ecosystem) it loads as an external subtitle — **only Japanese subtitles let you tap words and mine**; which language you get depends on the site. When the site only offers English / Chinese subtitles, import a Japanese subtitle by hand like for a local video ([Jimaku](https://jimaku.cc) has most shows) and [adjust the timing](/faq/subtitle-sync.en) if it's off.

## How it differs from downloading

Online video is currently **browse-and-play, not added to the library**: favourites and full downloads are for later versions. For offline viewing, automatic Jimaku Japanese subtitles and subscriptions, use [anime downloads](/faq/anime-download.en).

## Common situations

- **No playable stream for this episode**: none of the site's streams for that episode could be resolved — try another stream, another source, or "Open on website" to see whether the site itself is still alive.
- **Poor quality / stuttering**: switch streams under "Choose stream" if there are several; with a single stream you get what the site gives.
- **Site verification / nothing found**: see [the extensions article's common situations](/faq/mihon.en#common-situations).
