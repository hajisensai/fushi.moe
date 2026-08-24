import { describe, expect, it } from 'vitest';
import { MemoryHealthStore } from '../src/breaker';
import { handleDownload } from '../src/downloads';
import { isOriginFailure, pickOrder, type OriginName } from '../src/origins';
import { handleSite } from '../src/site';
import { fakeFetch, fakeR2, settings, store } from './fakes';

const ORIGINS = [
  { name: 'cf' as OriginName, host: 'cf.example' },
  { name: 'gh' as OriginName, host: 'gh.example' },
];
const NONE = new Set<OriginName>();

describe('pickOrder', () => {
  it('权重命中时主源在前，未命中时反过来', () => {
    expect(pickOrder(ORIGINS, NONE, 100, 0.5).map((o) => o.name)).toEqual(['cf', 'gh']);
    expect(pickOrder(ORIGINS, NONE, 0, 0.5).map((o) => o.name)).toEqual(['gh', 'cf']);
  });

  it('熔断的源被移到最后，而不是被删掉', () => {
    const order = pickOrder(ORIGINS, new Set<OriginName>(['cf']), 100, 0);
    expect(order.map((o) => o.name)).toEqual(['gh', 'cf']);
  });

  it('两个源都熔断时保持基准顺序——这就是半开探测', () => {
    const order = pickOrder(ORIGINS, new Set<OriginName>(['cf', 'gh']), 100, 0);
    expect(order.map((o) => o.name)).toEqual(['cf', 'gh']);
  });
});

describe('isOriginFailure', () => {
  it('只有 5xx 算源站故障', () => {
    expect(isOriginFailure(500)).toBe(true);
    expect(isOriginFailure(503)).toBe(true);
    // 404 换个源还是 404，切过去只是白打一次请求、还会把好源标脏
    expect(isOriginFailure(404)).toBe(false);
    expect(isOriginFailure(200)).toBe(false);
    expect(isOriginFailure(301)).toBe(false);
  });
});

function siteDeps(routes: Record<string, () => Response | Promise<Response>>, health = store()) {
  const fetcher = fakeFetch(routes);
  return {
    deps: { settings: settings(), health, fetcher, rand: () => 0 },
    fetcher,
    health,
  };
}

describe('handleSite', () => {
  it('主源正常时直接返回，并标记来源', async () => {
    const { deps, fetcher } = siteDeps({
      'cf.example': () => new Response('from cf'),
      'gh.example': () => new Response('from gh'),
    });
    const res = await handleSite(new Request('https://fushi.moe/'), deps);
    expect(await res.text()).toBe('from cf');
    expect(res.headers.get('x-fushi-origin')).toBe('cf');
    expect(fetcher.calls).toHaveLength(1);
  });

  it('主源 5xx 时切到备源并熔断主源', async () => {
    const { deps, health } = siteDeps({
      'cf.example': () => new Response('boom', { status: 500 }),
      'gh.example': () => new Response('from gh'),
    });
    const res = await handleSite(new Request('https://fushi.moe/'), deps);
    expect(await res.text()).toBe('from gh');
    expect(res.headers.get('x-fushi-origin')).toBe('gh');
    expect(await health.isDown('cf')).toBe(true);
  });

  it('主源网络异常时同样切到备源', async () => {
    const { deps } = siteDeps({
      'cf.example': () => {
        throw new TypeError('connect failed');
      },
      'gh.example': () => new Response('from gh'),
    });
    const res = await handleSite(new Request('https://fushi.moe/'), deps);
    expect(res.headers.get('x-fushi-origin')).toBe('gh');
  });

  it('主源已熔断时不再白打一次，直接走备源', async () => {
    const health = store();
    await health.markDown('cf', 60);
    const { deps, fetcher } = siteDeps(
      {
        'cf.example': () => new Response('from cf'),
        'gh.example': () => new Response('from gh'),
      },
      health,
    );
    const res = await handleSite(new Request('https://fushi.moe/'), deps);
    expect(await res.text()).toBe('from gh');
    expect(fetcher.calls).toHaveLength(1);
    expect(fetcher.calls[0]).toContain('gh.example');
  });

  it('成功一次就解除该源的熔断', async () => {
    const health = store();
    await health.markDown('cf', 60);
    expect(await health.isDown('cf')).toBe(true);
    const { deps } = siteDeps(
      {
        'cf.example': () => new Response('from cf'),
        'gh.example': () => new Response('from gh'),
      },
      health,
    );
    // gh 成功后 cf 仍是熔断的；等 cf 半开再成功才该解除
    await handleSite(new Request('https://fushi.moe/'), deps);
    expect(await health.isDown('gh')).toBe(false);
  });

  it('两个源都挂时给 503，而不是把错误页当正常内容缓存', async () => {
    const { deps } = siteDeps({
      'cf.example': () => new Response('x', { status: 502 }),
      'gh.example': () => new Response('y', { status: 500 }),
    });
    const res = await handleSite(new Request('https://fushi.moe/'), deps);
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('x-fushi-origin')).toBe('none');
  });

  it('把源站重定向里的主机名改回规范域，不泄漏内部地址', async () => {
    const { deps } = siteDeps({
      'cf.example': () =>
        new Response(null, { status: 301, headers: { location: 'https://cf.example/guide/' } }),
      'gh.example': () => new Response('from gh'),
    });
    const res = await handleSite(new Request('https://fushi.moe/guide'), deps);
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://fushi.moe/guide/');
  });

  it('指向站外的重定向原样透传', async () => {
    const { deps } = siteDeps({
      'cf.example': () =>
        new Response(null, { status: 302, headers: { location: 'https://example.org/x' } }),
      'gh.example': () => new Response('from gh'),
    });
    const res = await handleSite(new Request('https://fushi.moe/out'), deps);
    expect(res.headers.get('location')).toBe('https://example.org/x');
  });

  it('404 不触发切源', async () => {
    const { deps, fetcher, health } = siteDeps({
      'cf.example': () => new Response('nope', { status: 404 }),
      'gh.example': () => new Response('from gh'),
    });
    const res = await handleSite(new Request('https://fushi.moe/missing'), deps);
    expect(res.status).toBe(404);
    expect(fetcher.calls).toHaveLength(1);
    expect(await health.isDown('cf')).toBe(false);
  });
});

const RELEASE_JSON = JSON.stringify({
  tag_name: 'v1.2.3',
  published_at: '2026-01-01T00:00:00Z',
  assets: [
    { name: 'fushi-1.2.3-arm64-v8a.apk', size: 100, browser_download_url: 'https://github.com/owner/repo/releases/download/v1.2.3/fushi-1.2.3-arm64-v8a.apk' },
    { name: 'fushi-1.2.3-windows-setup.exe', size: 200, browser_download_url: 'https://github.com/owner/repo/releases/download/v1.2.3/fushi-1.2.3-windows-setup.exe' },
  ],
});

const MIRROR_MANIFEST = JSON.stringify({
  tag: 'v1.2.3',
  publishedAt: '2026-01-01T00:00:00Z',
  assets: [
    { name: 'fushi-1.2.3-arm64-v8a.apk', size: 100, url: 'https://github.com/owner/repo/releases/download/v1.2.3/fushi-1.2.3-arm64-v8a.apk' },
  ],
});

function dlDeps(opts: {
  ghApiUp?: boolean;
  mirror?: R2Bucket;
  health?: MemoryHealthStore;
}) {
  const health = opts.health ?? store();
  const fetcher = fakeFetch({
    'api.github.com': () =>
      opts.ghApiUp === false
        ? new Response('down', { status: 503 })
        : new Response(RELEASE_JSON, { headers: { 'content-type': 'application/json' } }),
  });
  return { settings: settings(), health, fetcher, mirror: opts.mirror };
}

describe('handleDownload', () => {
  it('镜像里有就从镜像出，不打 GitHub', async () => {
    const mirror = fakeR2({ 'releases/v1.2.3/fushi-1.2.3-arm64-v8a.apk': 'APKBYTES' });
    const res = await handleDownload(
      new Request('https://dl.fushi.moe/latest/android-arm64'),
      dlDeps({ mirror }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('x-fushi-mirror')).toBe('r2');
    expect(await res.text()).toBe('APKBYTES');
  });

  it('镜像里没有就 302 到 GitHub 直链', async () => {
    const mirror = fakeR2({});
    const res = await handleDownload(
      new Request('https://dl.fushi.moe/latest/android-arm64'),
      dlDeps({ mirror }),
    );
    expect(res.status).toBe(302);
    expect(res.headers.get('x-fushi-mirror')).toBe('github');
    expect(res.headers.get('location')).toContain('github.com/owner/repo/releases/download/');
  });

  it('完全没绑镜像时同样回退 GitHub', async () => {
    const res = await handleDownload(
      new Request('https://dl.fushi.moe/latest/windows'),
      dlDeps({}),
    );
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('fushi-1.2.3-windows-setup.exe');
  });

  it('GitHub API 挂了就用镜像里的清单副本——这是「GitHub 挂了下载还活着」那一环', async () => {
    const mirror = fakeR2({
      'manifest.json': MIRROR_MANIFEST,
      'releases/v1.2.3/fushi-1.2.3-arm64-v8a.apk': 'APKBYTES',
    });
    const res = await handleDownload(
      new Request('https://dl.fushi.moe/latest/android-arm64'),
      dlDeps({ ghApiUp: false, mirror }),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('APKBYTES');
  });

  it('两边清单都拿不到时退回 Releases 页面，而不是报错', async () => {
    const res = await handleDownload(
      new Request('https://dl.fushi.moe/latest/android-arm64'),
      dlDeps({ ghApiUp: false }),
    );
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://github.com/owner/repo/releases/latest');
  });

  it('R2 读抛异常时熔断镜像并回退 GitHub', async () => {
    const health = store();
    const mirror = fakeR2({}, { throwOnGet: true });
    const res = await handleDownload(
      new Request('https://dl.fushi.moe/latest/android-arm64'),
      dlDeps({ mirror, health }),
    );
    expect(res.status).toBe(302);
    expect(await health.isDown('r2')).toBe(true);
  });

  it('未知槽位给 404，不瞎猜', async () => {
    const res = await handleDownload(
      new Request('https://dl.fushi.moe/latest/nintendo-switch'),
      dlDeps({}),
    );
    expect(res.status).toBe(404);
  });

  it('/api/latest 给出全部槽位与版本号', async () => {
    const res = await handleDownload(new Request('https://dl.fushi.moe/api/latest'), dlDeps({}));
    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    const body = (await res.json()) as { tag: string; slots: Record<string, unknown> };
    expect(body.tag).toBe('v1.2.3');
    expect(body.slots['android-arm64']).toBeTruthy();
    // 这个版本没发 macOS 包，就该是 null 而不是编一个链接出来
    expect(body.slots['macos']).toBeNull();
  });

  it('按版本取任意文件名也能走镜像', async () => {
    const mirror = fakeR2({ 'releases/v1.0.0/old.apk': 'OLDBYTES' });
    const res = await handleDownload(
      new Request('https://dl.fushi.moe/v/v1.0.0/old.apk'),
      dlDeps({ mirror }),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('OLDBYTES');
  });

  it('根路径把人送回下载页', async () => {
    const res = await handleDownload(new Request('https://dl.fushi.moe/'), dlDeps({}));
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://fushi.moe/download');
  });
});

describe('熔断冷却', () => {
  it('冷却到期后自动恢复可用', async () => {
    let now = 1_000_000;
    const health = new MemoryHealthStore(() => now);
    await health.markDown('cf', 60);
    expect(await health.isDown('cf')).toBe(true);
    now += 59_000;
    expect(await health.isDown('cf')).toBe(true);
    now += 2_000;
    expect(await health.isDown('cf')).toBe(false);
  });
});
