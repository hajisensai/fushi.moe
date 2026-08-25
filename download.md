<script setup>
import { ref, computed, onMounted } from 'vue'

/*
 * 下载源选择。
 *
 * 两个源走的是完全不同的网络路径：fushi.moe/releases 落在 Cloudflare（R2 出网免费，
 * 回源 GitHub Releases 兜底），github.com 是直连。哪条通、哪条快因人而异，
 * 所以默认「自动」——并发探一次，谁先应答用谁；同时留手动切换，
 * 选择记在 localStorage 里。
 *
 * 渐进增强：下面的静态表格本身就是可用的 GitHub 链接。这段脚本只做升级，
 * 探测全失败或脚本没跑起来时，页面仍然是一张能点的下载表。
 */

const DL_BASE = '/releases'
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
    const r = await withTimeout(fetch(DL_BASE + '/api/latest', { cache: 'no-store' }), PROBE_TIMEOUT_MS)
    if (r.ok) {
      const d = await r.json()
      release.value = { tag: d.tag, slots: d.slots }
      metaSource.value = 'fushi.moe'
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
        slots[slot] = a ? { url: DL_BASE + '/latest/' + slot, name: a.name, size: a.size } : null
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
  if (activeMirror.value === 'cf') return DL_BASE + '/latest/' + slot
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
    probe('cf', DL_BASE + '/api/latest'),
    // GitHub 不给我们 CORS，用 no-cors 只看连不连得上，不读内容
    probe('gh', 'https://github.com/' + GH_REPO + '/releases/latest', { mode: 'no-cors' }),
    loadRelease(),
  ])
  probing.value = false
})
</script>

# 下载 Fushi

<p class="lead">选一个平台装上，剩下的交给应用内的新手引导。四个平台同一套体验，全部免费开源。</p>

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

历史版本见[全部 Releases](https://github.com/hajisensai/Fushi/releases)。

<noscript>

浏览器禁用了 JavaScript，下面是直接的 GitHub 下载入口：

- [最新 Release（选择对应平台的文件）](https://github.com/hajisensai/Fushi/releases/latest)
- Android 选 `arm64` 的 `.apk`，Windows 选 `.exe`，macOS 选 `.zip`，iOS 选 `.ipa`

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
.dl-picker {
  margin: 30px 0 22px;
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
.dl-table { display: table; width: 100%; }
.dl-table td:last-child a {
  display: inline-block; white-space: nowrap;
  color: var(--link); font-weight: 500;
}
.dl-warn { color: var(--ink-2); font-size: 14px; }
</style>

---

<p class="eyebrow">装好之后</p>

## 跟着新手引导走就行

第一次启动 Fushi 会自动打开新手引导：先问你想用哪些功能，再一步步把推荐词典包、Anki、备份同步和阅读字体配好。中途关掉了想重来，路径是 **设置 → 系统 → 新手引导**。

| 引导步骤 | 做什么 |
|---|---|
| 欢迎 | 选界面语言和明暗主题 |
| 功能选择 | 勾掉用不上的模块，它们不会出现在底栏 |
| 推荐包 | 下载并导入日语词典 + 日/英发音音频库 |
| Anki | 连上 AnkiDroid / AnkiConnect，一键创建 Lapis 牌组 |
| 备份 · 互联 · 字体 | 按需配置，都可以跳过 |

## 推荐包：不用一本一本挑词典

推荐包里是**日语单词、音调、词频词典**，外加**日语 / 英语本地发音音频库**，约 9.5 GB。在引导的「安装推荐包」那一步里直接下载并导入——分片并发、多镜像、断了能续，不用自己去找下载链接。

::: warning 在全新安装时做这一步
导入推荐包走的是备份导入流程，**会覆盖本地已有数据**。刚装好、还没导入自己的书和视频时做最合适。
:::

学别的语言？跳过这一步，用词典管理导入任意 Yomitan / MDX (MDict) / DSL / Migaku 格式的词典即可。可查语言由你导入的词典决定，跟界面语言无关。

## 接上 Anki

Anki——名字来自「暗記（あんき）」——是世界上使用最广的[间隔重复（SRS）](https://zh.wikipedia.org/wiki/%E9%97%B4%E9%9A%94%E9%87%8D%E5%A4%8D)软件。你在 Fushi 里查到的词一键送进 Anki，用最少的复习时间达到最好的记忆效果。先从 [Anki 官网](https://apps.ankiweb.net/)装好它。

::: tip 务必做一件事
Anki 默认算法是 30 多年前的 SM2，效果很差。请在牌组选项里把算法切换成内置的 **FSRS**——世界上最好的间隔重复算法之一。
:::

引导里的 Anki 那一步会带你走完下面的操作。想手动配、或者事后再配，路径是 **设置 → 制卡**。

### Android（AnkiDroid）

1. 安装并打开 Anki（AnkiDroid）。
2. 回到 Fushi，进入 **设置 → 制卡**。
3. 点 **「刷新牌组与笔记模板」**（图中 ①）；Fushi 会请求权限，点允许。
4. 点 **「创建 Lapis 牌组」**（图中 ②）。
5. 没有红色警告或报错，就配置成功了。

![Android 端 Anki 配置](/images/guide/anki-android-setup.png)

### Windows（AnkiConnect）

1. 安装并打开 Anki。
2. 点左上角 **「工具」** 菜单 → 附加组件 → 获取插件。
3. 粘贴插件代码安装 AnkiConnect：`2055492159`，然后重启 Anki。
4. 回到 Fushi，进入 **设置 → 制卡**。
5. 点 **「刷新牌组与笔记模板」**（图中 ①）。
6. 点 **「创建 Lapis 牌组」**（图中 ②）。
7. 没有红色警告或报错，就配置成功了。

![Anki Windows 工具菜单](/images/guide/anki-windows-tools-menu.png)

![Windows 端 Anki 配置](/images/guide/anki-windows-setup.png)

配完可以顺手去设置里逛一圈：阅读主题、字体、注音假名、界面缩放都能按自己习惯调，不调也完全能用。

---

<p class="eyebrow">然后呢</p>

## 别背单词表，从沉浸开始

语料选你喜欢的，这是最重要的一点。推荐从**动漫（首选）**、视觉小说或有声书开始。语料有难有易，不必勉强选择过难的内容。

遇到看不懂的词，点击查词并制卡（太难的句子或状态不好时可以跳过）。遇到一整段看不懂的时候，可以尝试查词理解，理解不了也没关系——跳过它。**学会忍受模糊感**，看不懂不要紧，随着沉浸量的积累，自然就能看懂。

学习是一个慢慢积累的过程。选择你真正喜欢的语料，**兴趣永远是第一位的**——只有喜欢，才能坚持天天沉浸。

::: tip 关于起步时机
不需要等词汇量很大才开始沉浸。背够 500–1000 词时就可以开始了，甚至任何你想开始的时候都可以。
:::

::: tip 关于听力提升
当你积累到 2000–5000 词左右时，可以尝试隐藏字幕看动画，这对听力帮助非常大。
:::

::: tip 关于字幕
字幕选用目标语言字幕，即和视频语言一致的字幕。起步阶段听不懂时可以叠加母语副字幕辅助理解，但这只是拐杖——应尽早丢掉。等词汇量积累到一定程度，可以尝试隐藏字幕。
:::

---

导入一本 EPUB、拖进一集番、或者直接在应用里搜索下载——遇到不认识的词，点一下查，再点一下记住它。

有问题来 [Discord](https://discord.gg/WhjwyGmm7f) 或 [QQ 群](https://qm.qq.com/q/Sx2nWTvJCw) 问，反馈会被很快处理。更多语言版本的完整指南见[简体中文（飞书）](https://ncnies6wfjok.feishu.cn/wiki/OZbww3T3IiEAx5kBhHkcF07vncb)和 [English Guide](https://github.com/hajisensai/Fushi/blob/main/docs/user-guide.md)。
