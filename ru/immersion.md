---
title: "Обучение через погружение"
description: "Полное руководство для старта в изучении языка через погружение: зачем погружение, что это такое и шаги 0–3 — от каны и колод Anki до создания карточек прямо во время просмотра."
head:
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:title"
      content: "Обучение через погружение"
  - - meta
    - property: "og:description"
      content: "Полное руководство для старта в изучении языка через погружение: зачем погружение, что это такое и шаги 0–3 — от каны и колод Anki до создания карточек прямо во время просмотра."
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/ru/immersion"
  - - meta
    - property: "og:locale"
      content: "ru_RU"
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

<h1 data-i18n="imm.title">Обучение через погружение</h1>
<p class="note" data-i18n="imm.note">В этом руководстве пример — японский; тот же подход работает для любого языка.</p>

<h2 data-i18n="imm.fit.h">Подходит ли мне погружение?</h2>
<p data-i18n="imm.fit.p1">Учебники и упражнения — сомневаюсь, что многим это по-настоящему нравится. Откуда взяться мотивации для того, что не нравится, и надолго ли её хватит?</p>
<p data-i18n="imm.fit.p2"><b>Погружение — другое дело. У него только одно условие: настоящий интерес к контенту — аниме, шоу, фильмы, романы, игры, манга, что угодно, что вам нравится.</b></p>
<p data-i18n="imm.fit.p3">Не нужны ни база, ни талант, ни даже «решимость». Достаточно желания взяться за этот контент.</p>
<p data-i18n="imm.fit.p4">Выбирайте то, что любите. Важнее этого ничего нет.</p>

<h2 data-i18n="imm.what.h">Что такое погружение?</h2>
<p data-i18n="imm.what.p1">Слушать и читать то, что носители делают для носителей: аниме, романы, игры, шоу — вещи, созданные для носителей языка. Каждый сериал, который вы смотрите, и каждая игра, в которую играете, уже считаются.</p>
<p data-i18n="imm.what.p2">Вместо «сначала выучить, потом использовать» при погружении вы естественно учитесь, используя.</p>
<p data-i18n="imm.what.p3">Погружение — путь, который в итоге проходит каждый. Зубрёжка слов, грамматика и упражнения дают базу, но язык слишком огромен для любого учебника. Вы читаете этот абзац без усилий не потому, что заучили правила грамматики, а потому, что больше десяти лет огромного объёма родной речи выстроили в вашем мозге бесчисленные интуиции. С иностранным языком так же: эта интуиция рождается только из большого количества настоящего материала.</p>
<p data-i18n="imm.what.p4">Да, погружение начинается с периода, когда вы почти ничего не понимаете. Но раз вы выбрали контент, который любите, вы можете смотреть дальше, даже не понимая всего. Быстро или медленно, много или мало — важнее всего ваш интерес к самому контенту.</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">Как работает обучение через погружение?</summary>
<p data-i18n="imm.theory.p1">Язык не «учат», его усваивают. Вы никогда не заучивали таблицы грамматики родного языка, и всё же говорите на нём естественнее, чем научит любой учебник, — благодаря одному: огромному объёму материала, который вы по большей части понимали.</p>
<blockquote><p data-i18n="imm.theory.quote">«Мы усваиваем язык только одним способом: понимая сообщения».</p><cite data-i18n="imm.theory.cite">— Стивен Крашен</cite></blockquote>
<p data-i18n="imm.theory.p2">Знать значение слова — лишь первый шаг. Чтобы почувствовать, как оно употребляется, нужно встретить его — и понять — много раз в самых разных контекстах.</p>
<p data-i18n="imm.theory.p3">Именно такое разнообразие даёт погружение. Каждый раз, когда вы видите слово и понимаете его, интуиция становится острее. В конце концов она настолько ясна, что вы просто знаете, как это слово используется.</p>
</details>

<h2 data-i18n="imm.start.h">Начало</h2>

<h3 data-i18n="imm.s0.h">Шаг 0: настройте Fushi</h3>
<blockquote><p data-i18n="imm.s0.side">Рекомендуемый пакет в первичной настройке уже включает основные словари и аудиобазы — искать ресурсы самому не нужно.</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/download">Скачайте Fushi</a> и пройдите первичную настройку: словари, база аудио слов, затем установите и подключите <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, названный от 暗記 (анки, «заучивание»), — самая распространённая в мире <a href="https://en.wikipedia.org/wiki/Spaced_repetition">система интервальных повторений (SRS)</a> и инструмент, с которым Fushi интегрируется по умолчанию. Отдайте ему всё, что хотите запомнить, и он спланирует повторения так, чтобы запоминать больше за меньшее время.</span></span>. Дальше одно касание ищет слово во время просмотра или чтения, а второе создаёт карточку <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, названный от 暗記 (анки, «заучивание»), — самая распространённая в мире <a href="https://en.wikipedia.org/wiki/Spaced_repetition">система интервальных повторений (SRS)</a> и инструмент, с которым Fushi интегрируется по умолчанию. Отдайте ему всё, что хотите запомнить, и он спланирует повторения так, чтобы запоминать больше за меньшее время.</span></span> с предложением, аудио и скриншотом.</p>

<h3 data-i18n="imm.s1.h">Шаг 1: выучите <span class="term" tabindex="0" data-tip="Японские слоговые азбуки: хирагана и катакана, по 46 базовых звуков в каждой, расположенных в пять рядов гласных и десять столбцов согласных — отсюда японское название «пятьдесят звуков». Это основа японского письма и единственное, что нужно пройти до лексики.">кану</span></h3>
<ul>
<li data-i18n="imm.s1.li1">Рекомендуем <a href="https://kanabr.vercel.app/">kanabr</a> (<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>) — тренажёр набора от <a href="https://l-m-sherlock.github.io/">L-M-Sherlock</a>, который открывает кану шаг за шагом и заодно учит печатать по-японски.</li>
<li data-i18n="imm.s1.li2">Или любой другой инструмент по вкусу.</li>
</ul>
<p data-i18n="imm.s1.p">Достаточно один раз пройти хирагану. Заучивать наизусть не нужно — словарные карточки закрепят её снова и снова.</p>

<h3 data-i18n="imm.s2.h">Шаг 2: базовая лексика и грамматика</h3>
<blockquote><p data-i18n="imm.s2.side">5–20 новых карточек в день хватит, а <span class="term" tabindex="0" data-tip="Параметр «целевое удержание» алгоритма FSRS в Anki, по умолчанию 90 %. Снижение до 70–80 % заметно уменьшает ежедневные повторения ценой чуть большего забывания — на старте выгодная сделка, ведь погружение вас подстрахует.">целевое удержание</span> можно снизить до 70–80 %. Повторения в <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, названный от 暗記 (анки, «заучивание»), — самая распространённая в мире <a href="https://en.wikipedia.org/wiki/Spaced_repetition">система интервальных повторений (SRS)</a> и инструмент, с которым Fushi интегрируется по умолчанию. Отдайте ему всё, что хотите запомнить, и он спланирует повторения так, чтобы запоминать больше за меньшее время.</span></span> накапливаются через две-три недели; слишком много новых карточек — главная причина, по которой люди бросают <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, названный от 暗記 (анки, «заучивание»), — самая распространённая в мире <a href="https://en.wikipedia.org/wiki/Spaced_repetition">система интервальных повторений (SRS)</a> и инструмент, с которым Fushi интегрируется по умолчанию. Отдайте ему всё, что хотите запомнить, и он спланирует повторения так, чтобы запоминать больше за меньшее время.</span></span>.</p></blockquote>
<p data-i18n="imm.s2.lead">Рекомендуемые колоды <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, названный от 暗記 (анки, «заучивание»), — самая распространённая в мире <a href="https://en.wikipedia.org/wiki/Spaced_repetition">система интервальных повторений (SRS)</a> и инструмент, с которым Fushi интегрируется по умолчанию. Отдайте ему всё, что хотите запомнить, и он спланирует повторения так, чтобы запоминать больше за меньшее время.</span></span>:</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="Колода лексики Anki для начинающих: около 1 500 частотных японских слов, каждая карточка с примером, аудио и тональным ударением. Создана сообществом The Moe Way; kaishi означает «начало»."><b>Kaishi 1.5k</b></span>: <a href="https://github.com/NeonGooRoo/KaishiRu">русская версия</a> (<a href="https://github.com/donkuri/Kaishi">оригинальный репозиторий</a>).</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="Справочник грамматики JLPT на основе грамматической серии aiueo.cc (класс японского произношения Onigiri): 757 грамматических конструкций от N5 до N1, каждая с примерами, озвученными японским преподавателем."><b>Грамматика Onigiri</b></span>: колода Anki существует только на китайском, поэтому используйте вместо неё <a href="https://aiueo.cc/pages_v2/en/grammars.php">справочник грамматики Onigiri</a> на aiueo.cc (на английском); до <span class="term" tabindex="0" data-tip="Уровни JLPT (официальный экзамен по японскому): N5 — самый лёгкий, N1 — самый сложный. Базовая грамматика примерно покрывает N5–N4, N3 — порог среднего уровня; грамматического каркаса около N4 хватает, чтобы начать погружение.">N3/N4</span> достаточно.</li>
</ul>
<p data-i18n="imm.s2.p">Пока ещё учите слова, начинайте следующий шаг — погружение.</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">В: Учить <span class="term" tabindex="0" data-tip="Японские слоговые азбуки: хирагана и катакана, по 46 базовых звуков в каждой, расположенных в пять рядов гласных и десять столбцов согласных — отсюда японское название «пятьдесят звуков». Это основа японского письма и единственное, что нужно пройти до лексики.">кану</span> так скучно — это нормально?</h4>
<p data-i18n="imm.faq.a1a">Совершенно нормально, и почти все чувствуют то же самое.</p>
<p data-i18n="imm.faq.a1b">Не нужно ждать, пока «полюбите учить кану», чтобы начать, — этот день может не наступить никогда. Нужно просто начать двигаться, пусть даже по пять минут в день, пусть даже сегодня вы запомнили только あ.</p>
<p data-i18n="imm.faq.a1c">Прогресс сам создаёт мотивацию. В тот день, когда вы вдруг расслышите слово в аниме, вся нудная подготовка окажется не зря. Но этот день не придёт сам — сначала нужно пережить период «я ничего не понимаю».</p>
<h4 data-i18n="imm.faq.q2">В: Сколько времени уделять <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, названный от 暗記 (анки, «заучивание»), — самая распространённая в мире <a href="https://en.wikipedia.org/wiki/Spaced_repetition">система интервальных повторений (SRS)</a> и инструмент, с которым Fushi интегрируется по умолчанию. Отдайте ему всё, что хотите запомнить, и он спланирует повторения так, чтобы запоминать больше за меньшее время.</span></span> каждый день?</h4>
<p data-i18n="imm.faq.a2a">Меньше, чем вы думаете.</p>
<p data-i18n="imm.faq.a2b">15–30 минут в день, в зависимости от того, сколько вы выдерживаете, но всерьёз — это намного эффективнее, чем два часа время от времени. Причина проста: привычка важнее интенсивности. План, который вы выдерживаете каждый день, куда ценнее «хардкорного плана», который соблюдается через раз.</p>
<p data-i18n="imm.faq.a2c">В плохой день сделайте только 5 минут. 5 минут считаются. <b>Пусть повозка едет медленно — главное с неё не свалиться.</b> Стоит привычке прерваться, и на новый старт уйдёт куда больше силы воли, чем вы ожидаете.</p>
<h4 data-i18n="imm.faq.q3">В: У меня плохая память, всё забываю — что делать?</h4>
<p data-i18n="imm.faq.a3a">Забывать — нормально. Бороться с этим — и есть смысл <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, названный от 暗記 (анки, «заучивание»), — самая распространённая в мире <a href="https://en.wikipedia.org/wiki/Spaced_repetition">система интервальных повторений (SRS)</a> и инструмент, с которым Fushi интегрируется по умолчанию. Отдайте ему всё, что хотите запомнить, и он спланирует повторения так, чтобы запоминать больше за меньшее время.</span></span>.</p>
<p data-i18n="imm.faq.a3b">Не сегодня, не завтра — но однажды запомнится.</p>
</aside>

<h3 data-i18n="imm.s3.h">Шаг 3: погружение, а параллельно <span class="term" tabindex="0" data-tip="Превратить новое слово, встреченное при погружении, в карточку Anki вместе с предложением, аудио и скриншотом, где оно попалось. В Fushi это одно касание, чтобы найти, и ещё одно, чтобы создать карточку.">делайте карточки</span> и слова</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">Учить язык — значит принять один факт: всего вы не поймёте.</p>
<p data-i18n="imm.s3.c2">Многие чувствуют, что «ещё не готовы», и хотят подучить ещё, прежде чем погружаться, — это никогда не работает. Как бы вы ни готовились, при первом контакте с настоящим материалом вы не поймёте всего. Вместо того чтобы избегать дискомфорта, ныряйте: чем спокойнее вы относитесь к неясности, тем быстрее мозг усваивает язык.</p>
<p data-i18n="imm.s3.c3"><b>Если неясность невыносима</b></p>
<ul data-i18n="imm.s3.c4"><li><b>Сначала спойлеры</b>: прочитайте краткое содержание заранее или пересмотрите то, что уже знаете на родном языке.</li><li><b>Субтитры на родном языке как крайняя мера</b>: обычно не рекомендуются (от них мало пользы), но если вы совсем потерялись, сначала продержитесь без них и включайте только когда совсем невмоготу — или посмотрите один раз без, другой с ними.</li></ul>
</aside>
<p data-i18n="imm.s3.p1">Начинайте с лёгкого материала — повседневные аниме проще боевых, ранобэ проще художественной литературы.</p>
<p data-i18n="imm.s3.p2">Смотрите то, что любите, ищите незнакомые слова одним касанием и <span class="term" tabindex="0" data-tip="Превратить новое слово, встреченное при погружении, в карточку Anki вместе с предложением, аудио и скриншотом, где оно попалось. В Fushi это одно касание, чтобы найти, и ещё одно, чтобы создать карточку.">делайте карточки</span>, когда это стоит того.</p>
<p data-i18n="imm.s3.p3">Изучение слов — единственный активный метод помимо погружения, который имеет значение: на старте он быстро наращивает словарный запас.</p>

</div>
