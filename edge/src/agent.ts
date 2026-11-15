import { handleSite, type SiteDeps } from './site';

/**
 * 给 AI agent 的两件事，都只作用在站点页面（HTML）上：
 *
 *  1. Markdown 协商：请求带 `Accept: text/markdown` 时回该页的 Markdown 副本
 *     （构建时 tool/build_markdown.mjs 写在 HTML 旁边：/ → /index.md，/download → /download.md）。
 *     副本同样走 handleSite，所以双源切换与陈旧兜底照旧；取不到就回 HTML，绝不因此 404。
 *  2. Link 响应头：HTML 响应带上 llms.txt / API catalog 的发现链接（RFC 8288、RFC 9727 §3）。
 */

/** HTML 页面响应上追加的发现链接。 */
export const AGENT_LINKS: readonly string[] = [
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
];

/** 明显不是页面的路径（静态文件）：不为它们找 Markdown 副本。常见问题文章形如 /faq/anki.en，所以不能只看有没有点。 */
const STATIC_EXT =
  /\.(?:html?|md|js|mjs|css|json|xml|txt|map|png|jpe?g|gif|webp|avif|svg|ico|mp3|m4a|mp4|webm|woff2?|ttf|zip|apk|exe|ipa|wasm)$/i;

/** Accept 里有没有 q > 0 的 text/markdown。浏览器从不发它，出现即表示对方要 Markdown。 */
export function wantsMarkdown(request: Request): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  const accept = request.headers.get('accept');
  if (!accept) return false;
  for (const part of accept.split(',')) {
    const [type, ...params] = part.split(';').map((s) => s.trim().toLowerCase());
    if (type !== 'text/markdown') continue;
    const q = params.find((p) => p.startsWith('q='));
    if (!q) return true;
    const value = Number(q.slice(2));
    return Number.isFinite(value) && value > 0;
  }
  return false;
}

/** 页面路径 → Markdown 副本的路径；不是页面则为 null。 */
export function markdownPath(pathname: string): string | null {
  if (pathname.startsWith('/.well-known/') || pathname.startsWith('/__')) return null;
  if (STATIC_EXT.test(pathname)) return null;
  return pathname.endsWith('/') ? pathname + 'index.md' : pathname + '.md';
}

/** 粗估 token 数（约 4 个字符一个；CJK 偏低估，只作量级参考）。 */
function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * 取该页的 Markdown 副本。没有副本（404）、源站回的不是 Markdown、或两个源都挂了时返回 null，
 * 调用方照常回 HTML。
 */
export async function handleMarkdown(request: Request, deps: SiteDeps): Promise<Response | null> {
  const url = new URL(request.url);
  const path = markdownPath(url.pathname);
  if (path === null) return null;
  const mdUrl = new URL(url.toString());
  mdUrl.pathname = path;
  mdUrl.search = '';
  const res = await handleSite(new Request(mdUrl.toString(), { method: request.method, headers: request.headers }), deps);
  const type = res.headers.get('content-type') ?? '';
  // Pages 对未知路径可能回 HTML（SPA 兜底 / 404 页）：只认 200 且不是 HTML 的响应。
  if (res.status !== 200 || type.includes('text/html')) {
    // 不 await：handleSite 为陈旧兜底 clone 过这个响应时，tee 出来的一支要等另一支也结束才算取消完。
    void res.body?.cancel().catch(() => {});
    return null;
  }
  const headers = new Headers(res.headers);
  headers.set('content-type', 'text/markdown; charset=utf-8');
  headers.set('vary', 'Accept');
  headers.set('link', `<https://${deps.settings.canonicalHost}${url.pathname}>; rel="canonical"`);
  headers.delete('content-length');
  headers.delete('etag');
  if (request.method === 'HEAD') return new Response(null, { status: 200, headers });
  const text = await res.text();
  headers.set('x-markdown-tokens', String(estimateTokens(text)));
  return new Response(text, { status: 200, headers });
}

/** HTML 响应加发现链接与 `Vary: Accept`；其它响应原样返回。 */
export function withAgentHeaders(res: Response): Response {
  const type = res.headers.get('content-type') ?? '';
  if (res.status !== 200 || !type.includes('text/html')) return res;
  const headers = new Headers(res.headers);
  for (const link of AGENT_LINKS) headers.append('link', link);
  const vary = headers.get('vary');
  if (!vary) headers.set('vary', 'Accept');
  else if (!/(^|,)\s*accept\s*(,|$)/i.test(vary)) headers.set('vary', vary + ', Accept');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

/** 站点页面入口：先试 Markdown 协商，否则照常回页面并补 agent 发现头。 */
export async function handleSiteForAgents(request: Request, deps: SiteDeps): Promise<Response> {
  if (wantsMarkdown(request)) {
    const md = await handleMarkdown(request, deps);
    if (md) return md;
  }
  return withAgentHeaders(await handleSite(request, deps));
}
