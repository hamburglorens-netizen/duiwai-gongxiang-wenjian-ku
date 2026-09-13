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
const baseName = path.basename(src).replace(/\.html?$/i, '').replace(/[^\p{L}\p{N}._-]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 80) || `file-${stamp}`;
const short = crypto.createHash('sha1').update(raw).digest('hex').slice(0, 8);
const fileName = `${baseName}-${short}.html`;
const rel = `travel/${fileName}`;
await fs.writeFile(path.join(repoRoot, rel), raw);
const manifestPath = path.join(repoRoot, 'shared-files.json');
let manifest = [];
try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch {}
manifest = manifest.filter(x => x.path !== rel);
manifest.unshift({ title: titleArg || baseName, path: rel, createdAt: new Date().toISOString() });
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ path: rel, title: titleArg || baseName }, null, 2));
