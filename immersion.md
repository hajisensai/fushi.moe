---
title: 沉浸学习
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

<h1 data-i18n="imm.title">沉浸学习</h1>
<p class="note" data-i18n="imm.note">本文以日语为例，其他语言同理。</p>

<h2 data-i18n="imm.fit.h">我适合沉浸吗？</h2>
<p data-i18n="imm.fit.p1">看教材、做题——我猜没几个人真心喜欢这些事。对一件不喜欢的事，动力从哪来？能坚持多久？</p>
<p data-i18n="imm.fit.p2"><b>但沉浸不一样。它只需要满足一个条件：你对相关的内容——动画、综艺、电影、小说、游戏、漫画，任何你喜欢的内容——有真实的兴趣。</b></p>
<p data-i18n="imm.fit.p3">不需要任何基础，不需要天赋，甚至不需要「下决心」。你只需要愿意去接触这些内容。</p>
<p data-i18n="imm.fit.p4">选择你喜欢的内容，这比什么都重要。</p>

<h2 data-i18n="imm.what.h">什么是沉浸？</h2>
<p data-i18n="imm.what.p1">去听、去读母语者给母语者做的内容：动画、小说、游戏、综艺这些真实的东西。你现在看的每一部番、玩的每一款游戏，都算沉浸。</p>
<p data-i18n="imm.what.p2">和「先学会再用」相反，沉浸是在用的过程中自然学会。</p>
<p data-i18n="imm.what.p3">沉浸是语言习得的必经之路。背单词、学语法、做题能给你入门基础，但语言太浩瀚了，远不是教材能覆盖的。你之所以能毫不费力地读完这段话，不是因为背过什么语法规则，而是你的大脑在过去十几年的海量中文输入中自然积累了无数语言直觉。学外语也一样，这种直觉只能从大量真实输入中来。</p>
<p data-i18n="imm.what.p4">沉浸在最开始会很痛苦，你几乎什么都听不懂、看不懂。这很正常，每个人都是这样过来的。但一旦过了那个阶段，你会开始不知不觉地听懂整句话、不查词典也能读下去。那种「突然就懂了」的瞬间，会让之前所有的挣扎都值得。而且因为你选的是自己喜欢的内容，这个过程本身就是娱乐。</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">沉浸学习的原理是什么？</summary>
<p data-i18n="imm.theory.p1">语言不是「学」会的，是「习得」的。你小时候没背过母语的语法表，却能把话说得比任何语法书都自然，靠的只有一件事：海量的、听得懂大半的输入。</p>
<blockquote><p data-i18n="imm.theory.quote">「我们习得语言的原理别无二致：通过理解信息。」</p><cite data-i18n="imm.theory.cite">—— 斯蒂芬·克拉申</cite></blockquote>
<p data-i18n="imm.theory.p2">掌握单词的含义，只是习得这一单词的第一步。若要习得运用这一单词的「直觉」，你需要在大量不同的场景下多次遇见这个单词并理解它。</p>
<p data-i18n="imm.theory.p3">在沉浸学习的过程中会接触各种各样的场景。每次你看到一个单词并成功理解，你的直觉就得到了锤炼。最终，你建立起了很清晰的直觉，便能自然而然地知道单词如何使用了。</p>
</details>

<h2 data-i18n="imm.start.h">开始</h2>

<h3 data-i18n="imm.s0.h">第 0 步：使用 Fushi</h3>
<blockquote><p data-i18n="imm.s0.side">新手引导里的推荐包已经把常用词典和音频库打包好了，不需要自己到处找资源。</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/download">下载 Fushi</a>，根据新手引导完成配置：词典、单词音频数据库、下载并连接 <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最广泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">间隔重复记忆系统（SRS）</a>，也是 Fushi 默认联动的工具。你可以把想记忆的任何材料交给 Anki，它能让你用最少的学习时间达到最好的记忆效果。</span></span>。配好之后，看动画、读小说时点一下就能查词，再点一下就是一张带原句、音频和配图的 <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最广泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">间隔重复记忆系统（SRS）</a>，也是 Fushi 默认联动的工具。你可以把想记忆的任何材料交给 Anki，它能让你用最少的学习时间达到最好的记忆效果。</span></span> 卡。</p>

<h3 data-i18n="imm.s1.h">第 1 步：背<span class="term" tabindex="0" data-tip="日语的假名表：平假名、片假名各 46 个基本音，按あ・い・う・え・お五段十行排列，所以叫五十音。它是日语书写的基础，也是背单词前唯一必须先过的一关。">五十音</span></h3>
<ul>
<li data-i18n="imm.s1.li1">推荐用<a href="https://l-m-sherlock.github.io/">叶佬</a>开发的打字练习网站 <a href="https://kanabr.vercel.app/zh-hans">kanabr</a>（<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>）：循序渐进解锁假名，还能顺便把打字也练了。</li>
<li data-i18n="imm.s1.li2">或者你喜欢的任何工具。</li>
</ul>
<p data-i18n="imm.s1.p">先记完平假名即可，不用记特别牢，后续使用会反复强化记忆。</p>

<h3 data-i18n="imm.s2.h">第 2 步：背基础单词和语法</h3>
<blockquote><p data-i18n="imm.s2.side">每天新卡 5–20 张就够，可以把<span class="term" tabindex="0" data-tip="Anki 里 FSRS 算法的「期望记忆保留率」，默认 90%。调低到 70–80% 会明显减少每天的复习量，代价是忘得多一点——前期有沉浸兜底，这笔账划算。">保留率</span>改成 70–80%。<span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最广泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">间隔重复记忆系统（SRS）</a>，也是 Fushi 默认联动的工具。你可以把想记忆的任何材料交给 Anki，它能让你用最少的学习时间达到最好的记忆效果。</span></span> 的复习量会在两三周后堆起来，新卡开太多是绝大多数人放弃 <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最广泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">间隔重复记忆系统（SRS）</a>，也是 Fushi 默认联动的工具。你可以把想记忆的任何材料交给 Anki，它能让你用最少的学习时间达到最好的记忆效果。</span></span> 的原因。</p></blockquote>
<p data-i18n="imm.s2.lead">这里推荐使用 <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最广泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">间隔重复记忆系统（SRS）</a>，也是 Fushi 默认联动的工具。你可以把想记忆的任何材料交给 Anki，它能让你用最少的学习时间达到最好的记忆效果。</span></span> 卡组：</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="面向零基础的 Anki 单词卡组：按词频挑出约 1500 个日语高频词，每张卡带例句、发音和音调，由 The Moe Way 社区制作。Kaishi 就是「開始」。"><b>Kaishi 1.5k</b></span>：<a href="https://github.com/maimemo/kaishi-zh-cn/">中文版</a>（<a href="https://github.com/donkuri/Kaishi">原版仓库</a>）。</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="基于 aiueo.cc（饭团君日语发音教室）语法专题制作的 Anki 卡组，收 N5～N1 共 757 条语法，每条配日语老师真人录制的例句音频。"><b>おにぎり文法</b></span>：<a href="https://ankiweb.net/shared/info/1567144169">中文版</a>，背到 <span class="term" tabindex="0" data-tip="JLPT（日本语能力测试）的等级，N5 最易、N1 最难。初级语法大致对应 N5～N4，N3 是中级的门槛；沉浸起步有 N4 上下的语法框架就够。">N3/N4</span> 即可。</li>
</ul>
<p data-i18n="imm.s2.p">在你背单词的时候，同时开始下一步：沉浸。</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">Q：<span class="term" tabindex="0" data-tip="日语的假名表：平假名、片假名各 46 个基本音，按あ・い・う・え・お五段十行排列，所以叫五十音。它是日语书写的基础，也是背单词前唯一必须先过的一关。">五十音</span>好枯燥，这是正常的吗？</h4>
<p data-i18n="imm.faq.a1a">正常，而且几乎所有人都这么觉得。</p>
<p data-i18n="imm.faq.a1b">你不需要等到「喜欢背五十音」才开始——事实上那一天可能永远不会来。你需要的是先动起来，哪怕只是每天五分钟，哪怕今天只记住了「あ」。</p>
<p data-i18n="imm.faq.a1c">进步本身会带来动力。当你有一天突然在动画里听懂了一个词，那种感觉会让之前所有枯燥的积累变得值得。但那一天不会凭空到来，它需要你先熬过这段「什么都不懂」的时期。</p>
<h4 data-i18n="imm.faq.q2">Q：我应该每天花多少时间在 <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最广泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">间隔重复记忆系统（SRS）</a>，也是 Fushi 默认联动的工具。你可以把想记忆的任何材料交给 Anki，它能让你用最少的学习时间达到最好的记忆效果。</span></span> 上？</h4>
<p data-i18n="imm.faq.a2a">比你想的少。</p>
<p data-i18n="imm.faq.a2b">每天 15 到 30 分钟，取决于你对此事的接受程度，认真做，比偶尔一次两小时有效得多。原因很简单：习惯比强度更重要。一个你能坚持每天做的计划，远胜过一个你三天打鱼两天晒网的「高强度计划」。</p>
<p data-i18n="imm.faq.a2c">如果你今天状态很差，那就只做 5 分钟。5 分钟也算。<b>马车走得慢没关系，重要的是不要掉下车。</b>一旦习惯断掉，重新开始的心理成本会比你想象的大得多。</p>
<h4 data-i18n="imm.faq.q3">Q：我记性很差，老是忘，怎么办？</h4>
<p data-i18n="imm.faq.a3a">遗忘是正常的，<span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最广泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">间隔重复记忆系统（SRS）</a>，也是 Fushi 默认联动的工具。你可以把想记忆的任何材料交给 Anki，它能让你用最少的学习时间达到最好的记忆效果。</span></span> 存在的意义就是对抗遗忘。</p>
<p data-i18n="imm.faq.a3b">今天记不住，明天记不住，总有一天会记住它。</p>
</aside>

<h3 data-i18n="imm.s3.h">第 3 步：沉浸同时<span class="term" tabindex="0" data-tip="把沉浸里遇到的生词连同它所在的原句、音频和画面做成一张 Anki 卡片。Fushi 里点一下查词、再点一下就做好了。">制卡</span> + 背单词</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">学语言需要接受一个事实：你无法理解所有内容。</p>
<p data-i18n="imm.s3.c2">很多人觉得自己没「准备好」，想先学够了再去沉浸——这永远不会有效果。无论你提前准备了多少，第一次接触真实材料时，你都不会全懂。与其回避这种不适，不如一头扎进去：你越能容忍模糊，大脑掌握语言就越快。</p>
<p data-i18n="imm.s3.c3"><b>如果实在受不了模糊</b></p>
<ul data-i18n="imm.s3.c4"><li><b>剧透先行</b>：看之前先读剧情梗概，或者重看你已经看过母语版的内容。</li><li><b>母语字幕兜底</b>：通常不推荐母语字幕（学不到什么），但如果完全迷失，可以先不开字幕撑一段，撑不住再显示一下母语字幕，或者无字幕看一遍、开字幕再看一遍。</li></ul>
</aside>
<p data-i18n="imm.s3.p1">刚开始建议从轻松的内容入手——日常番比战斗番好懂，轻小说比纯文学好读。</p>
<p data-i18n="imm.s3.p2">看你喜欢的内容，遇到不认识的单词点击查词，并在你觉得有必要时<span class="term" tabindex="0" data-tip="把沉浸里遇到的生词连同它所在的原句、音频和画面做成一张 Anki 卡片。Fushi 里点一下查词、再点一下就做好了。">制卡</span>。</p>
<p data-i18n="imm.s3.p3">背单词是重要的主动非沉浸学习手段，前期能快速积累词汇量。</p>

</div>
