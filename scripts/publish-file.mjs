#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const src = process.argv[2];
const titleArg = process.argv[3] || '';
if (!src) {
  console.error('Usage: node scripts/publish-file.mjs <source.html> [title]');
  process.exit(2);
}
const repoRoot = path.resolve(import.meta.dirname, '..');
const travelDir = path.join(repoRoot, 'travel');
await fs.mkdir(travelDir, { recursive: true });
const raw = await fs.readFile(src);
const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
// Keep public URLs ASCII-only and short. QQ/微信内置浏览器更容易拦截超长中文
// percent-encoded URL；标题仍写入 manifest 显示，文件名只承担稳定访问职责。
const baseName = `share-${stamp}`;
const short = crypto.createHash('sha1').update(raw).digest('hex').slice(0, 8);
const fileName = `${baseName}-${short}.html`;
const rel = `travel/${fileName}`;
await fs.writeFile(path.join(repoRoot, rel), raw);
await fs.writeFile(path.join(repoRoot, 'travel', 'latest.html'), raw);
const manifestPath = path.join(repoRoot, 'shared-files.json');
let manifest = [];
try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch {}
manifest = manifest.filter(x => x.path !== rel && x.path !== 'travel/latest.html');
manifest.unshift({ title: '最新旅游攻略', path: 'travel/latest.html', createdAt: new Date().toISOString() });
manifest.unshift({ title: titleArg || baseName, path: rel, createdAt: new Date().toISOString() });
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ path: rel, title: titleArg || baseName }, null, 2));
