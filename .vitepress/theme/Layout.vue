<script setup>
/*
 * 站点页壳——顶栏 / 底栏与静态首页 public/index.html 完全同形，样式同出
 * /chrome.css。以前这里跑的是 VitePress 默认文档主题（自带侧边栏、搜索框、
 * 上一页/下一页），跟首页是两套观感，从首页点进 /download 直接断裂。
 *
 * 标记是从 public/index.html 那份抄过来的：两处改动必须同步，判据见
 * public/chrome.css 末尾的「标记形状」注释。
 *
 * 顶栏/底栏带 vp-raw：VitePress 客户端路由会把同源、无 target/download 的 <a> 点击当
 * 站内导航，而首页是静态 public/index.html、不在它的路由表里——点 logo（/）、
 * 底栏「怎么开始」（/#method）都会被 pushState 成它自己的 404 页。vp-raw 内的链接它放行。
 */
import { Content } from 'vitepress'
import { onMounted } from 'vue'

/*
 * 界面语言由 /site.js（config.mts 的 head 里以 data-manual 挂载）负责；这里只在
 * hydrate 完成后触发一次应用。hydrate 之前动 DOM 文本，Vue 会按服务端 vnode 把它
 * 改回去；hydrate 之后静态内容不再被 patch，data-i18n 的替换才站得住。
 * 选源器那类响应式区域不走 data-i18n，走 useSiteI18n() 的 t()。
 */
onMounted(() => {
  const i18n = typeof window !== 'undefined' ? window.fushiI18n : undefined
  if (i18n) i18n.apply()
})
</script>

<template>
  <div class="site-shell">
    <nav class="site-nav vp-raw" id="top">
      <a class="site-nav-brand" href="/"><span class="logo" aria-hidden="true">F</span>Fushi</a>
      <div class="site-nav-right">
        <input class="site-nav-check" type="checkbox" id="site-nav-check" aria-label="展开菜单" data-i18n-attr="aria-label=nav.menu">
        <label class="site-nav-burger" for="site-nav-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></label>
        <span class="site-nav-links">
          <a href="/#method"><span class="site-nav-word" data-i18n="nav.method">怎么开始</span></a>
          <a class="site-nav-ico" href="https://qm.qq.com/q/Sx2nWTvJCw" title="QQ 群" data-i18n-attr="title=nav.qq"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673"/></svg><span class="site-nav-word" data-i18n="nav.qq">QQ 群</span></a>
          <a class="site-nav-ico" href="https://discord.gg/WhjwyGmm7f" title="Discord"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg><span class="site-nav-word">Discord</span></a>
          <a class="site-nav-ico" href="https://github.com/hajisensai/Fushi" title="GitHub"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg><span class="site-nav-word">GitHub</span></a>
        </span>
        <div class="site-nav-lang" title="语言" data-i18n-attr="title=nav.language">
          <button class="site-nav-lang-btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="语言" data-i18n-attr="aria-label=nav.language"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.93 9h-3.02a15.6 15.6 0 0 0-1.3-5.3A8.03 8.03 0 0 1 19.93 11zM12 4.04c.83 1.2 1.87 3.45 2.13 6.96H9.87c.26-3.51 1.3-5.76 2.13-6.96zM4.07 13h3.02c.12 1.94.6 3.75 1.3 5.3A8.03 8.03 0 0 1 4.07 13zm3.02-2H4.07a8.03 8.03 0 0 1 4.32-5.3c-.7 1.55-1.18 3.36-1.3 5.3zM12 19.96c-.83-1.2-1.87-3.45-2.13-6.96h4.26c-.26 3.51-1.3 5.76-2.13 6.96zm3.61-1.66c.7-1.55 1.18-3.36 1.3-5.3h3.02a8.03 8.03 0 0 1-4.32 5.3z"/></svg><span class="site-nav-lang-current">简体中文</span><svg class="site-nav-lang-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
          <ul class="site-nav-lang-menu" role="listbox" hidden>
            <li><button type="button" role="option" data-lang="auto"><span data-i18n="nav.lang_auto">自动</span><span class="site-nav-lang-sub">简体中文</span></button></li>
            <li><button type="button" role="option" data-lang="zh-CN">简体中文</button></li>
            <li><button type="button" role="option" data-lang="zh-HK">繁體中文</button></li>
            <li><button type="button" role="option" data-lang="en">English</button></li>
            <li><button type="button" role="option" data-lang="ja">日本語</button></li>
            <li><button type="button" role="option" data-lang="ko">한국어</button></li>
            <li><button type="button" role="option" data-lang="de">Deutsch</button></li>
            <li><button type="button" role="option" data-lang="es">Español</button></li>
            <li><button type="button" role="option" data-lang="fr">Français</button></li>
            <li><button type="button" role="option" data-lang="it">Italiano</button></li>
            <li><button type="button" role="option" data-lang="nl">Nederlands</button></li>
            <li><button type="button" role="option" data-lang="pt-BR">Português (Brasil)</button></li>
            <li><button type="button" role="option" data-lang="ru">Русский</button></li>
            <li><button type="button" role="option" data-lang="tr">Türkçe</button></li>
            <li><button type="button" role="option" data-lang="vi">Tiếng Việt</button></li>
            <li><button type="button" role="option" data-lang="th">ไทย</button></li>
            <li><button type="button" role="option" data-lang="id">Bahasa Indonesia</button></li>
            <li><button type="button" role="option" data-lang="ar">العربية</button></li>
          </ul>
        </div>
        <a class="btn" href="/download" data-i18n="nav.download">下载</a>
      </div>
    </nav>

    <main class="site-main">
      <article class="prose">
        <Content />
      </article>
    </main>

    <footer class="site-footer vp-raw">
      <nav class="site-footer-links">
        <a href="/#method" data-i18n="nav.method">怎么开始</a><a href="/download" data-i18n="nav.download">下载</a><a class="site-footer-ico" href="https://github.com/hajisensai/Fushi" title="GitHub" aria-label="GitHub"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a><a class="site-footer-ico" href="https://discord.gg/WhjwyGmm7f" title="Discord" aria-label="Discord"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg></a><a class="site-footer-ico" href="https://qm.qq.com/q/Sx2nWTvJCw" title="QQ 群" aria-label="QQ 群" data-i18n-attr="title=nav.qq;aria-label=nav.qq"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673"/></svg></a>
      </nav>
      <p class="site-footer-legal" data-i18n="footer.legal">以 <a href="https://www.gnu.org/licenses/gpl-3.0.html">GPLv3</a> 许可发布</p>
      <p>© 2026 Fushi</p>
    </footer>
    <a class="site-totop" href="#top" aria-label="回到顶部" title="回到顶部" data-i18n-attr="aria-label=nav.totop;title=nav.totop"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></a>
  </div>
</template>
