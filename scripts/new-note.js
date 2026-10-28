// Create a new draft note.
//
//   npm run new -- "Lesson title" "Module name"

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [title, module = 'General'] = process.argv.slice(2);

if (!title) {
  console.error('Usage: npm run new -- "Lesson title" ["Module name"]');
  process.exit(1);
}

const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const file = join(ROOT, 'notes', `${slug}.md`);
if (existsSync(file)) {
  console.error(`notes/${slug}.md already exists.`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
mkdirSync(dirname(file), { recursive: true });
writeFileSync(
  file,
  `---
title: ${title}
module: ${module}
order: 999
status: draft
updated: ${today}
summary:
tags:
---

## Key ideas

-

## Details

## Questions to revisit

-
`,
);
console.log(`Created notes/${slug}.md (draft). Set "status: published" when it's ready to share.`);
