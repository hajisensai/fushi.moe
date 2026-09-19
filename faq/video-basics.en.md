---
title: "MKV, MP4, H.264, HEVC, 1080p… what do these video terms mean?"
description: "The container (mkv / mp4) is the box things are packed in, the codec (H.264 / HEVC / AV1) is how the picture is compressed, 1080p is the resolution, and bitrate decides sharpness and file size. Knowing these is enough to pick releases."
category: "Subtitles & video basics"
order: 220
date: 2026-09-20
lang: en
---

A video file is really several things packed together: **picture**, **sound**, **subtitles**, and the **box** that holds them. The string of abbreviations in a release name says which kind of each was used.

## Container: mkv and mp4 are boxes

The file extension names the **container** — the format that bundles video streams, audio tracks, subtitle tracks and chapters. It says nothing about picture quality.

- **MKV** (Matroska): holds anything — any number of audio and subtitle tracks, attached fonts, chapters. Anime BDRips and fansub releases are almost all mkv.
- **MP4**: the most compatible (phones, browsers and TVs play it directly), but subtitle support is weak and only a few subtitle formats fit inside. Streaming and online-site videos are mostly mp4.
- **WebM**: a slimmed-down mkv for the web, holding only open codecs like VP9 / AV1.

The mkv and mp4 of the same show can have the identical picture — only the box differs.

## Codec: H.264, HEVC, AV1 are compression methods

Raw video is far too big to store; a **codec** is the algorithm that shrinks it. Newer codecs give smaller files at the same quality but need more CPU / GPU to decode.

| Codec | Also known as | Notes |
|---|---|---|
| H.264 | AVC, x264 | Old and universal; every device decodes it in hardware |
| H.265 | HEVC, x265 | 30–40% smaller than H.264 at the same quality; the BDRip mainstream |
| AV1 | — | Smaller still, open and royalty-free; older devices can't decode it |

**x264 / x265** in a release name are the encoders' names and mean H.264 / HEVC. **Hi10P / 10-bit** means each colour component is stored with 10 bits, so gradients (skies, shadows) don't band — anime encoders love it; older phones may lack hardware decoding for 10-bit H.264 and stutter.

## Resolution: 1080p, 720p, 4K

The pixel dimensions of the picture. **1080p** = 1920×1080, **720p** = 1280×720, **4K / 2160p** = 3840×2160; the p means progressive, the i in **1080i** means interlaced, common in TV recordings.

Note that most Japanese anime is actually produced somewhere between 720p and 900p and the "1080p Blu-ray" is upscaled — a 720p BDRip is usually plenty to watch; 1080p mainly buys picture stability and crisper subtitles.

## Bitrate: sharpness and size

**Bitrate** is how much data per second is spent on the picture, in Mbps. At the same 1080p, a 2 Mbps stream and a 15 Mbps BDRip look visibly different — dark scenes turning to mush and fast motion breaking into blocks are both signs of too little bitrate.

File size ≈ bitrate × duration: a 24-minute episode is a few hundred MB as a streaming WEB rip and one or two GB as a BDRip, and the difference is all bitrate.

## Frame rate: 23.976 and 24

Frames per second. Anime is almost always **23.976 fps** (a legacy of TV standards); some releases say 24. The gap is 0.1%, but if a subtitle was made for the other frame rate it **drifts by several seconds over an episode** — one of the usual causes of [subtitles out of sync](/faq/subtitle-sync.en).

## Audio: FLAC, AAC, 2.0 / 5.1

- **FLAC**: lossless, common in BDRips, large; **AAC / Opus**: lossy, used by streaming and small encodes; **AC3 / DTS**: older surround formats.
- **2.0** is stereo, **5.1** is surround. One mkv can carry both Japanese and English dub tracks, switched in the player.

For learning Japanese only the Japanese original track matters; the format doesn't.

## An example

```
[VCB-Studio] Sousou no Frieren [01][Ma10p_1080p][x265_flac].mkv
```

mkv container, 1080p, 10-bit (Ma10p), HEVC (x265), lossless FLAC audio. More on the other parts of a release name in [reading release names](/faq/release-names.en).

## What matters for Fushi

Fushi's player is built on libmpv and plays essentially every container and codec above. What to care about when picking a release is the **subtitles**: is there a Japanese text track in the mkv, is there an `.srt` / `.ass` next to it — see [external, embedded and burned-in subtitles](/faq/subtitle-types.en).
