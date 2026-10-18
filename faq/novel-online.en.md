---
title: "How do I read web novels online in Fushi with LNReader plugins, and download them as EPUB to my bookshelf?"
description: "Fushi supports LNReader novel plugins: add a plugin repository yourself, install novel sources, then search and read web novels online with tap-to-look-up and card mining; or download a range of chapters as an EPUB with a table of contents and illustrations to read offline from your bookshelf. Available on Windows, macOS, Android and Linux; iOS doesn't have this feature."
category: "Books"
order: 64
date: 2026-10-18
lang: en
---

Want to practise reading with Japanese web novels without copying web pages by hand? Fushi has a built-in runtime for [LNReader](https://github.com/LNReader/lnreader-plugins) plugins: each plugin corresponds to one novel website, and once installed you can search, browse chapter lists and read online right inside Fushi. While reading, you **tap words to look them up and tap the plus to mine cards** just as with a normal EPUB, and reading position and statistics are recorded as usual. To read offline, download a range of chapters as one EPUB into your bookshelf.

## First, check your platform

- **Windows, macOS, Android**: available.
- **Linux** (built from source): available; plugins run on the system's WPE WebKit. If that component is missing, the novel source page tells you what's missing and what to install.
- **iOS**: **not available**. Under App Store review rules the iOS version ships with no online sources at all (no manga, video or novel sources); the bookshelf, reading local books, lookups and mining are unaffected. To read web novels on iOS, download them as EPUB on a computer and import them, or read them from the computer through [Fushi interconnect](/faq/interconnect.en).

## Step 1: add a plugin repository (Fushi doesn't include any)

LNReader plugins are third-party scripts that fetch content from websites; Fushi doesn't maintain them. **Fushi doesn't include any novel plugin repository**: the list is empty the first time you open it, and you need to add a repository you trust yourself.

1. Open **Browse → Extensions** in the bottom bar and choose **Novels** as the content type at the top. The "Extensions" sub-tab of Books is the same page.
2. Tap **Stores** in the header, then **Add extension store**.
3. Paste the repository's index URL. An LNReader repository index is a JSON file (usually called `plugins.min.json`) provided by the repository's author; if the address is wrong or the content isn't an LNReader plugin index, you get an error and nothing is added. Before adding, Fushi warns you to "only add repositories you trust" — plugins are scripts that run on your device and visit websites on your behalf, so don't add repositories of unknown origin.

Later, tap **Refresh stores** when a repository has updates; if its address changes, use **Edit repository URL**; when you no longer need it, **Remove extension store**.

A note for long-time users: earlier versions shipped with the official LNReader repository built in. If you installed plugins from it back then, after upgrading it's kept as an ordinary repository entry that you can delete like any you added yourself; if you never used it, it won't appear any more.

Browse missing from the bottom bar? "Browse" is a feature module you can switch on and off; enable it under **Settings → Appearance and interaction → Feature modules**. The "Sources" and "Extensions" sub-tabs on the Books page don't depend on that switch.

## Step 2: install novel sources

Once a repository is added, the extension list shows the plugins it provides. You can filter by **Language** (pick Japanese if you're learning Japanese) and search plugin names.

- Tap **Install** for a single plugin, or **Bulk install** for several at once;
- When the repository has a newer version, tap **Update**, or **Update all**.

Installed plugins appear under **Browse → Sources** (choose "Novels") and in the "Sources" sub-tab of Books. Pin the ones you use often with **Pin to top**; if a plugin has stored data such as login tokens and you want it gone, use **Clear source data** (the plugin itself stays installed).

## Step 3: search and read online

Open a source:

- **Popular / Latest** browse the site's rankings, and **Search novels** at the top finds works by keyword; if the plugin supports it there are also **Filters** (genre, status, etc.).
- Tapping a work opens its detail page: cover, author, status (Ongoing, Completed, On hiatus…), synopsis and the full **Chapters** list.

Tap **Read online** to open it in Fushi's reader. The first time you open a work online, Fushi creates the book in your bookshelf with its table of contents and cover, and only fetches a chapter's text from the website when you reach that chapter, so there's no waiting for the whole book. Chapters you've read are cached; if you're offline and open a chapter that hasn't been loaded, you'll see "This chapter hasn't been loaded yet" — reopen the chapter once you're back online.

A book read online is just an ordinary book in your bookshelf: paginated / scroll / visual-novel modes, vertical and horizontal text, fonts and sizes all work (see [Which reading mode should I use?](/faq/reader-modes.en) and [Typography settings](/faq/reader-typography.en)), and lookups, mining and reading statistics are exactly the same as with a normal EPUB — see [How do I read EPUB light novels in Fushi?](/faq/epub-reader.en).

To follow a work long-term, tap **Add to bookshelf** on its detail page; for works already in your bookshelf the main button becomes **Continue reading**. Don't want it any more? Tap **Remove from bookshelf** — this also deletes the cached chapters and your reading progress.

## Step 4: download a range of chapters as EPUB

Reading online depends on the website. To go fully offline or read on another device, download:

1. Tap **Download** on the detail page to open the **Download chapters** dialog;
2. Drag the range slider to choose the first and last chapter; the dialog shows "Chapters X–Y (N) will be saved to your bookshelf as one EPUB"; for the whole work tap **All chapters**;
3. Tap **Download**; progress shows which chapter is being fetched, then "Building EPUB…"; when it's done you're told it was added to the bookshelf.

You can also tap "Download from this chapter" next to a chapter in the list to start the range right there.

The result is a standard EPUB: **every chapter title goes into the table of contents**, and the cover and in-chapter illustrations are packed in. From then on it's exactly like a book you imported yourself — no longer dependent on the website, and you can even pair it with an audiobook. If a chapter fails mid-download, you're told which one, so you can download again from there; cancelling midway doesn't leave half a book behind.

## Common situations

- **Site verification prompt**: the website uses a human check such as Cloudflare and the plugin's requests were blocked. Tap the "Site verification" button that appears and pass the check in the page that opens; subsequent requests carry the result automatically. Fushi never pops up verification pages in the background — only when you tap the button.
- **The Sources page says there are no novel sources yet**: no plugin is installed; install one under "Extensions" first.
- **The extension list is empty**: no repository has been added yet — see step 1.
- **Nothing found / chapters fail to load**: usually the website changed and the plugin hasn't caught up; wait for the repository to update the plugin and tap "Update". You can also use "Open on website" in the detail page's menu to check whether the site itself is working.
- **Copyright**: plugins only help you access websites; the content comes from the source sites. Follow each site's terms of use, and prefer platforms where authors publish their own work.

Manga and video have similar online source extensions; for how they work, see [What are Mihon / Aniyomi extensions?](/faq/mihon.en). Haven't installed Fushi yet? Pick your platform on the [download page](/download).
