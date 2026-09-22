---
title: "How do I import dictionaries (Yomitan / MDX)? Which kinds do I need for Japanese?"
description: "Fushi reads Yomitan dictionary zips, MDict .mdx / .mdd and Lingvo .dsl; the recommended pack already sets up vocabulary, pitch-accent and frequency dictionaries plus a pronunciation library. Adding your own: one or two monolingual dictionaries, one bilingual, one pitch accent, one frequency, one grammar — too many just slows lookups down. The pronunciation library uses the same database as Yomitan's local audio server."
category: "Setup"
order: 52
date: 2026-09-20
lang: en
---

Fushi accepts three dictionary formats, all imported as-is with no conversion:

- **Yomitan (Yomichan) dictionary zips** — the common format of the browser lookup ecosystem; every dictionary collection prepared for Yomitan works in Fushi;
- **MDict `.mdx`** — the format used by the huge library of GoldenDict / Eudic / DictTango dictionaries; ones with images or audio come with a same-named `.mdd`, select it too;
- **Lingvo `.dsl`**.

Yomitan dictionaries have the richest structured fields (pitch accent, frequency, inflections); MDX wins on sheer volume — many monolingual and bilingual dictionaries only exist as MDX.

## What the recommended pack already gives you

After installing the [recommended pack](/faq/pack.en) (about 9.5 GB) from onboarding you have:

- **Japanese vocabulary dictionaries** (Japanese–Japanese / Japanese–Chinese);
- **a pitch-accent dictionary** (the accent marks in the lookup popup);
- **frequency dictionaries** (the frequency badge next to entries; [reordering new cards by frequency](/faq/anki-basics.en) relies on them);
- **local pronunciation libraries** (Japanese + English) — the speaker button in lookups, and the word audio on cards.

If all you do is watch anime and read in Japanese, the pack lasts a long time; there is no rush to add more.

## Adding your own

**Settings → Dictionaries**, import from file (multi-select is fine, import runs in the background), or drag `.zip` / `.mdx` / `.dsl` files straight onto the dictionaries page; the CSS that ships with an MDX dictionary must be imported together with the dictionary package. Imported dictionaries are grouped by category — monolingual / Japanese–English / bilingual / grammar / frequency / kanji / names / supplementary — and each can be:

- **reordered**: definitions appear in the popup in this order, so put the ones you read most first;
- **hidden**: ones you don't need for now aren't loaded and don't cost lookup time;
- **collapsed**: folded by default, open on tap.

How many is enough? Yomitan power users run seventy or eighty, but every extra dictionary makes lookups a bit slower and the popup a bit longer. A set that gets you far:

| Category | How many | What for |
|---|---|---|
| Monolingual (J–J) | 1–2 | The workhorse. Learner-oriented small dictionaries have simple definitions and furigana; mid-size ones cover more words |
| Bilingual | 1 | Fallback when the monolingual entry loses you; use it less as you go |
| Pitch accent | 1 | High/low marks in the popup, needed for shadowing |
| Frequency | 1–2 | Deciding whether a word is worth a card, reordering new cards |
| Grammar | 1 | Look up patterns like 〜てならない without opening a grammar book |
| Kanji | 0–1 | Add when you want stroke order and on/kun readings |

Bilingual dictionaries and the commercial ones (物書堂 and friends) are copyrighted, so I won't list where to get them; the freely maintained Yomitan community dictionaries (the JMdict family, frequency lists, grammar dictionaries, Wikipedia summaries and so on) are enough to build this skeleton. Already have MDX dictionaries from your GoldenDict / Eudic days? Drag them in — no need to hunt for Yomitan versions.

## Where pronunciation comes from

**Settings → Lookup → Manage audio sources**: several sources can be configured and are tried in order:

- **Local audio database**: the pronunciation library in the recommended pack is one of these; it is the **same database format** as Yomitan's "local audio server" (the NHK / Shinmeikai / JPod / Forvo set). If you already downloaded that data for Yomitan, "Add local audio database" pointed at its `entries.db` works directly, optionally referencing the original file without copying.
- **Custom URL**: any http(s) address that returns audio, with `{term}` / `{reading}` placeholders.
- **Fushi interconnect**: use the desktop's pronunciation library from your phone without installing the 9.5 GB, see [interconnect](/faq/interconnect.en).

With "Auto-play audio on lookup" on, the popup plays the first source's pronunciation as soon as it opens.

## Common situations

- **Unrecognised dictionary format**: Yomitan dictionaries must be a zip (containing `index.json`; old Yomichan ones are accepted too); for MDX select only the `.mdx` (plus the `.mdd` next to it) — don't unzip anything first.
- **MDX dictionary has no images / audio**: the same-named `.mdd` was left out; import it again.
- **Lookups got slow / popup too long**: hide dictionaries you don't use, or collapse them.
- **The same word repeated across several dictionaries**: move bilingual ones to the end and collapse them; read the monolingual entry first.
- **Fonts, colours, layout in the popup**: styles are under Settings → Lookup and can be set per dictionary.
