/*
 * 注册多来源故障切换 SW（见 /sw.js）。
 *
 * 刻意不做任何 UI：用户不该知道自己被切到了哪条线路，地址栏也不会变。
 * 注册失败一律吞掉——SW 是加固层，它挂了页面必须照常工作。
 */
(function () {
  if (!('serviceWorker' in navigator)) return;
  // SW 要求安全上下文；localhost 也算，方便本地验证。
  var secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!secure) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
})();
