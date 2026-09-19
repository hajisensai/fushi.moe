---
title: "How do audiobooks, books and subtitles fit together? How do I use audiobooks?"
description: "In Fushi an audiobook = the book's text + the narration audio + a subtitle file that lines the two up. With all three, the reader follows the audio and tapping a sentence seeks to it. No subtitle? Generate one with on-device transcription. No book? Use just subtitle + audio."
category: "Books"
order: 60
date: 2026-09-20
lang: en
---

## What each piece does

An "audiobook" in Fushi is three things put together:

| | What it is | What it does |
|---|---|---|
| **Book** | EPUB (or TXT and other formats convertible to text) | The text: layout, furigana, chapters; word lookup depends on it |
| **Audio** | MP3 / M4B / M4A narration, one file per chapter or one for the whole book | The sound |
| **Subtitle** (alignment file) | SRT / VTT / ASS — the same thing as video subtitles | **Ties sound to text**: from second X to second Y, this sentence is being read |

Book and audio don't know each other — the book is only text, the audio only sound. The subtitle is the bridge: every cue has a time and a sentence; Fushi finds that sentence in the EPUB and now knows **at which second of the audio this sentence is**.

Where do subtitles come from? Unlike video, audiobooks rarely ship with one. Either the package you got already includes an aligned SRT next to the audio (communities often share them together), or you generate one with Fushi's [transcription](#no-subtitle-transcribe-one).

## Audiobook mode: read and listen together

With all three in place, open the audiobook panel in the reader (shortcut / bottom bar) and you're "listening while reading":

- the **current sentence is highlighted** during playback and pages turn by themselves;
- **tap any sentence** and the audio jumps there; previous / next sentence buttons, shortcuts and the phone's volume keys step sentence by sentence;
- words in the sentence still **look up on tap and mine with the plus**; the card carries **that sentence's audio**;
- select a passage to **export a clip video** (that passage's audio + text, up to 5 minutes);
- with **Keep playing after leaving** on, playback continues in the background when you leave the reader; together with the **floating subtitle** (the current sentence hovering over other apps, tappable for lookups, enabled in the "Listening" settings) and the media notification it works as pure listening material.

### Importing

The **Import book** dialog in the library (the "Import books and audiobooks" step in onboarding is the same one) takes all three at once: **Select book file** (EPUB), **Select subtitle files**, **Select audio files / audio folder** (multi-select, matched to chapters in filename order). To attach audio to a book already in the library, **long-press the book on the shelf → Import audiobook** and pick the audio and alignment file.

- By default the audio is copied into Fushi's own folder; tick **Reference original files (don't copy)** to play from the original path — saves space, but if the files move the book breaks (fixable with "Relocate files").
- Right after import Fushi runs **matching**: it finds where each cue lands in the text and shows a match rate in the panel. Above 80% is smooth; lower, see below.

### Low match rate

The **Resources** tab of the audiobook panel has "Re-match":

- **Search window**: how many characters ahead in the text each cue may look. Defaults are fine when subtitle and text run in the same order; if the narration skipped a prologue or the subtitle misses a chunk, widen it; too wide and short noise cues ("はい", "ええ") drag the cursor off course.
- **Similarity threshold**: the minimum similarity for fuzzy matches. Lower it when the narration deviates from the text (numbers, kanji variants, colloquial edits); too low and it mismatches.
- **Auto match**: tries several windows and keeps the one with the best hit rate.

"Every window scored 0" usually means **the subtitle and the book don't belong together** — a different edition, or an EPUB with no chapter text (scanned images).

## No subtitle: transcribe one

Only book and audio, no alignment file? Let Fushi **listen to the audio and write the subtitle**. Choose **Generate with on-device transcription** as the subtitle source when importing, or press **Generate subtitles with on-device transcription** in the panel:

1. Pick the **speech language** (ja for Japanese); the first time you **download a model**: the light model runs on phones and desktops alike; the large model is more accurate — desktop recommended, a discrete GPU even better. A GPU is used automatically, CPU can be forced; on Mac / iOS you can also pick **System speech recognition (Apple)** and skip Fushi's model.
2. **Start transcription**. A whole book takes a while — several times real-time on a desktop GPU, possibly slower than real-time on a phone. You can **pause**; progress is kept, and picking the same audio files later resumes.
3. When done, **Use subtitles** to match them against the text right away; **Export subtitle file** keeps a copy or shares it.

Transcription runs entirely on-device; nothing is uploaded. With a [Fushi interconnect](/faq/interconnect.en) host set up, **Run location** can be the host, letting the PC (or fushi_server on a NAS) do the work for the phone.

The transcribed text itself doesn't matter much — it is only used to **locate** sentences; what you read is still the EPUB original. A few recognition errors don't hurt the match rate.

## No book: subtitle + audio only

The other way round — audio and a subtitle but no EPUB — also reads: in "Import book" select just the subtitle and audio and give it a title, and Fushi **rebuilds a book from the subtitle text** (filed under "Subtitle audiobooks"). Paging, highlighting, lookups and mining all work; you just lose the original layout and furigana, and typos in the subtitle show as-is. Get the EPUB later and you can swap in the real book from the book menu and match again; a new subtitle is applied with "Re-import", which rebuilds the text.

## No audiobook: just read

The book alone is perfectly usable: import the EPUB and read normally — lookups, mining and progress sync all work, only the sound and sentence following are missing. Add audio and a subtitle later, or add audio and transcribe — your progress and the cards you've made stay put.

## Aside: batch pairing

If you keep a folder of subtitle / text files, add it under **Settings → Listening → Audiobook material library** with files named by work ID; from then on, whenever an audiobook download finishes, Fushi looks there for the matching subtitle and text and pairs them, no manual import per book.

## Where to get material

Fushi reads **DRM-free** EPUB / TXT and ordinary audio files. Legal sources fall into three groups:

- **Buy**: EPUBs from Japanese ebook stores (BookWalker, Kindle, honto…), audiobooks from audiobook.jp or Audible.co.jp; files with store DRM won't open in Fushi, so prefer DRM-free stores (BOOTH, some publishers' own shops).
- **Public domain**: [Aozora Bunko](https://www.aozora.gr.jp/) for text plus [LibriVox](https://librivox.org/) / [Aozora Roudoku](https://aozoraroudoku.jp/) for narration — most classics are there, ideal for practising transcription and alignment.
- **Make your own**: any book plus any narration (even a friend reading it) can be aligned via transcription.

## Common situations

- **"Audio only — an alignment file (subtitle) is still needed to open as a book"**: the download only brought audio; press "Add alignment file" and pick a subtitle, or transcribe one.
- **Audio file missing**: in reference mode the original files were moved; use "Relocate files" to point at them again.
- **Highlight jumps to another paragraph during playback**: match rate too low — re-match from the Resources tab, or the subtitle and book are different editions.
- **Delete audiobook** removes only the audio and alignment subtitle Fushi copied in; the book itself, its reading progress and the original files you selected on import all stay.
