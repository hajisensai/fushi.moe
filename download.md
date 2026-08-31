<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useSiteI18n } from './.vitepress/theme/i18n.js'
import { probeSources, downloadChunked, createBrowserSink, verifySink } from './.vitepress/theme/chunked-download.mjs'
import { PACK_FILENAME, downloadPack, fetchPackManifest, preferredPartBaseUrl } from './.vitepress/theme/pack-download.mjs'

/*
 * 下载页：发布通道 × 下载源 × 分片加速。
 *
 * 通道：正式版（update-manifest 分支 latest-stable-fushi.json）/ 调试版（latest-debug-fushi.json，
 * 每次合并自动构建）。两个通道的清单都由 Worker 的 /releases/api/latest?channel= 代理，
 * Worker 不通时直接读 GitHub 上的静态 JSON，再不行退回静态表。
 *
 * 下载源（普通链接指向谁）：fushi.moe/releases 落在 Cloudflare（R2 镜像，回源 GitHub 兜底），
 * github.com 是直连。哪条通、哪条快因人而异，默认「自动」并发探一次谁先应答用谁，
 * 选择记在 localStorage。
 *
 * 分片加速（多连接 Range 下载）：点「下载」时浏览器把安装包切成 8 MiB 分片、4 条连接
 * 并发拉，分片首字节 / 中途无进度超时即让出重排，拼好后按清单里的 SHA-256 校验。
 * 来源只有一个主源：`?src=r2`（R2 镜像）。`?src=gh`（Worker 边缘代理 GitHub）与 R2 同在
 * Cloudflare 故障域、且回源 GitHub 的长尾延迟实测 0.4s～25s+，**只在 R2 探不到（比如
 * 调试版没镜像）时作兜底**，不占常规并发。GitHub 直链没有 CORS，不能当 fetch 来源，
 * 所以「GitHub 直连」永远只是普通链接——IDM / aria2 用户拿它自己多线程即可。
 * 分片走不通（浏览器不支持、来源都探不到、文件太大放不进内存且没有文件系统 API）
 * 就退回普通链接。
 *
 * 渐进增强：下面的静态表格本身就是可用的 GitHub 链接。脚本没跑起来时页面仍然是一张
 * 能点的下载表。
 */

const { t } = useSiteI18n()

const DL_BASE = '/releases'
const GH_REPO = 'hajisensai/Fushi'
const GH_MANIFEST_BASE = 'https://raw.githubusercontent.com/hajisensai/Fushi/update-manifest/'
const PROBE_TIMEOUT_MS = 4000
/** 分片来源探测（64 KiB Range）给足时间：跨境到 CF 的首包可能好几秒。 */
const CHUNK_PROBE_TIMEOUT_MS = 10000
/** 兜底来源（边缘代理 GitHub）的探测要短：它本来就只在主源不可用时才轮到。 */
const FALLBACK_PROBE_TIMEOUT_MS = 6000
/** 分片首字节 / 中途无进度的看门狗：超过就让出这片重排（单来源时自己重试）。 */
const CHUNK_FIRST_BYTE_MS = 10000
const CHUNK_STALL_MS = 8000
const STORE_KEY = 'fushi-download-mirror'
/**
 * iOS 走 TestFlight，不再直接发 ipa。填上公开邀请链接（https://testflight.apple.com/join/…）
 * 即可；留空时 iOS 行退回该版本的 ipa 链接。
 */
const IOS_TESTFLIGHT_URL = ''
/** 没有文件系统写入 API 时整包先落内存再存盘；超过这个体积不冒险，退回普通链接。 */
const MEMORY_SINK_LIMIT = 512 * 1024 * 1024
/** 推荐包（约 9.5 GB）的分片仓库；页面拿不到清单时这个页面仍然可点。 */
const PACK_RELEASE_URL = 'https://github.com/hajisensai/fushi-pack/releases/latest'
const PACK_MANIFEST_URL = '/pack/manifest.json'

const CHANNELS = [
  { id: 'stable', path: 'latest', manifest: 'latest-stable-fushi.json' },
  { id: 'debug',  path: 'debug',  manifest: 'latest-debug-fushi.json' },
]

/** 平台行。channels 标明哪个通道会有这个槽位：调试版 Android 只出一个含全部架构的通用包。 */
const PLATFORMS = [
  { slot: 'android-arm64',     nameZh: 'Android (arm64)',   noteKey: 'dl.p_android_arm64',     noteZh: '绝大多数手机选这个，需 Android 7.0+', channels: ['stable'] },
  { slot: 'android-arm32',     nameZh: 'Android (arm32)',   noteKey: 'dl.p_android_arm32',     noteZh: '较老的 32 位机型',                    channels: ['stable'] },
  { slot: 'android-x64',       nameZh: 'Android (x86_64)',  noteKey: 'dl.p_android_x64',       noteZh: '模拟器 / x86 平板',                   channels: ['stable'] },
  { slot: 'android-universal', nameZh: 'Android',           noteKey: 'dl.p_android_universal', noteZh: '通用包，含全部架构，体积较大',         channels: ['debug'] },
  { slot: 'windows',           nameZh: 'Windows',           noteKey: 'dl.p_windows',           noteZh: '含 Galgame 语音挖掘、桌面划词',        channels: ['stable', 'debug'] },
  { slot: 'macos',             nameZh: 'macOS',             noteKey: 'dl.p_macos',             noteZh: 'Apple Silicon 与 Intel 通用',         channels: ['stable', 'debug'] },
  { slot: 'ios',               nameZh: 'iOS',               noteKey: 'dl.p_ios',               noteZh: '通过 TestFlight 安装',                 channels: ['stable', 'debug'], testflight: true },
]

/** 与 edge/src/manifest.ts 的 SLOTS 同一份判据（GitHub 静态清单兜底时在浏览器里解析）。 */
const SLOT_PATTERNS = {
  'android-arm64':     /^fushi-.*-arm64-v8a\.apk$/,
  'android-arm32':     /^fushi-.*-armeabi-v7a\.apk$/,
  'android-x64':       /^fushi-.*-x86_64\.apk$/,
  'android-universal': /^fushi-.*-debug\.apk$/,
  windows:             /^fushi-.*-windows-setup\.exe$/,
  'windows-portable':  /^fushi-.*-windows-x64\.zip$/,
  macos:               /^fushi-.*-macos\.zip$/,
  ios:                 /^fushi-.*-ios\.ipa$/,
}

const MIRRORS = [
  { id: 'cf', nameKey: 'dl.mirror_cf', nameZh: 'Cloudflare 镜像', hintKey: 'dl.mirror_cf_hint', hintZh: '经 R2 分发，多数地区更快' },
  { id: 'gh', nameKey: 'dl.mirror_gh', nameZh: 'GitHub 直连',     hintKey: 'dl.mirror_gh_hint', hintZh: '官方发布源' },
]

const channel = ref('stable')          // 'stable' | 'debug'
const choice = ref('auto')             // 'auto' | 'cf' | 'gh'
const probed = ref({})                 // id -> { ok, ms }
const probing = ref(true)
const release = ref(null)              // { channel, tag, version, slots }
const metaSource = ref('')             // 清单是从哪拿到的
const loadingRelease = ref(false)
/** slot -> 分片下载任务状态 */
const jobs = reactive({})

const channelDef = computed(() => CHANNELS.find((c) => c.id === channel.value) ?? CHANNELS[0])
const rows = computed(() => PLATFORMS.filter((p) => p.channels.includes(channel.value)))

const activeMirror = computed(() => {
  if (choice.value !== 'auto') return choice.value
  const ranked = MIRRORS
    .map((m) => ({ id: m.id, ...(probed.value[m.id] ?? {}) }))
    .filter((m) => m.ok)
    .sort((a, b) => a.ms - b.ms)
  return ranked.length ? ranked[0].id : 'gh'
})

const activeMirrorName = computed(() => {
  const m = MIRRORS.find((x) => x.id === activeMirror.value)
  return m ? t(m.nameKey, m.nameZh) : t('dl.mirror_unknown', '未知')
})

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(
      (v) => { clearTimeout(timer); resolve(v) },
      (e) => { clearTimeout(timer); reject(e) },
    )
  })
}

async function probe(id, url, opts) {
  const t0 = performance.now()
  try {
    await withTimeout(fetch(url, { cache: 'no-store', ...opts }), PROBE_TIMEOUT_MS)
    probed.value = { ...probed.value, [id]: { ok: true, ms: Math.round(performance.now() - t0) } }
  } catch {
    probed.value = { ...probed.value, [id]: { ok: false, ms: Infinity } }
  }
}

/** 把 update-manifest 分支的静态 JSON 按槽位收敛（与 Worker 的 latestManifestResponse 同形）。 */
function slotsFromPublished(d) {
  const slots = {}
  for (const [slot, re] of Object.entries(SLOT_PATTERNS)) {
    const a = (d.assets ?? []).find((x) => re.test(x.name))
    slots[slot] = a ? {
      url: DL_BASE + '/' + channelDef.value.path + '/' + slot,
      githubUrl: a.browser_download_url,
      name: a.name,
      size: typeof a.size === 'number' ? a.size : 0,
    } : null
  }
  return slots
}

/**
 * 清单本身也要有备份路径：Worker 拿不到就读 GitHub 静态清单，再退回静态表。
 * Worker 应答里必须带回同一个 channel——老版本 Worker 会无视 ?channel= 直接回正式版清单，
 * 那种应答不能当调试版用。
 */
async function loadRelease() {
  const want = channel.value
  loadingRelease.value = true
  release.value = null
  metaSource.value = ''
  try {
    const r = await withTimeout(
      fetch(DL_BASE + '/api/latest?channel=' + want, { cache: 'no-store' }),
      PROBE_TIMEOUT_MS,
    )
    if (r.ok) {
      const d = await r.json()
      const got = d.channel ?? 'stable'
      if (got === want && want === channel.value) {
        release.value = { channel: got, tag: d.tag, version: d.version ?? '', slots: d.slots }
        metaSource.value = 'fushi.moe'
        loadingRelease.value = false
        return
      }
    }
  } catch { /* 落到下一条 */ }

  try {
    const r = await withTimeout(
      fetch(GH_MANIFEST_BASE + channelDef.value.manifest, { cache: 'no-store' }),
      PROBE_TIMEOUT_MS,
    )
    if (r.ok && want === channel.value) {
      const d = await r.json()
      release.value = { channel: want, tag: d.tag, version: d.version ?? '', slots: slotsFromPublished(d) }
      metaSource.value = 'GitHub 静态清单'
      loadingRelease.value = false
      return
    }
  } catch { /* 静态表兜底 */ }

  if (want === channel.value) loadingRelease.value = false
}

function hrefFor(slot) {
  if (slot === 'ios' && IOS_TESTFLIGHT_URL) return IOS_TESTFLIGHT_URL
  const info = release.value?.slots?.[slot]
  if (!info) return 'https://github.com/' + GH_REPO + '/releases' + (channel.value === 'stable' ? '/latest' : '')
  if (activeMirror.value === 'cf') return DL_BASE + '/' + channelDef.value.path + '/' + slot
  return info.githubUrl || (
    'https://github.com/' + GH_REPO + '/releases/download/' +
    encodeURIComponent(release.value.tag) + '/' + encodeURIComponent(info.name)
  )
}

/**
 * download 属性的值 = 文件名。同源镜像链接按它存盘；跨域 GitHub 链接浏览器会忽略该值
 * （用对方的 Content-Disposition），但属性本身仍让 VitePress 路由放行。
 */
function downloadNameFor(slot) {
  return release.value?.slots?.[slot]?.name || 'fushi'
}

/** GitHub 原始直链：给 IDM / aria2 这类自带多线程的下载器。 */
function githubUrlFor(slot) {
  const info = release.value?.slots?.[slot]
  return (info && info.githubUrl) || ''
}

function sizeFor(slot) {
  const bytes = release.value?.slots?.[slot]?.size
  if (!bytes) return ''
  return (bytes / 1024 / 1024).toFixed(0) + ' MB'
}

function pick(id) {
  choice.value = id
  try { localStorage.setItem(STORE_KEY, id) } catch { /* 隐私模式下存不了，不影响本次选择 */ }
}

function pickChannel(id) {
  if (channel.value === id) return
  channel.value = id
  loadRelease()
}

/* ---------------- 推荐包 ---------------- */

/*
 * 推荐包 = 词典 + 日/英发音音频库的备份 zip，约 9.5 GB。服务端它是 39 个 256 MiB
 * 的分片（GitHub Release 单资产上限 2 GB），拼装与逐片校验在 pack-download.mjs 里。
 *
 * 这里只做三件事：同步开保存对话框（await 之后手势就没了，与安装包那条路一样）、
 * 把进度喂给 UI、失败时把兜底入口摆出来。**没有跨刷新续传**：文件句柄是用户在对话框里
 * 给的，页面一关就没了；要断点续传就走 app 引导里的下载器，那条路进度绑 sha256。
 */
const pack = reactive({ state: 'idle', pct: 0, speed: '', part: '', error: '', version: '', wholeUrl: '', controller: null })
/** 挂载时取一次分片清单（8 KB）：Drive 整包这个兜底入口写在清单里，不预取的话
    要点过按钮才会出现，而点不了按钮的人（Firefox / Safari）恰恰最需要它。 */
const packManifest = ref(null)

async function loadPackManifest() {
  try {
    const m = await fetchPackManifest({ url: PACK_MANIFEST_URL })
    packManifest.value = m
    pack.version = m.version
    pack.wholeUrl = m.wholeUrl || ''
  } catch {
    /* 清单拿不到不影响页面：GitHub 分片与清单两个静态入口照样可点 */
  }
}

function packSupported() {
  return typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function'
}

async function startPackDownload() {
  if (pack.state === 'downloading' || pack.state === 'preparing') return
  if (!packSupported()) { pack.state = 'unsupported'; return }

  let sink = null
  try {
    // 必须排在任何 await 之前：文件选择器只在用户手势里能开。整包大小这时还不知道
    // （清单还没拉），文件系统 sink 不在乎——它按位写，会自动撑大。
    sink = await createBrowserSink({ filename: PACK_FILENAME, size: 0 })
  } catch (err) {
    if (err && err.name === 'AbortError') return
    pack.state = 'unsupported'
    return
  }
  if (sink.kind !== 'filesystem') {
    // 内存 sink 装不下 9.5 GB，宁可什么都不做也别让浏览器 OOM。
    await sink.abort?.().catch(() => {})
    pack.state = 'unsupported'
    return
  }

  const controller = new AbortController()
  Object.assign(pack, { state: 'preparing', pct: 0, speed: '', part: '', error: '', controller })

  try {
    const manifest = packManifest.value ?? await fetchPackManifest({ url: PACK_MANIFEST_URL, signal: controller.signal })
    packManifest.value = manifest
    pack.version = manifest.version
    pack.wholeUrl = manifest.wholeUrl || ''
    pack.state = 'downloading'
    await downloadPack({
      manifest,
      sink,
      baseUrl: preferredPartBaseUrl(manifest, location.origin),
      signal: controller.signal,
      onProgress: (p) => {
        pack.pct = Math.floor((p.bytesDone / p.bytesTotal) * 100)
        pack.speed = formatSpeed(p.bytesPerSecond)
        pack.part = p.partsDone + '/' + p.partsTotal
      },
    })
    pack.pct = 100
    pack.state = 'done'
  } catch (err) {
    await sink.abort?.().catch(() => {})
    if (err && err.name === 'AbortError') { pack.state = 'idle'; return }
    pack.state = 'failed'
    pack.error = String((err && err.message) || err)
  } finally {
    pack.controller = null
  }
}

function cancelPack() {
  if (pack.controller) pack.controller.abort()
  else pack.state = 'idle'
}

/* ---------------- 分片加速 ---------------- */

function formatSpeed(bps) {
  if (!bps) return ''
  if (bps >= 1024 * 1024) return (bps / 1024 / 1024).toFixed(1) + ' MB/s'
  return Math.max(1, Math.round(bps / 1024)) + ' KB/s'
}

/** 两个同域来源分别拉了多少（百分比），给用户看「确实在双源并发」。 */
function splitText(perSource, total) {
  if (!total) return ''
  const parts = []
  for (const [id, bytes] of Object.entries(perSource)) {
    if (bytes > 0) parts.push(sourceLabel(id) + ' ' + Math.round((bytes / total) * 100) + '%')
  }
  return parts.join(' · ')
}

function sourceLabel(id) {
  return id === 'r2' ? t('dl.src_r2', 'Cloudflare 镜像') : t('dl.src_gh', 'GitHub 边缘代理')
}

/**
 * 分片必须能把片直接写进磁盘文件。没有 File System Access（Firefox / Safari /
 * 所有移动浏览器）就只剩「整包塞进 Uint8Array、拼完再 Blob 复制一份」这一条路，
 * 而安装包是 238～319 MB：峰值要两倍体积的内存，移动端的标签页会被系统直接杀掉，
 * 中途关页也全白下。这种浏览器不该进分片——不拦截点击，让 <a download> 走浏览器
 * 原生下载，那才是选源器里写的「不支持的浏览器自动退回普通下载」。
 * @returns {boolean}
 */
function canStreamToDisk() {
  return typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function'
}

function chunkSupported() {
  return typeof window !== 'undefined' && typeof window.fetch === 'function' &&
    typeof AbortController === 'function' && canStreamToDisk()
}

/** 点击「下载」：能分片就在页内分片并发下；否则让 <a> 照常导航。 */
function onDownloadClick(e, slot) {
  if (slot === 'ios' && IOS_TESTFLIGHT_URL) return
  const info = release.value?.slots?.[slot]
  if (!info || !chunkSupported() || jobs[slot]) return
  e.preventDefault()
  startChunked(slot, info).catch(() => {})
}

async function startChunked(slot, info) {
  const tag = release.value.tag
  const controller = new AbortController()
  const job = reactive({ state: 'probing', pct: 0, speed: '', split: '', error: '', reasons: [], verify: '', href: hrefFor(slot), controller })
  jobs[slot] = job

  let sink = null
  // 文件选择器必须在点击手势里同步打开（await 之后手势就没了），所以它排在探测之前。
  // 此时文件大小可能还不知道（老清单没有 size），文件系统 sink 不在乎（按位写会自动撑大）；
  // 但若选择器打不开（无手势 / 不安全上下文）createBrowserSink 会内部回落成内存 sink——
  // 那个是按 size=0 分配的空壳，必须丢掉，等探测拿到真实大小后再建。
  if (canStreamToDisk()) {
    try {
      sink = await createBrowserSink({ filename: info.name, size: info.size || 0 })
      if (sink.kind !== 'filesystem') { await sink.abort?.().catch(() => {}); sink = null }
    } catch (err) {
      if (err && err.name === 'AbortError') { delete jobs[slot]; return }
      sink = null
    }
  }

  const base = DL_BASE + '/v/' + encodeURIComponent(tag) + '/' + encodeURIComponent(info.name)
  const primary = { id: 'r2', url: base + '?src=r2', label: 'Cloudflare 镜像' }
  const fallback = { id: 'gh', url: base + '?src=gh', label: 'GitHub 边缘代理' }
  // 先探主源；主源在就只用主源。边缘代理 GitHub 只在主源探不到时才试，且超时更短——
  // 它和 R2 同在 Cloudflare 故障域，只是没镜像时的兜底，不是第二条腿。
  // 每次探测的真实应答（状态码 / 超时 / 网络错）记下来：退回普通下载时把原因摆给用户看。
  const reasons = []
  const signal = controller.signal
  let probedSources = await probeOne(primary, reasons, CHUNK_PROBE_TIMEOUT_MS, info.size, signal)
  if (!probedSources && !signal.aborted) {
    probedSources = await probeOne(fallback, reasons, FALLBACK_PROBE_TIMEOUT_MS, info.size, signal)
  }
  // 探测期间被取消：cancelJob 已经把这一行摘回可点的下载链接了，这里只负责收尾，
  // 绝不能再往下走去建 sink / 开传输。
  if (signal.aborted) {
    if (sink && sink.abort) await sink.abort().catch(() => {})
    return
  }
  job.reasons = reasons
  console.info('[fushi download] sources', reasons)
  if (!probedSources) {
    if (sink && sink.abort) await sink.abort().catch(() => {})
    fallbackToPlain(slot, job)
    return
  }
  const size = probedSources.size

  if (!sink) {
    if (size > MEMORY_SINK_LIMIT) { fallbackToPlain(slot, job); return }
    try {
      sink = await createBrowserSink({ filename: info.name, size, forceMemory: true })
    } catch {
      fallbackToPlain(slot, job)
      return
    }
  }

  job.state = 'downloading'
  try {
    await downloadChunked({
      sources: probedSources.sources,
      size,
      sink,
      // 单来源：4 条连接全给它（同域 6 连接上限内，留 2 条给页面自己）。
      perSourceConcurrency: 4,
      maxTotalConcurrency: 4,
      firstByteMs: CHUNK_FIRST_BYTE_MS,
      stallMs: CHUNK_STALL_MS,
      signal: controller.signal,
      onProgress: (p) => {
        job.pct = Math.floor((p.bytesDone / p.bytesTotal) * 100)
        job.speed = formatSpeed(p.bytesPerSecond)
        job.split = splitText(p.perSource, p.bytesDone)
      },
    })
    job.pct = 100
    // 拼完按清单 SHA-256 校验；老版本清单没有校验值就如实标「未校验」。
    if (info.sha256) {
      job.state = 'verifying'
      try {
        const v = await verifySink(sink, info.sha256)
        job.verify = v.ok ? 'ok' : 'mismatch'
      } catch {
        job.verify = 'unavailable'
      }
    } else {
      job.verify = 'unavailable'
    }
    job.state = job.verify === 'mismatch' ? 'failed' : 'done'
    if (job.verify === 'mismatch') job.error = t('dl.verify_failed', 'SHA-256 不匹配，文件不完整，请重新下载。')
  } catch (err) {
    if (err && err.name === 'AbortError') { delete jobs[slot]; return }
    job.state = 'failed'
    job.error = String((err && err.message) || err)
  }
}

/**
 * 探一个来源：先发 1 字节 Range 记结论（给用户看），再用 probeSources 做正式探测
 * （64 KiB、校验 Content-Range 与总大小）。可用返回 { sources, size }，否则 null。
 */
async function probeOne(source, reasons, timeoutMs, expectedSize, signal) {
  reasons.push(await describeSource(source, timeoutMs, signal))
  if (signal && signal.aborted) return null
  try {
    const r = await probeSources([source], { expectedSize: expectedSize || undefined, timeoutMs, signal })
    return r.sources.length && r.size ? r : null
  } catch {
    return null
  }
}

/** 一个来源的探测结论，形如「Cloudflare 镜像: 206 · 1.2s」「GitHub 边缘代理: 502」「…: 超时」。 */
async function describeSource(c, timeoutMs, signal) {
  const t0 = performance.now()
  try {
    const res = await withTimeout(
      fetch(c.url, { headers: { Range: 'bytes=0-0' }, cache: 'no-store', signal }),
      timeoutMs,
    )
    try { await res.arrayBuffer() } catch { /* 只看状态 */ }
    const ms = Math.round(performance.now() - t0)
    return { id: c.id, ok: res.status === 206, text: sourceLabel(c.id) + ': ' + res.status + ' · ' + (ms / 1000).toFixed(1) + 's' }
  } catch (err) {
    const timeout = err && err.message === 'timeout'
    return { id: c.id, ok: false, text: sourceLabel(c.id) + ': ' + (timeout ? t('dl.src_timeout', '超时') : t('dl.src_network_error', '网络错误')) }
  }
}

/** 分片走不通：不再自动跳转——把每个来源的结论摆出来，用户点「普通下载」再走浏览器下载。 */
function fallbackToPlain(slot, job) {
  job.state = 'fallback'
}

/*
 * 取消 = 中止在飞的请求 + 立刻把这一行摘回可点的下载链接。
 * 以前在探测阶段只 abort 不摘行，而那时的探测请求根本没接 signal：UI 会一直停在
 * 「正在探测来源…」，直到十几秒后探测自己跑完，才由 downloadChunked 抛 AbortError
 * 把行删掉——用户看到的就是「点了没反应，过一会儿自己恢复原样」。
 */
function cancelJob(slot) {
  const job = jobs[slot]
  if (!job) return
  job.controller.abort()
  delete jobs[slot]
}

onMounted(async () => {
  try {
    const saved = localStorage.getItem(STORE_KEY)
    if (saved === 'auto' || saved === 'cf' || saved === 'gh') choice.value = saved
  } catch { /* 读不到就用默认的自动 */ }

  await Promise.all([
    loadPackManifest(),
    probe('cf', DL_BASE + '/api/latest'),
    // GitHub 不给我们 CORS，用 no-cors 只看连不连得上，不读内容
    probe('gh', 'https://github.com/' + GH_REPO + '/releases/latest', { mode: 'no-cors' }),
    loadRelease(),
  ])
  probing.value = false
})
</script>

<h1 data-i18n="dl.title">下载 Fushi</h1>

<p class="lead" data-i18n="dl.lead">选一个平台装上，剩下的交给应用内的新手引导。四个平台同一套体验，全部免费开源。</p>

<div class="dl-channels">
  <button :class="{ on: channel === 'stable' }" @click="pickChannel('stable')">{{ t('dl.channel_stable', '正式版') }}</button>
  <button :class="{ on: channel === 'debug' }" @click="pickChannel('debug')">{{ t('dl.channel_debug', '调试版') }}</button>
  <span class="dl-channel-hint" v-if="channel === 'debug'">{{ t('dl.channel_debug_hint', '每次代码合并后自动构建：最新功能与修复先到这里，未经完整测试，可能不稳定。') }}</span>
  <span class="dl-channel-hint" v-else>{{ t('dl.channel_stable_hint', '经过测试的正式发布，推荐日常使用。') }}</span>
</div>

<div class="dl-picker" v-if="!probing">
  <div class="dl-status">
    {{ t('dl.status_using', '正在使用') }} <b>{{ activeMirrorName }}</b>
    <span v-if="release" class="sep">· {{ t('dl.status_version', '版本') }} {{ release.tag }}</span>
    <span v-else-if="loadingRelease" class="sep">· {{ t('dl.status_loading', '正在取版本清单…') }}</span>
    <span v-if="choice === 'auto'" class="dl-auto">{{ t('dl.status_auto', '（自动选择）') }}</span>
  </div>
  <div class="dl-buttons">
    <button :class="{ on: choice === 'auto' }" @click="pick('auto')">{{ t('dl.mirror_auto', '自动') }}</button>
    <button
      v-for="m in MIRRORS" :key="m.id"
      :class="{ on: choice === m.id, dead: probed[m.id] && !probed[m.id].ok }"
      :title="t(m.hintKey, m.hintZh)"
      @click="pick(m.id)"
    >
      {{ t(m.nameKey, m.nameZh) }}
      <small v-if="probed[m.id] && probed[m.id].ok">{{ probed[m.id].ms }}ms</small>
      <small v-else-if="probed[m.id]">{{ t('dl.mirror_dead', '连不上') }}</small>
    </button>
  </div>
  <p class="dl-chunk-note">{{ t('dl.chunk_note', '点「下载」会在浏览器里把安装包切成多段，从 Cloudflare 镜像和 GitHub 边缘代理同时并发拉取，拼好后保存；不支持的浏览器自动退回普通下载。') }}</p>
</div>
<div class="dl-picker" v-else>
  <div class="dl-status">{{ t('dl.status_probing', '正在测试下载源…') }}</div>
</div>

<!--
  vp-raw + download 属性：VitePress 的客户端路由会把同源、无 target/download 的 <a> 点击
  当成站内导航（pushState 后渲染它自己的 404 页，服务器根本收不到请求）——
  /releases/latest/<slot> 这种链接正中此坑，手机上「点下载 → 404 Page Not Found」就是它。
  两道都加：download 在 SSR 标记里就生效（hydrate 前点也安全），vp-raw 兜底。
-->
<div class="vp-raw">
<table class="dl-table">
  <thead><tr><th>{{ t('dl.th_platform', '平台') }}</th><th>{{ t('dl.th_note', '说明') }}</th><th>{{ t('dl.th_download', '下载') }}</th></tr></thead>
  <tbody>
    <tr v-for="p in rows" :key="p.slot">
      <td><b>{{ p.nameZh }}</b></td>
      <td>{{ t(p.noteKey, p.noteZh) }}</td>
      <td>
        <template v-if="!jobs[p.slot]">
          <a v-if="p.testflight && IOS_TESTFLIGHT_URL" :href="IOS_TESTFLIGHT_URL" rel="noopener" target="_blank">{{ t('dl.testflight', '加入 TestFlight') }}</a>
          <a v-else :href="hrefFor(p.slot)" :download="downloadNameFor(p.slot)" rel="noopener" @click="onDownloadClick($event, p.slot)">
            {{ t('dl.download', '下载') }}<span v-if="sizeFor(p.slot)"> · {{ sizeFor(p.slot) }}</span>
          </a>
          <a v-if="githubUrlFor(p.slot)" class="dl-direct" :href="githubUrlFor(p.slot)" :download="downloadNameFor(p.slot)" rel="noopener" :title="t('dl.direct_link_hint', 'IDM / aria2 等下载器可直接对它多线程')">{{ t('dl.direct_link', 'GitHub 直链') }}</a>
        </template>
        <div v-else class="dl-job" :class="jobs[p.slot].state">
          <template v-if="jobs[p.slot].state === 'probing'">
            <span>{{ t('dl.chunk_probing', '正在探测来源…') }}</span>
            <button type="button" @click="cancelJob(p.slot)">{{ t('dl.chunk_cancel', '取消') }}</button>
          </template>
          <template v-else-if="jobs[p.slot].state === 'downloading'">
            <span class="dl-bar"><i :style="{ width: jobs[p.slot].pct + '%' }"></i></span>
            <span class="dl-job-line">{{ jobs[p.slot].pct }}%<template v-if="jobs[p.slot].speed"> · {{ jobs[p.slot].speed }}</template></span>
            <span class="dl-job-split" v-if="jobs[p.slot].split">{{ jobs[p.slot].split }}</span>
            <button type="button" @click="cancelJob(p.slot)">{{ t('dl.chunk_cancel', '取消') }}</button>
          </template>
          <template v-else-if="jobs[p.slot].state === 'verifying'">
            <span class="dl-bar"><i style="width:100%"></i></span>
            <span class="dl-job-line">{{ t('dl.verifying', '校验 SHA-256…') }}</span>
          </template>
          <template v-else-if="jobs[p.slot].state === 'done'">
            <span class="dl-job-ok">{{ t('dl.chunk_done', '已完成，文件已保存') }}</span>
            <span class="dl-job-split">{{ jobs[p.slot].verify === 'ok' ? t('dl.verified', 'SHA-256 校验通过') : t('dl.unverified', '（此版本未提供校验值）') }}</span>
            <span class="dl-job-split" v-if="jobs[p.slot].split">{{ jobs[p.slot].split }}</span>
            <button type="button" @click="cancelJob(p.slot)">{{ t('dl.chunk_close', '收起') }}</button>
          </template>
          <template v-else-if="jobs[p.slot].state === 'fallback'">
            <span>{{ t('dl.chunk_fallback', '分片来源不可用，请用普通下载。') }}</span>
            <span class="dl-job-split" v-for="r in jobs[p.slot].reasons" :key="r.id">{{ r.text }}</span>
            <a :href="jobs[p.slot].href" :download="downloadNameFor(p.slot)" rel="noopener">{{ t('dl.chunk_direct', '普通下载') }}</a>
            <a v-if="githubUrlFor(p.slot)" class="dl-direct" :href="githubUrlFor(p.slot)" :download="downloadNameFor(p.slot)" rel="noopener">{{ t('dl.direct_link', 'GitHub 直链') }}</a>
            <button type="button" @click="cancelJob(p.slot)">{{ t('dl.chunk_close', '收起') }}</button>
          </template>
          <template v-else>
            <span class="dl-job-err">{{ t('dl.chunk_failed', '分片下载失败。') }}</span>
            <span class="dl-job-split" v-if="jobs[p.slot].error">{{ jobs[p.slot].error }}</span>
            <a :href="jobs[p.slot].href" :download="downloadNameFor(p.slot)" rel="noopener">{{ t('dl.chunk_direct', '普通下载') }}</a>
            <a v-if="githubUrlFor(p.slot)" class="dl-direct" :href="githubUrlFor(p.slot)" :download="downloadNameFor(p.slot)" rel="noopener">{{ t('dl.direct_link', 'GitHub 直链') }}</a>
            <button type="button" @click="cancelJob(p.slot)">{{ t('dl.chunk_close', '收起') }}</button>
          </template>
        </div>
      </td>
    </tr>
  </tbody>
</table>
</div>

<p v-if="!probing && !loadingRelease && !metaSource" class="dl-warn">
  {{ t('dl.warn_no_manifest', '没能取到版本清单（两个源都没应答），上面的按钮会带你去 GitHub Releases 页面手动选择。') }}
</p>

<p data-i18n="dl.linux">Linux 暂无预编译包，请<a href="https://github.com/hajisensai/Fushi#building">从源码构建</a>。</p>

<p data-i18n="dl.history">历史版本见<a href="https://github.com/hajisensai/Fushi/releases">全部 Releases</a>。</p>

<noscript>
<p>浏览器禁用了 JavaScript，下面是直接的 GitHub 下载入口 / JavaScript is disabled; direct GitHub links:</p>
<ul>
<li><a href="https://github.com/hajisensai/Fushi/releases/latest">最新 Release / Latest release</a></li>
<li>Android → <code>arm64</code> <code>.apk</code>；Windows → <code>.exe</code>；macOS → <code>.zip</code>；iOS → <code>.ipa</code></li>
</ul>
</noscript>

<style scoped>
/*
 * 选源器样式。类名 .dl-picker / .dl-status / .dl-buttons / .dl-table / .dl-warn
 * 是 tool/verify-download.mjs 的断言锚点——改名会让下载页三个场景的验证
 * 直接选不到元素，全部空过。
 *
 * 取值走站点 token（/chrome.css），不再用 --vp-c-*：那是 VitePress 默认主题
 * 的变量，本站换成自定义主题后它们根本不存在，写了也只会拿到空值。
 */
.dl-channels {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  margin: 26px 0 0;
}
.dl-channels button {
  padding: 7px 16px;
  border: 1px solid var(--hairline);
  border-radius: 980px;
  background: var(--ground);
  color: var(--ink);
  font: inherit; font-size: 14px; font-weight: 500;
  cursor: pointer;
}
.dl-channels button:hover { border-color: var(--ink-2); }
.dl-channels button.on { background: var(--ink); color: var(--ground); border-color: var(--ink); }
.dl-channel-hint { flex-basis: 100%; font-size: 13px; color: var(--ink-2); }
.dl-picker {
  margin: 16px 0 22px;
  padding: 18px 20px;
  border: 1px solid var(--hairline);
  border-radius: 16px;
  background: var(--alt);
}
.dl-status { font-size: 15px; margin-bottom: 12px; color: var(--ink); }
.dl-status .sep { margin-left: 0.35rem; }
.dl-auto { color: var(--ink-2); margin-left: 0.35rem; }
.dl-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
.dl-buttons button {
  padding: 6px 14px;
  border: 1px solid var(--hairline);
  border-radius: 980px;
  background: var(--ground);
  color: var(--ink);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.dl-buttons button:hover { border-color: var(--ink-2); }
.dl-buttons button.on {
  border-color: var(--link);
  color: var(--link);
  font-weight: 600;
}
.dl-buttons button.dead { opacity: 0.5; }
.dl-buttons small { color: var(--ink-2); margin-left: 0.3rem; }
.dl-chunk-note { font-size: 13px; color: var(--ink-2); margin: 12px 0 0 !important; line-height: 1.5; }
/*
 * table-layout: fixed —— 三列宽度只由下面的百分比决定，与单元格内容无关。
 * 以前用默认的 auto：点「下载」后第三格从一条链接变成「探测中 / 进度条 / 取消」，
 * 宽度需求一变浏览器就重算整张表的列宽，说明列被挤窄、文字重新折行，整页跳一下
 * （窄屏手机上最明显：说明列会从 3 行变 5 行）。
 */
.dl-table { display: table; width: 100%; table-layout: fixed; }
.dl-table th:first-child, .dl-table td:first-child { width: 26%; }
.dl-table th:last-child, .dl-table td:last-child { width: 34%; }
.dl-table td { vertical-align: top; }
.dl-table td:last-child a {
  display: inline-block; white-space: nowrap;
  color: var(--link); font-weight: 500;
}
.dl-table td:last-child a.dl-direct {
  display: block; margin-top: 4px;
  font-size: 12px; font-weight: 400; color: var(--ink-2);
}
.dl-table td:last-child a.dl-direct:hover { color: var(--link); }
.dl-job { display: flex; flex-direction: column; gap: 4px; min-width: 0; font-size: 13px; }
.dl-job button {
  align-self: flex-start;
  padding: 2px 10px; border: 1px solid var(--hairline); border-radius: 980px;
  background: var(--ground); color: var(--ink-2); font: inherit; font-size: 12px; cursor: pointer;
}
.dl-job button:hover { border-color: var(--ink-2); color: var(--ink); }
.dl-bar {
  display: block; height: 6px; border-radius: 3px; overflow: hidden;
  background: var(--hairline);
}
.dl-bar i { display: block; height: 100%; background: var(--link); transition: width 0.2s linear; }
.dl-job-line { font-variant-numeric: tabular-nums; }
.dl-job-split { color: var(--ink-2); font-size: 12px; }
.dl-job-ok { color: #1a7f37; }
.dl-job-err { color: #b25000; }
.dl-warn { color: var(--ink-2); font-size: 14px; }

/* 推荐包下载块：用站点自己的 token（chrome.css 的 --ground / --ink / --hairline /
   --link），按钮沿用页面既有的胶囊形，不引入第二种按钮语言与第二套配色。 */
.pack-dl { margin: 16px 0 20px; }
.pack-dl-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.pack-dl-btn {
  font: inherit; font-size: 15px; font-weight: 500;
  background: var(--link); color: var(--link-ink);
  border: 1px solid transparent; border-radius: 980px;
  padding: 8px 20px; cursor: pointer;
}
.pack-dl-btn:hover { filter: brightness(1.07); }
.pack-dl-cancel {
  font: inherit; font-size: 12px;
  background: var(--ground); color: var(--ink-2);
  border: 1px solid var(--hairline); border-radius: 980px;
  padding: 2px 10px; cursor: pointer;
}
.pack-dl-cancel:hover { border-color: var(--ink-2); color: var(--ink); }
.pack-dl-bar {
  flex: 1 1 180px; max-width: 320px;
  height: 6px; border-radius: 3px; overflow: hidden;
  background: var(--hairline);
}
.pack-dl-bar span { display: block; height: 100%; background: var(--link); transition: width 0.2s linear; }
.pack-dl-meta { font-size: 13px; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.pack-dl-note { font-size: 13px; color: var(--ink-2); margin: 8px 0 0 !important; line-height: 1.5; }
.pack-dl-ok { color: #1a7f37; }
.pack-dl-bad { color: #b25000; }
.pack-dl-links { display: flex; gap: 16px; flex-wrap: wrap; margin: 8px 0 0 !important; font-size: 13px; }
</style>

<hr>

<p class="eyebrow" data-i18n="dl.after_eyebrow">装好之后</p>

<h2 data-i18n="dl.guide_title">跟着新手引导走就行</h2>

<p data-i18n="dl.guide_p1">第一次启动 Fushi 会自动打开新手引导：先问你想用哪些功能，再一步步把推荐词典包、Anki、备份同步和阅读字体配好。中途关掉了想重来，路径是 <strong>设置 → 系统 → 新手引导</strong>。</p>

<table>
<thead><tr><th data-i18n="dl.guide_th_step">引导步骤</th><th data-i18n="dl.guide_th_what">做什么</th></tr></thead>
<tbody>
<tr><td data-i18n="dl.guide_r1_a">欢迎</td><td data-i18n="dl.guide_r1_b">选界面语言和明暗主题</td></tr>
<tr><td data-i18n="dl.guide_r2_a">功能选择</td><td data-i18n="dl.guide_r2_b">勾掉用不上的模块，它们不会出现在底栏</td></tr>
<tr><td data-i18n="dl.guide_r3_a">推荐包</td><td data-i18n="dl.guide_r3_b">下载并导入日语词典 + 日/英发音音频库</td></tr>
<tr><td data-i18n="dl.guide_r4_a">Anki</td><td data-i18n="dl.guide_r4_b">连上 AnkiDroid / AnkiMobile / AnkiConnect，一键创建 Lapis 牌组</td></tr>
<tr><td data-i18n="dl.guide_r5_a">备份 · 互联 · 字体</td><td data-i18n="dl.guide_r5_b">按需配置，都可以跳过</td></tr>
</tbody>
</table>

<h2 data-i18n="dl.pack_title">推荐包：不用一本一本挑词典</h2>

<p data-i18n="dl.pack_p1">推荐包里是<strong>日语单词、音调、词频词典</strong>，外加<strong>日语 / 英语本地发音音频库</strong>，约 9.5 GB。在引导的「安装推荐包」那一步里直接下载并导入。</p>

<div class="vp-raw pack-dl">
  <div class="pack-dl-row">
    <button v-if="pack.state !== 'downloading' && pack.state !== 'preparing'" class="pack-dl-btn" type="button" @click="startPackDownload">
      {{ t('dl.pack_btn', '在浏览器里下载整包') }} · 9.5 GB
    </button>
    <template v-else>
      <div class="pack-dl-bar"><span :style="{ width: pack.pct + '%' }"></span></div>
      <span class="pack-dl-meta">
        {{ pack.state === 'preparing' ? t('dl.pack_preparing', '正在取分片清单…') : pack.pct + '%' }}
        <template v-if="pack.part"> · {{ t('dl.pack_parts', '分片') }} {{ pack.part }}</template>
        <template v-if="pack.speed"> · {{ pack.speed }}</template>
      </span>
      <button class="pack-dl-cancel" type="button" @click="cancelPack">{{ t('dl.chunk_cancel', '取消') }}</button>
    </template>
  </div>

  <p v-if="pack.state === 'done'" class="pack-dl-note pack-dl-ok">{{ t('dl.pack_done', '整包已保存，逐片 SHA-256 校验通过。在 app 里用「备份导入」选它，确认框选「合并到现有库」。') }}</p>
  <p v-else-if="pack.state === 'failed'" class="pack-dl-note pack-dl-bad">{{ t('dl.pack_failed', '下载中断：') }}{{ pack.error }}</p>
  <p v-else-if="pack.state === 'unsupported'" class="pack-dl-note">{{ t('dl.pack_unsupported', '这个浏览器不支持直接写盘（需要桌面版 Chrome / Edge）。用下面的方式下载，或者直接在 app 引导里下。') }}</p>
  <p v-else class="pack-dl-note">{{ t('dl.pack_hint', '会先问你存到哪，然后按 39 个分片顺序下载并逐片校验 SHA-256。页面要一直开着——网页端没有断点续传；想续传就在 app 的新手引导里下。') }}</p>

  <p class="pack-dl-links">
    <a :href="PACK_RELEASE_URL" rel="noopener" target="_blank">{{ t('dl.pack_parts_link', 'GitHub 分片直链（IDM / aria2）') }}</a>
    <a :href="PACK_MANIFEST_URL" rel="noopener" target="_blank">{{ t('dl.pack_manifest_link', '分片清单 JSON') }}</a>
    <a v-if="pack.wholeUrl" :href="pack.wholeUrl" rel="noopener" target="_blank">{{ t('dl.pack_drive_link', 'Google Drive 整包（部分地区需代理）') }}</a>
  </p>
  <p class="pack-dl-note">{{ t('dl.pack_merge_hint', '用下载器拿分片的话，下完按序号合并成一个文件：Windows 用 copy /b 分片名.000+分片名.001+… 整包名，macOS / Linux 用 cat 分片名.* > 整包名。') }}</p>
</div>

<div class="custom-block tip">
<p class="custom-block-title" data-i18n="dl.pack_warn_title">导入方式选「合并」</p>
<p data-i18n="dl.pack_warn_body">推荐包走的是备份导入流程，确认框里选<strong>「合并到现有库」</strong>只会加进词典和发音库，不动你已有的数据；<strong>「覆盖整库」</strong>会用推荐包替换整个库。</p>
</div>

<p data-i18n="dl.pack_p2">学别的语言？跳过这一步，用词典管理导入任意 Yomitan / MDX (MDict) / DSL 格式的词典即可。可查语言由你导入的词典决定。</p>
