---
title: "Raw, subbed, BDRip, WEB-DL… how do I read an anime release name?"
description: "Raw = the original with no translation, what you want for Japanese; subbed = with translated subtitles. BDRip comes from Blu-ray, WEB-DL from streaming, TVRip from broadcast. What each part of a release name says, so you can pick."
category: "Subtitles & video basics"
order: 230
date: 2026-09-20
lang: en
---

Search a show on Nyaa or in Fushi's anime downloads and you get a long list of near-identical titles trailing bracketed tags. This explains what they say and which to pick for Japanese.

## Raw / subbed

- **Raw**: the original with no translated subtitles. It may have no subtitles at all, or Japanese ones (closed captions, Blu-ray subs).
- **Subbed**: a version with translated (English, Chinese…) subtitles, which may be [external, embedded or burned-in](/faq/subtitle-types.en).

For learning Japanese you **want raws**: translated subtitles on screen get read without you noticing and teach nothing. A raw plus a Japanese subtitle (Fushi can match one from [Jimaku](https://jimaku.cc) automatically) is the smoothest setup for lookups and mining. The "raw / English-subbed / non-English-subbed" filter in Fushi's anime downloads splits along exactly this line.

## Source: BDRip, WEB-DL, TVRip

| Tag | From | Traits |
|---|---|---|
| **BDRip / BDMV / Remux** | Blu-ray disc | Best picture, uncensored, no station logo; appears months after broadcast |
| **WEB-DL / WEBRip** | Streaming (Crunchyroll, Netflix, Bilibili…) | Available the day it airs, medium quality; often carries the platform's subtitles |
| **TVRip / HDTV** | Broadcast recording | Earliest, with station logos, tickers and possible censorship |

- **BDMV** is the raw Blu-ray folder, tens of GB; **Remux** repackages the disc's streams into an mkv without re-encoding — disc quality, still huge; **BDRip** is re-encoded, one or two GB per episode, and the most common.
- **WEB-DL** is the stream taken directly from the service; **WEBRip** is a screen capture or re-encode, slightly worse.
- **CR / NF / AMZN / B-Global** in a name mark the source platform (Crunchyroll, Netflix, Amazon, Bilibili international).

## The quality part

`1080p`, `x265`, `Hi10P`, `FLAC` describe the video codec and audio — see [what the video terms mean](/faq/video-basics.en). In short:

- **1080p** or **720p** are both fine; anime's native resolution is usually below 1080p;
- **x265 / HEVC** is smaller but older devices may not decode it — pick x264 then;
- **10-bit** has finer colour; check hardware decoding support on phones.

## Release groups

The first bracketed tag is usually the release group. Veteran BDRip groups (VCB-Studio, Moozzi2, Beatrice-Raws…) are known for consistent quality; fansub groups (the various "Subs") produce subbed releases; **Erai-raws, SubsPlease** and similar re-post streaming WEB versions — the fastest, usually with multi-language external subtitles.

## Subtitle tags

- **CHS / CHT / JPN / ENG**: subtitle language — Simplified Chinese / Traditional Chinese / Japanese / English;
- **Multi-Subs**: several subtitle languages; **Dual Audio**: two audio tracks (usually Japanese + English dub);
- **CC**: closed captions, same-language subtitles made for the hearing impaired, including cues like "(door opens)". Japanese CC subtitles from Japanese streaming services are excellent for learners.

## Batches and seeders

- **Batch**: a whole season in one torrent, marked "Batch" in Fushi's anime downloads. For finished shows a batch is the least hassle.
- **Seeders**: more means faster; releases from years ago may have none and won't download — pick another.
- **Trusted**: uploaders vetted by Nyaa; Fushi's search can show only those.

## Picking for Japanese

In this order:

1. **Raw** first; a WEB version with Japanese CC subtitles is even better;
2. finished shows: **BDRip batch**; airing shows: **WEB-DL**;
3. 1080p / 720p either way; on older devices avoid x265 and 10-bit;
4. tick Fushi's "With subtitles" when downloading so Jimaku matches Japanese subtitles — the BD and WEB versions may have different timing, and if it's off, see [subtitles out of sync](/faq/subtitle-sync.en).

The actual download steps are in [Stream anime or download it?](/faq/anime-download.en).
