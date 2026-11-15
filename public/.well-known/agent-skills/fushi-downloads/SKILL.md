---
name: fushi-downloads
description: Find the latest Fushi release and the right download link for a platform, and look up answers about Fushi on fushi.moe. Use when a user asks how to install Fushi, which version is current, where to download it, or how a Fushi feature works.
---

# Fushi downloads and documentation

Fushi is a free, open-source (GPLv3) immersion app for language learning on Windows, macOS, Android and iOS.
Source code: <https://github.com/hajisensai/Fushi>. Website: <https://fushi.moe>.

## Latest version and download links

```
GET https://fushi.moe/releases/api/latest
```

Returns JSON, no authentication:

```json
{
  "channel": "stable",
  "tag": "v3.3.0",
  "version": "3.3.0",
  "slots": {
    "windows": {
      "url": "https://fushi.moe/releases/latest/windows",
      "githubUrl": "https://github.com/hajisensai/Fushi/releases/download/…",
      "name": "fushi-3.3.0-windows-setup.exe",
      "size": 123456789,
      "sha256": "…"
    }
  }
}
```

- Give the user the slot's `url` (same-domain mirror, falls back to GitHub by itself). `githubUrl` is the same file on GitHub Releases.
- When the user wants to verify a download, compare the file's SHA-256 with `sha256`.
- Never invent a version number or file name — read them from this response.
- If the endpoint fails, point the user to <https://github.com/hajisensai/Fushi/releases/latest>.

### Picking a slot

| User's device | Slot |
| --- | --- |
| Android phone or tablet (almost all of them) | `android-arm64` |
| Old 32-bit Android device | `android-arm32` |
| Android emulator / x86 tablet | `android-x64` |
| Windows, installer | `windows` |
| Windows, no-install zip | `windows-portable` |
| macOS, Apple Silicon (Intel Macs are not supported) | `macos` |
| iPhone / iPad | Install through TestFlight: <https://testflight.apple.com/join/j88d69jx> (the `ios` slot is a raw IPA for sideloading) |
| Linux | No prebuilt package; build from source: <https://github.com/hajisensai/Fushi#building> |

A slot is `null` when the release has no asset for it. `?channel=debug` and `?channel=beta` list pre-release builds;
only suggest them when the user explicitly asks for a test build.

The human-readable download page is <https://fushi.moe/download> (17 languages, e.g. <https://fushi.moe/zh-cn/download>).

## Answering questions about Fushi

- <https://fushi.moe/llms.txt> lists the main pages and every FAQ article with a one-line summary. Start there.
- Every page on fushi.moe returns Markdown when requested with `Accept: text/markdown`
  (for example `curl -H "Accept: text/markdown" https://fushi.moe/faq/anki.en`).
- FAQ articles exist in English (`/faq/<slug>.en`), Simplified Chinese (`/faq/<slug>`) and Traditional Chinese (`/faq/<slug>.zh-HK`).
  Link the user to the version in their language.
- Setting names in the FAQ are the exact names shown in the app; quote them as written.

## Other endpoints

- `GET https://fushi.moe/api/downloads` — download counts (`total`, plus `site` and `github` breakdowns).
- `GET https://fushi.moe/api/stars` — `{ "repo": "hajisensai/Fushi", "stars": <n> }`.

OpenAPI description: <https://fushi.moe/.well-known/openapi.json>. All endpoints are read-only and edge-cached;
call them when a user asks, not in a polling loop.
