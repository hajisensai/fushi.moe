---
title: "Can I review without Anki? What is Fushi review?"
description: "Fushi has built-in spaced repetition (the \"Review\" tab): decks, FSRS-7 scheduling and sync across devices. Cards you mine go straight into review with no Anki install, and you can import Anki .apkg / .colpkg packages. For now it is only in debug and beta builds, not in stable releases."
category: "Anki & mining"
order: 56.5
date: 2026-10-18
lang: en
---

Yes. Fushi has its own spaced repetition, the **Review** tab in the navigation bar: cards you mine while looking words up go straight into its decks and are scheduled with FSRS-7. No Anki install and no setup needed.

## Which builds have it?

**Only debug and beta builds for now.** Stable releases don't include the module yet — it is still being iterated on, so it ships to the pre-release channels first. To try it, switch to the debug build on the [download page](/download); the difference between channels is explained in [Stable vs. debug builds](/faq/channels.en).

- **Fresh install** of a debug / beta build: onboarding has a "How you review" step. Choosing **Fushi review** turns the module on and makes it your mining target; choosing Anki connects Anki as before (see [How do I connect Anki?](/faq/anki.en)).
- **Upgraded from an older version**: the Review module starts switched off; turn on "Review" under **Settings → Appearance and interaction → Feature modules**.

## What does it do?

- **Works out of the box**: a default deck and the "Fushi card" note type are ready, and the sentence, screenshot and audio from mining go onto the card as usual.
- **FSRS-7 scheduling** that optimizes its parameters from your own review history. If you'd rather not have four buttons, turn on "Hide 'Hard' and 'Easy' buttons".
- **Look words up on the review card**; the card follows your current design system.
- **Sync across devices**: decks and review progress travel with sync, so you can review on your phone and mine on your computer; if both sides changed the same card, a conflict page lets you choose.
- **Statistics**: the statistics center has a "Review" tab.
- **Backups**: review data is **backed up automatically** after changes, and you can "Restore to this point". Backups stay on the device, so save a copy of the important ones elsewhere.

## Where do mined cards go?

**Settings → Card creation → Mining target** is one or the other: **Fushi review** or **Anki**. A card goes to only one of them; the lookup popup's top bar can switch it on the spot.

## I already have lots of cards in Anki

Use **Import** on the deck list of the Review tab and pick an `.apkg` exported from Anki, or a whole-collection `.colpkg`:

- choose whether to import scheduling (review history, due dates) and the deck preset configuration;
- Anki would replace its entire collection with a `.colpkg`; **Fushi merges it instead** and never deletes or replaces the cards you already have;
- the other way round, **Export (.apkg)** takes your cards back to Anki.

## Can I keep using Anki?

Yes. Leave the mining target on **Anki**, or simply don't turn the Review module on, and everything works as before. See [How do I connect Anki?](/faq/anki.en) and [How do I use Anki?](/faq/anki-basics.en).
