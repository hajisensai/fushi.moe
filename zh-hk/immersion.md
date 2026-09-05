---
title: "沉浸學習"
description: "沉浸式學外語的完整起步路線：為什麼選沉浸、什麼是沉浸，以及從五十音、Anki 卡組到邊看番邊製卡的第 0～3 步。"
head:
  - - meta
    - name: "fushi-title"
      content: "{imm.title} | Fushi"
  - - meta
    - name: "fushi-description"
      content: "{imm.meta.desc}"
  - - link
    - rel: "canonical"
      href: "https://fushi.moe/zh-hk/immersion"
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:site_name"
      content: "Fushi"
  - - meta
    - property: "og:title"
      content: "沉浸學習"
  - - meta
    - property: "og:description"
      content: "沉浸式學外語的完整起步路線：為什麼選沉浸、什麼是沉浸，以及從五十音、Anki 卡組到邊看番邊製卡的第 0～3 步。"
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/zh-hk/immersion"
  - - meta
    - property: "og:locale"
      content: "zh_HK"
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

<h1 data-i18n="imm.title">沉浸學習</h1>
<p class="note" data-i18n="imm.note">本文以日語為例，其他語言同理。</p>

<h2 data-i18n="imm.fit.h">我適合沉浸嗎？</h2>
<p data-i18n="imm.fit.p1">看教材、做題——我猜沒幾個人真心喜歡這些事。對一件不喜歡的事，動力從哪來？能堅持多久？</p>
<p data-i18n="imm.fit.p2"><b>但沉浸不一樣。它只需要滿足一個條件：你對相關的內容——動畫、綜藝、電影、小說、遊戲、漫畫，任何你喜歡的內容——有真實的興趣。</b></p>
<p data-i18n="imm.fit.p3">不需要任何基礎，不需要天賦，甚至不需要「下決心」。你只需要願意去接觸這些內容。</p>
<p data-i18n="imm.fit.p4">選擇你喜歡的內容，這比什麼都重要。</p>

<h2 data-i18n="imm.what.h">什麼是沉浸？</h2>
<p data-i18n="imm.what.p1">去聽、去讀母語者為母語者製作的內容：動畫、小說、遊戲、綜藝這些面向母語者的東西。你現在看的每一部番、玩的每一款遊戲，都算沉浸。</p>
<p data-i18n="imm.what.p2">與「先學會再用」相反，沉浸是在使用的過程中自然學會。</p>
<p data-i18n="imm.what.p3">沉浸是語言習得的必經之路。背單詞、學語法、做題能給你入門基礎，但語言太浩瀚了，遠不是教材能覆蓋的。你之所以能毫不費力地讀完這段話，不是因為背過什麼語法規則，而是你的大腦在過去十幾年的海量中文輸入中自然積累了無數語言直覺。學外語也一樣，這種直覺只能從大量真實輸入中來。</p>
<p data-i18n="imm.what.p4">沉浸在最開始確實會有一段什麼都不懂的階段，但因為你選的是自己喜歡的內容，即使不完全聽懂也能看下去。不管進步是快是慢、懂多還是懂少，你對這些內容的興趣才是最重要的。</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">沉浸學習的原理是什麼？</summary>
<p data-i18n="imm.theory.p1">語言不是「學」會的，是「習得」的。你小時候沒背過母語的語法表，卻能把話說得比任何語法書都自然，靠的只有一件事：海量的、聽得懂大半的輸入。</p>
<blockquote><p data-i18n="imm.theory.quote">「我們習得語言的原理別無二致：通過理解信息。」</p><cite data-i18n="imm.theory.cite">—— 史蒂芬·克拉申</cite></blockquote>
<p data-i18n="imm.theory.p2">掌握單詞的含義，只是習得這一單詞的第一步。若要習得運用這一單詞的「直覺」，你需要在大量不同的場景下多次遇見這個單詞並理解它。</p>
<p data-i18n="imm.theory.p3">在沉浸學習的過程中會接觸各種各樣的場景。每次你看到一個單詞並成功理解，你的直覺就得到了鍛鍊。最終，你建立起了很清晰的直覺，便能自然而然地知道單詞如何使用了。</p>
</details>

<h2 data-i18n="imm.start.h">開始</h2>

<h3 data-i18n="imm.s0.h">第 0 步：使用 Fushi</h3>
<blockquote><p data-i18n="imm.s0.side">新手引導裡的推薦包已經把常用詞典和音頻庫打包好了，不需要自己到處找資源。</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/zh-hk/download">下載 Fushi</a>，按新手引導完成配置：詞典、單詞音頻資料庫、下載並連接 <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最廣泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔重複記憶系統（SRS）</a>，也是 Fushi 預設聯動的工具。你可以把想記憶的任何材料交給 Anki，它能讓你用最少的學習時間達到最好的記憶效果。</span></span>。配好之後，看動畫、讀小說時點一下就能查詞，再點一下就是一張帶原句、音頻和配圖的 <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最廣泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔重複記憶系統（SRS）</a>，也是 Fushi 預設聯動的工具。你可以把想記憶的任何材料交給 Anki，它能讓你用最少的學習時間達到最好的記憶效果。</span></span> 卡。</p>

<h3 data-i18n="imm.s1.h">第 1 步：背<span class="term" tabindex="0" data-tip="日語的假名表：平假名、片假名各 46 個基本音，按あ・い・う・え・お五段十行排列，所以叫五十音。它是日語書寫的基礎，也是背單詞前唯一必須先過的一關。">五十音</span></h3>
<ul>
<li data-i18n="imm.s1.li1">推薦用<a href="https://l-m-sherlock.github.io/">葉佬</a>開發的打字練習網站 <a href="https://kanabr.vercel.app/zh-hans">kanabr</a>（<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>）：循序漸進解鎖假名，還能順便把打字也練了。</li>
<li data-i18n="imm.s1.li2">或者你喜歡的任何工具。</li>
</ul>
<p data-i18n="imm.s1.p">先記完平假名即可，不用記得特別牢，後續使用會反覆強化記憶。</p>

<h3 data-i18n="imm.s2.h">第 2 步：背基礎單詞和語法</h3>
<blockquote><p data-i18n="imm.s2.side">每天新卡 5–20 張就夠，可以把<span class="term" tabindex="0" data-tip="Anki 裡 FSRS 演算法的「期望記憶保留率」，預設 90%。調低到 70–80% 會明顯減少每天的複習量，代價是忘得多一點——前期有沉浸兜底，這筆賬划算。">保留率</span>改成 70–80%。<span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最廣泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔重複記憶系統（SRS）</a>，也是 Fushi 預設聯動的工具。你可以把想記憶的任何材料交給 Anki，它能讓你用最少的學習時間達到最好的記憶效果。</span></span> 的複習量會在兩三週後堆起來，新卡開太多是絕大多數人放棄 <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最廣泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔重複記憶系統（SRS）</a>，也是 Fushi 預設聯動的工具。你可以把想記憶的任何材料交給 Anki，它能讓你用最少的學習時間達到最好的記憶效果。</span></span> 的原因。</p></blockquote>
<p data-i18n="imm.s2.lead">這裡推薦使用 <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最廣泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔重複記憶系統（SRS）</a>，也是 Fushi 預設聯動的工具。你可以把想記憶的任何材料交給 Anki，它能讓你用最少的學習時間達到最好的記憶效果。</span></span> 卡組：</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="面向零基礎的 Anki 單詞卡組：按詞頻挑出約 1500 個日語高頻詞，每張卡帶例句、發音和音調，由 The Moe Way 社群製作。Kaishi 就是「開始」。"><b>Kaishi 1.5k</b></span>：<a href="https://github.com/maimemo/kaishi-zh-cn/">中文版</a>（<a href="https://github.com/donkuri/Kaishi">原版倉庫</a>）。</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="基於 aiueo.cc（飯糰君日語發音教室）語法專題製作的 Anki 卡組，收 N5～N1 共 757 條語法，每條配日語老師真人錄製的例句音頻。"><b>おにぎり文法</b></span>：<a href="https://ankiweb.net/shared/info/1567144169">中文版</a>，背到 <span class="term" tabindex="0" data-tip="JLPT（日本語能力測試）的等級，N5 最易、N1 最難。初級語法大致對應 N5～N4，N3 是中級的門檻；沉浸起步有 N4 上下的語法框架就夠。">N3/N4</span> 即可。</li>
</ul>
<p data-i18n="imm.s2.p">在你背單詞的時候，同時開始下一步：沉浸。</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">Q：<span class="term" tabindex="0" data-tip="日語的假名表：平假名、片假名各 46 個基本音，按あ・い・う・え・お五段十行排列，所以叫五十音。它是日語書寫的基礎，也是背單詞前唯一必須先過的一關。">五十音</span>好枯燥，這是正常的嗎？</h4>
<p data-i18n="imm.faq.a1a">正常，而且幾乎所有人都這麼覺得。</p>
<p data-i18n="imm.faq.a1b">你不需要等到「喜歡背五十音」才開始——事實上那一天可能永遠不會來。你需要的是先動起來，哪怕只是每天五分鐘，哪怕今天只記住了「あ」。</p>
<p data-i18n="imm.faq.a1c">進步本身會帶來動力。當你有一天突然在動畫裡聽懂了一個詞，那種感覺會讓之前所有枯燥的積累變得值得。但那一天不會憑空到來，它需要你先熬過這段「什麼都不懂」的時期。</p>
<h4 data-i18n="imm.faq.q2">Q：我應該每天花多少時間在 <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最廣泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔重複記憶系統（SRS）</a>，也是 Fushi 預設聯動的工具。你可以把想記憶的任何材料交給 Anki，它能讓你用最少的學習時間達到最好的記憶效果。</span></span> 上？</h4>
<p data-i18n="imm.faq.a2a">比你想的少。</p>
<p data-i18n="imm.faq.a2b">每天 15 到 30 分鐘，取決於你對此事的接受程度，認真做，比偶爾一次兩小時有效得多。原因很簡單：習慣比強度更重要。一個你能堅持每天做的計劃，遠勝過一個你三天打魚兩天曬網的「高強度計劃」。</p>
<p data-i18n="imm.faq.a2c">如果你今天狀態很差，那就只做 5 分鐘。5 分鐘也算。<b>馬車走得慢沒關係，重要的是不要掉下車。</b>一旦習慣斷掉，重新開始的心理成本會比你想像的大得多。</p>
<h4 data-i18n="imm.faq.q3">Q：我記性很差，老是忘，怎麼辦？</h4>
<p data-i18n="imm.faq.a3a">遺忘是正常的，<span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最廣泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔重複記憶系統（SRS）</a>，也是 Fushi 預設聯動的工具。你可以把想記憶的任何材料交給 Anki，它能讓你用最少的學習時間達到最好的記憶效果。</span></span> 存在的意義就是對抗遺忘。</p>
<p data-i18n="imm.faq.a3b">今天記不住，明天記不住，總有一天會記住它。</p>
</aside>

<h3 data-i18n="imm.s3.h">第 3 步：沉浸同時<span class="term" tabindex="0" data-tip="把沉浸裡遇到的生詞連同它所在的原句、音頻和畫面做成一張 Anki 卡片。Fushi 裡點一下查詞、再點一下就做好了。">製卡</span> + 背單詞</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">學語言需要接受一個事實：你無法理解所有內容。</p>
<p data-i18n="imm.s3.c2">很多人覺得自己沒「準備好」，想先學夠了再去沉浸——這永遠不會有效果。無論你提前準備了多少，第一次接觸真實材料時，你都不會全懂。與其迴避這種不適，不如一頭扎進去：你越能容忍模糊，大腦掌握語言就越快。</p>
<p data-i18n="imm.s3.c3"><b>如果實在受不了模糊</b></p>
<ul data-i18n="imm.s3.c4"><li><b>劇透先行</b>：看之前先讀劇情梗概，或者重看你已經看過母語版的內容。</li><li><b>母語字幕兜底</b>：通常不推薦母語字幕（學不到什麼），但如果完全迷失，可以先不開字幕撐一段，撐不住再顯示一下母語字幕，或者無字幕看一遍、開字幕再看一遍。</li></ul>
</aside>
<p data-i18n="imm.s3.p1">剛開始建議從輕鬆的內容入手——日常番比戰鬥番好懂，輕小說比純文學好讀。</p>
<p data-i18n="imm.s3.p2">看你喜歡的內容，遇到不認識的單詞點一下查詞，並在你覺得有必要時<span class="term" tabindex="0" data-tip="把沉浸裡遇到的生詞連同它所在的原句、音頻和畫面做成一張 Anki 卡片。Fushi 裡點一下查詞、再點一下就做好了。">製卡</span>。</p>
<p data-i18n="imm.s3.p3">背單詞是重要的主動非沉浸學習手段，前期能快速積累詞彙量。</p>

</div>
