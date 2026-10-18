---
title: "How do I read EPUB light novels in Fushi, look up words with a tap and mine cards?"
description: "Import an EPUB light novel into Books and it opens in a vertical-text reader: tap any word for a dictionary popup, tap the plus to turn it into an Anki card with the sentence and the book cover (plus narration audio for audiobooks). Paginated, scroll and visual-novel modes; progress and reading speed are tracked automatically."
category: "Books"
order: 61
date: 2026-10-18
lang: en
---

The annoying part of reading Japanese light novels isn't the number of unknown words — it's that **every lookup takes you out of the book**: switch to a dictionary app, type the kana, switch back and find your place. Fushi's reader collapses that into one tap: the dictionary popup floats over the text, you close it and keep reading, and a word worth keeping goes to Anki with one more tap. Below is the whole path — add to Books → open → look up → mine → track progress. Examples are Japanese, but books in other languages work the same way.

## Step 1: put the book in Books

In the bottom bar go to **Books → Import**, tap **Import book**, choose your `.epub` under **Pick book file**, fill in the title and import. A whole folder of books can be scanned in one go with **Import folder**; on desktop you can also drag files straight into the window. Besides EPUB you can import PDF and plain text such as TXT — details in [Which book formats can Fushi import?](/faq/book-import.en).

Fushi can only open files **without DRM**. If a book you bought from an e-book store is DRM-protected (encrypted), the reader can't open it, and that is not something Fushi can get around; when buying, prefer stores that sell DRM-free EPUB.

No books yet and want some free web novels to practise on? See [How do I read web novels online with LNReader plugins?](/faq/novel-online.en).

## Step 2: open the book and get to know the reader

Tap a book in Books to open the reader. The default is **vertical text, paginated**, read right to left just like a paper bunkobon.

Control bars sit at the top and bottom of the screen. The "Floating control bar" is on by default: leave it alone for a few seconds and it hides itself; tap an empty spot in the text to bring it back. The buttons you'll use most:

- **Navigation**: three pages — **Contents** (jump to a chapter), **Favorites** (sentences you saved), **Search** (search the whole book, or jump straight to a character position);
- **Browse illustrations**: all the book's illustrations as a wall; tap one to jump there;
- **Reading statistics**: how much you've read this session, this chapter and this book, and the **Time to finish** at your current speed;
- **Audiobook**: opens the playback panel when the book has narration audio — see [How do I use audiobooks?](/faq/audiobook.en);
- **Reader settings**: font size, line height, vertical / horizontal text, theme and page turning all live here and apply immediately — see [Reader typography settings](/faq/reader-typography.en).

There's more than one way to turn pages: swipe left or right (on a computer, dragging horizontally with the mouse works too), the mouse wheel, the arrow keys or PageUp / PageDown; tapping an empty spot in the text shows / hides the control bars. On Android you can also enable "Volume button page turning" under **Reader settings → Turning & gestures**. If paginated vertical text doesn't suit you, switch to scroll or visual-novel mode — the differences are explained in [Paginated, scroll or visual novel: which reading mode should I use?](/faq/reader-modes.en).

## Step 3: tap a word to look it up

This is the heart of the reader. You need at least one dictionary installed (for Japanese, just install the recommended pack — see [What is the recommended pack?](/faq/pack.en)).

- **Phone / tablet**: tap a word. Fushi takes a run of text starting at the character you tapped and lets the dictionary find the longest match, so you never have to select anything by hand — tap the first character of 「食べられなかった」 and the dictionary resolves it to 「食べる」 and explains the conjugation.
- **Computer**: clicking works the same way; you can also hold **Shift** and move the mouse over the text to get the popup directly. If holding Shift is a chore, turn on "Look up on hover" under **Reader settings → Lookup** and simply resting the mouse on a character looks it up (desktop only).
- **Keyboard / gamepad**: the "Enter lookup cursor" shortcut puts a cursor into the text; move it one character at a time with the arrow keys and press confirm to look up — you can finish a whole book without touching the mouse.

Unknown words inside a definition? **Keep tapping inside the popup** and look them up layer by layer; when you're done, tap outside the popup or swipe it away. If the floating popup covers the text while reading novels, enable "Dock only in novels" in the lookup settings: the popup becomes a full-width panel pinned to the bottom of the screen, for novels only — manga, video and games are unaffected. With "Auto read word on lookup" on, each lookup also plays the word's pronunciation.

If the book has furigana (ruby readings) and you've set furigana to "Toggle", tapping a hidden reading only reveals that word's reading without triggering a lookup — handy for guessing the reading first and then checking.

## Step 4: tap the plus to mine a word worth keeping

Next to each entry in the popup there's a plus. Tap it and the word becomes a card in Anki. If you haven't connected Anki yet, read [How do I connect Anki?](/faq/anki.en) first.

A card mined from a book carries:

- **The sentence**: the sentence you looked the word up in, with the word in bold;
- **An image**: the book's cover, so during reviews you recognise at a glance which book it came from;
- **Sentence audio**: when the book has an audiobook and this sentence is matched to the audio, the card includes that sentence's narration;
- **Word audio**: added automatically when a pronunciation audio library is installed.

Cards use the built-in Lapis template by default. For which words are worth mining and how many per day, see the advice in [It's installed — how do I mine cards while watching anime?](/faq/first-card.en).

## Step 5: progress, statistics and switching devices

- **Reading position is saved automatically**, down to the character; close the app, reopen it, and you're back on the same sentence.
- **Reading statistics**: reading time and reading speed (chars/h) are logged per book and per day; the reader's "Reading statistics" shows this book, the statistics page shows long-term trends.
- **Multiple devices**: with [Fushi interconnect](/faq/interconnect.en) or sync set up, pick up on your computer where you left off on your phone.

## Common situations

- **Tapping a word does nothing / the popup is empty**: most likely no dictionary is installed yet, or the dictionary's language doesn't match the book's.
- **"Failed to open book" right away**: the file may have DRM, or the EPUB itself is broken; if other readers can't open it either, it's the file.
- **The whole book is images and nothing is tappable**: it's a scanned book (each page is a picture) with no text inside. Long-press the book in Books and choose "Convert to manga"; once manga OCR has recognised it, the text becomes tappable — see [How do I read manga online and OCR the text for mining?](/faq/manga-online.en).
- **Unhappy with the font, size, or vertical / horizontal layout**: it's all in **Reader settings** — see [Reader typography settings](/faq/reader-typography.en).

Fushi is free and open source; the reader works on Windows, macOS (Apple Silicon), Android and iOS, and Linux can be built from source. Pick your platform on the [download page](/download).
