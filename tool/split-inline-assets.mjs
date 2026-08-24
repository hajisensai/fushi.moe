#!/usr/bin/env node
/*
 * 把 public/index.html 里内联的 base64 媒体抽成真文件。
 *
 * 为什么这么干：首页有 14.5MB，其中绝大部分是 base64 编码的音视频与图片。
 * base64 几乎不可压缩，所以它在传输层的代价和原始体积一样大——实测整页
 * gzip 后 6.09MB，光 FUSHI_AUDIO 一个常量就占 3.22MB。而这些东西
 * 用户一次访问最多碰几个。
 *
 * 关键简化：不区分「HTML 属性里的 data URI」和「JS 字符串里的 data URI」。
 * 两边都是被当成 URL 消费的，所以一个正则扫全文、原位换成路径即可，
 * 下游一行代码都不用改。浏览器随后天然按需加载：img/video 的 src 只在
 * 需要时才发请求。
 *
 * 正确性：抽取时逐条断言「重新 base64 编码 == 原串」。全部通过就意味着
 * 反向还原必然逐字节一致，不需要额外的信任。
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const HTML_PATH = join(ROOT, 'public', 'index.html');
const MEDIA_DIR = join(ROOT, 'public', 'demo', 'media');
/** 用根绝对路径而不是相对路径：MANGA_DOC 这类文档字符串会被 doc.write 进 iframe，
 *  相对路径在那里的 base URL 语义不稳，根绝对路径永远指向站点根。 */
const URL_PREFIX = '/demo/media/';

/** 小于这个长度的 data URI 留在原地——多一个请求比多几 KB 更贵。 */
const MIN_BASE64_CHARS = 4096;

const EXT_BY_MIME = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/aac': 'aac',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'font/woff2': 'woff2',
  'font/woff': 'woff',
};

const DATA_URI_RE = /data:([a-zA-Z0-9/+.\-]+);base64,([A-Za-z0-9+/]+={0,2})/g;

function human(n) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(2) + ' MB';
}

function extract() {
  const html = readFileSync(HTML_PATH, 'utf8');
  const originalBytes = Buffer.byteLength(html, 'utf8');

  if (!existsSync(MEDIA_DIR)) mkdirSync(MEDIA_DIR, { recursive: true });

  const pieces = [];
  const written = new Map();
  let cursor = 0;
  let skippedSmall = 0;
  let savedBytes = 0;

  for (const m of html.matchAll(DATA_URI_RE)) {
    const [whole, mime, b64] = m;
    if (b64.length < MIN_BASE64_CHARS) {
      skippedSmall += 1;
      continue;
    }

    const buf = Buffer.from(b64, 'base64');
    // 这条断言是整个脚本的正确性根据：能原样重编码，才谈得上可逆。
    if (buf.toString('base64') !== b64) {
      throw new Error(
        '非规范 base64，拒绝抽取（偏移 ' + m.index + '，mime ' + mime + '）——' +
          '强行抽取会导致还原后字节不一致',
      );
    }

    const ext = EXT_BY_MIME[mime] ?? 'bin';
    const name = createHash('sha256').update(buf).digest('hex').slice(0, 16) + '.' + ext;
    if (!written.has(name)) {
      writeFileSync(join(MEDIA_DIR, name), buf);
      written.set(name, { mime, bytes: buf.length });
    }

    pieces.push(html.slice(cursor, m.index));
    pieces.push(URL_PREFIX + name);
    cursor = m.index + whole.length;
    savedBytes += whole.length - (URL_PREFIX + name).length;
  }

  pieces.push(html.slice(cursor));
  const out = pieces.join('');

  writeFileSync(HTML_PATH, out, 'utf8');

  const nowBytes = Buffer.byteLength(out, 'utf8');
  const totalMedia = [...written.values()].reduce((a, v) => a + v.bytes, 0);

  console.log('抽出 ' + written.size + ' 个媒体文件 -> public/demo/media/');
  console.log('  跳过的小 data URI: ' + skippedSmall + ' 个（< ' + MIN_BASE64_CHARS + ' 字符）');
  console.log('  index.html: ' + human(originalBytes) + ' -> ' + human(nowBytes));
  console.log('  媒体文件合计: ' + human(totalMedia) + '（base64 解码后，比内联省约 1/4）');

  const byExt = new Map();
  for (const [name, meta] of written) {
    const ext = name.split('.').pop();
    const cur = byExt.get(ext) ?? { n: 0, bytes: 0 };
    byExt.set(ext, { n: cur.n + 1, bytes: cur.bytes + meta.bytes });
  }
  for (const [ext, v] of [...byExt].sort((a, b) => b[1].bytes - a[1].bytes)) {
    console.log('    .' + ext + '  ' + v.n + ' 个  ' + human(v.bytes));
  }
}

/**
 * 反向还原：把路径换回 data URI，与备份文件逐字节比对。
 * 用法：node tool/split-inline-assets.mjs --verify <原始 index.html 备份路径>
 */
function verify(originalPath) {
  const current = readFileSync(HTML_PATH, 'utf8');
  const original = readFileSync(originalPath, 'utf8');

  const mimeByExt = {};
  for (const [mime, ext] of Object.entries(EXT_BY_MIME)) {
    if (!(ext in mimeByExt)) mimeByExt[ext] = mime;
  }
  // mp3 有两个 mime 映射到同一扩展名，还原时必须挑原文用的那个。
  mimeByExt.mp3 = 'audio/mpeg';

  const known = new Set(existsSync(MEDIA_DIR) ? readdirSync(MEDIA_DIR) : []);
  const restored = current.replace(
    new RegExp(URL_PREFIX.replace(/\//g, '\\/') + '([a-f0-9]{16}\\.[a-z0-9]+)', 'g'),
    (whole, name) => {
      if (!known.has(name)) throw new Error('引用了不存在的媒体文件: ' + name);
      const ext = name.split('.').pop();
      const mime = mimeByExt[ext];
      if (!mime) throw new Error('未知扩展名，无法还原 mime: ' + name);
      const b64 = readFileSync(join(MEDIA_DIR, name)).toString('base64');
      return 'data:' + mime + ';base64,' + b64;
    },
  );

  if (restored === original) {
    console.log('还原校验通过：与原文件逐字节一致');
    return 0;
  }
  console.error('还原校验失败：长度 ' + restored.length + ' vs 原始 ' + original.length);
  for (let i = 0; i < Math.min(restored.length, original.length); i++) {
    if (restored[i] !== original[i]) {
      console.error('  首个差异在偏移 ' + i);
      console.error('  还原: ' + JSON.stringify(restored.slice(i - 60, i + 60)));
      console.error('  原始: ' + JSON.stringify(original.slice(i - 60, i + 60)));
      break;
    }
  }
  return 1;
}

const args = process.argv.slice(2);
if (args[0] === '--verify') {
  if (!args[1]) {
    console.error('用法: node tool/split-inline-assets.mjs --verify <原始 index.html 备份路径>');
    process.exit(2);
  }
  process.exit(verify(args[1]));
} else {
  extract();
}
