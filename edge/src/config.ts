import type { OriginSpec } from './origins';

export interface Env {
  /** Cloudflare Pages 侧回源主机名（Pages 自带域，不对用户展示）。 */
  ORIGIN_CF_HOST: string;
  /** GitHub Pages 侧回源主机名。用 GitHub 自带域，不需要任何自建别名，
   *  用户也永远看不到它。前提是仓库不设自定义域（见 CNAME 已删除）。 */
  ORIGIN_GH_HOST: string;
  /** 对外规范主机名，所有别名与源站重定向都归一到它。 */
  CANONICAL_HOST: string;
  /** 下载分发主机名。 */
  DOWNLOAD_HOST: string;
  /** 走 CF 侧的流量百分比（0-100）。其余走 GitHub 侧。 */
  CF_WEIGHT: string;
  /** 单次回源超时（毫秒）。 */
  ORIGIN_TIMEOUT_MS: string;
  /** 熔断冷却秒数。 */
  BREAKER_COOLDOWN_S: string;
  /** 发布仓库，形如 owner/repo。 */
  GH_REPO: string;
  /** release 资产镜像桶。未绑定时下载全部回退 GitHub。 */
  MIRROR?: R2Bucket;
}

export interface Settings {
  readonly origins: readonly OriginSpec[];
  readonly canonicalHost: string;
  readonly downloadHost: string;
  readonly cfWeight: number;
  readonly timeoutMs: number;
  readonly cooldownS: number;
  readonly ghRepo: string;
}

function num(raw: string | undefined, fallback: number, min: number, max: number): number {
  const v = Number(raw);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}

export function settingsFrom(env: Env): Settings {
  return {
    origins: [
      { name: 'cf', host: env.ORIGIN_CF_HOST || 'fushi-moe.pages.dev' },
      { name: 'gh', host: env.ORIGIN_GH_HOST || 'hajisensai.github.io' },
    ],
    canonicalHost: env.CANONICAL_HOST || 'fushi.moe',
    downloadHost: env.DOWNLOAD_HOST || 'dl.fushi.moe',
    cfWeight: num(env.CF_WEIGHT, 90, 0, 100),
    timeoutMs: num(env.ORIGIN_TIMEOUT_MS, 3000, 500, 30000),
    cooldownS: num(env.BREAKER_COOLDOWN_S, 60, 5, 3600),
    ghRepo: env.GH_REPO || 'hajisensai/Fushi',
  };
}
