---
title: "How do I install Fushi on Android? which architecture?"
description: "On Android, download the Android (arm64) APK — that's almost every phone — on Android 7.0 or later. Older 32-bit devices take arm32, emulators and x86 tablets take x86_64, and the debug channel has a single arm64 package. After that the app checks for updates and picks the right package for your device, so you can watch anime, read light novels, look words up and mine Anki cards right away."
category: "Setup"
order: 41.2
date: 2026-10-12
lang: en
---

Fushi for Android isn't on an app store; you download the APK from the [download page](/download) and install it. The minimum is **Android 7.0 (API 24)** — older systems can't install it.

## Which APK should I download?

Under "Stable", the download page has three Android rows. They differ only in CPU architecture:

| Row on the download page | File name ends in | Who it's for |
|---|---|---|
| Android (arm64) | `-arm64-v8a.apk` | Most phones — needs Android 7.0+ |
| Android (arm32) | `-armeabi-v7a.apk` | Older 32-bit devices |
| Android (x86_64) | `-x86_64.apk` | Emulators / x86 tablets |

If you're not sure, pick **arm64**: phones, tablets and most e-ink readers from the last several years are 64-bit ARM. Only if it won't install (the system says it's incompatible with your device, fails to parse the package, and so on) try arm32. If you run Fushi in an Android emulator on a PC, pick x86_64.

Switch to "Debug" and Android has **a single arm64 package** (file name ending in `-debug.apk`), so there's nothing to choose; older 32-bit devices and x86 emulators can't install the debug build and should use the matching stable package. For the difference between the channels, see [Stable vs. debug builds](/faq/channels.en).

## Installation steps

1. Open the [download page](/download) in your phone's browser and click "Download" on the right row. The page downloads in parallel chunks and checks the SHA-256; "SHA-256 verified" means the file is complete. On a slow connection, use the "GitHub direct link" next to it instead; see [The download is slow or won't open](/faq/download.en). You can also download it on a computer and copy it to the phone.
2. Open the downloaded APK. The first time you install an app from a browser or file manager, the system asks you to allow it to "install unknown apps"; follow the prompt to enable that, come back and tap Install. Wording differs between manufacturers, and some run an extra security scan — choose to continue installing.
3. Open Fushi. The first launch starts the onboarding wizard: choose the interface language and theme, pick the features you want, download the recommended pack and connect AnkiDroid. See [I closed the onboarding wizard halfway. How do I reopen it?](/faq/onboarding.en)

The recommended pack (Japanese dictionaries + Japanese / English pronunciation audio library) is about 9.5 GB. Before downloading it on a phone, make sure you have the space, and preferably be on Wi-Fi. If you're learning a different language you can skip it and import your own dictionaries; see [Is it only for Japanese?](/faq/languages.en)

## How do updates work on Android?

You don't need to go back to the download page every time. Fushi checks for new versions itself; under **Settings → System and about**, "Update settings" has:

- **Update channel**: Stable / Beta / Debug.
- **Preferred download source**: Automatic (recommended) / Cloudflare mirror / GitHub direct; if the one you chose is unavailable it falls back automatically.
- **Check for updates**: check right now; "View changelog" shows what changed in each version.
- **Auto-install updates**: when on, a new version is downloaded and the installer is launched automatically.

In-app updates **pick the package for your device's architecture**: if you have arm64 installed you keep getting arm64, never the wrong one. The first time you update from inside the app, the system shows "Allow installing updates" — Android requires every app that installs APKs to be authorised separately. Allow Fushi to install apps in system settings, come back and tap "Retry install".

## Does it work on tablets and e-ink readers?

Yes. Android tablets use the same APK; the layout adapts to the screen width, so landscape anime and two-column reading both work. With a keyboard or gamepad attached you can get around most pages with the arrow keys and confirm.

On Android-based e-ink readers (Boox, iReader and the like), for light novels and manga go to **Settings → Appearance and interaction → Interface** and turn on "E-ink mode": a pure black-and-white theme with no animations and line-style highlights, which reduces ghosting when the e-ink screen refreshes. The lookup settings also have "Instant popup scroll"; together they cut refreshes a lot. These devices are mostly 64-bit ARM too, so take the arm64 package; a few older models are 32-bit — switch to arm32 if it won't install.

## Common questions and pitfalls

- **You can't have stable and debug installed side by side.** They're the same app (same package name): installing debug replaces stable and keeps your data, and vice versa.
- **Going back to an older version won't install.** Android doesn't allow installing a package with a lower version code over a higher one, so going from a newer debug build back to an older stable one is refused. The only way is to export a backup in **Settings → Sync & backup**, uninstall, install the older version and import the backup. That's exactly why you should export a backup before switching channels.
- **Uninstalling deletes your data.** On Android, Fushi's database (reading progress, study records, settings) and the dictionaries and books you imported live in the app's own storage and are wiped on uninstall; only original files you referenced directly from phone storage, such as videos, stay where they are. Always back up before uninstalling, or have cloud backup / [interconnect backup](/faq/interconnect.en) set up.
- **Mining with AnkiDroid**: on Android, cards go to AnkiDroid. Install AnkiDroid from your app store first, then connect it in onboarding or **Settings → Card creation**; see [How do I connect Anki?](/faq/anki.en)
- **Desktop-only features**: Galgame text / voice capture is Windows-only; on a phone you can play your PC's games through [game streaming](/faq/game-streaming.en). If your library is large and you don't want to import it again on the phone, make the computer a [Fushi interconnect](/faq/interconnect.en) host and browse and stream from the phone.

For other platforms, see [How do I install Fushi on Windows?](/faq/windows-install.en) and [How do I install the iOS version, and why are some features missing?](/faq/ios-limits.en); for a comparison of all platforms, see [Which platforms are supported?](/faq/platforms.en)
