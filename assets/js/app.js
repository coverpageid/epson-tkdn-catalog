/* Epson TKDN & PDN Official Digital Catalog — vanilla JS, no build step */
(() => {
  "use strict";
  const P = window.PRODUCTS || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICON = {
    all: '<path d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z"/>',
    ecotank: '<path d="M7 3h10v4H7zM5 8h14a2 2 0 0 1 2 2v6h-4v4H7v-4H3v-6a2 2 0 0 1 2-2zm4 8v2h6v-2z"/>',
    workforce: '<path d="M4 3h16v5H4zm-1 7h18a1 1 0 0 1 1 1v7h-4v3H6v-3H2v-7a1 1 0 0 1 1-1zm5 6v3h8v-3z"/>',
    scanner: '<path d="M4 4h16l2 5v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l2-5zm1.5 2L4.3 9h15.4l-1.2-3H5.5zM6 13v2h12v-2H6z"/>',
    dotmatrix: '<path d="M6 2h12v5H6V2zm-3 6h18a1 1 0 0 1 1 1v8h-4v5H6v-5H2V9a1 1 0 0 1 1-1zm5 7v4h8v-4H8zm-1-4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>',
    label: '<path d="M3 6a2 2 0 0 1 2-2h9l7 7-7 7H5a2 2 0 0 1-2-2V6zm4.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>',
    plotter: '<path d="M3 4h18v7h-2v9h-2v-9H7v9H5v-9H3V4zm4 2v3h10V6H7z"/>',
    projector: '<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2v2h-2v-2H9v2H7v-2H5a2 2 0 0 1-2-2V7zm12 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
    ink: '<path d="M12 2c.6 0 1 .4 1 1v2h2a1 1 0 0 1 1 1v3l2 3v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8l2-3V6a1 1 0 0 1 1-1h2V3c0-.6.4-1 1-1zm-2 9v8h4v-8h-4z"/>',
    plus: '<path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>',
    check: '<path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.1 8.4 18.7 7z"/>',
    ext: '<path d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14zM5 5h6v2H6v11h11v-5h2v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
    share: '<path d="M12 2l4 4-1.4 1.4L13 5.8V15h-2V5.8L9.4 7.4 8 6zM5 10h3v2H6v8h12v-8h-2v-2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1z"/>',
    copy: '<path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k] || ICON.all}</svg>`;

  const CATS = [
    { id: "all", label: "Semua Produk", desc: "Seluruh lini produk Epson Indonesia bersertifikat TKDN Kemenperin RI & Produk Dalam Negeri (PDN) untuk pengadaan pemerintah, BUMN, pendidikan, dan korporasi." },
    { id: "ecotank", label: "EcoTank · Ink Tank", desc: "Printer tangki tinta A4 & A3+ dengan nilai TKDN+BMP tinggi hingga 75,28% (L3251, L3211, L15150, M15140, M15180, dll.)." },
    { id: "workforce", label: "WorkForce · Bisnis", desc: "Printer bisnis & departemen PrecisionCore Heat-Free (WF-Pro, RIPS, dan WorkForce Enterprise AM-Series / WF-C21000)." },
    { id: "scanner", label: "Document Scanner", desc: "Document scanner kecepatan tinggi A4 & A3 (DS-Series & ES-Series) bersertifikat TKDN hingga 55,91% dan PDN." },
    { id: "dotmatrix", label: "Dot Matrix & Passbook", desc: "Printer dot matrix (LQ-310, LX-310, LQ-2190) dan printer buku tabungan perbankan (PLQ-35, PLQ-50) bersertifikat TKDN." },
    { id: "label", label: "ColorWorks · Label", desc: "Printer label warna industri on-demand 4 inci & 8 inci (CW-C6050A/P, CW-C6550A/P) bersertifikat TKDN." },
    { id: "plotter", label: "SureColor · Plotter", desc: "Plotter teknis CAD/GIS 24\"–44\" (SC-T Series) dan printer sublimasi tekstil (SC-F530, SC-F531) TKDN & PDN." },
    { id: "projector", label: "Proyektor 3LCD", desc: "Proyektor bisnis & pendidikan 3LCD XGA bersertifikat TKDN: EB-E600 (55,70%) dan EB-X600 (55,02%)." },
    { id: "ink", label: "Tinta Botol Orisinal", desc: "Botol tinta orisinal Epson seri 003 dan T664 (CMYK) bersertifikat TKDN Kemenperin RI (Mei 2026)." },
  ];

  const FEATURES = [
    { id: "tkdn", label: "Bersertifikat TKDN", test: (p) => p.status === "TKDN" },
    { id: "pdn", label: "PDN", test: (p) => p.status === "PDN" },
    { id: "tkdn50", label: "TKDN+BMP ≥ 50%", test: (p) => p.scoreNum >= 50 },
    { id: "tkdn40", label: "TKDN+BMP ≥ 40%", test: (p) => p.scoreNum >= 40 },
    { id: "cert2026", label: "Sertifikat 2026", test: (p) => p.is2026Cert },
    { id: "wifi", label: "Wi-Fi", test: (p) => p.wifi },
    { id: "ethernet", label: "Ethernet / LAN", test: (p) => p.ethernet },
    { id: "duplex", label: "Duplex", test: (p) => p.duplex },
    { id: "large", label: "Format A3 / Besar", test: (p) => p.largeFormat },
  ];

  const TIER_INFO = {
    "≥ 60%":   { desc: "TKDN+BMP Sangat Tinggi (60% – 75,28%)", color: "#30d158", test: (p) => p.status === "TKDN" && p.scoreNum >= 60 },
    "40–59%":  { desc: "TKDN+BMP Tinggi (40% – 59,99%)", color: "#0a84ff", test: (p) => p.status === "TKDN" && p.scoreNum >= 40 && p.scoreNum < 60 },
    "25–39%":  { desc: "TKDN+BMP Memenuhi Syarat Wajib (≥ 25%)", color: "#ff9f0a", test: (p) => p.status === "TKDN" && p.scoreNum >= 25 && p.scoreNum < 40 },
    "PDN":     { desc: "Produk Dalam Negeri (PDN)", color: "#af52de", test: (p) => p.status === "PDN" },
  };
  const catLabel = (id) => CATS.find((c) => c.id === id)?.label || id;

  const state = {
    cat: "all", features: new Set(), tier: null, q: "", sort: "default",
    view: localStorage.getItem("view") || "grid",
    compare: JSON.parse(localStorage.getItem("compare_tkdn") || "[]").filter((m) => P.some((p) => p.model === m)),
  };

  /* ---------- Theme & clock (auto-follows device OS theme) ---------- */
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const mq = matchMedia("(prefers-color-scheme: dark)");
  let manualTheme = params.get("theme") || sessionStorage.getItem("theme_override");
  const applyTheme = (t) => { root.dataset.theme = t; };
  applyTheme(manualTheme || (mq.matches ? "dark" : "light"));
  mq.addEventListener("change", (e) => {
    sessionStorage.removeItem("theme_override");
    manualTheme = null;
    applyTheme(e.matches ? "dark" : "light");
  });
  $("#themeBtn").onclick = () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    sessionStorage.setItem("theme_override", next);
    applyTheme(next);
  };
  const tick = () => {
    const d = new Date();
    $("#clock").textContent = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }) + "  " +
      d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };
  tick(); setInterval(tick, 15000);

  /* ---------- Sidebar & Subfilter Bars ---------- */
  const CAT_SHORT = {
    all: "Semua", ecotank: "EcoTank", workforce: "WorkForce", scanner: "Scanner",
    dotmatrix: "Dot Matrix", label: "Label", plotter: "Plotter", projector: "Proyektor", ink: "Tinta"
  };
  function renderSidebar() {
    $("#categoryList").innerHTML = CATS.map((c) => {
      const n = c.id === "all" ? P.length : P.filter((p) => p.category === c.id).length;
      return `<li><button class="side-item ${state.cat === c.id ? "active" : ""}" data-cat="${c.id}">
        <span class="ico">${svg(c.id)}</span>${c.label}<span class="count">${n}</span></button></li>`;
    }).join("");
    $("#featureList").innerHTML = FEATURES.map((f) => `<li><button class="side-item ${state.features.has(f.id) ? "active" : ""}" data-feat="${f.id}">
        <span class="check"></span>${f.label}<span class="count">${P.filter(f.test).length}</span></button></li>`).join("");
    $("#tierList").innerHTML = Object.keys(TIER_INFO).map((k) =>
      `<button class="ink-tag ${state.tier === k ? "active" : ""}" data-tier="${k}">${k}</button>`).join("");
    if ($("#chapterNav")) {
      $("#chapterNav").innerHTML = CATS.map((c) =>
        `<button class="chapter-item ${state.cat === c.id ? "active" : ""}" data-cat="${c.id}">
          <span class="chapter-ico">${svg(c.id)}</span>
          <span class="chapter-lbl">${CAT_SHORT[c.id] || c.label}</span>
        </button>`).join("");
    }
    if ($("#mobileFeatureBar")) {
      $("#mobileFeatureBar").innerHTML = `<span class="sf-label">Filter</span>` +
        FEATURES.map((f) => `<button class="sf-pill ${state.features.has(f.id) ? "active" : ""}" data-feat="${f.id}">${f.label}</button>`).join("");
    }
    if ($("#mobileStatusBar")) {
      $("#mobileStatusBar").innerHTML = `<span class="sf-label">TKDN</span>` +
        Object.keys(TIER_INFO).map((k) => `<button class="sf-pill ${state.tier === k ? "active" : ""}" data-tier="${k}">
          <span class="sf-dots"><i style="background:${TIER_INFO[k].color}"></i></span>${k}</button>`).join("");
    }
    const tags = [
      ...[...state.features].map((id) => `<button class="af-chip" data-feat="${id}">${FEATURES.find((f) => f.id === id).label} ×</button>`),
      ...(state.tier ? [`<button class="af-chip" data-tier="${state.tier}">Tingkat: ${state.tier} ×</button>`] : []),
    ];
    const af = $("#activeFilters");
    if (af) { af.innerHTML = tags.join(""); af.hidden = !tags.length; }
    const activeCount = state.features.size + (state.tier ? 1 : 0);
    const fb = $("#filterBadge"), fp = $("#filterBtn");
    if (fb) { fb.textContent = activeCount; fb.hidden = activeCount === 0; }
    if (fp) fp.classList.toggle("active", activeCount > 0);
    if ($("#sheetApply")) $("#sheetApply").textContent = `Tampilkan ${filtered().length} produk`;
  }

  const toggleDrawer = (open) => {
    const sb = $("#sidebar"), bd = $("#drawerBackdrop");
    const show = open ?? !sb.classList.contains("open");
    sb.classList.toggle("open", show);
    if (bd) bd.hidden = !show;
  };
  if ($("#filterBtn")) $("#filterBtn").onclick = () => toggleDrawer();
  if ($("#drawerClose")) $("#drawerClose").onclick = () => toggleDrawer(false);
  if ($("#sheetApply")) $("#sheetApply").onclick = () => toggleDrawer(false);
  if ($("#sheetReset")) $("#sheetReset").onclick = () => { state.cat = "all"; state.tier = null; state.features.clear(); update(); };
  if ($("#drawerBackdrop")) $("#drawerBackdrop").onclick = () => toggleDrawer(false);

  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-cat]"); if (c) { state.cat = c.dataset.cat; update(); return; }
    const f = e.target.closest("[data-feat]");
    if (f) { state.features.has(f.dataset.feat) ? state.features.delete(f.dataset.feat) : state.features.add(f.dataset.feat); update(); return; }
    const t = e.target.closest("[data-tier]");
    if (t) { state.tier = state.tier === t.dataset.tier ? null : t.dataset.tier; closeModal(); update(); return; }
    const cp = e.target.closest("[data-copy]");
    if (cp) {
      e.stopPropagation();
      navigator.clipboard?.writeText(cp.dataset.copy);
      toast(`Disalin: ${cp.dataset.copy}`);
    }
  });

  /* ---------- Filtering ---------- */
  const haystack = (p) => [
    p.model, p.name, p.tagline, p.sku, p.status, p.totalVal, p.tkdnVal, p.certNo,
    p.fnSummary, p.fmtSummary, p.speedSummary, p.connSummary, catLabel(p.category),
    p.wifi && "wifi wi-fi wireless", p.ethernet && "ethernet lan rj45", p.duplex && "duplex 2 sisi",
    p.is2026Cert && "2026 baru"
  ].join(" ").toLowerCase();

  function filtered() {
    const q = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let list = P.filter((p) =>
      (state.cat === "all" || p.category === state.cat) &&
      [...state.features].every((id) => FEATURES.find((f) => f.id === id).test(p)) &&
      (!state.tier || TIER_INFO[state.tier].test(p)) &&
      q.every((t) => haystack(p).includes(t)));
    if (state.sort === "tkdn") list = [...list].sort((a, b) => b.scoreNum - a.scoreNum || a.model.localeCompare(b.model));
    if (state.sort === "new") list = [...list].sort((a, b) => (b.is2026Cert - a.is2026Cert) || (b.scoreNum - a.scoreNum));
    if (state.sort === "name") list = [...list].sort((a, b) => a.model.localeCompare(b.model, "en", { numeric: true }));
    return list;
  }

  /* ---------- Cards ---------- */
  function pills(p) {
    const out = [];
    if (p.status === "TKDN") {
      out.push(`<span class="pill red">TKDN+BMP ${esc(p.totalVal)}</span>`);
    } else {
      out.push(`<span class="pill purple">PDN</span>`);
    }
    out.push(`<span class="pill blue">${esc(p.fmtSummary)}</span>`);
    if (p.wifi) out.push('<span class="pill green">Wi-Fi</span>');
    if (p.ethernet) out.push('<span class="pill">LAN</span>');
    if (p.duplex) out.push('<span class="pill orange">Duplex</span>');
    return out.join("");
  }

  const imgTag = (p, cls = "") => p.image
    ? `<img src="${p.image}" alt="${esc(p.name)}" loading="lazy" class="${cls}" />`
    : `<div class="${cls}" style="display:grid;place-items:center;color:#aaa">${svg(p.category)}</div>`;

  function renderGrid() {
    const list = filtered();
    const cat = CATS.find((c) => c.id === state.cat);
    $("#paneTitle").textContent = cat.label;
    $("#paneCount").textContent = `${list.length} produk`;
    const isHome = state.cat === "all" && !state.features.size && !state.tier && !state.q;
    const tkdnCount = P.filter((p) => p.status === "TKDN").length;
    const pdnCount = P.filter((p) => p.status === "PDN").length;
    $("#hero").innerHTML = `<h2>${isHome ? "Katalog Produk Epson TKDN & PDN" : esc(cat.label)}</h2><p>${esc(cat.desc)}</p>` + (isHome ? `
      <div class="stats">
        <div class="stat"><b>${P.length}</b><span>Total Produk TKDN & PDN</span></div>
        <div class="stat"><b>${tkdnCount}</b><span>Produk Bersertifikat TKDN</span></div>
        <div class="stat"><b>${pdnCount}</b><span>Produk Dalam Negeri (PDN)</span></div>
        <div class="stat"><b>s.d. 75,28%</b><span>Nilai TKDN + BMP Tertinggi</span></div>
        <div class="stat"><b>8 Kategori</b><span>Printer · Scanner · Plotter · Proyektor</span></div>
      </div>` : "");
    const g = $("#grid");
    g.className = "grid" + (state.view === "list" ? " list" : "");
    g.innerHTML = list.map((p, i) => `
      <article class="card" style="animation-delay:${Math.min(i, 16) * 25}ms">
        <span class="badge-new ${p.status === "TKDN" ? "tkdn" : ""}">${p.status === "TKDN" ? `TKDN ${esc(p.totalVal)}` : "PDN"}</span>
        <button class="cmp-toggle ${state.compare.includes(p.model) ? "on" : ""}" data-cmp="${esc(p.model)}" title="Tambah ke perbandingan" aria-label="Bandingkan ${esc(p.model)}">
          ${svg(state.compare.includes(p.model) ? "check" : "plus")}</button>
        <button class="card-img" data-open="${esc(p.model)}" aria-label="Detail ${esc(p.name)}">${imgTag(p)}</button>
        <div class="card-body">
          <div class="card-head"><div><div class="series">${esc(CAT_SHORT[p.category] || p.category)} · SKU ${esc(p.sku)}</div><h3>${esc(p.model)}</h3></div></div>
          <p>${esc(p.tagline)}</p>
          <div class="pills">${pills(p)}</div>
          <div class="card-actions">
            <button class="btn small" data-open="${esc(p.model)}">Lihat detail</button>
            ${p.status === "TKDN" ? `<button class="btn small" style="flex:none" data-copy="${esc(p.certNo)}" title="Salin Nomor Sertifikat: ${esc(p.certNo)}">Salin Sertifikat</button>` : ""}
          </div>
        </div>
      </article>`).join("");
    $("#empty").hidden = list.length > 0;
  }

  $$(".segmented button").forEach((b) => b.onclick = () => { state.view = b.dataset.view; localStorage.setItem("view", state.view); update(); });
  $("#sortSelect").onchange = (e) => { state.sort = e.target.value; update(); };
  $("#searchInput").oninput = (e) => { state.q = e.target.value; renderGrid(); };
  $("#resetBtn").onclick = () => { Object.assign(state, { cat: "all", tier: null, q: "" }); state.features.clear(); $("#searchInput").value = ""; update(); };

  function update() {
    renderSidebar(); renderGrid(); renderDock();
    $$(".segmented button").forEach((b) => b.classList.toggle("active", b.dataset.view === state.view));
  }

  /* ---------- Compare dock ---------- */
  function renderDock() {
    localStorage.setItem("compare_tkdn", JSON.stringify(state.compare));
    $("#dock").hidden = !state.compare.length;
    $("#dockItems").innerHTML = state.compare.map((m) => {
      const p = P.find((x) => x.model === m);
      return `<button class="dock-item" data-cmp="${esc(m)}" title="Hapus ${esc(m)}">${imgTag(p)}<span>${esc(m)} · klik untuk hapus</span></button>`;
    }).join("");
    $("#compareBtn").textContent = `Bandingkan (${state.compare.length})`;
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-cmp]"); if (!t) return;
    e.stopPropagation();
    const m = t.dataset.cmp, i = state.compare.indexOf(m);
    if (i >= 0) state.compare.splice(i, 1);
    else if (state.compare.length >= 4) return toast("Maksimal 4 produk untuk dibandingkan");
    else { state.compare.push(m); toast(`${m} ditambahkan ke perbandingan`); }
    renderGrid(); renderDock();
    if (!$("#overlay").hidden) {
      const kind = $("#modal").dataset.kind;
      if (kind === "compare") state.compare.length ? openCompare() : closeModal();
      if (kind === "detail") { const st = $("#modalBody").scrollTop; openDetail($("#modal").dataset.model); $("#modalBody").scrollTop = st; }
    }
  }, true);
  $("#compareBtn").onclick = () => state.compare.length < 2 ? toast("Pilih minimal 2 produk") : (location.hash = "#/compare/" + encodeURIComponent(state.compare.join(",")));
  $("#clearCompare").onclick = () => { state.compare = []; renderGrid(); renderDock(); };

  /* ---------- Modal ---------- */
  function openModal(title, html, kind) {
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = html;
    $("#modalBody").scrollTop = 0;
    $("#modal").dataset.kind = kind;
    $("#overlay").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if ($("#overlay").hidden) return;
    $("#overlay").hidden = true; document.body.style.overflow = "";
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  }
  $("#overlay").addEventListener("click", (e) => { if (e.target.id === "overlay" || e.target.closest("[data-close]")) closeModal(); });

  function openDetail(model) {
    const p = P.find((x) => x.model === model); if (!p) return;
    const ks = [
      ["Status Pengadaan", p.status === "TKDN" ? `TKDN (${p.totalVal})` : "PDN (Produk Dalam Negeri)"],
      ["Nilai TKDN / BMP", p.status === "TKDN" ? `${p.tkdnVal} + ${p.bmpVal}` : "—"],
      ["Nomor Sertifikat", p.certNo],
      ["Kode Produk / SKU", p.sku],
      ["Fungsi Utama", p.fnSummary],
      ["Format / Ukuran", p.fmtSummary],
      ["Kecepatan / Performa", p.speedSummary],
      ["Konektivitas", p.connSummary],
    ];
    const groups = Object.entries(p.specs);
    const groupHtml = groups.map(([c, kv], i) => `<details class="spec-group" ${i < 2 ? "open" : ""}><summary>${esc(c)}</summary>
      <table class="spec-table">${Object.entries(kv).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table></details>`).join("");
    const html = `<div class="detail">
      <div class="detail-media">${imgTag(p)}</div>
      <div class="detail-info">
        <div class="series">${esc(catLabel(p.category))} · ${p.status === "TKDN" ? `TKDN+BMP ${esc(p.totalVal)}` : "PDN"}</div>
        <h2>${esc(p.name)}</h2>
        <p class="tagline">${esc(p.tagline)}</p>
        <div class="pills">${pills(p)}</div>
        <div class="keyspecs">${ks.map(([k, v]) => `<div class="keyspec"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("")}</div>
        ${p.status === "TKDN" ? `
        <div class="keyspec" style="display:flex;align-items:center;gap:12px">
          <div><small>Nomor Sertifikat TKDN Kemenperin RI</small><b>${esc(p.certNo)}</b></div>
          <button class="btn small" style="flex:none;margin-left:auto" data-copy="${esc(p.certNo)}">Salin No. Sertifikat</button>
        </div>` : ""}
        <div class="tabs"><button class="active">Spesifikasi Lengkap & Sertifikasi</button></div>
        ${groupHtml}
        <div class="detail-actions">
          <a class="btn primary" href="${esc(p.url)}" target="_blank" rel="noopener">${svg("ext")} Lihat di epson.co.id</a>
          <button class="btn" data-cmp="${esc(p.model)}">${svg(state.compare.includes(p.model) ? "check" : "plus")} ${state.compare.includes(p.model) ? "Di perbandingan" : "Bandingkan"}</button>
          <button class="btn" id="shareBtn">${svg("share")} Bagikan</button>
        </div>
        <p class="muted" style="font-size:12px;margin-top:14px">Kode Produk TKDN: ${esc(p.sku)}${p.pdfPage ? ` · Katalog TKDN Epson FY25 Hal. ${p.pdfPage}` : " · Sertifikat TKDN Baru 2026"}</p>
      </div></div>`;
    openModal(p.name, html, "detail");
    $("#shareBtn").onclick = async () => {
      const url = location.href;
      try { if (navigator.share) await navigator.share({ title: p.name, url }); else { await navigator.clipboard.writeText(url); toast("Tautan disalin"); } } catch {}
    };
    $("#modal").dataset.model = model;
  }

  function openCompare(models = state.compare) {
    const list = models.map((m) => P.find((p) => p.model === m)).filter(Boolean);
    if (!list.length) return;
    const yn = (v) => v ? '<span class="yes">✓ Ya</span>' : '<span class="no">—</span>';
    const rows = [
      ["Kategori", (p) => CAT_SHORT[p.category] || p.category],
      ["Status", (p) => p.status],
      ["Nilai TKDN", (p) => p.tkdnVal],
      ["Nilai BMP", (p) => p.bmpVal],
      ["Total TKDN + BMP", (p) => `<span class="yes">${esc(p.totalVal)}</span>`, true],
      ["Nomor Sertifikat", (p) => p.certNo],
      ["Kode Produk / SKU", (p) => p.sku],
      ["Fungsi Utama", (p) => p.fnSummary],
      ["Format / Ukuran", (p) => p.fmtSummary],
      ["Kecepatan / Yield", (p) => p.speedSummary],
      ["Konektivitas", (p) => p.connSummary],
      ["Wi-Fi", (p) => yn(p.wifi), true],
      ["Ethernet / LAN", (p) => yn(p.ethernet), true],
      ["Duplex", (p) => yn(p.duplex), true],
    ];
    const html = `<div class="compare-wrap"><table class="compare">
      <thead><tr><th></th>${list.map((p) => `<th>${imgTag(p)}<h4>${esc(p.model)}</h4>
        <button class="btn ghost" style="font-size:12px;padding:2px 6px" data-cmp="${esc(p.model)}">Hapus</button></th>`).join("")}</tr></thead>
      <tbody>${rows.map(([label, fn, raw]) => {
        const vals = list.map(fn);
        const diff = new Set(vals).size > 1;
        return `<tr><th>${label}</th>${vals.map((v) => `<td class="${diff ? "diff" : ""}">${raw ? v : esc(v)}</td>`).join("")}</tr>`;
      }).join("")}
      <tr><th></th>${list.map((p) => `<td><button class="btn small" data-open="${esc(p.model)}">Detail</button></td>`).join("")}</tr>
      </tbody></table></div>
      <p class="muted" style="padding:0 16px 16px;font-size:12px">Sel berwarna menandakan perbedaan antar produk.</p>`;
    openModal(`Perbandingan · ${list.map((p) => p.model).join(" vs ")}`, html, "compare");
  }

  function openCertsTable() {
    const rows = P.map((p, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><span class="pill">${esc(CAT_SHORT[p.category])}</span></td>
        <td><code>${esc(p.sku)}</code></td>
        <td><a href="#/p/${encodeURIComponent(p.model)}" style="font-weight:600;color:var(--accent);text-decoration:none">${esc(p.model)}</a></td>
        <td style="text-align:right">${esc(p.tkdnVal)}</td>
        <td style="text-align:right">${esc(p.bmpVal)}</td>
        <td style="text-align:right;font-weight:700;color:var(--accent)">${esc(p.totalVal)}</td>
        <td>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <span style="font-size:12px">${esc(p.certNo)}</span>
            ${p.status === "TKDN" ? `<button class="btn ghost small" style="padding:2px 7px;font-size:11px" data-copy="${esc(p.certNo)}">Salin</button>` : ""}
          </div>
        </td>
      </tr>`).join("");
    const html = `<div class="compare-wrap">
      <div style="padding:14px 18px 4px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div>
          <strong>Daftar Lengkap Nomor Sertifikat TKDN & Produk PDN Epson Indonesia</strong>
          <div class="muted" style="font-size:12px">Valid efektif per 28 Agustus 2026 · Klik nama model untuk membuka spesifikasi lengkap atau klik "Salin" untuk menyalin nomor sertifikat.</div>
        </div>
      </div>
      <table class="compare" style="font-size:13px">
        <thead>
          <tr>
            <th style="width:42px">No</th>
            <th>Kategori</th>
            <th>Kode SKU</th>
            <th>Tipe / Model</th>
            <th style="text-align:right">Nilai TKDN</th>
            <th style="text-align:right">Nilai BMP</th>
            <th style="text-align:right">Total</th>
            <th>Nomor Sertifikat Kemenperin RI</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
    openModal("Tabel Rekap Nomor Sertifikat TKDN & PDN Epson", html, "certs");
  }

  function openAbout() {
    openModal("Tentang Katalog TKDN & PDN Epson", `<div class="about">
      <h2>Katalog Digital Produk TKDN & PDN Epson Indonesia</h2>
      <p>Portal referensi pengadaan yang merangkum seluruh <b>${P.length} produk Epson Indonesia</b> yang telah mengantongi sertifikat <b>TKDN (Tingkat Komponen Dalam Negeri)</b> dari Kementerian Perindustrian RI maupun berstatus <b>PDN (Produk Dalam Negeri)</b>.</p>
      <h4>Ketentuan Pengadaan Barang/Jasa Pemerintah (PP No. 29 Tahun 2018 & Perpres No. 12 Tahun 2021)</h4>
      <ul>
        <li>Apabila terdapat produk dengan penjumlahan <b>Nilai TKDN + Nilai BMP (Bobot Manfaat Perusahaan) ≥ 40%</b> dan Nilai TKDN ≥ 25%, maka instansi wajib membeli produk dalam negeri tersebut.</li>
        <li>Nilai BMP PT Indonesia Epson Industry adalah <b>13,65%</b> untuk perangkat keras (printer, scanner, plotter, proyektor).</li>
        <li>Katalog ini menggabungkan data dari <b>Katalog Produk Epson TKDN FY25</b> dan <b>Daftar Sertifikat TKDN Epson Terbaru (Efektif 28 Agustus 2026)</b>.</li>
      </ul>
      <h4>Pintasan Keyboard</h4>
      <ul><li><b>⌘K / Ctrl+K</b> atau <b>/</b> — Pencarian cepat (Spotlight)</li><li><b>Esc</b> — Tutup jendela</li></ul>
    </div>`, "about");
  }

  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]"); if (o) location.hash = "#/p/" + encodeURIComponent(o.dataset.open);
    const m = e.target.closest("[data-menu]"); if (!m) return;
    toggleDrawer(false);
    const k = m.dataset.menu;
    if (k === "all") { $("#resetBtn").click(); closeModal(); }
    if (k === "certs") openCertsTable();
    if (k === "compare") state.compare.length >= 2 ? (location.hash = "#/compare/" + encodeURIComponent(state.compare.join(","))) : toast("Tambahkan minimal 2 produk dengan tombol + pada kartu");
    if (k === "CrossLinkPrinter") window.open("https://aris-projectai.github.io/epson-ecotank-catalog/", "_blank", "noopener");
    if (k === "CrossLinkProj") window.open("https://aris-projectai.github.io/epson-projector-catalog/", "_blank", "noopener");
    if (k === "about") openAbout();
  });

  /* ---------- Router ---------- */
  function route() {
    const h = decodeURIComponent(location.hash);
    let m;
    if ((m = h.match(/^#\/p\/(.+)$/))) openDetail(m[1]);
    else if ((m = h.match(/^#\/compare\/(.+)$/))) {
      const models = m[1].split(",").filter((x) => P.some((p) => p.model === x));
      if (models.join() !== state.compare.join()) { state.compare = models; renderGrid(); renderDock(); }
      openCompare(models);
    } else if (!$("#overlay").hidden) { $("#overlay").hidden = true; document.body.style.overflow = ""; }
  }
  addEventListener("hashchange", route);

  /* ---------- Spotlight ---------- */
  let sel = 0, results = [];
  const spot = $("#spotlight"), spotIn = $("#spotInput");
  function openSpot() { spot.hidden = false; spotIn.value = ""; renderSpot(); setTimeout(() => spotIn.focus(), 10); }
  function closeSpot() { spot.hidden = true; }
  function renderSpot() {
    const q = spotIn.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    results = q.length ? P.filter((p) => q.every((t) => haystack(p).includes(t))).slice(0, 8) : [];
    sel = Math.min(sel, Math.max(0, results.length - 1));
    $("#spotResults").innerHTML = results.map((p, i) => `<li class="${i === sel ? "sel" : ""}" data-i="${i}">
      ${p.image ? `<img src="${p.image}" alt="" />` : ""}<div><b>${esc(p.name)} (${esc(p.totalVal)})</b><small>SKU ${esc(p.sku)} · ${esc(p.certNo)}</small></div></li>`).join("");
  }
  spotIn.oninput = () => { sel = 0; renderSpot(); };
  spotIn.onkeydown = (e) => {
    if (e.key === "ArrowDown") { sel = Math.min(sel + 1, results.length - 1); renderSpot(); e.preventDefault(); }
    if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); renderSpot(); e.preventDefault(); }
    if (e.key === "Enter" && results[sel]) { closeSpot(); location.hash = "#/p/" + encodeURIComponent(results[sel].model); }
  };
  $("#spotResults").onclick = (e) => { const li = e.target.closest("li"); if (li) { closeSpot(); location.hash = "#/p/" + encodeURIComponent(results[+li.dataset.i].model); } };
  spot.onclick = (e) => { if (e.target === spot) closeSpot(); };
  $("#spotlightBtn").onclick = openSpot;
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); spot.hidden ? openSpot() : closeSpot(); }
    else if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSpot(); }
    else if (e.key === "Escape") { if (!spot.hidden) closeSpot(); else closeModal(); }
  });

  /* ---------- Toast ---------- */
  let tt;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 1800); }

  update();
  route();
})();
