# fushi.moe — conventions for AI agents

Site layout, build and verification live in README.md; this file is only the working rules (same content as CLAUDE.md).

## FAQ (`faq/`)

- **Every article ships in three languages**: the Simplified Chinese original `faq/<slug>.md`, an English translation
  `faq/<slug>.en.md` (`lang: en`, written by hand) and a Traditional Chinese version `faq/<slug>.zh-HK.md` (`lang: zh-HK`,
  generated from the Simplified original by `npm run faq:zh-hk` — **never edit it by hand**).
  One language alone is not done; `tool/lang-routes.test.mjs` fails when a file is missing or the zh-HK output is stale.
- Keep `order` / `date` / `draft` identical between the English version and the original; `category` is written in each language
  (Chinese 「视频」 ↔ English "Video" — the mapping is visible in any existing pair), and one Chinese group must always map to the same
  English name. A new group must appear in both languages.
- Internal links in the English version: `/faq/<slug>` → `/faq/<slug>.en`, `/zh-cn/download` → `/download`, `/zh-cn/immersion` → `/immersion`.
- Workflow: write Simplified → write English → run `npm run faq:zh-hk` → run the unit tests.
- When a factual change lands in the Chinese original (steps, setting names, platform support), mirror it in English and regenerate zh-HK; pure wording polish may skip English but zh-HK is still regenerated.
- Frontmatter fields, "the title is the question", no H1 in the body — see README "常见问题" and the template comment in `faq/free.md`.
- Describe Fushi features from the [hajisensai/Fushi](https://github.com/hajisensai/Fushi) repo: the string table
  (`fushi/lib/i18n/strings_zh-CN.i18n.json`), `docs/specs`, `docs/bugs`. Copy setting names verbatim; do not guess.
- No instructions for obtaining pirated content; nothing about network proxies.

## Scope

- Touch pages outside the FAQ (home `public/index.html`, download, immersion) only when asked.
- Do not commit or push on your own; PRs are the user's call.

## Verification

- `node --test tool/lang-routes.test.mjs` must pass. After changing the shell / sidebar / styles, run `npm run docs:build` then
  `node tool/verify-faq.mjs` (point `FUSHI_BROWSER` at Edge if local Chrome does not expose a CDP port).
