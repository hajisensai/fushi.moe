---
title: "Leren door immersie"
description: "Een complete startgids voor het leren van een taal door immersie: waarom immersie, wat het is, en stap 0–3 van kana en Anki-decks tot kaarten maken terwijl je kijkt."
head:
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:title"
      content: "Leren door immersie"
  - - meta
    - property: "og:description"
      content: "Een complete startgids voor het leren van een taal door immersie: waarom immersie, wat het is, en stap 0–3 van kana en Anki-decks tot kaarten maken terwijl je kijkt."
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/nl/immersion"
  - - meta
    - property: "og:locale"
      content: "nl_NL"
  - - meta
    - name: "twitter:card"
      content: "summary"
  - - link
    - rel: "alternate"
      hreflang: "en"
      href: "https://fushi.moe/immersion"
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
      hreflang: "id"
      href: "https://fushi.moe/id/immersion"
  - - link
    - rel: "alternate"
      hreflang: "th"
      href: "https://fushi.moe/th/immersion"
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

<div class="immersion" dir="auto">

<h1 data-i18n="imm.title">Leren door immersie</h1>
<p class="note" data-i18n="imm.note">Deze gids gebruikt Japans als voorbeeld; dezelfde aanpak werkt voor elke taal.</p>

<h2 data-i18n="imm.fit.h">Is immersie iets voor mij?</h2>
<p data-i18n="imm.fit.p1">Lesboeken en oefeningen – ik betwijfel of veel mensen daar echt van genieten. Waar komt de motivatie vandaan voor iets wat je niet leuk vindt, en hoe lang houdt die stand?</p>
<p data-i18n="imm.fit.p2"><b>Immersie is anders. Er is maar één voorwaarde: echte interesse in de inhoud – anime, shows, films, romans, games, manga, wat je maar leuk vindt.</b></p>
<p data-i18n="imm.fit.p3">Geen voorkennis, geen talent, zelfs geen „besluit” nodig. Je hoeft alleen die inhoud te willen opzoeken.</p>
<p data-i18n="imm.fit.p4">Kies inhoud waar je van houdt. Niets is belangrijker.</p>

<h2 data-i18n="imm.what.h">Wat is immersie?</h2>
<p data-i18n="imm.what.p1">Luisteren naar en lezen wat moedertaalsprekers voor moedertaalsprekers maken: anime, romans, games, shows – dingen gemaakt voor een moedertalig publiek. Elke serie die je kijkt en elke game die je speelt telt al mee.</p>
<p data-i18n="imm.what.p2">In plaats van „eerst leren, dan gebruiken” leer je bij immersie vanzelf door te gebruiken.</p>
<p data-i18n="imm.what.p3">Immersie is de weg die iedereen uiteindelijk moet gaan. Woordjes stampen, grammatica leren en oefeningen geven je een basis, maar een taal is veel te groot voor welk lesboek dan ook. Je kunt deze alinea moeiteloos lezen – niet omdat je grammaticaregels uit je hoofd hebt geleerd, maar omdat ruim tien jaar massale input in je moedertaal ontelbare intuïties in je brein heeft opgebouwd. Bij een vreemde taal werkt het net zo: die intuïtie komt alleen uit grote hoeveelheden echte input.</p>
<p data-i18n="imm.what.p4">Immersie begint inderdaad met een periode waarin je bijna niets begrijpt. Maar omdat je inhoud hebt gekozen waar je van houdt, kun je blijven kijken, ook zonder alles te begrijpen. Snel of langzaam, veel of weinig – het belangrijkste is je interesse in de inhoud zelf.</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">Hoe werkt leren door immersie?</summary>
<p data-i18n="imm.theory.p1">Een taal wordt niet „geleerd”, maar verworven. Je hebt nooit grammaticatabellen van je moedertaal uit je hoofd geleerd en toch spreek je die natuurlijker dan welk grammaticaboek ook kan leren – dankzij één ding: enorme hoeveelheden input die je grotendeels begreep.</p>
<blockquote><p data-i18n="imm.theory.quote">„We verwerven taal op maar één manier: door boodschappen te begrijpen.”</p><cite data-i18n="imm.theory.cite">– Stephen Krashen</cite></blockquote>
<p data-i18n="imm.theory.p2">De betekenis van een woord kennen is pas de eerste stap. Om intuïtie te krijgen voor hoe het gebruikt wordt, moet je het vele keren – en in veel verschillende contexten – tegenkomen en begrijpen.</p>
<p data-i18n="imm.theory.p3">Immersie geeft je precies die variatie. Elke keer dat je een woord ziet en begrijpt, wordt je intuïtie scherper. Uiteindelijk is die zo helder dat je gewoon weet hoe het woord wordt gebruikt.</p>
</details>

<h2 data-i18n="imm.start.h">Aan de slag</h2>

<h3 data-i18n="imm.s0.h">Stap 0: Fushi instellen</h3>
<blockquote><p data-i18n="imm.s0.side">Het aanbevolen pakket in de introductie bundelt de gangbare woordenboeken en audiobibliotheken al – je hoeft niet zelf naar bronnen te zoeken.</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/download">Download Fushi</a> en volg de introductie: woordenboeken, woordaudio-database, daarna <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, genoemd naar 暗記 (anki, „uit het hoofd leren”), is het meestgebruikte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced-repetitionsysteem (SRS)</a> ter wereld en het hulpmiddel waarmee Fushi standaard samenwerkt. Geef het alles wat je wilt onthouden en het plant de herhalingen zo dat je met zo min mogelijk studietijd zo veel mogelijk onthoudt.</span></span> installeren en koppelen. Daarna zoek je met één tik een woord op terwijl je kijkt of leest, en maakt een tweede tik een <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, genoemd naar 暗記 (anki, „uit het hoofd leren”), is het meestgebruikte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced-repetitionsysteem (SRS)</a> ter wereld en het hulpmiddel waarmee Fushi standaard samenwerkt. Geef het alles wat je wilt onthouden en het plant de herhalingen zo dat je met zo min mogelijk studietijd zo veel mogelijk onthoudt.</span></span>-kaart met zin, audio en screenshot.</p>

<h3 data-i18n="imm.s1.h">Stap 1: de <span class="term" tabindex="0" data-tip="De Japanse lettergreepschriften: hiragana en katakana, elk 46 basisklanken, geordend in vijf klinkerrijen en tien medeklinkerkolommen – vandaar de Japanse naam „vijftig klanken”. Ze zijn de basis van het Japanse schrift en het enige wat je vóór de woordenschat moet doorlopen.">kana</span> leren</h3>
<ul>
<li data-i18n="imm.s1.li1">Aanbevolen: <a href="https://kanabr.vercel.app/">kanabr</a> (<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>), een typetrainer van <a href="https://l-m-sherlock.github.io/">L-M-Sherlock</a> die de kana stap voor stap vrijspeelt – en je tegelijk leert Japans te typen.</li>
<li data-i18n="imm.s1.li2">Of elk ander hulpmiddel dat je bevalt.</li>
</ul>
<p data-i18n="imm.s1.p">Eén keer door de hiragana is genoeg. Het hoeft niet perfect te zitten – woordenschat oefenen verstevigt het steeds opnieuw.</p>

<h3 data-i18n="imm.s2.h">Stap 2: basiswoordenschat en grammatica</h3>
<blockquote><p data-i18n="imm.s2.side">5–20 nieuwe kaarten per dag is genoeg, en je kunt de <span class="term" tabindex="0" data-tip="De instelling „gewenste retentie” van Anki’s FSRS-algoritme, standaard 90%. Verlagen naar 70–80% vermindert de dagelijkse herhalingen merkbaar, ten koste van iets meer vergeten – in het begin een goede ruil, omdat immersie je opvangt.">gewenste retentie</span> verlagen naar 70–80%. <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, genoemd naar 暗記 (anki, „uit het hoofd leren”), is het meestgebruikte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced-repetitionsysteem (SRS)</a> ter wereld en het hulpmiddel waarmee Fushi standaard samenwerkt. Geef het alles wat je wilt onthouden en het plant de herhalingen zo dat je met zo min mogelijk studietijd zo veel mogelijk onthoudt.</span></span>-herhalingen stapelen zich na twee tot drie weken op; te veel nieuwe kaarten toevoegen is waarom de meeste mensen met <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, genoemd naar 暗記 (anki, „uit het hoofd leren”), is het meestgebruikte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced-repetitionsysteem (SRS)</a> ter wereld en het hulpmiddel waarmee Fushi standaard samenwerkt. Geef het alles wat je wilt onthouden en het plant de herhalingen zo dat je met zo min mogelijk studietijd zo veel mogelijk onthoudt.</span></span> stoppen.</p></blockquote>
<p data-i18n="imm.s2.lead">Aanbevolen <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, genoemd naar 暗記 (anki, „uit het hoofd leren”), is het meestgebruikte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced-repetitionsysteem (SRS)</a> ter wereld en het hulpmiddel waarmee Fushi standaard samenwerkt. Geef het alles wat je wilt onthouden en het plant de herhalingen zo dat je met zo min mogelijk studietijd zo veel mogelijk onthoudt.</span></span>-decks:</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="Een Anki-woordenschatdeck voor beginners: zo’n 1.500 veelgebruikte Japanse woorden, gekozen op frequentie, elke kaart met voorbeeldzin, audio en toonhoogteaccent. Gemaakt door de The Moe Way-community; kaishi betekent „begin”."><b>Kaishi 1.5k</b></span>: <a href="https://github.com/donkuri/Kaishi">origineel deck</a> (dezelfde repository verwijst naar vertalingen in diverse talen).</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="Een JLPT-grammaticareferentie op basis van de grammaticareeks van aiueo.cc (Onigiri’s Japanse uitspraakles): 757 grammaticapunten van N5 tot N1, elk met voorbeeldzinnen ingesproken door een Japanse lerares."><b>Onigiri-grammatica</b></span>: het Anki-deck bestaat alleen in het Chinees, gebruik in plaats daarvan het <a href="https://aiueo.cc/pages_v2/en/grammars.php">Onigiri-grammaticaoverzicht</a> op aiueo.cc (Engels); tot <span class="term" tabindex="0" data-tip="Niveaus van de JLPT (officieel Japans examen): N5 is het makkelijkst, N1 het moeilijkst. Basisgrammatica dekt ongeveer N5–N4, en N3 is de drempel naar gevorderd; een grammaticaal raamwerk rond N4 is genoeg om met immersie te beginnen.">N3/N4</span> is genoeg.</li>
</ul>
<p data-i18n="imm.s2.p">Terwijl je nog woorden leert, begin je met de volgende stap: immersie.</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">V: <span class="term" tabindex="0" data-tip="De Japanse lettergreepschriften: hiragana en katakana, elk 46 basisklanken, geordend in vijf klinkerrijen en tien medeklinkerkolommen – vandaar de Japanse naam „vijftig klanken”. Ze zijn de basis van het Japanse schrift en het enige wat je vóór de woordenschat moet doorlopen.">kana</span> leren is zo saai – is dat normaal?</h4>
<p data-i18n="imm.faq.a1a">Helemaal normaal, en bijna iedereen voelt dat zo.</p>
<p data-i18n="imm.faq.a1b">Je hoeft niet te wachten tot je „kana leren leuk vindt” om te beginnen – die dag komt misschien nooit. Wat je nodig hebt is in beweging komen, al is het maar vijf minuten per dag, al heb je vandaag alleen あ onthouden.</p>
<p data-i18n="imm.faq.a1c">Vooruitgang zelf zorgt voor motivatie. De dag dat je ineens een woord in een anime opvangt, voelt al het saaie voorwerk de moeite waard. Maar die dag komt niet vanzelf – je moet eerst door de fase „ik begrijp er niets van” heen.</p>
<h4 data-i18n="imm.faq.q2">V: Hoeveel tijd moet ik dagelijks aan <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, genoemd naar 暗記 (anki, „uit het hoofd leren”), is het meestgebruikte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced-repetitionsysteem (SRS)</a> ter wereld en het hulpmiddel waarmee Fushi standaard samenwerkt. Geef het alles wat je wilt onthouden en het plant de herhalingen zo dat je met zo min mogelijk studietijd zo veel mogelijk onthoudt.</span></span> besteden?</h4>
<p data-i18n="imm.faq.a2a">Minder dan je denkt.</p>
<p data-i18n="imm.faq.a2b">15 tot 30 minuten per dag, afhankelijk van wat je aankunt, serieus gedaan, wint het ruimschoots van af en toe een sessie van twee uur. De reden is simpel: gewoonte telt zwaarder dan intensiteit. Een plan dat je elke dag volhoudt, is veel meer waard dan een „hardcore plan” dat je met vlagen volgt.</p>
<p data-i18n="imm.faq.a2c">Op een slechte dag doe je maar 5 minuten. 5 minuten tellen. <b>Een langzame kar is prima; het gaat erom dat je er niet af valt.</b> Als de gewoonte breekt, kost opnieuw beginnen veel meer wilskracht dan je verwacht.</p>
<h4 data-i18n="imm.faq.q3">V: Mijn geheugen is slecht en ik vergeet alles – wat nu?</h4>
<p data-i18n="imm.faq.a3a">Vergeten is normaal. Daar tegenin gaan is precies waar <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, genoemd naar 暗記 (anki, „uit het hoofd leren”), is het meestgebruikte <a href="https://en.wikipedia.org/wiki/Spaced_repetition">spaced-repetitionsysteem (SRS)</a> ter wereld en het hulpmiddel waarmee Fushi standaard samenwerkt. Geef het alles wat je wilt onthouden en het plant de herhalingen zo dat je met zo min mogelijk studietijd zo veel mogelijk onthoudt.</span></span> voor is.</p>
<p data-i18n="imm.faq.a3b">Niet vandaag, niet morgen – maar op een dag blijft het hangen.</p>
</aside>

<h3 data-i18n="imm.s3.h">Stap 3: immersie, <span class="term" tabindex="0" data-tip="Een nieuw woord uit je immersie omzetten in een Anki-kaart, samen met de zin, audio en screenshot waar het vandaan komt. In Fushi is het één tik om op te zoeken en één om de kaart te maken.">maak kaarten</span> en woorden leren tegelijk</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">Een taal leren betekent één feit accepteren: je zult niet alles begrijpen.</p>
<p data-i18n="imm.s3.c2">Veel mensen voelen zich „nog niet klaar” en willen eerst meer studeren voor ze gaan immergeren – dat werkt nooit. Hoeveel je ook voorbereidt, de eerste keer dat je echt materiaal aanraakt begrijp je het niet allemaal. Duik erin in plaats van het ongemak te vermijden: hoe meer onduidelijkheid je verdraagt, hoe sneller je brein de taal oppikt.</p>
<p data-i18n="imm.s3.c3"><b>Als de onduidelijkheid ondraaglijk is</b></p>
<ul data-i18n="imm.s3.c4"><li><b>Spoiler jezelf eerst</b>: lees vooraf een samenvatting van het verhaal, of kijk iets opnieuw dat je in je eigen taal al kent.</li><li><b>Ondertitels in je eigen taal als laatste redmiddel</b>: normaal niet aan te raden (je leert er weinig van), maar als je helemaal de weg kwijt bent, hou het eerst een tijdje vol zonder en zet ze alleen aan als het echt moet – of kijk één keer zonder en één keer met.</li></ul>
</aside>
<p data-i18n="imm.s3.p1">Begin met makkelijk materiaal – slice-of-life is makkelijker dan vechtanime, light novels makkelijker dan literatuur.</p>
<p data-i18n="imm.s3.p2">Kijk wat je leuk vindt, tik op onbekende woorden om ze op te zoeken en <span class="term" tabindex="0" data-tip="Een nieuw woord uit je immersie omzetten in een Anki-kaart, samen met de zin, audio en screenshot waar het vandaan komt. In Fushi is het één tik om op te zoeken en één om de kaart te maken.">maak kaarten</span> als het de moeite is.</p>
<p data-i18n="imm.s3.p3">Woorden leren is de enige actieve methode naast immersie die ertoe doet: in het begin bouwt het je woordenschat snel op.</p>

</div>
