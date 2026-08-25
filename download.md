<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useSiteI18n } from './.vitepress/theme/i18n.js'
import { probeSources, downloadChunked, createBrowserSink } from './.vitepress/theme/chunked-download.mjs'

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
 * 分片加速（IDM 那种多线程 Range 下载）：点「下载」时浏览器把安装包切成 8 MiB 分片，
 * 同时从两个**同域**来源并发拉——`?src=r2`（R2 镜像）与 `?src=gh`（Worker 边缘代理
 * GitHub，逐字节相同）——快源抢活、失败片换源重试，拼好后保存。GitHub 直链没有 CORS，
 * 不能当 fetch 来源，所以「GitHub 直连」永远只是普通链接。分片走不通（浏览器不支持、
 * 两个同域来源都探不到、文件太大放不进内存且没有文件系统 API）就退回普通链接。
 *
 * 渐进增强：下面的静态表格本身就是可用的 GitHub 链接。脚本没跑起来时页面仍然是一张
 * 能点的下载表。
 */

const { t } = useSiteI18n()

const DL_BASE = '/releases'
const GH_REPO = 'hajisensai/Fushi'
const GH_MANIFEST_BASE = 'https://raw.githubusercontent.com/hajisensai/Fushi/update-manifest/'
const PROBE_TIMEOUT_MS = 4000
const STORE_KEY = 'fushi-download-mirror'
/** 没有文件系统写入 API 时整包先落内存再存盘；超过这个体积不冒险，退回普通链接。 */
const MEMORY_SINK_LIMIT = 512 * 1024 * 1024

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
  { slot: 'ios',               nameZh: 'iOS',               noteKey: 'dl.p_ios',               noteZh: '随版本发布提供',                      channels: ['stable', 'debug'] },
]

/** 与 edge/src/manifest.ts 的 SLOTS 同一份判据（GitHub 静态清单兜底时在浏览器里解析）。 */
const SLOT_PATTERNS = {
  'android-arm64':     /^fushi-.*-arm64-v8a\.apk$/,
  'android-arm32':     /^fushi-.*-armeabi-v7a\.apk$/,
  'android-x64':       /^fushi-.*-x86_64\.apk$/,
  'android-universal': /^fushi-.*-debug\.apk$/,
  windows:             /^fushi-.*-windows-setup\.exe$/,
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
  const info = release.value?.slots?.[slot]
  if (!info) return 'https://github.com/' + GH_REPO + '/releases' + (channel.value === 'stable' ? '/latest' : '')
  if (activeMirror.value === 'cf') return DL_BASE + '/' + channelDef.value.path + '/' + slot
  return info.githubUrl || (
    'https://github.com/' + GH_REPO + '/releases/download/' +
    encodeURIComponent(release.value.tag) + '/' + encodeURIComponent(info.name)
  )
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

function chunkSupported() {
  return typeof window !== 'undefined' && typeof window.fetch === 'function' && typeof AbortController === 'function'
}

/** 点击「下载」：能分片就在页内分片并发下；否则让 <a> 照常导航。 */
function onDownloadClick(e, slot) {
  const info = release.value?.slots?.[slot]
  if (!info || !chunkSupported() || jobs[slot]) return
  e.preventDefault()
  startChunked(slot, info).catch(() => {})
}

async function startChunked(slot, info) {
  const tag = release.value.tag
  const controller = new AbortController()
  const job = reactive({ state: 'probing', pct: 0, speed: '', split: '', error: '', href: hrefFor(slot), controller })
  jobs[slot] = job

  let sink = null
  // 文件选择器必须在点击手势里同步打开（await 之后手势就没了），所以它排在探测之前。
  if (typeof window.showSaveFilePicker === 'function') {
    try {
      sink = await createBrowserSink({ filename: info.name, size: info.size || 0 })
    } catch (err) {
      if (err && err.name === 'AbortError') { delete jobs[slot]; return }
      sink = null
    }
  }

  const base = DL_BASE + '/v/' + encodeURIComponent(tag) + '/' + encodeURIComponent(info.name)
  const candidates = [
    { id: 'r2', url: base + '?src=r2', label: 'Cloudflare 镜像' },
    { id: 'gh', url: base + '?src=gh', label: 'GitHub 边缘代理' },
  ]
  let probedSources
  try {
    probedSources = await probeSources(candidates, { expectedSize: info.size || undefined, timeoutMs: PROBE_TIMEOUT_MS })
  } catch {
    probedSources = { sources: [], size: 0 }
  }
  if (!probedSources.sources.length || !probedSources.size) {
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
      signal: controller.signal,
      onProgress: (p) => {
        job.pct = Math.floor((p.bytesDone / p.bytesTotal) * 100)
        job.speed = formatSpeed(p.bytesPerSecond)
        job.split = splitText(p.perSource, p.bytesDone)
      },
    })
    job.pct = 100
    job.state = 'done'
  } catch (err) {
    if (err && err.name === 'AbortError') { delete jobs[slot]; return }
    job.state = 'failed'
    job.error = String((err && err.message) || err)
  }
}

/** 分片走不通：交回浏览器普通下载（同一个链接），状态留一行说明。 */
function fallbackToPlain(slot, job) {
  job.state = 'fallback'
  try { window.location.assign(job.href) } catch { /* 同步导航失败也无妨，链接还在表里 */ }
  setTimeout(() => { if (jobs[slot] === job) delete jobs[slot] }, 4000)
}

function cancelJob(slot) {
  const job = jobs[slot]
  if (!job) return
  if (job.state === 'downloading' || job.state === 'probing') job.controller.abort()
  else delete jobs[slot]
}

onMounted(async () => {
  try {
    const saved = localStorage.getItem(STORE_KEY)
    if (saved === 'auto' || saved === 'cf' || saved === 'gh') choice.value = saved
  } catch { /* 读不到就用默认的自动 */ }

  await Promise.all([
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
  <p class="dl-chunk-note">{{ t('dl.chunk_note', '点「下载」会在浏览器里把安装包切成多段，从 Cloudflare 镜像和 GitHub 边缘代理同时并发拉取（IDM 那种多线程加速），拼好后保存；不支持的浏览器自动退回普通下载。') }}</p>
</div>
<div class="dl-picker" v-else>
  <div class="dl-status">{{ t('dl.status_probing', '正在测试下载源…') }}</div>
</div>

<table class="dl-table">
  <thead><tr><th>{{ t('dl.th_platform', '平台') }}</th><th>{{ t('dl.th_note', '说明') }}</th><th>{{ t('dl.th_download', '下载') }}</th></tr></thead>
  <tbody>
    <tr v-for="p in rows" :key="p.slot">
      <td><b>{{ p.nameZh }}</b></td>
      <td>{{ t(p.noteKey, p.noteZh) }}</td>
      <td>
        <template v-if="!jobs[p.slot]">
          <a :href="hrefFor(p.slot)" rel="noopener" @click="onDownloadClick($event, p.slot)">
            {{ t('dl.download', '下载') }}<span v-if="sizeFor(p.slot)"> · {{ sizeFor(p.slot) }}</span>
          </a>
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
          <template v-else-if="jobs[p.slot].state === 'done'">
            <span class="dl-job-ok">{{ t('dl.chunk_done', '已完成，文件已保存') }}</span>
            <span class="dl-job-split" v-if="jobs[p.slot].split">{{ jobs[p.slot].split }}</span>
            <button type="button" @click="cancelJob(p.slot)">{{ t('dl.chunk_close', '收起') }}</button>
          </template>
          <template v-else-if="jobs[p.slot].state === 'fallback'">
            <span>{{ t('dl.chunk_fallback', '分片来源不可用，已改用普通下载。') }}</span>
          </template>
          <template v-else>
            <span class="dl-job-err">{{ t('dl.chunk_failed', '分片下载失败。') }}</span>
            <a :href="jobs[p.slot].href" rel="noopener">{{ t('dl.chunk_direct', '普通下载') }}</a>
            <button type="button" @click="cancelJob(p.slot)">{{ t('dl.chunk_close', '收起') }}</button>
          </template>
        </div>
      </td>
    </tr>
  </tbody>
</table>

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
.dl-table { display: table; width: 100%; }
.dl-table td:last-child a {
  display: inline-block; white-space: nowrap;
  color: var(--link); font-weight: 500;
}
.dl-job { display: flex; flex-direction: column; gap: 4px; min-width: 150px; font-size: 13px; }
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
<tr><td data-i18n="dl.guide_r4_a">Anki</td><td data-i18n="dl.guide_r4_b">连上 AnkiDroid / AnkiConnect，一键创建 Lapis 牌组</td></tr>
<tr><td data-i18n="dl.guide_r5_a">备份 · 互联 · 字体</td><td data-i18n="dl.guide_r5_b">按需配置，都可以跳过</td></tr>
</tbody>
</table>

<h2 data-i18n="dl.pack_title">推荐包：不用一本一本挑词典</h2>

<p data-i18n="dl.pack_p1">推荐包里是<strong>日语单词、音调、词频词典</strong>，外加<strong>日语 / 英语本地发音音频库</strong>，约 9.5 GB。在引导的「安装推荐包」那一步里直接下载并导入——分片并发、多镜像、断了能续，不用自己去找下载链接。</p>

<div class="custom-block warning">
<p class="custom-block-title" data-i18n="dl.pack_warn_title">在全新安装时做这一步</p>
<p data-i18n="dl.pack_warn_body">导入推荐包走的是备份导入流程，<strong>会覆盖本地已有数据</strong>。刚装好、还没导入自己的书和视频时做最合适。</p>
</div>

<p data-i18n="dl.pack_p2">学别的语言？跳过这一步，用词典管理导入任意 Yomitan / MDX (MDict) / DSL / Migaku 格式的词典即可。可查语言由你导入的词典决定，跟界面语言无关。</p>

<h2 data-i18n="dl.anki_title">接上 Anki</h2>

<p data-i18n="dl.anki_p1">Anki——名字来自「暗記（あんき）」——是世界上使用最广的<a href="https://zh.wikipedia.org/wiki/%E9%97%B4%E9%9A%94%E9%87%8D%E5%A4%8D">间隔重复（SRS）</a>软件。你在 Fushi 里查到的词一键送进 Anki，用最少的复习时间达到最好的记忆效果。先从 <a href="https://apps.ankiweb.net/">Anki 官网</a>装好它。</p>

<div class="custom-block tip">
<p class="custom-block-title" data-i18n="dl.anki_tip_title">务必做一件事</p>
<p data-i18n="dl.anki_tip_body">Anki 默认算法是 30 多年前的 SM2，效果很差。请在牌组选项里把算法切换成内置的 <strong>FSRS</strong>——世界上最好的间隔重复算法之一。</p>
</div>

<p data-i18n="dl.anki_p2">引导里的 Anki 那一步会带你走完下面的操作。想手动配、或者事后再配，路径是 <strong>设置 → 制卡</strong>。</p>

<h3 data-i18n="dl.anki_android_title">Android（AnkiDroid）</h3>

<ol>
<li data-i18n="dl.anki_android_1">安装并打开 Anki（AnkiDroid）。</li>
<li data-i18n="dl.anki_android_2">回到 Fushi，进入 <strong>设置 → 制卡</strong>。</li>
<li data-i18n="dl.anki_android_3">点 <strong>「刷新牌组与笔记模板」</strong>（图中 ①）；Fushi 会请求权限，点允许。</li>
<li data-i18n="dl.anki_android_4">点 <strong>「创建 Lapis 牌组」</strong>（图中 ②）。</li>
<li data-i18n="dl.anki_android_5">没有红色警告或报错，就配置成功了。</li>
</ol>

<p><img src="/images/guide/anki-android-setup.png" alt="Android 端 Anki 配置" data-i18n-attr="alt=dl.anki_android_img"></p>

<h3 data-i18n="dl.anki_windows_title">Windows（AnkiConnect）</h3>

<ol>
<li data-i18n="dl.anki_windows_1">安装并打开 Anki。</li>
<li data-i18n="dl.anki_windows_2">点左上角 <strong>「工具」</strong> 菜单 → 附加组件 → 获取插件。</li>
<li data-i18n="dl.anki_windows_3">粘贴插件代码安装 AnkiConnect：<code>2055492159</code>，然后重启 Anki。</li>
<li data-i18n="dl.anki_windows_4">回到 Fushi，进入 <strong>设置 → 制卡</strong>。</li>
<li data-i18n="dl.anki_windows_5">点 <strong>「刷新牌组与笔记模板」</strong>（图中 ①）。</li>
<li data-i18n="dl.anki_windows_6">点 <strong>「创建 Lapis 牌组」</strong>（图中 ②）。</li>
<li data-i18n="dl.anki_windows_7">没有红色警告或报错，就配置成功了。</li>
</ol>

<p><img src="/images/guide/anki-windows-tools-menu.png" alt="Anki Windows 工具菜单" data-i18n-attr="alt=dl.anki_windows_img1"></p>

<p><img src="/images/guide/anki-windows-setup.png" alt="Windows 端 Anki 配置" data-i18n-attr="alt=dl.anki_windows_img2"></p>

<p data-i18n="dl.anki_p3">配完可以顺手去设置里逛一圈：阅读主题、字体、注音假名、界面缩放都能按自己习惯调，不调也完全能用。</p>

<hr>

<p class="eyebrow" data-i18n="dl.then_eyebrow">然后呢</p>

<h2 data-i18n="dl.immerse_title">别背单词表，从沉浸开始</h2>

<p data-i18n="dl.immerse_p1">语料选你喜欢的，这是最重要的一点。推荐从<strong>动漫（首选）</strong>、视觉小说或有声书开始。语料有难有易，不必勉强选择过难的内容。</p>

<p data-i18n="dl.immerse_p2">遇到看不懂的词，点击查词并制卡（太难的句子或状态不好时可以跳过）。遇到一整段看不懂的时候，可以尝试查词理解，理解不了也没关系——跳过它。<strong>学会忍受模糊感</strong>，看不懂不要紧，随着沉浸量的积累，自然就能看懂。</p>

<p data-i18n="dl.immerse_p3">学习是一个慢慢积累的过程。选择你真正喜欢的语料，<strong>兴趣永远是第一位的</strong>——只有喜欢，才能坚持天天沉浸。</p>

<div class="custom-block tip">
<p class="custom-block-title" data-i18n="dl.tip_start_title">关于起步时机</p>
<p data-i18n="dl.tip_start_body">不需要等词汇量很大才开始沉浸。背够 500–1000 词时就可以开始了，甚至任何你想开始的时候都可以。</p>
</div>

<div class="custom-block tip">
<p class="custom-block-title" data-i18n="dl.tip_listening_title">关于听力提升</p>
<p data-i18n="dl.tip_listening_body">当你积累到 2000–5000 词左右时，可以尝试隐藏字幕看动画，这对听力帮助非常大。</p>
</div>

<div class="custom-block tip">
<p class="custom-block-title" data-i18n="dl.tip_subs_title">关于字幕</p>
<p data-i18n="dl.tip_subs_body">字幕选用目标语言字幕，即和视频语言一致的字幕。起步阶段听不懂时可以叠加母语副字幕辅助理解，但这只是拐杖——应尽早丢掉。等词汇量积累到一定程度，可以尝试隐藏字幕。</p>
</div>

<hr>

<p data-i18n="dl.closing_p1">导入一本 EPUB、拖进一集番、或者直接在应用里搜索下载——遇到不认识的词，点一下查，再点一下记住它。</p>

<p data-i18n="dl.closing_p2">有问题来 <a href="https://discord.gg/WhjwyGmm7f">Discord</a> 或 <a href="https://qm.qq.com/q/Sx2nWTvJCw">QQ 群</a> 问，反馈会被很快处理。更多语言版本的完整指南见<a href="https://ncnies6wfjok.feishu.cn/wiki/OZbww3T3IiEAx5kBhHkcF07vncb">简体中文（飞书）</a>和 <a href="https://github.com/hajisensai/Fushi/blob/main/docs/user-guide.md">English Guide</a>。</p>
