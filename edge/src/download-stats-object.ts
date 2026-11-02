import { DurableObject } from 'cloudflare:workers';
import type { Env } from './config';
import {
  DownloadLedger,
  utcDay,
  type DownloadCounter,
  type DownloadEvent,
  type SiteDownloadSummary,
} from './download-stats';
import type { GlobalSnapshot } from './stale-cache';

/**
 * 站内下载计数的唯一实例（idFromName('global')）。SQLite 存储：累加是原子的，
 * 免费计划可用（wrangler.toml 里 new_sqlite_classes）。逻辑全在 DownloadLedger——
 * 这个类只做「拿 ctx.storage.sql 喂给账本」，好让账本在 node:sqlite 上跑单测。
 *
 * 单独成文件：`cloudflare:workers` 只有 workerd 能解析，测试里不能 import 它。
 */
export class DownloadStats extends DurableObject<Env> {
  private readonly ledger: DownloadLedger;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ledger = new DownloadLedger(ctx.storage.sql);
  }

  async record(event: DownloadEvent): Promise<void> {
    this.ledger.record(event, utcDay(new Date()));
  }

  async summary(): Promise<SiteDownloadSummary> {
    return this.ledger.summary(utcDay(new Date()));
  }

  /** GitHub 汇总的全局最后成功值。原样存取，形状校验由调用方的 validate 做。 */
  async loadGithubSnapshot(): Promise<unknown> {
    return (await this.ctx.storage.get(GITHUB_SNAPSHOT_KEY)) ?? null;
  }

  async saveGithubSnapshot(value: unknown): Promise<void> {
    await this.ctx.storage.put(GITHUB_SNAPSHOT_KEY, value);
  }
}

const GITHUB_SNAPSHOT_KEY = 'github-summary';

const COUNTER_NAME = 'global';

/** binding 没配（本地 dev 没开 DO、或还没部署 migration）时返回 undefined，下载路由照常、只是不计。 */
export function downloadCounterFrom(env: Env): DownloadCounter | undefined {
  const ns = env.DOWNLOAD_STATS;
  if (!ns) return undefined;
  const stub = ns.get(ns.idFromName(COUNTER_NAME));
  return {
    record: (event) => stub.record(event),
    summary: () => stub.summary(),
  };
}

/** 同一个 DO 实例上的 GitHub 汇总快照；binding 没配时 undefined，只剩节点内缓存。 */
export function githubSnapshotFrom(env: Env): GlobalSnapshot | undefined {
  const ns = env.DOWNLOAD_STATS;
  if (!ns) return undefined;
  const stub = ns.get(ns.idFromName(COUNTER_NAME));
  return {
    load: () => stub.loadGithubSnapshot(),
    save: (value) => stub.saveGithubSnapshot(value),
  };
}
