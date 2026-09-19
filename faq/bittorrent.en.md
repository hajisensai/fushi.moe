---
title: "What is BitTorrent, and how is it wired into Fushi?"
description: "BT is downloading without a central server — everyone fetching a file shares it with everyone else; the torrent / magnet link is the file's ID card, and more seeders means faster downloads. Fushi has a built-in libtorrent engine and can also drive an external qBittorrent; searches go through indexes like Nyaa, and finished downloads get subtitles, scraping and shelving automatically."
category: "Downloads"
order: 95
date: 2026-09-20
lang: en
---

## What BT is

A normal download is "one server sends, you receive". **BT** (BitTorrent) flips it: **there is no server — everyone currently downloading the file sends to everyone else.** Every piece you receive can be passed on immediately; you take a little from dozens of people and assemble the whole file.

A few terms:

- **Torrent (.torrent) / magnet link (magnet:)**: not the file itself but its "ID card" — filename, size, a checksum for every piece. With it you can find the people who hold the file. A magnet link squeezes that information into one line of text, easier to pass around than a .torrent file.
- **Seeding**: staying online after finishing and continuing to send. More **seeders** = faster; an old release with 0 seeders won't move.
- **Leeching / share ratio**: downloading without uploading is leeching; share ratio = uploaded ÷ downloaded. BT only lives on mutual uploading.
- **Tracker**: the "phone book" server that helps you find peers; **DHT** is the tracker-less way peers ask each other — with both on you find the most people.
- **Index site**: a website listing which torrents exist without storing the files. The biggest for anime is **Nyaa**; films and series have various public indexes; **Torznab** is a unified index API that tools like Jackett / Prowlarr translate hundreds of index sites into.
- **Port mapping (UPnP / NAT-PMP)**: lets the router forward incoming connections to you so others can connect to you directly; downloading works without it, just slower.

BT itself is only a transport protocol; what's transported is a separate matter — it's the same thing whether you fetch a Linux image or an anime episode.

## What Fushi integrates

You don't need a separate download client; the whole chain lives in the app:

| Link | In Fushi |
|---|---|
| Download engine | **Built-in libtorrent** (Windows / macOS / Android); or an **external qBittorrent** (via its WebUI) |
| Search sources | **Nyaa** (anime), **apibay**, **Knaben** (films and series), plus your own **Torznab indexers** (Jackett / Prowlarr) |
| Show identification | AniList for finding the show, AniDB to confirm identity; search terms filled from original titles / aliases |
| Subtitles | Tick "With subtitles" to match Japanese subtitles on **Jimaku**; OpenSubtitles is wired in too |
| Shelving | Download done → organise and rename → subtitles → [scrape](/faq/scraping.en) → video library, all automatic |
| New episodes | **Subscriptions**: checked every 15 minutes, new episodes download themselves |
| Audiobooks | Audiobook catalogue downloads use the same engine, paired with alignment files from the material library afterwards |
| Interconnect | Subscriptions and downloads can "run on the host" — handed to the PC or a NAS running fushi_server |

## How to use it

### Built-in engine: nothing to configure

Bottom bar **Downloads → Anime downloads**, search a title, press **Download** and it's queued. The first time you're asked whether to **enable uploading / seeding** — off by default; on, it uses your upload bandwidth but is kinder to the swarm.

- **Play while downloading**: once a task starts it can be shelved and opened from the video library.
- Have a magnet link or .torrent file? **Paste link to download** / **Choose torrent file**.
- Task details show peers, tracker status and seeding time.

Details of use (raw filter, Trusted only, batches, subscriptions): [Stream anime or download it?](/faq/anime-download.en)

### External qBittorrent

If you already have an always-on machine running qBittorrent (typical for a NAS), or your platform has no built-in engine (iOS):

**Settings → Downloads → Engine & seeding**, set the download engine to **External qBittorrent**, enter the **qBittorrent WebUI address** (e.g. `http://192.168.1.10:8080`), username and password, and optionally a **qBittorrent category** (Fushi's tasks are tagged with it so you can tell them apart in qB).

When qBittorrent runs on another machine, the paths it sees differ from this device's, so configure **qBittorrent path mappings**: map qB's download root (say `/downloads`) to a location this device can reach (`\\nas\downloads` or a mounted drive) so Fushi can find the files and shelve them when done.

Search results also offer **Push download** to hand a task to qB directly; the rest of the flow is identical.

### Engine & seeding settings

All under **Settings → Downloads → Engine & seeding**:

- **Uploading / seeding**: switch, upload limit, share-ratio limit, seeding-time limit — turn it on to give back; it stops by itself at the limit.
- **Rate limits**: download / upload in KB/s; by default they **don't apply on the LAN** (interconnect peers go full speed).
- **Listen port** (default 6881), **UPnP / NAT-PMP** port mapping, **DHT**, **Local peer discovery (LSD)**: the defaults are sensible; if you see few connections, check whether the router blocks the port.
- **Anti-leech**: bans clients that only download or fake their progress.
- **Tracker subscription**: give it a tracker-list URL and new tasks get those trackers added — helps old releases with few seeders.
- **Memory cap**, **max active downloads / seeds**: lower them on phones.
- **Proxy**: under Settings → Network proxy, P2P traffic goes **direct** by default; "via proxy" routes everything through the proxy (many providers ban BT), "mixed" sends only tracker requests through it while peers connect directly. Built-in engine only; an external qB is configured on its own side.

### Torznab indexers

If the built-in sources aren't enough (a private site, a niche index), go to **Settings → Services → Torznab indexers → Add indexer**: enter the endpoint and API key from Jackett / Prowlarr, optionally category IDs and a priority. Keys are never exported with backups and are synced to paired devices over interconnect (can be turned off).

If the built-in sources were disabled, searches say "No sources available for this search" — re-enable them under **Settings → Downloads → External resources & subtitle sources**.

## Common situations

- **Won't download / speed 0**: check seeders first — 0 means find another release; then whether the router blocks the listen port and whether UPnP is on; try enabling a tracker subscription.
- **Nothing found**: Nyaa is anime only; films and series are on apibay / Knaben; if the index site is unreachable, configure a proxy (the proxy only affects searches and trackers; peer connections are covered above).
- **Push to qBittorrent failed**: WebUI address, credentials, and whether qB has "Web user interface" enabled; without path mappings across machines the finished files can't be found.
- **Stopped seeding after renaming**: renaming / moving inside Fushi goes through the engine and keeps seeding; renaming in a file manager breaks it.
- **iOS**: no search or download per App Store rules.
- **"This install is missing the built-in engine runtime"**: an incomplete package — reinstall the full installer or switch to an external qB.
