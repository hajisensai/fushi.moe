<script setup>
import { ref, computed, onMounted } from 'vue'

/*
 * 下载源选择。
 *
 * 两个源走的是完全不同的网络路径：dl.fushi.moe 落在 Cloudflare（R2 出网免费，
 * 回源 GitHub Releases 兜底），github.com 是直连。哪条通、哪条快因人而异，
 * 所以默认「自动」——并发探一次，谁先应答用谁；同时留手动切换，
 * 选择记在 localStorage 里。
 *
 * 渐进增强：下面的静态表格本身就是可用的 GitHub 链接。这段脚本只做升级，
 * 探测全失败或脚本没跑起来时，页面仍然是一张能点的下载表。
 */

const DL_HOST = 'https://dl.fushi.moe'
const GH_REPO = 'hajisensai/Fushi'
const PROBE_TIMEOUT_MS = 4000
const STORE_KEY = 'fushi-download-mirror'

const PLATFORMS = [
  { slot: 'android-arm64', name: 'Android (arm64)', note: '绝大多数手机选这个，需 Android 7.0+' },
  { slot: 'android-arm32', name: 'Android (arm32)', note: '较老的 32 位机型' },
  { slot: 'android-x64',   name: 'Android (x86_64)', note: '模拟器 / x86 平板' },
  { slot: 'windows',       name: 'Windows',         note: '含 Galgame 语音挖掘、桌面划词' },
  { slot: 'macos',         name: 'macOS',           note: 'Apple Silicon 与 Intel 通用' },
  { slot: 'ios',           name: 'iOS',             note: '随版本发布提供' },
]

const MIRRORS = [
  { id: 'cf', name: 'Cloudflare 镜像', hint: '经 R2 分发，多数地区更快' },
  { id: 'gh', name: 'GitHub 直连',     hint: '官方发布源' },
]

const choice = ref('auto')            // 'auto' | 'cf' | 'gh'
const probed = ref({})                // id -> { ok, ms }
const probing = ref(true)
const release = ref(null)             // { tag, slots }
const metaSource = ref('')            // 清单是从哪拿到的

const activeMirror = computed(() => {
  if (choice.value !== 'auto') return choice.value
  const ranked = MIRRORS
    .map((m) => ({ id: m.id, ...(probed.value[m.id] ?? {}) }))
    .filter((m) => m.ok)
    .sort((a, b) => a.ms - b.ms)
  return ranked.length ? ranked[0].id : 'gh'
})

const activeMirrorName = computed(
  () => MIRRORS.find((m) => m.id === activeMirror.value)?.name ?? '未知',
)

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(
      (v) => { clearTimeout(t); resolve(v) },
      (e) => { clearTimeout(t); reject(e) },
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

/** 清单本身也要有备份路径：dl 拿不到就直接问 GitHub，再不行退回静态表。 */
async function loadRelease() {
  try {
    const r = await withTimeout(fetch(DL_HOST + '/api/latest', { cache: 'no-store' }), PROBE_TIMEOUT_MS)
    if (r.ok) {
      const d = await r.json()
      release.value = { tag: d.tag, slots: d.slots }
      metaSource.value = 'dl.fushi.moe'
      return
    }
  } catch { /* 落到下一条 */ }

  try {
    const r = await withTimeout(
      fetch('https://api.github.com/repos/' + GH_REPO + '/releases/latest', { cache: 'no-store' }),
      PROBE_TIMEOUT_MS,
    )
    if (r.ok) {
      const d = await r.json()
      const slots = {}
      const patterns = {
        'android-arm64': /^fushi-.*-arm64-v8a\.apk$/,
        'android-arm32': /^fushi-.*-armeabi-v7a\.apk$/,
        'android-x64':   /^fushi-.*-x86_64\.apk$/,
        windows:         /^fushi-.*-windows-setup\.exe$/,
        macos:           /^fushi-.*-macos\.zip$/,
        ios:             /^fushi-.*-ios\.ipa$/,
      }
      for (const [slot, re] of Object.entries(patterns)) {
        const a = (d.assets ?? []).find((x) => re.test(x.name))
        slots[slot] = a ? { url: DL_HOST + '/latest/' + slot, name: a.name, size: a.size } : null
      }
      release.value = { tag: d.tag_name, slots }
      metaSource.value = 'api.github.com'
      return
    }
  } catch { /* 静态表兜底 */ }

  metaSource.value = ''
}

function hrefFor(slot) {
  const info = release.value?.slots?.[slot]
  if (!info) return 'https://github.com/' + GH_REPO + '/releases/latest'
  if (activeMirror.value === 'cf') return DL_HOST + '/latest/' + slot
  return (
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

onMounted(async () => {
  try {
    const saved = localStorage.getItem(STORE_KEY)
    if (saved === 'auto' || saved === 'cf' || saved === 'gh') choice.value = saved
  } catch { /* 读不到就用默认的自动 */ }

  await Promise.all([
    probe('cf', DL_HOST + '/api/latest'),
    // GitHub 不给我们 CORS，用 no-cors 只看连不连得上，不读内容
    probe('gh', 'https://github.com/' + GH_REPO + '/releases/latest', { mode: 'no-cors' }),
    loadRelease(),
  ])
  probing.value = false
})
</script>

# 下载 Fushi

<div class="dl-picker" v-if="!probing">
  <div class="dl-status">
    正在使用 <b>{{ activeMirrorName }}</b>
    <span v-if="release" class="sep">· 版本 {{ release.tag }}</span>
    <span v-if="choice === 'auto'" class="dl-auto">（自动选择）</span>
  </div>
  <div class="dl-buttons">
    <button :class="{ on: choice === 'auto' }" @click="pick('auto')">自动</button>
    <button
      v-for="m in MIRRORS" :key="m.id"
      :class="{ on: choice === m.id, dead: probed[m.id] && !probed[m.id].ok }"
      :title="m.hint"
      @click="pick(m.id)"
    >
      {{ m.name }}
      <small v-if="probed[m.id] && probed[m.id].ok">{{ probed[m.id].ms }}ms</small>
      <small v-else-if="probed[m.id]">连不上</small>
    </button>
  </div>
</div>
<div class="dl-picker" v-else>
  <div class="dl-status">正在测试下载源…</div>
</div>

<table class="dl-table">
  <thead><tr><th>平台</th><th>说明</th><th>下载</th></tr></thead>
  <tbody>
    <tr v-for="p in PLATFORMS" :key="p.slot">
      <td><b>{{ p.name }}</b></td>
      <td>{{ p.note }}</td>
      <td>
        <a :href="hrefFor(p.slot)" rel="noopener">
          下载<span v-if="sizeFor(p.slot)"> · {{ sizeFor(p.slot) }}</span>
        </a>
      </td>
    </tr>
  </tbody>
</table>

<p v-if="!probing && !metaSource" class="dl-warn">
  没能取到版本清单（两个源都没应答），上面的按钮会带你去 GitHub Releases 页面手动选择。
</p>

Linux 暂无预编译包，请[从源码构建](https://github.com/hajisensai/Fushi#building)。

装好之后，花五分钟照着[上手教程](/guide)配好推荐词典和 Anki，就可以开始了。历史版本见[全部 Releases](https://github.com/hajisensai/Fushi/releases)。

<noscript>

浏览器禁用了 JavaScript，下面是直接的 GitHub 下载入口：

- [最新 Release（选择对应平台的文件）](https://github.com/hajisensai/Fushi/releases/latest)
- Android 选 `arm64` 的 `.apk`，Windows 选 `.exe`，macOS 选 `.zip`，iOS 选 `.ipa`

</noscript>

<style scoped>
.dl-picker {
  margin: 1.2rem 0;
  padding: 0.9rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.dl-status { font-size: 0.95rem; margin-bottom: 0.6rem; }
.dl-status .sep { margin-left: 0.35rem; }
.dl-auto { color: var(--vp-c-text-2); margin-left: 0.35rem; }
.dl-buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.dl-buttons button {
  padding: 0.35rem 0.8rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  font-size: 0.9rem;
  cursor: pointer;
}
.dl-buttons button.on {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.dl-buttons button.dead { opacity: 0.55; }
.dl-buttons small { color: var(--vp-c-text-2); margin-left: 0.3rem; }
.dl-table { display: table; width: 100%; }
.dl-warn { color: var(--vp-c-text-2); font-size: 0.9rem; }
</style>
