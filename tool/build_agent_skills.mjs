/*
 * 构建后写 dist/.well-known/agent-skills/index.json（Agent Skills Discovery v0.2.0：
 * https://github.com/cloudflare/agent-skills-discovery-rfc ）。
 * 技能正文是 public/.well-known/agent-skills/<name>/SKILL.md（手写，随 public 原样进 dist）；
 * 索引里的 digest 是 dist 里那份文件的 SHA-256，所以必须构建时算——手抄进仓库的哈希一改正文就过期。
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DIST = join(ROOT, '.vitepress', 'dist');
export const SKILLS_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';

/**
 * SKILL.md 的 frontmatter 里单行写的 name / description。
 * @param {string} text SKILL.md 全文
 * @returns {{ name: string, description: string }}
 */
export function skillMeta(text) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const get = (key) => {
    const m = new RegExp('^' + key + ':\\s*(.+?)\\s*$', 'm').exec(fm ? fm[1] : '');
    if (!m) throw new Error('SKILL.md frontmatter missing ' + key);
    return m[1];
  };
  return { name: get('name'), description: get('description') };
}

/**
 * @param {string} skillsDir 含 <name>/SKILL.md 的目录
 * @returns {{ $schema: string, skills: { name: string, type: string, description: string, url: string, digest: string }[] }}
 */
export function skillsIndex(skillsDir) {
  const skills = readdirSync(skillsDir)
    .filter((name) => statSync(join(skillsDir, name)).isDirectory() && existsSync(join(skillsDir, name, 'SKILL.md')))
    .sort((a, b) => a.localeCompare(b))
    .map((dir) => {
      const bytes = readFileSync(join(skillsDir, dir, 'SKILL.md'));
      const { name, description } = skillMeta(bytes.toString('utf8'));
      if (name !== dir) throw new Error('skill ' + dir + ': frontmatter name must equal its directory name');
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) throw new Error('skill name must be lowercase alphanumerics and hyphens: ' + name);
      return {
        name,
        type: 'skill-md',
        description,
        url: '/.well-known/agent-skills/' + name + '/SKILL.md',
        digest: 'sha256:' + createHash('sha256').update(bytes).digest('hex'),
      };
    });
  if (!skills.length) throw new Error('no skills under ' + skillsDir);
  return { $schema: SKILLS_SCHEMA, skills };
}

export function main() {
  const dir = join(DIST, '.well-known', 'agent-skills');
  // public/ 下的点目录没被拷进产物时这里直接失败，而不是静默发一个缺 .well-known 的站。
  if (!existsSync(dir)) throw new Error('dist/.well-known/agent-skills is missing — was public/.well-known copied?');
  const index = skillsIndex(dir);
  writeFileSync(join(dir, 'index.json'), JSON.stringify(index, null, 2) + '\n', 'utf8');
  console.log('agent-skills/index.json：' + index.skills.length + ' 个技能');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
