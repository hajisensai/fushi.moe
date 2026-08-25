import type { HealthStore } from './breaker';
import type { Settings } from './config';
import { GH_MANIFEST_BREAKER, MIRROR_BREAKER } from './downloads';
import type { OriginSpec } from './origins';
import { originUrl } from './origins';

export interface HealthDeps {
  readonly settings: Settings;
  readonly health: HealthStore;
  readonly fetcher: typeof fetch;
  readonly hasMirror: boolean;
}

interface OriginReport {
  host: string;
  breaker: 'closed' | 'open';
  probe: 'ok' | 'fail';
  status: number | null;
  build: string | null;
}

/**
 * 拉源站的构建指纹。
 *
 * 两侧必须是同一次构建的同一份产物——否则跨源取资源会撞上 VitePress 的
 * 内容哈希文件名，切换瞬间整页 404。这个不变式必须被持续监控，不能靠祈祷。
 */
async function probe(origin: OriginSpec, deps: HealthDeps): Promise<OriginReport> {
  const store = await deps.health.isDown(origin.name);
  const report: OriginReport = {
    host: origin.host,
    breaker: store ? 'open' : 'closed',
    probe: 'fail',
    status: null,
    build: null,
  };
  try {
    const url = originUrl(origin, new URL('https://' + deps.settings.canonicalHost + '/__build.json'));
    const res = await deps.fetcher(url.toString(), {
      signal: AbortSignal.timeout(deps.settings.timeoutMs),
    } as RequestInit);
    report.status = res.status;
    if (res.ok) {
      report.probe = 'ok';
      const body = (await res.json()) as { fingerprint?: unknown };
      if (typeof body?.fingerprint === 'string') report.build = body.fingerprint;
    }
  } catch {
    /* probe 失败就是 fail，交给上面的字段表达 */
  }
  return report;
}

export async function handleHealth(deps: HealthDeps): Promise<Response> {
  const reports = await Promise.all(deps.settings.origins.map((o) => probe(o, deps)));
  const byName: Record<string, OriginReport> = {};
  deps.settings.origins.forEach((o, i) => {
    byName[o.name] = reports[i]!;
  });

  const builds = reports.map((r) => r.build).filter((b): b is string => b !== null);
  const inSync = builds.length === reports.length && builds.every((b) => b === builds[0]);

  const body = {
    ok: reports.some((r) => r.probe === 'ok'),
    inSync,
    cfWeight: deps.settings.cfWeight,
    origins: byName,
    mirror: {
      bound: deps.hasMirror,
      breaker: (await deps.health.isDown(MIRROR_BREAKER)) ? 'open' : 'closed',
    },
    githubManifest: {
      source: 'update-manifest/latest-stable-fushi.json',
      breaker: (await deps.health.isDown(GH_MANIFEST_BREAKER)) ? 'open' : 'closed',
    },
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: body.ok ? 200 : 503,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
  });
}
