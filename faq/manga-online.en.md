---
title: "How do I read manga online and OCR the text for mining?"
description: "With a manga source extension installed: find the manga under Browse → tap a chapter to read it online, or add it to your shelf and download chapters → on-device OCR reads the speech bubbles → tap text to look up and mine. Don't want to bother with extensions? The built-in Mokuro catalog already comes with OCR data."
category: "Manga"
order: 70
date: 2026-10-07
lang: en
---

You need at least one manga source extension installed first (see [What are Mihon / Aniyomi extensions?](/faq/mihon.en)). Available on Windows, macOS and Android; per App Store rules the iOS build has no online manga sources.

## Find → read online or add to shelf

Go to **Browse → Sources** (the manga library's "Sources" tab works the same), pick "Manga" and open a source: it has **Popular / Latest / Search**; the "Discover" page also lists popular, top-rated and trending series and matches them against your enabled sources.

Open a series and **tap a chapter to read it online** — no download needed first. For series you follow, **Add to manga shelf**: it then sits on the shelf like local manga, with the chapter list following the source site.

## Downloading chapters

To read offline, or to have whole chapters recognised, download them: "Download" next to a chapter, or "Download all"; with "Auto-download new chapters" on, new chapters are fetched as the site publishes them. Progress is under **Browse → Downloads**.

## Recognising the text (OCR)

Manga pages are images, so the text in the bubbles has to be recognised before you can tap it. Recognition runs on-device; the first time, press "Download models" in the **Manga OCR** settings (if the download won't go through, "import local models" is there too).

- **Downloaded chapters**: press **Recognize this chapter**, or "Recognize all downloaded"; with "Recognize after download" ticked, chapters are recognised as soon as they finish downloading.
- **Recognise as you read**: set the reader's "OCR trigger" to **On open** and opening a volume or chapter starts recognition in the background from the current page, with progress in the top-right corner. Chapters read online are recognised page by page from where you are too — the results just aren't kept; download the chapter for a full-volume pass.
- **Other engines**: under "Default OCR engine" you can also pick the device's own OCR (no model to download, but clearly worse on vertical bubbles and handwriting; on iOS / macOS Apple Vision handles vertical text), or Google Lens (online — page images are uploaded to Google); with a [Fushi interconnect](/faq/interconnect.en) host set up, you can hand the work to the paired Fushi interconnect server, so the phone downloads no model at all. On Windows the local models can use the GPU.

Once recognised, open the chapter and **tap the text in a bubble to look it up**; the plus mines a card that carries this page's picture.

## Skip the extensions: the built-in Mokuro catalog

Among the manga sources is a **built-in Mokuro catalog**: community-prepared manga that already ship with OCR data (`.mokuro`). Pick a volume, download, and read and tap right away — no recognition step.

## Common situations

- **The site needs a login**: the source's menu has "Log in" — sign in on the site, then tap "Done" to keep the session; on desktop you can also "Import from browser", which brings over the session from your system browser through the Fushi browser extension.
- **Chapter locked**: chapters the site sells or rents can't be unlocked by logging in inside the app yet.
- **Recognition is messy / bubbles missed**: vertical handwriting and decorative fonts have limited accuracy; try a source with better scans, or check whether the Mokuro catalog has the same title.
- **Site verification / nothing found**: see [the extensions article's common situations](/faq/mihon.en#common-situations).
