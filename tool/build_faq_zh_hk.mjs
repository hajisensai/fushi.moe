/*
 * 常见问题的繁体中文版：从简体原文 faq/<slug>.md 机器转换出 faq/<slug>.zh-HK.md。
 *
 * 用 OpenCC（opencc-js，简→台湾正体 + 台湾用语：軟體 / 檔案 / 影片，和 public/i18n/zh-HK.json 的口径一致）。
 * 生成物提交进仓库、不要手改：改了简体原文重跑 `npm run faq:zh-hk`，tool/lang-routes.test.mjs 会比对生成物是否过期。
 * 英文版不走这条路（要人翻），见 CLAUDE.md。
 *
 * 转换规则：
 *   - frontmatter：title / description / category 逐字段转换，lang 写成 zh-HK，其余原样；
 *   - 正文整体转换（含代码块——里面的中文路径示例也该是繁体）；
 *   - 站内链接改指同语言版本：/faq/<slug>[#锚] → /faq/<slug>.zh-HK[#锚]，/zh-cn/… → /zh-hk/…；
 *     锚点文字随正文一起转换，和转换后标题生成的 slug 仍然一致。
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as OpenCC from 'opencc-js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FAQ = join(HERE, '..', 'faq');
export const LANG = 'zh-HK';

const convert = OpenCC.Converter({ from: 'cn', to: 'twp' });

/** 翻译文件名形如 <slug>.<lang>.md；原文是 <slug>.md */
export const isTranslation = (name) => /\.[a-z]{2}(-[A-Za-z]+)?\.md$/.test(name);

/**
 * @param {string} src 简体原文（整个 .md，含 frontmatter）
 * @returns {string} 繁体版全文
 */
export function renderZhHk(src) {
  const nl = src.includes('\r\n') ? '\r\n' : '\n';
  const text = src.split('\r\n').join('\n');
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) throw new Error('faq article without frontmatter');
  const lines = m[1].split('\n');
  let sawLang = false;
  const fm = lines.map((line) => {
    const kv = /^([A-Za-z_]+):\s*(.*)$/.exec(line);
    if (!kv) return line;
    const [, key, value] = kv;
    if (key === 'lang') { sawLang = true; return 'lang: ' + LANG; }
    if (key === 'title' || key === 'description' || key === 'category') return key + ': ' + convert(value);
    return line;
  });
  if (!sawLang) fm.push('lang: ' + LANG);
  let body = convert(text.slice(m[0].length));
  body = body
    .replace(/\]\(\/faq\/([a-z0-9-]+)(#[^)]*)?\)/g, (_, slug, hash) => '](/faq/' + slug + '.' + LANG + (hash || '') + ')')
    .replace(/\]\(\/zh-cn\//g, '](/zh-hk/');
  return ('---\n' + fm.join('\n') + '\n---\n' + body).split('\n').join(nl);
}

export function main() {
  const sources = readdirSync(FAQ).filter((f) => f.endsWith('.md') && !isTranslation(f));
  for (const f of sources) {
    const out = join(FAQ, f.replace(/\.md$/, '.' + LANG + '.md'));
    writeFileSync(out, renderZhHk(readFileSync(join(FAQ, f), 'utf8')), 'utf8');
  }
  console.log('常见问题繁体版：' + sources.length + ' 篇');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
