---
title: "Belajar dengan imersi"
description: "Panduan lengkap memulai belajar bahasa dengan imersi: mengapa imersi, apa itu imersi, dan langkah 0–3 dari kana dan dek Anki sampai membuat kartu sambil menonton."
head:
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:title"
      content: "Belajar dengan imersi"
  - - meta
    - property: "og:description"
      content: "Panduan lengkap memulai belajar bahasa dengan imersi: mengapa imersi, apa itu imersi, dan langkah 0–3 dari kana dan dek Anki sampai membuat kartu sambil menonton."
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/id/immersion"
  - - meta
    - property: "og:locale"
      content: "id_ID"
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

<h1 data-i18n="imm.title">Belajar dengan imersi</h1>
<p class="note" data-i18n="imm.note">Panduan ini memakai bahasa Jepang sebagai contoh; pendekatannya berlaku untuk bahasa apa pun.</p>

<h2 data-i18n="imm.fit.h">Apakah imersi cocok untukku?</h2>
<p data-i18n="imm.fit.p1">Buku pelajaran dan latihan soal — saya ragu banyak orang benar-benar menikmatinya. Dari mana motivasi untuk hal yang tidak disukai, dan berapa lama bertahan?</p>
<p data-i18n="imm.fit.p2"><b>Imersi berbeda. Syaratnya cuma satu: minat yang tulus pada kontennya — anime, acara, film, novel, gim, manga, apa pun yang kamu suka.</b></p>
<p data-i18n="imm.fit.p3">Tidak perlu dasar, tidak perlu bakat, bahkan tidak perlu «bertekad». Cukup mau bersentuhan dengan konten itu.</p>
<p data-i18n="imm.fit.p4">Pilih konten yang kamu sukai. Tidak ada yang lebih penting.</p>

<h2 data-i18n="imm.what.h">Apa itu imersi?</h2>
<p data-i18n="imm.what.p1">Mendengarkan dan membaca apa yang dibuat penutur asli untuk penutur asli: anime, novel, gim, acara — hal-hal yang memang dibuat untuk penonton penutur asli. Setiap serial yang kamu tonton dan setiap gim yang kamu mainkan sudah terhitung.</p>
<p data-i18n="imm.what.p2">Alih-alih «belajar dulu, pakai nanti», dengan imersi kamu belajar secara alami sambil memakai.</p>
<p data-i18n="imm.what.p3">Imersi adalah jalan yang pada akhirnya harus ditempuh semua orang. Menghafal kosakata, belajar tata bahasa, dan mengerjakan soal memberi dasar, tetapi bahasa terlalu luas untuk buku pelajaran mana pun. Kamu bisa membaca paragraf ini tanpa usaha bukan karena hafal aturan tata bahasa, melainkan karena lebih dari sepuluh tahun asupan bahasa ibu dalam jumlah besar telah menumpuk tak terhitung intuisi bahasa di otakmu. Bahasa asing pun sama: intuisi itu hanya datang dari asupan nyata dalam jumlah besar.</p>
<p data-i18n="imm.what.p4">Imersi memang diawali masa ketika kamu hampir tidak paham apa pun. Tapi karena yang kamu pilih adalah konten kesukaanmu, kamu tetap bisa lanjut menonton meski tidak paham semuanya. Cepat atau lambat, banyak atau sedikit — yang paling penting adalah minatmu pada kontennya sendiri.</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">Bagaimana cara kerja belajar dengan imersi?</summary>
<p data-i18n="imm.theory.p1">Bahasa bukan «dipelajari», melainkan «diperoleh». Kamu tidak pernah menghafal tabel tata bahasa bahasa ibumu, tetapi bisa berbicara lebih alami daripada yang diajarkan buku mana pun — berkat satu hal: asupan dalam jumlah besar yang sebagian besar kamu pahami.</p>
<blockquote><p data-i18n="imm.theory.quote">«Kita memperoleh bahasa hanya dengan satu cara: memahami pesan.»</p><cite data-i18n="imm.theory.cite">— Stephen Krashen</cite></blockquote>
<p data-i18n="imm.theory.p2">Mengetahui arti sebuah kata baru langkah pertama. Untuk memperoleh «intuisi» cara memakainya, kamu harus menemui kata itu — dan memahaminya — berkali-kali dalam banyak konteks berbeda.</p>
<p data-i18n="imm.theory.p3">Imersi memberimu tepat keragaman itu. Setiap kali melihat sebuah kata dan memahaminya, intuisimu makin tajam. Pada akhirnya ia begitu jelas sehingga kamu begitu saja tahu bagaimana kata itu dipakai.</p>
</details>

<h2 data-i18n="imm.start.h">Mulai</h2>

<h3 data-i18n="imm.s0.h">Langkah 0: pakai Fushi</h3>
<blockquote><p data-i18n="imm.s0.side">Paket rekomendasi di panduan awal sudah membundel kamus dan pustaka audio yang umum dipakai — tidak perlu mencari sumber sendiri.</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/download">Unduh Fushi</a> dan ikuti panduan awal: kamus, basis data audio kata, lalu pasang dan hubungkan <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dinamai dari 暗記 (anki, «menghafal»), adalah <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistem pengulangan berjarak (SRS)</a> yang paling banyak dipakai di dunia dan alat yang terhubung dengan Fushi secara bawaan. Serahkan apa pun yang ingin kamu ingat, ia mengatur jadwal ulangan agar kamu mengingat paling banyak dengan waktu belajar paling sedikit.</span></span>. Setelah itu, satu ketukan mencari kata saat menonton atau membaca, satu ketukan lagi membuat kartu <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dinamai dari 暗記 (anki, «menghafal»), adalah <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistem pengulangan berjarak (SRS)</a> yang paling banyak dipakai di dunia dan alat yang terhubung dengan Fushi secara bawaan. Serahkan apa pun yang ingin kamu ingat, ia mengatur jadwal ulangan agar kamu mengingat paling banyak dengan waktu belajar paling sedikit.</span></span> dengan kalimat, audio, dan tangkapan layar.</p>

<h3 data-i18n="imm.s1.h">Langkah 1: hafalkan <span class="term" tabindex="0" data-tip="Aksara suku kata Jepang: hiragana dan katakana, masing-masing 46 bunyi dasar, disusun dalam lima baris vokal dan sepuluh kolom konsonan — karena itu dalam bahasa Jepang disebut «lima puluh bunyi». Ini dasar tulisan Jepang dan satu-satunya gerbang yang wajib dilewati sebelum menghafal kata.">kana</span></h3>
<ul>
<li data-i18n="imm.s1.li1">Rekomendasi: <a href="https://kanabr.vercel.app/">kanabr</a> (<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>), situs latihan mengetik buatan <a href="https://l-m-sherlock.github.io/">L-M-Sherlock</a> yang membuka kana secara bertahap — sekalian melatih mengetik bahasa Jepang.</li>
<li data-i18n="imm.s1.li2">Atau alat apa pun yang kamu suka.</li>
</ul>
<p data-i18n="imm.s1.p">Menuntaskan hiragana sekali sudah cukup. Tidak perlu hafal betul; belajar kosakata akan menguatkannya berulang kali.</p>

<h3 data-i18n="imm.s2.h">Langkah 2: kosakata dan tata bahasa dasar</h3>
<blockquote><p data-i18n="imm.s2.side">5–20 kartu baru sehari sudah cukup, dan <span class="term" tabindex="0" data-tip="Pengaturan «retensi yang diinginkan» pada algoritma FSRS di Anki, bawaannya 90%. Menurunkannya ke 70–80% memangkas jumlah ulangan harian dengan jelas, imbalannya sedikit lebih banyak lupa — di awal ada imersi yang menopang, jadi ini pertukaran yang menguntungkan.">retensi yang diinginkan</span> bisa diturunkan ke 70–80%. Ulangan <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dinamai dari 暗記 (anki, «menghafal»), adalah <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistem pengulangan berjarak (SRS)</a> yang paling banyak dipakai di dunia dan alat yang terhubung dengan Fushi secara bawaan. Serahkan apa pun yang ingin kamu ingat, ia mengatur jadwal ulangan agar kamu mengingat paling banyak dengan waktu belajar paling sedikit.</span></span> menumpuk setelah dua tiga minggu; membuka terlalu banyak kartu baru adalah alasan kebanyakan orang berhenti memakai <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dinamai dari 暗記 (anki, «menghafal»), adalah <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistem pengulangan berjarak (SRS)</a> yang paling banyak dipakai di dunia dan alat yang terhubung dengan Fushi secara bawaan. Serahkan apa pun yang ingin kamu ingat, ia mengatur jadwal ulangan agar kamu mengingat paling banyak dengan waktu belajar paling sedikit.</span></span>.</p></blockquote>
<p data-i18n="imm.s2.lead">Dek <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dinamai dari 暗記 (anki, «menghafal»), adalah <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistem pengulangan berjarak (SRS)</a> yang paling banyak dipakai di dunia dan alat yang terhubung dengan Fushi secara bawaan. Serahkan apa pun yang ingin kamu ingat, ia mengatur jadwal ulangan agar kamu mengingat paling banyak dengan waktu belajar paling sedikit.</span></span> yang direkomendasikan:</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="Dek kosakata Anki untuk pemula: sekitar 1.500 kata Jepang berfrekuensi tinggi yang dipilih berdasarkan frekuensi, tiap kartu dilengkapi kalimat contoh, audio, dan aksen nada. Dibuat komunitas The Moe Way; kaishi berarti «permulaan»."><b>Kaishi 1.5k</b></span>: <a href="https://ankiweb.net/shared/info/1512066033">versi bahasa Indonesia</a> (<a href="https://github.com/donkuri/Kaishi">repositori asli</a>).</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="Rujukan tata bahasa JLPT berdasarkan seri tata bahasa aiueo.cc (Kelas Pelafalan Jepang Onigiri): 757 poin tata bahasa dari N5 sampai N1, masing-masing dengan kalimat contoh yang direkam guru orang Jepang."><b>Tata Bahasa Onigiri</b></span>: dek Anki-nya hanya ada dalam bahasa Mandarin, jadi pakai <a href="https://aiueo.cc/pages_v2/en/grammars.php">panduan tata bahasa Onigiri</a> di aiueo.cc (bahasa Inggris) sebagai gantinya; sampai <span class="term" tabindex="0" data-tip="Tingkatan JLPT (ujian kemampuan bahasa Jepang): N5 paling mudah, N1 paling sulit. Tata bahasa dasar kira-kira mencakup N5–N4, dan N3 adalah ambang tingkat menengah; untuk mulai imersi, kerangka tata bahasa sekitar N4 sudah cukup.">N3/N4</span> sudah cukup.</li>
</ul>
<p data-i18n="imm.s2.p">Sambil masih belajar kosakata, mulailah langkah berikutnya: imersi.</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">T: Menghafal <span class="term" tabindex="0" data-tip="Aksara suku kata Jepang: hiragana dan katakana, masing-masing 46 bunyi dasar, disusun dalam lima baris vokal dan sepuluh kolom konsonan — karena itu dalam bahasa Jepang disebut «lima puluh bunyi». Ini dasar tulisan Jepang dan satu-satunya gerbang yang wajib dilewati sebelum menghafal kata.">kana</span> membosankan sekali, apakah itu normal?</h4>
<p data-i18n="imm.faq.a1a">Normal, dan hampir semua orang merasa begitu.</p>
<p data-i18n="imm.faq.a1b">Kamu tidak perlu menunggu sampai «suka menghafal kana» untuk mulai — hari itu mungkin tidak pernah datang. Yang kamu butuhkan adalah bergerak dulu, walau cuma lima menit sehari, walau hari ini hanya ingat あ.</p>
<p data-i18n="imm.faq.a1c">Kemajuan itu sendiri melahirkan motivasi. Hari ketika kamu tiba-tiba menangkap sebuah kata di anime, semua tumpukan membosankan sebelumnya terasa sepadan. Tapi hari itu tidak datang begitu saja — kamu harus lebih dulu melewati masa «tidak paham apa-apa».</p>
<h4 data-i18n="imm.faq.q2">T: Berapa lama sebaiknya saya memakai <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dinamai dari 暗記 (anki, «menghafal»), adalah <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistem pengulangan berjarak (SRS)</a> yang paling banyak dipakai di dunia dan alat yang terhubung dengan Fushi secara bawaan. Serahkan apa pun yang ingin kamu ingat, ia mengatur jadwal ulangan agar kamu mengingat paling banyak dengan waktu belajar paling sedikit.</span></span> setiap hari?</h4>
<p data-i18n="imm.faq.a2a">Lebih sedikit dari yang kamu kira.</p>
<p data-i18n="imm.faq.a2b">15 sampai 30 menit sehari, sesuai daya tahanmu, dikerjakan serius, jauh lebih efektif daripada sesekali dua jam sekaligus. Alasannya sederhana: kebiasaan lebih penting daripada intensitas. Rencana yang bisa kamu jalani setiap hari jauh lebih berharga daripada «rencana intensif» yang dijalani kadang-kadang.</p>
<p data-i18n="imm.faq.a2c">Kalau hari ini sedang buruk, kerjakan 5 menit saja. 5 menit tetap terhitung. <b>Kereta berjalan pelan tidak apa-apa; yang penting jangan sampai jatuh dari kereta.</b> Begitu kebiasaan putus, biaya psikologis untuk mulai lagi jauh lebih besar dari yang kamu bayangkan.</p>
<h4 data-i18n="imm.faq.q3">T: Ingatan saya buruk, selalu lupa, bagaimana?</h4>
<p data-i18n="imm.faq.a3a">Lupa itu normal. Melawan lupa justru alasan <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip"><a href="https://apps.ankiweb.net/">Anki</a>, dinamai dari 暗記 (anki, «menghafal»), adalah <a href="https://en.wikipedia.org/wiki/Spaced_repetition">sistem pengulangan berjarak (SRS)</a> yang paling banyak dipakai di dunia dan alat yang terhubung dengan Fushi secara bawaan. Serahkan apa pun yang ingin kamu ingat, ia mengatur jadwal ulangan agar kamu mengingat paling banyak dengan waktu belajar paling sedikit.</span></span> ada.</p>
<p data-i18n="imm.faq.a3b">Hari ini tidak ingat, besok tidak ingat, suatu hari pasti ingat.</p>
</aside>

<h3 data-i18n="imm.s3.h">Langkah 3: imersi, sambil <span class="term" tabindex="0" data-tip="Mengubah kata baru yang ditemui saat imersi menjadi kartu Anki bersama kalimat asli, audio, dan tangkapan layar tempatnya muncul. Di Fushi, satu ketukan untuk mencari, satu ketukan lagi untuk membuat kartunya.">buat kartu</span> dan menghafal kata</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">Belajar bahasa berarti menerima satu fakta: kamu tidak akan paham semuanya.</p>
<p data-i18n="imm.s3.c2">Banyak orang merasa «belum siap» dan ingin belajar lebih banyak dulu sebelum imersi — itu tidak pernah berhasil. Sebanyak apa pun persiapanmu, saat pertama menyentuh materi asli kamu tidak akan paham semuanya. Daripada menghindari rasa tidak nyaman, terjunlah: makin tahan pada ketidakjelasan, makin cepat otak menyerap bahasanya.</p>
<p data-i18n="imm.s3.c3"><b>Kalau ketidakjelasan benar-benar tak tertahankan</b></p>
<ul data-i18n="imm.s3.c4"><li><b>Spoiler dulu</b>: baca ringkasan cerita sebelum menonton, atau tonton ulang sesuatu yang sudah kamu tonton versi bahasa ibumu.</li><li><b>Takarir bahasa ibu sebagai jalan terakhir</b>: biasanya tidak dianjurkan (hampir tidak belajar apa-apa), tapi kalau benar-benar tersesat, bertahanlah dulu tanpa takarir dan nyalakan hanya saat tidak kuat lagi — atau tonton sekali tanpa, sekali dengan takarir.</li></ul>
</aside>
<p data-i18n="imm.s3.p1">Di awal, mulailah dari konten yang ringan — anime keseharian lebih mudah dipahami daripada anime pertarungan, light novel lebih mudah dibaca daripada sastra.</p>
<p data-i18n="imm.s3.p2">Tonton yang kamu suka, ketuk kata yang tidak dikenal untuk mencarinya, dan <span class="term" tabindex="0" data-tip="Mengubah kata baru yang ditemui saat imersi menjadi kartu Anki bersama kalimat asli, audio, dan tangkapan layar tempatnya muncul. Di Fushi, satu ketukan untuk mencari, satu ketukan lagi untuk membuat kartunya.">buat kartu</span> bila dirasa perlu.</p>
<p data-i18n="imm.s3.p3">Menghafal kosakata adalah satu-satunya cara belajar aktif di luar imersi yang penting: di awal ia menumpuk kosakata dengan cepat.</p>

</div>
