---
title: "Apprendre par immersion"
description: "Guide complet pour apprendre une langue par immersion : pourquoi l’immersion, ce que c’est, et les étapes 0 à 3, des kana et des paquets Anki à la création de cartes en regardant."
head:
  - - meta
    - name: "fushi-title"
      content: "{imm.title} | Fushi"
  - - meta
    - name: "fushi-description"
      content: "{imm.meta.desc}"
  - - link
    - rel: "canonical"
      href: "https://fushi.moe/fr/immersion"
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:site_name"
      content: "Fushi"
  - - meta
    - property: "og:title"
      content: "Apprendre par immersion"
  - - meta
    - property: "og:description"
      content: "Guide complet pour apprendre une langue par immersion : pourquoi l’immersion, ce que c’est, et les étapes 0 à 3, des kana et des paquets Anki à la création de cartes en regardant."
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/fr/immersion"
  - - meta
    - property: "og:locale"
      content: "fr_FR"
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

<h1 data-i18n="imm.title">Apprendre par immersion</h1>
<p class="note" data-i18n="imm.note">Ce guide prend le japonais en exemple ; la même approche vaut pour toutes les langues.</p>

<h2 data-i18n="imm.fit.h">L’immersion est-elle faite pour moi ?</h2>
<p data-i18n="imm.fit.p1">Manuels et exercices : je doute que beaucoup de gens y prennent vraiment plaisir. D’où vient la motivation pour quelque chose qu’on n’aime pas, et combien de temps tient-elle ?</p>
<p data-i18n="imm.fit.p2"><b>L’immersion, c’est différent. Elle n’a qu’une seule condition : un intérêt sincère pour le contenu — anime, émissions, films, romans, jeux, manga, tout ce que vous aimez.</b></p>
<p data-i18n="imm.fit.p3">Aucune base, aucun talent, même pas besoin de « se décider ». Il suffit d’avoir envie d’aller vers ce contenu.</p>
<p data-i18n="imm.fit.p4">Choisissez du contenu que vous aimez. Rien n’est plus important.</p>

<h2 data-i18n="imm.what.h">Qu’est-ce que l’immersion ?</h2>
<p data-i18n="imm.what.p1">Écouter et lire ce que les natifs font pour les natifs : anime, romans, jeux, émissions — des choses faites pour un public natif. Chaque série que vous regardez et chaque jeu auquel vous jouez comptent déjà.</p>
<p data-i18n="imm.what.p2">Au lieu d’« apprendre d’abord, utiliser ensuite », l’immersion vous fait apprendre naturellement en utilisant.</p>
<p data-i18n="imm.what.p3">L’immersion est le chemin que tout le monde finit par devoir emprunter. Le vocabulaire par cœur, la grammaire et les exercices donnent une base, mais une langue est bien trop vaste pour n’importe quel manuel. Si vous lisez ce paragraphe sans effort, ce n’est pas parce que vous avez mémorisé des règles de grammaire, mais parce que plus de dix ans d’input massif dans votre langue maternelle ont construit d’innombrables intuitions dans votre cerveau. Pour une langue étrangère, c’est pareil : cette intuition ne vient que de grandes quantités d’input réel.</p>
<p data-i18n="imm.what.p4">L’immersion commence effectivement par une période où l’on ne comprend presque rien. Mais comme vous avez choisi du contenu que vous aimez, vous pouvez continuer à regarder même sans tout comprendre. Vite ou lentement, beaucoup ou peu : ce qui compte le plus, c’est votre intérêt pour le contenu lui-même.</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">Comment fonctionne l’apprentissage par immersion ?</summary>
<p data-i18n="imm.theory.p1">Une langue ne s’« apprend » pas, elle s’acquiert. Vous n’avez jamais mémorisé de tableaux de grammaire pour votre langue maternelle, et pourtant vous la parlez plus naturellement que n’importe quel livre ne pourrait l’enseigner — grâce à une seule chose : une énorme quantité d’input que vous compreniez en grande partie.</p>
<blockquote><p data-i18n="imm.theory.quote">« Nous n’acquérons le langage que d’une seule façon : en comprenant des messages. »</p><cite data-i18n="imm.theory.cite">— Stephen Krashen</cite></blockquote>
<p data-i18n="imm.theory.p2">Connaître le sens d’un mot n’est que la première étape. Pour acquérir l’intuition de son usage, il faut le rencontrer — et le comprendre — de nombreuses fois dans de nombreux contextes différents.</p>
<p data-i18n="imm.theory.p3">L’immersion vous expose précisément à cette variété. Chaque fois que vous voyez un mot et que vous le comprenez, votre intuition s’affine. Elle finit par devenir si nette que vous savez simplement comment le mot s’emploie.</p>
</details>

<h2 data-i18n="imm.start.h">Commencer</h2>

<h3 data-i18n="imm.s0.h">Étape 0 : installer Fushi</h3>
<blockquote><p data-i18n="imm.s0.side">Le pack recommandé du guide de démarrage regroupe déjà les dictionnaires et bibliothèques audio courants : inutile de chercher des ressources vous-même.</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/fr/download">Téléchargez Fushi</a> et suivez le guide de démarrage : dictionnaires, base audio des mots, puis installation et connexion d’<span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dont le nom vient de 暗記 (anki, « mémorisation »), est le <a href="https://en.wikipedia.org/wiki/Spaced_repetition">système de répétition espacée (SRS)</a> le plus utilisé au monde et l’outil avec lequel Fushi s’intègre par défaut. Confiez-lui tout ce que vous voulez retenir : il planifie les révisions pour une rétention maximale avec un temps d’étude minimal.</span></span>. Ensuite, un appui cherche un mot pendant que vous regardez ou lisez, et un second crée une carte <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dont le nom vient de 暗記 (anki, « mémorisation »), est le <a href="https://en.wikipedia.org/wiki/Spaced_repetition">système de répétition espacée (SRS)</a> le plus utilisé au monde et l’outil avec lequel Fushi s’intègre par défaut. Confiez-lui tout ce que vous voulez retenir : il planifie les révisions pour une rétention maximale avec un temps d’étude minimal.</span></span> avec la phrase, l’audio et la capture.</p>

<h3 data-i18n="imm.s1.h">Étape 1 : apprendre les <span class="term" tabindex="0" data-tip="Les syllabaires japonais : hiragana et katakana, 46 sons de base chacun, disposés en cinq rangées de voyelles et dix colonnes de consonnes — d’où le nom japonais « cinquante sons ». Ils sont la base de l’écriture japonaise et la seule chose à maîtriser avant le vocabulaire.">kana</span></h3>
<ul>
<li data-i18n="imm.s1.li1">Recommandé : <a href="https://kanabr.vercel.app/">kanabr</a> (<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>), un entraîneur de frappe créé par <a href="https://l-m-sherlock.github.io/">L-M-Sherlock</a> qui débloque les kana progressivement — et vous apprend au passage à taper en japonais.</li>
<li data-i18n="imm.s1.li2">Ou n’importe quel outil qui vous plaît.</li>
</ul>
<p data-i18n="imm.s1.p">Faire une fois le tour des hiragana suffit. Inutile de les maîtriser : le vocabulaire les consolidera sans cesse.</p>

<h3 data-i18n="imm.s2.h">Étape 2 : vocabulaire et grammaire de base</h3>
<blockquote><p data-i18n="imm.s2.side">5 à 20 nouvelles cartes par jour suffisent, et vous pouvez baisser la <span class="term" tabindex="0" data-tip="Le réglage « rétention souhaitée » de l’algorithme FSRS d’Anki, 90 % par défaut. L’abaisser à 70–80 % réduit nettement les révisions quotidiennes au prix d’un peu plus d’oubli — un bon compromis au début, quand l’immersion prend le relais.">rétention souhaitée</span> à 70–80 %. Les révisions <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dont le nom vient de 暗記 (anki, « mémorisation »), est le <a href="https://en.wikipedia.org/wiki/Spaced_repetition">système de répétition espacée (SRS)</a> le plus utilisé au monde et l’outil avec lequel Fushi s’intègre par défaut. Confiez-lui tout ce que vous voulez retenir : il planifie les révisions pour une rétention maximale avec un temps d’étude minimal.</span></span> s’accumulent au bout de deux ou trois semaines ; ajouter trop de nouvelles cartes est la raison pour laquelle la plupart des gens abandonnent <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dont le nom vient de 暗記 (anki, « mémorisation »), est le <a href="https://en.wikipedia.org/wiki/Spaced_repetition">système de répétition espacée (SRS)</a> le plus utilisé au monde et l’outil avec lequel Fushi s’intègre par défaut. Confiez-lui tout ce que vous voulez retenir : il planifie les révisions pour une rétention maximale avec un temps d’étude minimal.</span></span>.</p></blockquote>
<p data-i18n="imm.s2.lead">Paquets <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dont le nom vient de 暗記 (anki, « mémorisation »), est le <a href="https://en.wikipedia.org/wiki/Spaced_repetition">système de répétition espacée (SRS)</a> le plus utilisé au monde et l’outil avec lequel Fushi s’intègre par défaut. Confiez-lui tout ce que vous voulez retenir : il planifie les révisions pour une rétention maximale avec un temps d’étude minimal.</span></span> recommandés :</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="Un paquet de vocabulaire Anki pour débutants : environ 1 500 mots japonais très fréquents, chaque carte avec phrase d’exemple, audio et accent tonal. Créé par la communauté The Moe Way ; kaishi signifie « commencement »."><b>Kaishi 1.5k</b></span> : <a href="https://github.com/khmskhmskhms/kaishi-FR">version française</a> (<a href="https://github.com/donkuri/Kaishi">dépôt d’origine</a>).</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="Une référence de grammaire JLPT fondée sur la série de grammaire d’aiueo.cc (la classe de prononciation japonaise d’Onigiri) : 757 points de grammaire de N5 à N1, chacun avec des phrases d’exemple enregistrées par une enseignante japonaise."><b>Grammaire Onigiri</b></span> : le paquet Anki n’existe qu’en chinois, utilisez plutôt le <a href="https://aiueo.cc/pages_v2/en/grammars.php">guide de grammaire Onigiri</a> sur aiueo.cc (en anglais) ; jusqu’à <span class="term" tabindex="0" data-tip="Les niveaux du JLPT (test officiel de japonais) : N5 est le plus facile, N1 le plus difficile. La grammaire de base couvre à peu près N5–N4, et N3 marque le seuil de l’intermédiaire ; une ossature grammaticale autour de N4 suffit pour commencer l’immersion.">N3/N4</span> suffit.</li>
</ul>
<p data-i18n="imm.s2.p">Pendant que vous apprenez encore le vocabulaire, commencez l’étape suivante : l’immersion.</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">Q : Apprendre les <span class="term" tabindex="0" data-tip="Les syllabaires japonais : hiragana et katakana, 46 sons de base chacun, disposés en cinq rangées de voyelles et dix colonnes de consonnes — d’où le nom japonais « cinquante sons ». Ils sont la base de l’écriture japonaise et la seule chose à maîtriser avant le vocabulaire.">kana</span>, c’est d’un ennui — c’est normal ?</h4>
<p data-i18n="imm.faq.a1a">Tout à fait normal, et presque tout le monde ressent la même chose.</p>
<p data-i18n="imm.faq.a1b">Inutile d’attendre d’« aimer apprendre les kana » pour commencer — ce jour ne viendra peut-être jamais. Ce qu’il vous faut, c’est vous mettre en mouvement, même cinq minutes par jour, même si aujourd’hui vous n’avez retenu que あ.</p>
<p data-i18n="imm.faq.a1c">Le progrès lui-même crée la motivation. Le jour où vous attraperez soudain un mot dans un anime, tout le travail fastidieux prendra sens. Mais ce jour n’arrive pas tout seul : il faut d’abord traverser la phase « je ne comprends rien ».</p>
<h4 data-i18n="imm.faq.q2">Q : Combien de temps consacrer à <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dont le nom vient de 暗記 (anki, « mémorisation »), est le <a href="https://en.wikipedia.org/wiki/Spaced_repetition">système de répétition espacée (SRS)</a> le plus utilisé au monde et l’outil avec lequel Fushi s’intègre par défaut. Confiez-lui tout ce que vous voulez retenir : il planifie les révisions pour une rétention maximale avec un temps d’étude minimal.</span></span> chaque jour ?</h4>
<p data-i18n="imm.faq.a2a">Moins que vous ne le pensez.</p>
<p data-i18n="imm.faq.a2b">15 à 30 minutes par jour, selon ce que vous supportez, faites sérieusement, valent bien plus qu’une séance de deux heures de temps en temps. La raison est simple : l’habitude compte plus que l’intensité. Un plan que vous tenez tous les jours vaut bien plus qu’un « plan intensif » suivi par à-coups.</p>
<p data-i18n="imm.faq.a2c">Un mauvais jour, faites juste 5 minutes. 5 minutes comptent. <b>Peu importe que la charrette avance lentement ; l’essentiel est de ne pas en tomber.</b> Une fois l’habitude rompue, repartir coûte bien plus de volonté que vous ne l’imaginez.</p>
<h4 data-i18n="imm.faq.q3">Q : J’ai une mauvaise mémoire, j’oublie tout — que faire ?</h4>
<p data-i18n="imm.faq.a3a">Oublier est normal. Lutter contre l’oubli, c’est précisément la raison d’être d’<span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dont le nom vient de 暗記 (anki, « mémorisation »), est le <a href="https://en.wikipedia.org/wiki/Spaced_repetition">système de répétition espacée (SRS)</a> le plus utilisé au monde et l’outil avec lequel Fushi s’intègre par défaut. Confiez-lui tout ce que vous voulez retenir : il planifie les révisions pour une rétention maximale avec un temps d’étude minimal.</span></span>.</p>
<p data-i18n="imm.faq.a3b">Pas aujourd’hui, pas demain — mais un jour, ça reste.</p>
</aside>

<h3 data-i18n="imm.s3.h">Étape 3 : immersion, <span class="term" tabindex="0" data-tip="Transformer un mot nouveau rencontré en immersion en carte Anki, avec la phrase, l’audio et la capture d’où il vient. Dans Fushi, un appui pour chercher, un autre pour créer la carte.">créez des cartes</span> et vocabulaire en même temps</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">Apprendre une langue, c’est accepter un fait : vous ne comprendrez pas tout.</p>
<p data-i18n="imm.s3.c2">Beaucoup se sentent « pas prêts » et veulent étudier davantage avant l’immersion — ça ne marche jamais. Quelle que soit votre préparation, vous ne comprendrez pas tout la première fois que vous toucherez du vrai contenu. Plutôt que d’éviter l’inconfort, plongez : plus vous tolérez le flou, plus vite votre cerveau assimile la langue.</p>
<p data-i18n="imm.s3.c3"><b>Si le flou est insupportable</b></p>
<ul data-i18n="imm.s3.c4"><li><b>Spoilez-vous d’abord</b> : lisez un résumé de l’intrigue, ou revoyez quelque chose que vous connaissez déjà dans votre langue.</li><li><b>Sous-titres dans votre langue en dernier recours</b> : déconseillé en général (on en apprend peu), mais si vous êtes complètement perdu, tenez un moment sans, et ne les affichez que quand il le faut — ou regardez une fois sans, une fois avec.</li></ul>
</aside>
<p data-i18n="imm.s3.p1">Commencez par du contenu facile : les tranches de vie sont plus faciles que les anime de combat, les light novels plus faciles que la littérature.</p>
<p data-i18n="imm.s3.p2">Regardez ce que vous aimez, appuyez sur les mots inconnus pour les chercher, et <span class="term" tabindex="0" data-tip="Transformer un mot nouveau rencontré en immersion en carte Anki, avec la phrase, l’audio et la capture d’où il vient. Dans Fushi, un appui pour chercher, un autre pour créer la carte.">créez des cartes</span> quand ça en vaut la peine.</p>
<p data-i18n="imm.s3.p3">Le vocabulaire est la seule méthode active, hors immersion, qui compte : au début, il construit votre lexique très vite.</p>

</div>
