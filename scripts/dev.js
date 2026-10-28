// Private preview server: builds with drafts included, serves dist/,
// and rebuilds whenever a note, the site files, or the config change.
//
//   npm run dev        -> http://localhost:4000

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'dist');
const PORT = Number(process.env.PORT ?? 4000);
process.env.BASE_PATH = '';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

function rebuild() {
  try {
    const r = build({ includeDrafts: true });
    console.log(`[${new Date().toLocaleTimeString()}] rebuilt: ${r.published} published, ${r.draft} draft`);
  } catch (err) {
    console.error('Build failed:', err.message);
  }
}

rebuild();

let timer;
for (const target of ['notes', 'site', 'site.config.json']) {
  watch(join(ROOT, target), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 100);
  });
}

createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = normalize(join(OUT_DIR, urlPath));
  if (!file.startsWith(OUT_DIR)) {
    res.writeHead(403).end();
    return;
  }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] }).end(await readFile(join(OUT_DIR, '404.html')));
  }
}).listen(PORT, () => console.log(`Preview (drafts included): http://localhost:${PORT}`));
