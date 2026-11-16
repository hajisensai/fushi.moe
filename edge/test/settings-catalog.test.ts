import { describe, expect, it } from 'vitest';
import {
  catalogFormatOf,
  handleSettingsCatalog,
  looksLikeCatalog,
  parseCatalogChannel,
} from '../src/settings-catalog';
import { memoryCache, settings } from './fakes';

const MD = '# Fushi settings reference\n\n## Appearance\n\n| Key | Name |\n|---|---|\n| `a.b` | A |\n';
const JSON_BODY = JSON.stringify({ schema: 1, count: 1, settings: [{ key: 'a.b' }] });
const RAW = 'https://raw.githubusercontent.com/owner/repo/update-manifest/settings-catalog-';

/** 按 URL 编排的假 fetch；没编排的 URL 回 404（raw.githubusercontent.com 对不存在的文件就是 404）。 */
function upstream(routes: Record<string, () => Response>) {
  const calls: string[] = [];
  const fn = (async function (this: unknown, input: Request | string) {
    if (this !== undefined && this !== globalThis) {
      throw new TypeError('Illegal invocation: function called with incorrect `this` reference.');
    }
    const url = typeof input === 'string' ? input : input.url;
    calls.push(url);
    const handler = routes[url];
    return handler ? handler() : new Response('404: Not Found', { status: 404 });
  }) as typeof fetch;
  return { fn, calls };
}

function get(path: string, fetcher: typeof fetch, cache?: Cache, method = 'GET') {
  const format = catalogFormatOf(new URL('https://fushi.moe' + path).pathname)!;
  return handleSettingsCatalog(new Request('https://fushi.moe' + path, { method }), format, {
    settings: settings({ ghRepo: 'owner/repo' }),
    fetcher,
    cache,
  });
}

describe('settings catalog', () => {
  it('只认 /settings.md 与 /settings.json', () => {
    expect(catalogFormatOf('/settings.md')).toBe('md');
    expect(catalogFormatOf('/settings.json')).toBe('json');
    expect(catalogFormatOf('/settings')).toBeNull();
    expect(catalogFormatOf('/faq/settings.md')).toBeNull();
  });

  it('channel 参数：缺省自动，只收 stable / debug', () => {
    expect(parseCatalogChannel(null)).toBe('auto');
    expect(parseCatalogChannel('')).toBe('auto');
    expect(parseCatalogChannel('debug')).toBe('debug');
    expect(parseCatalogChannel('beta')).toBeNull();
  });

  it('形状校验：错误页、空目录、旧格式版本都不算目录', () => {
    expect(looksLikeCatalog(MD, 'md')).toBe(true);
    expect(looksLikeCatalog('<html>rate limited</html>', 'md')).toBe(false);
    expect(looksLikeCatalog(JSON_BODY, 'json')).toBe(true);
    expect(looksLikeCatalog(JSON.stringify({ schema: 1, settings: [] }), 'json')).toBe(false);
    expect(looksLikeCatalog(JSON.stringify({ schema: 2, settings: [{}] }), 'json')).toBe(false);
    expect(looksLikeCatalog('{', 'json')).toBe(false);
  });

  it('默认给正式版那份，带对的 Content-Type、CORS 与通道头', async () => {
    const { fn, calls } = upstream({
      [RAW + 'stable.md']: () => new Response(MD),
      [RAW + 'debug.md']: () => new Response(MD + 'debug'),
    });
    const res = await get('/settings.md', fn);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('cache-control')).toBe('public, max-age=600');
    expect(res.headers.get('x-fushi-settings-channel')).toBe('stable');
    expect(await res.text()).toBe(MD);
    expect(calls).toEqual([RAW + 'stable.md']);
  });

  it('正式版那份还没发布过（404）时退回调试版', async () => {
    const { fn, calls } = upstream({ [RAW + 'debug.json']: () => new Response(JSON_BODY) });
    const res = await get('/settings.json', fn);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
    expect(res.headers.get('x-fushi-settings-channel')).toBe('debug');
    expect(await res.json()).toEqual(JSON.parse(JSON_BODY));
    expect(calls).toEqual([RAW + 'stable.json', RAW + 'debug.json']);
  });

  it('正式版回源 5xx 不拿调试版顶替：没有陈旧副本就 503', async () => {
    const { fn, calls } = upstream({
      [RAW + 'stable.md']: () => new Response('boom', { status: 502 }),
      [RAW + 'debug.md']: () => new Response(MD),
    });
    const res = await get('/settings.md', fn);
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(calls).toEqual([RAW + 'stable.md']);
  });

  it('显式 ?channel=debug 只取调试版；不认识的通道 404 且不回源', async () => {
    const { fn, calls } = upstream({
      [RAW + 'stable.md']: () => new Response(MD),
      [RAW + 'debug.md']: () => new Response(MD + 'debug'),
    });
    const res = await get('/settings.md?channel=debug', fn);
    expect(res.headers.get('x-fushi-settings-channel')).toBe('debug');
    expect(await res.text()).toBe(MD + 'debug');
    expect(calls).toEqual([RAW + 'debug.md']);

    const unknown = await get('/settings.md?channel=beta', fn);
    expect(unknown.status).toBe(404);
    expect(calls).toHaveLength(1);
  });

  it('第二次读边缘缓存；回源坏掉后给陈旧副本并标记', async () => {
    let healthy = true;
    const { fn, calls } = upstream({
      [RAW + 'stable.md']: () => (healthy ? new Response(MD) : new Response('down', { status: 503 })),
    });
    const cache = memoryCache();
    await get('/settings.md', fn, cache);
    const cached = await get('/settings.md', fn, cache);
    expect(await cached.text()).toBe(MD);
    expect(calls).toHaveLength(1);

    healthy = false;
    cache.drop('https://settings-catalog.fushi.invalid/fresh/');
    const stale = await get('/settings.md', fn, cache);
    expect(stale.status).toBe(200);
    expect(stale.headers.get('x-fushi-settings')).toBe('stale');
    expect(stale.headers.get('cache-control')).toBe('public, max-age=60');
    expect(await stale.text()).toBe(MD);
  });

  it('上游给了不像目录的 200（错误页）不缓存、不外发', async () => {
    const { fn } = upstream({ [RAW + 'stable.md']: () => new Response('<html>oops</html>') });
    const cache = memoryCache();
    const res = await get('/settings.md', fn, cache);
    expect(res.status).toBe(503);
    expect(cache.keys()).toEqual([]);
  });

  it('HEAD 不带正文；其它方法 405', async () => {
    const { fn } = upstream({ [RAW + 'stable.md']: () => new Response(MD) });
    const head = await get('/settings.md', fn, undefined, 'HEAD');
    expect(head.status).toBe(200);
    expect(await head.text()).toBe('');
    const post = await get('/settings.md', fn, undefined, 'POST');
    expect(post.status).toBe(405);
  });
});
