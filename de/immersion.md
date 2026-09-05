---
title: "Lernen durch Immersion"
description: "Ein kompletter Einstieg ins Sprachenlernen durch Immersion: warum Immersion, was sie ist, und die Schritte 0–3 von Kana und Anki-Decks bis zum Kartenerstellen beim Schauen."
head:
  - - meta
    - name: "fushi-title"
      content: "{imm.title} | Fushi"
  - - meta
    - name: "fushi-description"
      content: "{imm.meta.desc}"
  - - link
    - rel: "canonical"
      href: "https://fushi.moe/de/immersion"
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:site_name"
      content: "Fushi"
  - - meta
    - property: "og:title"
      content: "Lernen durch Immersion"
  - - meta
    - property: "og:description"
      content: "Ein kompletter Einstieg ins Sprachenlernen durch Immersion: warum Immersion, was sie ist, und die Schritte 0–3 von Kana und Anki-Decks bis zum Kartenerstellen beim Schauen."
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/de/immersion"
  - - meta
    - property: "og:locale"
      content: "de_DE"
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

<h1 data-i18n="imm.title">Lernen durch Immersion</h1>
<p class="note" data-i18n="imm.note">Dieser Leitfaden nimmt Japanisch als Beispiel; der Ansatz funktioniert für jede Sprache.</p>

<h2 data-i18n="imm.fit.h">Ist Immersion etwas für mich?</h2>
<p data-i18n="imm.fit.p1">Lehrbücher und Übungen – ich bezweifle, dass viele daran wirklich Freude haben. Woher soll die Motivation für etwas kommen, das man nicht mag, und wie lange hält sie?</p>
<p data-i18n="imm.fit.p2"><b>Immersion ist anders. Sie hat genau eine Voraussetzung: echtes Interesse an den Inhalten – Anime, Shows, Filme, Romane, Spiele, Manga, was immer dir gefällt.</b></p>
<p data-i18n="imm.fit.p3">Keine Vorkenntnisse, kein Talent, nicht einmal ein „Entschluss“ nötig. Es reicht, dass du dich mit den Inhalten beschäftigen willst.</p>
<p data-i18n="imm.fit.p4">Wähle Inhalte, die du liebst. Nichts ist wichtiger.</p>

<h2 data-i18n="imm.what.h">Was ist Immersion?</h2>
<p data-i18n="imm.what.p1">Hören und lesen, was Muttersprachler für Muttersprachler machen: Anime, Romane, Spiele, Shows – Dinge, die für ein muttersprachliches Publikum gemacht sind. Jede Serie, die du schaust, und jedes Spiel, das du spielst, zählt schon.</p>
<p data-i18n="imm.what.p2">Statt „erst lernen, dann anwenden“ lernst du bei der Immersion ganz nebenbei beim Anwenden.</p>
<p data-i18n="imm.what.p3">Immersion ist der Weg, den am Ende jeder gehen muss. Vokabeln pauken, Grammatik lernen und Übungen geben dir eine Grundlage, aber eine Sprache ist viel zu groß für jedes Lehrbuch. Du kannst diesen Absatz mühelos lesen – nicht, weil du Grammatikregeln auswendig gelernt hast, sondern weil mehr als ein Jahrzehnt massiver Input in deiner Muttersprache unzählige Intuitionen in deinem Gehirn aufgebaut hat. Bei einer Fremdsprache ist es genauso: Diese Intuition entsteht nur aus großen Mengen echten Inputs.</p>
<p data-i18n="imm.what.p4">Am Anfang gibt es bei der Immersion tatsächlich eine Phase, in der du fast nichts verstehst. Aber weil du Inhalte gewählt hast, die du liebst, kannst du weiterschauen, auch wenn du nicht alles verstehst. Ob schnell oder langsam, ob viel oder wenig – am wichtigsten ist dein Interesse an den Inhalten selbst.</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">Wie funktioniert Lernen durch Immersion?</summary>
<p data-i18n="imm.theory.p1">Sprache wird nicht „gelernt“, sondern erworben. Du hast für deine Muttersprache nie Grammatiktabellen auswendig gelernt und sprichst sie doch natürlicher, als jedes Grammatikbuch es beibringen könnte – nur dank einer Sache: riesigen Mengen Input, den du größtenteils verstanden hast.</p>
<blockquote><p data-i18n="imm.theory.quote">„Wir erwerben Sprache auf nur eine Weise: indem wir Botschaften verstehen.“</p><cite data-i18n="imm.theory.cite">– Stephen Krashen</cite></blockquote>
<p data-i18n="imm.theory.p2">Die Bedeutung eines Wortes zu kennen ist nur der erste Schritt. Um ein Gefühl dafür zu bekommen, wie es verwendet wird, musst du ihm viele Male in vielen verschiedenen Zusammenhängen begegnen – und es verstehen.</p>
<p data-i18n="imm.theory.p3">Genau diese Vielfalt liefert Immersion. Jedes Mal, wenn du ein Wort siehst und verstehst, wird deine Intuition schärfer. Irgendwann ist sie so klar, dass du einfach weißt, wie das Wort gebraucht wird.</p>
</details>

<h2 data-i18n="imm.start.h">Loslegen</h2>

<h3 data-i18n="imm.s0.h">Schritt 0: Fushi einrichten</h3>
<blockquote><p data-i18n="imm.s0.side">Das empfohlene Paket in der Einführung enthält die gängigen Wörterbücher und Audiobibliotheken schon gebündelt – du musst nichts selbst zusammensuchen.</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/de/download">Fushi herunterladen</a> und der Einführung folgen: Wörterbücher, Wortaudio-Datenbank, dann <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, benannt nach 暗記 (anki, „Auswendiglernen“), ist das weltweit meistgenutzte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">Spaced-Repetition-System (SRS)</a> und das Werkzeug, mit dem Fushi standardmäßig zusammenarbeitet. Gib ihm alles, was du dir merken willst, und es plant die Wiederholungen so, dass du mit möglichst wenig Lernzeit möglichst viel behältst.</span></span> installieren und verbinden. Danach schlägst du beim Schauen oder Lesen mit einem Tipp nach, und ein zweiter Tipp erzeugt eine <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, benannt nach 暗記 (anki, „Auswendiglernen“), ist das weltweit meistgenutzte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">Spaced-Repetition-System (SRS)</a> und das Werkzeug, mit dem Fushi standardmäßig zusammenarbeitet. Gib ihm alles, was du dir merken willst, und es plant die Wiederholungen so, dass du mit möglichst wenig Lernzeit möglichst viel behältst.</span></span>-Karte mit Satz, Audio und Screenshot.</p>

<h3 data-i18n="imm.s1.h">Schritt 1: Die <span class="term" tabindex="0" data-tip="Die japanischen Silbenschriften Hiragana und Katakana mit je 46 Grundlauten, angeordnet in fünf Vokalreihen und zehn Konsonantenspalten – daher der japanische Name „fünfzig Laute“. Sie sind die Grundlage der japanischen Schrift und das Einzige, was du vor dem Vokabellernen durchhaben musst.">Kana</span> lernen</h3>
<ul>
<li data-i18n="imm.s1.li1">Empfehlung: <a href="https://kanabr.vercel.app/">kanabr</a> (<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>), ein Tipptrainer von <a href="https://l-m-sherlock.github.io/">L-M-Sherlock</a>, der die Kana Schritt für Schritt freischaltet – und dir nebenbei beibringt, Japanisch zu tippen.</li>
<li data-i18n="imm.s1.li2">Oder jedes andere Werkzeug, das dir gefällt.</li>
</ul>
<p data-i18n="imm.s1.p">Einmal durch die Hiragana reicht. Sie müssen nicht sitzen – das Vokabellernen festigt sie immer wieder.</p>

<h3 data-i18n="imm.s2.h">Schritt 2: Grundwortschatz und Grammatik</h3>
<blockquote><p data-i18n="imm.s2.side">5–20 neue Karten pro Tag genügen, und du kannst die <span class="term" tabindex="0" data-tip="Die Einstellung „gewünschte Behaltensrate“ von Ankis FSRS-Algorithmus, standardmäßig 90 %. Auf 70–80 % gesenkt sinkt die tägliche Wiederholungslast spürbar, dafür vergisst du etwas mehr – anfangs ein guter Tausch, weil die Immersion dich auffängt.">gewünschte Behaltensrate</span> auf 70–80 % senken. <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, benannt nach 暗記 (anki, „Auswendiglernen“), ist das weltweit meistgenutzte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">Spaced-Repetition-System (SRS)</a> und das Werkzeug, mit dem Fushi standardmäßig zusammenarbeitet. Gib ihm alles, was du dir merken willst, und es plant die Wiederholungen so, dass du mit möglichst wenig Lernzeit möglichst viel behältst.</span></span>-Wiederholungen stapeln sich nach zwei bis drei Wochen; zu viele neue Karten sind der Grund, warum die meisten mit <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, benannt nach 暗記 (anki, „Auswendiglernen“), ist das weltweit meistgenutzte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">Spaced-Repetition-System (SRS)</a> und das Werkzeug, mit dem Fushi standardmäßig zusammenarbeitet. Gib ihm alles, was du dir merken willst, und es plant die Wiederholungen so, dass du mit möglichst wenig Lernzeit möglichst viel behältst.</span></span> aufhören.</p></blockquote>
<p data-i18n="imm.s2.lead">Empfohlene <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, benannt nach 暗記 (anki, „Auswendiglernen“), ist das weltweit meistgenutzte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">Spaced-Repetition-System (SRS)</a> und das Werkzeug, mit dem Fushi standardmäßig zusammenarbeitet. Gib ihm alles, was du dir merken willst, und es plant die Wiederholungen so, dass du mit möglichst wenig Lernzeit möglichst viel behältst.</span></span>-Decks:</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="Ein Anki-Vokabeldeck für Anfänger: rund 1.500 nach Häufigkeit ausgewählte japanische Wörter, jede Karte mit Beispielsatz, Audio und Tonhöhenakzent. Erstellt von der The-Moe-Way-Community; kaishi bedeutet „Anfang“."><b>Kaishi 1.5k</b></span>: <a href="https://github.com/Yukitoki97900/Kaishi-1.5K-German-Version">deutsche Version</a> (<a href="https://github.com/donkuri/Kaishi">Original-Repository</a>).</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="Eine JLPT-Grammatikreferenz auf Basis der aiueo.cc-Grammatikreihe (Onigiris japanische Ausspracheklasse): 757 Grammatikpunkte von N5 bis N1, jeweils mit Beispielsätzen, die eine japanische Lehrerin eingesprochen hat."><b>Onigiri-Grammatik</b></span>: Das Anki-Deck gibt es nur auf Chinesisch, nimm stattdessen die <a href="https://aiueo.cc/pages_v2/en/grammars.php">Onigiri-Grammatikübersicht</a> auf aiueo.cc (Englisch); bis <span class="term" tabindex="0" data-tip="Stufen des JLPT (Japanese-Language Proficiency Test): N5 ist die leichteste, N1 die schwerste. Anfängergrammatik deckt etwa N5–N4 ab, N3 ist die Schwelle zur Mittelstufe; ein Grammatikgerüst um N4 reicht, um mit Immersion zu beginnen.">N3/N4</span> reicht.</li>
</ul>
<p data-i18n="imm.s2.p">Während du noch Vokabeln lernst, beginne mit dem nächsten Schritt: Immersion.</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">F: <span class="term" tabindex="0" data-tip="Die japanischen Silbenschriften Hiragana und Katakana mit je 46 Grundlauten, angeordnet in fünf Vokalreihen und zehn Konsonantenspalten – daher der japanische Name „fünfzig Laute“. Sie sind die Grundlage der japanischen Schrift und das Einzige, was du vor dem Vokabellernen durchhaben musst.">Kana</span> lernen ist so öde – ist das normal?</h4>
<p data-i18n="imm.faq.a1a">Völlig normal, und fast allen geht es so.</p>
<p data-i18n="imm.faq.a1b">Du musst nicht warten, bis du „Spaß am Kana-Lernen“ hast – dieser Tag kommt vielleicht nie. Du musst nur anfangen, und wenn es nur fünf Minuten am Tag sind, und wenn du heute nur あ behalten hast.</p>
<p data-i18n="imm.faq.a1c">Fortschritt selbst erzeugt Motivation. An dem Tag, an dem du in einem Anime plötzlich ein Wort verstehst, fühlt sich die ganze öde Vorarbeit auf einmal lohnend an. Aber dieser Tag kommt nicht von allein – du musst erst durch die Phase „ich verstehe gar nichts“.</p>
<h4 data-i18n="imm.faq.q2">F: Wie viel Zeit sollte ich täglich in <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, benannt nach 暗記 (anki, „Auswendiglernen“), ist das weltweit meistgenutzte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">Spaced-Repetition-System (SRS)</a> und das Werkzeug, mit dem Fushi standardmäßig zusammenarbeitet. Gib ihm alles, was du dir merken willst, und es plant die Wiederholungen so, dass du mit möglichst wenig Lernzeit möglichst viel behältst.</span></span> stecken?</h4>
<p data-i18n="imm.faq.a2a">Weniger, als du denkst.</p>
<p data-i18n="imm.faq.a2b">15 bis 30 Minuten am Tag, je nachdem, wie viel du verträgst, ordentlich gemacht, schlagen eine gelegentliche Zwei-Stunden-Sitzung um Längen. Der Grund ist simpel: Gewohnheit zählt mehr als Intensität. Ein Plan, den du jeden Tag durchhältst, ist weit mehr wert als ein „Hardcore-Plan“, den du mal machst und mal nicht.</p>
<p data-i18n="imm.faq.a2c">An einem schlechten Tag mach nur 5 Minuten. 5 Minuten zählen. <b>Ein langsamer Karren ist in Ordnung; wichtig ist, nicht herunterzufallen.</b> Reißt die Gewohnheit ab, kostet der Neustart viel mehr Willenskraft, als du erwartest.</p>
<h4 data-i18n="imm.faq.q3">F: Mein Gedächtnis ist schlecht, ich vergesse ständig – was tun?</h4>
<p data-i18n="imm.faq.a3a">Vergessen ist normal. Genau dagegen ist <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, benannt nach 暗記 (anki, „Auswendiglernen“), ist das weltweit meistgenutzte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">Spaced-Repetition-System (SRS)</a> und das Werkzeug, mit dem Fushi standardmäßig zusammenarbeitet. Gib ihm alles, was du dir merken willst, und es plant die Wiederholungen so, dass du mit möglichst wenig Lernzeit möglichst viel behältst.</span></span> da.</p>
<p data-i18n="imm.faq.a3b">Nicht heute, nicht morgen – aber irgendwann bleibt es hängen.</p>
</aside>

<h3 data-i18n="imm.s3.h">Schritt 3: Immersion, dabei <span class="term" tabindex="0" data-tip="Ein neues Wort aus der Immersion zusammen mit Satz, Audio und Screenshot, in denen es vorkam, in eine Anki-Karte verwandeln. In Fushi ist es ein Tipp zum Nachschlagen und ein weiterer für die Karte.">Karten erstellen</span> und Vokabeln lernen</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">Eine Sprache lernen heißt, eine Tatsache zu akzeptieren: Du wirst nicht alles verstehen.</p>
<p data-i18n="imm.s3.c2">Viele fühlen sich „noch nicht bereit“ und wollen vor der Immersion noch mehr lernen – das funktioniert nie. Egal wie viel du vorbereitest, beim ersten Kontakt mit echtem Material verstehst du nicht alles. Weich dem Unbehagen nicht aus, spring hinein: Je mehr Unklarheit du aushältst, desto schneller lernt dein Gehirn die Sprache.</p>
<p data-i18n="imm.s3.c3"><b>Wenn die Unklarheit unerträglich ist</b></p>
<ul data-i18n="imm.s3.c4"><li><b>Spoiler zuerst</b>: Lies vorher eine Inhaltsangabe, oder schau etwas noch einmal, das du in deiner Sprache schon kennst.</li><li><b>Untertitel in der eigenen Sprache als letzter Ausweg</b>: normalerweise nicht empfehlenswert (man lernt wenig daraus), aber wenn du völlig verloren bist, halte erst eine Weile ohne durch und blende sie nur ein, wenn es sein muss – oder schau einmal ohne und einmal mit.</li></ul>
</aside>
<p data-i18n="imm.s3.p1">Fang mit leichtem Material an – Slice-of-Life ist leichter als Kampf-Anime, Light Novels leichter als anspruchsvolle Literatur.</p>
<p data-i18n="imm.s3.p2">Schau, was du liebst, tippe auf unbekannte Wörter, um sie nachzuschlagen, und <span class="term" tabindex="0" data-tip="Ein neues Wort aus der Immersion zusammen mit Satz, Audio und Screenshot, in denen es vorkam, in eine Anki-Karte verwandeln. In Fushi ist es ein Tipp zum Nachschlagen und ein weiterer für die Karte.">Karten erstellen</span>, wenn es sich lohnt.</p>
<p data-i18n="imm.s3.p3">Vokabellernen ist die eine aktive Methode neben der Immersion, die zählt: Anfangs baut es den Wortschatz schnell auf.</p>

</div>
