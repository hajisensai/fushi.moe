---
title: "What are Jellyfin, Emby and Plex, and how do they relate to Fushi?"
description: "They are \"media servers\": installed on a NAS or an always-on PC, they organise the videos on your drives into a library with posters that phones, TVs and other computers can stream. Fushi can act as a Jellyfin / Emby client, and has its own take on this (interconnect)."
category: "Subtitles & video basics"
order: 250
date: 2026-09-20
lang: en
---

## What a media server is

Once you've collected enough anime you hit a problem: the files sit on the study PC (or a NAS), and you want to watch on the living-room TV, the phone in bed, the laptop at work — copying them around every time.

A **media server** solves that: a program running on the machine that holds the files, doing three things —

1. **scanning** your video folders, recognising shows from filenames, [scraping](/faq/scraping.en) posters, synopses and episode lists from the web and arranging it all into a wall of covers;
2. **serving** it: other devices connect over the network, browse the wall, tap a show and it plays — no copying, it streams as it plays;
3. **remembering progress per device** — half an episode on the phone, pick it up on the TV.

The machine running the server is the **server side**; the devices that connect are **clients** — the project's own apps, a web page, a TV box, or Fushi.

## The three names

| | Jellyfin | Emby | Plex |
|---|---|---|---|
| Price | Completely free, open source | Basics free, premium features need Emby Premiere | Basics free, many features need Plex Pass |
| Accounts | Local accounts only, never phones home | Local accounts + optional Emby Connect | Requires a Plex account, sign-in goes through Plex's servers |
| Client coverage | All major platforms, plenty of third-party clients | All major platforms | Widest, best TV / set-top support |
| Anime / fansub releases | Via plugins (AniDB / AniList) and community scrapers | Has anime plugins | Not friendly to fansub naming |
| Default port | 8096 | 8096 | 32400 |

**Jellyfin** forked from Emby's open-source code in 2018, after which Emby went closed-source. Their APIs remain largely compatible to this day, which is why many clients (Fushi included) support both with one codebase. **Plex** is a separate line — more commercial and more hands-off, but accounts and some features depend on Plex's own services and the API differs.

For watching anime to learn Japanese, **Jellyfin** is usually the best fit: free, no account, good subtitle-track and external-subtitle handling, and plenty of anime scraping plugins.

## Terms you'll run into

- **NAS**: network-attached storage — essentially a small always-on computer full of drives (Synology, QNAP, self-built). The usual home for a media server.
- **Direct play vs. transcoding**: if the client can decode the file, the server just streams it as-is (direct play) at almost no CPU cost; if the client can't (a TV that doesn't do HEVC 10-bit), the server re-encodes in real time into something it can, which is heavy on CPU / GPU. Fushi uses libmpv, decodes everything, and always direct-plays.
- **Scraper / metadata**: the part that recognises shows and fetches posters, see [what scraping is](/faq/scraping.en).
- **SMB / WebDAV / SFTP**: not media servers but **network file-sharing** protocols — they expose a folder with no poster wall or progress, but they're simple. Servers like Jellyfin often read their files from an SMB share themselves; on Fushi's side, WebDAV (video, books) and SFTP / FTP (books) are supported.
- **OPDS**: the equivalent standard for books. Library servers like Calibre-Web, Komga and Kavita publish their catalogue over OPDS and readers connect to download.
- **DLNA**: an older LAN casting protocol supported by TVs and speakers; few features, mostly kept for compatibility.

## How this relates to Fushi

Fushi isn't a media server; it's a player plus learning tool — **tapping words in subtitles to look them up and mine** is the core. But it can take video from all of these:

- **Jellyfin / Emby**: sign in to your server inside Fushi and its videos appear straight in Fushi's video library, stream on tap, subtitle tracks stay tappable, progress syncs both ways. Setup: [How do I play anime from a Jellyfin / Emby server in Fushi?](/faq/jellyfin-setup.en)
- **WebDAV**: add a WebDAV remote library among the video sources and stream in place; books can also be read from an SFTP / FTP / WebDAV remote shelf.
- **OPDS**: add Calibre-Web, Komga or Kavita servers on the Discover page to browse and download books and manga.
- **Fushi interconnect**: no server at all — the Fushi on your PC becomes the "host" with one switch, and the Fushi on your phone connects to it to watch the PC's anime, books and manga and to use its dictionaries and Anki. See [Fushi interconnect](/faq/interconnect.en).

Plex isn't supported for now; Plex users can share the same files over WebDAV as a Fushi remote library, or run a Jellyfin alongside (both can point at the same folder without interfering).
