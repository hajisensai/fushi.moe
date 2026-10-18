---
title: "How do I back up Fushi? How do I move to a new phone or computer?"
description: "Fushi keeps your books, dictionaries, reading progress and study statistics on your device. There are three ways to back them up: export a .fushi.zip backup file, sync to Google Drive / OneDrive / Dropbox / WebDAV / FTP / SFTP, or use Fushi Interconnect to keep the data on your own computer or server. This page walks through moving to a new device step by step."
category: "Troubleshooting"
order: 305
date: 2026-10-18
lang: en
---

Fushi needs no account, and all your data lives on your own devices by default (see [Where is my data stored?](/faq/data.en)). That is good for privacy, but it also means that if your phone is lost or your computer is reinstalled and you never set anything up, your bookshelf, reading progress and study statistics go with it. Five minutes spent setting up a backup channel is worth it.

Everything about backups lives in **Settings → Sync & backup** (subtitle "Cloud, LAN P2P & local backup"), plus the separate **Settings → Fushi Interconnect**. The sections below go through them by purpose.

## Three ways to back up — which one to use

| Method | Good for | What it is |
|---|---|---|
| **Local backup file** (Export backup) | One-off migrations, an occasional safety copy | Packs everything into one `fushi-backup-<date>.fushi.zip` that you keep yourself; no network |
| **Cloud sync** (a cloud drive as the sync method) | Automatic, ongoing backup | Pick one of Google Drive, OneDrive, Dropbox, WebDAV, FTP, SFTP; credentials stay on the device |
| **Fushi Interconnect** | You have a computer or NAS that stays on at home | Data goes straight to your own computer or a [Fushi server](/faq/server.en), never through a cloud drive |

They don't conflict: you can keep cloud sync on day to day and still export a backup file before switching devices, just in case.

## Method 1: export / import a backup file

### Exporting

**Settings → Sync & backup → Local backup → Export backup**.

First you get "Choose what to export", where each item can be ticked on or off:

- **Dictionaries** (imported dictionaries and their files)
- **Books** (EPUB and extracted content) — "Choose books" lets you pack only some of them
- **Audiobook audio** (audiobook audio and alignment)
- **Custom fonts**
- **Videos** (local video files) — likewise with "Choose videos"
- **Local audio databases** (local pronunciation audio databases)
- **Games** (game library, metadata sources and covers)
- **Reading progress**, **Statistics**, **Settings**, **Profiles**

Videos, audiobooks and the local pronunciation databases are usually the largest items. If you only want to move your reading records, untick those and the backup gets much smaller; you can copy the big files over yourself and re-import them later.

Mind the note in the dialog: **unchecking Books removes those books entirely — their content and records go with them**. In other words, the backup won't carry that book's progress either. To keep the progress, pack the book too.

When the export finishes:

- **Android / iOS**: the system share sheet opens — save it to Files, a cloud drive, or send it to yourself;
- **Windows / macOS**: a save dialog opens; pick where to store the `.zip`.

If some dictionaries' source files can no longer be found on this device, you'll see "Exported, but N dictionary(s) were skipped"; everything else is exported normally.

### Importing

Install Fushi on the new device ([download page](/download)), then **Settings → Sync & backup → Local backup → Import backup** and pick the `.zip`. Fushi checks and previews the backup first, then asks:

- **Import mode**:
  - **Merge into current library** — use this when the new device already has books; it tells you "Merge will add N books and update N reading positions";
  - **Overwrite entire library** — replaces all current data with the backup; for a fresh install.
- **This backup contains**: lists every item in the backup; untick one to skip it.
- **Import settings & profiles**: on means a full restore (fonts, appearance and profiles come from the backup); off keeps this device's fonts / appearance / profiles and restores only books and reading data.

After you confirm, the app restarts on its own. The sync settings on this device (account and credentials) are kept — the backup doesn't overwrite them.

Messages you may see:

- **"Invalid backup file"**: wrong file, or the download was incomplete. Old `*.hibiki.zip` backups from the Hibiki days still import fine.
- **"This backup requires a newer version of the app"**: the backup was exported by a newer Fushi. Update Fushi on this device to the same version or later first.
- During the import the screen says "Restoring your data. Please don't close the app." A large backup can take several minutes; don't quit halfway.

## Method 2: cloud sync (automatic backup)

**Settings → Sync & backup → Sync method**, then choose one under "Storage backend":

- **Google Drive / OneDrive / Dropbox**: tap "Sign in" and authorize in the browser. On desktop your default browser opens; if it doesn't, or the page shows an error, use "Copy sign-in link" and open it in another browser.
- **WebDAV / FTP / SFTP**: open "Server settings", fill in the server address, user name and password (SFTP also takes a private key), and tap "Test connection". Any WebDAV-capable cloud drive, a NAS such as Synology, or your own server works.

Then look at the three groups below it:

**What to sync**

- **Sync statistics**: study time, character counts and other statistics sync too.
- **Upload book files**, **Sync audiobook files**, **Upload video files**: upload the files themselves. With these off, the cloud holds only progress and records, and you re-import the books on the new device yourself; turn them on to keep the books themselves in the cloud as well (this costs cloud storage and bandwidth).

**When to sync**

- **Auto sync**: when on, Fushi pushes automatically when the app opens, goes to the background, or a book is closed;
- **Sync now**: runs a full two-way sync by hand;
- **Compare data**: shows "Local vs Remote" side by side; for each book you can use local, use remote, or skip — handy when two devices disagree about progress.

**Dictionaries & local audio transfer**

Dictionaries, local pronunciation databases and fonts are large, so they **do not sync automatically**. In this group tap "Transfer" and choose "Upload" (send what this device has and the remote does not) or "Download" (fetch what the remote has and this device does not). On a new device, downloading your dictionaries here is the first thing to do — it beats downloading the recommended pack again.

A few notes:

- Cloud credentials live only on the device, and a backup restore never overwrites them.
- Builds you compile from source may lack the built-in Google sign-in credentials and report "Google sync credentials are not configured in this build"; use WebDAV or another backend instead.
- If the cloud drive is full you'll see "Cloud storage is full"; turn off video / audiobook file uploads or clean up the drive.

## Method 3: keep it on your own computer with Fushi Interconnect

If you've already paired your phone and computer following the [Interconnect guide](/faq/interconnect.en), you can skip cloud drives entirely:

- **Share with paired devices**: reading / watching progress, statistics ("Share statistics") and favorited words and sentences merge both ways, on by default. If one device dies, the other still has the full record.
- **Upload to interconnect peer**: four switches — books, dictionaries, audiobooks, videos — all off by default; tick the ones you want copied from the phone to the computer.
- **Use interconnect as the backup backend**: tap "Set as backup backend" in the Interconnect settings, and the backup and sync that used to go to a cloud drive go to the paired computer or server instead.
- **Configuration files**: "Upload configuration to host" / "Download configuration from host" moves a whole profile (reader, lookup and mining settings) to another device, where it lands as a new profile without overwriting existing ones.

No computer that stays on? Run a [Fushi server](/faq/server.en) on a NAS as that "machine at home".

## Moving to a new phone or computer: recommended steps

1. **On the old device**: if you use cloud sync or Interconnect, run "Sync now" once, then "Export backup" to keep a file as well.
2. **On the new device**: install Fushi. If you plan to bring your dictionaries over from the old device, hold off on the [recommended pack](/faq/pack.en) until the restore is done and see what's missing.
3. Restore with whichever method you use:
   - Backup file: **Import backup → Overwrite entire library** (when the new device has no data yet);
   - Cloud sync: pick the same storage backend, sign in to the same account, tap "Sync now", then "Download" your dictionaries and pronunciation databases under "Dictionaries & local audio transfer";
   - Interconnect: after pairing, the Fushi Interconnect source in your bookshelf / video library shows what's on the computer, and progress merges automatically.
4. Reconnect Anki: your cards live in Anki, not in Fushi's backup. On the new device reconnect Anki under **Settings → Card creation** (see [How do I connect Anki?](/faq/anki.en)), and move the Anki decks with Anki's own sync (AnkiWeb or a self-hosted sync server).
5. AI provider settings are local to each device and are not included in backups or sync; enter them again under **Settings → Models → LLM** on the new device.

### Coming from another reader

- **Hoshi Reader**: **Settings → Sync & backup → Local backup → Third-party import**, then choose the `.hoshi` library backup exported by Hoshi Reader; books, reading positions and statistics are imported, and importing the same backup twice doesn't double-count.
- **The old Hibiki app (Android)**: on Android this group has "Import from Hibiki", which imports data exported by the old Hibiki app.

## Common questions

- **Where is the backup file stored?** Wherever you chose when exporting; Fushi doesn't keep a copy for you. If a temporary package from an export is left behind, it shows up as "Leftover backup archives" under **Settings → Storage**, where you can clear it.
- **Can the data folder live on another drive?** Yes — **Settings → Storage** (data location and disk usage). If the drive holding the data location is temporarily unreachable, Fushi says "Data location not responding"; you can retry, or "Start with default location" — your original data is not modified.
- **Two devices show different progress**: settle it with "Compare data", or tap "Sync now" on both.
- **Do backups work across platforms?** Yes. A backup exported on Android imports on Windows / macOS / iOS, and the other way round.
