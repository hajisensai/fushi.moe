---
title: Privacy Policy
description: "What data the Fushi app handles and how: local storage, user-configured cloud sync, Anki, optional feedback and opt-in error logging."
head:
  - - link
    - rel: "canonical"
      href: "https://fushi.moe/privacy"
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

<p class="updated">Last updated: October 18, 2026</p>

Fushi is a free and open-source application licensed under GPLv3. This policy describes what data the app handles and how.

## Local Storage

All user data — imported books, dictionaries, fonts, audiobooks, videos, manga, reading progress, highlights, statistics, settings, and Anki card history — is stored locally on your device. Using Fushi does not require an account or registration. The optional Fushi account, the feedback center and the usage statistics described below are the only places where Fushi itself receives data, and each is explained in its own section.

## Cloud Sync (User-Configured)

Fushi can optionally sync reading progress, settings, and learning data via cloud storage services you configure yourself:

- **Google Drive / OneDrive / Dropbox**: Uses OAuth credentials you authorize within the app. Fushi accesses only its own app-specific folder; it does not read other files in your cloud storage.
- **WebDAV / FTP / SFTP**: Connects to a server address and credentials you provide.
- **Fushi Interconnect**: Connects directly to another device on your local network at an address you specify.

Fushi does not store your cloud credentials on any external server. Authentication tokens are kept locally on your device.

## Anki Integration

Fushi creates flashcards via AnkiDroid (Android), AnkiMobile (iOS), or AnkiConnect (desktop, same network). Communication happens directly between the app and the Anki instance you configure. No data is sent to Fushi or any third party.

## Usage Statistics

On Android, Windows, macOS and Linux, Fushi sends one small anonymous usage report per day to the developer's server (`rank.fushi.moe`, hosted on Cloudflare) so we can see how many people use the app and which versions are still in use. Each report contains only:

- An install ID. Since October 2026 it is derived on your device, by a one-way hash, from your operating system's machine identifier (Windows MachineGuid, macOS IOPlatformUUID, Linux `/etc/machine-id`, Android ANDROID_ID), so it stays the same when you reinstall Fushi or clear its data on the same device. The machine identifier itself is never sent or stored by Fushi. If it cannot be read, a random ID generated on your device is used instead. The install ID is not derived from your account, and it is never included in backups, sync or profile exports; a different device always gets a different ID.
- A public key derived from the same identifier, with a signature and a small proof of work, so the server can reject reports that impersonate an existing install
- The app version
- The platform (Android, Windows, macOS or Linux)
- The update channel you selected (stable, beta or debug)

The server counts reports per day to produce totals such as daily and monthly active installs and version distribution. Your IP address is used only for short-term rate limiting at the network edge and is not stored with these reports. Records of an install are deleted after 400 days without a report.

You can turn this off at any time under **Settings → System and about → Update settings → Share usage statistics**. When it is off, no report is sent and the install ID is not attached to feedback.

The iOS version does not send these reports. Apple may share aggregated App Store usage figures with the developer if you have chosen to share analytics with app developers in your iOS settings; see Apple's own privacy policy for details.

## Feedback (Optional)

When you submit feedback from the in-app feedback center, the following is sent to the developer's server (`rank.fushi.moe`):

- The category, title and text you write, and a contact address if you enter one
- Screenshots, a screen recording and a compressed app log, each only if you attach it
- Device information, unless you turn off "attach device info": app version, operating system and version, device model, app and system language, and window size
- The install ID from Usage Statistics, only when device info is attached and usage statistics are on — this lets the developer see which app versions that install has used, other feedback from the same install, and whether it has received a fix
- Your Fushi account, only if you are signed in and choose to link it
- Recorded by the server itself: the country and network (ASN) the request came from, and your app's user-agent

Feedback is used only to investigate and fix problems and is visible only to the developers. Attachments are deleted 90 days after the feedback is closed (screen recordings 7 days after closing or 30 days after upload, whichever comes first); the text is kept so the conversation can continue. On iOS you can allow a notification when the developer replies; the push token is deleted when the feedback is closed. Your IP address is used for rate limiting and is kept in rate-limit records for no more than two days.

## Fushi Account and Leaderboard (Optional, Experimental)

Nothing is uploaded until you register with an email verification code. The verification code is delivered by our email provider (Resend); the server keeps only an irreversible hash of your email address, never the address itself. Once registered, the following is uploaded and shown publicly on the leaderboard: your nickname and avatar; the titles, authors, covers and finish dates of works you have finished or are reading; characters read and time spent per work; and characters read per day. Individual works can be marked as not public, and your profile can be limited to friends. Deleting your account in the app deletes all of this data from the server.

## Error Logging (Opt-In)

Fushi includes an optional error log upload feature. When you choose to send an error report, the following is transmitted to a self-hosted server operated by the developer:

- Error messages and stack traces
- App version, platform and device model

Error reports do not include personal data, reading content, dictionary entries, or cloud credentials. Log data is used solely for debugging and is not shared with third parties.

## Network Requests

Beyond the services you explicitly configure (cloud sync, Anki, error reporting), Fushi may make network requests for:

- **Update checks**: Checking for new app versions from GitHub Releases or the App Store.
- **Metadata lookup**: Fetching cover images and series information from metadata providers (AniDB, TMDB) when you use the media library features.
- **Dictionary downloads**: Downloading dictionary files or recommended packs from sources you select within the app.

These requests contain no personal information beyond what is standard in an HTTP request (IP address, user-agent).

## No Third-Party Tracking

Fushi does not include any third-party analytics SDK, advertising framework, or cross-app tracking (no Google Analytics, no Firebase Analytics, no Crashlytics). The only usage measurement is the first-party daily report described in Usage Statistics, which you can turn off.

## Children's Privacy

Fushi does not knowingly collect any personal information from anyone, including children under 13.

## Data Deletion

Data stored locally on your device can be deleted at any time by clearing the app's data or uninstalling the app. Cloud sync data can be removed from your cloud storage account directly. Your Fushi account and everything uploaded with it can be deleted from within the app. Usage statistics records are deleted automatically after 400 days without a report; to have feedback deleted sooner, contact us with its feedback number.

## Open Source

Fushi's source code is publicly available at [github.com/hajisensai/Fushi](https://github.com/hajisensai/Fushi). You can inspect exactly what the app does with your data.

## Contact

If you have questions about this privacy policy, you can reach us at:

- GitHub: [github.com/hajisensai/Fushi/issues](https://github.com/hajisensai/Fushi/issues)
- Discord: [discord.gg/WhjwyGmm7f](https://discord.gg/WhjwyGmm7f)
- Email: [contact@fushi.moe](mailto:contact@fushi.moe)

## Changes

If this policy is updated, the changes will be posted on this page with an updated date. We do not keep email addresses in readable form, so we cannot notify you directly — please check this page periodically.

</div>
