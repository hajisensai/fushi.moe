---
title: "External, embedded, burned-in subtitles: which ones can Fushi look up?"
description: "External = a separate subtitle file next to the video; embedded = a switchable subtitle track packed inside the mkv / mp4; burned-in = text painted into the picture. The first two are text and support lookups and mining; burned-in is just pixels."
category: "Subtitles & video basics"
order: 200
date: 2026-10-07
lang: en
---

Where a subtitle lives decides whether it is "text" or "picture" — and that is what decides whether Fushi can look up words and mine from it.

| | Where | Switchable | Is it text | Fushi lookups |
|---|---|---|---|---|
| **External** | A separate file next to the video (`.srt` / `.ass`…) | Yes | Yes | ✅ |
| **Embedded** | A subtitle track packed inside the mkv / mp4 container | Yes | Usually | ✅ (text track) / OCR lookup when paused (graphic track) |
| **Burned-in** | Painted into the video frames | No | No — pixels | ❌ |

## External subtitles

A **separate subtitle file** beside the video, same name, different extension:

```
[Sub] Frieren - 01.mkv
[Sub] Frieren - 01.srt
[Sub] Frieren - 01.ja.ass
```

When Fushi opens a video it automatically looks for a same-named `.srt` / `.ass` / `.ssa` / `.vtt` in the same folder. Files with a language tag take priority (learning Japanese: `.ja.srt` first), then untagged ones. You can also import any subtitle file manually in the player, or let [Jimaku match one](/faq/anime-download.en#subtitles) — subtitles imported either way are copied into Fushi's own folder and remembered across episodes and restarts.

External is the most flexible kind: swapping, retiming or fixing subtitles touches only the small file, never the video.

## Embedded subtitles

The subtitle is **a track packed inside the container**, alongside the video and audio streams; the player can switch or disable it. One mkv often carries several: full Japanese, "Signs & Songs" for on-screen text and lyrics only, English, Chinese…

There are two kinds of embedded track, and the difference is big:

- **Text tracks** (ASS / SRT / WebVTT / mov_text): still text underneath. When Fushi opens a video it enumerates every subtitle track in the container; select one and it's extracted with ffmpeg and behaves exactly like an external file, lookups included.
- **Graphic tracks** (PGS, VobSub): Blu-ray and DVD subtitles are **bitmap images**, one per line, with no text. Fushi shows them as on-screen subtitles, and the subtitle menu labels such tracks "Graphic subtitle · shown on video · pause to look up words (OCR)": **pause** and Fushi OCRs the text on screen so you can tap it to look up; to look up while playing, "Convert to text subtitles (OCR)" recognises the whole track once, after which it works like a text track. "Generate subtitles with speech recognition" in the subtitle menu can also build a text subtitle from the audio.

Self-made BDRips and fansub mkvs mostly carry text tracks; files remuxed straight from a Blu-ray often have only PGS.

## Burned-in (hardsubs)

The subtitle was **painted into the frames during encoding** and is as much a part of the picture as the characters and backgrounds: can't be turned off, swapped or extracted, and there's no text to get. Streaming rips with translation subs and many online sites' videos are like this.

To Fushi a burned-in subtitle is just an image, no lookups. To look words up on such a video you need a separate text subtitle: an external subtitle ([Jimaku](https://jimaku.cc) has Japanese subtitles for most anime), or one generated from the audio with "Generate subtitles with speech recognition" in the subtitle menu. The original text stays in the picture and the two layers overlap.

## Why the names get mixed up

"Embedded" and "burned-in" (in Chinese, 内封 and 内嵌) are constantly confused online — someone's "embedded subtitles" often means the switchable mkv kind. One test settles it: **if the player can turn it off, it's embedded; if it can't, it's burned-in.**

## Choosing in Fushi

The player's subtitle menu lists external files from the folder and embedded tracks from the container together; pick any. Learning Japanese, prefer the Japanese text track. If subtitles and picture don't line up, see [subtitles out of sync](/faq/subtitle-sync.en).
