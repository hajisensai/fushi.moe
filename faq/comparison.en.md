---
title: "How is Fushi different from asbplayer, Language Reactor, Migaku, Yomitan and Anki? Can I use them together?"
description: "Yomitan is a browser lookup extension, asbplayer and Language Reactor mainly add lookup-ready subtitles to videos in the browser, Migaku is a paid all-in-one subscription, and Anki does spaced-repetition review. Fushi is a free, open-source standalone app that brings anime watching, light novel reading, manga OCR, galgame lookup and Anki card mining together — and it works alongside all of these tools."
category: "About Fushi"
order: 25
date: 2026-10-18
lang: en
---

If you learn a language through immersion (see [What is immersion learning?](/immersion)), your toolbox probably already holds a few things: Yomitan in the browser, Language Reactor or asbplayer for Netflix, and Anki for your cards. Fushi isn't asking you to replace all of them; it fills in what they don't cover. This page goes through each tool, what the difference is, and how to combine them.

First, what Fushi is: **a standalone app you install** (Windows, macOS, Android, iOS; Linux can be built yourself — see [Which platforms are supported?](/faq/platforms.en)), not a browser extension. It puts a local video player, an EPUB reader, a manga reader, audiobooks, a galgame text hook and dictionary lookup in one program, and turns a looked-up word into an Anki card with one tap. It is open source under GPLv3 and completely free (see [Is Fushi free?](/faq/free.en)).

What follows about the other tools is based on their public materials. Features and prices change, so check each tool's own site.

## The differences at a glance

| | Form | Main use | Cost | Review (SRS) |
|---|---|---|---|---|
| **Fushi** | Standalone app (desktop + mobile), plus a browser extension | Local anime / video, light novel EPUBs, manga, audiobooks, galgames, web pages | Free, open source | Handed to Anki |
| **Yomitan** | Browser extension | Hover lookup on web pages | Free, open source | Handed to Anki |
| **asbplayer** | Browser extension + web player | Subtitles and sentence mining on streaming sites and local video | Free, open source | Handed to Anki |
| **Language Reactor** | Browser extension | Dual subtitles and lookup on Netflix and YouTube | Free tier plus paid Pro | See its site |
| **Migaku** | Browser extension + app | Lookup and card mining on the web and video, vocabulary tracking | Paid subscription | Built in |
| **Anki** | Standalone app | Spaced-repetition review | Desktop and AnkiDroid free, AnkiMobile paid | It is the SRS |

## Fushi and Yomitan

[Yomitan](https://yomitan.wiki/) (the successor to Yomichan) is a pop-up dictionary for the browser: hold Shift, move the mouse over a word on a web page, and its definition pops up, ready to become an Anki card. It's the de facto standard for web lookup, and its dictionary format has become the community's common format.

How it relates to Fushi:

- **Same dictionaries**: Fushi imports Yomitan dictionary zips directly (and also MDict `.mdx` / `.mdd`, `.dsl` and StarDict), and uses Yomitan's transformation tables for deinflection. The dictionaries you've collected for Yomitan work as they are; see [How do I import dictionaries?](/faq/dictionaries.en)
- **Same audio database**: the database behind Yomitan's "local audio server" can be used directly — point Fushi's "local audio database" at its `entries.db`.
- **Different places**: Yomitan lives in the browser; in Fushi you tap a word inside the app, covering what's outside the browser — local video subtitles, EPUBs, text inside manga images, galgame dialogue — and it works on your phone too.
- **They work together**: Fushi ships its own browser extension, also Shift-to-look-up, using the dictionaries in Fushi. With both extensions installed each pops up its own window, so keep just one for web lookup (see [How do I look words up in the browser?](/faq/browser-lookup.en)). Fushi can also run a "Fushi API server" that speaks the yomitan-api protocol, so tools built for Yomitan can query Fushi's dictionaries instead.

## Fushi, asbplayer and Language Reactor

[asbplayer](https://github.com/asbplayer/asbplayer) is an open-source browser extension and web player that shows selectable subtitles on streaming sites and local videos, works with Yomitan for lookup, and turns the current line (with a screenshot and audio) into an Anki card. The streaming-subtitle part of Fushi's browser extension took it as a reference.

[Language Reactor](https://www.languagereactor.com/) is a browser extension for Netflix and YouTube, known for dual subtitles, a pop-up dictionary and auto-pause. It has a free tier and a paid Pro with more features.

The biggest difference from Fushi is **where you watch**:

- They mainly work in a desktop browser, around streaming sites;
- Fushi's video player is a local player (built on mpv). It plays anime from your disk, a NAS, a Jellyfin / Emby / Plex media server (see [media servers](/faq/media-servers.en)) or a paired computer, and it works on phones too. Tap a word in the subtitles to look it up; there are [dual / secondary subtitles](/faq/secondary-subtitle.en), a subtitle list, replay of the current line and subtitle timing alignment, and mined cards automatically get the line's screenshot or clip and its original audio.
- For web video, Fushi's browser extension can also overlay lookup-ready Fushi subtitles on sites such as Netflix and YouTube, and pull the subtitles into a side panel.

**Can I use them together?** Yes. A common split: keep using asbplayer or Language Reactor for streaming in the browser, and use Fushi for anime you've downloaded and for watching on your phone. Just note that running two subtitle overlays and two Shift-lookup extensions on the same page makes them get in each other's way, so pick one per page.

## Fushi and Migaku

[Migaku](https://migaku.com/) is a commercial all-in-one learning tool sold as a subscription: its browser extension handles lookup and card mining on web pages and video, it has its own flashcard review system, and it tracks which words you know and estimates how much of a piece of content you'll understand.

How Fushi differs:

- **Cost and openness**: Migaku is a paid, commercial subscription; Fushi is free with public source code and no in-app purchases.
- **Where review happens**: Migaku has its own review system; Fushi doesn't do review at all — every card goes to Anki, with your own decks, templates and FSRS.
- **Content focus**: Fushi leans toward local content — local anime, EPUB light novels, manga OCR, audiobooks, and a galgame text hook on Windows.
- **Data**: Fushi needs no account, and your data stays on your devices by default (see [Where is my data stored?](/faq/data.en)).

If you've already built up reviews in Migaku, there's no need to move them for Fushi; the two card systems are separate, and the cards Fushi makes go only to Anki.

## Fushi and Anki itself

Anki is spaced-repetition review software. Fushi doesn't replace it — it feeds it cards:

- On desktop Fushi connects to Anki through the AnkiConnect add-on, to AnkiDroid on Android and to AnkiMobile on iOS; you can even skip installing Anki and sync straight to an Anki sync server (see [How do I connect Anki?](/faq/anki.en)).
- Tap the plus in the lookup popup and you have a card with the original sentence, a screenshot / video clip, the original audio and the word's pronunciation; the built-in Lapis template can be set up in one tap.
- Lookups recognize words that are already in Anki, so you don't make duplicates.
- Reviewing, scheduling and FSRS all happen in Anki; Fushi's onboarding reminds you to turn FSRS on there.

So "Fushi or Anki" isn't a choice: Fushi handles input and card making, Anki handles review.

## When Fushi isn't the best fit

To be honest, some situations suit other tools better:

- **You only read articles in the browser**: Yomitan is enough; there's no need to install a whole app.
- **You mostly watch Netflix in a desktop browser**: the asbplayer / Language Reactor setup you're used to still works well; Fushi's browser extension is worth a try but not required.
- **You want review built in and don't want to touch Anki**: Fushi has no review system of its own, so a tool with built-in SRS fits that better.

On the other hand, if your content is mostly local anime, light novels, manga or galgames, or you want the same lookup and mining on your phone as on your computer, that's exactly what Fushi is built for. Install it from the [download page](/download) and follow the [onboarding](/faq/onboarding.en) — your first card is a few minutes away.
