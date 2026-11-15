import { describe, expect, it } from 'vitest';
import { AGENT_LINKS, handleSiteForAgents, markdownPath, wantsMarkdown, withAgentHeaders } from '../src/agent';
import type { SiteDeps } from '../src/site';
import { memoryCache, settings, store } from './fakes';

const HTML = { 'content-type': 'text/html; charset=utf-8' };
const MD = { 'content-type': 'text/markdown; charset=utf-8', etag: '"x"' };

/** 按「主机 + 路径」编排的假源站；没列出的路径回 HTML 的 404。 */
function deps(routes: Record<string, () => Response>): { deps: SiteDeps; calls: string[] } {
  const calls: string[] = [];
  const fetcher = (async (input: Request | string) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    calls.push(url.hostname + url.pathname);
    const handler = routes[url.hostname + url.pathname];
    return handler ? handler() : new Response('<h1>404</h1>', { status: 404, headers: HTML });
  }) as typeof fetch;
  return { deps: { settings: settings(), health: store(), fetcher, rand: () => 0, staleCache: memoryCache() }, calls };
}

const get = (path: string, accept?: string, method = 'GET'): Request =>
  new Request('https://fushi.moe' + path, { method, headers: accept ? { accept } : {} });

describe('wantsMarkdown', () => {
  it('Accept 里有 q>0 的 text/markdown 才算', () => {
    expect(wantsMarkdown(get('/', 'text/markdown'))).toBe(true);
    expect(wantsMarkdown(get('/', 'text/html;q=0.8, Text/Markdown ; q=0.9'))).toBe(true);
    expect(wantsMarkdown(get('/', 'text/markdown;q=0'))).toBe(false);
    expect(wantsMarkdown(get('/', 'text/html,application/xhtml+xml,*/*;q=0.8'))).toBe(false);
    expect(wantsMarkdown(get('/'))).toBe(false);
    expect(wantsMarkdown(get('/', 'text/markdown', 'POST'))).toBe(false);
  });
});

describe('markdownPath', () => {
  it('页面路径映射到同名 .md，目录映射到 index.md', () => {
    expect(markdownPath('/')).toBe('/index.md');
    expect(markdownPath('/zh-cn/')).toBe('/zh-cn/index.md');
    expect(markdownPath('/download')).toBe('/download.md');
    // 常见问题的译文路径本身带点，不能当成静态文件
    expect(markdownPath('/faq/anki.en')).toBe('/faq/anki.en.md');
    expect(markdownPath('/faq/anki.zh-HK')).toBe('/faq/anki.zh-HK.md');
  });

  it('静态文件与内部路径不找副本', () => {
    for (const p of ['/site.js', '/fushi-icon.png', '/llms.txt', '/index.md', '/__build.json', '/.well-known/api-catalog']) {
      expect(markdownPath(p)).toBeNull();
    }
  });
});

describe('handleSiteForAgents', () => {
  it('要 Markdown 且副本存在：回 text/markdown，带 token 估算、Vary 与 canonical', async () => {
    const { deps: d, calls } = deps({
      'cf.example/download.md': () => new Response('# Download\n\nbody text', { headers: MD }),
    });
    const res = await handleSiteForAgents(get('/download?x=1', 'text/markdown, text/html;q=0.5'), d);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(res.headers.get('vary')).toBe('Accept');
    expect(res.headers.get('x-markdown-tokens')).toBe('6');
    expect(res.headers.get('link')).toBe('<https://fushi.moe/download>; rel="canonical"');
    expect(res.headers.get('x-fushi-origin')).toBe('cf');
    expect(res.headers.has('etag')).toBe(false);
    expect(await res.text()).toBe('# Download\n\nbody text');
    expect(calls).toEqual(['cf.example/download.md']);
  });

  it('首页取 /index.md；HEAD 不带正文', async () => {
    const { deps: d, calls } = deps({ 'cf.example/index.md': () => new Response('# Fushi', { headers: MD }) });
    const res = await handleSiteForAgents(get('/', 'text/markdown', 'HEAD'), d);
    expect(res.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(await res.text()).toBe('');
    expect(calls).toEqual(['cf.example/index.md']);
  });

  it('没有副本（源站回 404 页）：照常回 HTML，不把 404 传给 agent', async () => {
    const { deps: d, calls } = deps({ 'cf.example/privacy': () => new Response('<p>page</p>', { headers: HTML }) });
    const res = await handleSiteForAgents(get('/privacy', 'text/markdown'), d);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(await res.text()).toBe('<p>page</p>');
    expect(calls).toEqual(['cf.example/privacy.md', 'cf.example/privacy']);
  });

  it('源站对未知路径回 200 的 HTML（SPA 兜底）时也不当成 Markdown', async () => {
    const { deps: d } = deps({
      'cf.example/x.md': () => new Response('<html>fallback</html>', { headers: HTML }),
      'cf.example/x': () => new Response('<html>real</html>', { headers: HTML }),
    });
    const res = await handleSiteForAgents(get('/x', 'text/markdown'), d);
    expect(await res.text()).toBe('<html>real</html>');
  });

  it('主源挂了：Markdown 副本同样切到备源', async () => {
    const { deps: d } = deps({
      'cf.example/download.md': () => new Response('boom', { status: 502 }),
      'gh.example/fushi.moe/download.md': () => new Response('# from gh', { headers: MD }),
    });
    const res = await handleSiteForAgents(get('/download', 'text/markdown'), d);
    expect(await res.text()).toBe('# from gh');
    expect(res.headers.get('x-fushi-origin')).toBe('gh');
  });

  it('普通浏览器请求：只打一次源站，HTML 补发现链接与 Vary，保留源站已有的 Link', async () => {
    const { deps: d, calls } = deps({
      'cf.example/': () =>
        new Response('<p>home</p>', { headers: { ...HTML, link: '<https://fonts.googleapis.com>; rel="preconnect"', vary: 'Accept-Encoding' } }),
    });
    const res = await handleSiteForAgents(get('/', 'text/html,*/*;q=0.8'), d);
    expect(calls).toEqual(['cf.example/']);
    const link = res.headers.get('link') ?? '';
    expect(link).toContain('rel="preconnect"');
    for (const l of AGENT_LINKS) expect(link).toContain(l);
    expect(link).toContain('</.well-known/api-catalog>; rel="api-catalog"');
    expect(res.headers.get('vary')).toBe('Accept-Encoding, Accept');
    expect(await res.text()).toBe('<p>home</p>');
  });
});

describe('withAgentHeaders', () => {
  it('非 HTML、非 200 的响应原样返回', () => {
    const json = new Response('{}', { headers: { 'content-type': 'application/json' } });
    expect(withAgentHeaders(json)).toBe(json);
    const notFound = new Response('<h1>404</h1>', { status: 404, headers: HTML });
    expect(withAgentHeaders(notFound)).toBe(notFound);
  });

  it('Vary 已含 Accept 时不重复', () => {
    const res = withAgentHeaders(new Response('x', { headers: { ...HTML, vary: 'accept, Accept-Encoding' } }));
    expect(res.headers.get('vary')).toBe('accept, Accept-Encoding');
  });
});
