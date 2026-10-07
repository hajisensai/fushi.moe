---
title: "What are Mihon / Aniyomi extensions? How do I add repositories and install sources?"
description: "Manga, video and novels share one online-source extension system: Mihon extensions for manga and Aniyomi extensions for video (both APKs), LNReader plugins for novels. All are installed under Browse → Extensions, with built-in repositories so you can install right away; you can also add a repository URL or import a local APK. Windows / macOS / Android."
category: "Extensions (Mihon / Aniyomi)"
order: 100
date: 2026-10-07
lang: en
---

Fushi has a built-in extension system compatible with [Mihon](https://mihon.app/), used by both manga and video, plus a separate one for novels:

- **Manga**: install Mihon (Tachiyomi-family) manga source extension APKs;
- **Video**: install Aniyomi video source extension APKs (extensions-lib 14–16); episodes play in the built-in player;
- **Novels**: install [LNReader](https://github.com/LNReader/lnreader-plugins) plugins to read online or download chapters as an EPUB onto your shelf.

An **extension** is one APK containing one or more **sources** (adapters for a particular website). Install an extension and its sources appear in the online source list; searching and fetching chapter / episode lists are done by the source against the site. Extensions aren't maintained by Fushi — they come from community **extension repositories**.

**Windows, macOS and Android are supported; the iOS build has no online source features per App Store rules.**

## Step 1: open the extension list

Bottom bar **Browse → Extensions**, then pick novels / manga / video at the top. The "Extensions" tab of the manga library, video library and bookshelf is the same page.

All three **come with built-in extension repositories**, so the list of installable extensions is there as soon as you open it — no hunting for repository URLs. To install a source the built-in repositories don't carry, tap **Stores** in the header and take one of two routes:

- **Add extension store**: paste the URL of a Mihon / Aniyomi-compatible repository (usually a link ending in `index.min.json`). "This repository returned 0 extensions" most often means the URL points at an old-style index; use the new URL the repository provides.
- **Import local APK**: already have a source's extension APK? Import the file directly.

## Step 2: install a source

The extension list can be filtered by **language** (learning Japanese: filter for Japanese, usually `ja`) and sorted by popularity (download count), and each extension expands to show the sources it contains.

- Press **Install**. The first extension from a given signer prompts "Trust extension signer?" with the signer's SHA-256 — extensions run code with Fushi's permissions, so install only sources you trust.
- Unsure? **Preview** first: run the source before installing and see its search results and chapter / episode lists; the preview is read-only and writes nothing to your library until you choose to install.
- Several at once? Use **Bulk install**; when the repository has newer versions, **Update all**.

Installed sources appear under **Browse → Sources**; disable or uninstall extensions you don't use. Preferences such as quality and language live in each extension's own "Source preferences".

## Once installed

- Manga: find → read online or add to shelf → recognise text, see [How do I read manga online and OCR the text for mining?](/faq/manga-online.en)
- Video: find → tap an episode → play, see [How do I stream anime through a video source?](/faq/anime-online.en)
- Novels: "Read online" on the work's page, or "Download" a range of chapters as one EPUB onto your shelf.

## Common situations

- **Site verification**: some sites sit behind Cloudflare and show a challenge page; pass it once inside and loading continues automatically.
- **Sites that need a login**: the source has "Log in" — sign in on the site and tap "Done" to keep the session; on desktop you can also "Import from browser" a session you're already logged into.
- **Nothing found / loading failed**: first check whether the site itself opens. "Clear source data" clears a source's preferences and cookies without uninstalling the extension.
- **Extension updates**: when the repository has a newer version the extension list marks it — press update (with the manga extension update reminder on, the updates center tells you too); changing the repository URL doesn't affect installed extensions.
