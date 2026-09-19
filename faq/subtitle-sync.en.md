---
title: "Subtitles don't line up with the picture (early or late) — what do I do?"
description: "Subtitles off by a fixed few seconds throughout means subtitle and video are different versions (BD vs. WEB, with or without the OP); drift that grows over the episode means different frame rates. Fushi's player has \"Subtitle sync\" with a slider, auto-align and waveform alignment, remembered per episode."
category: "Subtitles & video basics"
order: 240
date: 2026-09-20
lang: en
---

An external subtitle wasn't made for your exact video file, so mismatches are normal. First tell which kind of mismatch it is, then fix accordingly.

## Two kinds of offset

**A constant offset**: from start to finish the subtitle is earlier (or later) than the sound by the same few seconds. The cause is **different versions** of subtitle and video:

- the Blu-ray and TV / WEB cuts differ — the BD version may add seconds of black, drop ad-break transitions, or start with or without a cold open before the OP;
- one version cut the OP / ED while the subtitle was made for the full one.

**Growing drift**: correct at the start, two or three seconds late twenty minutes in. That's **frame rate** — the subtitle was made for a 25 fps PAL version and the video is 23.976 fps, or the reverse; a few frames per minute add up to seconds by the end. A fixed offset can't fix this; the subtitle needs to be stretched.

There's a third: **only some lines are off** — the subtitle itself was timed badly; get a different one.

## Adjusting in Fushi

The player's quick settings have **Subtitle sync**:

- **Slider / steps**: drag, or nudge in steps of ±100 ms and the like. Subtitle early → move positive (delay); late → negative. Line up the moment a line starts with the moment the subtitle appears and you're done.
- **Auto-align**: let Fushi compute an offset.
- **Waveform alignment** (local videos): opens the whole audio waveform with every cue's start drawn as a line; drag sideways and put the lines on the speech peaks. Doing it by eye once beats trial and error with the slider; phones may not be able to build the waveform — use the slider there.

The offset is **remembered per episode**: switching episodes or reopening keeps it. Mining also cuts audio and picture with the offset applied, so cards never grab the neighbouring line.

## Still drifting after alignment

Then it's the frame rate and a fixed offset won't save it. Options:

- get a subtitle on [Jimaku](https://jimaku.cc) **for your video's version** — entries often list both BD and WEB versions and the filename says which;
- or get the video version that matches the subtitle;
- to fix it yourself, use [Aegisub](https://aegisub.org/) or [Subtitle Edit](https://www.nikse.dk/subtitleedit): "frame rate conversion" or "two-point sync" stretches the subtitle to the right length; then put it back.

## Picking the right version up front saves the trouble

If the subtitle Fushi's anime downloads matched with "With subtitles" doesn't fit, add one by hand: check whether the release name says **BDRip** or **WEB-DL** ([reading release names](/faq/release-names.en)) and import the matching version from Jimaku.
