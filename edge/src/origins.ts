import type { HealthStore } from './breaker';

export type OriginName = 'cf' | 'gh';

export interface OriginSpec {
  readonly name: OriginName;
  /** 回源主机名，例如 cf.fushi.moe / gh.fushi.moe。 */
  readonly host: string;
}

/**
 * 决定回源尝试顺序。
 *
 * 这里刻意不写 if (cfDown) ... else if (ghDown) ... 的分支树：
 * 先按权重定基准顺序，再把熔断的源做一次「稳定后移」。
 * 全挂时顺序保持不变，天然就是半开探测，不需要额外分支。
 */
export function pickOrder<T extends { name: OriginName }>(
  origins: readonly T[],
  down: ReadonlySet<OriginName>,
  primaryWeight: number,
  rand: number,
): T[] {
  const base = rand * 100 < primaryWeight ? [...origins] : [...origins].reverse();
  const up = base.filter((o) => !down.has(o.name));
  const bad = base.filter((o) => down.has(o.name));
  return [...up, ...bad];
}

export async function downSet(
  store: HealthStore,
  names: readonly OriginName[],
): Promise<Set<OriginName>> {
  const flags = await Promise.all(names.map((n) => store.isDown(n)));
  const set = new Set<OriginName>();
  names.forEach((n, i) => {
    if (flags[i]) set.add(n);
  });
  return set;
}

/**
 * 判断一次回源结果是否算失败。
 *
 * 5xx 一律算失败：静态站点的正常响应只有 2xx/3xx/4xx。
 * 4xx 不算源站故障——404 就是 404，切到另一个源同样是 404，
 * 白白多打一次请求还会把好源标脏。
 */
export function isOriginFailure(status: number): boolean {
  return status >= 500;
}
