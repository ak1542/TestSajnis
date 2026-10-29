/* Data storage, language helpers and search — shared by the learner site and the admin panel.
   Data lives in the browser (localStorage). Use Export / Import in the admin panel to move it. */
(function () {
  const KEY = "sajanies.data.v1";
  const LANG_KEY = "sajanies.lang";

  const clone = (o) => JSON.parse(JSON.stringify(o));

  const Store = {
    data: null,

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) { this.data = JSON.parse(raw); return this.data; }
      } catch (e) { /* ignore, fall back to sample */ }
      this.data = clone(window.SEED);
      return this.data;
    },

    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); return true; }
      catch (e) { return false; }
    },

    reset() {
      try { localStorage.removeItem(KEY); } catch (e) {}
      this.data = clone(window.SEED);
    },

    exportJSON() { return JSON.stringify(this.data, null, 2); },

    importJSON(text) {
      const d = JSON.parse(text);
      if (!d || !Array.isArray(d.sections) || !Array.isArray(d.lessons) || !Array.isArray(d.languages)) {
        throw new Error("This file is not a Sajanies Learning backup.");
      }
      if (!d.ui) d.ui = clone(window.SEED.ui);
      this.data = d;
      this.save();
    },

    uid(prefix) { return (prefix || "id") + "-" + Math.random().toString(36).slice(2, 8); },

    /* ---- language ---- */
    getLang() {
      let l = null;
      try { l = localStorage.getItem(LANG_KEY); } catch (e) {}
      const codes = this.data.languages.map((x) => x.code);
      if (l && codes.includes(l)) return l;
      const nav = (navigator.language || "en").slice(0, 2);
      return codes.includes(nav) ? nav : codes[0];
    },
    setLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch (e) {} },
    voiceFor(lang) {
      const f = this.data.languages.find((x) => x.code === lang);
      return (f && f.voice) || lang;
    },

    /* Pick a translated string, fall back to English / first available. */
    t(obj, lang) {
      if (obj == null) return "";
      if (typeof obj === "string") return obj;
      if (obj[lang]) return obj[lang];
      if (obj.en) return obj.en;
      const k = Object.keys(obj).find((x) => obj[x]);
      return k ? obj[k] : "";
    },
    ui(lang) {
      const u = this.data.ui || window.SEED.ui;
      return Object.assign({}, window.SEED.ui.en, u.en || {}, u[lang] || window.SEED.ui[lang] || {});
    },

    /* ---- lookups ---- */
    sections() { return this.data.sections; },
    section(id) { return this.data.sections.find((s) => s.id === id); },
    lesson(id) { return this.data.lessons.find((l) => l.id === id); },
    lessonsIn(sectionId, includeDrafts) {
      return this.data.lessons.filter((l) => l.sectionId === sectionId && (includeDrafts || l.status === "published"));
    },
    published() { return this.data.lessons.filter((l) => l.status === "published"); },

    /* ---- text helpers ---- */
    stripHtml(html) {
      const d = document.createElement("div");
      d.innerHTML = html || "";
      d.querySelectorAll("li").forEach((li) => li.appendChild(document.createTextNode(". ")));
      d.querySelectorAll("p,div,br,h1,h2,h3").forEach((n) => n.appendChild(document.createTextNode(" ")));
      return (d.textContent || "").replace(/\s+/g, " ").trim();
    },

    /* All text of a lesson in one language — used for audio and search. */
    lessonText(lesson, lang) {
      const parts = [this.t(lesson.title, lang), this.t(lesson.summary, lang)];
      (lesson.blocks || []).forEach((b) => parts.push(this.blockText(b, lang)));
      return parts.filter(Boolean).join(". ");
    },
    blockText(b, lang) {
      switch (b.type) {
        case "heading": return this.t(b.text, lang);
        case "text": return this.stripHtml(this.t(b.html, lang));
        case "table": return this.t(b.csv, lang).replace(/,/g, " — ").replace(/\n/g, ". ");
        case "measure": return this.t(b.lines, lang).split("\n").map((l) => l.split("|").map((x) => x.trim()).join(" ")).join(". ");
        case "audio": return this.t(b.narration, lang);
        case "motion": case "image": case "video": case "colors": case "model3d": return this.t(b.caption, lang);
        default: return "";
      }
    },

    /* ---- search: looks in every language so "pattern" and "पैटर्न" both work ---- */
    search(query, includeDrafts) {
      const q = (query || "").trim().toLowerCase();
      if (!q) return [];
      const words = q.split(/\s+/);
      const codes = this.data.languages.map((l) => l.code);
      const out = [];
      this.data.lessons.forEach((l) => {
        if (!includeDrafts && l.status !== "published") return;
        const sec = this.section(l.sectionId);
        let score = 0;
        let hay = "";
        codes.forEach((c) => {
          const title = this.t(l.title, c).toLowerCase();
          const tags = (l.tags || []).join(" ").toLowerCase();
          const secTitle = sec ? this.t(sec.title, c).toLowerCase() : "";
          const body = this.lessonText(l, c).toLowerCase();
          words.forEach((w) => {
            if (title.includes(w)) score += 10;
            if (tags.includes(w)) score += 6;
            if (secTitle.includes(w)) score += 4;
            if (body.includes(w)) score += 2;
          });
          hay += title + tags + secTitle + body;
        });
        const all = words.every((w) => hay.includes(w));
        if (score > 0 && all) out.push({ lesson: l, score });
      });
      return out.sort((a, b) => b.score - a.score).map((x) => x.lesson);
    }
  };

  window.Store = Store;
})();
