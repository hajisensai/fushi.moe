---
title: "Daldırma ile öğrenme"
description: "Daldırma ile dil öğrenmeye başlamak için eksiksiz rehber: neden daldırma, daldırma nedir ve kana ile Anki destelerinden izlerken kart çıkarmaya kadar 0–3. adımlar."
head:
  - - meta
    - name: "fushi-title"
      content: "{imm.title} | Fushi"
  - - meta
    - name: "fushi-description"
      content: "{imm.meta.desc}"
  - - link
    - rel: "canonical"
      href: "https://fushi.moe/tr/immersion"
  - - meta
    - property: "og:type"
      content: "article"
  - - meta
    - property: "og:site_name"
      content: "Fushi"
  - - meta
    - property: "og:title"
      content: "Daldırma ile öğrenme"
  - - meta
    - property: "og:description"
      content: "Daldırma ile dil öğrenmeye başlamak için eksiksiz rehber: neden daldırma, daldırma nedir ve kana ile Anki destelerinden izlerken kart çıkarmaya kadar 0–3. adımlar."
  - - meta
    - property: "og:url"
      content: "https://fushi.moe/tr/immersion"
  - - meta
    - property: "og:locale"
      content: "tr_TR"
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

<h1 data-i18n="imm.title">Daldırma ile öğrenme</h1>
<p class="note" data-i18n="imm.note">Bu rehber Japoncayı örnek alır; aynı yaklaşım her dil için geçerlidir.</p>

<h2 data-i18n="imm.fit.h">Daldırma bana uygun mu?</h2>
<p data-i18n="imm.fit.p1">Ders kitapları ve alıştırmalar — bunlardan gerçekten keyif alan çok kişi olduğunu sanmıyorum. Sevmediğiniz bir şey için motivasyon nereden gelir, ne kadar sürer?</p>
<p data-i18n="imm.fit.p2"><b>Daldırma farklıdır. Tek bir şartı vardır: içeriğe gerçek ilgi — anime, programlar, filmler, romanlar, oyunlar, manga, hoşunuza giden her şey.</b></p>
<p data-i18n="imm.fit.p3">Temel bilgi, yetenek, hatta „karar vermek“ bile gerekmez. Tek gereken o içeriğe yaklaşma isteğidir.</p>
<p data-i18n="imm.fit.p4">Sevdiğiniz içeriği seçin. Hiçbir şey bundan önemli değil.</p>

<h2 data-i18n="imm.what.h">Daldırma nedir?</h2>
<p data-i18n="imm.what.p1">Ana dili konuşanların ana dili konuşanlar için yaptıklarını dinlemek ve okumak: anime, romanlar, oyunlar, programlar — ana dil izleyicisi için üretilmiş şeyler. İzlediğiniz her dizi, oynadığınız her oyun zaten sayılır.</p>
<p data-i18n="imm.what.p2">„Önce öğren, sonra kullan“ yerine daldırmada kullanırken doğal olarak öğrenirsiniz.</p>
<p data-i18n="imm.what.p3">Daldırma, sonunda herkesin yürümek zorunda olduğu yoldur. Kelime ezberi, dil bilgisi çalışması ve alıştırmalar bir temel verir ama bir dil, herhangi bir ders kitabının kapsayamayacağı kadar geniştir. Bu paragrafı zahmetsizce okuyabilmeniz dil bilgisi kurallarını ezberlediğinizden değil, ana dilinizde on yılı aşkın devasa girdinin beyninizde sayısız sezgi inşa etmesindendir. Yabancı dilde de aynıdır: o sezgi yalnızca bol miktarda gerçek girdiden doğar.</p>
<p data-i18n="imm.what.p4">Daldırma gerçekten de neredeyse hiçbir şey anlamadığınız bir dönemle başlar. Ama sevdiğiniz içeriği seçtiğiniz için hepsini anlamasanız da izlemeye devam edebilirsiniz. Hızlı ya da yavaş, çok ya da az — en önemlisi içeriğin kendisine duyduğunuz ilgidir.</p>

<details class="theory">
<summary data-i18n="imm.theory.summary">Daldırma ile öğrenme nasıl işler?</summary>
<p data-i18n="imm.theory.p1">Dil „öğrenilmez“, edinilir. Ana diliniz için hiç dil bilgisi tablosu ezberlemediniz ama onu hiçbir dil bilgisi kitabının öğretemeyeceği kadar doğal konuşuyorsunuz — tek bir şey sayesinde: büyük çoğunluğunu anladığınız devasa girdi.</p>
<blockquote><p data-i18n="imm.theory.quote">„Dili yalnızca tek bir yolla ediniriz: mesajları anlayarak.“</p><cite data-i18n="imm.theory.cite">— Stephen Krashen</cite></blockquote>
<p data-i18n="imm.theory.p2">Bir kelimenin anlamını bilmek yalnızca ilk adımdır. Nasıl kullanıldığına dair sezgi edinmek için onunla pek çok farklı bağlamda defalarca karşılaşmanız — ve anlamanız — gerekir.</p>
<p data-i18n="imm.theory.p3">Daldırma sizi tam da bu çeşitliliğe maruz bırakır. Bir kelimeyi her görüp anladığınızda sezginiz keskinleşir. Sonunda o kadar netleşir ki kelimenin nasıl kullanıldığını sadece bilirsiniz.</p>
</details>

<h2 data-i18n="imm.start.h">Başlarken</h2>

<h3 data-i18n="imm.s0.h">Adım 0: Fushi’yi kurun</h3>
<blockquote><p data-i18n="imm.s0.side">Başlangıç rehberindeki önerilen paket, yaygın sözlükleri ve ses kütüphanelerini zaten bir arada sunar — kaynak aramanıza gerek yok.</p></blockquote>
<p data-i18n="imm.s0.p"><a href="/tr/download">Fushi’yi indirin</a> ve başlangıç rehberini izleyin: sözlükler, kelime ses veritabanı, ardından <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip">Adını 暗記 (anki, „ezber“) sözcüğünden alan <a href="https://apps.ankiweb.net/">Anki</a>, dünyada en yaygın kullanılan <a href="https://en.wikipedia.org/wiki/Spaced_repetition">aralıklı tekrar sistemi (SRS)</a> ve Fushi’nin varsayılan olarak entegre olduğu araçtır. Hatırlamak istediğiniz her şeyi ona verin; en az çalışma süresiyle en iyi hatırlama için tekrarları o planlar.</span></span>’yi kurup bağlayın. Sonrasında izlerken veya okurken bir dokunuşla kelimeye bakar, bir dokunuşla cümle, ses ve ekran görüntülü <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip">Adını 暗記 (anki, „ezber“) sözcüğünden alan <a href="https://apps.ankiweb.net/">Anki</a>, dünyada en yaygın kullanılan <a href="https://en.wikipedia.org/wiki/Spaced_repetition">aralıklı tekrar sistemi (SRS)</a> ve Fushi’nin varsayılan olarak entegre olduğu araçtır. Hatırlamak istediğiniz her şeyi ona verin; en az çalışma süresiyle en iyi hatırlama için tekrarları o planlar.</span></span> kartı oluşturursunuz.</p>

<h3 data-i18n="imm.s1.h">Adım 1: <span class="term" tabindex="0" data-tip="Japon hece alfabeleri: her biri 46 temel sesten oluşan hiragana ve katakana, beş ünlü satırı ve on ünsüz sütununa dizilir — Japonca adı „elli ses“ buradan gelir. Japon yazısının temelidir ve kelime çalışmasından önce geçilmesi gereken tek şeydir.">kana</span> öğrenin</h3>
<ul>
<li data-i18n="imm.s1.li1">Önerimiz: <a href="https://kanabr.vercel.app/">kanabr</a> (<a href="https://github.com/L-M-Sherlock/kanabr">GitHub</a>), <a href="https://l-m-sherlock.github.io/">L-M-Sherlock</a> tarafından yapılmış, kanayı adım adım açan ve bu arada Japonca yazmayı da öğreten bir yazma antrenörü.</li>
<li data-i18n="imm.s1.li2">Ya da hoşunuza giden herhangi bir araç.</li>
</ul>
<p data-i18n="imm.s1.p">Hiraganayı bir kez geçmek yeterli. Tam oturması gerekmez — kelime çalışması onu tekrar tekrar pekiştirir.</p>

<h3 data-i18n="imm.s2.h">Adım 2: temel kelime ve dil bilgisi</h3>
<blockquote><p data-i18n="imm.s2.side">Günde 5–20 yeni kart yeterli; <span class="term" tabindex="0" data-tip="Anki’nin FSRS algoritmasındaki „hedef hatırlama oranı“ ayarı, varsayılan %90. %70–80’e düşürmek günlük tekrar yükünü belirgin biçimde azaltır, karşılığında biraz daha unutursunuz — başlangıçta daldırma arkanızdayken kârlı bir takas.">hedef hatırlama oranı</span>i %70–80’e düşürebilirsiniz. <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip">Adını 暗記 (anki, „ezber“) sözcüğünden alan <a href="https://apps.ankiweb.net/">Anki</a>, dünyada en yaygın kullanılan <a href="https://en.wikipedia.org/wiki/Spaced_repetition">aralıklı tekrar sistemi (SRS)</a> ve Fushi’nin varsayılan olarak entegre olduğu araçtır. Hatırlamak istediğiniz her şeyi ona verin; en az çalışma süresiyle en iyi hatırlama için tekrarları o planlar.</span></span> tekrarları iki üç hafta sonra birikir; çok fazla yeni kart eklemek, çoğu insanın <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip">Adını 暗記 (anki, „ezber“) sözcüğünden alan <a href="https://apps.ankiweb.net/">Anki</a>, dünyada en yaygın kullanılan <a href="https://en.wikipedia.org/wiki/Spaced_repetition">aralıklı tekrar sistemi (SRS)</a> ve Fushi’nin varsayılan olarak entegre olduğu araçtır. Hatırlamak istediğiniz her şeyi ona verin; en az çalışma süresiyle en iyi hatırlama için tekrarları o planlar.</span></span>’yi bırakma sebebidir.</p></blockquote>
<p data-i18n="imm.s2.lead">Önerilen <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip">Adını 暗記 (anki, „ezber“) sözcüğünden alan <a href="https://apps.ankiweb.net/">Anki</a>, dünyada en yaygın kullanılan <a href="https://en.wikipedia.org/wiki/Spaced_repetition">aralıklı tekrar sistemi (SRS)</a> ve Fushi’nin varsayılan olarak entegre olduğu araçtır. Hatırlamak istediğiniz her şeyi ona verin; en az çalışma süresiyle en iyi hatırlama için tekrarları o planlar.</span></span> desteleri:</p>
<ul>
<li data-i18n="imm.s2.li1"><span class="term" tabindex="0" data-tip="Yeni başlayanlar için bir Anki kelime destesi: sıklığa göre seçilmiş yaklaşık 1.500 Japonca kelime; her kartta örnek cümle, ses ve perde vurgusu var. The Moe Way topluluğu yaptı; kaishi „başlangıç“ demektir."><b>Kaishi 1.5k</b></span>: <a href="https://github.com/donkuri/Kaishi">orijinal deste</a> (aynı depoda çeşitli dillere çeviri bağlantıları var).</li>
<li data-i18n="imm.s2.li2"><span class="term" tabindex="0" data-tip="aiueo.cc dil bilgisi serisine (Onigiri’nin Japonca Telaffuz Sınıfı) dayanan bir JLPT dil bilgisi kaynağı: N5’ten N1’e 757 dil bilgisi maddesi, her biri Japon bir öğretmenin seslendirdiği örnek cümlelerle."><b>Onigiri Dil Bilgisi</b></span>: Anki destesi yalnızca Çince olduğu için onun yerine aiueo.cc’deki <a href="https://aiueo.cc/pages_v2/en/grammars.php">Onigiri dil bilgisi rehberini</a> (İngilizce) kullanın; <span class="term" tabindex="0" data-tip="JLPT (resmi Japonca yeterlik sınavı) seviyeleri: N5 en kolay, N1 en zor. Temel dil bilgisi kabaca N5–N4’ü kapsar, N3 orta seviyenin eşiğidir; daldırmaya başlamak için N4 civarı bir dil bilgisi iskeleti yeter.">N3/N4</span>’e kadar yeterli.</li>
</ul>
<p data-i18n="imm.s2.p">Kelime çalışmaya devam ederken bir sonraki adıma başlayın: daldırma.</p>

<aside class="faq">
<h4 data-i18n="imm.faq.q1">S: <span class="term" tabindex="0" data-tip="Japon hece alfabeleri: her biri 46 temel sesten oluşan hiragana ve katakana, beş ünlü satırı ve on ünsüz sütununa dizilir — Japonca adı „elli ses“ buradan gelir. Japon yazısının temelidir ve kelime çalışmasından önce geçilmesi gereken tek şeydir.">kana</span> öğrenmek çok sıkıcı — bu normal mi?</h4>
<p data-i18n="imm.faq.a1a">Tamamen normal; neredeyse herkes aynı şeyi hisseder.</p>
<p data-i18n="imm.faq.a1b">Başlamak için „kana çalışmayı sevmeyi“ beklemenize gerek yok — o gün hiç gelmeyebilir. Gereken, harekete geçmek; günde beş dakika bile olsa, bugün yalnızca あ’yı hatırlamış olsanız bile.</p>
<p data-i18n="imm.faq.a1c">İlerlemenin kendisi motivasyon yaratır. Bir animede birden bir kelimeyi yakaladığınız gün, tüm o sıkıcı hazırlık değmiş olur. Ama o gün kendiliğinden gelmez — önce „hiçbir şey anlamıyorum“ dönemini atlatmanız gerekir.</p>
<h4 data-i18n="imm.faq.q2">S: <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip">Adını 暗記 (anki, „ezber“) sözcüğünden alan <a href="https://apps.ankiweb.net/">Anki</a>, dünyada en yaygın kullanılan <a href="https://en.wikipedia.org/wiki/Spaced_repetition">aralıklı tekrar sistemi (SRS)</a> ve Fushi’nin varsayılan olarak entegre olduğu araçtır. Hatırlamak istediğiniz her şeyi ona verin; en az çalışma süresiyle en iyi hatırlama için tekrarları o planlar.</span></span>’ye her gün ne kadar zaman ayırmalıyım?</h4>
<p data-i18n="imm.faq.a2a">Düşündüğünüzden az.</p>
<p data-i18n="imm.faq.a2b">Kaldırabildiğiniz kadar, günde 15–30 dakika, ciddiyetle yapılırsa ara sıra iki saatlik bir oturumdan çok daha etkilidir. Sebebi basit: alışkanlık yoğunluktan önemlidir. Her gün sürdürebildiğiniz bir plan, arada bir uyduğunuz „ağır plan“dan çok daha değerlidir.</p>
<p data-i18n="imm.faq.a2c">Kötü bir günde yalnızca 5 dakika yapın. 5 dakika sayılır. <b>Arabanın yavaş gitmesi sorun değil; önemli olan düşmemek.</b> Alışkanlık koptuğunda yeniden başlamak, sandığınızdan çok daha fazla irade ister.</p>
<h4 data-i18n="imm.faq.q3">S: Hafızam kötü, sürekli unutuyorum — ne yapmalıyım?</h4>
<p data-i18n="imm.faq.a3a">Unutmak normaldir. <span class="term" tabindex="0">Anki<span class="term-tip" role="tooltip">Adını 暗記 (anki, „ezber“) sözcüğünden alan <a href="https://apps.ankiweb.net/">Anki</a>, dünyada en yaygın kullanılan <a href="https://en.wikipedia.org/wiki/Spaced_repetition">aralıklı tekrar sistemi (SRS)</a> ve Fushi’nin varsayılan olarak entegre olduğu araçtır. Hatırlamak istediğiniz her şeyi ona verin; en az çalışma süresiyle en iyi hatırlama için tekrarları o planlar.</span></span>’nin varlık sebebi tam da onunla savaşmaktır.</p>
<p data-i18n="imm.faq.a3b">Bugün değil, yarın değil — ama bir gün kalır.</p>
</aside>

<h3 data-i18n="imm.s3.h">Adım 3: daldırma, bir yandan <span class="term" tabindex="0" data-tip="Daldırmada karşılaştığınız yeni bir kelimeyi, geçtiği cümle, ses ve ekran görüntüsüyle birlikte Anki kartına dönüştürmek. Fushi’de bir dokunuş bakmak, bir dokunuş kartı yapmak için.">kart çıkarın</span> ve kelime</h3>
<aside class="callout">
<p data-i18n="imm.s3.c1">Dil öğrenmek bir gerçeği kabul etmektir: her şeyi anlamayacaksınız.</p>
<p data-i18n="imm.s3.c2">Pek çok kişi „hazır olmadığını“ düşünüp daldırmadan önce daha çok çalışmak ister — bu asla işe yaramaz. Ne kadar hazırlanırsanız hazırlanın, gerçek materyale ilk dokunduğunuzda hepsini anlamazsınız. Rahatsızlıktan kaçmak yerine dalın: belirsizliğe ne kadar dayanırsanız beyniniz dili o kadar hızlı kapar.</p>
<p data-i18n="imm.s3.c3"><b>Belirsizlik dayanılmazsa</b></p>
<ul data-i18n="imm.s3.c4"><li><b>Önce spoiler</b>: izlemeden önce olay özetini okuyun ya da kendi dilinizde zaten bildiğiniz bir şeyi yeniden izleyin.</li><li><b>Son çare ana dilde altyazı</b>: normalde önerilmez (az şey öğrenirsiniz) ama tamamen kaybolduysanız önce bir süre altyazısız dayanın, yalnızca mecbur kalınca açın — ya da bir kez altyazısız, bir kez altyazılı izleyin.</li></ul>
</aside>
<p data-i18n="imm.s3.p1">Hafif materyalle başlayın — günlük yaşam animeleri dövüş animelerinden, light novel’lar edebi romanlardan kolaydır.</p>
<p data-i18n="imm.s3.p2">Sevdiğinizi izleyin, bilmediğiniz kelimelere dokunup bakın ve değdiğinde <span class="term" tabindex="0" data-tip="Daldırmada karşılaştığınız yeni bir kelimeyi, geçtiği cümle, ses ve ekran görüntüsüyle birlikte Anki kartına dönüştürmek. Fushi’de bir dokunuş bakmak, bir dokunuş kartı yapmak için.">kart çıkarın</span>.</p>
<p data-i18n="imm.s3.p3">Kelime çalışması, daldırma dışında önemli olan tek aktif yöntemdir: başlangıçta kelime dağarcığınızı hızla büyütür.</p>

</div>
