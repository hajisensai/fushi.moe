---
title: "How do I connect my phone and PC with Fushi interconnect?"
description: "Turn on \"Host service\" on the PC, tap the discovered PC under \"Pairing & devices\" on the phone, click Allow on the PC — paired. The phone can then stream the PC's anime, books and manga, look words up with the PC's dictionaries and pronunciation library, send cards to the PC's Anki, and progress syncs both ways."
category: "Setup"
order: 55
date: 2026-09-20
lang: en
---

Fushi interconnect is **direct device-to-device connection over your LAN**: one device acts as the **host** (shares its library), the others connect to it as **clients**. The most common setup is the PC as host — the anime, books, manga, the 9.5 GB dictionary pack and Anki all live there — and the phone as client: watch in bed, look things up on the go, cards land in the PC's Anki, progress and statistics move together.

A device can be host or client at any one time, not both. Interconnect and cloud backup (Google Drive / WebDAV…) are separate channels and can run at the same time.

## Before you start

- Phone and PC on the **same Wi-Fi / LAN** (pairing across networks is possible too, see "Not on the same LAN" below).
- Both running Fushi on the same major version; an old version gets "The other device is too old".
- Windows / macOS can host; Android / iOS phones connect as clients.

## Step 1: turn on the host service on the PC

On the PC: **Settings → Fushi interconnect**

1. Turn on **Enable interconnect**.
2. Open **Host service** and turn on **Enable sync server**. The default port is **38765**, and a device hosting for the first time turns on **Interconnect encryption (HTTPS/TLS)** by default — leave it on; things like "mine to the host's Anki" and "sync host service config" need it.
3. When the status reads "Running · port 38765" you're done. Windows shows a firewall prompt the first time — allow it on private networks.

The host is the passive side: it never has to press "sync"; the clients drive everything.

## Step 2: pair the phone

On the phone: **Settings → Fushi interconnect → Enable interconnect → Pairing & devices**

- The **LAN devices** list at the bottom discovers PCs on the same network that are hosting — **tap it**;
- a "Pairing request" pops up on the PC, click **Allow**;
- the phone shows "Paired, token filled in automatically". Done.

The PC now appears under "Added peers" on the phone, and the phone under "Paired devices" on the PC. Pairing is one-off; from then on they connect automatically whenever both are on the same network.

**The PC isn't in the list?** Usually the router has AP isolation on, or the PC's firewall blocks mDNS. Add the peer address manually instead: check the PC's LAN IP (Windows: `ipconfig`; macOS: System Settings → Wi-Fi → Details) and enter on the phone

```
https://192.168.1.23:38765
```

Use `https://` if the host has TLS on, `http://` if not (a bare `IP:port` is treated as http) — get it wrong and Fushi tells you which one to use.

### Not on the same LAN (Tailscale, public networks…)

As long as the phone can reach the PC's address (for example both run [Tailscale](https://tailscale.com/)), manual pairing works, with one extra step — a **PIN**: after the PC clicks "Allow", a 6-digit PIN stays on its screen; type it on the phone. The PIN never travels over the network; it exists to stop someone impersonating your device.

On the first connection the phone remembers the PC's certificate fingerprint; if the certificate changes later (Fushi reinstalled on the PC), you get "Certificate changed" — if it was your own reinstall, choose "Clear stored fingerprint and trust again" and re-pair.

## Step 3: what the phone can do now

Nothing more to configure on the phone; things simply appear in the right places:

**Use what's on the PC**

- Video, books and manga each gain a **Fushi interconnect** source in their source lists — that's the PC's library: videos stream, books open, manga (including mokuro the PC already OCR'd) reads.
- Want it offline? **Download to this device**.
- **Show remote entries** in the Sync settings (on by default) shows books and videos the PC has and the phone doesn't as placeholder cards with a cloud badge, right on the shelf — tap to stream or download.

**Use the PC's dictionaries and audio**

- **Lookup → Remote dictionary lookup**: words the phone can't find locally are looked up on the PC. No 9.5 GB pack on the phone, yet every dictionary installed on the PC is available.
- **Manage audio sources → Fushi interconnect**: word pronunciations come from the PC's local pronunciation library.

**Cards go to the PC's Anki**

- Turn on **Mine to Fushi interconnect server** under the phone's **Fushi interconnect → Delegate to the Fushi interconnect server** (the same switch also lives in the mining settings): cards you make on the phone go through the PC, use the PC's deck and field settings and land in that Anki. No AnkiDroid / AnkiMobile needed on the phone.
- The manga OCR engine can also be set to **Run on the paired Fushi interconnect server**, so the phone downloads no model at all.

**Progress and statistics sync automatically**

- Reading / watching position, reading and watching time, lookup and mining counts, favourited words and sentences are **merged both ways** (the two switches under "Share with paired devices", on by default).

**Phone to PC**

- **Upload to interconnect peer** has four switches — books / dictionaries / audiobooks / videos — **all off by default**: tick the ones you want pushed from the phone to the PC.
- **Use interconnect as backup backend**: point the cloud-backup channel at the PC instead of a cloud drive.

## The PC can be a client too

Roles aren't fixed: desktop as host, laptop as client, and the laptop streams the desktop's anime and uses its dictionaries just the same. The only rule is that one device can't host and connect to another host at the same time — turn off the host service before switching roles.

## No PC that's always on? Use the headless server

On a NAS / home server / VPS you can run [fushi_server](https://github.com/hajisensai/Fushi/blob/develop/packages/fushi_server/README.md): a Fushi host without a GUI, with a WebUI; phones and PCs all connect to it as clients. Pairing is the same (Settings → Interconnect → add `<host>:38765`; the PIN shows in its terminal and on the WebUI "Pairing" page), and it can take over whole-volume manga OCR, subtitle transcription, anime downloads and subscriptions.

## Common situations

- **LAN devices keeps saying "No devices found"**: confirm the same Wi-Fi and that the PC's host service really says "Running"; AP isolation / guest networks block discovery — enter the address manually.
- **Manual address won't connect**: is port 38765 blocked by the PC's firewall; do `https://` / `http://` match the host's TLS switch.
- **Toggled the host's TLS switch**: paired devices have to pair again (the host page says so).
- **Remote video fails to load**: is the peer online and on the same network; a sleeping PC means a stopped host.
- **Removing a device**: on the host, **Host service → Paired devices → Remove**; on the client, delete it under "Added peers".
- **"Re-pair"**: every device in the peer list has this button; if the token ever breaks, one tap runs pairing again.
