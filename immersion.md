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
.immersion p:has(.term) { position: relative; }
.immersion .term { cursor: help; outline: none; border-bottom: 1px dotted var(--ink-2); }
.immersion .term-tip {
  display: none; position: absolute; left: 0; bottom: calc(100% + 8px); z-index: 5;
  max-width: 420px; padding: 12px 14px; border-radius: 12px;
  background: var(--ink); color: var(--band-ink);
  font-size: 14px; line-height: 1.5; font-weight: 400;
}
.immersion .term:hover .term-tip,
.immersion .term:focus .term-tip,
.immersion .term:focus-within .term-tip { display: block; }
</style>

<div class="immersion">

# 沉浸学习

<p class="note">全文以日语为例，换成别的语言思路一样。</p>

## 我适合沉浸吗？

看教材、做题——我猜没几个人真心喜欢这些事。对一件不喜欢的事，动力从哪来？能坚持多久？

**但沉浸不一样。它只需要满足一个条件：你对相关的内容——动画、综艺、电影、小说、游戏、漫画，任何你喜欢的内容——有真实的兴趣。**

不需要任何基础，不需要天赋，甚至不需要「下决心」。你只需要愿意去接触这些内容。

选择你喜欢的内容，这比什么都重要。

## 什么是沉浸？

去听、去读母语者给母语者做的内容——不是教材，不是简化读物，而是动画、小说、游戏、综艺这些真实的东西。你现在看的每一部番、玩的每一款游戏，都算沉浸。

和「先学会再用」相反，沉浸是在用的过程中自然学会。

<details class="theory">
<summary>沉浸学习的原理是什么？</summary>

语言不是「学」会的，是「习得」的。你小时候没背过母语的语法表，却能把话说得比任何语法书都自然，靠的只有一件事：海量的、听得懂大半的输入。

> 「我们习得语言的原理别无二致：通过理解信息。」
> <cite>—— 斯蒂芬·克拉申</cite>

掌握单词的含义，只是习得这一单词的第一步。若要习得运用这一单词的「直觉」，你需要在大量不同的场景下多次遇见这个单词并理解它。

在沉浸学习的过程中会接触各种各样的场景。每次你看到一个单词并成功理解，你的直觉就得到了锤炼。最终，你建立起了很清晰的直觉，便能自然而然地知道单词如何使用了。

</details>

## 开始

### 第 0 步：使用 Fushi

> 新手引导里的推荐包已经把常用词典和音频库打包好了，不需要自己到处找资源。

<a href="/download">下载 Fushi</a>，根据新手引导完成配置：词典、单词音频数据库、下载并连接 <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>，取名自暗記（あんき），是世界上使用最广泛的<a href="https://en.wikipedia.org/wiki/Spaced_repetition">间隔重复记忆系统（SRS）</a>，也是 Fushi 默认联动的工具。你可以把想记忆的任何材料交给 Anki，它能让你用最少的学习时间达到最好的记忆效果。</span></span>。配好之后，看动画、读小说时点一下就能查词，再点一下就是一张带原句、音频和配图的 Anki 卡。

### 第 1 步：背五十音

- 推荐用[叶佬](https://l-m-sherlock.github.io/)开发的打字练习网站 [kanabr](https://kanabr.vercel.app/zh-hans)（[GitHub](https://github.com/L-M-Sherlock/kanabr)）：循序渐进解锁假名，还能顺便把打字也练了。
- 或者你喜欢的任何工具。

先记完平假名即可，不用记特别牢，后续使用会反复强化记忆。

### 第 2 步：背基础单词和语法

> 每天新卡 5–20 张就够，可以把保留率改成 70–80%。Anki 的复习量会在两三周后堆起来，新卡开太多是绝大多数人放弃 Anki 的原因。

- **Kaishi 1.5k**：[中文版](https://github.com/maimemo/kaishi-zh-cn/)（[原版仓库](https://github.com/donkuri/Kaishi)）。另有俄、印尼、越南、乌克兰、巴西葡、西、法、阿拉伯、德语版，见原版仓库的 [Translation of the deck](https://github.com/donkuri/Kaishi#translation-of-the-deck)。
- **おにぎり文法**：[中文版](https://ankiweb.net/shared/info/1567144169)，背到 N3/N4 即可。

在你背单词的时候，同时开始下一步：沉浸。

<aside class="faq">

#### Q：五十音好枯燥，这是正常的吗？

正常，而且几乎所有人都这么觉得。

你不需要等到「喜欢背五十音」才开始——事实上那一天可能永远不会来。你需要的是先动起来，哪怕只是每天五分钟，哪怕今天只记住了「あ」。

进步本身会带来动力。当你有一天突然在动画里听懂了一个词，那种感觉会让之前所有枯燥的积累变得值得。但那一天不会凭空到来，它需要你先熬过这段「什么都不懂」的时期。

#### Q：我应该每天花多少时间在 Anki 上？

比你想的少。

每天 15 到 30 分钟，取决于你对此事的接受程度，认真做，比偶尔一次两小时有效得多。原因很简单：习惯比强度更重要。一个你能坚持每天做的计划，远胜过一个你三天打鱼两天晒网的「高强度计划」。

如果你今天状态很差，那就只做 5 分钟。5 分钟也算。<b>马车走得慢没关系，重要的是不要掉下车。</b>一旦习惯断掉，重新开始的心理成本会比你想象的大得多。

#### Q：我记性很差，老是忘，怎么办？

遗忘是正常的，Anki 存在的意义就是对抗遗忘。

今天记不住，明天记不住，总有一天会记住它。

</aside>

### 第 3 步：沉浸同时制卡 + 背单词

<aside class="callout">

学语言需要接受一个事实：你无法理解所有内容。

很多人觉得自己没「准备好」，想先学够了再去沉浸——这永远不会有效果。无论你提前准备了多少，第一次接触真实材料时，你都不会全懂。与其回避这种不适，不如一头扎进去：你越能容忍模糊，大脑掌握语言就越快。

**如果实在受不了模糊**

- **剧透先行**：看之前先读剧情梗概，或者重看你已经看过母语版的内容。
- **母语字幕兜底**：通常不推荐母语字幕（学不到什么），但如果完全迷失，可以先不开字幕撑一段，撑不住再显示一下母语字幕，或者无字幕看一遍、开字幕再看一遍。

</aside>

刚开始建议从轻松的内容入手——日常番比战斗番好懂，轻小说比纯文学好读。难度会随着你的积累自然往上走。

看你喜欢的内容，遇到不认识的单词点击查词，并在你觉得有必要时制卡。

背单词是重要的主动非沉浸学习手段，前期能快速积累词汇量。

</div>
