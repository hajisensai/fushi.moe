#!/usr/bin/env node
/*
 * 给独立首页 public/index.html 注入 SW 注册脚本。
 *
 * VitePress 页面的 head 由 .vitepress/config.mts 管，但首页是 public/ 下的
 * 独立 HTML，配置管不到它，得单独注入。
 *
 * 单独做成一个幂等脚本，是因为 index.html 会被设计稿管线重新生成——
 * 重新生成后要能一条命令把三步变换全部重放，而不是靠人记得手改。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = join(HERE, '..', 'public', 'index.html');
const TAG = '<script src="/sw-register.js" defer></script>';

const html = readFileSync(HTML_PATH, 'utf8');
if (html.includes('/sw-register.js')) {
  console.log('已注入过 SW 注册脚本，跳过');
} else {
  const i = html.lastIndexOf('</body>');
  if (i === -1) throw new Error('找不到 </body>，无法注入');
  writeFileSync(HTML_PATH, html.slice(0, i) + TAG + '\n' + html.slice(i), 'utf8');
  console.log('已注入 SW 注册脚本');
}
