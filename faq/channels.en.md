---
title: "Stable vs. debug builds: which one gets the newest features?"
description: "Stable ships every few weeks and is tested; debug is built automatically after every merge, gets new features first (video source extensions, for example) and occasionally has bugs. Switch channels on the download page. Want the newest stuff and don't mind reporting a bug? Use debug."
category: "Setup"
order: 42
date: 2026-09-20
lang: en
---

The [download page](/download) has two **channels**:

| | Stable | Debug |
|---|---|---|
| Cadence | A batch of changes every few weeks | Built automatically after every merge, almost daily |
| New features | Wait for the next stable | **Land here first** — video source extensions and interconnect scrape sync both showed up in debug first |
| Stability | Went through a round of testing | You may hit a bug that was introduced yesterday |
| For whom | People who just want to watch anime in peace | People who want new things right away and will mention problems on Discord / QQ |

## Switching

Switch the channel to "Debug" at the top of the download page and install the package for your platform; debug builds are produced after every merge and carry `debug` in the version number. Export a backup first (**Settings → Sync & backup**) — normally your data carries over, but a debug build may already use a data format the stable build doesn't know yet, so if you ever go back to stable, the backup is your safety net.

## Tips for debug users

- When the FAQ says a feature is "debug only", it means it hasn't reached stable yet; the next stable release picks it up automatically.
- Hit a problem? Check whether you're on today's build first — debug bugs are usually fixed the next day, so update and retry.
- When reporting, include the version (Settings → About) and steps to reproduce; where to report is in [feedback](/faq/feedback.en).
- Backups never hurt: export one in Settings → Sync & backup, or turn on cloud backup / [interconnect backup](/faq/interconnect.en).
