---
title: "What is AI download? Do I need my own AI?"
description: "Tell the AI a title; it finds the work, picks a release, then downloads or subscribes, with subtitles matched automatically. You first set up your own AI provider under Settings → AI (billed at that provider's prices; a local model works too). Without one, everything else still works. Not available on iOS."
category: "Downloads"
order: 92
date: 2026-10-07
lang: en
---

**AI download** hands "find the work → pick a release → download / subscribe → match subtitles" to an AI: say "Spy x Family season 2" and it finds the work, picks a suitable release and, once you confirm, downloads or subscribes, with subtitles matched automatically. Whole series work too — it lists every season and movie, and "Whole series" grabs them together, subscribing to anything still airing.

Fushi doesn't provide an AI service; it uses **an AI provider you configure yourself**, so you need to set one up once. The iOS build has no download features per App Store rules, so it has no AI download either.

## Step 1: set up an AI provider

**Settings → AI**:

1. **Provider configuration** → **Add provider**: there are several built-in presets, or enter any Chat Completions–compatible API endpoint. Fill in the API key, tap "Fetch models", pick a model and run "Test connection". For a model server on your own machine (`http://localhost`), turn on "Allow plain HTTP".
2. **Feature providers** → set it as the **Default provider**. Every AI feature uses it unless assigned otherwise; to use a different provider for one feature, or no AI at all, change that feature on its own.

The provider you choose bills you at its own prices; Fushi isn't involved. If no provider is set up, tapping an AI entry first sends you here.

## Step 2: tell the AI what you want

- **Video**: the ✨ button next to the search box in **Browse → Discover** (the video library's "Discover" tab works the same), or **Ask AI to download a work** in the "⋯" menu of a work's detail page.
- **Novels, manga, games**: the ✨ **AI download** button at the end of the search row on their Discover pages. It recommends up to three results and you confirm each with "Download".

A video conversation goes roughly like this:

1. Say the title. One match is picked directly; with several, the AI picks one when it is confident and tells you so, otherwise it lists the candidates for you to tap.
2. It asks only for what's missing: for a show still airing, "Download now" or "Subscribe"; finished shows are simply downloaded. Quality and subtitle language are asked the first time — tick "Use as default from now on" and you won't be asked again.
3. It shows a summary of the release it picked; "Use this" starts it, "Another version" shows the next release.

To identify works, Fushi itself fetches articles from Wikipedia, Moegirlpedia, Anime News Network and other "web knowledge" sources and hands them to the AI (the provider doesn't need web access), and every listed work is checked against the metadata sources.

## Default quality, source and subtitles

All under **Settings → AI → AI video download**: default quality ("highest available" or "ask every time" are options), preferred source (e.g. Blu-ray first), bitrate, subtitle language (defaults to the work's original language) and skip extras (PVs, CMs, NCOP/NCED and the like are not downloaded).

## Let your computer do the downloading

Once your phone is paired through [Fushi interconnect](/faq/interconnect.en), pick a paired computer or Fushi server under "Run on a paired computer" in **Settings → AI** (the same setting as "Download on device" in the download settings) and AI download runs there: it uses that device's AI assignment and downloads, the files land there, and the phone only holds the conversation.

## Other AI features

The same provider can also: pick the right dictionary entry for the sentence during lookup (the ✨ in the popup's top bar), re-read manga text boxes with a vision model, help choose the work when scraping is unsure, re-rank subtitle search results for background subtitle backfill, generate dictionary popup styles / Lapis card styles / custom themes from a description, and write cleanup rules for galgame hook text. Each can be switched off individually under "Feature providers".
