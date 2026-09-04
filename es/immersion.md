---
title: "Aprender por inmersión"
description: "Guía completa para empezar a aprender un idioma por inmersión: por qué la inmersión, qué es, y los pasos 0–3 desde los kana y los mazos de Anki hasta crear tarjetas mientras ves contenido."
head:
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:title"
      content: "Aprender por inmersión"
  - - meta
    - property: "og:description"
      content: "Guía completa para empezar a aprender un idioma por inmersión: por qué la inmersión, qué es, y los pasos 0–3 desde los kana y los mazos de Anki hasta crear tarjetas mientras ves contenido."
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/es/immersion"
  - - meta
    - property: "og:locale"
      content: "es_ES"
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

<h1 data-i18n="imm.title">Aprender por inmersión</h1>
<p class="note" data-i18n="imm.note">Esta guía usa el japonés como ejemplo; el mismo enfoque sirve para cualquier idioma.</p>

<h2 data-i18n="imm.fit.h">¿La inmersión es para mí?</h2>
<p data-i18n="imm.fit.p1">Libros de texto y ejercicios: dudo que a mucha gente le gusten de verdad. ¿De dónde sale la motivación para algo que no te gusta, y cuánto dura?</p>
<p data-i18n="imm.fit.p2"><b>La inmersión es distinta. Tiene un único requisito: interés real por el contenido — anime, programas, películas, novelas, juegos, manga, lo que te guste.</b></p>
<p data-i18n="imm.fit.p3">No hace falta base, ni talento, ni siquiera «decidirse». Solo hace falta querer acercarse a ese contenido.</p>
<p data-i18n="imm.fit.p4">Elige contenido que te encante. Nada importa más.</p>

<h2 data-i18n="imm.what.h">¿Qué es la inmersión?</h2>
<p data-i18n="imm.what.p1">Escuchar y leer lo que los nativos hacen para nativos: anime, novelas, juegos, programas — cosas hechas para un público nativo. Cada serie que ves y cada juego que juegas ya cuentan.</p>
<p data-i18n="imm.what.p2">En lugar de «aprender primero y usar después», con la inmersión aprendes de forma natural usando.</p>
<p data-i18n="imm.what.p3">La inmersión es el camino que al final todo el mundo tiene que recorrer. Memorizar vocabulario, estudiar gramática y hacer ejercicios te dan una base, pero un idioma es demasiado vasto para cualquier libro de texto. Puedes leer este párrafo sin esfuerzo no porque hayas memorizado reglas gramaticales, sino porque más de una década de input masivo en tu lengua materna construyó incontables intuiciones en tu cerebro. Con un idioma extranjero pasa lo mismo: esa intuición solo nace de grandes cantidades de input real.</p>
<p data-i18n="imm.what.p4">Es cierto que la inmersión empieza con una etapa en la que no entiendes casi nada. Pero como elegiste contenido que te encanta, puedes seguir viendo aunque no lo entiendas todo. Rápido o lento, mucho o poco: lo más importante es tu interés por el contenido en sí.</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">¿Cómo funciona el aprendizaje por inmersión?</summary>
<p data-i18n="imm.theory.p1">Un idioma no se «aprende», se adquiere. Nunca memorizaste tablas de gramática de tu lengua materna y, aun así, la hablas con más naturalidad de la que enseñaría cualquier libro, gracias a una sola cosa: cantidades enormes de input que en su mayor parte entendías.</p>
<blockquote><p data-i18n="imm.theory.quote">«Adquirimos el lenguaje de una sola manera: entendiendo mensajes.»</p><cite data-i18n="imm.theory.cite">— Stephen Krashen</cite></blockquote>
<p data-i18n="imm.theory.p2">Conocer el significado de una palabra es solo el primer paso. Para adquirir la intuición de cómo se usa, tienes que encontrarla — y entenderla — muchas veces en muchos contextos distintos.</p>
<p data-i18n="imm.theory.p3">La inmersión te expone exactamente a esa variedad. Cada vez que ves una palabra y la entiendes, tu intuición se afina. Al final es tan clara que simplemente sabes cómo se usa.</p>
</details>

<h2 data-i18n="imm.start.h">Empezar</h2>

<h3 data-i18n="imm.s0.h">Paso 0: configurar Fushi</h3>
<blockquote><p data-i18n="imm.s0.side">El paquete recomendado de la guía inicial ya incluye los diccionarios y bibliotecas de audio habituales; no hace falta buscar recursos por tu cuenta.</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/download">Descarga Fushi</a> y sigue la guía inicial: diccionarios, base de datos de audio de palabras, y luego instala y conecta <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, que toma su nombre de 暗記 (anki, «memorización»), es el <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema de repetición espaciada (SRS)</a> más usado del mundo y la herramienta con la que Fushi se integra por defecto. Dale cualquier cosa que quieras recordar y programará los repasos para que retengas lo máximo con el mínimo tiempo de estudio.</span></span>. A partir de ahí, un toque busca una palabra mientras ves o lees, y otro crea una tarjeta de <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, que toma su nombre de 暗記 (anki, «memorización»), es el <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema de repetición espaciada (SRS)</a> más usado del mundo y la herramienta con la que Fushi se integra por defecto. Dale cualquier cosa que quieras recordar y programará los repasos para que retengas lo máximo con el mínimo tiempo de estudio.</span></span> con la frase, el audio y la captura.</p>

<h3 data-i18n="imm.s1.h">Paso 1: aprender los <span class="term" tabindex="0" data-tip="Los silabarios japoneses: hiragana y katakana, con 46 sonidos básicos cada uno, ordenados en cinco filas de vocales y diez columnas de consonantes; de ahí el nombre japonés «cincuenta sonidos». Son la base de la escritura japonesa y lo único que debes tener listo antes del vocabulario.">kana</span></h3>
<ul>
<li data-i18n="imm.s1.li1">Recomendado: <a href="https://kanabr.vercel.app/">kanabr</a> (<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>), un entrenador de mecanografía de <a href="https://l-m-sherlock.github.io/">L-M-Sherlock</a> que desbloquea los kana poco a poco — y de paso te enseña a escribir japonés con el teclado.</li>
<li data-i18n="imm.s1.li2">O cualquier herramienta que te guste.</li>
</ul>
<p data-i18n="imm.s1.p">Con repasar el hiragana una vez basta. No hace falta dominarlo: el vocabulario lo reforzará una y otra vez.</p>

<h3 data-i18n="imm.s2.h">Paso 2: vocabulario y gramática básicos</h3>
<blockquote><p data-i18n="imm.s2.side">Con 5–20 tarjetas nuevas al día es suficiente, y puedes bajar la <span class="term" tabindex="0" data-tip="El ajuste «retención deseada» del algoritmo FSRS de Anki, 90 % por defecto. Bajarlo al 70–80 % reduce bastante los repasos diarios a cambio de olvidar un poco más: un buen trato al principio, cuando la inmersión te respalda.">retención deseada</span> al 70–80 %. Los repasos de <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, que toma su nombre de 暗記 (anki, «memorización»), es el <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema de repetición espaciada (SRS)</a> más usado del mundo y la herramienta con la que Fushi se integra por defecto. Dale cualquier cosa que quieras recordar y programará los repasos para que retengas lo máximo con el mínimo tiempo de estudio.</span></span> se acumulan a las dos o tres semanas; añadir demasiadas tarjetas nuevas es la razón por la que la mayoría abandona <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, que toma su nombre de 暗記 (anki, «memorización»), es el <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema de repetición espaciada (SRS)</a> más usado del mundo y la herramienta con la que Fushi se integra por defecto. Dale cualquier cosa que quieras recordar y programará los repasos para que retengas lo máximo con el mínimo tiempo de estudio.</span></span>.</p></blockquote>
<p data-i18n="imm.s2.lead">Mazos de <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, que toma su nombre de 暗記 (anki, «memorización»), es el <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema de repetición espaciada (SRS)</a> más usado del mundo y la herramienta con la que Fushi se integra por defecto. Dale cualquier cosa que quieras recordar y programará los repasos para que retengas lo máximo con el mínimo tiempo de estudio.</span></span> recomendados:</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="Un mazo de vocabulario de Anki para principiantes: unas 1.500 palabras japonesas de alta frecuencia, cada tarjeta con frase de ejemplo, audio y acento tonal. Creado por la comunidad The Moe Way; kaishi significa «comienzo»."><b>Kaishi 1.5k</b></span>: <a href="https://github.com/Dogi5/Kaishi-ESP">versión en español</a> (<a href="https://github.com/donkuri/Kaishi">repositorio original</a>).</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="Una referencia de gramática JLPT basada en la serie de gramática de aiueo.cc (la clase de pronunciación japonesa de Onigiri): 757 puntos gramaticales de N5 a N1, cada uno con frases de ejemplo grabadas por una profesora japonesa."><b>Gramática Onigiri</b></span>: el mazo de Anki solo existe en chino, así que usa en su lugar la <a href="https://aiueo.cc/pages_v2/en/grammars.php">guía de gramática Onigiri</a> de aiueo.cc (en inglés); hasta <span class="term" tabindex="0" data-tip="Niveles del JLPT (examen oficial de japonés): N5 es el más fácil y N1 el más difícil. La gramática básica cubre más o menos N5–N4, y N3 es el umbral del nivel intermedio; con un armazón gramatical de N4 basta para empezar la inmersión.">N3/N4</span> basta.</li>
</ul>
<p data-i18n="imm.s2.p">Mientras sigues con el vocabulario, empieza el siguiente paso: la inmersión.</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">P: Aprender los <span class="term" tabindex="0" data-tip="Los silabarios japoneses: hiragana y katakana, con 46 sonidos básicos cada uno, ordenados en cinco filas de vocales y diez columnas de consonantes; de ahí el nombre japonés «cincuenta sonidos». Son la base de la escritura japonesa y lo único que debes tener listo antes del vocabulario.">kana</span> es aburridísimo, ¿es normal?</h4>
<p data-i18n="imm.faq.a1a">Completamente normal, y casi todo el mundo siente lo mismo.</p>
<p data-i18n="imm.faq.a1b">No hace falta esperar a que «te guste estudiar kana» para empezar; ese día puede que no llegue nunca. Lo que necesitas es ponerte en marcha, aunque sean cinco minutos al día, aunque hoy solo te hayas quedado con あ.</p>
<p data-i18n="imm.faq.a1c">El progreso en sí genera motivación. El día en que de repente captes una palabra en un anime, todo el trabajo tedioso habrá valido la pena. Pero ese día no llega solo: primero hay que atravesar la etapa de «no entiendo nada».</p>
<h4 data-i18n="imm.faq.q2">P: ¿Cuánto tiempo debo dedicar a <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, que toma su nombre de 暗記 (anki, «memorización»), es el <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema de repetición espaciada (SRS)</a> más usado del mundo y la herramienta con la que Fushi se integra por defecto. Dale cualquier cosa que quieras recordar y programará los repasos para que retengas lo máximo con el mínimo tiempo de estudio.</span></span> cada día?</h4>
<p data-i18n="imm.faq.a2a">Menos de lo que crees.</p>
<p data-i18n="imm.faq.a2b">De 15 a 30 minutos al día, según lo que aguantes, hechos en serio, rinden mucho más que una sesión de dos horas de vez en cuando. La razón es simple: el hábito importa más que la intensidad. Un plan que puedes cumplir todos los días vale mucho más que un «plan intensivo» que sigues a ratos.</p>
<p data-i18n="imm.faq.a2c">Un mal día, haz solo 5 minutos. 5 minutos cuentan. <b>No importa que el carro vaya despacio; lo importante es no caerse.</b> Cuando el hábito se rompe, volver a empezar cuesta mucha más fuerza de voluntad de la que imaginas.</p>
<h4 data-i18n="imm.faq.q3">P: Tengo mala memoria y se me olvida todo, ¿qué hago?</h4>
<p data-i18n="imm.faq.a3a">Olvidar es normal. Combatirlo es precisamente la razón de ser de <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, que toma su nombre de 暗記 (anki, «memorización»), es el <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistema de repetición espaciada (SRS)</a> más usado del mundo y la herramienta con la que Fushi se integra por defecto. Dale cualquier cosa que quieras recordar y programará los repasos para que retengas lo máximo con el mínimo tiempo de estudio.</span></span>.</p>
<p data-i18n="imm.faq.a3b">Hoy no, mañana tampoco, pero un día se queda.</p>
</aside>

<h3 data-i18n="imm.s3.h">Paso 3: inmersión, <span class="term" tabindex="0" data-tip="Convertir una palabra nueva vista durante la inmersión en una tarjeta de Anki junto con la frase, el audio y la captura de donde salió. En Fushi es un toque para buscarla y otro para crear la tarjeta.">crear tarjetas</span> y estudiar vocabulario a la vez</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">Aprender un idioma implica aceptar un hecho: no vas a entenderlo todo.</p>
<p data-i18n="imm.s3.c2">Mucha gente siente que «no está lista» y quiere estudiar más antes de sumergirse; eso nunca funciona. Por mucho que te prepares, la primera vez que toques material real no lo entenderás todo. En vez de evitar la incomodidad, lánzate: cuanta más ambigüedad toleres, más rápido asimila el idioma tu cerebro.</p>
<p data-i18n="imm.s3.c3"><b>Si la ambigüedad es insoportable</b></p>
<ul data-i18n="imm.s3.c4"><li><b>Spoiléate antes</b>: lee un resumen del argumento, o vuelve a ver algo que ya conoces en tu idioma.</li><li><b>Subtítulos en tu idioma como último recurso</b>: normalmente no se recomiendan (se aprende poco), pero si estás totalmente perdido, aguanta un rato sin ellos y actívalos solo cuando no puedas más — o mira una vez sin y otra con.</li></ul>
</aside>
<p data-i18n="imm.s3.p1">Empieza por material fácil: los animes de vida cotidiana son más fáciles que los de combate, y las novelas ligeras más que la literatura.</p>
<p data-i18n="imm.s3.p2">Ve lo que te gusta, toca las palabras desconocidas para buscarlas y <span class="term" tabindex="0" data-tip="Convertir una palabra nueva vista durante la inmersión en una tarjeta de Anki junto con la frase, el audio y la captura de donde salió. En Fushi es un toque para buscarla y otro para crear la tarjeta.">crear tarjetas</span> cuando valga la pena.</p>
<p data-i18n="imm.s3.p3">Estudiar vocabulario es el único método activo, aparte de la inmersión, que importa: al principio construye tu vocabulario muy rápido.</p>

</div>
