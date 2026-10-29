/* Teacher panel: passcode gate, sections, lessons, block editor, publish, backup. */
(function () {
  const { el, sanitize, renderBlock, MOTION_PRESETS } = Render;
  Store.load();

  const PASS_KEY = "sajanies.pass";
  const DEFAULT_PASS = "sajanies";
  const getPass = () => { try { return localStorage.getItem(PASS_KEY) || DEFAULT_PASS; } catch (e) { return DEFAULT_PASS; } };
  const isIn = () => { try { return sessionStorage.getItem("sajanies.admin") === "1"; } catch (e) { return false; } };
  const $ = (id) => document.getElementById(id);

  let editLang = Store.data.languages[0].code;
  let sel = null; // { type: "section" | "lesson", id }
  let showPreview = false;

  /* ---------- gate ---------- */
  function gate() {
    $("app").hidden = true; $("gate").hidden = false;
    if (getPass() === DEFAULT_PASS) $("gateHint").textContent = "First time? The starting passcode is “sajanies”. Change it under ⚙ More.";
    $("pass").focus();
  }
  $("gateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("pass").value === getPass()) {
      try { sessionStorage.setItem("sajanies.admin", "1"); } catch (x) {}
      $("pass").value = ""; $("gateErr").textContent = "";
      start();
    } else $("gateErr").textContent = "That passcode is not right.";
  });
  $("logoutBtn").addEventListener("click", () => { try { sessionStorage.removeItem("sajanies.admin"); } catch (e) {} gate(); });

  /* ---------- saving ---------- */
  let savedTimer = null;
  function save() {
    const ok = Store.save();
    const s = $("saved");
    s.className = "saved" + (ok ? "" : " bad");
    s.textContent = ok ? "Saved ✓" : "Not saved — storage is full. Use smaller images or take a Backup.";
    clearTimeout(savedTimer);
    if (ok) savedTimer = setTimeout(() => { s.textContent = ""; }, 2500);
  }

  /* ---------- helpers ---------- */
  const T = (o) => Store.t(o, editLang);
  const own = (o, k) => (o && o[k]) || "";
  const slug = (s) => (s || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "item";
  const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return false; [arr[i], arr[j]] = [arr[j], arr[i]]; return true; };

  function field(label, input, hint) {
    return el("label", { class: "field" }, [el("span", { text: label }), input, hint ? el("small", { class: "hint", text: hint }) : ""]);
  }
  /* Text input bound to obj[key][editLang] (translated) */
  function tInput(label, obj, key, opts) {
    opts = opts || {};
    if (!obj[key] || typeof obj[key] !== "object") obj[key] = {};
    const i = opts.area ? el("textarea", {}) : el("input", { type: "text" });
    i.value = own(obj[key], editLang);
    i.placeholder = editLang === "en" ? "" : own(obj[key], "en");
    i.addEventListener("input", () => { obj[key][editLang] = i.value; save(); });
    i.addEventListener("change", renderSide);
    return field(label + " (" + editLang + ")", i, opts.hint);
  }
  function plain(label, value, onInput, type) {
    const i = el("input", { type: type || "text" });
    i.value = value || "";
    i.addEventListener("input", () => { onInput(i.value); save(); });
    return field(label, i);
  }

  /* ---------- sidebar ---------- */
  function renderSide() {
    const side = $("side");
    side.replaceChildren();
    const d = Store.data;
    d.sections.forEach((s, si) => {
      const head = el("div", { class: "s-sec-head" }, [
        el("button", { class: "s-sec-btn" + (sel && sel.type === "section" && sel.id === s.id ? " on" : ""), type: "button", text: s.icon + " " + (T(s.title) || "(untitled)"), onclick: () => select("section", s.id) }),
        el("button", { class: "mini", type: "button", title: "Move up", text: "↑", onclick: () => { if (move(d.sections, si, -1)) { save(); renderSide(); } } }),
        el("button", { class: "mini", type: "button", title: "Move down", text: "↓", onclick: () => { if (move(d.sections, si, 1)) { save(); renderSide(); } } })
      ]);
      const wrap = el("div", { class: "s-sec" }, [head]);
      Store.lessonsIn(s.id, true).forEach((l) => {
        wrap.appendChild(el("button", { class: "s-lesson" + (sel && sel.type === "lesson" && sel.id === l.id ? " on" : ""), type: "button", onclick: () => select("lesson", l.id) }, [
          el("span", { class: "dot" + (l.status === "published" ? "" : " draft"), title: l.status }),
          el("span", { text: T(l.title) || "(untitled)" })
        ]));
      });
      wrap.appendChild(el("button", { class: "s-add", type: "button", text: "＋ New lesson", onclick: () => addLesson(s.id) }));
      side.appendChild(wrap);
    });
    side.appendChild(el("button", { class: "btn small", type: "button", text: "＋ New section", onclick: addSection }));
  }

  function select(type, id) { sel = { type, id }; showPreview = false; renderSide(); renderMain(); window.scrollTo(0, 0); }

  function addSection() {
    const s = { id: Store.uid("sec"), icon: "🧵", color: "#b8553e", title: { [editLang]: "New section" }, blurb: {} };
    Store.data.sections.push(s); save(); select("section", s.id);
  }
  function addLesson(sectionId) {
    const l = { id: Store.uid("lesson"), sectionId, status: "draft", title: { [editLang]: "New lesson" }, summary: {}, tags: [], blocks: [] };
    Store.data.lessons.push(l); save(); select("lesson", l.id);
  }

  /* ---------- main ---------- */
  function renderMain() {
    const m = $("main");
    m.replaceChildren();
    if (!sel) { m.appendChild(el("div", { class: "panel" }, [el("h2", { text: "Welcome 👋" }), el("p", { text: "Pick a section or a lesson on the left, or add a new one. Everything saves by itself." })])); return; }
    if (sel.type === "section") return sectionEditor(m);
    return lessonEditor(m);
  }

  function sectionEditor(m) {
    const s = Store.section(sel.id);
    if (!s) { sel = null; return renderMain(); }
    const count = Store.lessonsIn(s.id, true).length;
    m.appendChild(el("div", { class: "panel" }, [
      el("h2", { text: "Section" }),
      tInput("Name", s, "title"),
      tInput("Short description", s, "blurb"),
      el("div", { class: "row" }, [
        plain("Icon (an emoji)", s.icon, (v) => { s.icon = v; }),
        field("Colour", (() => { const c = el("input", { type: "color" }); c.value = s.color || "#b8553e"; c.addEventListener("input", () => { s.color = c.value; save(); }); c.addEventListener("change", renderSide); return c; })())
      ]),
      el("div", { class: "row" }, [
        el("button", { class: "btn small danger", type: "button", text: "Delete section", onclick: () => {
          if (!confirm("Delete this section and its " + count + " lesson(s)? This cannot be undone.")) return;
          Store.data.lessons = Store.data.lessons.filter((l) => l.sectionId !== s.id);
          Store.data.sections = Store.data.sections.filter((x) => x.id !== s.id);
          save(); sel = null; renderSide(); renderMain();
        } })
      ])
    ]));
  }

  function lessonEditor(m) {
    const l = Store.lesson(sel.id);
    if (!l) { sel = null; return renderMain(); }
    const secSel = el("select", {});
    Store.data.sections.forEach((s) => { const o = el("option", { value: s.id, text: s.icon + " " + (T(s.title) || s.id) }); if (s.id === l.sectionId) o.selected = true; secSel.appendChild(o); });
    secSel.addEventListener("change", () => { l.sectionId = secSel.value; save(); renderSide(); });

    const tags = el("input", { type: "text" });
    tags.value = (l.tags || []).join(", ");
    tags.addEventListener("input", () => { l.tags = tags.value.split(",").map((x) => x.trim()).filter(Boolean); save(); });

    const published = l.status === "published";
    m.appendChild(el("div", { class: "panel" }, [
      el("div", { class: "row" }, [
        el("h2", { text: "Lesson", style: "margin:0" }),
        el("span", { class: "status " + l.status, text: published ? "Published" : "Draft" }),
        el("span", { style: "flex:1" }),
        el("button", { class: "btn small" + (published ? " ghost" : ""), type: "button", text: published ? "Unpublish" : "Publish ✓", onclick: () => { l.status = published ? "draft" : "published"; save(); renderSide(); renderMain(); } }),
        el("button", { class: "btn small ghost", type: "button", text: showPreview ? "Hide preview" : "👁 Preview here", onclick: () => { showPreview = !showPreview; renderMain(); } }),
        el("a", { class: "btn small ghost", href: "index.html#/lesson/" + l.id, target: "_blank", rel: "noopener", text: "Open on site ↗" })
      ]),
      tInput("Title", l, "title"),
      tInput("Short summary", l, "summary"),
      field("Section", secSel),
      field("Search words (separate with commas — add words in every language)", tags, "Lessons show up when someone searches these words, e.g. pattern, पैटर्न, kurta.")
    ]));

    if (showPreview) {
      const box = el("div", { class: "preview-box" }, [el("h2", { text: T(l.title) })]);
      (l.blocks || []).forEach((b) => box.appendChild(renderBlock(b, editLang, Store.ui(editLang), Store)));
      m.appendChild(box);
    }

    m.appendChild(el("h3", { text: "Lesson content" }));
    (l.blocks || []).forEach((b, i) => m.appendChild(blockCard(l, b, i)));

    const bar = el("div", { class: "add-bar" });
    [["heading", "🔖 Heading"], ["text", "📝 Text"], ["motion", "🎞 Motion graphic"], ["image", "🖼 Image / GIF"], ["video", "🎬 Video"], ["table", "▦ Table"], ["measure", "📏 Measurements"], ["colors", "🎨 Colours"], ["model3d", "🧊 3D preview"], ["audio", "🔊 Audio"]]
      .forEach(([t, label]) => bar.appendChild(el("button", { class: "btn small", type: "button", text: label, onclick: () => { l.blocks.push(newBlock(t)); save(); renderMain(); } })));
    m.appendChild(bar);

    m.appendChild(el("div", { class: "row" }, [
      el("button", { class: "btn small danger", type: "button", text: "Delete lesson", onclick: () => {
        if (!confirm("Delete this lesson? This cannot be undone.")) return;
        Store.data.lessons = Store.data.lessons.filter((x) => x.id !== l.id);
        save(); sel = null; renderSide(); renderMain();
      } })
    ]));
  }

  function newBlock(t) {
    switch (t) {
      case "heading": return { type: "heading", level: 2, text: {} };
      case "text": return { type: "text", html: {} };
      case "motion": return { type: "motion", preset: MOTION_PRESETS[0], caption: {} };
      case "image": return { type: "image", url: "", caption: {} };
      case "video": return { type: "video", url: "", caption: {} };
      case "table": return { type: "table", csv: { [editLang]: "Name,Value\nExample,1" } };
      case "measure": return { type: "measure", lines: { [editLang]: "Bust | 36 | in\nWaist | 30 | in" } };
      case "colors": return { type: "colors", colors: ["#b8553e", "#5f8f86", "#c28a2c"], caption: {} };
      case "model3d": return { type: "model3d", model: "kurta", color: "#b8553e", caption: {} };
      case "audio": return { type: "audio", url: "", narration: {} };
      default: return { type: "text", html: {} };
    }
  }

  const TYPE_NAMES = { heading: "🔖 Heading", text: "📝 Text", motion: "🎞 Motion graphic", image: "🖼 Image / GIF", video: "🎬 Video", table: "▦ Table", measure: "📏 Measurements", colors: "🎨 Colours", model3d: "🧊 3D preview", audio: "🔊 Audio" };

  function blockCard(l, b, i) {
    const head = el("div", { class: "b-head" }, [
      el("span", { text: TYPE_NAMES[b.type] || b.type }), el("span", { class: "spacer" }),
      el("button", { class: "mini", type: "button", title: "Move up", text: "↑", onclick: () => { if (move(l.blocks, i, -1)) { save(); renderMain(); } } }),
      el("button", { class: "mini", type: "button", title: "Move down", text: "↓", onclick: () => { if (move(l.blocks, i, 1)) { save(); renderMain(); } } }),
      el("button", { class: "mini", type: "button", title: "Duplicate", text: "⧉", onclick: () => { l.blocks.splice(i + 1, 0, JSON.parse(JSON.stringify(b))); save(); renderMain(); } }),
      el("button", { class: "mini", type: "button", title: "Delete block", text: "🗑", onclick: () => { if (confirm("Delete this block?")) { l.blocks.splice(i, 1); save(); renderMain(); } } })
    ]);
    const body = el("div", { class: "b-body" });
    const editors = { heading: headingEditor, text: textEditor, motion: motionEditor, image: imageEditor, video: videoEditor, table: tableEditor, measure: measureEditor, colors: colorsEditor, model3d: model3dEditor, audio: audioEditor };
    (editors[b.type] || (() => {}))(b, body);
    return el("div", { class: "b-card" }, [head, body]);
  }

  /* ---------- block editors ---------- */
  function headingEditor(b, body) {
    const lv = el("select", {});
    [[2, "Big heading"], [3, "Smaller heading"]].forEach(([v, label]) => { const o = el("option", { value: String(v), text: label }); if ((b.level || 2) === v) o.selected = true; lv.appendChild(o); });
    lv.addEventListener("change", () => { b.level = parseInt(lv.value, 10); save(); });
    body.appendChild(tInput("Heading text", b, "text", { hint: "Headings appear in the “On this page” panel automatically." }));
    body.appendChild(field("Size", lv));
  }

  function textEditor(b, body) {
    if (!b.html || typeof b.html !== "object") b.html = {};
    const area = el("div", { class: "rt-area", contenteditable: "true", role: "textbox", "aria-multiline": "true", "aria-label": "Lesson text" });
    area.innerHTML = sanitize(own(b.html, editLang));
    const cmd = (c, v) => { document.execCommand(c, false, v || null); sync(); };
    const sync = () => { b.html[editLang] = sanitize(area.innerHTML); save(); };
    area.addEventListener("input", sync);
    const btn = (label, title, fn) => el("button", { type: "button", title, "aria-label": title, text: label, onmousedown: (e) => e.preventDefault(), onclick: fn });
    const color = el("input", { type: "color", title: "Text colour", value: "#b8553e" });
    color.addEventListener("input", () => { area.focus(); cmd("foreColor", color.value); });
    const bar = el("div", { class: "rt-bar" }, [
      btn("B", "Bold", () => cmd("bold")), btn("I", "Italic", () => cmd("italic")), btn("U", "Underline", () => cmd("underline")),
      btn("H2", "Big heading", () => cmd("formatBlock", "h2")), btn("H3", "Smaller heading", () => cmd("formatBlock", "h3")), btn("¶", "Normal text", () => cmd("formatBlock", "p")),
      btn("•", "Bullet list", () => cmd("insertUnorderedList")), btn("1.", "Numbered list", () => cmd("insertOrderedList")),
      color, btn("✕", "Clear formatting", () => cmd("removeFormat"))
    ]);
    body.appendChild(bar); body.appendChild(area);
    enHint(body, own(b.html, "en") ? Store.stripHtml(b.html.en) : "", () => { b.html[editLang] = b.html.en; area.innerHTML = sanitize(b.html.en); save(); }, area);
  }

  /* When editing another language and it is empty, show the English text with a copy button. */
  function enHint(body, enText, copy, area) {
    if (editLang === "en" || !enText) return;
    const h = el("div", { class: "en-hint" }, [el("span", { text: "English: " + enText.slice(0, 160) + (enText.length > 160 ? "…" : "") }),
      el("button", { class: "btn small ghost", type: "button", text: "Copy English", onclick: () => { copy(); h.remove(); } })]);
    body.appendChild(h);
    if (area) area.addEventListener("input", () => { if (area.textContent.trim()) h.remove(); }, { once: true });
  }

  function motionEditor(b, body) {
    const s = el("select", {});
    const names = { "running-stitch": "Running stitch", cutting: "Cutting cloth", "measuring-tape": "Measuring tape", threading: "Threading a needle" };
    MOTION_PRESETS.forEach((p) => { const o = el("option", { value: p, text: names[p] || p }); if (p === b.preset) o.selected = true; s.appendChild(o); });
    s.addEventListener("change", () => { b.preset = s.value; save(); });
    body.appendChild(field("Animation", s, "Plays automatically when the learner scrolls to it."));
    body.appendChild(tInput("Caption", b, "caption"));
  }

  function imageEditor(b, body) {
    const url = el("input", { type: "text", placeholder: "https://… or upload below" });
    url.value = b.url && b.url.startsWith("data:") ? "(uploaded picture)" : (b.url || "");
    const thumb = el("img", { class: "thumb", alt: "" });
    const showThumb = () => { const u = Render.safeUrl(b.url, true); thumb.style.display = u ? "" : "none"; if (u) thumb.src = u; };
    url.addEventListener("input", () => { b.url = url.value.trim(); showThumb(); save(); });
    const file = el("input", { type: "file", accept: "image/*" });
    file.addEventListener("change", () => {
      const f = file.files[0]; if (!f) return;
      if (f.type === "image/gif" && f.size < 400000) { const r = new FileReader(); r.onload = () => { b.url = r.result; url.value = "(uploaded GIF)"; showThumb(); save(); }; r.readAsDataURL(f); return; }
      if (f.type === "image/gif") { alert("This GIF is large. Please host it online and paste its link, or use a GIF under 400 KB."); return; }
      const img = new Image(); const objUrl = URL.createObjectURL(f);
      img.onload = () => {
        const max = 900, k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        b.url = c.toDataURL("image/jpeg", 0.8); URL.revokeObjectURL(objUrl);
        url.value = "(uploaded picture)"; showThumb(); save();
      };
      img.src = objUrl;
    });
    body.appendChild(field("Picture link", url, "Animated GIFs work too."));
    body.appendChild(field("…or upload a picture", file, "Uploads are shrunk and kept in this browser. For lots of pictures, host them online and paste links."));
    body.appendChild(thumb); showThumb();
    body.appendChild(tInput("Caption", b, "caption"));
  }

  function videoEditor(b, body) {
    body.appendChild(plain("Video link (YouTube or .mp4)", b.url, (v) => { b.url = v.trim(); }, "text"));
    body.appendChild(tInput("Caption", b, "caption"));
  }

  function tableEditor(b, body) {
    if (!b.csv || typeof b.csv !== "object") b.csv = {};
    const a = el("textarea", {}); a.value = own(b.csv, editLang);
    a.addEventListener("input", () => { b.csv[editLang] = a.value; save(); });
    body.appendChild(field("Table rows (" + editLang + ")", a, "One row per line, columns separated by commas. First line is the heading."));
    enHint(body, own(b.csv, "en").split("\n")[0] || "", () => { b.csv[editLang] = b.csv.en; a.value = b.csv.en; save(); });
  }

  function measureEditor(b, body) {
    if (!b.lines || typeof b.lines !== "object") b.lines = {};
    const a = el("textarea", {}); a.value = own(b.lines, editLang);
    a.addEventListener("input", () => { b.lines[editLang] = a.value; save(); });
    body.appendChild(field("Measurements (" + editLang + ")", a, "One per line: name | number | unit   — for example  Waist | 30 | in"));
    enHint(body, own(b.lines, "en").split("\n")[0] || "", () => { b.lines[editLang] = b.lines.en; a.value = b.lines.en; save(); });
  }

  function colorsEditor(b, body) {
    const wrap = el("div", { class: "color-edit" });
    const draw = () => {
      wrap.replaceChildren();
      (b.colors || []).forEach((c, i) => {
        const inp = el("input", { type: "color" }); inp.value = c;
        inp.addEventListener("input", () => { b.colors[i] = inp.value; save(); });
        wrap.appendChild(inp);
        wrap.appendChild(el("button", { class: "mini", type: "button", title: "Remove colour", text: "✕", onclick: () => { b.colors.splice(i, 1); save(); draw(); } }));
      });
      wrap.appendChild(el("button", { class: "btn small ghost", type: "button", text: "＋ Colour", onclick: () => { b.colors.push("#888888"); save(); draw(); } }));
    };
    draw();
    body.appendChild(field("Colours the learner can try on the kurta", wrap));
    body.appendChild(tInput("Caption", b, "caption"));
  }

  function model3dEditor(b, body) {
    const c = el("input", { type: "color" }); c.value = b.color || "#b8553e";
    c.addEventListener("input", () => { b.color = c.value; save(); });
    body.appendChild(field("Garment colour", c, "Learners drag to turn the garment around (front and back)."));
    body.appendChild(tInput("Caption", b, "caption"));
  }

  function audioEditor(b, body) {
    body.appendChild(plain("Audio file link (.mp3) — optional", b.url, (v) => { b.url = v.trim(); }, "text"));
    body.appendChild(tInput("What the voice should say", b, "narration", { area: true, hint: "If there is no audio link, the learner's device reads this aloud in their language." }));
  }

  /* ---------- top bar actions ---------- */
  function fillLangSelect() {
    const s = $("editLang"); s.replaceChildren();
    Store.data.languages.forEach((l) => { const o = el("option", { value: l.code, text: l.label }); if (l.code === editLang) o.selected = true; s.appendChild(o); });
  }
  $("editLang").addEventListener("change", () => { editLang = $("editLang").value; renderSide(); renderMain(); });
  $("addLang").addEventListener("click", () => {
    const code = (prompt("Language code (2 letters, e.g. gu for Gujarati, mr for Marathi):") || "").trim().toLowerCase();
    if (!/^[a-z]{2,3}$/.test(code)) return;
    if (Store.data.languages.some((l) => l.code === code)) return alert("That language already exists.");
    const label = (prompt("Name to show to learners (in that language, e.g. ગુજરાતી):") || code).trim();
    Store.data.languages.push({ code, label, voice: code + "-IN" });
    editLang = code; save(); fillLangSelect(); renderSide(); renderMain();
  });

  $("exportBtn").addEventListener("click", () => {
    const a = el("a", { href: URL.createObjectURL(new Blob([Store.exportJSON()], { type: "application/json" })), download: "sajanies-backup-" + new Date().toISOString().slice(0, 10) + ".json" });
    document.body.appendChild(a); a.click(); a.remove();
  });
  $("importBtn").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", () => {
    const f = $("importFile").files[0]; if (!f) return;
    if (!confirm("Restore from this backup? It replaces everything you have now.")) { $("importFile").value = ""; return; }
    const r = new FileReader();
    r.onload = () => { try { Store.importJSON(r.result); editLang = Store.data.languages[0].code; sel = null; fillLangSelect(); renderSide(); renderMain(); save(); } catch (e) { alert(e.message); } $("importFile").value = ""; };
    r.readAsText(f);
  });
  $("moreBtn").addEventListener("click", () => {
    const c = prompt("Type 1 to change passcode, 2 to reset everything to the sample lessons:");
    if (c === "1") {
      const p = prompt("New passcode (at least 4 characters):");
      if (p && p.length >= 4) { try { localStorage.setItem(PASS_KEY, p); alert("Passcode changed."); } catch (e) {} }
    } else if (c === "2") {
      if (confirm("This deletes all your changes and brings back the sample lessons. Make a Backup first. Continue?")) {
        Store.reset(); editLang = Store.data.languages[0].code; sel = null; fillLangSelect(); renderSide(); renderMain();
      }
    }
  });

  function start() {
    $("gate").hidden = true; $("app").hidden = false;
    fillLangSelect(); renderSide(); renderMain();
  }

  if (isIn()) start(); else gate();
})();
