---
title: "Where is my data stored? Is anything uploaded?"
description: "By default everything stays on your device: no registration, and your books, dictionaries, progress and cards are never uploaded. The only exception is a daily anonymous usage report (version, platform, install ID) that you can turn off; online features such as sync, the leaderboard and AI only run if you turn them on."
category: "Troubleshooting"
order: 300
date: 2026-10-18
lang: en
---

By default everything lives on your own device. Fushi needs no registration and never uploads your books, dictionaries, progress or card history to any server.

The one thing that is on by default is **usage statistics**: once a day, the Android, Windows, macOS and Linux versions send an anonymous report to fushi.moe containing only an install ID (a one-way hash of the system's machine identifier, so it survives reinstalling; the identifier itself never leaves the device), the app version, the platform and the update channel, so we can count how many people use Fushi and how many are still on old versions. It contains no account, library or reading data, and your IP address is not stored. To stop it, turn off **Share usage statistics** under **Settings → System and about → Update settings**. The iOS version does not send it.

The features that do go online all have to be turned on by you:

- **Sync & backup**: through services you configure yourself — Google Drive / OneDrive / Dropbox, WebDAV / FTP / SFTP, or [Fushi interconnect](/faq/interconnect.en) (your own computer or a Fushi server); credentials stay on the device.
- **Fushi account & leaderboard** (experimental): nothing is uploaded until you register with an email verification code. What gets uploaded and made public: nickname, avatar, the titles, authors, covers and finish dates of works you have finished or are reading, characters read and time spent per work, and characters read per day. The email is only used to receive codes; the server keeps an irreversible hash, not the address. Individual works can be marked as not public.
- **AI features**: they use the provider you configure yourself under **Settings → Models → LLM**; the relevant content (the sentence of a lookup, a manga text box, …) goes to that provider, which bills you — see [What is AI download?](/faq/ai-download.en).
- **Anki sync (no Anki needed)**: syncs straight to the Anki sync server you enter; the username and password stay on the device.
- **Feedback**: when you send feedback from the app, what you write and whatever you choose to attach (screenshots, log, screen recording, device info) goes to the developers and is used only to investigate problems. With device info attached and usage statistics on, the install ID is sent too, so the developers can see which versions that device has run and whether it has received a fix.

Details in the [privacy policy](/privacy).
