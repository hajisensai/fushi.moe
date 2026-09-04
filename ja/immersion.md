---
title: "イマージョン学習"
description: "イマージョンで外国語を身につけるための入門ガイド：なぜイマージョンか、イマージョンとは何か、かなと Anki デッキから見ながらカードを作るまでのステップ 0〜3。"
head:
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:title"
      content: "イマージョン学習"
  - - meta
    - property: "og:description"
      content: "イマージョンで外国語を身につけるための入門ガイド：なぜイマージョンか、イマージョンとは何か、かなと Anki デッキから見ながらカードを作るまでのステップ 0〜3。"
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/ja/immersion"
  - - meta
    - property: "og:locale"
      content: "ja_JP"
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

<h1 data-i18n="imm.title">イマージョン学習</h1>
<p class="note" data-i18n="imm.note">この記事は日本語を例にしていますが、他の言語でも考え方は同じです。</p>

<h2 data-i18n="imm.fit.h">イマージョンは自分に向いている？</h2>
<p data-i18n="imm.fit.p1">教科書や問題集——それを心から楽しめる人はほとんどいないでしょう。好きでもないことに、やる気はどこから湧き、どれだけ続くでしょうか。</p>
<p data-i18n="imm.fit.p2"><b>イマージョンは違います。必要な条件はひとつだけ。アニメ、バラエティ、映画、小説、ゲーム、漫画など、好きなコンテンツに本当の興味があることです。</b></p>
<p data-i18n="imm.fit.p3">基礎知識も才能も、「決意」さえ要りません。そのコンテンツに触れる気持ちがあれば十分です。</p>
<p data-i18n="imm.fit.p4">好きなコンテンツを選ぶこと。これが何より大切です。</p>

<h2 data-i18n="imm.what.h">イマージョンとは？</h2>
<p data-i18n="imm.what.p1">母語話者が母語話者のために作ったもの——アニメ、小説、ゲーム、バラエティといった母語話者向けのもの——を聞き、読むことです。今見ているアニメも、遊んでいるゲームも、すべてイマージョンです。</p>
<p data-i18n="imm.what.p2">「先に学んでから使う」のではなく、イマージョンは使いながら自然に身につける方法です。</p>
<p data-i18n="imm.what.p3">イマージョンは言語習得で必ず通る道です。単語暗記や文法学習、問題演習は入門の土台をくれますが、言語はあまりに広大で、教科書がカバーできる範囲をはるかに超えています。あなたがこの文章を苦もなく読めるのは、文法規則を暗記したからではなく、十数年にわたる母語の大量のインプットの中で、脳が無数の言語直感を自然に蓄えてきたからです。外国語も同じで、その直感は大量の本物のインプットからしか生まれません。</p>
<p data-i18n="imm.what.p4">イマージョンは最初はつらいものです。聞いても読んでも、ほとんど何もわからない。それは普通のことで、誰もがそこを通ってきました。でもその段階を越えると、いつの間にか文がまるごと聞き取れ、辞書を引かずに読み進められるようになります。「突然わかった」という瞬間が、それまでのすべての苦労を報いてくれます。しかも選んだのは自分の好きなコンテンツですから、この過程そのものが娯楽です。</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">イマージョン学習の原理は？</summary>
<p data-i18n="imm.theory.p1">言語は「学ぶ」ものではなく「習得する」ものです。子どもの頃、母語の文法表を暗記したことはないのに、どんな文法書より自然に話せる。頼りにしたのはただひとつ、大半は理解できる大量のインプットです。</p>
<blockquote><p data-i18n="imm.theory.quote">「私たちが言語を習得する方法はただひとつ、メッセージを理解することによってである。」</p><cite data-i18n="imm.theory.cite">—— スティーヴン・クラッシェン</cite></blockquote>
<p data-i18n="imm.theory.p2">単語の意味を知ることは、その単語を習得する第一歩にすぎません。使い方の「直感」を身につけるには、さまざまな場面でその単語に何度も出会い、理解する必要があります。</p>
<p data-i18n="imm.theory.p3">イマージョンではまさにそうした多様な場面に触れます。単語を見て理解するたびに直感が磨かれ、やがてはっきりした直感が育ち、単語の使い方が自然にわかるようになります。</p>
</details>

<h2 data-i18n="imm.start.h">始める</h2>

<h3 data-i18n="imm.s0.h">ステップ 0：Fushi を使う</h3>
<blockquote><p data-i18n="imm.s0.side">初期設定ガイドのおすすめパックには、よく使う辞書と音声ライブラリがまとめて入っています。自分で探し回る必要はありません。</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/download">Fushi をダウンロード</a>し、初期設定ガイドに従って辞書と単語音声データベースを設定し、<span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> は「暗記」に由来する、世界で最も広く使われている<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔反復システム（SRS）</a>で、Fushi が標準で連携するツールです。覚えたい素材を何でも任せれば、最小の学習時間で最良の記憶効果が得られるように復習を組んでくれます。</span></span> をインストールして接続します。設定後は、アニメや小説の中でワンタップで辞書引き、もうワンタップで例文・音声・画像付きの <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> は「暗記」に由来する、世界で最も広く使われている<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔反復システム（SRS）</a>で、Fushi が標準で連携するツールです。覚えたい素材を何でも任せれば、最小の学習時間で最良の記憶効果が得られるように復習を組んでくれます。</span></span> カードができます。</p>

<h3 data-i18n="imm.s1.h">ステップ 1：<span class="term" tabindex="0" data-tip="ひらがな・カタカナ各 46 の基本音を、あ・い・う・え・おの五段と十行に並べた表。日本語の表記の基礎で、単語学習の前に必ず通る唯一の関門です。">かな</span>を覚える</h3>
<ul>
<li data-i18n="imm.s1.li1">おすすめは <a href="https://l-m-sherlock.github.io/">葉さん（L-M-Sherlock）</a> 作のタイピング練習サイト <a href="https://kanabr.vercel.app/">kanabr</a>（<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>）。かなを段階的に解放しながら、タイピングも一緒に練習できます。</li>
<li data-i18n="imm.s1.li2">あるいは、好きなツールで。</li>
</ul>
<p data-i18n="imm.s1.p">まずはひらがなを一通り覚えれば十分。完璧でなくても、その後の学習で何度も定着します。</p>

<h3 data-i18n="imm.s2.h">ステップ 2：基礎単語と文法</h3>
<blockquote><p data-i18n="imm.s2.side">新規カードは 1 日 5〜20 枚で十分。<span class="term" tabindex="0" data-tip="Anki の FSRS アルゴリズムの「目標記憶保持率」。既定は 90%。70〜80% に下げると毎日の復習量が目に見えて減り、その分少し忘れやすくなります。序盤はイマージョンが支えてくれるので、割の良い取引です。">目標記憶保持率</span>は 70〜80% に下げても構いません。<span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> は「暗記」に由来する、世界で最も広く使われている<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔反復システム（SRS）</a>で、Fushi が標準で連携するツールです。覚えたい素材を何でも任せれば、最小の学習時間で最良の記憶効果が得られるように復習を組んでくれます。</span></span> の復習は 2〜3 週間で積み上がるので、新規カードを増やしすぎることが、多くの人が <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> は「暗記」に由来する、世界で最も広く使われている<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔反復システム（SRS）</a>で、Fushi が標準で連携するツールです。覚えたい素材を何でも任せれば、最小の学習時間で最良の記憶効果が得られるように復習を組んでくれます。</span></span> をやめる原因です。</p></blockquote>
<p data-i18n="imm.s2.lead">おすすめの <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> は「暗記」に由来する、世界で最も広く使われている<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔反復システム（SRS）</a>で、Fushi が標準で連携するツールです。覚えたい素材を何でも任せれば、最小の学習時間で最良の記憶効果が得られるように復習を組んでくれます。</span></span> デッキ：</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="初心者向けの Anki 単語デッキ。頻度順に選んだ約 1,500 の高頻度語に、例文・音声・アクセントが付いています。The Moe Way コミュニティ制作。"><b>Kaishi 1.5k</b></span>：<a href="https://github.com/donkuri/Kaishi">オリジナル版</a>（同じリポジトリに各言語版へのリンクがあります）。</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="aiueo.cc（おにぎり君の日本語発音教室）の文法特集を元にした JLPT 文法リファレンス。N5〜N1 の 757 項目に、日本語教師が録音した例文音声付き。"><b>おにぎり文法</b></span>：Anki デッキは中国語版のみなので、代わりに aiueo.cc の<a href="https://aiueo.cc/pages_v2/ja/grammars.php">おにぎり君の文法一覧</a>を。<span class="term" tabindex="0" data-tip="JLPT（日本語能力試験）のレベル。N5 が最も易しく N1 が最も難しい。初級文法はおおよそ N5〜N4、N3 が中級の入口。イマージョンを始めるには N4 前後の文法の枠組みがあれば十分です。">N3/N4</span> まで押さえれば十分です。</li>
</ul>
<p data-i18n="imm.s2.p">単語を覚えながら、次のステップ——イマージョンを同時に始めます。</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">Q：<span class="term" tabindex="0" data-tip="ひらがな・カタカナ各 46 の基本音を、あ・い・う・え・おの五段と十行に並べた表。日本語の表記の基礎で、単語学習の前に必ず通る唯一の関門です。">かな</span>の暗記が退屈です。普通ですか？</h4>
<p data-i18n="imm.faq.a1a">普通です。ほとんどの人がそう感じます。</p>
<p data-i18n="imm.faq.a1b">「かなの暗記が好きになる」のを待つ必要はありません——その日は永遠に来ないかもしれません。必要なのは、まず動き出すこと。1 日 5 分でも、今日は「あ」しか覚えられなくても構いません。</p>
<p data-i18n="imm.faq.a1c">進歩そのものがやる気を生みます。ある日アニメの中の単語が突然聞き取れたとき、それまでの退屈な積み重ねがすべて報われます。ただ、その日は勝手には来ません。「何もわからない」時期を先に乗り越える必要があります。</p>
<h4 data-i18n="imm.faq.q2">Q：<span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> は「暗記」に由来する、世界で最も広く使われている<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔反復システム（SRS）</a>で、Fushi が標準で連携するツールです。覚えたい素材を何でも任せれば、最小の学習時間で最良の記憶効果が得られるように復習を組んでくれます。</span></span> には毎日どれくらい時間をかけるべき？</h4>
<p data-i18n="imm.faq.a2a">思っているより少なくて構いません。</p>
<p data-i18n="imm.faq.a2b">無理のない範囲で 1 日 15〜30 分を真面目にやるほうが、たまに 2 時間やるよりずっと効果的です。理由は単純で、強度より習慣のほうが大事だから。毎日続けられる計画は、三日坊主の「ハードな計画」に勝ります。</p>
<p data-i18n="imm.faq.a2c">調子が悪い日は 5 分だけでいい。5 分でも成果です。<b>馬車が遅くても構わない。大事なのは落ちないこと。</b>習慣が途切れると、再開の心理的コストは想像以上に大きくなります。</p>
<h4 data-i18n="imm.faq.q3">Q：記憶力が悪くてすぐ忘れます。どうすれば？</h4>
<p data-i18n="imm.faq.a3a">忘れるのは普通のことです。<span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a> は「暗記」に由来する、世界で最も広く使われている<a href="https://en.wikipedia.org/wiki/Spaced_repetition">間隔反復システム（SRS）</a>で、Fushi が標準で連携するツールです。覚えたい素材を何でも任せれば、最小の学習時間で最良の記憶効果が得られるように復習を組んでくれます。</span></span> はまさに忘却と戦うためにあります。</p>
<p data-i18n="imm.faq.a3b">今日覚えられなくても、明日覚えられなくても、いつか必ず覚えます。</p>
</aside>

<h3 data-i18n="imm.s3.h">ステップ 3：イマージョンしながら<span class="term" tabindex="0" data-tip="イマージョン中に出会った新しい単語を、その文・音声・画面ごと Anki カードにすること。Fushi ならワンタップで調べ、もうワンタップで作成できます。">カード作成</span>・単語学習</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">言語学習では、ひとつの事実を受け入れる必要があります。すべてを理解することはできない、ということです。</p>
<p data-i18n="imm.s3.c2">「準備ができていない」と感じて、もっと学んでからイマージョンをしようとする人は多いですが、それはうまくいきません。どれだけ準備しても、初めて本物の素材に触れたとき全部はわかりません。不快さを避けるより飛び込んでしまうこと。曖昧さに耐えられるほど、脳は速く言語を習得します。</p>
<p data-i18n="imm.s3.c3"><b>どうしても曖昧さに耐えられないなら</b></p>
<ul data-i18n="imm.s3.c4"><li><b>先にネタバレ</b>：見る前にあらすじを読む、あるいは母語で見たことのある作品を見直す。</li><li><b>最後の手段は母語字幕</b>：普段はおすすめしません（あまり学べません）が、完全に迷子になったら、まず字幕なしで粘り、どうしても無理なときだけ母語字幕を表示する。または字幕なしで 1 回、字幕ありでもう 1 回見る。</li></ul>
</aside>
<p data-i18n="imm.s3.p1">最初は気楽な内容から。日常系はバトル系より、ライトノベルは純文学よりわかりやすいです。</p>
<p data-i18n="imm.s3.p2">好きなコンテンツを見て、知らない単語はタップして調べ、必要だと思ったら<span class="term" tabindex="0" data-tip="イマージョン中に出会った新しい単語を、その文・音声・画面ごと Anki カードにすること。Fushi ならワンタップで調べ、もうワンタップで作成できます。">カード作成</span>。</p>
<p data-i18n="imm.s3.p3">単語学習は、イマージョン以外で唯一重要な能動的学習です。序盤の語彙を素早く積み上げてくれます。</p>

</div>
