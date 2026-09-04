---
title: "التعلّم بالانغماس"
description: "دليل كامل لبدء تعلّم لغة بالانغماس: لماذا الانغماس، وما هو، والخطوات من 0 إلى 3 من الكانا ومجموعات Anki إلى صنع البطاقات أثناء المشاهدة."
head:
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:title"
      content: "التعلّم بالانغماس"
  - - meta
    - property: "og:description"
      content: "دليل كامل لبدء تعلّم لغة بالانغماس: لماذا الانغماس، وما هو، والخطوات من 0 إلى 3 من الكانا ومجموعات Anki إلى صنع البطاقات أثناء المشاهدة."
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/ar/immersion"
  - - meta
    - property: "og:locale"
      content: "ar_AR"
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

<h1 data-i18n="imm.title">التعلّم بالانغماس</h1>
<p class="note" data-i18n="imm.note">يتخذ هذا الدليل اليابانية مثالًا؛ والنهج نفسه يصلح لأي لغة.</p>

<h2 data-i18n="imm.fit.h">هل يناسبني الانغماس؟</h2>
<p data-i18n="imm.fit.p1">الكتب المدرسية والتمارين — أشك أن كثيرين يستمتعون بها حقًا. من أين يأتي الدافع لشيء لا تحبه، وكم يدوم؟</p>
<p data-i18n="imm.fit.p2"><b>الانغماس مختلف. له شرط واحد فقط: اهتمام حقيقي بالمحتوى — أنمي، برامج، أفلام، روايات، ألعاب، مانغا، أي شيء تحبه.</b></p>
<p data-i18n="imm.fit.p3">لا حاجة إلى أساس، ولا موهبة، ولا حتى إلى «عزم». يكفي أن ترغب في الاقتراب من هذا المحتوى.</p>
<p data-i18n="imm.fit.p4">اختر محتوى تحبه. لا شيء أهم من ذلك.</p>

<h2 data-i18n="imm.what.h">ما هو الانغماس؟</h2>
<p data-i18n="imm.what.p1">أن تستمع وتقرأ ما يصنعه الناطقون الأصليون للناطقين الأصليين: أنمي، روايات، ألعاب، برامج — أشياء صُنعت لجمهور ناطق باللغة. كل مسلسل تشاهده وكل لعبة تلعبها يُحسبان أصلًا.</p>
<p data-i18n="imm.what.p2">بدل «تعلّم أولًا ثم استخدم»، تتعلّم في الانغماس بشكل طبيعي أثناء الاستخدام.</p>
<p data-i18n="imm.what.p3">الانغماس هو الطريق الذي لا بدّ للجميع من سلوكه في النهاية. حفظ المفردات ودراسة القواعد والتمارين تمنحك أساسًا، لكن اللغة أوسع بكثير مما يغطيه أي كتاب. تقرأ هذه الفقرة بلا جهد لا لأنك حفظت قواعد النحو، بل لأن أكثر من عقد من المدخلات الهائلة بلغتك الأم بنى في دماغك حدسًا لغويًا لا يُحصى. واللغة الأجنبية كذلك: هذا الحدس لا يأتي إلا من كمّ كبير من المدخلات الحقيقية.</p>
<p data-i18n="imm.what.p4">صحيح أن الانغماس يبدأ بمرحلة لا تفهم فيها شيئًا تقريبًا. لكن لأنك اخترت محتوى تحبه، يمكنك مواصلة المشاهدة حتى وإن لم تفهم كل شيء. سريعًا كان التقدم أم بطيئًا، كثيرًا أم قليلًا — الأهم هو اهتمامك بالمحتوى نفسه.</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">كيف يعمل التعلّم بالانغماس؟</summary>
<p data-i18n="imm.theory.p1">اللغة لا «تُتعلَّم» بل تُكتسَب. لم تحفظ يومًا جداول قواعد لغتك الأم، ومع ذلك تتكلمها بطلاقة تفوق ما يعلّمه أي كتاب قواعد — بفضل شيء واحد: كمّ هائل من المدخلات فهمتَ معظمه.</p>
<blockquote><p data-i18n="imm.theory.quote">«نكتسب اللغة بطريقة واحدة فقط: بفهم الرسائل.»</p><cite data-i18n="imm.theory.cite">— ستيفن كراشن</cite></blockquote>
<p data-i18n="imm.theory.p2">معرفة معنى الكلمة ليست سوى الخطوة الأولى لاكتسابها. ولاكتساب «الحدس» في استعمالها، عليك أن تصادفها — وتفهمها — مرات كثيرة في سياقات متعددة.</p>
<p data-i18n="imm.theory.p3">الانغماس يعرّضك لهذا التنوع بالضبط. في كل مرة ترى فيها كلمة وتفهمها، يزداد حدسك حدّة. وفي النهاية يصبح واضحًا إلى درجة أنك ببساطة تعرف كيف تُستعمل الكلمة.</p>
</details>

<h2 data-i18n="imm.start.h">البداية</h2>

<h3 data-i18n="imm.s0.h">الخطوة 0: إعداد Fushi</h3>
<blockquote><p data-i18n="imm.s0.side">الحزمة الموصى بها في دليل البداية تجمع القواميس ومكتبات الصوت الشائعة مسبقًا — لا داعي للبحث عن الموارد بنفسك.</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/download">نزّل Fushi</a> واتبع دليل البداية: القواميس، قاعدة بيانات صوت الكلمات، ثم ثبّت <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>، المسمّى على اسم 暗記 (أنكي، «الحفظ»)، هو <a href="https://en.wikipedia.org/wiki/Spaced_repetition">نظام التكرار المتباعد (SRS)</a> الأكثر استخدامًا في العالم والأداة التي يتكامل معها Fushi افتراضيًا. أعطه أي شيء تريد تذكّره وسيجدول المراجعات لتحفظ أكثر ما يمكن بأقل وقت دراسة.</span></span> واربطه. بعدها تبحث عن كلمة بلمسة واحدة أثناء المشاهدة أو القراءة، وبلمسة أخرى تصنع بطاقة <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>، المسمّى على اسم 暗記 (أنكي، «الحفظ»)، هو <a href="https://en.wikipedia.org/wiki/Spaced_repetition">نظام التكرار المتباعد (SRS)</a> الأكثر استخدامًا في العالم والأداة التي يتكامل معها Fushi افتراضيًا. أعطه أي شيء تريد تذكّره وسيجدول المراجعات لتحفظ أكثر ما يمكن بأقل وقت دراسة.</span></span> مع الجملة والصوت ولقطة الشاشة.</p>

<h3 data-i18n="imm.s1.h">الخطوة 1: حفظ <span class="term" tabindex="0" data-tip="المقطعيات اليابانية: الهيراغانا والكاتاكانا، 46 صوتًا أساسيًا لكل منهما، مرتبة في خمسة صفوف للحركات وعشرة أعمدة للصوامت — ومن هنا الاسم الياباني «الأصوات الخمسون». هي أساس الكتابة اليابانية والعقبة الوحيدة التي لا بد من تجاوزها قبل المفردات.">الكانا</span></h3>
<ul>
<li data-i18n="imm.s1.li1">نوصي بـ <a href="https://kanabr.vercel.app/">kanabr</a> (<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>)، مدرّب طباعة من صنع <a href="https://l-m-sherlock.github.io/">L-M-Sherlock</a> يفتح الكانا تدريجيًا — ويعلّمك في الوقت نفسه الكتابة باليابانية على لوحة المفاتيح.</li>
<li data-i18n="imm.s1.li2">أو أي أداة تفضّلها.</li>
</ul>
<p data-i18n="imm.s1.p">يكفي المرور على الهيراغانا مرة واحدة. لا داعي لإتقانها؛ حفظ المفردات سيرسّخها مرارًا.</p>

<h3 data-i18n="imm.s2.h">الخطوة 2: المفردات والقواعد الأساسية</h3>
<blockquote><p data-i18n="imm.s2.side">5–20 بطاقة جديدة يوميًا كافية، ويمكنك خفض <span class="term" tabindex="0" data-tip="إعداد «نسبة الاستبقاء المرغوبة» في خوارزمية FSRS ضمن Anki، وقيمته الافتراضية 90٪. خفضه إلى 70–80٪ يقلّص المراجعات اليومية بوضوح مقابل نسيان أكثر قليلًا — صفقة رابحة في البداية حين يساندك الانغماس.">نسبة الاستبقاء المرغوبة</span> إلى 70–80٪. مراجعات <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>، المسمّى على اسم 暗記 (أنكي، «الحفظ»)، هو <a href="https://en.wikipedia.org/wiki/Spaced_repetition">نظام التكرار المتباعد (SRS)</a> الأكثر استخدامًا في العالم والأداة التي يتكامل معها Fushi افتراضيًا. أعطه أي شيء تريد تذكّره وسيجدول المراجعات لتحفظ أكثر ما يمكن بأقل وقت دراسة.</span></span> تتراكم بعد أسبوعين أو ثلاثة؛ وإضافة بطاقات جديدة أكثر من اللازم هي سبب تخلّي معظم الناس عن <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>، المسمّى على اسم 暗記 (أنكي، «الحفظ»)، هو <a href="https://en.wikipedia.org/wiki/Spaced_repetition">نظام التكرار المتباعد (SRS)</a> الأكثر استخدامًا في العالم والأداة التي يتكامل معها Fushi افتراضيًا. أعطه أي شيء تريد تذكّره وسيجدول المراجعات لتحفظ أكثر ما يمكن بأقل وقت دراسة.</span></span>.</p></blockquote>
<p data-i18n="imm.s2.lead">مجموعات <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>، المسمّى على اسم 暗記 (أنكي، «الحفظ»)، هو <a href="https://en.wikipedia.org/wiki/Spaced_repetition">نظام التكرار المتباعد (SRS)</a> الأكثر استخدامًا في العالم والأداة التي يتكامل معها Fushi افتراضيًا. أعطه أي شيء تريد تذكّره وسيجدول المراجعات لتحفظ أكثر ما يمكن بأقل وقت دراسة.</span></span> الموصى بها:</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="مجموعة مفردات Anki للمبتدئين: نحو 1500 كلمة يابانية عالية التردد مختارة بحسب التكرار، لكل بطاقة جملة مثال وصوت ونبر. من صنع مجتمع The Moe Way؛ وكايشي تعني «البداية»."><b>Kaishi 1.5k</b></span>: <a href="https://github.com/kaihouguide/kaishi-arabic">النسخة العربية</a> (<a href="https://github.com/donkuri/Kaishi">المستودع الأصلي</a>).</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="مرجع قواعد JLPT مبني على سلسلة قواعد aiueo.cc (صف Onigiri لنطق اليابانية): 757 نقطة قواعدية من N5 إلى N1، لكل منها جمل أمثلة سجّلتها معلّمة يابانية."><b>قواعد Onigiri</b></span>: مجموعة Anki متاحة بالصينية فقط، فاستخدم بدلًا منها <a href="https://aiueo.cc/pages_v2/en/grammars.php">دليل قواعد Onigiri</a> على aiueo.cc (بالإنجليزية)؛ حتى <span class="term" tabindex="0" data-tip="مستويات JLPT (اختبار الكفاءة في اللغة اليابانية): N5 الأسهل وN1 الأصعب. قواعد المبتدئين تغطي تقريبًا N5–N4، وN3 عتبة المستوى المتوسط؛ وهيكل قواعدي حول N4 يكفي لبدء الانغماس.">N3/N4</span> تكفي.</li>
</ul>
<p data-i18n="imm.s2.p">وأنت لا تزال تحفظ المفردات، ابدأ الخطوة التالية: الانغماس.</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">س: حفظ <span class="term" tabindex="0" data-tip="المقطعيات اليابانية: الهيراغانا والكاتاكانا، 46 صوتًا أساسيًا لكل منهما، مرتبة في خمسة صفوف للحركات وعشرة أعمدة للصوامت — ومن هنا الاسم الياباني «الأصوات الخمسون». هي أساس الكتابة اليابانية والعقبة الوحيدة التي لا بد من تجاوزها قبل المفردات.">الكانا</span> ممل جدًا — هل هذا طبيعي؟</h4>
<p data-i18n="imm.faq.a1a">طبيعي تمامًا، ويشعر الجميع تقريبًا بالشيء نفسه.</p>
<p data-i18n="imm.faq.a1b">لا تنتظر حتى «تحب حفظ الكانا» لتبدأ — فقد لا يأتي ذلك اليوم أبدًا. ما تحتاجه هو أن تتحرك أولًا، ولو خمس دقائق يوميًا، ولو لم تحفظ اليوم سوى あ.</p>
<p data-i18n="imm.faq.a1c">التقدم نفسه يولّد الدافع. يوم تلتقط فجأة كلمة في أنمي، سيصبح كل التراكم الممل قبلها مستحقًا. لكن ذلك اليوم لا يأتي من تلقاء نفسه — عليك أولًا تجاوز مرحلة «لا أفهم شيئًا».</p>
<h4 data-i18n="imm.faq.q2">س: كم من الوقت أخصّص لـ <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>، المسمّى على اسم 暗記 (أنكي، «الحفظ»)، هو <a href="https://en.wikipedia.org/wiki/Spaced_repetition">نظام التكرار المتباعد (SRS)</a> الأكثر استخدامًا في العالم والأداة التي يتكامل معها Fushi افتراضيًا. أعطه أي شيء تريد تذكّره وسيجدول المراجعات لتحفظ أكثر ما يمكن بأقل وقت دراسة.</span></span> يوميًا؟</h4>
<p data-i18n="imm.faq.a2a">أقل مما تظن.</p>
<p data-i18n="imm.faq.a2b">من 15 إلى 30 دقيقة يوميًا، بحسب ما تحتمل، بجدّية، أنفع بكثير من جلسة ساعتين بين حين وآخر. والسبب بسيط: العادة أهم من الشدة. خطة تلتزم بها كل يوم تفوق بكثير «خطة مكثفة» تتبعها على فترات.</p>
<p data-i18n="imm.faq.a2c">في يوم سيئ، اكتفِ بخمس دقائق. الخمس دقائق تُحسب. <b>لا بأس أن تسير العربة ببطء؛ المهم ألا تسقط منها.</b> فحين تنقطع العادة، يكلّف الاستئناف إرادة أكبر بكثير مما تتوقع.</p>
<h4 data-i18n="imm.faq.q3">س: ذاكرتي ضعيفة وأنسى دائمًا — ماذا أفعل؟</h4>
<p data-i18n="imm.faq.a3a">النسيان طبيعي. ومحاربته هي بالضبط سبب وجود <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>، المسمّى على اسم 暗記 (أنكي، «الحفظ»)، هو <a href="https://en.wikipedia.org/wiki/Spaced_repetition">نظام التكرار المتباعد (SRS)</a> الأكثر استخدامًا في العالم والأداة التي يتكامل معها Fushi افتراضيًا. أعطه أي شيء تريد تذكّره وسيجدول المراجعات لتحفظ أكثر ما يمكن بأقل وقت دراسة.</span></span>.</p>
<p data-i18n="imm.faq.a3b">لا اليوم ولا غدًا — لكن يومًا ما سترسخ.</p>
</aside>

<h3 data-i18n="imm.s3.h">الخطوة 3: الانغماس مع <span class="term" tabindex="0" data-tip="تحويل كلمة جديدة صادفتها أثناء الانغماس إلى بطاقة Anki مع الجملة والصوت ولقطة الشاشة التي جاءت منها. في Fushi لمسة للبحث ولمسة أخرى لصنع البطاقة.">اصنع بطاقات</span> وحفظ المفردات</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">تعلّم اللغة يعني تقبّل حقيقة واحدة: لن تفهم كل شيء.</p>
<p data-i18n="imm.s3.c2">كثيرون يشعرون أنهم «غير مستعدين» ويريدون الدراسة أكثر قبل الانغماس — وهذا لا ينجح أبدًا. مهما استعددت، لن تفهم كل شيء أول مرة تلمس فيها مادة حقيقية. بدل تجنّب الانزعاج، اقفز: كلما تحمّلت الغموض أكثر، التقط دماغك اللغة أسرع.</p>
<p data-i18n="imm.s3.c3"><b>إذا كان الغموض لا يُحتمل</b></p>
<ul data-i18n="imm.s3.c4"><li><b>اقرأ الحرق أولًا</b>: اقرأ ملخص الأحداث قبل المشاهدة، أو أعد مشاهدة ما تعرفه أصلًا بلغتك.</li><li><b>ترجمة بلغتك الأم كحل أخير</b>: لا يُنصح بها عادةً (تتعلم منها القليل)، لكن إن ضعت تمامًا، فاصمد فترة بدونها ولا تُظهرها إلا عند الضرورة — أو شاهد مرة بدونها ومرة معها.</li></ul>
</aside>
<p data-i18n="imm.s3.p1">ابدأ بمواد خفيفة — أنمي الحياة اليومية أسهل من أنمي القتال، والروايات الخفيفة أسهل من الأدب.</p>
<p data-i18n="imm.s3.p2">شاهد ما تحبه، وابحث عن الكلمات المجهولة بلمسة، و<span class="term" tabindex="0" data-tip="تحويل كلمة جديدة صادفتها أثناء الانغماس إلى بطاقة Anki مع الجملة والصوت ولقطة الشاشة التي جاءت منها. في Fushi لمسة للبحث ولمسة أخرى لصنع البطاقة.">اصنع بطاقات</span> حين يستحق الأمر.</p>
<p data-i18n="imm.s3.p3">حفظ المفردات هو الأسلوب النشط الوحيد خارج الانغماس الذي يهم: في البداية يبني رصيدك من المفردات بسرعة.</p>

</div>
