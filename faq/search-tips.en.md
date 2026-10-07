---
title: "Can't find an anime or manga? Search in romaji or Japanese"
description: "On the index sites Fushi uses (Nyaa and friends) release titles are almost always romaji (Sousou no Frieren), then the Japanese original; translated titles rarely match. In Fushi you find the work first and the resource search uses its original title / aliases automatically; when editing the query yourself: romaji > kana / kanji > English, never a local translation."
category: "Downloads"
order: 97
date: 2026-10-07
lang: en
---

Searching for a translated title and getting nothing doesn't mean there's no release — **index sites don't index translations**.

## What release titles look like

The index sites Fushi uses — Nyaa (anime), apibay / Knaben (films and series) — are shared by uploaders worldwide, and the show name in a title is **romaji** first, Japanese second:

```
[SubsPlease] Sousou no Frieren - 01 (1080p) [ABCD1234].mkv
[VCB-Studio] 葬送のフリーレン [01][Ma10p_1080p][x265_flac].mkv
Frieren - Beyond Journey's End S01E01 ...
```

The same show may appear in all three spellings, but **romaji is by far the most common**, and fansub releases mostly carry it. A localised title only shows up on a handful of local groups' releases; searching by it misses nine out of ten.

## Searching in Fushi

Downloading anime in Fushi is always two steps: first find the **work**, then the **releases**.

1. The first step searches metadata databases (the search box in **Browse → Discover**, backed by AniList / TMDB and others), which find entries by English, Japanese, romaji or Chinese titles;
2. on the work's page, "Search resources" queries the index sites with the work's **original title / aliases** (romaji and Japanese) — no query to write. The "Anime download" dialog that opens when you fill in episodes of a collection works the same way: once the show is selected, the **Nyaa search terms** are filled with its original title — just search.

If results are too few or too noisy (in the "Anime download" dialog), edit the query yourself. Rules of thumb:

- **Romaji first**: `Sousou no Frieren`, `Kimetsu no Yaiba`. The "Romaji" title on AniList is the spelling index sites use most.
- **Japanese original second**: `葬送のフリーレン` — Japanese BD groups and some fansubbers use it.
- **Official English title third**: `Frieren: Beyond Journey's End`, common on WEB rips from streaming services.
- **Short forms find more**: `Frieren` hits more than the full title; too short and unrelated things creep in.
- **Leave out season / episode notation**: `Season 2`, `S2`, `第二季` are written differently by every group; search the title and filter in the results.
- **Translated titles last**: only when you're after a specific local group's subbed release.

Manga on Nyaa uses romaji / Japanese titles the same way; book and audiobook catalogues search in whatever language their source uses (Jimaku's subtitle matching also goes through AniList, so once the show is right the subtitles rarely mismatch).

## Writing romaji

No need to learn the rules — two shortcuts:

- copy the title from the AniList / MAL page;
- type the kana in a Japanese IME and read off the Hepburn romaji: し = shi, ち = chi, つ = tsu, ふ = fu, ん = n; long vowels are usually dropped (東京 = Tokyo), の is written no, the particle は is wa. Some titles use Kunrei-style si / ti / tu instead — try the other spelling if nothing comes up.

## Common situations

- **Show found, zero releases**: try a shorter query; very old or obscure shows may have 0 seeders — see [the BT article](/faq/bittorrent.en#common-situations).
- **Results are all subbed**: pick the "Raw" filter in the "Anime download" dialog, or add `raw` to the query.
- **Manga only shows serialised chapters, no volumes**: volumes on Nyaa are usually written `第01巻` / `v01`; try the Japanese title plus `巻`.
