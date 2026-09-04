/*
 * 沉浸页多语言：同一份内容对象既生成 immersion.md 的正文标记（zh-CN 默认文本 + data-i18n 键），
 * 也写进 17 个字典。占位符在组装时换成各语言的链接 / 术语气泡标记。
 * 用法：node tool/build_immersion_i18n.mjs（默认仓库根；也可传目标目录）
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const W = (process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..')) + '/';
const CR = String.fromCharCode(13);

const KAISHI = {
  'zh-CN': 'https://github.com/maimemo/kaishi-zh-cn/', 'zh-HK': 'https://github.com/maimemo/kaishi-zh-cn/',
  ru: 'https://github.com/NeonGooRoo/KaishiRu', id: 'https://ankiweb.net/shared/info/1512066033', vi: 'https://github.com/duy103zxc/kaishi-vi/releases',
  'pt-BR': 'https://github.com/nonsolvent/Kaishi-pt-BR', es: 'https://github.com/Dogi5/Kaishi-ESP', fr: 'https://github.com/khmskhmskhms/kaishi-FR',
  ar: 'https://github.com/kaihouguide/kaishi-arabic', de: 'https://github.com/Yukitoki97900/Kaishi-1.5K-German-Version',
};
const KAISHI_ORIG = 'https://github.com/donkuri/Kaishi';
const AIUEO = { en: 'en', ja: 'ja', ko: 'ko', vi: 'vi', 'zh-CN': 'ch', 'zh-HK': 'cht' };
const grammarUrl = (c) => 'https://aiueo.cc/pages_v2/' + (AIUEO[c] || 'en') + '/grammars.php';
const kanabrUrl = (c) => 'https://kanabr.vercel.app/' + (c.startsWith('zh') ? 'zh-hans' : '');

/* ---------- 内容：zh-CN 是源语言 ---------- */
const ZH = {
  title: '沉浸学习',
  note: '本文以日语为例，其他语言同理。',
  fit_h: '我适合沉浸吗？',
  fit_p1: '看教材、做题——我猜没几个人真心喜欢这些事。对一件不喜欢的事，动力从哪来？能坚持多久？',
  fit_p2: '<b>但沉浸不一样。它只需要满足一个条件：你对相关的内容——动画、综艺、电影、小说、游戏、漫画，任何你喜欢的内容——有真实的兴趣。</b>',
  fit_p3: '不需要任何基础，不需要天赋，甚至不需要「下决心」。你只需要愿意去接触这些内容。',
  fit_p4: '选择你喜欢的内容，这比什么都重要。',
  what_h: '什么是沉浸？',
  what_p1: '去听、去读母语者给母语者做的内容：动画、小说、游戏、综艺这些面向母语者的东西。你现在看的每一部番、玩的每一款游戏，都算沉浸。',
  what_p2: '和「先学会再用」相反，沉浸是在用的过程中自然学会。',
  what_p3: '沉浸是语言习得的必经之路。背单词、学语法、做题能给你入门基础，但语言太浩瀚了，远不是教材能覆盖的。你之所以能毫不费力地读完这段话，不是因为背过什么语法规则，而是你的大脑在过去十几年的海量中文输入中自然积累了无数语言直觉。学外语也一样，这种直觉只能从大量真实输入中来。',
  what_p4: '沉浸在最开始会很痛苦，你几乎什么都听不懂、看不懂。这很正常，每个人都是这样过来的。但一旦过了那个阶段，你会开始不知不觉地听懂整句话、不查词典也能读下去。那种「突然就懂了」的瞬间，会让之前所有的挣扎都值得。而且因为你选的是自己喜欢的内容，这个过程本身就是娱乐。',
  theory_summary: '沉浸学习的原理是什么？',
  theory_p1: '语言不是「学」会的，是「习得」的。你小时候没背过母语的语法表，却能把话说得比任何语法书都自然，靠的只有一件事：海量的、听得懂大半的输入。',
  theory_quote: '「我们习得语言的原理别无二致：通过理解信息。」',
  theory_cite: '—— 斯蒂芬·克拉申',
  theory_p2: '掌握单词的含义，只是习得这一单词的第一步。若要习得运用这一单词的「直觉」，你需要在大量不同的场景下多次遇见这个单词并理解它。',
  theory_p3: '在沉浸学习的过程中会接触各种各样的场景。每次你看到一个单词并成功理解，你的直觉就得到了锤炼。最终，你建立起了很清晰的直觉，便能自然而然地知道单词如何使用了。',
  start_h: '开始',
  s0_h: '第 0 步：使用 Fushi',
  s0_side: '新手引导里的推荐包已经把常用词典和音频库打包好了，不需要自己到处找资源。',
  s0_p: '{dl}，根据新手引导完成配置：词典、单词音频数据库、下载并连接 {anki}。配好之后，看动画、读小说时点一下就能查词，再点一下就是一张带原句、音频和配图的 {anki} 卡。',
  s1_h: '第 1 步：背{kana}',
  s1_li1: '推荐用{yeh}开发的打字练习网站 {kanabr}（{gh}）：循序渐进解锁假名，还能顺便把打字也练了。',
  s1_li2: '或者你喜欢的任何工具。',
  s1_p: '先记完平假名即可，不用记特别牢，后续使用会反复强化记忆。',
  s2_h: '第 2 步：背基础单词和语法',
  s2_side: '每天新卡 5–20 张就够，可以把{retention}改成 70–80%。{anki} 的复习量会在两三周后堆起来，新卡开太多是绝大多数人放弃 {anki} 的原因。',
  s2_lead: '这里推荐使用 {anki} 卡组：',
  s2_li1: '{kaishi}：<a href="{kaishi_url}">中文版</a>（<a href="{kaishi_orig}">原版仓库</a>）。',
  s2_li2: '{onigiri}：<a href="https://ankiweb.net/shared/info/1567144169">中文版</a>，背到 {n3n4} 即可。',
  s2_p: '在你背单词的时候，同时开始下一步：沉浸。',
  faq_q1: 'Q：{kana}好枯燥，这是正常的吗？',
  faq_a1a: '正常，而且几乎所有人都这么觉得。',
  faq_a1b: '你不需要等到「喜欢背五十音」才开始——事实上那一天可能永远不会来。你需要的是先动起来，哪怕只是每天五分钟，哪怕今天只记住了「あ」。',
  faq_a1c: '进步本身会带来动力。当你有一天突然在动画里听懂了一个词，那种感觉会让之前所有枯燥的积累变得值得。但那一天不会凭空到来，它需要你先熬过这段「什么都不懂」的时期。',
  faq_q2: 'Q：我应该每天花多少时间在 {anki} 上？',
  faq_a2a: '比你想的少。',
  faq_a2b: '每天 15 到 30 分钟，取决于你对此事的接受程度，认真做，比偶尔一次两小时有效得多。原因很简单：习惯比强度更重要。一个你能坚持每天做的计划，远胜过一个你三天打鱼两天晒网的「高强度计划」。',
  faq_a2c: '如果你今天状态很差，那就只做 5 分钟。5 分钟也算。<b>马车走得慢没关系，重要的是不要掉下车。</b>一旦习惯断掉，重新开始的心理成本会比你想象的大得多。',
  faq_q3: 'Q：我记性很差，老是忘，怎么办？',
  faq_a3a: '遗忘是正常的，{anki} 存在的意义就是对抗遗忘。',
  faq_a3b: '今天记不住，明天记不住，总有一天会记住它。',
  s3_h: '第 3 步：沉浸同时{card} + 背单词',
  s3_c1: '学语言需要接受一个事实：你无法理解所有内容。',
  s3_c2: '很多人觉得自己没「准备好」，想先学够了再去沉浸——这永远不会有效果。无论你提前准备了多少，第一次接触真实材料时，你都不会全懂。与其回避这种不适，不如一头扎进去：你越能容忍模糊，大脑掌握语言就越快。',
  s3_c3: '<b>如果实在受不了模糊</b>',
  s3_c4: '<li><b>剧透先行</b>：看之前先读剧情梗概，或者重看你已经看过母语版的内容。</li><li><b>母语字幕兜底</b>：通常不推荐母语字幕（学不到什么），但如果完全迷失，可以先不开字幕撑一段，撑不住再显示一下母语字幕，或者无字幕看一遍、开字幕再看一遍。</li>',
  s3_p1: '刚开始建议从轻松的内容入手——日常番比战斗番好懂，轻小说比纯文学好读。',
  s3_p2: '看你喜欢的内容，遇到不认识的单词点击查词，并在你觉得有必要时{card}。',
  s3_p3: '背单词是重要的主动非沉浸学习手段，前期能快速积累词汇量。',
  // 术语与气泡
  w_dl: '下载 Fushi', w_yeh: '叶佬', w_kana: '五十音', w_onigiri: 'おにぎり文法', w_retention: '保留率', w_card: '制卡',
  tip_anki: '{ankiweb}，取名自暗記（あんき），是世界上使用最广泛的{srs}，也是 Fushi 默认联动的工具。你可以把想记忆的任何材料交给 Anki，它能让你用最少的学习时间达到最好的记忆效果。',
  w_ankiweb: 'Anki', w_srs: '间隔重复记忆系统（SRS）',
  tip_kana: '日语的假名表：平假名、片假名各 46 个基本音，按あ・い・う・え・お五段十行排列，所以叫五十音。它是日语书写的基础，也是背单词前唯一必须先过的一关。',
  tip_kaishi: '面向零基础的 Anki 单词卡组：按词频挑出约 1500 个日语高频词，每张卡带例句、发音和音调，由 The Moe Way 社区制作。Kaishi 就是「開始」。',
  tip_onigiri: '基于 aiueo.cc（饭团君日语发音教室）语法专题制作的 Anki 卡组，收 N5～N1 共 757 条语法，每条配日语老师真人录制的例句音频。',
  tip_n3n4: 'JLPT（日本语能力测试）的等级，N5 最易、N1 最难。初级语法大致对应 N5～N4，N3 是中级的门槛；沉浸起步有 N4 上下的语法框架就够。',
  tip_retention: 'Anki 里 FSRS 算法的「期望记忆保留率」，默认 90%。调低到 70–80% 会明显减少每天的复习量，代价是忘得多一点——前期有沉浸兜底，这笔账划算。',
  tip_card: '把沉浸里遇到的生词连同它所在的原句、音频和画面做成一张 Anki 卡片。Fushi 里点一下查词、再点一下就做好了。',
};

const ZH_HK = {
  title: '沉浸學習',
  note: '本文以日語為例，其他語言同理。',
  fit_h: '我適合沉浸嗎？',
  fit_p1: '看教材、做題——我猜沒幾個人真心喜歡這些事。對一件不喜歡的事，動力從哪來？能堅持多久？',
  fit_p2: '<b>但沉浸不一樣。它只需要滿足一個條件：你對相關的內容——動畫、綜藝、電影、小說、遊戲、漫畫，任何你喜歡的內容——有真實的興趣。</b>',
  fit_p3: '不需要任何基礎，不需要天賦，甚至不需要「下決心」。你只需要願意去接觸這些內容。',
  fit_p4: '選擇你喜歡的內容，這比什麼都重要。',
  what_h: '什麼是沉浸？',
  what_p1: '去聽、去讀母語者為母語者製作的內容：動畫、小說、遊戲、綜藝這些面向母語者的東西。你現在看的每一部番、玩的每一款遊戲，都算沉浸。',
  what_p2: '與「先學會再用」相反，沉浸是在使用的過程中自然學會。',
  what_p3: '沉浸是語言習得的必經之路。背單詞、學語法、做題能給你入門基礎，但語言太浩瀚了，遠不是教材能覆蓋的。你之所以能毫不費力地讀完這段話，不是因為背過什麼語法規則，而是你的大腦在過去十幾年的海量中文輸入中自然積累了無數語言直覺。學外語也一樣，這種直覺只能從大量真實輸入中來。',
  what_p4: '沉浸在最開始會很痛苦，你幾乎什麼都聽不懂、看不懂。這很正常，每個人都是這樣過來的。但一旦過了那個階段，你會開始不知不覺地聽懂整句話、不查詞典也能讀下去。那種「突然就懂了」的瞬間，會讓之前所有的掙扎都值得。而且因為你選的是自己喜歡的內容，這個過程本身就是娛樂。',
  theory_summary: '沉浸學習的原理是什麼？',
  theory_p1: '語言不是「學」會的，是「習得」的。你小時候沒背過母語的語法表，卻能把話說得比任何語法書都自然，靠的只有一件事：海量的、聽得懂大半的輸入。',
  theory_quote: '「我們習得語言的原理別無二致：通過理解信息。」',
  theory_cite: '—— 史蒂芬·克拉申',
  theory_p2: '掌握單詞的含義，只是習得這一單詞的第一步。若要習得運用這一單詞的「直覺」，你需要在大量不同的場景下多次遇見這個單詞並理解它。',
  theory_p3: '在沉浸學習的過程中會接觸各種各樣的場景。每次你看到一個單詞並成功理解，你的直覺就得到了鍛鍊。最終，你建立起了很清晰的直覺，便能自然而然地知道單詞如何使用了。',
  start_h: '開始',
  s0_h: '第 0 步：使用 Fushi',
  s0_side: '新手引導裡的推薦包已經把常用詞典和音頻庫打包好了，不需要自己到處找資源。',
  s0_p: '{dl}，按新手引導完成配置：詞典、單詞音頻資料庫、下載並連接 {anki}。配好之後，看動畫、讀小說時點一下就能查詞，再點一下就是一張帶原句、音頻和配圖的 {anki} 卡。',
  s1_h: '第 1 步：背{kana}',
  s1_li1: '推薦用{yeh}開發的打字練習網站 {kanabr}（{gh}）：循序漸進解鎖假名，還能順便把打字也練了。',
  s1_li2: '或者你喜歡的任何工具。',
  s1_p: '先記完平假名即可，不用記得特別牢，後續使用會反覆強化記憶。',
  s2_h: '第 2 步：背基礎單詞和語法',
  s2_side: '每天新卡 5–20 張就夠，可以把{retention}改成 70–80%。{anki} 的複習量會在兩三週後堆起來，新卡開太多是絕大多數人放棄 {anki} 的原因。',
  s2_lead: '這裡推薦使用 {anki} 卡組：',
  s2_li1: '{kaishi}：<a href="{kaishi_url}">中文版</a>（<a href="{kaishi_orig}">原版倉庫</a>）。',
  s2_li2: '{onigiri}：<a href="https://ankiweb.net/shared/info/1567144169">中文版</a>，背到 {n3n4} 即可。',
  s2_p: '在你背單詞的時候，同時開始下一步：沉浸。',
  faq_q1: 'Q：{kana}好枯燥，這是正常的嗎？',
  faq_a1a: '正常，而且幾乎所有人都這麼覺得。',
  faq_a1b: '你不需要等到「喜歡背五十音」才開始——事實上那一天可能永遠不會來。你需要的是先動起來，哪怕只是每天五分鐘，哪怕今天只記住了「あ」。',
  faq_a1c: '進步本身會帶來動力。當你有一天突然在動畫裡聽懂了一個詞，那種感覺會讓之前所有枯燥的積累變得值得。但那一天不會憑空到來，它需要你先熬過這段「什麼都不懂」的時期。',
  faq_q2: 'Q：我應該每天花多少時間在 {anki} 上？',
  faq_a2a: '比你想的少。',
  faq_a2b: '每天 15 到 30 分鐘，取決於你對此事的接受程度，認真做，比偶爾一次兩小時有效得多。原因很簡單：習慣比強度更重要。一個你能堅持每天做的計劃，遠勝過一個你三天打魚兩天曬網的「高強度計劃」。',
  faq_a2c: '如果你今天狀態很差，那就只做 5 分鐘。5 分鐘也算。<b>馬車走得慢沒關係，重要的是不要掉下車。</b>一旦習慣斷掉，重新開始的心理成本會比你想像的大得多。',
  faq_q3: 'Q：我記性很差，老是忘，怎麼辦？',
  faq_a3a: '遺忘是正常的，{anki} 存在的意義就是對抗遺忘。',
  faq_a3b: '今天記不住，明天記不住，總有一天會記住它。',
  s3_h: '第 3 步：沉浸同時{card} + 背單詞',
  s3_c1: '學語言需要接受一個事實：你無法理解所有內容。',
  s3_c2: '很多人覺得自己沒「準備好」，想先學夠了再去沉浸——這永遠不會有效果。無論你提前準備了多少，第一次接觸真實材料時，你都不會全懂。與其迴避這種不適，不如一頭扎進去：你越能容忍模糊，大腦掌握語言就越快。',
  s3_c3: '<b>如果實在受不了模糊</b>',
  s3_c4: '<li><b>劇透先行</b>：看之前先讀劇情梗概，或者重看你已經看過母語版的內容。</li><li><b>母語字幕兜底</b>：通常不推薦母語字幕（學不到什麼），但如果完全迷失，可以先不開字幕撐一段，撐不住再顯示一下母語字幕，或者無字幕看一遍、開字幕再看一遍。</li>',
  s3_p1: '剛開始建議從輕鬆的內容入手——日常番比戰鬥番好懂，輕小說比純文學好讀。',
  s3_p2: '看你喜歡的內容，遇到不認識的單詞點一下查詞，並在你覺得有必要時{card}。',
  s3_p3: '背單詞是重要的主動非沉浸學習手段，前期能快速積累詞彙量。',
  w_dl: '下載 Fushi', w_yeh: '葉佬', w_kana: '五十音', w_onigiri: 'おにぎり文法', w_retention: '保留率', w_card: '製卡',
  tip_anki: '{ankiweb}，取名自暗記（あんき），是世界上使用最廣泛的{srs}，也是 Fushi 預設聯動的工具。你可以把想記憶的任何材料交給 Anki，它能讓你用最少的學習時間達到最好的記憶效果。',
  w_ankiweb: 'Anki', w_srs: '間隔重複記憶系統（SRS）',
  tip_kana: '日語的假名表：平假名、片假名各 46 個基本音，按あ・い・う・え・お五段十行排列，所以叫五十音。它是日語書寫的基礎，也是背單詞前唯一必須先過的一關。',
  tip_kaishi: '面向零基礎的 Anki 單詞卡組：按詞頻挑出約 1500 個日語高頻詞，每張卡帶例句、發音和音調，由 The Moe Way 社群製作。Kaishi 就是「開始」。',
  tip_onigiri: '基於 aiueo.cc（飯糰君日語發音教室）語法專題製作的 Anki 卡組，收 N5～N1 共 757 條語法，每條配日語老師真人錄製的例句音頻。',
  tip_n3n4: 'JLPT（日本語能力測試）的等級，N5 最易、N1 最難。初級語法大致對應 N5～N4，N3 是中級的門檻；沉浸起步有 N4 上下的語法框架就夠。',
  tip_retention: 'Anki 裡 FSRS 演算法的「期望記憶保留率」，預設 90%。調低到 70–80% 會明顯減少每天的複習量，代價是忘得多一點——前期有沉浸兜底，這筆賬划算。',
  tip_card: '把沉浸裡遇到的生詞連同它所在的原句、音頻和畫面做成一張 Anki 卡片。Fushi 裡點一下查詞、再點一下就做好了。',
};

const EN = {
  title: 'Immersion learning',
  note: 'This guide uses Japanese as the example; the same approach works for any language.',
  fit_h: 'Is immersion for me?',
  fit_p1: 'Textbooks and drills — I doubt many people genuinely enjoy them. Where does the motivation come from for something you dislike, and how long can it last?',
  fit_p2: '<b>Immersion is different. It has exactly one requirement: a genuine interest in the content — anime, variety shows, films, novels, games, manga, anything you enjoy.</b>',
  fit_p3: 'No prior knowledge, no talent, not even “resolve” needed. All it takes is a willingness to engage with the content.',
  fit_p4: 'Pick content you love. Nothing matters more.',
  what_h: 'What is immersion?',
  what_p1: 'Listening to and reading things made by native speakers for native speakers: anime, novels, games, variety shows — things made for a native audience. Every show you watch and every game you play already counts.',
  what_p2: 'Instead of “learn first, use later”, immersion lets you learn naturally by using.',
  what_p3: 'Immersion is the road every language learner has to walk eventually. Vocabulary drills, grammar study and exercises give you a foundation, but a language is far too vast for any textbook to cover. You can read this paragraph effortlessly not because you memorised grammar rules, but because more than a decade of massive input in your native language built countless intuitions in your brain. A foreign language works the same way: that intuition only comes from large amounts of real input.',
  what_p4: 'Immersion hurts at first: you understand almost nothing you hear or read. That is normal — everyone goes through it. But once you are past that stage, you start catching whole sentences without noticing and reading on without a dictionary. Those “it just clicked” moments make every earlier struggle worth it. And because you chose content you love, the process itself is entertainment.',
  theory_summary: 'How does immersion learning work?',
  theory_p1: 'Language isn’t “learned”, it’s acquired. You never memorised grammar tables for your mother tongue, yet you speak it more naturally than any grammar book could teach — thanks to one thing only: massive amounts of input you mostly understood.',
  theory_quote: '“We acquire language in only one way: by understanding messages.”',
  theory_cite: '— Stephen Krashen',
  theory_p2: 'Knowing a word’s meaning is only the first step. To acquire an intuition for how the word is used, you have to meet it — and understand it — many times across many different contexts.',
  theory_p3: 'Immersion exposes you to exactly that variety. Every time you see a word and understand it, your intuition sharpens. Eventually it becomes clear enough that you simply know how the word is used.',
  start_h: 'Getting started',
  s0_h: 'Step 0: Set up Fushi',
  s0_side: 'The recommended pack in the onboarding guide already bundles the common dictionaries and audio libraries — no need to hunt for resources yourself.',
  s0_p: '{dl} and follow the onboarding guide: dictionaries, word-audio database, then install and connect {anki}. From then on, one tap looks a word up while you watch or read, and another tap makes an {anki} card with the sentence, audio and screenshot.',
  s1_h: 'Step 1: Learn the {kana}',
  s1_li1: 'Recommended: {kanabr} ({gh}), a typing trainer by {yeh} that unlocks kana step by step — and teaches you to type Japanese along the way.',
  s1_li2: 'Or any tool you like.',
  s1_p: 'Getting through hiragana is enough. It doesn’t need to be solid — vocabulary study will reinforce it over and over.',
  s2_h: 'Step 2: Core vocabulary and grammar',
  s2_side: '5–20 new cards a day is plenty, and you can lower the {retention} to 70–80%. {anki} reviews pile up after two or three weeks; adding too many new cards is why most people quit {anki}.',
  s2_lead: 'Recommended {anki} decks:',
  s2_li1: '{kaishi}: <a href="{kaishi_orig}">original deck</a> (with translations into several languages in the same repo).',
  s2_li2: '{onigiri}: the Anki deck is Chinese-only, so use the <a href="{grammar_url}">Onigiri grammar guide</a> on aiueo.cc instead; up to {n3n4} is enough.',
  s2_p: 'While you’re still learning vocabulary, start the next step: immersion.',
  faq_q1: 'Q: Learning {kana} is so boring — is that normal?',
  faq_a1a: 'Completely normal, and almost everyone feels the same.',
  faq_a1b: 'You don’t need to wait until you “enjoy learning kana” to begin — that day may never come. What you need is to start moving, even if it’s only five minutes a day, even if all you remembered today was あ.',
  faq_a1c: 'Progress itself creates motivation. The day you suddenly catch a word in an anime, all the tedious groundwork will feel worth it. But that day won’t arrive on its own — you have to get through the “I understand nothing” phase first.',
  faq_q2: 'Q: How much time should I spend on {anki} each day?',
  faq_a2a: 'Less than you think.',
  faq_a2b: '15 to 30 minutes a day, depending on how much you can stomach, done properly, beats an occasional two-hour session by a wide margin. The reason is simple: habit matters more than intensity. A plan you can keep every day is worth far more than a “hardcore plan” you follow on and off.',
  faq_a2c: 'On a bad day, do just 5 minutes. 5 minutes counts. <b>A slow cart is fine; what matters is not falling off.</b> Once the habit breaks, restarting costs far more willpower than you’d expect.',
  faq_q3: 'Q: My memory is terrible and I keep forgetting — what do I do?',
  faq_a3a: 'Forgetting is normal. Fighting it is the whole point of {anki}.',
  faq_a3b: 'Not today, not tomorrow — but one day it sticks.',
  s3_h: 'Step 3: Immerse, {card} and study vocabulary at the same time',
  s3_c1: 'Learning a language means accepting one fact: you will not understand everything.',
  s3_c2: 'Many people feel they aren’t “ready” and want to study more before immersing — that never works. No matter how much you prepare, you won’t understand it all the first time you touch real material. Rather than avoiding the discomfort, dive in: the more ambiguity you can tolerate, the faster your brain picks the language up.',
  s3_c3: '<b>If the ambiguity is unbearable</b>',
  s3_c4: '<li><b>Spoil yourself first</b>: read a plot summary beforehand, or rewatch something you already know in your own language.</li><li><b>Native-language subtitles as a last resort</b>: normally not recommended (you learn little from them), but if you are completely lost, push on without them for a while and only flash them on when you must — or watch once without and once with.</li>',
  s3_p1: 'Start with easy material — slice-of-life shows are easier than battle anime, light novels easier than literary fiction.',
  s3_p2: 'Watch what you love, tap unknown words to look them up, and {card} when it feels worthwhile.',
  s3_p3: 'Vocabulary study is the one active, non-immersion method that matters: early on it builds your vocabulary fast.',
  w_dl: 'Download Fushi', w_yeh: 'L-M-Sherlock', w_kana: 'kana', w_onigiri: 'Onigiri Grammar', w_retention: 'desired retention', w_card: 'mine cards',
  tip_anki: '{ankiweb}, named after 暗記 (anki, “memorisation”), is the most widely used {srs} in the world and the tool Fushi integrates with by default. Hand it anything you want to remember and it schedules reviews so you get the best retention for the least study time.',
  w_ankiweb: 'Anki', w_srs: 'spaced repetition system (SRS)',
  tip_kana: 'The Japanese syllabaries: hiragana and katakana, 46 basic sounds each, laid out in five vowel rows and ten consonant columns — hence the Japanese name “fifty sounds”. They are the foundation of written Japanese and the one thing you must get through before vocabulary.',
  tip_kaishi: 'A beginner Anki vocabulary deck: about 1,500 high-frequency Japanese words chosen by frequency, each card with an example sentence, audio and pitch accent. Made by The Moe Way community; kaishi means “beginning”.',
  tip_onigiri: 'A JLPT grammar reference based on the aiueo.cc grammar series (Onigiri’s Japanese Pronunciation Class): 757 grammar points from N5 to N1, each with example sentences recorded by a Japanese teacher.',
  tip_n3n4: 'Levels of the JLPT (Japanese-Language Proficiency Test): N5 is the easiest, N1 the hardest. Beginner grammar roughly covers N5–N4, and N3 is the threshold of intermediate; a grammar framework around N4 is enough to start immersing.',
  tip_retention: 'The “desired retention” setting of Anki’s FSRS algorithm, 90% by default. Lowering it to 70–80% cuts the daily review load noticeably at the cost of forgetting a little more — a good trade early on, when immersion has your back.',
  tip_card: 'Turn a new word you met while immersing into an Anki card together with the sentence, audio and screenshot it came from. In Fushi it’s one tap to look up and one more to make the card.',
};

const JA = {
  title: 'イマージョン学習',
  note: 'この記事は日本語を例にしていますが、他の言語でも考え方は同じです。',
  fit_h: 'イマージョンは自分に向いている？',
  fit_p1: '教科書や問題集——それを心から楽しめる人はほとんどいないでしょう。好きでもないことに、やる気はどこから湧き、どれだけ続くでしょうか。',
  fit_p2: '<b>イマージョンは違います。必要な条件はひとつだけ。アニメ、バラエティ、映画、小説、ゲーム、漫画など、好きなコンテンツに本当の興味があることです。</b>',
  fit_p3: '基礎知識も才能も、「決意」さえ要りません。そのコンテンツに触れる気持ちがあれば十分です。',
  fit_p4: '好きなコンテンツを選ぶこと。これが何より大切です。',
  what_h: 'イマージョンとは？',
  what_p1: '母語話者が母語話者のために作ったもの——アニメ、小説、ゲーム、バラエティといった母語話者向けのもの——を聞き、読むことです。今見ているアニメも、遊んでいるゲームも、すべてイマージョンです。',
  what_p2: '「先に学んでから使う」のではなく、イマージョンは使いながら自然に身につける方法です。',
  what_p3: 'イマージョンは言語習得で必ず通る道です。単語暗記や文法学習、問題演習は入門の土台をくれますが、言語はあまりに広大で、教科書がカバーできる範囲をはるかに超えています。あなたがこの文章を苦もなく読めるのは、文法規則を暗記したからではなく、十数年にわたる母語の大量のインプットの中で、脳が無数の言語直感を自然に蓄えてきたからです。外国語も同じで、その直感は大量の本物のインプットからしか生まれません。',
  what_p4: 'イマージョンは最初はつらいものです。聞いても読んでも、ほとんど何もわからない。それは普通のことで、誰もがそこを通ってきました。でもその段階を越えると、いつの間にか文がまるごと聞き取れ、辞書を引かずに読み進められるようになります。「突然わかった」という瞬間が、それまでのすべての苦労を報いてくれます。しかも選んだのは自分の好きなコンテンツですから、この過程そのものが娯楽です。',
  theory_summary: 'イマージョン学習の原理は？',
  theory_p1: '言語は「学ぶ」ものではなく「習得する」ものです。子どもの頃、母語の文法表を暗記したことはないのに、どんな文法書より自然に話せる。頼りにしたのはただひとつ、大半は理解できる大量のインプットです。',
  theory_quote: '「私たちが言語を習得する方法はただひとつ、メッセージを理解することによってである。」',
  theory_cite: '—— スティーヴン・クラッシェン',
  theory_p2: '単語の意味を知ることは、その単語を習得する第一歩にすぎません。使い方の「直感」を身につけるには、さまざまな場面でその単語に何度も出会い、理解する必要があります。',
  theory_p3: 'イマージョンではまさにそうした多様な場面に触れます。単語を見て理解するたびに直感が磨かれ、やがてはっきりした直感が育ち、単語の使い方が自然にわかるようになります。',
  start_h: '始める',
  s0_h: 'ステップ 0：Fushi を使う',
  s0_side: '初期設定ガイドのおすすめパックには、よく使う辞書と音声ライブラリがまとめて入っています。自分で探し回る必要はありません。',
  s0_p: '{dl}し、初期設定ガイドに従って辞書と単語音声データベースを設定し、{anki} をインストールして接続します。設定後は、アニメや小説の中でワンタップで辞書引き、もうワンタップで例文・音声・画像付きの {anki} カードができます。',
  s1_h: 'ステップ 1：{kana}を覚える',
  s1_li1: 'おすすめは {yeh} 作のタイピング練習サイト {kanabr}（{gh}）。かなを段階的に解放しながら、タイピングも一緒に練習できます。',
  s1_li2: 'あるいは、好きなツールで。',
  s1_p: 'まずはひらがなを一通り覚えれば十分。完璧でなくても、その後の学習で何度も定着します。',
  s2_h: 'ステップ 2：基礎単語と文法',
  s2_side: '新規カードは 1 日 5〜20 枚で十分。{retention}は 70〜80% に下げても構いません。{anki} の復習は 2〜3 週間で積み上がるので、新規カードを増やしすぎることが、多くの人が {anki} をやめる原因です。',
  s2_lead: 'おすすめの {anki} デッキ：',
  s2_li1: '{kaishi}：<a href="{kaishi_orig}">オリジナル版</a>（同じリポジトリに各言語版へのリンクがあります）。',
  s2_li2: '{onigiri}：Anki デッキは中国語版のみなので、代わりに aiueo.cc の<a href="{grammar_url}">おにぎり君の文法一覧</a>を。{n3n4} まで押さえれば十分です。',
  s2_p: '単語を覚えながら、次のステップ——イマージョンを同時に始めます。',
  faq_q1: 'Q：{kana}の暗記が退屈です。普通ですか？',
  faq_a1a: '普通です。ほとんどの人がそう感じます。',
  faq_a1b: '「かなの暗記が好きになる」のを待つ必要はありません——その日は永遠に来ないかもしれません。必要なのは、まず動き出すこと。1 日 5 分でも、今日は「あ」しか覚えられなくても構いません。',
  faq_a1c: '進歩そのものがやる気を生みます。ある日アニメの中の単語が突然聞き取れたとき、それまでの退屈な積み重ねがすべて報われます。ただ、その日は勝手には来ません。「何もわからない」時期を先に乗り越える必要があります。',
  faq_q2: 'Q：{anki} には毎日どれくらい時間をかけるべき？',
  faq_a2a: '思っているより少なくて構いません。',
  faq_a2b: '無理のない範囲で 1 日 15〜30 分を真面目にやるほうが、たまに 2 時間やるよりずっと効果的です。理由は単純で、強度より習慣のほうが大事だから。毎日続けられる計画は、三日坊主の「ハードな計画」に勝ります。',
  faq_a2c: '調子が悪い日は 5 分だけでいい。5 分でも成果です。<b>馬車が遅くても構わない。大事なのは落ちないこと。</b>習慣が途切れると、再開の心理的コストは想像以上に大きくなります。',
  faq_q3: 'Q：記憶力が悪くてすぐ忘れます。どうすれば？',
  faq_a3a: '忘れるのは普通のことです。{anki} はまさに忘却と戦うためにあります。',
  faq_a3b: '今日覚えられなくても、明日覚えられなくても、いつか必ず覚えます。',
  s3_h: 'ステップ 3：イマージョンしながら{card}・単語学習',
  s3_c1: '言語学習では、ひとつの事実を受け入れる必要があります。すべてを理解することはできない、ということです。',
  s3_c2: '「準備ができていない」と感じて、もっと学んでからイマージョンをしようとする人は多いですが、それはうまくいきません。どれだけ準備しても、初めて本物の素材に触れたとき全部はわかりません。不快さを避けるより飛び込んでしまうこと。曖昧さに耐えられるほど、脳は速く言語を習得します。',
  s3_c3: '<b>どうしても曖昧さに耐えられないなら</b>',
  s3_c4: '<li><b>先にネタバレ</b>：見る前にあらすじを読む、あるいは母語で見たことのある作品を見直す。</li><li><b>最後の手段は母語字幕</b>：普段はおすすめしません（あまり学べません）が、完全に迷子になったら、まず字幕なしで粘り、どうしても無理なときだけ母語字幕を表示する。または字幕なしで 1 回、字幕ありでもう 1 回見る。</li>',
  s3_p1: '最初は気楽な内容から。日常系はバトル系より、ライトノベルは純文学よりわかりやすいです。',
  s3_p2: '好きなコンテンツを見て、知らない単語はタップして調べ、必要だと思ったら{card}。',
  s3_p3: '単語学習は、イマージョン以外で唯一重要な能動的学習です。序盤の語彙を素早く積み上げてくれます。',
  w_dl: 'Fushi をダウンロード', w_yeh: '葉さん（L-M-Sherlock）', w_kana: 'かな', w_onigiri: 'おにぎり文法', w_retention: '目標記憶保持率', w_card: 'カード作成',
  tip_anki: '{ankiweb} は「暗記」に由来する、世界で最も広く使われている{srs}で、Fushi が標準で連携するツールです。覚えたい素材を何でも任せれば、最小の学習時間で最良の記憶効果が得られるように復習を組んでくれます。',
  w_ankiweb: 'Anki', w_srs: '間隔反復システム（SRS）',
  tip_kana: 'ひらがな・カタカナ各 46 の基本音を、あ・い・う・え・おの五段と十行に並べた表。日本語の表記の基礎で、単語学習の前に必ず通る唯一の関門です。',
  tip_kaishi: '初心者向けの Anki 単語デッキ。頻度順に選んだ約 1,500 の高頻度語に、例文・音声・アクセントが付いています。The Moe Way コミュニティ制作。',
  tip_onigiri: 'aiueo.cc（おにぎり君の日本語発音教室）の文法特集を元にした JLPT 文法リファレンス。N5〜N1 の 757 項目に、日本語教師が録音した例文音声付き。',
  tip_n3n4: 'JLPT（日本語能力試験）のレベル。N5 が最も易しく N1 が最も難しい。初級文法はおおよそ N5〜N4、N3 が中級の入口。イマージョンを始めるには N4 前後の文法の枠組みがあれば十分です。',
  tip_retention: 'Anki の FSRS アルゴリズムの「目標記憶保持率」。既定は 90%。70〜80% に下げると毎日の復習量が目に見えて減り、その分少し忘れやすくなります。序盤はイマージョンが支えてくれるので、割の良い取引です。',
  tip_card: 'イマージョン中に出会った新しい単語を、その文・音声・画面ごと Anki カードにすること。Fushi ならワンタップで調べ、もうワンタップで作成できます。',
};

const KO = {
  title: '몰입 학습',
  note: '이 글은 일본어를 예로 들지만, 다른 언어도 방법은 같습니다.',
  fit_h: '몰입이 나에게 맞을까?',
  fit_p1: '교재와 문제 풀이 — 진심으로 좋아하는 사람은 거의 없을 겁니다. 싫어하는 일에 동기가 어디서 나오고, 얼마나 오래 갈까요?',
  fit_p2: '<b>몰입은 다릅니다. 조건은 하나뿐입니다. 애니메이션, 예능, 영화, 소설, 게임, 만화 등 좋아하는 콘텐츠에 진짜 흥미가 있을 것.</b>',
  fit_p3: '기초 지식도, 재능도, 심지어 「결심」도 필요 없습니다. 그 콘텐츠를 접할 마음만 있으면 됩니다.',
  fit_p4: '좋아하는 콘텐츠를 고르세요. 그것이 무엇보다 중요합니다.',
  what_h: '몰입이란?',
  what_p1: '원어민이 원어민을 위해 만든 것 — 애니메이션, 소설, 게임, 예능 같은 원어민 대상의 것 — 을 듣고 읽는 것입니다. 지금 보는 애니메이션, 지금 하는 게임이 이미 몰입입니다.',
  what_p2: '「먼저 배우고 나중에 쓴다」와 반대로, 몰입은 쓰면서 자연스럽게 익히는 방법입니다.',
  what_p3: '몰입은 언어 습득에서 반드시 거쳐야 하는 길입니다. 단어 암기, 문법 공부, 문제 풀이는 입문의 기초를 주지만, 언어는 너무나 방대해서 교재가 다룰 수 있는 범위를 훨씬 넘어섭니다. 당신이 이 문단을 힘들이지 않고 읽을 수 있는 것은 문법 규칙을 외웠기 때문이 아니라, 지난 십수 년 동안 모국어를 대량으로 접하며 뇌가 무수한 언어 직감을 자연스럽게 쌓았기 때문입니다. 외국어도 마찬가지로, 그 직감은 대량의 진짜 입력에서만 나옵니다.',
  what_p4: '몰입은 처음엔 괴롭습니다. 들어도 읽어도 거의 아무것도 이해가 안 됩니다. 그건 정상이고, 누구나 그렇게 지나왔습니다. 하지만 그 단계를 넘기면 어느새 문장을 통째로 알아듣고, 사전 없이도 읽어 나가게 됩니다. 「갑자기 이해됐다」는 그 순간이 이전의 모든 고생을 보상해 줍니다. 게다가 선택한 것이 좋아하는 콘텐츠이기에 이 과정 자체가 오락입니다.',
  theory_summary: '몰입 학습의 원리는?',
  theory_p1: '언어는 「배우는」 것이 아니라 「습득하는」 것입니다. 어릴 때 모국어 문법표를 외운 적이 없는데도 어떤 문법책보다 자연스럽게 말하죠. 의지한 것은 단 하나, 대부분 이해할 수 있는 엄청난 양의 입력입니다.',
  theory_quote: '「우리가 언어를 습득하는 방법은 오직 하나, 메시지를 이해하는 것이다.」',
  theory_cite: '— 스티븐 크라셴',
  theory_p2: '단어의 뜻을 아는 것은 그 단어를 습득하는 첫걸음일 뿐입니다. 쓰임새에 대한 「직감」을 얻으려면 다양한 상황에서 그 단어를 여러 번 만나고 이해해야 합니다.',
  theory_p3: '몰입은 바로 그런 다양한 상황을 제공합니다. 단어를 보고 이해할 때마다 직감이 다듬어지고, 결국 단어를 어떻게 쓰는지 자연스럽게 알게 됩니다.',
  start_h: '시작하기',
  s0_h: '0단계: Fushi 사용하기',
  s0_side: '시작 가이드의 추천 팩에는 자주 쓰는 사전과 음성 라이브러리가 이미 묶여 있어 직접 찾아다닐 필요가 없습니다.',
  s0_p: '{dl}하고 시작 가이드에 따라 사전, 단어 음성 데이터베이스를 설정한 뒤 {anki}를 설치하고 연결하세요. 설정 후에는 애니메이션이나 소설을 보다가 한 번 탭하면 단어 검색, 한 번 더 탭하면 원문·음성·화면이 담긴 {anki} 카드가 됩니다.',
  s1_h: '1단계: {kana} 외우기',
  s1_li1: '추천은 {yeh}가 만든 타자 연습 사이트 {kanabr}({gh}). 가나를 단계적으로 열어 가며 타자도 함께 익힙니다.',
  s1_li2: '또는 원하는 어떤 도구든.',
  s1_p: '히라가나를 한 번 훑으면 충분합니다. 완벽하지 않아도 이후 학습에서 반복해 다져집니다.',
  s2_h: '2단계: 기초 단어와 문법',
  s2_side: '새 카드는 하루 5–20장이면 충분하고, {retention}은 70–80%로 낮춰도 됩니다. {anki} 복습은 2–3주 뒤에 쌓이기 시작하므로, 새 카드를 너무 많이 여는 것이 대부분의 사람이 {anki}를 그만두는 이유입니다.',
  s2_lead: '추천 {anki} 덱:',
  s2_li1: '{kaishi}: <a href="{kaishi_orig}">원본 덱</a>(같은 저장소에 여러 언어 번역판 링크가 있습니다).',
  s2_li2: '{onigiri}: Anki 덱은 중국어판뿐이므로 대신 aiueo.cc의 <a href="{grammar_url}">오니기리군 문법 목록</a>을 쓰세요. {n3n4}까지면 충분합니다.',
  s2_p: '단어를 외우는 동안 다음 단계인 몰입을 동시에 시작하세요.',
  faq_q1: 'Q: {kana} 외우기가 너무 지루한데, 정상인가요?',
  faq_a1a: '정상이고, 거의 모두가 그렇게 느낍니다.',
  faq_a1b: '「가나 외우기가 좋아질 때」까지 기다릴 필요는 없습니다 — 그날은 영영 안 올지도 모릅니다. 필요한 건 먼저 움직이는 것. 하루 5분이라도, 오늘 「あ」 하나만 외웠더라도 괜찮습니다.',
  faq_a1c: '진보 자체가 동기를 만듭니다. 어느 날 애니메이션에서 단어 하나가 갑자기 들리면, 그동안의 지루한 축적이 전부 보람 있게 느껴집니다. 하지만 그날은 저절로 오지 않습니다. 「아무것도 모르겠는」 시기를 먼저 견뎌야 합니다.',
  faq_q2: 'Q: {anki}에 매일 얼마나 시간을 써야 하나요?',
  faq_a2a: '생각보다 적게.',
  faq_a2b: '감당할 수 있는 만큼 하루 15–30분을 제대로 하는 것이 가끔 두 시간 하는 것보다 훨씬 효과적입니다. 이유는 단순합니다. 강도보다 습관이 중요하니까요. 매일 지킬 수 있는 계획이 작심삼일 「고강도 계획」보다 훨씬 낫습니다.',
  faq_a2c: '컨디션이 나쁜 날은 5분만 하세요. 5분도 셉니다. <b>마차가 느려도 괜찮습니다. 중요한 건 떨어지지 않는 것.</b> 습관이 끊기면 다시 시작하는 심리적 비용이 생각보다 훨씬 큽니다.',
  faq_q3: 'Q: 기억력이 나빠서 자꾸 잊어버려요. 어떡하죠?',
  faq_a3a: '잊는 건 정상입니다. {anki}는 바로 망각과 싸우기 위해 존재합니다.',
  faq_a3b: '오늘 못 외우고 내일 못 외워도, 언젠가는 반드시 외워집니다.',
  s3_h: '3단계: 몰입하면서 {card}·단어 외우기',
  s3_c1: '언어를 배우려면 한 가지 사실을 받아들여야 합니다. 모든 것을 이해할 수는 없다는 것.',
  s3_c2: '많은 사람이 「준비가 안 됐다」고 느끼며 더 공부한 뒤에 몰입하려 하지만, 그건 절대 효과가 없습니다. 아무리 준비해도 진짜 자료를 처음 접하면 다 이해할 수 없습니다. 불편함을 피하기보다 뛰어드세요. 모호함을 견딜수록 뇌는 언어를 더 빨리 익힙니다.',
  s3_c3: '<b>모호함을 도저히 못 견디겠다면</b>',
  s3_c4: '<li><b>스포일러 먼저</b>: 보기 전에 줄거리를 읽거나, 모국어로 이미 본 작품을 다시 보세요.</li><li><b>최후의 수단은 모국어 자막</b>: 보통은 권하지 않지만(별로 배우는 게 없습니다), 완전히 길을 잃었다면 자막 없이 버티다가 정말 안 될 때만 잠깐 켜거나, 자막 없이 한 번·자막 켜고 한 번 보세요.</li>',
  s3_p1: '처음에는 가벼운 내용부터. 일상물이 배틀물보다, 라이트노벨이 순문학보다 이해하기 쉽습니다.',
  s3_p2: '좋아하는 콘텐츠를 보다가 모르는 단어는 탭해서 찾고, 필요하다 싶으면 {card}하세요.',
  s3_p3: '단어 암기는 몰입 외에 유일하게 중요한 능동적 학습으로, 초반 어휘를 빠르게 쌓아 줍니다.',
  w_dl: 'Fushi 다운로드', w_yeh: 'L-M-Sherlock', w_kana: '가나', w_onigiri: '오니기리 문법', w_retention: '목표 기억 유지율', w_card: '카드 만들기',
  tip_anki: '{ankiweb}는 「암기(暗記)」에서 이름을 딴, 세계에서 가장 널리 쓰이는 {srs}이며 Fushi가 기본으로 연동하는 도구입니다. 외우고 싶은 자료를 맡기면 최소한의 학습 시간으로 최고의 기억 효과를 내도록 복습을 짜 줍니다.',
  w_ankiweb: 'Anki', w_srs: '간격 반복 시스템(SRS)',
  tip_kana: '히라가나·가타카나 각 46개 기본음을 あ・い・う・え・お 다섯 단과 열 행으로 배열한 표. 일본어 표기의 기초이자 단어 암기 전에 반드시 거쳐야 할 유일한 관문입니다.',
  tip_kaishi: '초보자용 Anki 단어 덱. 빈도순으로 고른 약 1,500개 고빈도 단어에 예문·음성·악센트가 붙어 있습니다. The Moe Way 커뮤니티 제작. Kaishi는 「시작(開始)」이라는 뜻입니다.',
  tip_onigiri: 'aiueo.cc(오니기리군의 일본어 발음 교실) 문법 특집을 바탕으로 한 JLPT 문법 자료. N5–N1 757개 항목에 일본어 교사가 녹음한 예문 음성이 붙어 있습니다.',
  tip_n3n4: 'JLPT(일본어능력시험)의 등급. N5가 가장 쉽고 N1이 가장 어렵습니다. 초급 문법은 대략 N5–N4, N3은 중급의 문턱. 몰입을 시작하려면 N4 안팎의 문법 틀이면 충분합니다.',
  tip_retention: 'Anki FSRS 알고리즘의 「목표 기억 유지율」, 기본값 90%. 70–80%로 낮추면 하루 복습량이 눈에 띄게 줄고 대신 조금 더 잊게 됩니다. 초반엔 몰입이 받쳐 주니 남는 거래입니다.',
  tip_card: '몰입 중 만난 새 단어를 그 문장·음성·화면과 함께 Anki 카드로 만드는 것. Fushi에서는 한 번 탭해 검색하고 한 번 더 탭하면 완성됩니다.',
};

const LANGS = ['zh-CN', 'zh-HK', 'en', 'ja', 'ko', 'de', 'es', 'fr', 'it', 'nl', 'pt-BR', 'ru', 'tr', 'vi', 'th', 'id', 'ar'];
const TRANSLATED = { 'zh-CN': ZH, 'zh-HK': ZH_HK, en: EN, ja: JA, ko: KO };
const contentOf = (c) => TRANSLATED[c] || EN; // 其余语言暂用英文文案，链接仍按语言分流

const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const dataTip = (word, text) => '<span class="term" tabindex="0" data-tip="' + esc(text) + '">' + word + '</span>';

function render(c) {
  const t = contentOf(c);
  const ankiTip = t.tip_anki
    .replace('{ankiweb}', '<a href="https://apps.ankiweb.net/">' + t.w_ankiweb + '</a>')
    .replace('{srs}', '<a href="https://en.wikipedia.org/wiki/Spaced_repetition">' + t.w_srs + '</a>');
  const sub = {
    anki: '<span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip">' + ankiTip + '</span></span>',
    kana: dataTip(t.w_kana, t.tip_kana),
    kaishi: dataTip('<b>Kaishi 1.5k</b>', t.tip_kaishi),
    onigiri: dataTip('<b>' + t.w_onigiri + '</b>', t.tip_onigiri),
    n3n4: dataTip('N3/N4', t.tip_n3n4),
    retention: dataTip(t.w_retention, t.tip_retention),
    card: dataTip(t.w_card, t.tip_card),
    dl: '<a href="/download">' + t.w_dl + '</a>',
    yeh: '<a href="https://l-m-sherlock.github.io/">' + t.w_yeh + '</a>',
    kanabr: '<a href="' + kanabrUrl(c) + '">kanabr</a>',
    gh: '<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>',
    kaishi_url: KAISHI[c] || KAISHI_ORIG,
    kaishi_orig: KAISHI_ORIG,
    grammar_url: grammarUrl(c),
  };
  const out = {};
  for (const [k, v] of Object.entries(t)) {
    if (k.startsWith('w_') || k.startsWith('tip_')) continue;
    out[k] = v.replace(/\{(\w+)\}/g, (m, name) => { if (!(name in sub)) throw new Error('unknown placeholder ' + name + ' in ' + c + '.' + k); return sub[name]; });
  }
  return out;
}

const KEY = (k) => 'imm.' + k.replace('_', '.');
const zh = render('zh-CN');
const el = (tag, k, attrs = '') => '<' + tag + (attrs ? ' ' + attrs : '') + ' data-i18n="' + KEY(k) + '">' + zh[k] + '</' + tag + '>';

const body = `<div class="immersion" dir="auto">

${el('h1', 'title')}
${el('p', 'note', 'class="note"')}

${el('h2', 'fit_h')}
${el('p', 'fit_p1')}
${el('p', 'fit_p2')}
${el('p', 'fit_p3')}
${el('p', 'fit_p4')}

${el('h2', 'what_h')}
${el('p', 'what_p1')}
${el('p', 'what_p2')}
${el('p', 'what_p3')}
${el('p', 'what_p4')}

<details class="theory">
${el('summary', 'theory_summary')}
${el('p', 'theory_p1')}
<blockquote>${el('p', 'theory_quote')}${el('cite', 'theory_cite')}</blockquote>
${el('p', 'theory_p2')}
${el('p', 'theory_p3')}
</details>

${el('h2', 'start_h')}

${el('h3', 's0_h')}
<blockquote>${el('p', 's0_side')}</blockquote>
${el('p', 's0_p')}

${el('h3', 's1_h')}
<ul>
${el('li', 's1_li1')}
${el('li', 's1_li2')}
</ul>
${el('p', 's1_p')}

${el('h3', 's2_h')}
<blockquote>${el('p', 's2_side')}</blockquote>
${el('p', 's2_lead')}
<ul>
${el('li', 's2_li1')}
${el('li', 's2_li2')}
</ul>
${el('p', 's2_p')}

<aside class="faq">
${el('h4', 'faq_q1')}
${el('p', 'faq_a1a')}
${el('p', 'faq_a1b')}
${el('p', 'faq_a1c')}
${el('h4', 'faq_q2')}
${el('p', 'faq_a2a')}
${el('p', 'faq_a2b')}
${el('p', 'faq_a2c')}
${el('h4', 'faq_q3')}
${el('p', 'faq_a3a')}
${el('p', 'faq_a3b')}
</aside>

${el('h3', 's3_h')}
<aside class="callout">
${el('p', 's3_c1')}
${el('p', 's3_c2')}
${el('p', 's3_c3')}
${el('ul', 's3_c4')}
</aside>
${el('p', 's3_p1')}
${el('p', 's3_p2')}
${el('p', 's3_p3')}

</div>
`;

// 1. immersion.md：保留 front matter + <style>，替换正文
{
  const p = W + 'immersion.md';
  const raw = readFileSync(p, 'utf8');
  const crlf = raw.includes(CR + '\n');
  const s = raw.split(CR + '\n').join('\n');
  const cut = s.indexOf('<div class="immersion"');
  if (cut < 0) throw new Error('body start not found');
  const head = s.slice(0, cut).replace(
    ' * 侧注折回正文流，变成段落之间的浅灰卡片。\n */',
    ' * 侧注折回正文流，变成段落之间的浅灰卡片。\n *\n * 正文是带 data-i18n 键的 HTML，不是 markdown：站点语言切换靠 site.js 按键换 innerHTML，\n * 默认文本是 zh-CN。文案与 17 个字典由同一份内容对象生成（tool/build_immersion_i18n.mjs），\n * 别手改这里的段落，改内容对象后重新生成。\n */');
  const out = head + body;
  writeFileSync(p, crlf ? out.split('\n').join(CR + '\n') : out);
}

// 2. 17 个字典：追加 imm.* 键（替换已有的同名键）
for (const c of LANGS) {
  const p = W + 'public/i18n/' + c + '.json';
  const raw = readFileSync(p, 'utf8');
  const crlf = raw.includes(CR + '\n');
  const s = raw.split(CR + '\n').join('\n');
  const obj = JSON.parse(s);
  const canonical = JSON.stringify(obj, null, 2) + '\n';
  if (canonical !== s) throw new Error(c + '.json is not canonical JSON.stringify formatting; refusing to rewrite');
  for (const k of Object.keys(obj)) if (k.startsWith('imm.')) delete obj[k];
  const r = render(c);
  for (const [k, v] of Object.entries(r)) obj[KEY(k)] = v;
  const text = JSON.stringify(obj, null, 2) + '\n';
  writeFileSync(p, crlf ? text.split('\n').join(CR + '\n') : text);
}
console.log('ok: keys', Object.keys(zh).length, 'langs', LANGS.length, 'translated', Object.keys(TRANSLATED).join(','));
