/**
 * 把规范域名的变体 308 到 https://<规范域名> 同一路径：
 *   - 明文 http 访问规范域名；
 *   - www.<规范域名>（http 或 https）。
 *
 * 没有这条，http://fushi.moe/* 直接回 200，与 https 版本成了两份同样的页面，
 * Search Console 会把缺 canonical 的那份报成「重复网页，用户未选定规范网页」；
 * www.fushi.moe 有代理 DNS 却没有源站接，回 404，被报成「未找到 (404)」。
 * 走旁路 Route 的静态资源不经过 Worker，它们不参与索引，不影响结论。
 * 只认这两种主机名：别的（workers.dev 预览、源站直连）不在这里改写。
 *
 * @returns 需要跳转时的 308 响应，否则 null
 */
export function httpsRedirect(url: URL, canonicalHost: string): Response | null {
  const isWww = url.hostname === 'www.' + canonicalHost;
  if (!isWww && (url.protocol !== 'http:' || url.hostname !== canonicalHost)) return null;
  const target = new URL(url.toString());
  target.protocol = 'https:';
  target.hostname = canonicalHost;
  target.port = '';
  return new Response(null, {
    status: 308,
    headers: { location: target.toString(), 'cache-control': 'public, max-age=86400' },
  });
}
