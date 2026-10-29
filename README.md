# Sajanies Learning

A calm, easy-to-use website that helps people with little tech experience learn sewing, stitching and pattern making.

## What's inside

**For learners** (`index.html`)
- Soft cream-and-terracotta theme, large text, and an **A** button to enlarge text further
- Simple navigation: Home → Section → Lesson, with breadcrumbs and next/previous buttons
- **Left panel** listing every section and its lessons (opens as a ☰ menu on phones)
- **Right “On this page” panel** that picks up the lesson's headings automatically and highlights where you are while scrolling
- **Languages**: English and Hindi included; the teacher can add more
- **Motion graphics** instead of long text (running stitch, cutting, measuring tape, threading a needle)
- **Audio**: a 🔊 button reads any lesson aloud in the chosen language (device voice), or plays an uploaded audio link
- **Search** across all languages — searching "pattern" (or "पैटर्न") shows every related lesson
- **My Designs** section: nine original designs, each with a drag-to-turn **3D version** shown next to the original drawing, notes, colour palette and sewing tips (English + Hindi)
- Colour try-on, a 3D kurta preview, tables and measurement charts are available as lesson blocks

**For the teacher** (`admin.html`)
- Rich lesson editor made of blocks: heading, text (bold, H2/H3 headings, lists, colours), images/GIFs, video, tables, measurements, colour palettes, 3D designs, motion graphics, audio
- Create, rename, reorder and delete sections and lessons
- **Draft / Published** control — drafts are hidden from learners
- Write each lesson in every language using the "Editing language" switch (with a *Copy English* helper)
- Live preview, backup (download) and restore

## Run it

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

It also works on GitHub Pages (Settings → Pages → deploy from this branch, root folder).

## Teacher panel

Open `admin.html`. The starting passcode is `sajanies` — change it under **⚙ More**.

## About the 3D designs

The 3D versions are built in code (three.js, included in `js/vendor/`, MIT licence) from each drawing's silhouette, colours and pattern. A single front drawing cannot show the back and sides, so those are an interpretation. The nine drawings are in `images/designs/`. Adding a *new* 3D shape means adding a model in `js/garment3d.js`; the teacher panel can choose between the existing nine.

## Important to know

This first version has **no server**. Lessons you edit are saved **in the browser you used** (localStorage), so:

- Other people's devices will only see the built-in lessons (the My Designs section) until a backend is added.
- If you edited lessons in this browser before, it keeps showing your saved version. To see the built-in content again, open the teacher panel → **⚙ More** → type `2` (take a Backup first).
- The passcode is a light lock to avoid accidents; it is **not real security**.
- Use **⬇ Backup** regularly. Restoring a backup on another computer moves your lessons there.

### Suggested next step

Add a small backend (for example Supabase or Firebase) for real teacher login, shared lessons, and storing images/videos/audio. The data model is in `js/seed.js` and everything goes through `js/store.js`, so only that file needs to change.

## Files

| File | Purpose |
|---|---|
| `index.html`, `js/app.js` | Learner site and router |
| `admin.html`, `js/admin.js` | Teacher panel and block editor |
| `js/render.js` | Lesson blocks, motion graphics, 3D preview, voice |
| `js/store.js` | Data, languages, search, backup |
| `js/seed.js` | Built-in section and lessons, interface text |
| `js/garment3d.js`, `js/vendor/three.min.js` | 3D designs and the three.js library |
| `images/designs/` | The nine drawings |
| `css/style.css`, `css/admin.css` | Styles |
