import { MemoryHealthStore } from '../src/breaker';
import type { Settings } from '../src/config';

export function settings(over: Partial<Settings> = {}): Settings {
  return {
    origins: [
      { name: 'cf', host: 'cf.example', basePath: '' },
      { name: 'gh', host: 'gh.example', basePath: '/fushi.moe' },
    ],
    canonicalHost: 'fushi.moe',
    downloadPrefix: '/releases',
    cfWeight: 100,
    timeoutMs: 1000,
    cooldownS: 60,
    ghRepo: 'owner/repo',
    ghManifestUrl: 'https://raw.example/latest-stable-fushi.json',
    packRepo: 'owner/pack',
    packPrefix: '/pack',
    ...over,
  };
}

export function store(): MemoryHealthStore {
  return new MemoryHealthStore();
}

/** 按主机名编排的假 fetch，记录每次调用便于断言「有没有多打一次」。 */
export function fakeFetch(
  routes: Record<string, () => Promise<Response> | Response>,
): typeof fetch & { calls: string[] } {
  const calls: string[] = [];
  const fn = (async (input: Request | string, _init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.url;
    calls.push(url);
    const host = new URL(url).hostname;
    const handler = routes[host];
    if (!handler) throw new TypeError('no route for ' + host);
    return handler();
  }) as typeof fetch & { calls: string[] };
  fn.calls = calls;
  return fn;
}

/** 只实现被用到的那部分 R2 语义。 */
export function fakeR2(objects: Record<string, string>, opts: { throwOnGet?: boolean } = {}) {
  return {
    async get(key: string, getOpts?: { range?: Headers }) {
      if (opts.throwOnGet) throw new Error('r2 down');
      const body = objects[key];
      if (body === undefined) return null;
      // 模拟真 R2：只要传了 range 选项就填 range（没有 Range 头时也是整段），
      // 206/200 的判断必须由调用方按请求头决定。
      const header = getOpts?.range?.get('range');
      const m = header ? /bytes=(\d+)-(\d+)/.exec(header) : null;
      const offset = m ? Number(m[1]) : 0;
      const length = m ? Number(m[2]) - offset + 1 : body.length;
      return {
        body: new Response(body.slice(offset, offset + length)).body,
        size: body.length,
        httpEtag: '"' + key + '"',
        range: getOpts?.range ? { offset, length } : undefined,
        writeHttpMetadata(_h: Headers) {},
        text: async () => body,
      };
    },
    async head(key: string) {
      if (opts.throwOnGet) throw new Error('r2 down');
      const body = objects[key];
      if (body === undefined) return null;
      return {
        size: body.length,
        httpEtag: '"' + key + '"',
        writeHttpMetadata(_h: Headers) {},
      };
    },
  } as unknown as R2Bucket;
}
