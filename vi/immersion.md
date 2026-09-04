---
title: "Học bằng đắm mình"
description: "Hướng dẫn trọn vẹn để bắt đầu học ngoại ngữ bằng đắm mình: vì sao đắm mình, đắm mình là gì, và các bước 0–3 từ kana, bộ thẻ Anki đến tạo thẻ ngay khi đang xem."
head:
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:title"
      content: "Học bằng đắm mình"
  - - meta
    - property: "og:description"
      content: "Hướng dẫn trọn vẹn để bắt đầu học ngoại ngữ bằng đắm mình: vì sao đắm mình, đắm mình là gì, và các bước 0–3 từ kana, bộ thẻ Anki đến tạo thẻ ngay khi đang xem."
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/vi/immersion"
  - - meta
    - property: "og:locale"
      content: "vi_VN"
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

<h1 data-i18n="imm.title">Học bằng đắm mình</h1>
<p class="note" data-i18n="imm.note">Bài này lấy tiếng Nhật làm ví dụ; cách làm áp dụng được cho mọi ngôn ngữ.</p>

<h2 data-i18n="imm.fit.h">Đắm mình có hợp với tôi không?</h2>
<p data-i18n="imm.fit.p1">Giáo trình và bài tập — tôi ngờ rằng chẳng mấy ai thật sự thích. Với một việc mình không thích, động lực lấy ở đâu ra, và giữ được bao lâu?</p>
<p data-i18n="imm.fit.p2"><b>Đắm mình thì khác. Nó chỉ có một điều kiện: bạn thật sự hứng thú với nội dung — anime, chương trình giải trí, phim, tiểu thuyết, game, manga, bất cứ thứ gì bạn thích.</b></p>
<p data-i18n="imm.fit.p3">Không cần nền tảng, không cần năng khiếu, thậm chí không cần «quyết tâm». Chỉ cần bạn sẵn lòng tiếp xúc với những nội dung ấy.</p>
<p data-i18n="imm.fit.p4">Chọn nội dung bạn yêu thích. Không gì quan trọng hơn.</p>

<h2 data-i18n="imm.what.h">Đắm mình là gì?</h2>
<p data-i18n="imm.what.p1">Nghe và đọc những gì người bản xứ làm cho người bản xứ: anime, tiểu thuyết, game, chương trình giải trí — những thứ dành cho khán giả bản xứ. Mỗi bộ phim bạn xem, mỗi trò chơi bạn chơi đều đã tính là đắm mình.</p>
<p data-i18n="imm.what.p2">Thay vì «học trước, dùng sau», đắm mình giúp bạn học một cách tự nhiên ngay trong lúc dùng.</p>
<p data-i18n="imm.what.p3">Đắm mình là con đường mà rốt cuộc ai cũng phải đi qua. Học từ, học ngữ pháp, làm bài tập cho bạn nền tảng nhập môn, nhưng ngôn ngữ quá mênh mông, không giáo trình nào bao quát nổi. Bạn đọc đoạn này không tốn chút sức nào không phải vì đã thuộc quy tắc ngữ pháp, mà vì hơn chục năm tiếp nhận tiếng mẹ đẻ với khối lượng khổng lồ đã tự tích lũy trong não bạn vô số trực giác ngôn ngữ. Học ngoại ngữ cũng vậy: trực giác ấy chỉ đến từ lượng lớn đầu vào thật.</p>
<p data-i18n="imm.what.p4">Đắm mình đúng là có một giai đoạn đầu gần như chẳng hiểu gì. Nhưng vì bạn chọn nội dung mình thích, dù không hiểu hết vẫn xem tiếp được. Tiến nhanh hay chậm, hiểu nhiều hay ít — quan trọng nhất vẫn là sự hứng thú của bạn với chính nội dung đó.</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">Nguyên lý của học bằng đắm mình là gì?</summary>
<p data-i18n="imm.theory.p1">Ngôn ngữ không phải thứ «học» mà là thứ «thụ đắc». Hồi nhỏ bạn chưa từng thuộc bảng ngữ pháp tiếng mẹ đẻ mà vẫn nói tự nhiên hơn bất kỳ sách ngữ pháp nào, chỉ nhờ một điều: lượng đầu vào khổng lồ mà bạn hiểu được phần lớn.</p>
<blockquote><p data-i18n="imm.theory.quote">«Chúng ta thụ đắc ngôn ngữ chỉ bằng một cách: hiểu được thông điệp.»</p><cite data-i18n="imm.theory.cite">— Stephen Krashen</cite></blockquote>
<p data-i18n="imm.theory.p2">Biết nghĩa một từ mới chỉ là bước đầu của việc thụ đắc từ đó. Muốn có «trực giác» dùng từ, bạn phải gặp và hiểu nó nhiều lần trong nhiều bối cảnh khác nhau.</p>
<p data-i18n="imm.theory.p3">Đắm mình đưa bạn đến đúng sự đa dạng ấy. Mỗi lần thấy một từ và hiểu được nó, trực giác của bạn được mài sắc thêm. Cuối cùng nó rõ ràng đến mức bạn tự nhiên biết từ đó dùng thế nào.</p>
</details>

<h2 data-i18n="imm.start.h">Bắt đầu</h2>

<h3 data-i18n="imm.s0.h">Bước 0: dùng Fushi</h3>
<blockquote><p data-i18n="imm.s0.side">Gói đề xuất trong hướng dẫn ban đầu đã gom sẵn các từ điển và thư viện âm thanh thông dụng, không cần tự đi tìm tài nguyên.</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/download">Tải Fushi</a> và làm theo hướng dẫn ban đầu: từ điển, cơ sở dữ liệu âm thanh từ vựng, rồi cài và kết nối <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, đặt tên theo 暗記 (anki, «học thuộc»), là <a href="https://en.wikipedia.org/wiki/Spaced_repetition">hệ thống lặp lại ngắt quãng (SRS)</a> được dùng rộng rãi nhất thế giới và là công cụ Fushi liên kết mặc định. Giao cho nó bất cứ thứ gì bạn muốn nhớ, nó sẽ sắp lịch ôn để bạn nhớ tốt nhất với thời gian học ít nhất.</span></span>. Sau đó, khi xem hay đọc, chạm một lần để tra từ, chạm thêm lần nữa là có thẻ <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, đặt tên theo 暗記 (anki, «học thuộc»), là <a href="https://en.wikipedia.org/wiki/Spaced_repetition">hệ thống lặp lại ngắt quãng (SRS)</a> được dùng rộng rãi nhất thế giới và là công cụ Fushi liên kết mặc định. Giao cho nó bất cứ thứ gì bạn muốn nhớ, nó sẽ sắp lịch ôn để bạn nhớ tốt nhất với thời gian học ít nhất.</span></span> kèm câu, âm thanh và ảnh chụp.</p>

<h3 data-i18n="imm.s1.h">Bước 1: học <span class="term" tabindex="0" data-tip="Bảng chữ cái tiếng Nhật: hiragana và katakana, mỗi bảng 46 âm cơ bản, xếp theo năm hàng nguyên âm và mười cột phụ âm — vì thế tiếng Nhật gọi là «năm mươi âm». Đây là nền tảng của chữ viết tiếng Nhật và là cửa ải duy nhất bắt buộc phải qua trước khi học từ.">kana</span></h3>
<ul>
<li data-i18n="imm.s1.li1">Gợi ý: <a href="https://kanabr.vercel.app/">kanabr</a> (<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>), trang luyện gõ do <a href="https://l-m-sherlock.github.io/">L-M-Sherlock</a> phát triển, mở khóa kana dần dần và tiện thể luyện luôn gõ tiếng Nhật.</li>
<li data-i18n="imm.s1.li2">Hoặc bất kỳ công cụ nào bạn thích.</li>
</ul>
<p data-i18n="imm.s1.p">Đi hết hiragana một lượt là đủ. Không cần nhớ chắc, học từ vựng sẽ củng cố lại nhiều lần.</p>

<h3 data-i18n="imm.s2.h">Bước 2: từ vựng và ngữ pháp cơ bản</h3>
<blockquote><p data-i18n="imm.s2.side">Mỗi ngày 5–20 thẻ mới là đủ, có thể hạ <span class="term" tabindex="0" data-tip="Tham số «tỷ lệ ghi nhớ mục tiêu» của thuật toán FSRS trong Anki, mặc định 90%. Hạ xuống 70–80% sẽ giảm rõ lượng ôn tập mỗi ngày, đổi lại quên nhiều hơn một chút — giai đoạn đầu có đắm mình đỡ lưng, đây là món hời.">tỷ lệ ghi nhớ mục tiêu</span> xuống 70–80%. Lượng ôn tập của <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, đặt tên theo 暗記 (anki, «học thuộc»), là <a href="https://en.wikipedia.org/wiki/Spaced_repetition">hệ thống lặp lại ngắt quãng (SRS)</a> được dùng rộng rãi nhất thế giới và là công cụ Fushi liên kết mặc định. Giao cho nó bất cứ thứ gì bạn muốn nhớ, nó sẽ sắp lịch ôn để bạn nhớ tốt nhất với thời gian học ít nhất.</span></span> sẽ dồn lên sau hai ba tuần; mở quá nhiều thẻ mới là lý do phần lớn mọi người bỏ <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, đặt tên theo 暗記 (anki, «học thuộc»), là <a href="https://en.wikipedia.org/wiki/Spaced_repetition">hệ thống lặp lại ngắt quãng (SRS)</a> được dùng rộng rãi nhất thế giới và là công cụ Fushi liên kết mặc định. Giao cho nó bất cứ thứ gì bạn muốn nhớ, nó sẽ sắp lịch ôn để bạn nhớ tốt nhất với thời gian học ít nhất.</span></span>.</p></blockquote>
<p data-i18n="imm.s2.lead">Bộ thẻ <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, đặt tên theo 暗記 (anki, «học thuộc»), là <a href="https://en.wikipedia.org/wiki/Spaced_repetition">hệ thống lặp lại ngắt quãng (SRS)</a> được dùng rộng rãi nhất thế giới và là công cụ Fushi liên kết mặc định. Giao cho nó bất cứ thứ gì bạn muốn nhớ, nó sẽ sắp lịch ôn để bạn nhớ tốt nhất với thời gian học ít nhất.</span></span> gợi ý:</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="Bộ thẻ từ vựng Anki cho người mới: khoảng 1.500 từ tiếng Nhật tần suất cao chọn theo tần suất, mỗi thẻ có câu ví dụ, âm thanh và trọng âm. Do cộng đồng The Moe Way làm; kaishi nghĩa là «khởi đầu»."><b>Kaishi 1.5k</b></span>: <a href="https://github.com/duy103zxc/kaishi-vi/releases">bản tiếng Việt</a> (<a href="https://github.com/donkuri/Kaishi">kho gốc</a>).</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="Tài liệu ngữ pháp JLPT dựa trên chuyên đề ngữ pháp của aiueo.cc (Lớp phát âm tiếng Nhật Onigiri): 757 điểm ngữ pháp từ N5 đến N1, mỗi điểm kèm câu ví dụ do giáo viên người Nhật thu âm."><b>Ngữ pháp Onigiri</b></span>: bộ thẻ Anki chỉ có bản tiếng Trung, thay vào đó dùng <a href="https://aiueo.cc/pages_v2/vi/grammars.php">danh sách ngữ pháp Onigiri</a> trên aiueo.cc (có bản tiếng Việt); đến <span class="term" tabindex="0" data-tip="Các cấp của JLPT (kỳ thi năng lực tiếng Nhật): N5 dễ nhất, N1 khó nhất. Ngữ pháp sơ cấp tương ứng khoảng N5–N4, N3 là ngưỡng trung cấp; để bắt đầu đắm mình, có khung ngữ pháp cỡ N4 là đủ.">N3/N4</span> là đủ.</li>
</ul>
<p data-i18n="imm.s2.p">Trong lúc vẫn đang học từ, hãy bắt đầu bước tiếp theo: đắm mình.</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">H: Học <span class="term" tabindex="0" data-tip="Bảng chữ cái tiếng Nhật: hiragana và katakana, mỗi bảng 46 âm cơ bản, xếp theo năm hàng nguyên âm và mười cột phụ âm — vì thế tiếng Nhật gọi là «năm mươi âm». Đây là nền tảng của chữ viết tiếng Nhật và là cửa ải duy nhất bắt buộc phải qua trước khi học từ.">kana</span> chán quá, có bình thường không?</h4>
<p data-i18n="imm.faq.a1a">Bình thường, và hầu như ai cũng thấy vậy.</p>
<p data-i18n="imm.faq.a1b">Bạn không cần đợi đến khi «thích học kana» mới bắt đầu — ngày đó có thể không bao giờ tới. Điều bạn cần là động tay vào trước, dù chỉ năm phút mỗi ngày, dù hôm nay chỉ nhớ được chữ あ.</p>
<p data-i18n="imm.faq.a1c">Chính tiến bộ sẽ tạo ra động lực. Ngày bạn bỗng nghe hiểu một từ trong anime, mọi tích lũy tẻ nhạt trước đó đều trở nên xứng đáng. Nhưng ngày ấy không tự đến, bạn phải vượt qua giai đoạn «chẳng hiểu gì» trước đã.</p>
<h4 data-i18n="imm.faq.q2">H: Mỗi ngày nên dành bao nhiêu thời gian cho <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, đặt tên theo 暗記 (anki, «học thuộc»), là <a href="https://en.wikipedia.org/wiki/Spaced_repetition">hệ thống lặp lại ngắt quãng (SRS)</a> được dùng rộng rãi nhất thế giới và là công cụ Fushi liên kết mặc định. Giao cho nó bất cứ thứ gì bạn muốn nhớ, nó sẽ sắp lịch ôn để bạn nhớ tốt nhất với thời gian học ít nhất.</span></span>?</h4>
<p data-i18n="imm.faq.a2a">Ít hơn bạn nghĩ.</p>
<p data-i18n="imm.faq.a2b">Mỗi ngày 15 đến 30 phút, tùy sức chịu của bạn, làm nghiêm túc, hiệu quả hơn nhiều so với thỉnh thoảng làm một mạch hai tiếng. Lý do rất đơn giản: thói quen quan trọng hơn cường độ. Một kế hoạch bạn duy trì được mỗi ngày hơn hẳn một «kế hoạch cường độ cao» làm bữa đực bữa cái.</p>
<p data-i18n="imm.faq.a2c">Hôm nào tệ quá thì chỉ làm 5 phút. 5 phút cũng tính. <b>Xe chậm không sao, quan trọng là đừng rơi khỏi xe.</b> Một khi thói quen đứt, chi phí tâm lý để bắt đầu lại lớn hơn bạn tưởng nhiều.</p>
<h4 data-i18n="imm.faq.q3">H: Trí nhớ tôi kém, cứ quên hoài, làm sao đây?</h4>
<p data-i18n="imm.faq.a3a">Quên là bình thường. Chống lại sự quên chính là lý do <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, đặt tên theo 暗記 (anki, «học thuộc»), là <a href="https://en.wikipedia.org/wiki/Spaced_repetition">hệ thống lặp lại ngắt quãng (SRS)</a> được dùng rộng rãi nhất thế giới và là công cụ Fushi liên kết mặc định. Giao cho nó bất cứ thứ gì bạn muốn nhớ, nó sẽ sắp lịch ôn để bạn nhớ tốt nhất với thời gian học ít nhất.</span></span> tồn tại.</p>
<p data-i18n="imm.faq.a3b">Hôm nay chưa nhớ, mai chưa nhớ, rồi sẽ có ngày nhớ.</p>
</aside>

<h3 data-i18n="imm.s3.h">Bước 3: đắm mình, đồng thời <span class="term" tabindex="0" data-tip="Biến từ mới gặp khi đắm mình thành một thẻ Anki cùng với câu gốc, âm thanh và ảnh chụp nơi nó xuất hiện. Trong Fushi, chạm một lần để tra, chạm thêm lần nữa là xong thẻ.">tạo thẻ</span> và học từ</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">Học ngôn ngữ cần chấp nhận một sự thật: bạn không thể hiểu hết mọi thứ.</p>
<p data-i18n="imm.s3.c2">Nhiều người thấy mình «chưa sẵn sàng», muốn học đủ rồi mới đắm mình — cách đó không bao giờ hiệu quả. Dù chuẩn bị bao nhiêu, lần đầu chạm vào tài liệu thật bạn vẫn không hiểu hết. Thay vì né tránh cảm giác khó chịu, hãy lao vào: càng chịu được sự mơ hồ, não càng tiếp thu ngôn ngữ nhanh.</p>
<p data-i18n="imm.s3.c3"><b>Nếu thật sự không chịu nổi sự mơ hồ</b></p>
<ul data-i18n="imm.s3.c4"><li><b>Đọc spoiler trước</b>: đọc tóm tắt cốt truyện trước khi xem, hoặc xem lại thứ bạn đã xem bản tiếng mẹ đẻ.</li><li><b>Phụ đề tiếng mẹ đẻ là phương án cuối</b>: thường không khuyến khích (học được rất ít), nhưng nếu lạc hoàn toàn, hãy cố xem không phụ đề một lúc, không nổi nữa mới bật lên — hoặc xem một lượt không phụ đề, một lượt có phụ đề.</li></ul>
</aside>
<p data-i18n="imm.s3.p1">Lúc mới bắt đầu nên chọn nội dung nhẹ nhàng — anime đời thường dễ hiểu hơn anime chiến đấu, light novel dễ đọc hơn văn học.</p>
<p data-i18n="imm.s3.p2">Xem thứ bạn thích, gặp từ lạ thì chạm để tra, và <span class="term" tabindex="0" data-tip="Biến từ mới gặp khi đắm mình thành một thẻ Anki cùng với câu gốc, âm thanh và ảnh chụp nơi nó xuất hiện. Trong Fushi, chạm một lần để tra, chạm thêm lần nữa là xong thẻ.">tạo thẻ</span> khi thấy đáng.</p>
<p data-i18n="imm.s3.p3">Học từ vựng là cách học chủ động duy nhất ngoài đắm mình thật sự quan trọng: giai đoạn đầu nó giúp tích lũy vốn từ rất nhanh.</p>

</div>
