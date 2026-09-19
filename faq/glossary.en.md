---
title: "Glossary: what do the words in these articles mean?"
description: "Immersion, SRS, mining, raw, furigana, pitch accent, frequency, monolingual dictionary, OCR, transcription, hook, scraping, seeding, extension / source / repository, interconnect, debug build… grouped by topic, one line each. Come back here whenever another article uses a word you don't know."
category: "About Fushi"
order: 35
date: 2026-09-20
lang: en
---

Grouped by topic, a sentence or two each. Linked terms have a whole article.

## Learning method

- **Immersion**: acquiring a language by watching, listening to and reading large amounts of content you enjoy in that language, instead of memorising rules and doing exercises. The whole app is built for this; the theory is in the [immersion guide](/immersion).
- **Comprehensible input / i+1**: content just a little above your current level — mostly understood, a few unknowns — is the most effective input. The yardstick for choosing material.
- **Active study / passive immersion**: active = looking up, mining, reviewing; passive = anime playing in the background. You need both: the first small and precise, the second in volume.
- **SRS (spaced repetition)**: reviewing something right before you'd forget it; the software that does it is Anki.
- **Anki**: free SRS software; every card Fushi makes goes there for review. [What it is, which to install](/faq/anki-intro.en).
- **FSRS**: Anki's newer scheduling algorithm, off by default — [turn it on by hand](/faq/anki-basics.en).
- **Mining**: turning unknown words from what you're watching into Anki cards. In Fushi it's the plus in the lookup popup.
- **Deck**: a group of cards in Anki; **note type / template**: what fields a card has and how its two sides display. Fushi uses the **Lapis** template by default.
- **Kaishi 1.5k**: a 1,500-word starter deck for absolute beginners; once you can read simple sentences, start immersing.

## Japanese

- **Kana / gojūon**: hiragana and katakana, 46 basic sounds each, the foundation of written Japanese and the one thing you must memorise first.
- **Furigana**: small kana readings printed above kanji. Fushi's reader and dictionaries can show them.
- **Pitch accent**: the rise and fall of pitch within a word — はし with different pitch is 箸 or 橋. The accent marks in the lookup popup and the pitch-accent dictionary refer to this.
- **Frequency**: how often a word appears in a corpus; lower number = more common. Used to judge whether a word deserves a card and to [order new cards](/faq/anki-basics.en).
- **Monolingual / bilingual**: dictionaries classified by the language of their definitions. Monolingual (J–J) explains Japanese in Japanese; bilingual adds a translation. From the intermediate stage on, monolingual should be your main one.
- **Kokugo dictionary**: a Japanese dictionary made for Japanese speakers (Meikyō, Daijisen, Shinmeikai and the like).
- **Romaji**: Japanese written in Latin letters, `Sousou no Frieren`. [Use it when searching for releases](/faq/search-tips.en).
- **Raw / subbed**: the original without translated subtitles / a version with them; for Japanese you want raws. [More release-name terms](/faq/release-names.en).

## Lookups and dictionaries

- **Lookup popup**: the dictionary window that opens when you tap a word — definitions, pitch accent, frequency, audio and the plus all live in it.
- **Yomitan**: the browser lookup extension (formerly Yomichan); its dictionary format became the de facto standard and Fushi reads it directly. [What Shift lookup is](/faq/browser-lookup.en).
- **Yomitan dictionaries / MDX / DSL**: the three dictionary formats Fushi accepts, [how to import them](/faq/dictionaries.en).
- **Recommended pack**: the 9.5 GB one-tap download in onboarding — dictionaries, pitch accent, frequency, pronunciation library. [Can I skip it](/faq/pack.en).
- **Pronunciation library / audio sources**: where the word audio behind the speaker button comes from; local libraries and online sources can both be configured.
- **Global lookup**: select text in another app and call Fushi's lookup with a shortcut (Windows) or the text menu (Android).
- **Deinflection**: turning 食べなかった back into 食べる before looking it up. Dictionaries list base forms; this is why any inflected form still finds the entry.

## Subtitles and video

- **External / embedded / burned-in**: a subtitle file next to the video / a track packed inside the mkv / text painted into the picture. [Which can be looked up](/faq/subtitle-types.en).
- **SRT / ASS / VTT**: three text subtitle formats. [The differences](/faq/subtitle-formats.en).
- **Primary / secondary subtitle**: the two subtitle tracks Fushi shows at once — the primary for lookups, the secondary as a translation reference. [Using a secondary subtitle to transition](/faq/secondary-subtitle.en).
- **Sync / offset**: shifting the whole subtitle earlier or later to match the sound. [When it's off](/faq/subtitle-sync.en).
- **Jimaku**: a community-maintained Japanese subtitle site; Fushi's anime downloads can match from it automatically.
- **mkv / mp4, H.264 / HEVC, 1080p, bitrate**: container, codec, resolution, sharpness. [The video terms](/faq/video-basics.en).
- **BDRip / WEB-DL / TVRip, release group, batch**: where a release came from and how it was published. [Reading release names](/faq/release-names.en).
- **Scraping**: recognising a show from its filename and fetching poster, synopsis and episode list from the web. [What it is and how to use it](/faq/scraping.en).
- **Metadata**: the data scraping brings back. **NFO**: the file format that stores it next to the video; Jellyfin / Kodi read it too.
- **Jellyfin / Emby / Plex**: media servers that live on a NAS and stream video to your devices. [What they are](/faq/media-servers.en), [how to connect](/faq/jellyfin-setup.en).
- **Streaming / transcoding**: playing while transferring / the server converting video in real time into something the client can play.

## Manga and books

- **OCR**: recognising text in images. Manga has to be OCR'd before words can be tapped; Fushi's built-in model runs on-device. [Reading manga online](/faq/manga-online.en).
- **mokuro / .mokuro**: a manga format carrying OCR results (the position and content of every line on each page) that Fushi's manga tapping relies on; the built-in Mokuro catalogue ships titles with it already done.
- **EPUB / TXT**: the ebook formats Fushi reads; convert others (mobi, azw3) with Calibre.
- **Audiobook / alignment file**: narration audio plus a subtitle that lines the audio up with the text. [How the three fit together](/faq/audiobook.en).
- **Transcription (ASR)**: having a machine listen to audio and write the text out. Fushi uses it to generate alignment files for audiobooks without subtitles, entirely on-device.
- **Match rate**: the share of an audiobook's cues that found their place in the text; adjust the search window when it's low.

## Online sources and downloads

- **Extension / source / repository**: an extension is an APK containing one or more online sources (adapters for a website); a repository is the address listing installable extensions. Fushi is compatible with **Mihon** (manga) and **Aniyomi** (video) extensions. [Installing them](/faq/mihon.en).
- **Stream (hoster)**: the different playback origins for the same episode in a video source, varying in quality and availability.
- **BT / torrent / magnet link / seeding / tracker / DHT**: all explained in [the BT article](/faq/bittorrent.en).
- **Nyaa**: the largest index of Japanese anime releases and the default search source in Fushi's anime downloads; **Torznab**: a unified index-site API provided by Jackett / Prowlarr.
- **qBittorrent**: a common BT client that Fushi can drive externally.
- **Subscription**: having Fushi check for new episodes periodically and download them automatically.
- **AniList / MAL / AniDB / VNDB / Bangumi**: databases of works that Fushi uses to identify shows, fetch details and record progress.

## Galgame

- **Galgame / visual novel (VN)**: games that advance through text, character art and voice acting — the richest immersion material there is. [Hooking one into Fushi](/faq/galgame.en).
- **Hook / texthooker**: pulling the currently displayed dialogue out of the game process. **Special code (H-code)**: a hand-written capture rule for a specific game, used when the engine isn't recognised.
- **Text thread**: the several streams of text a hook captures; you pick the clean dialogue one.
- **Locale switching / Locale Emulator**: launching old games in a Japanese locale without changing the system language, to avoid garbled text.
- **Upscaling / Magpie**: a tool that scales a low-resolution game window to full screen.

## Fushi's own

- **Interconnect**: direct LAN connection between Fushi devices, one as the **host** sharing its library, the others as **clients**. [Setting it up](/faq/interconnect.en).
- **fushi_server**: a Fushi host without a GUI, run on a NAS.
- **Stable / debug**: the two download channels; debug gets new features first. [The difference](/faq/channels.en).
- **Onboarding**: the setup wizard on first launch; rerun it from Settings → System.
- **Browser extension**: Fushi's own extension for lookups on any web page. [Shift lookup](/faq/browser-lookup.en).
- **Cloud backup / Sync & backup**: backing data up to Google Drive / WebDAV or a local file, [where your data lives](/faq/data.en).
