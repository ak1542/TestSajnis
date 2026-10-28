// Static site builder for course notes.
//
//   node scripts/build.js            -> public build: only `status: published` notes
//   node scripts/build.js --drafts   -> private preview: every note, drafts badged
//
// Output goes to dist/.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOTES_DIR = join(ROOT, 'notes');
const SITE_DIR = join(ROOT, 'site');
const OUT_DIR = join(ROOT, 'dist');

const config = JSON.parse(readFileSync(join(ROOT, 'site.config.json'), 'utf8'));
// basePath lets the site live under a sub-path, e.g. "/TestSajnis" on GitHub Pages.
const base = (process.env.BASE_PATH ?? config.basePath ?? '').replace(/\/$/, '');

// Minimal front matter: `key: value` lines between two `---` fences.
function parseFrontMatter(src) {
  const match = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: src };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim().replace(/^["'](.*)["']$/, '$1');
    if (/^-?\d+(\.\d+)?$/.test(value)) value = Number(value);
    data[m[1]] = value;
  }
  return { data, body: src.slice(match[0].length) };
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Root-relative links in notes (e.g. /assets/x.png) must also work under basePath.
const withBase = (html) => html.replace(/(src|href)="\/(?!\/)/g, `$1="${base}/`);

const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function loadNotes() {
  if (!existsSync(NOTES_DIR)) return [];
  return readdirSync(NOTES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const { data, body } = parseFrontMatter(readFileSync(join(NOTES_DIR, file), 'utf8'));
      const status = String(data.status ?? 'draft').toLowerCase();
      return {
        file,
        slug: data.slug ? slugify(data.slug) : slugify(basename(file, '.md')),
        title: data.title ?? basename(file, '.md'),
        module: data.module ?? 'General',
        order: typeof data.order === 'number' ? data.order : 999,
        summary: data.summary ?? '',
        updated: data.updated ? String(data.updated) : '',
        tags: data.tags ? String(data.tags).split(',').map((t) => t.trim()).filter(Boolean) : [],
        status: status === 'published' ? 'published' : 'draft',
        body,
      };
    });
}

// Modules sort by the smallest `order` among their notes, then by name.
function groupByModule(notes) {
  const groups = new Map();
  for (const n of notes) {
    if (!groups.has(n.module)) groups.set(n.module, []);
    groups.get(n.module).push(n);
  }
  for (const list of groups.values()) list.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  return [...groups.entries()].sort(
    ([a, la], [b, lb]) => la[0].order - lb[0].order || a.localeCompare(b),
  );
}

function layout({ title, content, includeDrafts }) {
  const banner = includeDrafts
    ? `<div class="preview-banner">Private preview: drafts are visible here and are <strong>not</strong> in the public site.</div>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="${base}/style.css">
</head>
<body>
${banner}
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="${base}/">${escapeHtml(config.title)}</a>
  </div>
</header>
<main class="wrap">
${content}
</main>
<footer class="site-footer wrap">
  <span>${escapeHtml(config.author)}</span>
</footer>
<script src="${base}/app.js"></script>
</body>
</html>
`;
}

const draftBadge = (n) => (n.status === 'draft' ? '<span class="badge">Draft</span>' : '');

function renderIndex(groups, includeDrafts, counts) {
  const sections = groups
    .map(
      ([module, list]) => `
<section class="module">
  <h2>${escapeHtml(module)}</h2>
  <ul class="note-list">
    ${list
      .map(
        (n) => `
    <li class="note-card" data-search="${escapeHtml([n.title, n.summary, n.module, ...n.tags].join(' ').toLowerCase())}">
      <a href="${base}/notes/${n.slug}/">
        <span class="note-title">${escapeHtml(n.title)} ${draftBadge(n)}</span>
        ${n.summary ? `<span class="note-summary">${escapeHtml(n.summary)}</span>` : ''}
        ${n.updated ? `<span class="note-meta">Updated ${escapeHtml(n.updated)}</span>` : ''}
      </a>
    </li>`,
      )
      .join('')}
  </ul>
</section>`,
    )
    .join('');

  const stats = includeDrafts
    ? `<p class="stats">${counts.published} published · ${counts.draft} draft</p>`
    : '';
  const empty = groups.length === 0
    ? `<p class="empty">No notes published yet. Check back soon.</p>`
    : '';

  return `
<section class="hero">
  <h1>${escapeHtml(config.title)}</h1>
  <p>${escapeHtml(config.tagline)}</p>
  ${stats}
</section>
${groups.length ? '<input id="search" class="search" type="search" placeholder="Search notes…" aria-label="Search notes">' : ''}
${empty}
${sections}
<p class="empty" id="no-results" hidden>No notes match your search.</p>`;
}

function renderNote(note, prev, next) {
  const tags = note.tags.length
    ? `<ul class="tags">${note.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
    : '';
  const link = (n, label) =>
    n ? `<a href="${base}/notes/${n.slug}/"><small>${label}</small>${escapeHtml(n.title)}</a>` : '<span></span>';
  return `
<article class="note">
  <p class="crumbs"><a href="${base}/">All notes</a> / ${escapeHtml(note.module)}</p>
  <h1>${escapeHtml(note.title)} ${draftBadge(note)}</h1>
  ${note.updated ? `<p class="note-meta">Updated ${escapeHtml(note.updated)}</p>` : ''}
  ${tags}
  <div class="prose">
${withBase(marked.parse(note.body))}
  </div>
</article>
<nav class="pager">${link(prev, 'Previous')}${link(next, 'Next')}</nav>`;
}

export function build({ includeDrafts = false } = {}) {
  const all = loadNotes();
  const notes = includeDrafts ? all : all.filter((n) => n.status === 'published');
  const counts = {
    published: all.filter((n) => n.status === 'published').length,
    draft: all.filter((n) => n.status === 'draft').length,
  };

  const seen = new Map();
  for (const n of notes) {
    if (seen.has(n.slug)) throw new Error(`Duplicate slug "${n.slug}" in ${seen.get(n.slug)} and ${n.file}`);
    seen.set(n.slug, n.file);
  }

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  cpSync(SITE_DIR, OUT_DIR, { recursive: true });
  // Course images/files referenced from notes, e.g. ![diagram](/assets/diagram.png)
  if (existsSync(join(NOTES_DIR, 'assets'))) cpSync(join(NOTES_DIR, 'assets'), join(OUT_DIR, 'assets'), { recursive: true });

  const groups = groupByModule(notes);
  writeFileSync(
    join(OUT_DIR, 'index.html'),
    layout({ title: config.title, content: renderIndex(groups, includeDrafts, counts), includeDrafts }),
  );

  const ordered = groups.flatMap(([, list]) => list);
  ordered.forEach((note, i) => {
    const dir = join(OUT_DIR, 'notes', note.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'index.html'),
      layout({
        title: `${note.title} · ${config.title}`,
        content: renderNote(note, ordered[i - 1], ordered[i + 1]),
        includeDrafts,
      }),
    );
  });

  writeFileSync(
    join(OUT_DIR, '404.html'),
    layout({ title: `Not found · ${config.title}`, content: '<h1>Page not found</h1><p><a href="' + base + '/">Back to all notes</a></p>', includeDrafts }),
  );
  writeFileSync(join(OUT_DIR, '.nojekyll'), '');

  return { built: ordered.length, ...counts };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const includeDrafts = process.argv.includes('--drafts');
  const r = build({ includeDrafts });
  console.log(
    `Built ${r.built} note(s) into dist/ (${includeDrafts ? 'preview, drafts included' : 'public, published only'}). ` +
      `${r.published} published, ${r.draft} draft.`,
  );
}
