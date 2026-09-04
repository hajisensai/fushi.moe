---
title: "การเรียนแบบแช่ตัว"
description: "คู่มือฉบับสมบูรณ์สำหรับเริ่มเรียนภาษาแบบแช่ตัว: ทำไมต้องแช่ตัว การแช่ตัวคืออะไร และขั้นที่ 0–3 ตั้งแต่คานะ ชุดการ์ด Anki ไปจนถึงการทำการ์ดระหว่างดู"
head:
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:title"
      content: "การเรียนแบบแช่ตัว"
  - - meta
    - property: "og:description"
      content: "คู่มือฉบับสมบูรณ์สำหรับเริ่มเรียนภาษาแบบแช่ตัว: ทำไมต้องแช่ตัว การแช่ตัวคืออะไร และขั้นที่ 0–3 ตั้งแต่คานะ ชุดการ์ด Anki ไปจนถึงการทำการ์ดระหว่างดู"
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/th/immersion"
  - - meta
    - property: "og:locale"
      content: "th_TH"
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

<h1 data-i18n="imm.title">การเรียนแบบแช่ตัว</h1>
<p class="note" data-i18n="imm.note">บทความนี้ยกภาษาญี่ปุ่นเป็นตัวอย่าง แนวคิดเดียวกันใช้ได้กับทุกภาษา</p>

<h2 data-i18n="imm.fit.h">การแช่ตัวเหมาะกับฉันไหม?</h2>
<p data-i18n="imm.fit.p1">ตำราและแบบฝึกหัด — ผมสงสัยว่าจะมีสักกี่คนที่ชอบมันจริง ๆ กับสิ่งที่ไม่ชอบ แรงจูงใจจะมาจากไหน แล้วจะอยู่ได้นานแค่ไหน?</p>
<p data-i18n="imm.fit.p2"><b>แต่การแช่ตัวต่างออกไป มันมีเงื่อนไขเดียว: คุณสนใจเนื้อหานั้นจริง ๆ — อนิเมะ รายการวาไรตี้ ภาพยนตร์ นิยาย เกม มังงะ อะไรก็ได้ที่คุณชอบ</b></p>
<p data-i18n="imm.fit.p3">ไม่ต้องมีพื้นฐาน ไม่ต้องมีพรสวรรค์ ไม่ต้องแม้แต่ «ตั้งใจแน่วแน่» แค่คุณอยากเข้าไปสัมผัสเนื้อหาเหล่านั้นก็พอ</p>
<p data-i18n="imm.fit.p4">เลือกเนื้อหาที่คุณชอบ ไม่มีอะไรสำคัญกว่านี้</p>

<h2 data-i18n="imm.what.h">การแช่ตัวคืออะไร?</h2>
<p data-i18n="imm.what.p1">ฟังและอ่านสิ่งที่เจ้าของภาษาทำให้เจ้าของภาษา: อนิเมะ นิยาย เกม รายการวาไรตี้ — สิ่งที่ทำมาเพื่อผู้ชมเจ้าของภาษา อนิเมะทุกเรื่องที่คุณดู เกมทุกเกมที่คุณเล่น นับเป็นการแช่ตัวแล้ว</p>
<p data-i18n="imm.what.p2">ตรงข้ามกับ «เรียนก่อนแล้วค่อยใช้» การแช่ตัวคือการเรียนรู้อย่างเป็นธรรมชาติไปพร้อมกับการใช้</p>
<p data-i18n="imm.what.p3">การแช่ตัวคือทางที่ทุกคนต้องเดินผ่านในที่สุด การท่องศัพท์ เรียนไวยากรณ์ ทำแบบฝึกหัด ให้พื้นฐานเริ่มต้นได้ แต่ภาษานั้นกว้างใหญ่เกินกว่าตำราเล่มไหนจะครอบคลุม ที่คุณอ่านย่อหน้านี้ได้อย่างไม่ต้องออกแรง ไม่ใช่เพราะท่องกฎไวยากรณ์ แต่เพราะภาษาแม่ปริมาณมหาศาลตลอดสิบกว่าปีได้สั่งสมสัญชาตญาณทางภาษานับไม่ถ้วนไว้ในสมองของคุณ ภาษาต่างประเทศก็เช่นกัน: สัญชาตญาณแบบนั้นมาจากอินพุตจริงปริมาณมากเท่านั้น</p>
<p data-i18n="imm.what.p4">การแช่ตัวช่วงแรกมีระยะที่แทบไม่เข้าใจอะไรเลยจริง ๆ แต่เพราะคุณเลือกเนื้อหาที่ชอบ แม้ไม่เข้าใจทั้งหมดก็ดูต่อได้ จะเร็วหรือช้า เข้าใจมากหรือน้อย สิ่งสำคัญที่สุดคือความสนใจของคุณที่มีต่อเนื้อหานั้น</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">หลักการของการเรียนแบบแช่ตัวคืออะไร?</summary>
<p data-i18n="imm.theory.p1">ภาษาไม่ได้ «เรียน» จนได้ แต่ «ซึมซับ» จนได้ ตอนเด็กคุณไม่เคยท่องตารางไวยากรณ์ภาษาแม่ แต่พูดได้เป็นธรรมชาติกว่าหนังสือไวยากรณ์เล่มไหน ๆ ด้วยสิ่งเดียว: อินพุตปริมาณมหาศาลที่คุณเข้าใจเป็นส่วนใหญ่</p>
<blockquote><p data-i18n="imm.theory.quote">«เราซึมซับภาษาด้วยวิธีเดียวเท่านั้น: การเข้าใจสาร»</p><cite data-i18n="imm.theory.cite">— สตีเฟน คราเชน</cite></blockquote>
<p data-i18n="imm.theory.p2">รู้ความหมายของคำเป็นเพียงก้าวแรกของการซึมซับคำนั้น ถ้าอยากได้ «สัญชาตญาณ» ในการใช้ คุณต้องเจอและเข้าใจคำนั้นหลายครั้งในหลายบริบทที่ต่างกัน</p>
<p data-i18n="imm.theory.p3">การแช่ตัวพาคุณไปเจอความหลากหลายแบบนั้นพอดี ทุกครั้งที่เห็นคำแล้วเข้าใจ สัญชาตญาณของคุณจะถูกลับให้คมขึ้น จนในที่สุดมันชัดพอที่คุณจะรู้เองว่าคำนั้นใช้อย่างไร</p>
</details>

<h2 data-i18n="imm.start.h">เริ่มต้น</h2>

<h3 data-i18n="imm.s0.h">ขั้นที่ 0: ใช้ Fushi</h3>
<blockquote><p data-i18n="imm.s0.side">แพ็กแนะนำในคู่มือเริ่มต้นรวมพจนานุกรมและคลังเสียงที่ใช้บ่อยไว้ให้แล้ว ไม่ต้องไปหาทรัพยากรเอง</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/download">ดาวน์โหลด Fushi</a> แล้วทำตามคู่มือเริ่มต้น: พจนานุกรม ฐานข้อมูลเสียงคำศัพท์ จากนั้นติดตั้งและเชื่อมต่อ <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> ตั้งชื่อตาม 暗記 (อังกิ «การท่องจำ») เป็น<a href="https://en.wikipedia.org/wiki/Spaced_repetition">ระบบทบทวนแบบเว้นระยะ (SRS)</a>ที่ใช้กันแพร่หลายที่สุดในโลก และเป็นเครื่องมือที่ Fushi เชื่อมต่อด้วยโดยค่าเริ่มต้น ส่งอะไรก็ตามที่อยากจำให้มัน มันจะจัดตารางทบทวนให้คุณจำได้ดีที่สุดด้วยเวลาเรียนน้อยที่สุด</span></span> หลังจากนั้น ขณะดูอนิเมะหรืออ่านนิยาย แตะครั้งเดียวเพื่อค้นคำ แตะอีกครั้งได้การ์ด <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> ตั้งชื่อตาม 暗記 (อังกิ «การท่องจำ») เป็น<a href="https://en.wikipedia.org/wiki/Spaced_repetition">ระบบทบทวนแบบเว้นระยะ (SRS)</a>ที่ใช้กันแพร่หลายที่สุดในโลก และเป็นเครื่องมือที่ Fushi เชื่อมต่อด้วยโดยค่าเริ่มต้น ส่งอะไรก็ตามที่อยากจำให้มัน มันจะจัดตารางทบทวนให้คุณจำได้ดีที่สุดด้วยเวลาเรียนน้อยที่สุด</span></span> พร้อมประโยค เสียง และภาพ</p>

<h3 data-i18n="imm.s1.h">ขั้นที่ 1: จำ<span class="term" tabindex="0" data-tip="ตารางอักษรพยางค์ญี่ปุ่น: ฮิรางานะและคาตากานะ แต่ละแบบมีเสียงพื้นฐาน 46 เสียง เรียงเป็นห้าแถวสระสิบคอลัมน์พยัญชนะ จึงเรียกในภาษาญี่ปุ่นว่า «ห้าสิบเสียง» เป็นรากฐานของการเขียนภาษาญี่ปุ่นและเป็นด่านเดียวที่ต้องผ่านก่อนท่องศัพท์">คานะ</span></h3>
<ul>
<li data-i18n="imm.s1.li1">แนะนำ <a href="https://kanabr.vercel.app/">kanabr</a> (<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>) เว็บฝึกพิมพ์ที่ <a href="https://l-m-sherlock.github.io/">L-M-Sherlock</a> พัฒนา ปลดล็อกคานะทีละขั้น และได้ฝึกพิมพ์ภาษาญี่ปุ่นไปด้วย</li>
<li data-i18n="imm.s1.li2">หรือเครื่องมือใดก็ได้ที่คุณชอบ</li>
</ul>
<p data-i18n="imm.s1.p">ไล่ฮิรางานะให้ครบหนึ่งรอบก็พอ ไม่ต้องจำแม่น การท่องศัพท์จะช่วยตอกย้ำซ้ำ ๆ เอง</p>

<h3 data-i18n="imm.s2.h">ขั้นที่ 2: คำศัพท์และไวยากรณ์พื้นฐาน</h3>
<blockquote><p data-i18n="imm.s2.side">การ์ดใหม่วันละ 5–20 ใบก็พอ และปรับ<span class="term" tabindex="0" data-tip="ค่า «อัตราจำที่ต้องการ» ของอัลกอริทึม FSRS ใน Anki ค่าเริ่มต้น 90% ปรับลงเป็น 70–80% จะลดปริมาณทบทวนต่อวันอย่างเห็นได้ชัด แลกกับลืมมากขึ้นนิดหน่อย — ช่วงแรกมีการแช่ตัวช่วยรองรับ ถือว่าคุ้ม">อัตราจำที่ต้องการ</span>ลงเป็น 70–80% ได้ ปริมาณทบทวนของ <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> ตั้งชื่อตาม 暗記 (อังกิ «การท่องจำ») เป็น<a href="https://en.wikipedia.org/wiki/Spaced_repetition">ระบบทบทวนแบบเว้นระยะ (SRS)</a>ที่ใช้กันแพร่หลายที่สุดในโลก และเป็นเครื่องมือที่ Fushi เชื่อมต่อด้วยโดยค่าเริ่มต้น ส่งอะไรก็ตามที่อยากจำให้มัน มันจะจัดตารางทบทวนให้คุณจำได้ดีที่สุดด้วยเวลาเรียนน้อยที่สุด</span></span> จะพอกขึ้นหลังสองสามสัปดาห์ การเปิดการ์ดใหม่มากเกินไปคือสาเหตุที่คนส่วนใหญ่เลิกใช้ <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> ตั้งชื่อตาม 暗記 (อังกิ «การท่องจำ») เป็น<a href="https://en.wikipedia.org/wiki/Spaced_repetition">ระบบทบทวนแบบเว้นระยะ (SRS)</a>ที่ใช้กันแพร่หลายที่สุดในโลก และเป็นเครื่องมือที่ Fushi เชื่อมต่อด้วยโดยค่าเริ่มต้น ส่งอะไรก็ตามที่อยากจำให้มัน มันจะจัดตารางทบทวนให้คุณจำได้ดีที่สุดด้วยเวลาเรียนน้อยที่สุด</span></span></p></blockquote>
<p data-i18n="imm.s2.lead">ชุดการ์ด <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> ตั้งชื่อตาม 暗記 (อังกิ «การท่องจำ») เป็น<a href="https://en.wikipedia.org/wiki/Spaced_repetition">ระบบทบทวนแบบเว้นระยะ (SRS)</a>ที่ใช้กันแพร่หลายที่สุดในโลก และเป็นเครื่องมือที่ Fushi เชื่อมต่อด้วยโดยค่าเริ่มต้น ส่งอะไรก็ตามที่อยากจำให้มัน มันจะจัดตารางทบทวนให้คุณจำได้ดีที่สุดด้วยเวลาเรียนน้อยที่สุด</span></span> ที่แนะนำ:</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="ชุดการ์ดคำศัพท์ Anki สำหรับผู้เริ่มต้น: คำญี่ปุ่นความถี่สูงราว 1,500 คำที่คัดตามความถี่ แต่ละการ์ดมีประโยคตัวอย่าง เสียง และเสียงสูงต่ำ ทำโดยชุมชน The Moe Way; kaishi แปลว่า «เริ่มต้น»"><b>Kaishi 1.5k</b></span>: <a href="https://github.com/donkuri/Kaishi">ชุดการ์ดต้นฉบับ</a> (ในคลังเดียวกันมีลิงก์ฉบับแปลหลายภาษา)</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="แหล่งอ้างอิงไวยากรณ์ JLPT ที่อิงชุดไวยากรณ์ของ aiueo.cc (ห้องเรียนการออกเสียงภาษาญี่ปุ่นของ Onigiri): ไวยากรณ์ 757 ข้อตั้งแต่ N5 ถึง N1 แต่ละข้อมีประโยคตัวอย่างที่ครูชาวญี่ปุ่นบันทึกเสียงจริง"><b>ไวยากรณ์ Onigiri</b></span>: ชุดการ์ด Anki มีแต่ฉบับภาษาจีน จึงให้ใช้ <a href="https://aiueo.cc/pages_v2/en/grammars.php">คู่มือไวยากรณ์ Onigiri</a> บน aiueo.cc (ภาษาอังกฤษ) แทน ถึง <span class="term" tabindex="0" data-tip="ระดับของ JLPT (การสอบวัดระดับภาษาญี่ปุ่น): N5 ง่ายสุด N1 ยากสุด ไวยากรณ์ขั้นต้นครอบคลุมราว N5–N4 ส่วน N3 คือธรณีประตูของขั้นกลาง; จะเริ่มแช่ตัวได้ มีโครงไวยากรณ์ราว N4 ก็พอ">N3/N4</span> ก็พอ</li>
</ul>
<p data-i18n="imm.s2.p">ระหว่างที่ยังท่องศัพท์ ให้เริ่มขั้นต่อไปควบคู่กัน: การแช่ตัว</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">ถาม: จำ<span class="term" tabindex="0" data-tip="ตารางอักษรพยางค์ญี่ปุ่น: ฮิรางานะและคาตากานะ แต่ละแบบมีเสียงพื้นฐาน 46 เสียง เรียงเป็นห้าแถวสระสิบคอลัมน์พยัญชนะ จึงเรียกในภาษาญี่ปุ่นว่า «ห้าสิบเสียง» เป็นรากฐานของการเขียนภาษาญี่ปุ่นและเป็นด่านเดียวที่ต้องผ่านก่อนท่องศัพท์">คานะ</span>น่าเบื่อมาก ปกติไหม?</h4>
<p data-i18n="imm.faq.a1a">ปกติ และแทบทุกคนก็รู้สึกแบบนั้น</p>
<p data-i18n="imm.faq.a1b">คุณไม่ต้องรอจนถึงวันที่ «ชอบท่องคานะ» ถึงจะเริ่ม — วันนั้นอาจไม่มาถึงเลย สิ่งที่คุณต้องทำคือลงมือก่อน แม้จะแค่วันละห้านาที แม้วันนี้จะจำได้แค่ «あ»</p>
<p data-i18n="imm.faq.a1c">ความก้าวหน้าเองจะสร้างแรงจูงใจ วันที่คุณฟังคำในอนิเมะออกขึ้นมาเฉย ๆ ความน่าเบื่อที่สั่งสมมาทั้งหมดจะคุ้มค่าทันที แต่วันนั้นไม่ได้มาเอง คุณต้องผ่านช่วง «ไม่เข้าใจอะไรเลย» ให้ได้ก่อน</p>
<h4 data-i18n="imm.faq.q2">ถาม: ควรใช้เวลากับ <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> ตั้งชื่อตาม 暗記 (อังกิ «การท่องจำ») เป็น<a href="https://en.wikipedia.org/wiki/Spaced_repetition">ระบบทบทวนแบบเว้นระยะ (SRS)</a>ที่ใช้กันแพร่หลายที่สุดในโลก และเป็นเครื่องมือที่ Fushi เชื่อมต่อด้วยโดยค่าเริ่มต้น ส่งอะไรก็ตามที่อยากจำให้มัน มันจะจัดตารางทบทวนให้คุณจำได้ดีที่สุดด้วยเวลาเรียนน้อยที่สุด</span></span> วันละเท่าไร?</h4>
<p data-i18n="imm.faq.a2a">น้อยกว่าที่คิด</p>
<p data-i18n="imm.faq.a2b">วันละ 15 ถึง 30 นาที ตามที่รับไหว ทำอย่างจริงจัง ได้ผลกว่านาน ๆ ทีทำสองชั่วโมงรวดมาก เหตุผลง่าย ๆ: นิสัยสำคัญกว่าความเข้มข้น แผนที่คุณทำได้ทุกวันดีกว่า «แผนหนักหน่วง» ที่ทำ ๆ หยุด ๆ มากนัก</p>
<p data-i18n="imm.faq.a2c">วันไหนสภาพแย่ก็ทำแค่ 5 นาที 5 นาทีก็นับ <b>รถม้าไปช้าไม่เป็นไร สำคัญคืออย่าตกจากรถ</b> พอนิสัยขาดตอน ต้นทุนทางใจในการเริ่มใหม่จะสูงกว่าที่คิดมาก</p>
<h4 data-i18n="imm.faq.q3">ถาม: ความจำไม่ดี ลืมตลอด ทำอย่างไร?</h4>
<p data-i18n="imm.faq.a3a">การลืมเป็นเรื่องปกติ <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> ตั้งชื่อตาม 暗記 (อังกิ «การท่องจำ») เป็น<a href="https://en.wikipedia.org/wiki/Spaced_repetition">ระบบทบทวนแบบเว้นระยะ (SRS)</a>ที่ใช้กันแพร่หลายที่สุดในโลก และเป็นเครื่องมือที่ Fushi เชื่อมต่อด้วยโดยค่าเริ่มต้น ส่งอะไรก็ตามที่อยากจำให้มัน มันจะจัดตารางทบทวนให้คุณจำได้ดีที่สุดด้วยเวลาเรียนน้อยที่สุด</span></span> มีอยู่ก็เพื่อสู้กับการลืมนี่แหละ</p>
<p data-i18n="imm.faq.a3b">วันนี้จำไม่ได้ พรุ่งนี้จำไม่ได้ สักวันก็จะจำได้</p>
</aside>

<h3 data-i18n="imm.s3.h">ขั้นที่ 3: แช่ตัว พร้อม<span class="term" tabindex="0" data-tip="นำคำใหม่ที่เจอระหว่างแช่ตัว มาทำเป็นการ์ด Anki พร้อมประโยคเดิม เสียง และภาพที่คำนั้นปรากฏ ใน Fushi แตะครั้งเดียวเพื่อค้น แตะอีกครั้งก็เสร็จ">ทำการ์ด</span>และท่องศัพท์</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">การเรียนภาษาต้องยอมรับความจริงข้อหนึ่ง: คุณไม่มีทางเข้าใจทั้งหมด</p>
<p data-i18n="imm.s3.c2">หลายคนรู้สึกว่าตัวเอง «ยังไม่พร้อม» อยากเรียนให้พอก่อนแล้วค่อยแช่ตัว — วิธีนี้ไม่มีวันได้ผล ไม่ว่าจะเตรียมตัวมากแค่ไหน ครั้งแรกที่แตะสื่อจริงคุณก็จะไม่เข้าใจทั้งหมด แทนที่จะหลบความอึดอัด ให้กระโดดลงไปเลย: ยิ่งทนความคลุมเครือได้มาก สมองยิ่งเรียนรู้ภาษาได้เร็ว</p>
<p data-i18n="imm.s3.c3"><b>ถ้าทนความคลุมเครือไม่ไหวจริง ๆ</b></p>
<ul data-i18n="imm.s3.c4"><li><b>สปอยล์ก่อน</b>: อ่านเรื่องย่อก่อนดู หรือดูซ้ำเรื่องที่เคยดูฉบับภาษาแม่มาแล้ว</li><li><b>ซับภาษาแม่เป็นทางเลือกสุดท้าย</b>: ปกติไม่แนะนำ (แทบไม่ได้เรียนรู้อะไร) แต่ถ้าหลงทางสนิท ให้ลองดูแบบไม่มีซับสักพักก่อน ไม่ไหวค่อยเปิด — หรือดูรอบหนึ่งไม่มีซับ อีกรอบเปิดซับ</li></ul>
</aside>
<p data-i18n="imm.s3.p1">ช่วงแรกแนะนำเริ่มจากเนื้อหาเบา ๆ — อนิเมะแนวชีวิตประจำวันเข้าใจง่ายกว่าแนวต่อสู้ ไลต์โนเวลอ่านง่ายกว่าวรรณกรรม</p>
<p data-i18n="imm.s3.p2">ดูสิ่งที่ชอบ เจอคำที่ไม่รู้ก็แตะค้น และ<span class="term" tabindex="0" data-tip="นำคำใหม่ที่เจอระหว่างแช่ตัว มาทำเป็นการ์ด Anki พร้อมประโยคเดิม เสียง และภาพที่คำนั้นปรากฏ ใน Fushi แตะครั้งเดียวเพื่อค้น แตะอีกครั้งก็เสร็จ">ทำการ์ด</span>เมื่อเห็นว่าคุ้ม</p>
<p data-i18n="imm.s3.p3">การท่องศัพท์คือวิธีเรียนเชิงรุกนอกเหนือจากการแช่ตัวเพียงอย่างเดียวที่สำคัญ ช่วงแรกมันช่วยสะสมคลังศัพท์ได้เร็ว</p>

</div>
