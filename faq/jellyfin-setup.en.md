---
title: "How do I play anime from a Jellyfin / Emby / Plex server in Fushi?"
description: "Settings → Online services → Jellyfin · Emby (or Plex): enter the server address and sign in. Then browse the server's own folders in the video library's \"Media servers\" section; videos stream directly, subtitle tracks stay tappable for lookups and mining, and Jellyfin / Emby progress syncs both ways."
category: "Video"
order: 82
date: 2026-10-07
lang: en
---

If you run Jellyfin, Emby or Plex at home there's no need to copy anime into Fushi again: sign in once and the server's videos play right inside Fushi — tap words, mine cards, as usual. Jellyfin and Emby share one API, so the steps below apply to both; Plex is at the end. (Not sure what they are? Start with [What are Jellyfin, Emby and Plex?](/faq/media-servers.en).)

## Before you start

- The server is installed, has scanned its libraries, and you can see your anime in its own web UI or app.
- You know the server address: on a LAN typically `http://192.168.x.x:8096` (Jellyfin and Emby both default to port 8096; Jellyfin with HTTPS on is 8920; behind a reverse proxy it's your own domain). On phones use the IP address — Android and iOS can't resolve `.local` names or Windows computer names.
- An account on the server (username + password). Emby users who sign in through Emby Connect need a local password set on the server for that user.

## Step 1: sign in

**Settings → Online services → Jellyfin · Emby**

1. **Add a server** and enter the address above as the **Server URL**. Watch out for full-width colons and dots if you type with a CJK input method.
2. Enter username and password and press **Sign in**. On success it appears under "Signed-in servers". You can sign in to several servers.

The sign-in token is stored on the device; **Sign out** deletes it together with that server's cache.

If one server has several addresses (LAN, public, reverse proxy), add them under its **Routes** with "Add route" and switch any time; the sign-in works on every route.

## Step 2: browse in the "Media servers" section

The video library has a **Media servers** section at the top: server → library → show → season → episode, browsing the server's own folder tree, plus "Search this server". Tap an episode:

- **Direct streaming**: no transcoding; the server streams the original file and Fushi's own player decodes it, so HEVC / 10-bit / mkv are all fine;
- **Subtitles**: the server's text subtitles for that video (external `.srt` / `.ass`, or text tracks inside the mkv) are fetched automatically and loaded as external subtitles — **tappable and mineable**; PGS-style graphic tracks carry no text and need OCR, see [external, embedded and burned-in subtitles](/faq/subtitle-types.en). No Japanese subtitle on the server? Import one by hand or let Jimaku match it, just like a local video.
- **Two-way progress sync**: the server records where you are (every 10 seconds, like the Jellyfin web client), and Fushi reads the server's resume point — stop halfway in the Jellyfin phone app and Fushi picks up there, and vice versa.
- **Download to this device**: to watch offline or to export clips, download the whole file from the card menu; clip export only works on local files.
- Mining from a stream is slower; "Settings → Card creation → Online video mining" lets you mine in the background or after watching, see [the streaming article](/faq/anime-online.en#mining-from-online-video).

## Mixing them with local videos

By default media-server items only live in the "Media servers" section. To have them appear alongside local videos on the home, series and all-videos views, turn on **Show in video library** in the server's settings, then adjust two options if needed:

- **Libraries to list**: none ticked = all video libraries. On a big server (tens of thousands of items, or a public one) **tick only the one or two libraries you actually watch** — mixing in means paging through the server's listing, and enumerating a whole server is slow and can look like abuse to the server.
- **Auto-list items on entering Video**: on very large servers turn it off and list only when you **pull to refresh** in the video library.

## Plex

**Settings → Online services → Plex**: **Sign in with Plex** (authorise Fushi in the browser; reachable servers on the account are added automatically), or **Connect manually** with the server address and an X-Plex-Token. Then browse it in the same "Media servers" section; playback streams the original file directly without Plex transcoding.

## Common situations

- **Sign-in fails**: first open the same address in a phone / desktop browser to make sure it loads; include the port; behind a reverse proxy with HTTPS use `https://`; for Jellyfin / Emby the username and password are the server account, not a cloud account like Emby Connect.
- **The list is empty**: the library isn't a video type (in Jellyfin the library type must be Movies / Shows / Mixed content); in mixed mode "auto-list" may also be off — pull to refresh.
- **Mixed mode lists only part of the server**: servers with hundreds of thousands of items trip the paging circuit breaker, and Fushi tells you the list is incomplete; tick fewer libraries, or just browse in the "Media servers" section.
- **The server rejects the app**: some servers only allow specific clients; ask the server's administrator.
- **Don't want to run a server at all**: Fushi on your computer can be the host itself, see [Fushi interconnect](/faq/interconnect.en).
