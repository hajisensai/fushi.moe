---
title: "How do I stream anime through a video source?"
description: "With an Aniyomi video source extension installed: find the show under Browse → tap an episode and it plays in the built-in player, auto-continuing; any subtitle track the stream carries loads as an external subtitle, and with Japanese subtitles you can tap words and mine. You can also add shows to your library or download them."
category: "Video"
order: 80
date: 2026-10-07
lang: en
---

You need at least one video source extension installed first (see [What are Mihon / Aniyomi extensions?](/faq/mihon.en)). Available on Windows, macOS and Android; per App Store rules the iOS build has no online video sources.

## Find → tap an episode → play

Go to **Browse → Sources** (the video library's "Sources" tab works the same), pick "Video" and open a source: Popular / Latest / Search. A series page shows details plus the **episode** list; tap an episode and it goes straight into the built-in player:

- it uses the stream the extension ranks first (set quality / language preferences in the extension's own source preferences); to switch, pick another stream in the player's **Quality** menu — your choice is remembered for that episode;
- the next episode plays automatically at the end; playback position, subtitle position and sync offset are remembered per episode;
- "Open on website" jumps to the source site.

## Where subtitles come from

If the stream carries a subtitle track (mostly WebVTT in the Aniyomi ecosystem) it loads as an external subtitle — **only Japanese subtitles let you tap words and mine**; which language you get depends on the site. When the site only offers English / Chinese subtitles, import a Japanese subtitle by hand like for a local video ([Jimaku](https://jimaku.cc) has most shows) and [adjust the timing](/faq/subtitle-sync.en) if it's off.

## Adding to the library, downloading

The series page also has:

- **Add to video library**: every episode becomes an online entry in your video library, grouped into one collection per show, so you can resume straight from the library; tapping it again only adds new episodes. "Remove from video library" removes only the online entries — downloaded episodes stay.
- **Download this episode / Download all**: saves the video locally, with progress under **Browse → Downloads**; afterwards tapping that episode plays the local file — offline, and clip export works too.

## Mining from online video

Mining from a stream has to fetch audio and frames on the spot, which is slower than with local files. "Online video mining" under **Settings → Card creation** has three modes:

- **In the background** (default): the plus shows "added" at once, the video keeps playing, and the card is prepared and written to Anki in the background;
- **After watching**: cards wait in a "Cards to add" list and are written to Anki together when you leave the player or hit "Add all to Anki" — you can delete mis-taps first;
- **Wait for the card**: returns only once the card is in Anki, keeping "edit latest card" available.

## How it differs from anime downloads

Online sources win on instant playback; for automatic Jimaku Japanese subtitles, per-episode subscriptions and choosing the release yourself, use [anime downloads](/faq/anime-download.en).

## Common situations

- **No playable stream for this episode**: none of the site's streams for that episode could be resolved — try another stream, another source, or "Open on website" to see whether the site itself is still alive.
- **Poor quality / stuttering**: switch streams in the "Quality" menu; with a single stream you get what the site gives.
- **The video source extension is not installed or disabled**: online entries in your library depend on the original extension — reinstall or enable it under "Browse → Extensions".
- **Site verification / nothing found**: see [the extensions article's common situations](/faq/mihon.en#common-situations).
