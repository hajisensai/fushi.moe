---
title: "What is Anki? Which one do I install? What does a card look like and how do I review?"
description: "Anki is free spaced-repetition software: Fushi turns words you look up into cards, Anki schedules the reviews around how you forget. On desktop install the official build from apps.ankiweb.net (outdated third-party downloads break imports), AnkiDroid on Android, the paid AnkiMobile on iOS. Includes what the Lapis card front and back show and the daily review routine."
category: "Anki & mining"
order: 56
date: 2026-09-20
lang: en
---

## What Anki is

**Anki** (from the Japanese 暗記, "memorisation") is free **spaced-repetition** (SRS) software: you turn things you want to remember into cards, and it shows each card again right before you'd forget it — cards you know well come up less and less, cards you keep missing come back often. Maximum retention for minimum review time, and the one piece of "active study" immersion learning can't do without.

How it relates to Fushi: **Fushi makes cards, Anki reviews them.** While watching or reading, a word you look up becomes — with one tap on the plus — a card with the sentence, the audio and a screenshot, sent to Anki; each day you open Anki and work through what's due. The two apps do their own jobs; Fushi doesn't do reviews.

## Which one to install

| Device | Install | Notes |
|---|---|---|
| Windows / macOS / Linux | **Anki desktop** | From the official site [apps.ankiweb.net](https://apps.ankiweb.net/), free; then add the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on, which Fushi uses to send cards |
| Android | **AnkiDroid** | Google Play or [GitHub](https://github.com/ankidroid/Anki-Android/releases), free |
| iOS / iPadOS | **AnkiMobile** | App Store, paid one-off purchase (a few tens of dollars) — that's how the official project funds development |

**Only download from the official site and the places above.** Search-engine results often lead to third-party mirrors hosting builds that are **years old** — the classic consequences: a shared deck (`.apkg`) fails to import, the Lapis deck Fushi creates isn't recognised, the FSRS switch is nowhere to be found. If that happened, uninstall and reinstall from the official site; your data survives (it lives in `collection.anki2`, which a reinstall keeps — to be safe, export a backup first via File → Export in Anki).

Multiple devices: create a free **AnkiWeb** account, sign in on desktop and phone, and sync after each session. Cards Fushi made on the PC are then reviewable on the phone.

Once installed, connect it to Fushi: [How do I connect Anki?](/faq/anki.en)

## What a card looks like

The deck Fushi creates with one tap uses the **Lapis** note type (one of the most common Japanese card templates in the immersion community). A card has two sides:

**Front**: just one word.

```
   気配
```

Your job: look at the word and recall its reading and meaning. **The front is deliberately bare** — no sentence, no audio — because when you meet the word in subtitles or a book, that is all you get too.

**Back** (after flipping, top to bottom):

- the word + furigana + **pitch accent** marks (where the pitch rises and falls);
- **pronunciation**: the word's audio, from your pronunciation library;
- **the sentence**: the line of dialogue or text you mined it from, with the word highlighted, next to the **screenshot** of that moment and the **audio** of that line;
- **definition**: the entry from the dictionary you picked (monolingual first by default);
- frequency and other helper info.

Where the sentence, picture and audio sit on the back and how they're highlighted is adjusted in Fushi's **Anki settings** under the Lapis appearance options — no need to touch Anki's template code. Lapis itself also supports "sentence cards" (the whole sentence on the front, guess the bolded word); that's a template-field switch for later.

## The daily review

1. Open Anki, tap the deck Fushi created.
2. It serves **today's due cards** and **a set number of new cards** (20 new per day by default, changeable in deck options; 10–20 is a good range — consistency beats volume).
3. For each card: look at the front and recall → flip → press "Again" or "Good" (which button when: [How do I use Anki?](/faq/anki-basics.en)).
4. When the deck shows 0, you're done — usually 15–30 minutes. Made too many cards? Lower the new-card count; just don't stop.

**Cards always come from what you yourself watch and read.** Don't download someone else's "N1 vocabulary deck" as your main diet — those words come without your context and are slow, dull work; the one exception is a starter deck for absolute beginners like [Kaishi 1.5k](/immersion).

## Common situations

- **Deck import error / "unsupported file format"**: an outdated Anki from a third-party site; reinstall the latest from the official site.
- **Fushi says it can't reach Anki**: on desktop, Anki must be running with AnkiConnect installed; for phones see [connecting Anki](/faq/anki.en).
- **Cards arrive empty / fields shifted**: re-map the fields in Fushi's Anki settings, or just let Fushi recreate the Lapis deck.
- **Reviews piled up to hundreds**: lower new cards, turn on [FSRS](/faq/anki-basics.en), then carry on as normal — a backlog is what a broken habit looks like, not a software problem.
