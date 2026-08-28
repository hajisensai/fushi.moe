---
title: Privacy Policy
---

<style>
.privacy { max-width: 720px; margin: 0 auto; padding: 60px 22px 120px; }
.privacy h1 { font-size: clamp(28px, 4vw, 40px); font-weight: 600; line-height: 1.1; margin-bottom: 8px; }
.privacy .updated { font-size: 14px; color: var(--ink-2, #6e6e73); margin-bottom: 40px; }
.privacy h2 { font-size: 21px; font-weight: 600; margin: 36px 0 12px; }
.privacy p, .privacy li { font-size: 17px; line-height: 1.65; color: var(--ink-2, #6e6e73); }
.privacy ul { padding-left: 1.4em; margin: 8px 0; }
.privacy a { color: var(--link, #0071e3); }
.privacy a:hover { text-decoration: underline; }
</style>

<div class="privacy">

# Privacy Policy

<p class="updated">Last updated: August 28, 2026</p>

Fushi is a free and open-source application licensed under GPLv3. This policy describes what data the app handles and how.

## Local Storage

All user data — imported books, dictionaries, fonts, audiobooks, videos, manga, reading progress, highlights, statistics, settings, and Anki card history — is stored locally on your device. Fushi does not operate any account system and does not require registration.

## Cloud Sync (User-Configured)

Fushi can optionally sync reading progress, settings, and learning data via cloud storage services you configure yourself:

- **Google Drive / OneDrive / Dropbox**: Uses OAuth credentials you authorize within the app. Fushi accesses only its own app-specific folder; it does not read other files in your cloud storage.
- **WebDAV / FTP / SFTP**: Connects to a server address and credentials you provide.
- **Fushi Interconnect**: Connects directly to another device on your local network at an address you specify.

Fushi does not store your cloud credentials on any external server. Authentication tokens are kept locally on your device.

## Anki Integration

Fushi creates flashcards via AnkiDroid (Android), AnkiMobile (iOS), or AnkiConnect (desktop, same network). Communication happens directly between the app and the Anki instance you configure. No data is sent to Fushi or any third party.

## Error Logging (Opt-In)

Fushi includes an optional error log upload feature. When you choose to send an error report, the following is transmitted to a self-hosted server operated by the developer:

- Error messages and stack traces
- App version and platform information

Error reports do not include personal data, reading content, dictionary entries, or cloud credentials. Log data is used solely for debugging and is not shared with third parties.

## Network Requests

Beyond the services you explicitly configure (cloud sync, Anki, error reporting), Fushi may make network requests for:

- **Update checks**: Checking for new app versions from GitHub Releases or the App Store.
- **Metadata lookup**: Fetching cover images and series information from metadata providers (AniDB, TMDB) when you use the media library features.
- **Dictionary downloads**: Downloading dictionary files or recommended packs from sources you select within the app.

These requests contain no personal information beyond what is standard in an HTTP request (IP address, user-agent).

## No Tracking, No Analytics

Fushi does not include any analytics SDK, advertising framework, or user tracking mechanism. There are no third-party analytics services (no Google Analytics, no Firebase Analytics, no Crashlytics).

## Children's Privacy

Fushi does not knowingly collect any personal information from anyone, including children under 13.

## Data Deletion

Since all data is stored locally on your device, you can delete it at any time by clearing the app's data or uninstalling the app. Cloud sync data can be removed from your cloud storage account directly.

## Open Source

Fushi's source code is publicly available at [github.com/hajisensai/Fushi](https://github.com/hajisensai/Fushi). You can inspect exactly what the app does with your data.

## Contact

If you have questions about this privacy policy, you can reach us at:

- GitHub: [github.com/hajisensai/Fushi/issues](https://github.com/hajisensai/Fushi/issues)
- Discord: [discord.gg/WhjwyGmm7f](https://discord.gg/WhjwyGmm7f)

## Changes

If this policy is updated, the changes will be posted on this page with an updated date. Fushi does not collect email addresses, so we cannot notify you directly — please check this page periodically.

</div>
