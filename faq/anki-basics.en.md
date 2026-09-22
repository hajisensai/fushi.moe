---
title: "How do I use Anki? FSRS, the four buttons, and audio on the front"
description: "Three things to do once it's connected: switch the scheduler to FSRS (the onboarding wizard has the steps), use only \"Again\" and \"Good\" when reviewing, never put audio on the card front. Fushi can also reorder new cards by frequency and merge several subtitle lines into one card."
category: "Anki & mining"
order: 59
date: 2026-09-20
lang: en
---

After [connecting Anki](/faq/anki.en) and [making your first card](/faq/first-card.en), a few things in Anki itself are worth getting right from the start. These are Anki settings, not Fushi's.

## 1. Switch the algorithm to FSRS

Anki ships with **FSRS** — one of the best spaced-repetition algorithms available — but it is **off by default**; until you turn it on you're scheduled by SM-2, an algorithm from thirty-odd years ago. FSRS predicts when you'll forget from your real review history and gets the same retention with fewer reviews.

Fushi's onboarding wizard has a step for exactly this (Settings → System → Onboarding → Anki):

1. On desktop Anki click the gear next to the deck → **Options** (AnkiDroid 2.17+ / AnkiMobile: long-press the deck → Options);
2. scroll to the **FSRS** block at the very bottom and turn it on — it applies to the whole collection, once is enough;
3. click **Optimize**, then save. With fewer than about a thousand reviews the default parameters already beat SM-2; optimise again once you have more.

With FSRS on, **stop meddling with the schedule**: a card pushed out several weeks is what the algorithm computed — if you don't trust it, don't use it. If the "next review" times on the buttons sway your answers, hide them in Anki's settings.

## 2. Use only two of the four buttons

Recall the back while looking at the front, flip to check, then:

| Recall | Press |
|---|---|
| Didn't remember, or remembered wrong | **Again** (button 1) |
| Got it, but with real effort | Hard (button 2) — never press it if you got it wrong |
| Got it fairly easily | **Good** (button 3), the one you'll use most |
| Knew it cold | Easy (button 4), rarely |

Unsure? Just use **1 and 3**. Mispressing "Hard" or "Easy" costs more than not using them.

## 3. No audio on the front

The front holds **the word only** (Lapis does this by default). With audio on the front you'd be practising "can I recall the meaning from the sound", not "can I recall the reading and meaning from seeing the word" — and the latter is what happens in subtitles and books. Audio goes on the back; hear it after flipping.

## 4. What Fushi can do for you here

- **Reorder new cards by frequency**: Fushi's Anki settings have "Reorder new cards by frequency", which sorts new cards by how common the word is using your frequency dictionaries (or Lapis's FreqSort field) — common words first, rare ones later. Run it after a mining session.
- **Several lines, one card**: when a line of dialogue spans two or three subtitle cues, **multi-select** them in the subtitle list before mining; the sentence and audio cover the whole span. Lookups also merge adjacent cues.
- **How many a day**: fewer is better. Ten-odd new cards daily while you keep watching beats a hundred one day and not opening Anki the next. Which words deserve a card: [the first card](/faq/first-card.en#which-words-deserve-a-card).
- **The template**: the deck Fushi creates uses Lapis; field mapping lives in Fushi's Anki settings, and your own note type can be mapped too.

## Common situations

- **Deck import error**: most likely an outdated Anki from a third-party site — install the official build from [apps.ankiweb.net](https://apps.ankiweb.net/).
- **Cards land in the wrong deck / fields are empty**: check the deck and field mapping in Fushi's Anki settings; changing note type means re-mapping.
- **Cards made on the phone should go to the desktop's Anki**: use "Mine to Fushi interconnect server" from [Fushi interconnect](/faq/interconnect.en).
