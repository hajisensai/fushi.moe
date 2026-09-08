import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
// @ts-expect-error 站点侧的 .mjs 没有类型声明；这里只取一个常量做「两边同值」守卫。
import { DEFAULT_PROBE_BYTES } from '../../.vitepress/theme/chunked-download.mjs';
import { handleDownload } from '../src/downloads';
import {
  channelOfTag,
  DownloadLedger,
  githubSummaryFromReleases,
  handleDownloadStats,
  isDownloadStart,
  MemoryDownloadCounter,
  PROBE_BYTES,
  slotOf,
  type DownloadCounter,
  type DownloadEvent,
  type SiteDownloadSummary,
  type SqlLike,
} from '../src/download-stats';
import { fakeFetch, fakeR2, settings, store } from './fakes';

/** DO 的 ctx.storage.sql 与这里的 node:sqlite 收敛到同一个最小形状（SqlLike）。 */
function sqlite(): SqlLike {
  const db = new DatabaseSync(':memory:');
  return {
    exec(query: string, ...bindings: unknown[]) {
      const statement = db.prepare(query);
      if (/^\s*select/i.test(query)) return { toArray: () => statement.all(...bindings) };
      statement.run(...bindings);
      return { toArray: () => [] };
    },
  };
}

function memoryCache(): Cache & { keys: () => string[] } {
  const entries = new Map<string, Response>();
  return {
    async match(request: Request | string) {
      const url = typeof request === 'string' ? request : request.url;
      return entries.get(url)?.clone();
    },
    async put(request: Request | string, response: Response) {
      const url = typeof request === 'string' ? request : request.url;
      entries.set(url, response.clone());
    },
    keys: () => [...entries.keys()],
  } as unknown as Cache & { keys: () => string[] };
}

const get = (url: string, headers: Record<string, string> = {}, method = 'GET') =>
  new Request(url, { method, headers });

describe('isDownloadStart：什么算一次下载开始', () => {
  it('探测长度与分片下载器同值——两边任何一侧改了都要一起改', () => {
    expect(PROBE_BYTES).toBe(DEFAULT_PROBE_BYTES);
  });

  it('普通 GET（<a> 点击 / curl / 更新器）算', () => {
    expect(isDownloadStart(get('https://x/latest/windows'))).toBe(true);
  });

  it('HEAD 不算', () => {
    expect(isDownloadStart(get('https://x/latest/windows', {}, 'HEAD'))).toBe(false);
  });

  it('从 0 开始的 Range 算：分片第一片、bytes=0- 整文件、aria2 第一条连接', () => {
    expect(isDownloadStart(get('https://x/v/t/n', { range: 'bytes=0-8388607' }))).toBe(true);
    expect(isDownloadStart(get('https://x/v/t/n', { range: 'bytes=0-' }))).toBe(true);
    expect(isDownloadStart(get('https://x/v/t/n', { range: 'bytes=0-1048575' }))).toBe(true);
  });

  it('恰好探测长度（64 KiB）的那次不算：那是在问「来源活着吗」', () => {
    expect(isDownloadStart(get('https://x/v/t/n', { range: 'bytes=0-' + (PROBE_BYTES - 1) }))).toBe(false);
  });

  it('从别处开始的 Range 不算：第 N 片、续传、多线程下载器的其它连接', () => {
    expect(isDownloadStart(get('https://x/v/t/n', { range: 'bytes=8388608-16777215' }))).toBe(false);
    expect(isDownloadStart(get('https://x/v/t/n', { range: 'bytes=1-' }))).toBe(false);
  });

  it('多段 / 后缀 Range 不算', () => {
    expect(isDownloadStart(get('https://x/v/t/n', { range: 'bytes=0-1,5-9' }))).toBe(false);
    expect(isDownloadStart(get('https://x/v/t/n', { range: 'bytes=-500' }))).toBe(false);
  });
});

describe('slotOf / channelOfTag', () => {
  it('资产名按 SLOTS 归槽位，认不出的归 other', () => {
    expect(slotOf('fushi-2.3.0-arm64-v8a.apk')).toBe('android-arm64');
    expect(slotOf('fushi-2.3.0-windows-setup.exe')).toBe('windows');
    expect(slotOf('fushi-2.3.0-debug.13529-abc1234-debug.apk')).toBe('android-universal');
    expect(slotOf('bridge-2.1.1-x86_64.apk')).toBe('bridge-x64');
    expect(slotOf('Source code (zip)')).toBe('other');
  });

  it('tag 形状 → 通道', () => {
    expect(channelOfTag('v2.3.0')).toBe('stable');
    expect(channelOfTag('v2.3.0-beta.13529')).toBe('beta');
    expect(channelOfTag('v2.3.0-debug.13529+abc1234')).toBe('debug');
    expect(channelOfTag('debug-rolling')).toBe('debug');
  });
});

describe('DownloadLedger：SQLite 账本', () => {
  const ev = (over: Partial<DownloadEvent> = {}): DownloadEvent => ({
    channel: 'stable',
    tag: 'v2.3.0',
    slot: 'windows',
    source: 'r2',
    ...over,
  });

  it('同键累加、异键分行；served 只算 Worker 自己吐字节的两种出口', () => {
    const ledger = new DownloadLedger(sqlite());
    ledger.record(ev(), '2026-09-08');
    ledger.record(ev(), '2026-09-08');
    ledger.record(ev({ source: 'github' }), '2026-09-08');
    ledger.record(ev({ slot: 'macos', source: 'github-edge' }), '2026-09-07');
    ledger.record(ev({ channel: 'debug', tag: 'debug-rolling', slot: 'android-universal' }), '2026-08-01');

    const s = ledger.summary('2026-09-08');
    expect(s.total).toBe(5);
    expect(s.served).toBe(4);
    expect(s.bySource).toEqual({ r2: 3, github: 1, 'github-edge': 1 });
    expect(s.bySlot).toEqual({ windows: 3, macos: 1, 'android-universal': 1 });
    expect(s.byChannel).toEqual({ stable: 4, debug: 1 });
    expect(s.byTag).toEqual({ 'v2.3.0': 4, 'debug-rolling': 1 });
  });

  it('byDay 只给最近 30 天，按日期升序', () => {
    const ledger = new DownloadLedger(sqlite());
    ledger.record(ev(), '2026-08-10'); // 30 天窗口（含今天）的第一天
    ledger.record(ev(), '2026-08-09'); // 窗口外
    ledger.record(ev(), '2026-09-08');
    ledger.record(ev(), '2026-09-01');
    const s = ledger.summary('2026-09-08');
    expect(Object.keys(s.byDay)).toEqual(['2026-08-10', '2026-09-01', '2026-09-08']);
    expect(s.total).toBe(4);
  });

  it('空账本：全 0、空表，不是 null/undefined', () => {
    const s = new DownloadLedger(sqlite()).summary('2026-09-08');
    expect(s).toEqual<SiteDownloadSummary>({
      total: 0,
      served: 0,
      byChannel: {},
      bySlot: {},
      bySource: {},
      byTag: {},
      byDay: {},
    });
  });

  it('建表幂等：同一个库开两次不炸', () => {
    const sql = sqlite();
    new DownloadLedger(sql).record(ev(), '2026-09-08');
    expect(new DownloadLedger(sql).summary('2026-09-08').total).toBe(1);
  });
});

describe('下载路由计数：三种出口各计一次，探测 / HEAD / 续传 / 404 不计', () => {
  const MANIFEST = {
    tag: 'v2.3.0',
    channel: 'stable',
    version: '2.3.0',
    publishedAt: '2026-09-08T00:00:00Z',
    assets: [
      {
        name: 'fushi-2.3.0-windows-setup.exe',
        size: 10,
        browser_download_url: 'https://github.com/owner/repo/releases/download/v2.3.0/fushi-2.3.0-windows-setup.exe',
      },
      {
        name: 'fushi-2.3.0-macos.zip',
        size: 10,
        browser_download_url: 'https://github.com/owner/repo/releases/download/v2.3.0/fushi-2.3.0-macos.zip',
      },
    ],
  };
  const manifestJson = () =>
    new Response(JSON.stringify(MANIFEST), { headers: { 'content-type': 'application/json' } });

  function deps(counter: DownloadCounter | undefined, mirror: Record<string, string> = {}) {
    let waited: Promise<unknown>[] = [];
    const d = {
      settings: settings(),
      health: store(),
      fetcher: fakeFetch({
        'raw.example': manifestJson,
        'github.com': () =>
          new Response('0123456789', {
            status: 200,
            headers: { 'content-type': 'application/octet-stream', 'content-length': '10' },
          }),
      }),
      mirror: fakeR2(mirror),
      counter,
      waitUntil: (p: Promise<unknown>) => {
        waited.push(p.catch(() => {}));
      },
    };
    return { deps: d, settle: async () => { await Promise.all(waited); waited = []; } };
  }

  const R2_WIN = { 'releases/v2.3.0/fushi-2.3.0-windows-setup.exe': '0123456789' };

  it('R2 镜像命中 → source=r2，槽位 / 通道 / tag 来自清单', async () => {
    const counter = new MemoryDownloadCounter(sqlite());
    const { deps: d, settle } = deps(counter, R2_WIN);
    const res = await handleDownload(get('https://fushi.moe/latest/windows'), d);
    await settle();
    expect(res.status).toBe(200);
    expect(counter.events).toEqual([{ channel: 'stable', tag: 'v2.3.0', slot: 'windows', source: 'r2' }]);
  });

  it('没镜像 302 去 GitHub → source=github（GitHub 那边也会计，served 不含它）', async () => {
    const counter = new MemoryDownloadCounter(sqlite());
    const { deps: d, settle } = deps(counter);
    const res = await handleDownload(get('https://fushi.moe/latest/macos'), d);
    await settle();
    expect(res.status).toBe(302);
    expect(counter.events).toEqual([{ channel: 'stable', tag: 'v2.3.0', slot: 'macos', source: 'github' }]);
    expect((await counter.summary()).served).toBe(0);
  });

  it('?src=gh 边缘代理成功 → source=github-edge；版本化路径的槽位 / 通道从文件名与 tag 推', async () => {
    const counter = new MemoryDownloadCounter(sqlite());
    const { deps: d, settle } = deps(counter);
    const res = await handleDownload(
      get('https://fushi.moe/v/v2.3.0/fushi-2.3.0-macos.zip?src=gh', { range: 'bytes=0-8388607' }),
      d,
    );
    await settle();
    expect(res.status).toBe(200);
    expect(counter.events).toEqual([{ channel: 'stable', tag: 'v2.3.0', slot: 'macos', source: 'github-edge' }]);
  });

  it('?src=gh 边缘代理失败（502）不计', async () => {
    const counter = new MemoryDownloadCounter(sqlite());
    const { deps: d, settle } = deps(counter);
    d.fetcher = fakeFetch({
      'raw.example': manifestJson,
      'github.com': () => new Response('down', { status: 503 }),
    });
    const res = await handleDownload(get('https://fushi.moe/v/v2.3.0/fushi-2.3.0-macos.zip?src=gh'), d);
    await settle();
    expect(res.status).toBe(502);
    expect(counter.events).toEqual([]);
  });

  it('?src=r2 点名镜像但没镜像 → 404 不计', async () => {
    const counter = new MemoryDownloadCounter(sqlite());
    const { deps: d, settle } = deps(counter);
    const res = await handleDownload(get('https://fushi.moe/v/v2.3.0/fushi-2.3.0-macos.zip?src=r2'), d);
    await settle();
    expect(res.status).toBe(404);
    expect(counter.events).toEqual([]);
  });

  it('分片下载器一次点击 = 探测 + 第一片 + 后续片：只计一次', async () => {
    const counter = new MemoryDownloadCounter(sqlite());
    const { deps: d, settle } = deps(counter, R2_WIN);
    const url = 'https://fushi.moe/v/v2.3.0/fushi-2.3.0-windows-setup.exe?src=r2';
    await handleDownload(get(url, { range: 'bytes=0-' + (PROBE_BYTES - 1) }), d);
    await handleDownload(get(url, { range: 'bytes=0-4' }), d);
    await handleDownload(get(url, { range: 'bytes=5-9' }), d);
    await handleDownload(get(url, {}, 'HEAD'), d);
    await settle();
    expect(counter.events).toHaveLength(1);
    expect(counter.events[0]?.source).toBe('r2');
  });

  it('调试通道的 tag 归 debug', async () => {
    const counter = new MemoryDownloadCounter(sqlite());
    const { deps: d, settle } = deps(counter);
    d.fetcher = fakeFetch({
      'raw.example': manifestJson,
      'github.com': () => new Response('x', { status: 200 }),
    });
    await handleDownload(
      get('https://fushi.moe/v/debug-rolling/fushi-2.3.0-debug.13529-abc1234-debug.apk?src=gh'),
      d,
    );
    await settle();
    expect(counter.events).toEqual([
      { channel: 'debug', tag: 'debug-rolling', slot: 'android-universal', source: 'github-edge' },
    ]);
  });

  it('没配计数器：下载路由照常，只是不计', async () => {
    const { deps: d } = deps(undefined, R2_WIN);
    const res = await handleDownload(get('https://fushi.moe/latest/windows'), d);
    expect(res.status).toBe(200);
  });

  it('计数器抛异常不影响下载应答', async () => {
    const broken: DownloadCounter = {
      record: async () => {
        throw new Error('do down');
      },
      summary: async () => {
        throw new Error('do down');
      },
    };
    const { deps: d, settle } = deps(broken, R2_WIN);
    const res = await handleDownload(get('https://fushi.moe/latest/windows'), d);
    await settle();
    expect(res.status).toBe(200);
  });
});

describe('githubSummaryFromReleases', () => {
  it('把各 release 资产的 download_count 按 tag 与槽位汇总', () => {
    const s = githubSummaryFromReleases([
      {
        tag_name: 'v2.3.0',
        assets: [
          { name: 'fushi-2.3.0-windows-setup.exe', download_count: 120 },
          { name: 'fushi-2.3.0-arm64-v8a.apk', download_count: 300 },
        ],
      },
      { tag_name: 'debug-rolling', assets: [{ name: 'fushi-2.3.0-debug.1-a-debug.apk', download_count: 7 }] },
      { tag_name: 'v2.2.4', assets: [] },
    ]);
    expect(s).toEqual({
      total: 427,
      byTag: { 'v2.3.0': 420, 'debug-rolling': 7, 'v2.2.4': 0 },
      bySlot: { windows: 120, 'android-arm64': 300, 'android-universal': 7 },
    });
  });

  it('形状不对判失败，不编数字', () => {
    expect(githubSummaryFromReleases({ message: 'API rate limit exceeded' })).toBeNull();
    expect(githubSummaryFromReleases([{ tag_name: 'v1', assets: [{ name: 'a' }] }])).toBeNull();
    expect(githubSummaryFromReleases([{ assets: [] }])).toBeNull();
  });
});

describe('/api/downloads', () => {
  const RELEASES = [
    {
      tag_name: 'v2.3.0',
      assets: [{ name: 'fushi-2.3.0-windows-setup.exe', download_count: 1000 }],
    },
  ];
  const releasesJson = (body: unknown = RELEASES, status = 200) => () =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

  async function seeded(): Promise<MemoryDownloadCounter> {
    const counter = new MemoryDownloadCounter(sqlite(), () => new Date('2026-09-08T12:00:00Z'));
    await counter.record({ channel: 'stable', tag: 'v2.3.0', slot: 'windows', source: 'r2' });
    await counter.record({ channel: 'stable', tag: 'v2.3.0', slot: 'windows', source: 'r2' });
    await counter.record({ channel: 'stable', tag: 'v2.3.0', slot: 'macos', source: 'github' });
    return counter;
  }

  it('total = GitHub download_count 之和 + 站内 Worker 吐字节的下载数（302 去 GitHub 的不重复计）', async () => {
    const fetcher = fakeFetch({ 'api.github.com': releasesJson() });
    const res = await handleDownloadStats({ settings: settings(), fetcher, counter: await seeded() });
    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('cache-control')).toBe('public, max-age=60');
    const body = (await res.json()) as { total: number; site: SiteDownloadSummary; github: { total: number }; stale: boolean };
    expect(body.total).toBe(1002);
    expect(body.site.total).toBe(3);
    expect(body.site.served).toBe(2);
    expect(body.github.total).toBe(1000);
    expect(body.stale).toBe(false);
    expect(fetcher.calls).toEqual(['https://api.github.com/repos/owner/repo/releases?per_page=100']);
  });

  it('整份应答边缘缓存 60 秒：第二次既不打 GitHub 也不问计数器', async () => {
    const fetcher = fakeFetch({ 'api.github.com': releasesJson() });
    let asked = 0;
    const counter: DownloadCounter = {
      record: async () => {},
      summary: async () => {
        asked++;
        return (await (await seeded()).summary());
      },
    };
    const cache = memoryCache();
    const d = { settings: settings(), fetcher, counter, cache };
    await handleDownloadStats(d);
    const second = await handleDownloadStats(d);
    expect(second.status).toBe(200);
    expect(fetcher.calls).toHaveLength(1);
    expect(asked).toBe(1);
  });

  it('GitHub 回源失败但有陈旧副本：用陈旧值、标 stale', async () => {
    const cache = memoryCache();
    const good = fakeFetch({ 'api.github.com': releasesJson() });
    await handleDownloadStats({ settings: settings(), fetcher: good, cache, counter: await seeded() });
    // 让整份应答缓存过期（只清 summary 键，保留 GitHub 的新鲜/陈旧副本），再让新鲜副本失效。
    const entries = cache as unknown as { keys: () => string[] };
    const dropped = memoryCache();
    for (const k of entries.keys()) {
      if (k.includes('/github/stale/')) await dropped.put(new Request(k), (await cache.match(new Request(k)))!);
    }
    const bad = fakeFetch({ 'api.github.com': releasesJson({ message: 'rate limited' }, 403) });
    const res = await handleDownloadStats({ settings: settings(), fetcher: bad, cache: dropped, counter: await seeded() });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-fushi-downloads')).toBe('stale');
    const body = (await res.json()) as { total: number; stale: boolean };
    expect(body.total).toBe(1002);
    expect(body.stale).toBe(true);
  });

  it('GitHub 一次都没成功过：total 为 null，站内分布照给，页面据此不显示数字', async () => {
    const fetcher = fakeFetch({ 'api.github.com': releasesJson({ message: 'nope' }, 403) });
    const res = await handleDownloadStats({ settings: settings(), fetcher, counter: await seeded() });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { total: number | null; site: SiteDownloadSummary; github: null };
    expect(body.total).toBeNull();
    expect(body.github).toBeNull();
    expect(body.site.total).toBe(3);
  });

  it('没配计数器：total 就是 GitHub 的数', async () => {
    const fetcher = fakeFetch({ 'api.github.com': releasesJson() });
    const res = await handleDownloadStats({ settings: settings(), fetcher });
    const body = (await res.json()) as { total: number; site: null };
    expect(body.total).toBe(1000);
    expect(body.site).toBeNull();
  });

  it('两边都没有：503 + no-store', async () => {
    const fetcher = fakeFetch({ 'api.github.com': releasesJson({ message: 'nope' }, 403) });
    const res = await handleDownloadStats({ settings: settings(), fetcher });
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('计数器抛异常：GitHub 那半照给', async () => {
    const fetcher = fakeFetch({ 'api.github.com': releasesJson() });
    const broken: DownloadCounter = {
      record: async () => {},
      summary: async () => {
        throw new Error('do down');
      },
    };
    const res = await handleDownloadStats({ settings: settings(), fetcher, counter: broken });
    const body = (await res.json()) as { total: number; site: null };
    expect(res.status).toBe(200);
    expect(body.total).toBe(1000);
    expect(body.site).toBeNull();
  });
});
