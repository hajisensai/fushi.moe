import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../.vitepress/theme/lang-routes.mjs';
import { SKILLS_SCHEMA, skillMeta, skillsIndex } from './build_agent_skills.mjs';
import { htmlToMarkdown, pageUrl } from './build_markdown.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const WELL_KNOWN = 'public/.well-known/';

test('Markdown 副本：地址按 cleanUrls 还原', () => {
  assert.equal(pageUrl('index.html'), SITE + '/');
  assert.equal(pageUrl('zh-cn/index.html'), SITE + '/zh-cn/');
  assert.equal(pageUrl('download.html'), SITE + '/download');
  assert.equal(pageUrl('faq/anki.en.html'), SITE + '/faq/anki.en');
});

test('Markdown 副本：取 article.prose，去页壳与脚本，站内链接转绝对地址，带 frontmatter', () => {
  const html = '<!doctype html><html lang="en"><head><title>How &amp; why | Fushi</title>' +
    '<meta name="description" content="Say &quot;hi&quot;"></head><body>' +
    '<nav class="site-nav"><a href="/">NAVLINK</a></nav>' +
    '<main><aside class="faq-side"><a href="/faq/x">SIDEBAR</a></aside>' +
    '<article class="faq-article prose" lang="en"><h1>How?</h1>' +
    '<h2 id="a">Step <a class="header-anchor" href="#a">​</a></h2>' +
    '<p>See <a href="/download">the download page</a> or <a href="https://example.com/x">elsewhere</a>.</p>' +
    '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>' +
    '<script>INLINE()</script><svg><text>ICON</text></svg></article></main>' +
    '<footer class="site-footer">FOOTER</footer></body></html>';
  const md = htmlToMarkdown(html, SITE + '/faq/how.en');
  assert.match(md, /^---\ntitle: "How & why \| Fushi"\ndescription: "Say \\"hi\\""\nurl: https:\/\/fushi\.moe\/faq\/how\.en\nlang: en\n---\n\n# How\?\n/);
  assert.ok(md.includes('## Step\n'), '标题不带锚点链接');
  assert.ok(md.includes('[the download page](' + SITE + '/download)'));
  assert.ok(md.includes('[elsewhere](https://example.com/x)'));
  assert.ok(md.includes('| A | B |'), '表格转成 GFM');
  for (const junk of ['NAVLINK', 'SIDEBAR', 'FOOTER', 'INLINE', 'ICON', '​']) assert.ok(!md.includes(junk), junk + ' 不该进 Markdown');
});

test('Markdown 副本：没有 article.prose 的页（首页）取 body，去掉 demo 舞台，缺一级标题时用页面标题补', () => {
  const html = '<html lang="ja"><head><title>Fushi Home</title></head><body><nav class="site-nav">NAV</nav>' +
    '<section><h2>Video</h2><p class="copy">Tap a word.</p><div class="stage rev duo"><p>Loading demo…</p></div></section></body></html>';
  const md = htmlToMarkdown(html, SITE + '/ja/');
  assert.ok(md.includes('\n# Fushi Home\n\n## Video\n\nTap a word.\n'));
  assert.ok(!md.includes('Loading demo') && !md.includes('NAV'));
});

test('构建脚本把 Markdown 副本与技能索引排在指纹之前（两侧产物逐字节一致靠它）', () => {
  const build = JSON.parse(read('package.json')).scripts['docs:build'];
  const at = (s) => { const i = build.indexOf(s); assert.ok(i >= 0, 'docs:build 缺 ' + s); return i; };
  assert.ok(at('build_markdown.mjs') < at('build-fingerprint.mjs'));
  assert.ok(at('build_agent_skills.mjs') < at('build-fingerprint.mjs'));
  assert.ok(at('build_lang_routes.mjs') < at('build_markdown.mjs'), '首页语言路由要先烤好才有 HTML 可转');
});

test('API catalog（RFC 9727）：linkset 每项有 anchor / service-desc / service-doc，指向的站内文件都存在', () => {
  const catalog = JSON.parse(read(WELL_KNOWN + 'api-catalog'));
  assert.ok(Array.isArray(catalog.linkset) && catalog.linkset.length > 0);
  const local = (href) => {
    assert.ok(href.startsWith(SITE + '/'), href + ' 要是本站绝对地址');
    return href.slice(SITE.length + 1);
  };
  for (const entry of catalog.linkset) {
    assert.ok(entry.anchor.startsWith(SITE + '/'), 'anchor: ' + entry.anchor);
    for (const rel of ['service-desc', 'service-doc']) {
      assert.ok(Array.isArray(entry[rel]) && entry[rel].length > 0, entry.anchor + ' 缺 ' + rel);
      for (const { href } of entry[rel]) assert.ok(existsSync(join(ROOT, 'public', local(href))), href + ' 不存在');
    }
  }
  // 没有扩展名的文件靠 _headers 给 Content-Type
  assert.match(read('public/_headers').replace(/\r\n/g, '\n'), /\n\/\.well-known\/api-catalog\n {2}Content-Type: application\/linkset\+json\n/);
});

test('OpenAPI：是合法 JSON，catalog 里的每个 anchor 都有对应 path，槽位表与边缘 Worker 的 SLOTS 一致', () => {
  const api = JSON.parse(read(WELL_KNOWN + 'openapi.json'));
  assert.match(api.openapi, /^3\.1\./);
  assert.equal(api.servers[0].url, SITE);
  for (const { anchor } of JSON.parse(read(WELL_KNOWN + 'api-catalog')).linkset) {
    assert.ok(api.paths[anchor.slice(SITE.length)], 'OpenAPI 缺 ' + anchor);
  }
  const block = /export const SLOTS[^{]*\{([\s\S]*?)\n\};/.exec(read('edge/src/manifest.ts'));
  assert.ok(block, 'edge/src/manifest.ts 里找不到 SLOTS');
  const slots = [...block[1].matchAll(/^\s*(?:'([^']+)'|([a-z][\w-]*)):\s*\//gm)].map((m) => m[1] || m[2]);
  assert.ok(slots.length >= 8, '没解析出槽位');
  assert.deepEqual([...api.components.schemas.Slot.enum].sort(), [...slots].sort());
});

test('agent skills：索引符合 Discovery v0.2.0，digest 就是 SKILL.md 的 SHA-256，技能里提到的槽位都存在', () => {
  const dir = join(ROOT, WELL_KNOWN, 'agent-skills');
  const index = skillsIndex(dir);
  assert.equal(index.$schema, SKILLS_SCHEMA);
  const slots = new Set(JSON.parse(read(WELL_KNOWN + 'openapi.json')).components.schemas.Slot.enum);
  for (const s of index.skills) {
    assert.match(s.name, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.equal(s.type, 'skill-md');
    assert.equal(s.url, '/.well-known/agent-skills/' + s.name + '/SKILL.md');
    const bytes = readFileSync(join(dir, s.name, 'SKILL.md'));
    assert.equal(s.digest, 'sha256:' + createHash('sha256').update(bytes).digest('hex'));
    assert.deepEqual(skillMeta(bytes.toString('utf8')), { name: s.name, description: s.description });
    for (const [, slot] of bytes.toString('utf8').matchAll(/^\| [^|]+ \| `([a-z0-9-]+)` \|$/gm)) {
      assert.ok(slots.has(slot), s.name + ' 提到了不存在的槽位 ' + slot);
    }
  }
  assert.throws(() => skillMeta('no frontmatter'), /missing name/);
});

test('WebMCP：site.js 先探测 API 再注册，工具只读本站已有的公开端点', () => {
  const js = read('public/site.js');
  assert.match(js, /document\.modelContext \|\| navigator\.modelContext/);
  assert.match(js, /typeof mc\.registerTool !== 'function'\) return;/);
  for (const name of ['get_latest_fushi_release', 'search_fushi_faq']) assert.ok(js.includes("name: '" + name + "'"), name);
  assert.ok(js.includes("fetch('/releases/api/latest'") && js.includes("fetch('/llms.txt')"));
});
