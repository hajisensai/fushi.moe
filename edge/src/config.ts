import { normalizeBasePath, type OriginSpec } from './origins';

export interface Env {
  /** Cloudflare Pages 侧回源主机名（Pages 自带域，不对用户展示）。 */
  ORIGIN_CF_HOST: string;
  /** Cloudflare Pages 项目在平台域上的路径前缀，通常为空。 */
  ORIGIN_CF_PATH?: string;
  /** GitHub Pages 侧回源主机名。用 GitHub 自带域，不需要任何自建别名，
   *  用户也永远看不到它。正式切流后仓库必须释放 GitHub 自定义域。 */
  ORIGIN_GH_HOST: string;
  /** GitHub Pages 项目站路径前缀，例如 /fushi.moe。 */
  ORIGIN_GH_PATH?: string;
  /** 对外规范主机名，所有别名与源站重定向都归一到它。 */
  CANONICAL_HOST: string;
  /** 同域下载路由前缀。 */
  DOWNLOAD_PREFIX: string;
  /** 走 CF 侧的流量百分比（0-100）。其余走 GitHub 侧。 */
  CF_WEIGHT: string;
  /** 单次回源超时（毫秒）。 */
  ORIGIN_TIMEOUT_MS: string;
  /** 熔断冷却秒数。 */
  BREAKER_COOLDOWN_S: string;
  /** 发布仓库，形如 owner/repo。 */
  GH_REPO: string;
  /** 正式版静态下载清单。由 Fushi 发布流程写入 update-manifest 分支。 */
  GH_MANIFEST_URL?: string;
  /** 推荐包仓库（切片放它的 release），形如 owner/repo。 */
  PACK_REPO?: string;
  /** 推荐包路由前缀。 */
  PACK_PREFIX?: string;
  /** release 资产镜像桶。未绑定时下载全部回退 GitHub。 */
  MIRROR?: R2Bucket;
}

export interface Settings {
  readonly origins: readonly OriginSpec[];
  readonly canonicalHost: string;
  readonly downloadPrefix: string;
  readonly cfWeight: number;
  readonly timeoutMs: number;
  readonly cooldownS: number;
  readonly ghRepo: string;
  readonly ghManifestUrl: string;
  readonly packRepo: string;
  readonly packPrefix: string;
}

function num(raw: string | undefined, fallback: number, min: number, max: number): number {
  const v = Number(raw);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}

export function settingsFrom(env: Env): Settings {
  return {
    origins: [
      {
        name: 'cf',
        host: env.ORIGIN_CF_HOST || 'fushi-moe.pages.dev',
        basePath: normalizeBasePath(env.ORIGIN_CF_PATH),
      },
      {
        name: 'gh',
        host: env.ORIGIN_GH_HOST || 'hajisensai.github.io',
        basePath: normalizeBasePath(env.ORIGIN_GH_PATH || '/fushi.moe'),
      },
    ],
    canonicalHost: env.CANONICAL_HOST || 'fushi.moe',
    downloadPrefix: normalizeBasePath(env.DOWNLOAD_PREFIX || '/releases'),
    cfWeight: num(env.CF_WEIGHT, 90, 0, 100),
    timeoutMs: num(env.ORIGIN_TIMEOUT_MS, 3000, 500, 30000),
    cooldownS: num(env.BREAKER_COOLDOWN_S, 60, 5, 3600),
    ghRepo: env.GH_REPO || 'hajisensai/Fushi',
    ghManifestUrl:
      env.GH_MANIFEST_URL ||
      'https://raw.githubusercontent.com/hajisensai/Fushi/update-manifest/latest-stable-fushi.json',
    packRepo: env.PACK_REPO || 'hajisensai/fushi-pack',
    packPrefix: normalizeBasePath(env.PACK_PREFIX || '/pack'),
  };
}
