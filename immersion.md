---
title: "Immersion learning"
description: "A complete starter guide to learning a language through immersion: why immersion, what it is, and steps 0–3 from kana and Anki decks to mining cards while you watch."
head:
  - - meta
    - name: "fushi-title"
      content: "{imm.title} | Fushi"
  - - meta
    - name: "fushi-description"
      content: "{imm.meta.desc}"
  - - link
    - rel: "canonical"
      href: "https://fushi.moe/immersion"
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:site_name"
      content: "Fushi"
  - - meta
    - property: "og:title"
      content: "Immersion learning"
  - - meta
    - property: "og:description"
      content: "A complete starter guide to learning a language through immersion: why immersion, what it is, and steps 0–3 from kana and Anki decks to mining cards while you watch."
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/immersion"
  - - meta
    - property: "og:locale"
      content: "en_US"
  - - meta
    - name: "twitter:card"
      content: "summary"
  - - link
    - rel: "alternate"
      hreflang: "zh-CN"
      href: "https://fushi.moe/zh-cn/immersion"
  - - link
    - rel: "alternate"
      hreflang: "zh-HK"
      href: "https://fushi.moe/zh-hk/immersion"
  - - link
    - rel: "alternate"
      hreflang: "en"
      href: "https://fushi.moe/immersion"
  - - link
    - rel: "alternate"
      hreflang: "ja"
      href: "https://fushi.moe/ja/immersion"
  - - link
    - rel: "alternate"
      hreflang: "ko"
      href: "https://fushi.moe/ko/immersion"
  - - link
    - rel: "alternate"
      hreflang: "de"
      href: "https://fushi.moe/de/immersion"
  - - link
    - rel: "alternate"
      hreflang: "es"
      href: "https://fushi.moe/es/immersion"
  - - link
    - rel: "alternate"
      hreflang: "fr"
      href: "https://fushi.moe/fr/immersion"
  - - link
    - rel: "alternate"
      hreflang: "it"
      href: "https://fushi.moe/it/immersion"
  - - link
    - rel: "alternate"
      hreflang: "nl"
      href: "https://fushi.moe/nl/immersion"
  - - link
    - rel: "alternate"
      hreflang: "pt-BR"
      href: "https://fushi.moe/pt-br/immersion"
  - - link
    - rel: "alternate"
      hreflang: "ru"
      href: "https://fushi.moe/ru/immersion"
  - - link
    - rel: "alternate"
      hreflang: "tr"
      href: "https://fushi.moe/tr/immersion"
  - - link
    - rel: "alternate"
      hreflang: "vi"
      href: "https://fushi.moe/vi/immersion"
  - - link
    - rel: "alternate"
      hreflang: "th"
      href: "https://fushi.moe/th/immersion"
  - - link
    - rel: "alternate"
      hreflang: "id"
      href: "https://fushi.moe/id/immersion"
  - - link
    - rel: "alternate"
      hreflang: "ar"
      href: "https://fushi.moe/ar/immersion"
  - - link
    - rel: "alternate"
      hreflang: "x-default"
      href: "https://fushi.moe/immersion"
---

<style>
/*
 * 沉浸页：正文 + 侧注。
 *
 * 正文仍走 prose.css 的 692px 单栏；讲解 / 引用句写成 markdown 引用块（>），
 * 这里把引用块浮到正文右侧当侧注（Tufte 式 sidenote）。引用块在源码里放在
 * 它所解释的段落**之前**，浮动才会和那一段顶端对齐。
 * 右侧放不下（视口 < 1340px：692 正文 + 两侧各 300 侧注 + 22 内边距）时
 * 侧注折回正文流，变成段落之间的浅灰卡片。
 *
 * 正文是带 data-i18n 键的 HTML，不是 markdown：站点语言切换靠 site.js 按键换 innerHTML，
 * 默认文本是 zh-CN。文案与 17 个字典由同一份内容对象生成（tool/build_immersion_i18n.mjs），
 * 别手改这里的段落，改内容对象后重新生成。
 */
.immersion .note { font-size: 15px; color: var(--ink-2); margin: -8px 0 40px; }
.immersion h4 { font-size: 17px; font-weight: 600; line-height: 1.4; margin: 28px 0 6px; }
.immersion h4 + p { margin-top: 0; }

/* ---- 侧注 ---- */
.immersion blockquote {
  float: right; clear: right; width: 260px;
  margin: 4px -300px 16px 32px; padding-left: 14px;
  border-left: 2px solid var(--hairline);
  font-size: 14px; line-height: 1.55; color: var(--ink-2);
}
.immersion blockquote p { margin: 0 0 8px; }
.immersion blockquote p:last-child { margin-bottom: 0; }
.immersion blockquote ul { margin: 6px 0 0; padding-left: 1.2em; }
.immersion blockquote li { margin: 4px 0; }
.immersion blockquote strong { color: var(--ink); }
.immersion blockquote cite { display: block; font-style: normal; margin-top: 6px; }
@media (max-width: 1340px) {
  .immersion blockquote {
    float: none; width: auto; margin: 16px 0; padding: 12px 16px;
    border-left: 0; border-radius: 12px; background: var(--alt);
  }
}

/* ---- 默认折叠的原理段 ---- */
.immersion details.theory {
  margin: 24px 0; padding: 0 20px; border-radius: 16px; background: var(--alt);
}
.immersion details.theory summary {
  cursor: pointer; list-style: none; padding: 16px 0;
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  font-size: 17px; font-weight: 600; color: var(--ink);
}
.immersion details.theory summary::-webkit-details-marker { display: none; }
.immersion details.theory summary::after {
  content: "+"; font-size: 22px; font-weight: 400; line-height: 1; color: var(--ink-2);
}
.immersion details.theory[open] summary::after { content: "−"; }
.immersion details.theory[open] summary { border-bottom: 1px solid var(--hairline); }
.immersion details.theory p { margin: 14px 0; }
.immersion details.theory > :last-child { padding-bottom: 18px; }
/* ---- 长讲解块（FAQ、第 3 步的整段）：文档里也是引用块，但六七百字浮到 260px 侧栏
   会拖出一千多像素、压住后面的侧注，所以走正文流里的灰卡 ---- */
.immersion aside {
  margin: 24px 0; padding: 4px 20px 18px; border-radius: 16px; background: var(--alt);
  font-size: 15px; line-height: 1.6;
}
.immersion aside h4 { margin: 18px 0 4px; font-size: 16px; }
.immersion aside p { margin: 10px 0; }
.immersion aside ul { margin: 8px 0; }

/* 折叠盒里的引用块不再外浮：盒子有底色，悬在盒外像掉出来的 */
.immersion details.theory blockquote {
  float: none; width: auto; margin: 14px 0; padding: 12px 16px;
  border-left: 2px solid var(--hairline); border-radius: 0; background: transparent;
}

/* ---- 术语气泡：桌面悬停、手机点按 ----
   气泡挂在**段落**上而不是词上：挂在词上时 left:0 + 340px 宽会伸出视口右缘，
   visibility:hidden 仍占滚动宽度，手机上整页被撑到 543px（实测）。
   挂段落 + display:none 两条一起：不显示时零占位，显示时宽度受段落约束。 */
.immersion :is(p, li, h3, h4):has(.term) { position: relative; }
.immersion .term { cursor: help; outline: none; border-bottom: 1px dotted var(--ink-2); }
/* 两种写法：带链接的用子元素 .term-tip；纯文字的写在 data-tip 里由 ::after 渲染——
   标题里只能用后者，VitePress 的锚点 id 取标题文本，子元素的气泡文字会被揉进去 */
.immersion .term-tip,
.immersion .term[data-tip]::after {
  display: none; position: absolute; left: 0; bottom: calc(100% + 8px); z-index: 5;
  max-width: min(420px, 100%); padding: 12px 14px; border-radius: 12px;
  background: var(--ink); color: var(--band-ink); text-align: left; white-space: normal;
  font-size: 14px; line-height: 1.5; font-weight: 400; letter-spacing: 0;
}
.immersion .term[data-tip]::after { content: attr(data-tip); }
.immersion .term:hover .term-tip,
.immersion .term:focus .term-tip,
.immersion .term:focus-within .term-tip,
.immersion .term[data-tip]:hover::after,
.immersion .term[data-tip]:focus::after { display: block; }
</style>

<div class="immersion vp-raw" dir="auto">

<h1 data-i18n="imm.title">Immersion learning</h1>
<p class="note" data-i18n="imm.note">This guide uses Japanese as the example; the same approach works for any language.</p>

<h2 data-i18n="imm.fit.h">Is immersion for me?</h2>
<p data-i18n="imm.fit.p1">Textbooks and drills — I doubt many people genuinely enjoy them. Where does the motivation come from for something you dislike, and how long can it last?</p>
<p data-i18n="imm.fit.p2"><b>Immersion is different. It has exactly one requirement: a genuine interest in the content — anime, variety shows, films, novels, games, manga, anything you enjoy.</b></p>
<p data-i18n="imm.fit.p3">No prior knowledge, no talent, not even “resolve” needed. All it takes is a willingness to engage with the content.</p>
<p data-i18n="imm.fit.p4">Pick content you love. Nothing matters more.</p>

<h2 data-i18n="imm.what.h">What is immersion?</h2>
<p data-i18n="imm.what.p1">Listening to and reading things made by native speakers for native speakers: anime, novels, games, variety shows — things made for a native audience. Every show you watch and every game you play already counts.</p>
<p data-i18n="imm.what.p2">Instead of “learn first, use later”, immersion lets you learn naturally by using.</p>
<p data-i18n="imm.what.p3">Immersion is the road every language learner has to walk eventually. Vocabulary drills, grammar study and exercises give you a foundation, but a language is far too vast for any textbook to cover. You can read this paragraph effortlessly not because you memorised grammar rules, but because more than a decade of massive input in your native language built countless intuitions in your brain. A foreign language works the same way: that intuition only comes from large amounts of real input.</p>
<p data-i18n="imm.what.p4">Immersion does start with a stretch where you understand almost nothing. But because you chose content you love, you can keep watching even without understanding all of it. Fast or slow, a lot or a little — what matters most is your interest in the content itself.</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">How does immersion learning work?</summary>
<p data-i18n="imm.theory.p1">Language isn’t “learned”, it’s acquired. You never memorised grammar tables for your mother tongue, yet you speak it more naturally than any grammar book could teach — thanks to one thing only: massive amounts of input you mostly understood.</p>
<blockquote><p data-i18n="imm.theory.quote">“We acquire language in only one way: by understanding messages.”</p><cite data-i18n="imm.theory.cite">— Stephen Krashen</cite></blockquote>
<p data-i18n="imm.theory.p2">Knowing a word’s meaning is only the first step. To acquire an intuition for how the word is used, you have to meet it — and understand it — many times across many different contexts.</p>
<p data-i18n="imm.theory.p3">Immersion exposes you to exactly that variety. Every time you see a word and understand it, your intuition sharpens. Eventually it becomes clear enough that you simply know how the word is used.</p>
</details>

<h2 data-i18n="imm.start.h">Getting started</h2>

<h3 data-i18n="imm.s0.h">Step 0: Set up Fushi</h3>
<blockquote><p data-i18n="imm.s0.side">The recommended pack in the onboarding guide already bundles the common dictionaries and audio libraries — no need to hunt for resources yourself.</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/download">Download Fushi</a> and follow the onboarding guide: dictionaries, word-audio database, then install and connect <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, named after 暗記 (anki, “memorisation”), is the most widely used <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced repetition system (SRS)</a> in the world and the tool Fushi integrates with by default. Hand it anything you want to remember and it schedules reviews so you get the best retention for the least study time.</span></span>. From then on, one tap looks a word up while you watch or read, and another tap makes an <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, named after 暗記 (anki, “memorisation”), is the most widely used <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced repetition system (SRS)</a> in the world and the tool Fushi integrates with by default. Hand it anything you want to remember and it schedules reviews so you get the best retention for the least study time.</span></span> card with the sentence, audio and screenshot.</p>

<h3 data-i18n="imm.s1.h">Step 1: Learn the <span class="term" tabindex="0" data-tip="The Japanese syllabaries: hiragana and katakana, 46 basic sounds each, laid out in five vowel rows and ten consonant columns — hence the Japanese name “fifty sounds”. They are the foundation of written Japanese and the one thing you must get through before vocabulary.">kana</span></h3>
<ul>
<li data-i18n="imm.s1.li1">Recommended: <a href="https://kanabr.vercel.app/">kanabr</a> (<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>), a typing trainer by <a href="https://l-m-sherlock.github.io/">L-M-Sherlock</a> that unlocks kana step by step — and teaches you to type Japanese along the way.</li>
<li data-i18n="imm.s1.li2">Or any tool you like.</li>
</ul>
<p data-i18n="imm.s1.p">Getting through hiragana is enough. It doesn’t need to be solid — vocabulary study will reinforce it over and over.</p>

<h3 data-i18n="imm.s2.h">Step 2: Core vocabulary and grammar</h3>
<blockquote><p data-i18n="imm.s2.side">5–20 new cards a day is plenty, and you can lower the <span class="term" tabindex="0" data-tip="The “desired retention” setting of Anki’s FSRS algorithm, 90% by default. Lowering it to 70–80% cuts the daily review load noticeably at the cost of forgetting a little more — a good trade early on, when immersion has your back.">desired retention</span> to 70–80%. <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, named after 暗記 (anki, “memorisation”), is the most widely used <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced repetition system (SRS)</a> in the world and the tool Fushi integrates with by default. Hand it anything you want to remember and it schedules reviews so you get the best retention for the least study time.</span></span> reviews pile up after two or three weeks; adding too many new cards is why most people quit <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, named after 暗記 (anki, “memorisation”), is the most widely used <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced repetition system (SRS)</a> in the world and the tool Fushi integrates with by default. Hand it anything you want to remember and it schedules reviews so you get the best retention for the least study time.</span></span>.</p></blockquote>
<p data-i18n="imm.s2.lead">Recommended <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, named after 暗記 (anki, “memorisation”), is the most widely used <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced repetition system (SRS)</a> in the world and the tool Fushi integrates with by default. Hand it anything you want to remember and it schedules reviews so you get the best retention for the least study time.</span></span> decks:</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="A beginner Anki vocabulary deck: about 1,500 high-frequency Japanese words chosen by frequency, each card with an example sentence, audio and pitch accent. Made by The Moe Way community; kaishi means “beginning”."><b>Kaishi 1.5k</b></span>: <a href="https://github.com/donkuri/Kaishi">original deck</a> (with translations into several languages in the same repo).</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="A JLPT grammar reference based on the aiueo.cc grammar series (Onigiri’s Japanese Pronunciation Class): 757 grammar points from N5 to N1, each with example sentences recorded by a Japanese teacher."><b>Onigiri Grammar</b></span>: the Anki deck is Chinese-only, so use the <a href="https://aiueo.cc/pages_v2/en/grammars.php">Onigiri grammar guide</a> on aiueo.cc instead; up to <span class="term" tabindex="0" data-tip="Levels of the JLPT (Japanese-Language Proficiency Test): N5 is the easiest, N1 the hardest. Beginner grammar roughly covers N5–N4, and N3 is the threshold of intermediate; a grammar framework around N4 is enough to start immersing.">N3/N4</span> is enough.</li>
</ul>
<p data-i18n="imm.s2.p">While you’re still learning vocabulary, start the next step: immersion.</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">Q: Learning <span class="term" tabindex="0" data-tip="The Japanese syllabaries: hiragana and katakana, 46 basic sounds each, laid out in five vowel rows and ten consonant columns — hence the Japanese name “fifty sounds”. They are the foundation of written Japanese and the one thing you must get through before vocabulary.">kana</span> is so boring — is that normal?</h4>
<p data-i18n="imm.faq.a1a">Completely normal, and almost everyone feels the same.</p>
<p data-i18n="imm.faq.a1b">You don’t need to wait until you “enjoy learning kana” to begin — that day may never come. What you need is to start moving, even if it’s only five minutes a day, even if all you remembered today was あ.</p>
<p data-i18n="imm.faq.a1c">Progress itself creates motivation. The day you suddenly catch a word in an anime, all the tedious groundwork will feel worth it. But that day won’t arrive on its own — you have to get through the “I understand nothing” phase first.</p>
<h4 data-i18n="imm.faq.q2">Q: How much time should I spend on <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, named after 暗記 (anki, “memorisation”), is the most widely used <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced repetition system (SRS)</a> in the world and the tool Fushi integrates with by default. Hand it anything you want to remember and it schedules reviews so you get the best retention for the least study time.</span></span> each day?</h4>
<p data-i18n="imm.faq.a2a">Less than you think.</p>
<p data-i18n="imm.faq.a2b">15 to 30 minutes a day, depending on how much you can stomach, done properly, beats an occasional two-hour session by a wide margin. The reason is simple: habit matters more than intensity. A plan you can keep every day is worth far more than a “hardcore plan” you follow on and off.</p>
<p data-i18n="imm.faq.a2c">On a bad day, do just 5 minutes. 5 minutes counts. <b>A slow cart is fine; what matters is not falling off.</b> Once the habit breaks, restarting costs far more willpower than you’d expect.</p>
<h4 data-i18n="imm.faq.q3">Q: My memory is terrible and I keep forgetting — what do I do?</h4>
<p data-i18n="imm.faq.a3a">Forgetting is normal. Fighting it is the whole point of <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, named after 暗記 (anki, “memorisation”), is the most widely used <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced repetition system (SRS)</a> in the world and the tool Fushi integrates with by default. Hand it anything you want to remember and it schedules reviews so you get the best retention for the least study time.</span></span>.</p>
<p data-i18n="imm.faq.a3b">Not today, not tomorrow — but one day it sticks.</p>
</aside>

<h3 data-i18n="imm.s3.h">Step 3: Immerse, <span class="term" tabindex="0" data-tip="Turn a new word you met while immersing into an Anki card together with the sentence, audio and screenshot it came from. In Fushi it’s one tap to look up and one more to make the card.">mine cards</span> and study vocabulary at the same time</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">Learning a language means accepting one fact: you will not understand everything.</p>
<p data-i18n="imm.s3.c2">Many people feel they aren’t “ready” and want to study more before immersing — that never works. No matter how much you prepare, you won’t understand it all the first time you touch real material. Rather than avoiding the discomfort, dive in: the more ambiguity you can tolerate, the faster your brain picks the language up.</p>
<p data-i18n="imm.s3.c3"><b>If the ambiguity is unbearable</b></p>
<ul data-i18n="imm.s3.c4"><li><b>Spoil yourself first</b>: read a plot summary beforehand, or rewatch something you already know in your own language.</li><li><b>Native-language subtitles as a last resort</b>: normally not recommended (you learn little from them), but if you are completely lost, push on without them for a while and only flash them on when you must — or watch once without and once with.</li></ul>
</aside>
<p data-i18n="imm.s3.p1">Start with easy material — slice-of-life shows are easier than battle anime, light novels easier than literary fiction.</p>
<p data-i18n="imm.s3.p2">Watch what you love, tap unknown words to look them up, and <span class="term" tabindex="0" data-tip="Turn a new word you met while immersing into an Anki card together with the sentence, audio and screenshot it came from. In Fushi it’s one tap to look up and one more to make the card.">mine cards</span> when it feels worthwhile.</p>
<p data-i18n="imm.s3.p3">Vocabulary study is the one active, non-immersion method that matters: early on it builds your vocabulary fast.</p>

</div>
