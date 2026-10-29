/* Shared rendering: lesson blocks, motion graphics, 3D preview and voice (text-to-speech). */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, children) => {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) n.setAttribute(k, v);
    });
    (children || []).forEach((c) => n.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return n;
  };

  /* ---------- safety helpers ---------- */
  const safeUrl = (u, allowData) => {
    u = (u || "").trim();
    if (!u) return "";
    if (/^(https?:)?\/\//i.test(u) || /^[\w./-]+$/.test(u)) return u;
    if (allowData && /^data:image\/(png|jpe?g|gif|webp|svg\+xml);/i.test(u)) return u;
    return "";
  };

  const ALLOWED = { P: 1, B: 1, I: 1, U: 1, STRONG: 1, EM: 1, UL: 1, OL: 1, LI: 1, H2: 1, H3: 1, BR: 1, SPAN: 1, A: 1, DIV: 1 };
  function sanitize(html) {
    const doc = new DOMParser().parseFromString("<body>" + (html || "") + "</body>", "text/html");
    const walk = (node) => {
      Array.from(node.childNodes).forEach((c) => {
        if (c.nodeType === 3) return;
        if (c.nodeType !== 1) { c.remove(); return; }
        if (c.tagName === "FONT") {
          const s = document.createElement("span");
          if (c.getAttribute("color")) s.style.color = c.getAttribute("color");
          while (c.firstChild) s.appendChild(c.firstChild);
          c.replaceWith(s); walk(s); return;
        }
        if (!ALLOWED[c.tagName]) {
          if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED)$/.test(c.tagName)) { c.remove(); return; }
          while (c.firstChild) c.parentNode.insertBefore(c.firstChild, c);
          c.remove(); return;
        }
        Array.from(c.attributes).forEach((a) => {
          const keepColor = a.name === "style" && /^(color|background-color):\s*[#\w(),.\s%-]+;?$/i.test(a.value.trim());
          const keepHref = c.tagName === "A" && a.name === "href" && /^https?:/i.test(a.value);
          if (!keepColor && !keepHref) c.removeAttribute(a.name);
        });
        if (c.tagName === "A") { c.setAttribute("target", "_blank"); c.setAttribute("rel", "noopener"); }
        walk(c);
      });
    };
    walk(doc.body);
    return doc.body.innerHTML;
  }

  /* ---------- voice ---------- */
  const Speech = {
    supported: "speechSynthesis" in window,
    current: null,
    stop() {
      if (!this.supported) return;
      this.token = (this.token || 0) + 1;
      window.speechSynthesis.cancel();
      if (this.current) { const c = this.current; this.current = null; c(); }
    },
    pickVoice(lang) {
      const vs = window.speechSynthesis.getVoices() || [];
      const base = lang.slice(0, 2).toLowerCase();
      return vs.find((v) => v.lang.replace("_", "-").toLowerCase() === lang.toLowerCase()) ||
             vs.find((v) => v.lang.toLowerCase().startsWith(base)) || null;
    },
    /* Returns false when the device has no voice for the language. */
    speak(text, lang, onEnd) {
      if (!this.supported || !text) return false;
      this.stop();
      const voice = this.pickVoice(lang);
      const voices = window.speechSynthesis.getVoices();
      if (!voice && voices.length) return false;
      const chunks = (text.match(/[^.!?।]+[.!?।]?/g) || [text]).map((s) => s.trim()).filter(Boolean);
      const my = this.token;
      this.current = onEnd || function () {};
      let i = 0;
      const next = () => {
        if (my !== this.token) return;
        if (i >= chunks.length) { const c = this.current; this.current = null; if (c) c(); return; }
        const u = new SpeechSynthesisUtterance(chunks[i++]);
        u.lang = lang; if (voice) u.voice = voice; u.rate = 0.92;
        u.onend = next; u.onerror = next;
        window.speechSynthesis.speak(u);
      };
      next();
      return true;
    }
  };
  if (Speech.supported) { window.speechSynthesis.onvoiceschanged = function () {}; window.speechSynthesis.getVoices(); }

  /* ---------- kurta drawing (used for colours + 3D) ---------- */
  function kurtaSVG(color, side) {
    const neck = side === "back" ? "Q100 36 130 20" : "Q100 78 130 20";
    return (
      '<svg xmlns="' + NS + '" viewBox="0 0 200 260" class="kurta">' +
      '<path d="M70 20 Q100 40 130 20 L175 45 L192 112 L160 120 L150 100 L150 242 L50 242 L50 100 L40 120 L8 112 L25 45 Z" fill="' + color + '" stroke="rgba(0,0,0,.25)" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M70 20 ' + neck + '" fill="rgba(255,255,255,.35)" stroke="rgba(0,0,0,.25)" stroke-width="2"/>' +
      (side === "back" ? "" : '<path d="M100 62 L100 140" stroke="rgba(0,0,0,.3)" stroke-width="2" stroke-dasharray="4 4"/><circle cx="100" cy="80" r="3" fill="rgba(255,255,255,.8)"/><circle cx="100" cy="105" r="3" fill="rgba(255,255,255,.8)"/>') +
      '<path d="M50 235 L150 235" stroke="rgba(255,255,255,.5)" stroke-width="3" stroke-dasharray="6 5"/>' +
      "</svg>"
    );
  }

  /* ---------- motion graphics (animated SVG) ---------- */
  const MOTION = {
    "running-stitch"() {
      let seg = "", i;
      for (i = 0; i < 9; i++) {
        const x = 50 + i * 34;
        seg += '<line x1="' + x + '" y1="112" x2="' + (x + 20) + '" y2="112" stroke="#b8553e" stroke-width="4" stroke-linecap="round" opacity="0"><animate attributeName="opacity" from="0" to="1" begin="' + (0.3 + i * 0.5).toFixed(2) + 's" dur="0.2s" fill="freeze"/></line>';
      }
      let path = "M40 90";
      for (i = 0; i < 9; i++) { const x = 50 + i * 34; path += " L" + (x + 20) + " 140 L" + (x + 34) + " 90"; }
      return '<svg viewBox="0 0 400 220" xmlns="' + NS + '" role="img">' +
        '<rect x="20" y="60" width="360" height="100" rx="10" fill="#efe0c8" stroke="#cdb48e" stroke-width="2"/>' +
        '<line x1="20" y1="112" x2="380" y2="112" stroke="#cdb48e" stroke-dasharray="2 6"/>' + seg +
        '<g><text font-size="30" text-anchor="middle" dominant-baseline="middle" transform="rotate(-45)">🪡</text><animateMotion dur="' + (0.5 * 9 + 0.5) + 's" begin="0s" fill="freeze" path="' + path + '"/></g></svg>';
    },
    cutting() {
      const d = "M60 40 L150 40 Q200 100 250 40 L340 40 L340 180 L60 180 Z";
      return '<svg viewBox="0 0 400 220" xmlns="' + NS + '" role="img">' +
        '<rect x="30" y="20" width="340" height="180" rx="12" fill="#efe0c8" stroke="#cdb48e" stroke-width="2"/>' +
        '<path d="' + d + '" fill="none" stroke="#9a8a78" stroke-width="2" stroke-dasharray="6 6"/>' +
        '<path d="' + d + '" fill="none" stroke="#b8553e" stroke-width="4" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="6s" fill="freeze"/></path>' +
        '<g><text font-size="30" text-anchor="middle" dominant-baseline="middle">✂️</text><animateMotion dur="6s" fill="freeze" path="' + d + '"/></g></svg>';
    },
    "measuring-tape"() {
      return '<svg viewBox="0 0 400 220" xmlns="' + NS + '" role="img"><defs>' +
        '<pattern id="ticks" width="12" height="18" patternUnits="userSpaceOnUse"><rect width="12" height="18" fill="#f6d65b"/><line x1="0" y1="0" x2="0" y2="9" stroke="#7a5c00" stroke-width="2"/></pattern></defs>' +
        '<circle cx="200" cy="40" r="26" fill="#d9b99b"/>' +
        '<path d="M120 200 L135 80 Q200 60 265 80 L280 200 Z" fill="#d9b99b"/>' +
        '<rect x="120" y="112" width="0" height="18" fill="url(#ticks)" stroke="#7a5c00" stroke-width="1.5"><animate attributeName="width" from="0" to="160" dur="3s" fill="freeze"/><animate attributeName="x" from="120" to="120" dur="3s" fill="freeze"/></rect>' +
        '<text x="200" y="160" text-anchor="middle" font-size="22" font-weight="700" fill="#b8553e" opacity="0">36 in<animate attributeName="opacity" from="0" to="1" begin="3s" dur="0.6s" fill="freeze"/></text></svg>';
    },
    threading() {
      const d = "M20 170 C120 170 180 90 262 103 C300 108 320 80 380 60";
      return '<svg viewBox="0 0 400 220" xmlns="' + NS + '" role="img">' +
        '<rect x="250" y="100" width="130" height="6" rx="3" fill="#9aa0a6"/>' +
        '<ellipse cx="262" cy="103" rx="3.5" ry="9" fill="#fbf7f0" stroke="#6b7076" stroke-width="2"/>' +
        '<path d="M380 103 L396 103" stroke="#9aa0a6" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="' + d + '" fill="none" stroke="#b8553e" stroke-width="3.5" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="4s" fill="freeze"/></path>' +
        '<text x="262" y="140" text-anchor="middle" font-size="14" fill="#7a6a60">eye / नाका</text></svg>';
    }
  };

  /* Starts the animation only when it scrolls into view; Replay restarts it. */
  function motionBlock(preset, caption, ui) {
    const make = MOTION[preset] || MOTION["running-stitch"];
    const stage = el("div", { class: "motion-stage" });
    const draw = () => { stage.innerHTML = make(); };
    const replay = el("button", { class: "btn small ghost", type: "button", text: "↻ " + ui.replay, onclick: draw });
    let started = false;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => { if (!started && es.some((e) => e.isIntersecting)) { started = true; draw(); io.disconnect(); } }, { threshold: 0.35 });
      setTimeout(() => io.observe(stage), 0);
    } else { draw(); }
    return el("figure", { class: "block motion" }, [stage, el("figcaption", {}, [caption ? el("span", { text: caption }) : "", replay])]);
  }

  /* 3D preview: drag to turn a two-sided kurta. */
  function model3dBlock(color, caption, ui) {
    const card = el("div", { class: "card3d" });
    card.innerHTML = '<div class="face front">' + kurtaSVG(color, "front") + '</div><div class="face back">' + kurtaSVG(color, "back") + "</div>";
    const scene = el("div", { class: "scene3d", title: ui.drag3d }, [card]);
    let angle = 20, dragging = false, startX = 0, startA = 0;
    const apply = () => { card.style.transform = "rotateY(" + angle + "deg)"; };
    scene.addEventListener("pointerdown", (e) => { dragging = true; startX = e.clientX; startA = angle; scene.setPointerCapture(e.pointerId); });
    scene.addEventListener("pointermove", (e) => { if (dragging) { angle = startA + (e.clientX - startX) * 0.8; apply(); } });
    const up = () => { dragging = false; };
    scene.addEventListener("pointerup", up); scene.addEventListener("pointercancel", up);
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    (function spin() {
      if (!card.isConnected && card.__seen) return;
      if (card.isConnected) card.__seen = true;
      if (!dragging && !reduce) { angle += 0.35; apply(); }
      requestAnimationFrame(spin);
    })();
    apply();
    return el("figure", { class: "block model3d" }, [scene, el("figcaption", {}, [(caption ? caption + " · " : "") + ui.drag3d])]);
  }

  /* ---------- block renderer ---------- */
  function parseCsv(text) {
    return (text || "").split("\n").map((r) => r.trim()).filter(Boolean).map((r) => r.split(",").map((c) => c.trim()));
  }

  function youtubeId(u) {
    const m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return m ? m[1] : null;
  }

  function renderBlock(b, lang, ui, store) {
    const T = (o) => store.t(o, lang);
    switch (b.type) {
      case "text": {
        const wrap = el("div", { class: "block text" });
        const body = el("div", { class: "rich" });
        body.innerHTML = sanitize(T(b.html));
        const speak = el("button", { class: "icon-btn", type: "button", title: ui.listen, "aria-label": ui.listen, text: "🔊" });
        speak.addEventListener("click", () => {
          if (!Speech.speak(store.stripHtml(T(b.html)), store.voiceFor(lang))) alert(ui.noAudioVoice);
        });
        wrap.appendChild(body);
        if (Speech.supported) wrap.appendChild(speak);
        return wrap;
      }
      case "heading": {
        const h = el(b.level === 3 ? "h3" : "h2", { text: T(b.text) });
        return el("div", { class: "block block-heading" }, [h]);
      }
      case "image": {
        const u = safeUrl(b.url, true);
        const fig = el("figure", { class: "block image" });
        if (u) fig.appendChild(el("img", { src: u, alt: T(b.caption), loading: "lazy" }));
        else fig.appendChild(el("div", { class: "placeholder", text: "🖼️" }));
        if (T(b.caption)) fig.appendChild(el("figcaption", { text: T(b.caption) }));
        return fig;
      }
      case "video": {
        const u = safeUrl(b.url);
        const fig = el("figure", { class: "block video" });
        const yt = youtubeId(u);
        if (yt) fig.appendChild(el("iframe", { src: "https://www.youtube-nocookie.com/embed/" + yt, allowfullscreen: "", loading: "lazy", title: T(b.caption) || "video" }));
        else if (u) fig.appendChild(el("video", { src: u, controls: "", playsinline: "" }));
        else fig.appendChild(el("div", { class: "placeholder", text: "🎬" }));
        if (T(b.caption)) fig.appendChild(el("figcaption", { text: T(b.caption) }));
        return fig;
      }
      case "table": {
        const rows = parseCsv(T(b.csv));
        const t = el("table", { class: "table" });
        rows.forEach((r, i) => {
          const tr = el("tr");
          r.forEach((c) => tr.appendChild(el(i === 0 ? "th" : "td", { text: c })));
          (i === 0 ? (t.tHead || t.createTHead()) : (t.tBodies[0] || t.createTBody())).appendChild(tr);
        });
        return el("div", { class: "block table-wrap" }, [t]);
      }
      case "measure": {
        const items = T(b.lines).split("\n").map((l) => l.split("|").map((x) => x.trim())).filter((p) => p[0]);
        const max = Math.max.apply(null, items.map((p) => parseFloat(p[1]) || 0).concat([1]));
        const box = el("div", { class: "block measure" }, [el("h3", { text: "📏 " + ui.measurements })]);
        items.forEach((p) => {
          const pct = Math.max(6, ((parseFloat(p[1]) || 0) / max) * 100);
          box.appendChild(el("div", { class: "m-row" }, [
            el("span", { class: "m-label", text: p[0] }),
            el("span", { class: "m-bar" }, [el("i", { style: "width:" + pct + "%" })]),
            el("b", { class: "m-val", text: (p[1] || "") + " " + (p[2] || "") })
          ]));
        });
        return box;
      }
      case "colors": {
        const holder = el("div", { class: "color-demo" });
        const preview = el("div", { class: "color-preview" });
        const set = (c) => { preview.innerHTML = kurtaSVG(c, "front"); };
        const sw = el("div", { class: "swatches", role: "group", "aria-label": ui.colours });
        (b.colors || []).forEach((c, i) => {
          const btn = el("button", { class: "swatch", type: "button", style: "background:" + c, "aria-label": c });
          btn.addEventListener("click", () => { set(c); sw.querySelectorAll(".swatch").forEach((x) => x.classList.remove("on")); btn.classList.add("on"); });
          if (i === 0) btn.classList.add("on");
          sw.appendChild(btn);
        });
        set((b.colors || ["#b8553e"])[0]);
        holder.appendChild(preview); holder.appendChild(sw);
        return el("figure", { class: "block colors" }, [holder, el("figcaption", { text: T(b.caption) || ui.colours })]);
      }
      case "model3d": return model3dBlock(b.color || "#b8553e", T(b.caption), ui);
      case "motion": return motionBlock(b.preset, T(b.caption), ui);
      case "audio": {
        const wrap = el("div", { class: "block audio" });
        const u = safeUrl(b.url);
        if (u) wrap.appendChild(el("audio", { src: u, controls: "" }));
        else {
          let playing = false;
          const btn = el("button", { class: "btn", type: "button", text: "🔊 " + ui.listen });
          const reset = () => { playing = false; btn.textContent = "🔊 " + ui.listen; };
          btn.addEventListener("click", () => {
            if (playing) { Speech.stop(); reset(); return; }
            if (Speech.speak(T(b.narration), store.voiceFor(lang), reset)) { playing = true; btn.textContent = "⏹ " + ui.stop; }
            else alert(ui.noAudioVoice);
          });
          wrap.appendChild(btn);
        }
        if (T(b.narration)) wrap.appendChild(el("p", { class: "narration", text: T(b.narration) }));
        return wrap;
      }
      default: return el("div");
    }
  }

  window.Render = { el, sanitize, safeUrl, Speech, renderBlock, kurtaSVG, MOTION_PRESETS: Object.keys(MOTION) };
})();
