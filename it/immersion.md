---
title: "Imparare per immersione"
description: "Guida completa per iniziare a imparare una lingua per immersione: perché l’immersione, che cos’è, e i passi 0–3 dai kana e dai mazzi Anki alla creazione di schede mentre guardi."
head:
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:title"
      content: "Imparare per immersione"
  - - meta
    - property: "og:description"
      content: "Guida completa per iniziare a imparare una lingua per immersione: perché l’immersione, che cos’è, e i passi 0–3 dai kana e dai mazzi Anki alla creazione di schede mentre guardi."
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/it/immersion"
  - - meta
    - property: "og:locale"
      content: "it_IT"
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

<h1 data-i18n="imm.title">Imparare per immersione</h1>
<p class="note" data-i18n="imm.note">Questa guida usa il giapponese come esempio; lo stesso approccio vale per qualsiasi lingua.</p>

<h2 data-i18n="imm.fit.h">L’immersione fa per me?</h2>
<p data-i18n="imm.fit.p1">Manuali ed esercizi: dubito che a molti piacciano davvero. Da dove arriva la motivazione per qualcosa che non ti piace, e quanto dura?</p>
<p data-i18n="imm.fit.p2"><b>L’immersione è diversa. Ha un solo requisito: un interesse autentico per i contenuti — anime, show, film, romanzi, giochi, manga, qualsiasi cosa ti piaccia.</b></p>
<p data-i18n="imm.fit.p3">Nessuna base, nessun talento, nemmeno bisogno di «decidersi». Basta la voglia di avvicinarsi a quei contenuti.</p>
<p data-i18n="imm.fit.p4">Scegli contenuti che ami. Niente conta di più.</p>

<h2 data-i18n="imm.what.h">Che cos’è l’immersione?</h2>
<p data-i18n="imm.what.p1">Ascoltare e leggere ciò che i madrelingua fanno per i madrelingua: anime, romanzi, giochi, show — cose fatte per un pubblico madrelingua. Ogni serie che guardi e ogni gioco a cui giochi contano già.</p>
<p data-i18n="imm.what.p2">Al posto di «prima imparo, poi uso», con l’immersione impari in modo naturale usando.</p>
<p data-i18n="imm.what.p3">L’immersione è la strada che alla fine tutti devono percorrere. Vocaboli a memoria, grammatica ed esercizi danno una base, ma una lingua è troppo vasta per qualsiasi manuale. Se leggi questo paragrafo senza sforzo non è perché hai memorizzato regole grammaticali, ma perché più di dieci anni di input massiccio nella tua lingua madre hanno costruito innumerevoli intuizioni nel tuo cervello. Con una lingua straniera è lo stesso: quell’intuizione nasce solo da grandi quantità di input reale.</p>
<p data-i18n="imm.what.p4">L’immersione inizia davvero con una fase in cui non capisci quasi nulla. Ma siccome hai scelto contenuti che ami, puoi continuare a guardare anche senza capire tutto. Veloce o lento, tanto o poco: ciò che conta di più è il tuo interesse per i contenuti stessi.</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">Come funziona l’apprendimento per immersione?</summary>
<p data-i18n="imm.theory.p1">Una lingua non si «impara», si acquisisce. Non hai mai memorizzato tabelle grammaticali della tua lingua madre, eppure la parli con più naturalezza di quanta ne insegnerebbe qualunque libro — grazie a una cosa sola: enormi quantità di input che per lo più capivi.</p>
<blockquote><p data-i18n="imm.theory.quote">«Acquisiamo il linguaggio in un solo modo: comprendendo messaggi.»</p><cite data-i18n="imm.theory.cite">— Stephen Krashen</cite></blockquote>
<p data-i18n="imm.theory.p2">Conoscere il significato di una parola è solo il primo passo. Per acquisire l’intuizione di come si usa devi incontrarla — e capirla — molte volte in molti contesti diversi.</p>
<p data-i18n="imm.theory.p3">L’immersione ti espone proprio a quella varietà. Ogni volta che vedi una parola e la capisci, la tua intuizione si affina. Alla fine è così chiara che sai semplicemente come si usa.</p>
</details>

<h2 data-i18n="imm.start.h">Iniziare</h2>

<h3 data-i18n="imm.s0.h">Passo 0: configurare Fushi</h3>
<blockquote><p data-i18n="imm.s0.side">Il pacchetto consigliato nella guida iniziale include già dizionari e librerie audio più usati: non devi cercare risorse da solo.</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/download">Scarica Fushi</a> e segui la guida iniziale: dizionari, database audio delle parole, poi installa e collega <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, che prende il nome da 暗記 (anki, «memorizzazione»), è il <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema di ripetizione spaziata (SRS)</a> più usato al mondo e lo strumento con cui Fushi si integra di default. Affidagli qualsiasi cosa tu voglia ricordare: pianifica i ripassi per la massima ritenzione col minimo tempo di studio.</span></span>. Da lì in poi un tocco cerca una parola mentre guardi o leggi, un altro crea una scheda <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, che prende il nome da 暗記 (anki, «memorizzazione»), è il <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema di ripetizione spaziata (SRS)</a> più usato al mondo e lo strumento con cui Fushi si integra di default. Affidagli qualsiasi cosa tu voglia ricordare: pianifica i ripassi per la massima ritenzione col minimo tempo di studio.</span></span> con frase, audio e screenshot.</p>

<h3 data-i18n="imm.s1.h">Passo 1: imparare i <span class="term" tabindex="0" data-tip="I sillabari giapponesi: hiragana e katakana, 46 suoni di base ciascuno, disposti in cinque righe di vocali e dieci colonne di consonanti — da cui il nome giapponese «cinquanta suoni». Sono la base della scrittura giapponese e l’unica cosa da completare prima del vocabolario.">kana</span></h3>
<ul>
<li data-i18n="imm.s1.li1">Consigliato: <a href="https://kanabr.vercel.app/">kanabr</a> (<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>), un allenatore di digitazione di <a href="https://l-m-sherlock.github.io/">L-M-Sherlock</a> che sblocca i kana poco alla volta — e nel frattempo ti insegna a scrivere in giapponese con la tastiera.</li>
<li data-i18n="imm.s1.li2">Oppure qualsiasi strumento ti piaccia.</li>
</ul>
<p data-i18n="imm.s1.p">Basta un giro degli hiragana. Non serve saperli a memoria: il vocabolario li consoliderà di continuo.</p>

<h3 data-i18n="imm.s2.h">Passo 2: vocabolario e grammatica di base</h3>
<blockquote><p data-i18n="imm.s2.side">5–20 schede nuove al giorno bastano, e puoi abbassare la <span class="term" tabindex="0" data-tip="L’impostazione «ritenzione desiderata» dell’algoritmo FSRS di Anki, 90% di default. Abbassarla al 70–80% riduce parecchio i ripassi quotidiani al prezzo di dimenticare un po’ di più — un buon affare all’inizio, quando l’immersione ti copre le spalle.">ritenzione desiderata</span> al 70–80%. I ripassi di <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, che prende il nome da 暗記 (anki, «memorizzazione»), è il <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema di ripetizione spaziata (SRS)</a> più usato al mondo e lo strumento con cui Fushi si integra di default. Affidagli qualsiasi cosa tu voglia ricordare: pianifica i ripassi per la massima ritenzione col minimo tempo di studio.</span></span> si accumulano dopo due o tre settimane; aggiungere troppe schede nuove è il motivo per cui la maggior parte delle persone abbandona <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, che prende il nome da 暗記 (anki, «memorizzazione»), è il <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema di ripetizione spaziata (SRS)</a> più usato al mondo e lo strumento con cui Fushi si integra di default. Affidagli qualsiasi cosa tu voglia ricordare: pianifica i ripassi per la massima ritenzione col minimo tempo di studio.</span></span>.</p></blockquote>
<p data-i18n="imm.s2.lead">Mazzi <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, che prende il nome da 暗記 (anki, «memorizzazione»), è il <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema di ripetizione spaziata (SRS)</a> più usato al mondo e lo strumento con cui Fushi si integra di default. Affidagli qualsiasi cosa tu voglia ricordare: pianifica i ripassi per la massima ritenzione col minimo tempo di studio.</span></span> consigliati:</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="Un mazzo di vocabolario Anki per principianti: circa 1.500 parole giapponesi ad alta frequenza, ogni scheda con frase d’esempio, audio e accento tonale. Creato dalla community The Moe Way; kaishi significa «inizio»."><b>Kaishi 1.5k</b></span>: <a href="https://github.com/donkuri/Kaishi">mazzo originale</a> (lo stesso repository rimanda alle traduzioni in varie lingue).</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="Un riferimento di grammatica JLPT basato sulla serie di grammatica di aiueo.cc (la classe di pronuncia giapponese di Onigiri): 757 punti grammaticali da N5 a N1, ognuno con frasi d’esempio registrate da un’insegnante giapponese."><b>Grammatica Onigiri</b></span>: il mazzo Anki esiste solo in cinese, usa invece la <a href="https://aiueo.cc/pages_v2/en/grammars.php">guida di grammatica Onigiri</a> su aiueo.cc (in inglese); fino a <span class="term" tabindex="0" data-tip="I livelli del JLPT (esame ufficiale di giapponese): N5 è il più facile, N1 il più difficile. La grammatica di base copre grosso modo N5–N4, e N3 è la soglia dell’intermedio; un’impalcatura grammaticale attorno a N4 basta per iniziare l’immersione.">N3/N4</span> basta.</li>
</ul>
<p data-i18n="imm.s2.p">Mentre studi ancora il vocabolario, inizia il passo successivo: l’immersione.</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">D: Imparare i <span class="term" tabindex="0" data-tip="I sillabari giapponesi: hiragana e katakana, 46 suoni di base ciascuno, disposti in cinque righe di vocali e dieci colonne di consonanti — da cui il nome giapponese «cinquanta suoni». Sono la base della scrittura giapponese e l’unica cosa da completare prima del vocabolario.">kana</span> è noiosissimo — è normale?</h4>
<p data-i18n="imm.faq.a1a">Del tutto normale, e quasi tutti la pensano così.</p>
<p data-i18n="imm.faq.a1b">Non devi aspettare che «ti piaccia studiare i kana» per iniziare — quel giorno potrebbe non arrivare mai. Ti serve solo metterti in moto, anche cinque minuti al giorno, anche se oggi hai ricordato solo あ.</p>
<p data-i18n="imm.faq.a1c">Il progresso stesso crea motivazione. Il giorno in cui cogli all’improvviso una parola in un anime, tutto il lavoro noioso avrà avuto un senso. Ma quel giorno non arriva da solo: prima devi attraversare la fase «non capisco niente».</p>
<h4 data-i18n="imm.faq.q2">D: Quanto tempo dovrei dedicare ad <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, che prende il nome da 暗記 (anki, «memorizzazione»), è il <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema di ripetizione spaziata (SRS)</a> più usato al mondo e lo strumento con cui Fushi si integra di default. Affidagli qualsiasi cosa tu voglia ricordare: pianifica i ripassi per la massima ritenzione col minimo tempo di studio.</span></span> ogni giorno?</h4>
<p data-i18n="imm.faq.a2a">Meno di quanto pensi.</p>
<p data-i18n="imm.faq.a2b">Da 15 a 30 minuti al giorno, in base a quanto reggi, fatti seriamente, rendono molto più di una sessione di due ore ogni tanto. Il motivo è semplice: l’abitudine conta più dell’intensità. Un piano che riesci a seguire ogni giorno vale molto più di un «piano intensivo» seguito a intermittenza.</p>
<p data-i18n="imm.faq.a2c">In una giornata storta fai solo 5 minuti. 5 minuti contano. <b>Non importa se il carro va piano; l’importante è non cadere.</b> Una volta rotta l’abitudine, ripartire costa molta più forza di volontà di quanto immagini.</p>
<h4 data-i18n="imm.faq.q3">D: Ho una pessima memoria e dimentico tutto — che faccio?</h4>
<p data-i18n="imm.faq.a3a">Dimenticare è normale. Combatterlo è esattamente il motivo per cui esiste <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, che prende il nome da 暗記 (anki, «memorizzazione»), è il <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema di ripetizione spaziata (SRS)</a> più usato al mondo e lo strumento con cui Fushi si integra di default. Affidagli qualsiasi cosa tu voglia ricordare: pianifica i ripassi per la massima ritenzione col minimo tempo di studio.</span></span>.</p>
<p data-i18n="imm.faq.a3b">Non oggi, non domani — ma un giorno resta.</p>
</aside>

<h3 data-i18n="imm.s3.h">Passo 3: immersione, <span class="term" tabindex="0" data-tip="Trasformare una parola nuova incontrata in immersione in una scheda Anki insieme alla frase, all’audio e allo screenshot da cui viene. In Fushi è un tocco per cercarla e uno per creare la scheda.">crea schede</span> e vocabolario insieme</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">Imparare una lingua significa accettare un fatto: non capirai tutto.</p>
<p data-i18n="imm.s3.c2">Molti si sentono «non pronti» e vogliono studiare ancora prima di immergersi — non funziona mai. Per quanto ti prepari, la prima volta che tocchi materiale vero non capirai tutto. Invece di evitare il disagio, buttati: più ambiguità tolleri, più in fretta il cervello assimila la lingua.</p>
<p data-i18n="imm.s3.c3"><b>Se l’ambiguità è insopportabile</b></p>
<ul data-i18n="imm.s3.c4"><li><b>Spoilerati prima</b>: leggi un riassunto della trama, oppure riguarda qualcosa che conosci già nella tua lingua.</li><li><b>Sottotitoli nella tua lingua come ultima risorsa</b>: di norma sconsigliati (si impara poco), ma se sei completamente perso, resisti un po’ senza e accendili solo quando devi — oppure guarda una volta senza e una con.</li></ul>
</aside>
<p data-i18n="imm.s3.p1">Inizia da materiale facile: gli slice of life sono più facili degli anime di combattimento, le light novel più facili della narrativa letteraria.</p>
<p data-i18n="imm.s3.p2">Guarda ciò che ami, tocca le parole sconosciute per cercarle e <span class="term" tabindex="0" data-tip="Trasformare una parola nuova incontrata in immersione in una scheda Anki insieme alla frase, all’audio e allo screenshot da cui viene. In Fushi è un tocco per cercarla e uno per creare la scheda.">crea schede</span> quando ne vale la pena.</p>
<p data-i18n="imm.s3.p3">Lo studio del vocabolario è l’unico metodo attivo, oltre all’immersione, che conta: all’inizio costruisce il lessico molto in fretta.</p>

</div>
