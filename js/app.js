/* Learner site: home, sections, lessons, search, language switch, listen. */
(function () {
  const { el, Speech, renderBlock } = Render;
  Store.load();
  let lang = Store.getLang();
  const view = document.getElementById("view");
  const U = () => Store.ui(lang);
  const T = (o) => Store.t(o, lang);
  const isAdmin = () => { try { return sessionStorage.getItem("sajanies.admin") === "1"; } catch (e) { return false; } };

  /* ---------- header / chrome ---------- */
  const searchInput = document.getElementById("q");
  const langSel = document.getElementById("lang");
  const sizeBtn = document.getElementById("size");
  const adminLink = document.getElementById("adminLink");
  const brand = document.getElementById("brandName");
  const homeLink = document.getElementById("homeLink");

  function chrome() {
    const u = U();
    document.documentElement.lang = lang;
    brand.textContent = u.siteName;
    searchInput.placeholder = u.search;
    searchInput.setAttribute("aria-label", u.search);
    adminLink.textContent = "🔐 " + u.admin;
    sizeBtn.title = u.textSize; sizeBtn.setAttribute("aria-label", u.textSize);
    homeLink.setAttribute("aria-label", u.home);
    langSel.innerHTML = "";
    Store.data.languages.forEach((l) => {
      const o = el("option", { value: l.code, text: l.label });
      if (l.code === lang) o.selected = true;
      langSel.appendChild(o);
    });
  }
  langSel.addEventListener("change", () => { lang = langSel.value; Store.setLang(lang); Speech.stop(); chrome(); route(); });

  const SIZES = [100, 118, 135];
  let sizeIdx = 0;
  try { sizeIdx = Math.min(SIZES.length - 1, parseInt(localStorage.getItem("sajanies.size") || "0", 10) || 0); } catch (e) {}
  const applySize = () => { document.documentElement.style.fontSize = SIZES[sizeIdx] + "%"; };
  applySize();
  sizeBtn.addEventListener("click", () => { sizeIdx = (sizeIdx + 1) % SIZES.length; applySize(); try { localStorage.setItem("sajanies.size", String(sizeIdx)); } catch (e) {} });

  let timer = null;
  searchInput.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = searchInput.value.trim();
      if (q) location.hash = "#/search/" + encodeURIComponent(q);
      else if (location.hash.startsWith("#/search")) location.hash = "#/";
    }, 250);
  });
  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    location.hash = q ? "#/search/" + encodeURIComponent(q) : "#/";
  });

  /* ---------- small components ---------- */
  function lessonCard(l) {
    const s = Store.section(l.sectionId);
    return el("a", { class: "lesson-card", href: "#/lesson/" + l.id }, [
      el("span", { class: "lc-icon", style: s ? "background:" + s.color : "", text: s ? s.icon : "📖" }),
      el("span", { class: "lc-text" }, [
        el("b", { text: T(l.title) }),
        el("small", { text: T(l.summary) }),
        s ? el("em", { text: T(s.title) }) : ""
      ]),
      l.status !== "published" ? el("span", { class: "badge", text: "draft" }) : ""
    ]);
  }

  function crumb(parts) {
    const nav = el("nav", { class: "crumbs", "aria-label": "breadcrumb" });
    parts.forEach((p, i) => {
      if (i) nav.appendChild(el("span", { text: " › " }));
      nav.appendChild(p.href ? el("a", { href: p.href, text: p.text }) : el("span", { text: p.text }));
    });
    return nav;
  }

  /* ---------- pages ---------- */
  function home() {
    const u = U();
    document.title = u.siteName;
    const page = el("div", { class: "page" });
    page.appendChild(el("section", { class: "hero" }, [
      el("div", { class: "hero-art", "aria-hidden": "true", html: false }, [el("span", { text: "🧵" }), el("span", { text: "✂️" }), el("span", { text: "🪡" })]),
      el("h1", { text: u.siteName }),
      el("p", { text: u.tagline }),
      el("a", { class: "btn big", href: "#sections", onclick: (e) => { e.preventDefault(); document.getElementById("sections").scrollIntoView({ behavior: "smooth" }); }, text: u.startLearning + " →" })
    ]));

    const grid = el("section", { id: "sections", class: "block-section" }, [el("h2", { text: u.allSections })]);
    const cards = el("div", { class: "section-grid" });
    Store.sections().forEach((s) => {
      const n = Store.lessonsIn(s.id).length;
      cards.appendChild(el("a", { class: "section-card", href: "#/section/" + s.id, style: "--c:" + s.color }, [
        el("span", { class: "sc-icon", text: s.icon }),
        el("b", { text: T(s.title) }),
        el("small", { text: T(s.blurb) }),
        el("em", { text: n + " " + (n === 1 ? u.lesson : u.lessons) })
      ]));
    });
    grid.appendChild(cards);
    page.appendChild(grid);

    const starters = Store.sections().map((s) => Store.lessonsIn(s.id)[0]).filter(Boolean).slice(0, 4);
    if (starters.length) {
      const pop = el("section", { class: "block-section" }, [el("h2", { text: u.popular })]);
      const list = el("div", { class: "lesson-list" });
      starters.forEach((l) => list.appendChild(lessonCard(l)));
      pop.appendChild(list);
      page.appendChild(pop);
    }
    view.replaceChildren(page);
  }

  function sectionPage(id) {
    const u = U();
    const s = Store.section(id);
    if (!s) return notFound();
    document.title = T(s.title) + " · " + u.siteName;
    const page = el("div", { class: "page" }, [
      crumb([{ href: "#/", text: u.home }, { text: T(s.title) }]),
      el("header", { class: "page-head", style: "--c:" + s.color }, [
        el("span", { class: "sc-icon", text: s.icon }),
        el("div", {}, [el("h1", { text: T(s.title) }), el("p", { text: T(s.blurb) })])
      ])
    ]);
    const ls = Store.lessonsIn(id, isAdmin());
    if (!ls.length) page.appendChild(el("p", { class: "empty", text: u.emptySection }));
    else { const list = el("div", { class: "lesson-list" }); ls.forEach((l) => list.appendChild(lessonCard(l))); page.appendChild(list); }
    view.replaceChildren(page);
  }

  function lessonPage(id) {
    const u = U();
    const l = Store.lesson(id);
    if (!l || (l.status !== "published" && !isAdmin())) return notFound();
    const s = Store.section(l.sectionId);
    document.title = T(l.title) + " · " + u.siteName;

    const page = el("article", { class: "page lesson" });
    page.appendChild(crumb([{ href: "#/", text: u.home }, s ? { href: "#/section/" + s.id, text: T(s.title) } : { text: "" }, { text: T(l.title) }]));
    if (l.status !== "published") page.appendChild(el("p", { class: "draft-note", text: "Draft — only you can see this." }));
    page.appendChild(el("h1", { text: T(l.title) }));
    if (T(l.summary)) page.appendChild(el("p", { class: "lead", text: T(l.summary) }));

    if (Speech.supported) {
      let playing = false;
      const btn = el("button", { class: "btn", type: "button", text: "🔊 " + u.listen });
      const reset = () => { playing = false; btn.textContent = "🔊 " + u.listen; };
      btn.addEventListener("click", () => {
        if (playing) { Speech.stop(); reset(); return; }
        const ok = Speech.speak(Store.lessonText(l, lang), Store.voiceFor(lang), reset);
        if (ok) { playing = true; btn.textContent = "⏹ " + u.stop; } else alert(u.noAudioVoice);
      });
      page.appendChild(el("div", { class: "listen-row" }, [btn]));
    }

    (l.blocks || []).forEach((b) => page.appendChild(renderBlock(b, lang, u, Store)));

    const sibs = Store.lessonsIn(l.sectionId, isAdmin());
    const i = sibs.findIndex((x) => x.id === l.id);
    const nav = el("nav", { class: "pager" });
    if (i > 0) nav.appendChild(el("a", { class: "btn ghost", href: "#/lesson/" + sibs[i - 1].id, text: "← " + u.previous }));
    if (i >= 0 && i < sibs.length - 1) nav.appendChild(el("a", { class: "btn", href: "#/lesson/" + sibs[i + 1].id, text: u.next + " →" }));
    if (nav.childNodes.length) page.appendChild(nav);
    view.replaceChildren(page);
  }

  function searchPage(q) {
    const u = U();
    document.title = q + " · " + u.siteName;
    const res = Store.search(q, isAdmin());
    const page = el("div", { class: "page" }, [
      crumb([{ href: "#/", text: u.home }, { text: u.results + " “" + q + "”" }]),
      el("h1", { text: u.results + " “" + q + "”" })
    ]);
    if (!res.length) page.appendChild(el("p", { class: "empty", text: u.noResults }));
    else { const list = el("div", { class: "lesson-list" }); res.forEach((l) => list.appendChild(lessonCard(l))); page.appendChild(list); }
    view.replaceChildren(page);
  }

  function notFound() {
    const u = U();
    view.replaceChildren(el("div", { class: "page" }, [el("p", { class: "empty", text: u.noResults }), el("a", { class: "btn", href: "#/", text: u.home })]));
  }

  /* ---------- router ---------- */
  function route() {
    Speech.stop();
    const h = (location.hash || "#/").replace(/^#/, "");
    const parts = h.split("/").filter(Boolean);
    const arg = parts[1] ? decodeURIComponent(parts.slice(1).join("/")) : "";
    if (parts[0] === "section") sectionPage(arg);
    else if (parts[0] === "lesson") lessonPage(arg);
    else if (parts[0] === "search") { searchInput.value = arg; searchPage(arg); }
    else home();
    if (parts[0] !== "search" && document.activeElement !== searchInput) searchInput.value = "";
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  chrome();
  route();
})();
