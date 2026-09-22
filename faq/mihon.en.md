---
title: "What are Mihon / Aniyomi extensions? How do I add repositories and install sources?"
description: "Manga and video share one Mihon-compatible extension system: an extension is an APK, and installing one gives you an online source. Both come with built-in extension repositories, so you can install right away; you can also add a repository URL or import a local APK. Windows / macOS / Android."
category: "Extensions (Mihon / Aniyomi)"
order: 100
date: 2026-09-20
lang: en
---

Fushi has a built-in extension system compatible with [Mihon](https://mihon.app/), used by both manga and video:

- **Manga**: install Mihon (Tachiyomi-family) manga source extension APKs;
- **Video**: install Aniyomi video source extension APKs (extensions-lib 14 / 16); episodes play in the built-in player.

An **extension** is one APK containing one or more **sources** (adapters for a particular website). Install an extension and its sources appear in the browse list; searching and fetching chapter / episode lists are done by the source against the site. Extensions aren't maintained by Fushi — they come from community **extension repositories**.

**Windows, macOS and Android are supported; the iOS build has no online source features per App Store rules.** Video source extensions were added in September 2026 and haven't reached the stable release yet — switch the channel to "Debug" on the [download page](/download) to get them.

## Step 1: open the extension list

- Manga: Manga → Browse sources → **Manga extensions**;
- Video: Video → Import, which has three sections: **Repositories / Extensions / Online sources**.

Both manga and video **come with built-in extension repositories**, so the list of installable extensions is there as soon as you open it — no hunting for repository URLs. To install a source the built-in repositories don't carry, there are two routes:

- **Add extension repository**: paste the URL of a Mihon / Aniyomi-compatible repository (usually a link ending in `index.min.json`). "This repository returned 0 extensions" most often means the URL points at an old-style index; use the new URL the repository provides.
- **Import local APK**: already have a source's extension APK? Import the file directly.

## Step 2: install a source

The extension list can be filtered by **language** (learning Japanese: filter for Japanese, usually `ja`), and each extension expands to show the sources it contains.

- Press **Install**. The first extension from a given signer prompts "Trust extension signer?" with the signer's SHA-256 — extensions run code with Fushi's permissions, so install only sources you trust.
- Unsure? **Preview** first: run the source before installing and see its search results and chapter / episode lists; the preview is read-only and writes nothing to your library until you choose to install.

Installed extensions appear in the source list; disable or uninstall the ones you don't use. Preferences such as quality and language live in each extension's own "Source preferences".

## Once installed

- Manga: find → add to shelf → download → recognise text, see [How do I read manga online and OCR the text for mining?](/faq/manga-online.en)
- Video: find → episode → stream → play, see [How do I stream anime through a video source?](/faq/anime-online.en)

## Common situations

- **Site verification**: some sites sit behind Cloudflare and show a challenge page; pass it once inside and loading continues automatically.
- **Nothing found / loading failed**: first check whether the site itself opens; if it can't be reached, configure a proxy in settings. "Clear source data" clears a source's preferences and cookies without uninstalling the extension.
- **Extension updates**: when the repository has a newer version the extension list marks it — press update; changing the repository URL doesn't affect installed extensions.
