---
title: "What is scraping, and how does Fushi's scraping work?"
description: "Scraping = working out which show a file is from its name, then pulling the poster, synopsis, rating and episode list from an online database. Video sources set to \"By series\" scrape automatically — MAL first, TMDB as fallback — and anything uncertain waits under \"Pending confirmation\" for you to pick; books, manga and games can scrape covers and details too."
category: "Video"
order: 85
date: 2026-09-20
lang: en
---

## What scraping is

You have a file on disk called

```
[VCB-Studio] Sousou no Frieren [01][Ma10p_1080p][x265_flac].mkv
```

To a computer that's just a string. **Scraping** is: first recognise from the filename that this is *Frieren: Beyond Journey's End*, episode 1, then fetch the show's **poster, synopsis, rating, season and episode lists and airing dates** from an online database and store them locally. Afterwards your video library turns from a pile of filenames into a wall of covers, and opening a show gives you every episode's title and thumbnail.

The term comes from media-library software like Jellyfin / Plex / Kodi (a "scraper" scrapes information off web pages); the databases are sites like [TMDB](https://www.themoviedb.org/), [MAL](https://myanimelist.net/), [AniDB](https://anidb.net/) and [Bangumi](https://bgm.tv/).

## What Fushi scrapes

| Type | Data source | What you get |
|---|---|---|
| **Video** (anime, series, films) | MAL (via Jikan) first, TMDB as fallback; optional AniDB file recognition | poster, synopsis, rating, season / episode lists, airing info |
| **Books, manga** | Bangumi | cover |
| **Games** (galgame) | VNDB, Bangumi | cover, synopsis, release date and more |

Video is where scraping matters most; the rest of this article is mainly about it.

## Video: automatic by default

Importing a local folder offers two ways of organising it:

- **By series** (default): recognise series and episodes from filenames, then match the show's data — **this scrapes**.
- **By folder**: one collection per top-level subfolder, organising only. For folders sorted by difficulty, course or topic.

With "By series", Fushi starts scraping as soon as the scan finishes (the source's "Scrape after scan" and the global "Auto-scrape item details" are both on by default); videos from anime downloads are scraped before they enter the library too (`download → organise → subtitles → scrape → library`). One more step follows: **Auto-fetch subtitles after scraping** grabs a subtitle from your configured online sources for videos that still have none.

Scraping works by **confidence**: only a **single exact hit** for the parsed title is applied automatically; several same-named candidates, or no hit on either side, and it doesn't guess — the item goes to **Pending confirmation** for you to decide. The video library shows a banner "N shows haven't had their identity confirmed" with a "Go confirm" button.

## Pending confirmation: pick the show yourself

The **Background tasks** panel on the video source page has three tabs: **Current tasks / Pending confirmation / Recent tasks**. Under "Pending confirmation", open a show:

- **By title**: results come with covers and years; selecting one binds it;
- **By ID**: choose MAL, TMDB film or TMDB TV, enter the ID, or simply paste the work's official page URL.

A wrongly scraped show can be fixed too: collection menu → **Re-scrape details and cover** → pick the right entry. A manual binding is protected — later automatic runs won't change it; covers you set yourself (a local image you chose, a poster that came with the folder) are never overwritten either.

## Naming files so they're recognised

Fushi's filename parser follows the Jellyfin / anitomy line: it strips fansub tags, quality and codec, and understands `S01E01`, `第2季`, `2nd Season`, `Season 2`. A reliable layout:

```
Anime/
  Sousou no Frieren/
    [VCB-Studio] Sousou no Frieren [01][Ma10p_1080p].mkv
    [VCB-Studio] Sousou no Frieren [02][Ma10p_1080p].mkv
  Hibike! Euphonium/
    Season 2/
      Hibike! Euphonium - 01.mkv
```

A few rules of thumb:

- **one folder per show**; the season number can live on the subfolder alone (`Season 2` / `S02` / `第2季`);
- **zero-pad episode numbers** (`01`, not `1`) — whether `Show 2.mkv` is season 2 or episode 2 is a coin toss, though for a batch like `Show 1 … Show 12` in one folder Fushi works out the episode numbers by comparing the siblings;
- **use the original or official English title** rather than a nickname you made up;
- if a filename won't parse and you don't want to rename, use **Identifier rules** (below) or turn on AniDB file recognition.

## Advanced settings

All under **Settings → Services → Metadata scraping** and each source's **Source scrape settings**:

- **Primary provider**: MAL by default; when the primary has no single hit the other is asked automatically. The metadata language (synopsis, TMDB poster language) can be set per source.
- **Identifier rules**: rewrite filenames before recognition, one rule per line — blocking is a plain regex; replacement `A => B`; episode offset `before <> after >> EP+1` (for example shifting a second season that numbers from 13 back to 1).
- **Recognise files via AniDB ED2K**: identify show and episode from the file's hash on AniDB — works however mangled the filename is. Needs your own AniDB account; AniDB's UDP login is unencrypted, so only enable it on a trusted network.
- **TMDB API key**: one is built in; enter your own only if scraping breaks or you want your own quota.
- **NFO and image write policy**: scraped data can be written as `.nfo` files and `poster.jpg` next to the videos — Jellyfin / Kodi read the same format. Default "Write only when missing"; third-party files and ones you edited are protected and never overwritten.
- **Locked fields**: lock title, cover and other fields in the work's details so a re-scrape keeps your values.
- **Clear all scrape records**: wipes details, bindings and the NFO / covers Fushi generated; video files, watch progress and subtitles stay.

## Books, manga, games

- **Books / manga**: **Match cover online** in the edit dialog searches Bangumi by title / author; pick one to use it.
- **Games**: **Scrape metadata** from the card menu searches VNDB / Bangumi by the current name as soon as it opens; candidates show covers, and "Use" writes cover and synopsis together.
- **Scrape all** in the library menu runs in bulk: videos are scored on title, year and more; books and games require a unique, exact title match to apply automatically; the rest go to pending confirmation.

## With interconnect

When a phone watches remote videos from a PC host, the host's scraped data is authoritative and syncs to the phone automatically; for a show that wasn't scraped yet, the phone can choose **Scrape on host** or **Scrape locally and write back to host**. See [Fushi interconnect](/faq/interconnect.en).

## Common situations

- **Wrong show recognised**: pick it manually under pending confirmation / re-scrape; for a filename that keeps failing, add an identifier rule.
- **One show split into several**: usually inconsistent season / episode notation in the filenames (`S02E01` here, `- 13` there) — unify them or use the episode offset rule.
- **Poster in the wrong language**: change the source's "Metadata language".
- **Search fails / rate limited**: MAL via Jikan is rate limited, so bulk scraping being a bit slow is normal; if it can't connect, configure a proxy in settings.
- **Scraping vs. "Bangumi sync"**: scraping pulls data in; Bangumi sync pushes your watching / reading progress to your Bangumi account.
