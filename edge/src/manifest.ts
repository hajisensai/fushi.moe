/** 一次发布的镜像清单。GitHub API 与 R2 兜底副本共用这个形状。 */
export interface ReleaseAsset {
  readonly name: string;
  readonly size: number;
  /** GitHub 直链，永远是最后一层兜底。 */
  readonly url: string;
}

export interface ReleaseManifest {
  readonly tag: string;
  readonly publishedAt: string;
  readonly assets: readonly ReleaseAsset[];
}

/** 稳定下载槽位 → 资产文件名判据。加平台就在这里加一行。 */
export const SLOTS: Readonly<Record<string, RegExp>> = {
  'android-arm64': /^fushi-.*-arm64-v8a\.apk$/,
  'android-arm32': /^fushi-.*-armeabi-v7a\.apk$/,
  'android-x64': /^fushi-.*-x86_64\.apk$/,
  windows: /^fushi-.*-windows-setup\.exe$/,
  macos: /^fushi-.*-macos\.zip$/,
  ios: /^fushi-.*-ios\.ipa$/,
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

interface GithubAsset {
  name?: unknown;
  size?: unknown;
  browser_download_url?: unknown;
}

/** 把 GitHub release JSON 收敛成清单；字段缺失的资产直接丢弃，不留半个对象。 */
export function manifestFromGithub(raw: unknown): ReleaseManifest | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const rec = raw as Record<string, unknown>;
  const tag = rec['tag_name'];
  if (typeof tag !== 'string' || tag === '') return null;
  const rawAssets = Array.isArray(rec['assets']) ? (rec['assets'] as GithubAsset[]) : [];
  const assets: ReleaseAsset[] = [];
  for (const a of rawAssets) {
    if (typeof a.name !== 'string' || typeof a.browser_download_url !== 'string') continue;
    assets.push({
      name: a.name,
      size: typeof a.size === 'number' ? a.size : 0,
      url: a.browser_download_url,
    });
  }
  return {
    tag,
    publishedAt: typeof rec['published_at'] === 'string' ? rec['published_at'] : '',
    assets,
  };
}
