---
title: "How do I play anime from a Jellyfin / Emby server in Fushi?"
description: "Settings → Services → Media server: enter the server address, sign in with username and password, tick the libraries you want. The server's videos show up in Fushi's video library, stream directly, subtitle tracks stay tappable for lookups and mining, and progress syncs both ways."
category: "Video"
order: 82
date: 2026-09-20
lang: en
---

If you run Jellyfin or Emby at home there's no need to copy anime into Fushi again: sign in once and the server's videos play right inside Fushi — tap words, mine cards, as usual. Jellyfin and Emby share one API, so the steps below apply to both. (Not sure what they are? Start with [What are Jellyfin, Emby and Plex?](/faq/media-servers.en).)

## Before you start

- The server is installed, has scanned its libraries, and you can see your anime in its own web UI or app.
- You know the server address: on a LAN typically `http://192.168.x.x:8096` (Jellyfin and Emby both default to port 8096; Jellyfin with HTTPS on is 8920; behind a reverse proxy it's your own domain).
- An account on the server (username + password). Emby users who sign in through Emby Connect need a local password set on the server for that user.

## Step 1: sign in

**Settings → Services → Media server (Jellyfin / Emby)**

1. Enter the address above as **Server address**.
2. Enter **username** and **password**, press **Sign in**. On success the block shows the server name and account, and two more settings appear below.

The sign-in token is stored on this device; **Sign out** deletes it along with all cached listings for that server.

## Step 2: choose the libraries

After signing in, expand **Libraries to list**: a checklist of the server's video libraries (Movies / Shows / Anime and the like; music, book and photo libraries don't appear).

- Nothing ticked = list every video library; small servers can leave it at that;
- on a very large server (tens of thousands of items, or a public one) **tick only the one or two libraries you actually watch** — Fushi lists items by paging through the server's index, and enumerating a whole server is slow and can trip the server's abuse detection.

**Auto-list items when opening the video page** is on by default: opening the video library fetches the listing. On huge servers turn it off and list only when you **pull to refresh** in the video library.

## Step 3: watch

Back in the video library, the server's shows sit next to your local ones, with a cloud badge on the card (placeholder cards, like interconnect's remote entries; they disappear if **Show remote entries** in the Sync settings is off). Tap one:

- **Direct streaming**: no transcoding — the server sends the original file and Fushi's own player decodes it, so HEVC / 10-bit / mkv are all fine;
- **Subtitles**: the server's text subtitles for that video (external `.srt` / `.ass`, or text tracks inside the mkv) are fetched automatically and loaded as external subtitles — **tappable and mineable**; PGS-style graphic tracks carry no text, see [external, embedded and burned-in subtitles](/faq/subtitle-types.en). No Japanese subtitle on the server? Import one by hand or let Jimaku match it, just like a local video.
- **Progress syncs both ways**: wherever you stop is recorded on the server (reported every 10 seconds, like Jellyfin's web client), and Fushi also reads the server's resume position — half an episode on the phone's Jellyfin app, then Fushi picks up right there, and vice versa.
- **Download to this device**: for offline viewing or clip export, the card menu downloads the whole file; clip export only works on local files.

## Common situations

- **Sign-in fails**: first open the same address in the phone's / PC's browser to confirm it loads; include the port; write `https://` behind a reverse proxy with HTTPS; the username and password are the server account, not an Emby Connect / Plex-style cloud account.
- **The list is empty**: the ticked libraries aren't video libraries (in Jellyfin the library type must be Movies / Shows / Mixed content), or "Auto-list" is off — pull to refresh.
- **Only part of the library shows**: servers with hundreds of thousands of items hit the paging circuit breaker and Fushi tells you the listing is partial; tick fewer libraries.
- **Changed libraries on the server / the selection didn't take**: Fushi clears the cache and re-lists after changing the selection; if it's still stale, sign out and back in.
- **Plex**: not supported. Share the files over WebDAV to Fushi (add a WebDAV remote library among the video sources), or run a Jellyfin next to it pointed at the same folder.
- **Don't want a server at all**: the Fushi on your PC can be the host itself, see [Fushi interconnect](/faq/interconnect.en).
