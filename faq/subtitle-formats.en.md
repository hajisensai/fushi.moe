---
title: "SRT, ASS, VTT — what's the difference between subtitle formats?"
description: "SRT is just timings and text, the simplest and most universal; ASS adds fonts, colours, positions and effects and is the fansub standard; VTT is the web version of SRT. Fushi reads all of them, and lookups and cards use the plain text with styling stripped."
category: "Subtitles & video basics"
order: 210
date: 2026-09-20
lang: en
---

Every text subtitle is fundamentally a table: **this line is shown from this second to that second.** Formats differ in how much else the table can hold.

| Format | Extension | Can hold | Typical source |
|---|---|---|---|
| SubRip | `.srt` | timings + text, bold / italic at most | streaming rips, Jimaku, auto-generated |
| SubStation Alpha | `.ass` / `.ssa` | fonts, colours, outlines, positions, animation, karaoke | fansub groups, BDRips |
| WebVTT | `.vtt` | timings + text, a little styling | web players, online sources |

## SRT: the simplest

```
12
00:01:04,520 --> 00:01:07,180
魔法使いといえば、たったひとつ。
```

Index, start and end time, text — that's all. No fonts, no positions; how it looks is entirely up to the player. Because it carries nothing extra it **works anywhere and anyone can edit it** — fixing a typo or shifting everything by two seconds is a job for Notepad.

Jimaku's Japanese subtitles and subtitles extracted from Netflix and other streaming services are mostly SRT.

## ASS: the fansub standard

```
[V4+ Styles]
Style: Default,Noto Sans JP,60,&H00FFFFFF,...

[Events]
Dialogue: 0,0:01:04.52,0:01:07.18,Default,,0,0,0,,{\an8}魔法使いといえば、たったひとつ。
```

An ASS file first defines **styles** (font, size, colour, outline, shadow) and each line references one; the text can also contain **override tags** like `{\an8}` — place the line at the top of the screen, change colour, fade in and out, karaoke colouring character by character. Translating signs, text messages and OP/ED lyrics all rely on this, so nearly every fansub release is ASS. `.ssa` is its older version; any player that reads one reads both.

The price is that it demands more of the player: one ASS file may look different in different players, and a missing font falls back to a default.

## VTT: SRT for the web

```
WEBVTT

00:01:04.520 --> 00:01:07.180
魔法使いといえば、たったひとつ。
```

Almost identical to SRT, designed for the browser `<video>` element (a dot instead of a comma in timings, a `WEBVTT` header). Web players and the subtitle tracks that come with Aniyomi online sources are almost always VTT.

## What's the difference in Fushi?

**None that matters** — Fushi reads all of them, whether as external files or embedded mkv tracks.

The first thing Fushi does with a subtitle is **separate styling from text**: lookups, mining and what's written to Anki are plain text; tags like `{\an8}` never leak into a sentence. Part of the ASS styling is rendered (alignment `\an`, `\pos`, italic and bold, colour, size, line breaks); karaoke, animation and vector drawing are silently dropped — Fushi's subtitles are a layer of tappable characters and can't be painted into the picture the way mpv does, or the tapping would stop working.

So for Japanese, **don't choose by format** — choose by content: one Japanese subtitle whose lines match the dialogue is worth more than any effect. A fansub group's beautifully styled English ASS is only ever a reference; mining needs the Japanese one.

## Aside: graphic subtitles

PGS (Blu-ray) and VobSub (DVD) aren't text but bitmaps and have no "format" to speak of — Fushi can display them but not look them up; see [external, embedded and burned-in subtitles](/faq/subtitle-types.en#embedded-subtitles).
