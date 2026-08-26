/** 一次发布的下载清单。GitHub 静态清单与 R2 兜底副本共用这个形状。 */
export interface ReleaseAsset {
  readonly name: string;
  readonly size: number;
  /** GitHub 直链，永远是最后一层兜底。 */
  readonly url: string;
  /** 发布时对产物算的 SHA-256（小写 hex）；老清单没有，下载页据此决定校不校验。 */
  readonly sha256?: string;
}

const SHA256_HEX = /^[0-9a-f]{64}$/;

/** 只认 64 位 hex；大小写归一。不合形状就当没有，别把垃圾值交给客户端去比对。 */
export function normalizeSha256(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const lower = raw.trim().toLowerCase().replace(/^sha256:/, '');
  return SHA256_HEX.test(lower) ? lower : undefined;
}

/** 发布通道。update-manifest 分支按通道各放一份静态 JSON：latest-<channel>-fushi.json。 */
export type Channel = 'stable' | 'debug' | 'beta';
export const CHANNELS: readonly Channel[] = ['stable', 'debug', 'beta'];

export function parseChannel(raw: string | null | undefined): Channel | null {
  if (raw === null || raw === undefined || raw === '' || raw === 'latest') return 'stable';
  return (CHANNELS as readonly string[]).includes(raw) ? (raw as Channel) : null;
}

export interface ReleaseManifest {
  readonly tag: string;
  readonly publishedAt: string;
  readonly assets: readonly ReleaseAsset[];
  /** 静态清单里的 channel 字段；缺省按 stable。 */
  readonly channel: Channel;
  /** 人读的版本号（如 2.1.1 / 2.2.1-debug.12402）；缺省空串。 */
  readonly version: string;
}

/** 稳定下载槽位 → 资产文件名判据。加平台就在这里加一行。 */
export const SLOTS: Readonly<Record<string, RegExp>> = {
  'android-arm64': /^fushi-.*-arm64-v8a\.apk$/,
  'android-arm32': /^fushi-.*-armeabi-v7a\.apk$/,
  'android-x64': /^fushi-.*-x86_64\.apk$/,
  windows: /^fushi-.*-windows-setup\.exe$/,
  macos: /^fushi-.*-macos\.zip$/,
  ios: /^fushi-.*-ios\.ipa$/,
  // 调试通道的 Android 只出一个含全部架构的通用包（名字以 -debug.apk 结尾）。
  'android-universal': /^fushi-.*-debug\.apk$/,
  'bridge-arm64': /^bridge-.*-arm64-v8a\.apk$/,
  'bridge-arm32': /^bridge-.*-armeabi-v7a\.apk$/,
  'bridge-x64': /^bridge-.*-x86_64\.apk$/,
};

export function resolveSlot(manifest: ReleaseManifest, slot: string): ReleaseAsset | null {
  const pattern = SLOTS[slot];
  if (!pattern) return null;
  return manifest.assets.find((a) => pattern.test(a.name)) ?? null;
}

export function mirrorKey(tag: string, name: string): string {
  return `releases/${tag}/${name}`;
}

interface PublishedAsset {
  name?: unknown;
  size?: unknown;
  browser_download_url?: unknown;
  sha256?: unknown;
}

/** 把 update-manifest 分支的静态 JSON 收敛成清单。 */
export function manifestFromPublished(raw: unknown): ReleaseManifest | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const rec = raw as Record<string, unknown>;
  const tag = rec['tag'];
  if (typeof tag !== 'string' || tag === '') return null;
  const rawAssets = Array.isArray(rec['assets']) ? (rec['assets'] as PublishedAsset[]) : [];
  const assets: ReleaseAsset[] = [];
  for (const a of rawAssets) {
    if (typeof a.name !== 'string' || typeof a.browser_download_url !== 'string') continue;
    assets.push({
      name: a.name,
      size: typeof a.size === 'number' ? a.size : 0,
      url: a.browser_download_url,
      sha256: normalizeSha256(a.sha256),
    });
  }
  return {
    tag,
    publishedAt: typeof rec['publishedAt'] === 'string' ? rec['publishedAt'] : '',
    assets,
    channel: parseChannel(typeof rec['channel'] === 'string' ? rec['channel'] : 'stable') ?? 'stable',
    version: typeof rec['version'] === 'string' ? rec['version'] : '',
  };
}
