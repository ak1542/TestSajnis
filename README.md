# My Course Notes

A small website for my boutique course notes. I write notes as I learn, keep
them as **drafts** while they're rough, and switch them to **published** when
they're ready for everyone.

- **Drafts** show up only in the local preview (`npm run dev`).
- **Published** notes go to the public website, built and deployed
  automatically to GitHub Pages when `main` is updated.

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev          # private preview with drafts → http://localhost:4000
```

The preview rebuilds automatically every time you save a note.

## Writing a note

Create one from the template:

```bash
npm run new -- "Lesson title" "Module 1"
```

or add any `.md` file to `notes/`. Each note starts with a small header:

```markdown
---
title: Lesson title
module: Module 1          # section it's grouped under on the home page
order: 10                 # position in the course (lower comes first)
status: draft             # draft = only you see it; published = public
updated: 2026-10-28
summary: One line shown on the home page.
tags: html, css
---

Your notes in Markdown…
```

Images and files go in `notes/assets/` and are linked as
`![diagram](/assets/diagram.png)`.

## Publishing a note

1. Change `status: draft` to `status: published`.
2. Check it with `npm run build` (public build, published notes only) or
   `npm run dev`.
3. Commit and push / merge to `main`. The GitHub Action publishes the site.

## One-time setup for the public website

1. In the GitHub repo, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main`. The site appears at
   `https://<your-username>.github.io/<repo-name>/`.

Edit `site.config.json` to set the site title, tagline and your name.

## Privacy note

The *website* never includes drafts, but the Markdown files live in this
repository. If the repository is **public**, anyone browsing it on GitHub can
read draft files too. To keep drafts truly private, either make the
repository private (GitHub Pages from a private repo needs a paid GitHub plan)
or keep drafts on a separate branch and merge them into `main` only when
they're ready.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local preview with drafts, auto-rebuild |
| `npm run build` | Public build (published only) into `dist/` |
| `npm run build:drafts` | Build everything into `dist/` |
| `npm run new -- "Title" "Module"` | Create a new draft note |
