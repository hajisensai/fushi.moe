---
title: "How do I read manga online and OCR the text for mining?"
description: "With a manga source extension installed: find the manga → add to shelf → download a chapter → Recognise this chapter (on-device OCR) → tap text in the speech bubbles to look up and mine. Don't want to bother with extensions? The built-in Mokuro catalogue already comes with OCR data."
category: "Manga"
order: 70
date: 2026-09-20
lang: en
---

You need at least one manga source extension installed first (see [What are Mihon / Aniyomi extensions?](/faq/mihon.en)). The only difference between online manga and local manga is the extra "download" step — Fushi's OCR runs on-device, so the page images have to be local first.

## Find → add to shelf

Open a manga source: it has **Popular / Latest / Search**; the "Discover" page also lists popular, top-rated and trending series and matches them against your enabled sources. Open a series and **Add to manga shelf** — it now sits on the shelf like local manga, with the chapter list following the source site.

## Download → recognise

Online manga **must be downloaded before reading**: press "Download" in the chapter list; it shows "Downloaded" when done.

Then press **Recognise this chapter** and Fushi's built-in OCR model reads the text out of every speech bubble:

- the first time, press "Download model" in the manga OCR settings; the model runs on-device — two or three seconds per page on desktop, slower on phones;
- with a [Fushi interconnect](/faq/interconnect.en) host set up, the OCR engine can be set to "Run on the paired Fushi interconnect server" — no model and no waiting on the phone.

Once recognised, open the chapter and **tap the text in a bubble to look it up**; the plus mines a card that carries this page's picture.

## Skip the extensions: the built-in Mokuro catalogue

Among the manga sources is a **built-in Mokuro catalogue**: community-prepared manga that already ship with OCR data (`.mokuro`). Pick a volume, download, and read and tap right away — no recognition step.

## Common situations

- **Chapter locked**: the source site requires login and purchase or rental for that chapter; Fushi can't download it and doesn't support in-app login to unlock yet.
- **Recognition is messy / bubbles missed**: vertical handwriting and decorative fonts have limited accuracy; try a source with better scans, or check whether the Mokuro catalogue has the same title.
- **Site verification / nothing found**: see [the extensions article's common situations](/faq/mihon.en#common-situations).
