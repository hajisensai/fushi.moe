# 多来源故障切换：部署与运维

这套东西要解决的是一句话：**用户连不上 Cloudflare 时能走 GitHub，连不上 GitHub 时能走 Cloudflare，而且全程无感——地址栏永远是 `fushi.moe`，不需要用户选线路、不弹窗、不跳域名。**

---

## 先说清楚做不到的部分

原本的设想是在 DNS 层做分流。**在只有 Cloudflare + GitHub、不买服务器也不买付费 DNS 的前提下，这条路走不通**，原因是平台边界而不是选型：

- Cloudflare Pages / Worker 承载要求域名 NS 在 Cloudflare，且该主机名必须是橙云代理。一旦代理，DNS 只返回 CF 的 anycast IP，**没法和 GitHub Pages 的 `185.199.108-111.153` 并列在同一组 A 记录里**。
- 反向也堵死：Cloudflare 禁止在自己的 DNS 里把自家 IP 写成灰云 A 记录；CNAME 到 `*.pages.dev` / `*.workers.dev` 走灰云则证书名不匹配。
- 付费的 CF Load Balancing 不在本方案约束内；这里不依赖它，也不把付费产品的行为当成免费方案的论据。
- DNSPod 那类智能 DNS 能做境内/境外分线路，但**分线路解析是专业版及以上功能**（免费版只有默认线路，最低 TTL 600 秒），而且它真正的价值需要一台自己的境内可达服务器来承接——那是另一笔钱。

所以切换被挪到了 DNS 的**上面一层（浏览器里的 Service Worker）和下面一层（Cloudflare 边缘的 Worker）**。效果对用户仍然是无感的，但有一个补不上的缺口，写在覆盖矩阵最后一行。

---

## 拓扑

```
fushi.moe             橙云 → Worker ┬→ 主  fushi-moe.pages.dev      (Cloudflare Pages)
                                    └→ 备  hajisensai.github.io/fushi.moe
                                              (GitHub Pages 项目站)

fushi.moe/releases/*  同一 Worker ┬→ 主  R2 桶 fushi-releases
                                  └→ 备  github.com/.../releases/download/...

浏览器里的 Service Worker：fushi.moe ⇄ hajisensai.github.io/fushi.moe 互为备份
```

两个回源目标都用**平台自带域**，下载也走主域路径，所以不会给用户多出一个别名域名。`hajisensai.github.io/fushi.moe` 只在 SW 和 Worker 内部用，地址栏永远显示 `fushi.moe`。

注意 GitHub 这一侧是**项目站**，不是用户根站：`https://hajisensai.github.io/` 实际返回 404。Worker 与 SW 都必须给回源路径加 `/fushi.moe`，否则备源看起来配置好了，故障时却只会得到 404。

---

## 覆盖矩阵

| 故障场景 | 谁来救 | 生效速度 | 用户感知 |
|---|---|---|---|
| CF Pages 构建坏 / 回滚事故 | 边缘 Worker 回源 GitHub | 秒级 | 无感 |
| GitHub Pages 挂 | 常态就在 CF，不受影响 | — | 无感 |
| 用户线路连不上 CF（**回访用户**） | SW 改从 GitHub Pages 项目站取 | 秒级 | 无感，地址栏不变 |
| 用户线路连不上 GitHub | 常态就走 CF | — | 无感 |
| 下载：R2 不可达 | Worker 302 到 GitHub Releases | 秒级 | 无感 |
| 下载：GitHub 挂 | Worker 走 R2 + R2 里的 `manifest.json` | 秒级 | 无感 |
| 下载页：某个源不通 | 页面自动选可用的那个，并允许手动切 | 秒级 | 看得到，可干预 |
| **首次访问 + 当时正好连不上 CF** | **没有人能救** | — | **打不开** |

最后一行是这套方案的真实边界。要补它只有两条路：一台自己的（境内可达的）服务器，或者付费的分线路 DNS。两条都被明确排除了，所以这里不做粉饰。

---

## 绝不要用本地构建部署任一侧

两侧必须来自**同一次构建的同一份产物**。`deploy.yml` 里 build job 只跑一次、
两个 deploy job 复用同一个 `site-dist` artifact，就是为了这条。

实测（同一个 commit `c835bf1`，CI Linux vs 本机 Windows）：

| | |
|---|---|
| 相同文件 | 477 |
| **不同文件** | **12** |
| 构建指纹 | `c0418340…` vs `0fc4daed…` |
| 资源文件名 | `assets/app.CfYtMa4H.js` vs `assets/app.Dy3bQNnK.js` |

差异落在**内容哈希的资源文件名**上，所以后果不是「版本略旧」，而是：浏览器从 A 拿到
HTML、切到 B 之后去请求 B 上根本不存在的资源名 —— **整页 404**。这正是跨源切换
最怕的失效方式，而且只在真正发生故障切换时才暴露。

必须手动部署某一侧时（例如首次建 Pages 项目），**取 CI 的 artifact，不要本地构建**：

```bash
# 取 main 上最近一次成功构建的产物
RID=$(gh run list --repo hajisensai/fushi.moe --workflow "Deploy site" --branch main --status success --limit 1 --json databaseId --jq '.[0].databaseId')
gh run download "$RID" --repo hajisensai/fushi.moe --name site-dist --dir ci-dist
npx wrangler pages deploy ci-dist --project-name=fushi-moe --branch=main
```

部署完用 `/__build.json` 对一次指纹，两侧必须逐字相同。

---

## 推荐包分发（`/pack`）

新手引导的推荐包约 **9.5 GB**，切片放 `hajisensai/fushi-pack` 的 release。
对外只有两条路径：

| 路径 | 上游 | 缓存 |
|---|---|---|
| `/pack/manifest.json` | `github.com/<pack repo>/releases/latest/download/manifest.json` | 300s + must-revalidate |
| `/pack/<tag>/<name>` | `github.com/<pack repo>/releases/download/<tag>/<name>` | immutable 一年 |

三条设计约束，改之前先读懂：

1. **不碰 GitHub API**。`releases/latest/download/<name>` 是 GitHub 自带的、
   会 302 到最新 release 的稳定端点，所以不需要 API、不需要限流熔断、不需要清单缓存。
2. **推荐包不碰 R2**。9.5 GB 会吃满免费存储；推荐包固定走 GitHub Release +
   普通 Workers Cache，应用安装包才使用受总量守卫约束的专用 R2 桶。
3. **滚动路径绝不能 immutable**。只有 `/pack/manifest.json` 是滚动的，切片路径带 tag。
   滚动 URL 配长缓存会让同一次下载拿到新旧混合的分片，逐片 sha256 会红、9.5 GB 白下。

客户端只硬编码 `/pack/manifest.json` 一个地址，清单里的切片 URL 自带 tag。
**换包 = 在 `fushi-pack` 发一个新 release**，app 一个字都不用改，也不用发版。

清单的 `part_base_urls` 同时写 GitHub 直链和 `https://fushi.moe/pack/<tag>/`：
两者逐字节相同（后者就是前者的边缘代理），下载器把它们挂到同一个分片上并发拉，
拼完的 sha256 一定对得上。分片按片号轮换来源（Fushi 仓库 #984）。

---

## 激活步骤

前四步做完之前，站点保持现状（GitHub Pages 直接服务 `fushi.moe`），什么都不会坏。

### 1. 把 `fushi.moe` 的 NS 迁到 Cloudflare

在 Namesilo 后台把 NS 从 `ns1/ns2/ns3.dnsowl.com` 改成 Cloudflare 分配的两个。等生效（通常几分钟到几小时）。

### 2. 建 Cloudflare 资源

- **Pages 项目**：名字必须是 `fushi-moe`（`wrangler.toml` 和 workflow 里写死了这个名字）。不用连 Git，产物由 CI 推。
- **R2 桶**：名字 `fushi-releases`。Worker 的 Wrangler 配置声明了这个 binding，首次部署 Worker 前必须建好；运行时某个对象不存在或 R2 读取失败时才会回退 GitHub。
- **API Token**：模板选「编辑 Cloudflare Workers」，再补上这几项权限：
  - `Account / Cloudflare Pages / Edit`
  - `Account / Workers R2 Storage / Edit`
  - `Account / Workers Scripts / Edit`
  - `Zone / Workers Routes / Edit`（zone 选 `fushi.moe`）

### 3. 配密钥

两个仓库都要配同样的两个：

| Secret | 放哪 | 用途 |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | `hajisensai/fushi.moe` + `hajisensai/Fushi` | Pages / Worker 部署、R2 上传 |
| `CLOUDFLARE_ACCOUNT_ID` | 同上 | 同上 |

没配之前，所有 Cloudflare 相关的 job 都会**跳过并留一条 notice**，不会让 CI 变红。

### 4. 首次部署 Pages，并确认两侧都活着

推一次 `main`，等 workflow 跑完，然后：

```bash
curl -s https://fushi-moe.pages.dev/__build.json
curl -s https://hajisensai.github.io/fushi.moe/__build.json
```

两边的 `fingerprint` 必须**完全一致**。不一致说明两个部署 job 拿到的不是同一份产物，这时**不要往下走**——见下面「为什么两侧必须字节一致」。

### 5. 把 Pages 设为真实底层 origin，再启用 Worker Route

在 Cloudflare Pages 项目里添加自定义域 `fushi.moe`。Cloudflare 会创建并代理对应 DNS 记录；然后把仓库变量 `CLOUDFLARE_EDGE_ENABLED` 设为 `true`，重跑部署 workflow，让 Worker Route 接到 `fushi.moe/*` 前面。

**不要**把 DNS 指向 `192.0.2.1` / `100::` 之类的占位黑洞。Worker Route 的平台级 fail-open 会把请求交给 DNS 背后的真实 origin；底下是 Pages 才能继续出站，底下是黑洞就仍然全站失败。

Worker 的路由写在 `edge/wrangler.toml` 里，启用仓库变量后由 CI 自动创建。模块入口也调用 `ctx.passThroughOnException()`，未捕获异常或平台限制触发时会回落到 Pages；普通回源异常仍由代码切到 GitHub。

### 6. 删掉 `CNAME` 文件 ← 只能在这一步做

仓库根的 `CNAME` 目前内容是 `fushi.moe`，**它正是现在 GitHub Pages 能服务 `fushi.moe` 的原因**。

- **切 DNS 之前删它 = 官网立刻下线。**
- 切完之后必须删它：留着的话 `hajisensai.github.io` 会 301 跳回 `fushi.moe`，备源就形同虚设——SW 切过去只会拿到一个跳回死线路的重定向。

```bash
git rm CNAME && git commit -m "chore: 切换到 Cloudflare 主入口，释放 github.io 作为独立备源" && git push
```

删完再确认一次：

```bash
curl -sI https://hajisensai.github.io/fushi.moe/ | head -3   # 必须是 200，不能是 301
```

### 7. 验证 Worker 的平台级 fail-open

Route 的未捕获异常回退由代码里的 `ctx.passThroughOnException()` 开启。确认临时抛出测试异常时响应仍来自底层 Pages，再撤掉测试；不要只看面板文案就当作验收。

---

## 为什么两侧必须字节一致

VitePress 的资源文件名带内容哈希（`assets/app.DluNi9Ct.js`）。如果两个来源部署的不是同一次构建：

用户从 A 拿到 HTML → 切换到 B → 请求 A 版本的资源 → **B 上不存在 → 整页白屏**。

所以 CI 里**只构建一次**，两个部署 job 复用同一个 artifact（`.github/workflows/deploy.yml` 的 `site-dist`）。

`tool/build-fingerprint.mjs` 会把整个 dist 的内容哈希写进 `/__build.json`，Worker 的 `/__health` 会同时拉两侧的这个文件做比对：

```bash
curl -s https://fushi.moe/__health | jq
```

```json
{
  "ok": true,
  "inSync": true,          // ← 这个变成 false 就说明两侧产物不一致，必须立刻处理
  "origins": {
    "cf": { "breaker": "closed", "probe": "ok", "build": "aefd95…" },
    "gh": { "breaker": "closed", "probe": "ok", "build": "aefd95…" }
  },
  "mirror": { "bound": true, "breaker": "closed" },
  "githubManifest": {
    "source": "update-manifest/latest-stable-fushi.json",
    "breaker": "closed"
  }
}
```

把这个地址挂到任意免费的 uptime 监控上（它在两侧都健康时返回 200，都不健康时返回 503），顺带就把备源的可用性也持续验证了——**冷备是故障切换失败的头号原因**，所以这里刻意选择用探测来验证备源，而不是靠分流真实流量（分流会让一部分用户在两侧不一致时直接撞 404）。

---

## 破窗回退

**症状：Cloudflare 大面积故障，站点整体打不开。**

Cloudflare DNS 面板里把 `fushi.moe` 改成：

| 名称 | 类型 | 值 | 代理 |
|---|---|---|---|
| `fushi.moe` | CNAME | `hajisensai.github.io` | **灰云（DNS only）** |

同时把 `CNAME` 文件加回仓库并推一次，让 GitHub Pages 重新认领这个域名。

诚实的边界：如果 Cloudflare 连 DNS 一起挂了，这一步也做不了，只能等。要跨过 Cloudflare 整体故障，就必须把 DNS 托管放在别家——那是另一个决定。

**症状：Worker 自己出问题。**

Worker 里可捕获的未预料异常会走代码级 `failOpen`，直接代理 GitHub 项目站；运行时级异常由 `passThroughOnException` 落到 DNS 背后的 Pages。真要彻底摘掉它：Cloudflare 面板删掉 `fushi.moe/*` 的 Worker 路由，请求就直接落到 Pages。

**症状：SW 把用户卡住了。**

SW 的每条失败路径最后都会退回一次最普通的 `fetch`，正常情况下不会卡人。真要强制清掉，在页面 console 里：

```js
navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()))
```

或者给已装的 SW 发 `fushi-sw-unregister` 消息（`sw.js` 里有对应处理）。

---

## 下载链路

`fushi.moe/releases` 的路由：

| 路径 | 行为 |
|---|---|
| `/releases/latest/<slot>` | 最新正式版的某个平台包。`slot` 见 `edge/src/manifest.ts` 的 `SLOTS`；`/stable/` 同义 |
| `/releases/debug/<slot>` `/releases/beta/<slot>` | 其它发布通道（清单分别读 `latest-debug-fushi.json` / `latest-beta-fushi.json`）。调试版 Android 只有 `android-universal` 一个通用包 |
| `/releases/v/<tag>/<文件名>` | 指定版本的指定文件。**不依赖清单**：清单挂了也按 tag/文件名拼直链服务 |
| `/releases/api/latest[?channel=stable\|debug\|beta]` | JSON 清单，下载页用它渲染；应答带回 `channel`，页面据此识别不认 `?channel=` 的老 Worker |
| `/releases` | 302 回 `fushi.moe/download` |

每个请求先看 R2 里有没有（支持 Range，断点续传可用），没有就 302 到 GitHub Releases。

资产路由另接受 `?src=r2` / `?src=gh` 显式点名来源，给下载页的**分片加速**（IDM 式多连接 Range 下载）用：
浏览器只能 fetch 同域——GitHub 直链没有 CORS 头（实测 302 与 206 都不带 `access-control-allow-origin`），
302 过去就是一次失败的跨域请求。所以 `?src=gh` 由 Worker 把字节搬过来（Range 透传、206 原样回，
`x-fushi-mirror: github-edge`，上游 5xx 给 502），`?src=r2` 未命中给 404 而不是 302——下载器靠这两个
明确的失败判「这个来源没有」并把分片交给另一个来源。两个来源逐字节相同，拼完的文件一致。
分片请求都带 Range，Workers Cache 只存整文件的 200 应答，不会把 300 MB 塞进边缘缓存。版本清单优先读 `Fushi` 仓库 `update-manifest` 分支里的
`latest-stable-fushi.json`：它由现有发布 CI 自动更新，是普通静态文件，完全不调用
`api.github.com`；GitHub 静态清单拿不到时才用 R2 里的 `manifest.json`。

R2 镜像由发布仓库的 `.github/workflows/mirror-releases.yml` 在 release 发布后被动同步，只镜像正式版、保留最近 2 个版本。workflow 必须在上传前按专用桶的保守总量上限做预检并先清理旧版本；预计超限就跳过，不能靠 R2 账单提醒（它不会硬停）。`wrangler r2 object put` 没有 multipart，**超过 300MB 的资产会被跳过**，对应平台自动回退 GitHub。

推荐包分片本身不进 R2：带 tag 的 GitHub Release URL 在 GitHub 允许 Worker 回源的
colo 通过普通 Workers Cache 缓存一年，滚动 manifest 只缓存 5 分钟；如果 GitHub
拒绝 Cloudflare 出口回源，Worker 立即 302 到同一个公开资产让客户端直连，不返回
502。全程不启用付费的 Cache Reserve。

下载页本身还有一层独立的选源：并发探测两个源，自动用通的那个，也允许手动切换（记在 localStorage）。清单三级降级：`fushi.moe/releases/api/latest` → GitHub 静态 `update-manifest` JSON → 静态表。**即使脚本完全没跑起来，SSR 产物里每一行也已经带着可用的 GitHub 链接**，下载页不会变成空壳。

点「下载」时，页面先用 `?src=r2` / `?src=gh` 各发一个小 Range 探测，能用的来源按耗时排序后，
`.vitepress/theme/chunked-download.mjs` 把文件切成 8 MiB 分片、每来源 2 条连接（全局 ≤4，同域 6 连接上限内）并发拉，
快来源做完自己的继续从队列取（工作窃取），失败片放回队列优先让别的来源接、连续失败 3 次的来源退出。
有 `showSaveFilePicker`（Chromium 桌面）就流式写盘；否则整包落内存再存（超过 512 MiB 不冒险）；两个同域来源都探不到就退回普通链接。
行为由 `tool/chunked-download.test.mjs` 用假 Range 服务覆盖（双源拼接、探测剔除、中途失败换源、忽略 Range 的 200 判失败、全失败、中止、并发上限、快慢分配）。

---

## 本地验证

```bash
npm ci && npm run docs:build

npm run verify            # 下面三条一起跑

node tool/verify-home.mjs      # 首屏拆分后页面是否还能跑（CDP 驱动真浏览器，13 项）
node tool/verify-download.mjs  # 下载选源三场景（CDP 请求拦截，11 项）
node tool/verify-sw.mjs        # SW 无感切换端到端（两个本地 origin，9 项）

cd edge && npm ci && npm run typecheck && npm test   # 边缘切换逻辑单测，24 项
```

`verify-sw.mjs` 用 `localhost` 和 `127.0.0.1` 当两个 origin（都是安全上下文，能注册 SW，不用自签证书），并让备源只在 `/fushi.moe` 下提供文件，模拟 GitHub 项目站的真实路径。测试只改写 `sw.js` 的来源常量，逻辑本体一行不动。「线路不可达」用直接销毁 socket 模拟，而不是返回 5xx：后者是源站故障，前者才是这套设计要救的网络层断连。

---

## 首屏体积

顺带做的一件事，和故障切换无关但对国内体验影响更大：首屏从 **6.09MB 压到 253KB**（gzip 实测）。

原来 `public/index.html` 有 14.5MB，其中绝大部分是 base64 内联的音视频和图片——base64 几乎不可压缩，所以它在传输层的代价和原始体积一样大。光 `FUSHI_AUDIO` 一个常量就占 gzip 后的 3.22MB，而那是 418 个词的发音，用户一次最多点几个。

- `tool/split-inline-assets.mjs`：把 430 个内联媒体抽成 `public/demo/media/` 下的真文件，原位换成路径。抽取时逐条断言「重新 base64 编码 == 原串」，所以还原必然逐字节一致（`--verify` 可复核）。
- `tool/split-demo-data.mjs`：把 `FUSHI_TERMMAP`（gzip 528KB）抽成 `demo/data/termmap.json`，声明改空对象、到达后 `Object.assign` 原地填充。下游 `const TERMMAP = FUSHI_TERMMAP` 持有同一个引用，所有同步调用点一行不用改。

两个脚本都是幂等的。**如果之后重新生成了设计稿 `index.html`，重跑这两个脚本即可**，不要手改那个巨型文件。
