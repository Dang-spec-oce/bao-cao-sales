/* ============================================================
   VN5 REPORT — app.js
   Toàn bộ logic: IndexedDB, state, render 3 tab, export.
   Không dùng framework, không server, không Google Sheet.
   ============================================================ */

/* ---------------- IndexedDB helper ---------------- */
const DB_NAME = "vn5report_db";
const DB_VERSION = 1;
let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const _db = e.target.result;
      if (!_db.objectStoreNames.contains("SETTING")) {
        _db.createObjectStore("SETTING", { keyPath: "key" });
      }
      if (!_db.objectStoreNames.contains("REPORT")) {
        const store = _db.createObjectStore("REPORT", { keyPath: "id" });
        store.createIndex("byMsnv", "msnv", { unique: false });
        store.createIndex("byDate", "date", { unique: false });
      }
    };
    req.onsuccess = (e) => { db = e.target.result; resolve(db); };
    req.onerror = (e) => reject(e);
  });
}

function idbGet(store, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = (e) => reject(e);
  });
}

function idbPut(store, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const req = tx.objectStore(store).put(value);
    req.onsuccess = () => resolve(value);
    req.onerror = (e) => reject(e);
  });
}

function idbDelete(store, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const req = tx.objectStore(store).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

function idbAllByIndex(store, indexName, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const idx = tx.objectStore(store).index(indexName);
    const req = idx.getAll(value);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (e) => reject(e);
  });
}

function idbAll(store) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (e) => reject(e);
  });
}

/* ---------------- Utils ---------------- */
function todayStr() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function dateToKey(dstr) {
  // dd/mm/yyyy -> yyyymmdd for sorting
  const [d, m, y] = dstr.split("/");
  return `${y}${m}${d}`;
}
function reportId(msnv, dateStr) {
  return `${msnv}_${dateToKey(dateStr)}`;
}
function normalize(str) {
  return (str || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}
function classifyModel(name) {
  const n = normalize(name);
  if (n.startsWith("v70 fe")) return "V70 FE";
  if (n.startsWith("v70")) return "V70";
  if (n.startsWith("y31d")) return "Y31d";
  if (n.startsWith("y05")) return "Y05";
  if (n.startsWith("y11d")) return "Y11d";
  if (n.startsWith("v60")) return "V60";
  return "Khac";
}
const GROUP_LABELS = {
  "V70": "V70", "V70 FE": "V70 FE", "Y31d": "Y31d",
  "Y05": "Y05", "Y11d": "Y11d", "V60": "V60 Series", "Khac": "Model khác"
};

function emptyModels() {
  const m = {};
  MODELS.forEach((name) => { m[name] = { today: 0, month: 0 }; });
  return m;
}
function emptyCompetitors() {
  const c = {};
  COMPETITORS.forEach((name) => { c[name] = { today: 0, month: 0 }; });
  return c;
}

function blankReport(msnv, dateStr) {
  return {
    id: reportId(msnv, dateStr),
    msnv,
    date: dateStr,
    shift: "Hành Chánh",
    weekTarget: 0,
    dayTarget: 0,
    models: emptyModels(),
    competitors: emptyCompetitors(),
    stock: {},
    status: "Draft",
    created: Date.now(),
    updated: Date.now(),
  };
}

function cloneForNewDay(prev, dateStr) {
  const r = JSON.parse(JSON.stringify(prev));
  r.id = reportId(prev.msnv, dateStr);
  r.date = dateStr;
  // reset "today" counters, keep month cumulative as baseline
  Object.keys(r.models).forEach((k) => { r.models[k].today = 0; });
  Object.keys(r.competitors).forEach((k) => { r.competitors[k].today = 0; });
  r.status = "Draft";
  r.created = Date.now();
  r.updated = Date.now();
  return r;
}

/* ---------------- App State ---------------- */
const state = {
  msnv: null,
  employee: null,
  target: null,
  report: null,
  recentModels: [],
  activeTab: "today",
  searchQuery: "",
  stockOpen: false,
};

async function boot() {
  await openDB();
  const setting = await idbGet("SETTING", "currentMsnv");
  if (setting && setting.value) {
    await selectEmployee(setting.value, false);
  }
  render();
}

async function selectEmployee(msnv, fromPicker = true) {
  const emp = EMPLOYEES.find((e) => e.msnv === msnv);
  if (!emp) return;
  state.msnv = msnv;
  state.employee = emp;
  state.target = TARGETS.find((t) => t.msnv === msnv) || null;
  await idbPut("SETTING", { key: "currentMsnv", value: msnv });
  const recent = await idbGet("SETTING", `recent_${msnv}`);
  state.recentModels = recent ? recent.value : [];

  // load latest report
  const all = await idbAllByIndex("REPORT", "byMsnv", msnv);
  all.sort((a, b) => (a.date < b.date ? 1 : -1));
  const latest = all[0] || null;
  const today = todayStr();

  if (latest && latest.date === today) {
    state.report = latest;
  } else if (latest) {
    // will prompt continue/new on Tab1; for now load a draft-preview holder
    state.report = null;
    state.pendingPrev = latest;
  } else {
    state.report = blankReport(msnv, today);
    await idbPut("REPORT", state.report);
    state.pendingPrev = null;
  }
  if (fromPicker) render();
}

async function startContinue() {
  const today = todayStr();
  const r = cloneForNewDay(state.pendingPrev, today);
  await idbPut("REPORT", r);
  state.report = r;
  state.pendingPrev = null;
  await pruneHistory();
  render();
}

async function startFresh() {
  const today = todayStr();
  const r = blankReport(state.msnv, today);
  await idbPut("REPORT", r);
  state.report = r;
  state.pendingPrev = null;
  await pruneHistory();
  render();
}

async function pruneHistory() {
  const all = await idbAllByIndex("REPORT", "byMsnv", state.msnv);
  all.sort((a, b) => (a.date < b.date ? 1 : -1));
  const toDelete = all.slice(10);
  for (const r of toDelete) await idbDelete("REPORT", r.id);
}

async function saveReport() {
  if (!state.report) return;
  state.report.updated = Date.now();
  await idbPut("REPORT", state.report);
}

async function setModelToday(name, rawValue) {
  if (!state.report) return;
  const m = state.report.models[name] || (state.report.models[name] = { today: 0, month: 0 });
  const n = Math.max(0, Math.floor(Number(rawValue)) || 0);
  const delta = n - m.today;
  m.today = n;
  m.month = Math.max(0, m.month + delta);
  await saveReport();
  // update recent
  state.recentModels = [name, ...state.recentModels.filter((x) => x !== name)].slice(0, 6);
  await idbPut("SETTING", { key: `recent_${state.msnv}`, value: state.recentModels });
  renderUpdateTab();
}

async function setCompetitorToday(name, rawValue) {
  if (!state.report) return;
  const c = state.report.competitors[name];
  const n = Math.max(0, Math.floor(Number(rawValue)) || 0);
  const delta = n - c.today;
  c.today = n;
  c.month = Math.max(0, c.month + delta);
  await saveReport();
  renderUpdateTab();
}

async function setStock(name, value) {
  if (!state.report) return;
  if (!state.report.stock) state.report.stock = {};
  const n = value === "" ? "" : Math.max(0, Number(value) || 0);
  if (n === "") delete state.report.stock[name];
  else state.report.stock[name] = n;
  await saveReport();
  renderUpdateTab();
}

async function setWeekDayTarget(field, value) {
  if (!state.report) return;
  state.report[field] = Number(value) || 0;
  await saveReport();
}

/* ---------------- Computation ---------------- */
function sumAll(report) {
  let today = 0, month = 0;
  Object.values(report.models).forEach((m) => { today += m.today; month += m.month; });
  return { today, month };
}
function sumGroup(report, group) {
  let today = 0, month = 0;
  Object.entries(report.models).forEach(([name, v]) => {
    if (classifyModel(name) === group) { today += v.today; month += v.month; }
  });
  return { today, month };
}
function pct(a, b) {
  if (!b) return 0;
  return Math.round((a / b) * 1000) / 10;
}

/* ---------------- Export text ---------------- */
function buildExportText() {
  const r = state.report;
  const emp = state.employee;
  const tg = state.target;
  const monthTarget = tg ? tg.monthTarget : 0;
  const all = sumAll(r);
  const groups = ["V70", "V70 FE", "Y31d", "Y05", "Y11d", "V60", "Khac"];

  let lines = [];
  lines.push(`Ngày : ${r.date}`);
  lines.push(`Khu vực : ${emp.area}`);
  lines.push(`Sales phụ trách: ${emp.sales}`);
  lines.push(`Họ và tên: ${emp.name}`);
  lines.push(`MSNV : ${emp.msnv}`);
  lines.push(`Code shop : ${emp.shopCode}`);
  lines.push(`Tên Shop : ${emp.shopName}`);
  lines.push(`Ca làm việc: ${r.shift}`);
  lines.push(`Phân loại shop : ${emp.shopType}`);
  lines.push(``);
  lines.push(`🎯Target tổng model: ${all.today}/${all.month}/${monthTarget}/${pct(all.month, monthTarget)}%`);
  lines.push(`🎯Target Tuần: ${all.today}/${all.month}/${r.weekTarget}/${pct(all.month, r.weekTarget)}%`);
  lines.push(`🎯Target ngày : ${all.today}/${r.dayTarget}/${pct(all.today, r.dayTarget)}%`);
  lines.push(``);
  lines.push(`🎯 Target theo nhóm model KEY:`);
  groups.forEach((g) => {
    const s = sumGroup(r, g);
    const t = tg ? (tg[g] || 0) : 0;
    lines.push(`- ${GROUP_LABELS[g]} : ${s.today}/${s.month}/${t}/${pct(s.month, t)}%`);
  });
  lines.push(``);
  lines.push(`📦 Danh sách model (Hôm nay/Lũy kế tháng):`);
  MODELS.forEach((name) => {
    const m = r.models[name];
    if (m.today > 0 || m.month > 0) {
      lines.push(`- ${name}: ${m.today}/${m.month}`);
    }
  });
  const stockEntries = Object.entries(r.stock || {}).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (stockEntries.length) {
    lines.push(``);
    lines.push(`🏬 Tồn kho:`);
    stockEntries.forEach(([name, qty]) => lines.push(`- ${name}: ${qty}`));
  }
  lines.push(``);
  lines.push(`🔁 Đối thủ cạnh tranh (Hôm nay/Lũy kế tháng):`);
  COMPETITORS.forEach((name) => {
    const c = r.competitors[name];
    lines.push(`${name} : ${c.today}/${c.month}`);
  });
  return lines.join("\n");
}

/* ---------------- Backup / Restore ---------------- */
async function exportBackup() {
  const reports = state.msnv ? await idbAllByIndex("REPORT", "byMsnv", state.msnv) : [];
  const data = { msnv: state.msnv, exportedAt: Date.now(), reports };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `VN5_${state.msnv || "backup"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importBackup(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!data.reports) throw new Error("File không hợp lệ");
  for (const r of data.reports) await idbPut("REPORT", r);
  if (data.msnv) await selectEmployee(data.msnv, false);
  render();
}

/* ---------------- Render root ---------------- */
function render() {
  const root = document.getElementById("app");
  if (!state.msnv) {
    root.innerHTML = renderEmployeePicker();
    bindEmployeePicker();
    return;
  }
  root.innerHTML = `
    <div class="topbar">
      <img src="logo.png" class="logo" alt="vivo" />
      <div class="topbar-title">Báo cáo ngày PG Huế</div>
    </div>
    <div id="tabContent" class="tab-content"></div>
    <div class="bottomnav">
      <button class="navbtn" data-tab="today">🏠<span>Hôm nay</span></button>
      <button class="navbtn" data-tab="update">✏️<span>Cập nhật</span></button>
      <button class="navbtn" data-tab="export">📤<span>Xuất báo cáo</span></button>
    </div>
  `;
  document.querySelectorAll(".navbtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeTab = btn.dataset.tab;
      renderTab();
    });
  });
  renderTab();
}

function renderTab() {
  document.querySelectorAll(".navbtn").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === state.activeTab);
  });
  if (state.activeTab === "today") renderTodayTab();
  else if (state.activeTab === "update") renderUpdateTab();
  else renderExportTab();
}

/* ---------------- Employee picker ---------------- */
function renderEmployeePicker() {
  return `
    <div class="picker-screen">
      <img src="logo.png" class="logo-big" alt="vivo" />
      <h2>Chọn mã nhân viên (MSNV)</h2>
      <input id="empSearch" class="input" placeholder="Tìm theo tên hoặc MSNV..." />
      <div id="empList" class="emp-list"></div>
    </div>
  `;
}
function bindEmployeePicker() {
  const listEl = document.getElementById("empList");
  const searchEl = document.getElementById("empSearch");
  function draw(q) {
    const nq = normalize(q);
    const items = EMPLOYEES.filter((e) => !nq || normalize(e.name).includes(nq) || normalize(e.msnv).includes(nq));
    listEl.innerHTML = items.map((e) => `
      <button class="emp-item" data-msnv="${e.msnv}">
        <div class="emp-name">${e.name}</div>
        <div class="emp-sub">${e.msnv} · ${e.shopName}</div>
      </button>
    `).join("");
    listEl.querySelectorAll(".emp-item").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await selectEmployee(btn.dataset.msnv);
      });
    });
  }
  draw("");
  searchEl.addEventListener("input", (e) => draw(e.target.value));
}

/* ---------------- Tab 1: Hôm nay ---------------- */
function renderTodayTab() {
  const el = document.getElementById("tabContent");
  const emp = state.employee;
  const tg = state.target;

  if (!state.report && state.pendingPrev) {
    el.innerHTML = `
      <div class="card">
        <div class="card-title">Báo cáo gần nhất: ${state.pendingPrev.date}</div>
        <p class="muted">Bạn chưa tạo báo cáo cho hôm nay (${todayStr()}). Chọn một trong hai:</p>
        <button id="btnContinue" class="btn btn-primary">Tiếp tục báo cáo hôm qua</button>
        <button id="btnFresh" class="btn btn-ghost">Báo cáo mới</button>
      </div>
    `;
    document.getElementById("btnContinue").addEventListener("click", startContinue);
    document.getElementById("btnFresh").addEventListener("click", startFresh);
    return;
  }

  const r = state.report;
  const all = sumAll(r);
  const monthTarget = tg ? tg.monthTarget : 0;

  el.innerHTML = `
    <div class="card employee-card">
      <div class="emp-row"><span class="label">Ngày</span><span>${r.date}</span></div>
      <div class="emp-row"><span class="label">Họ tên</span><span>${emp.name}</span></div>
      <div class="emp-row"><span class="label">MSNV</span><span>${emp.msnv}</span></div>
      <div class="emp-row"><span class="label">Shop</span><span>${emp.shopName}</span></div>
      <div class="emp-row"><span class="label">Sales</span><span>${emp.sales}</span></div>
      <div class="emp-row">
        <span class="label">Ca làm việc</span>
        <select id="shiftSelect" class="select-inline">
          ${SHIFTS.map((s) => `<option value="${s}" ${r.shift === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
    </div>

    <div class="card">
      <div class="card-title">KPI tháng</div>
      <div class="kpi-big">${all.month} / ${monthTarget} <span class="kpi-pct">${pct(all.month, monthTarget)}%</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, pct(all.month, monthTarget))}%"></div></div>
      <div class="muted small">Hôm nay đã bán: ${all.today} máy</div>
    </div>

    <div class="card">
      <div class="card-title">Target tuần / ngày (tự nhập)</div>
      <div class="two-col">
        <label>Tuần <input type="number" min="0" id="weekTargetInput" class="input" value="${r.weekTarget}" /></label>
        <label>Ngày <input type="number" min="0" id="dayTargetInput" class="input" value="${r.dayTarget}" /></label>
      </div>
    </div>

    <button id="btnChangeEmp" class="btn btn-ghost">Đổi nhân viên</button>
  `;

  document.getElementById("shiftSelect").addEventListener("change", async (e) => {
    r.shift = e.target.value;
    await saveReport();
  });
  document.getElementById("weekTargetInput").addEventListener("change", (e) => setWeekDayTarget("weekTarget", e.target.value));
  document.getElementById("dayTargetInput").addEventListener("change", (e) => setWeekDayTarget("dayTarget", e.target.value));
  document.getElementById("btnChangeEmp").addEventListener("click", async () => {
    state.msnv = null;
    state.employee = null;
    state.report = null;
    await idbDelete("SETTING", "currentMsnv");
    render();
  });
}

/* ---------------- Tab 2: Cập nhật ---------------- */
function renderUpdateTab() {
  const el = document.getElementById("tabContent");
  if (!state.report) { el.innerHTML = `<div class="card"><p>Vui lòng hoàn tất bước ở tab Hôm nay trước.</p></div>`; return; }
  const r = state.report;
  const q = normalize(state.searchQuery);
  const filtered = q ? MODELS.filter((m) => normalize(m).includes(q)) : MODELS;

  const recentHtml = state.recentModels.length ? `
    <div class="section-label">Model gần đây</div>
    <div class="flat-list">${state.recentModels.map((m) => modelRow(m, r)).join("")}</div>
  ` : "";

  const stockCount = Object.values(r.stock || {}).filter((v) => v !== undefined && v !== null && v !== "").length;

  el.innerHTML = `
    <div class="card">
      <input id="modelSearch" class="input" placeholder="Tìm model... (vd: 70, 31, 05)" value="${state.searchQuery}" />
    </div>
    ${recentHtml}
    <div class="section-label">Tất cả model</div>
    <div class="flat-list">${filtered.map((m) => modelRow(m, r)).join("")}</div>

    <div class="section-label">Tồn kho</div>
    <details class="stock-details" id="stockDetails">
      <summary>Xem / chỉnh tồn kho ${stockCount ? `<span class="stock-count">${stockCount} model đã nhập</span>` : ""}</summary>
      <div class="stock-list">${MODELS.map((m) => stockRow(m, r)).join("")}</div>
    </details>

    <div class="section-label">Đối thủ cạnh tranh</div>
    <div class="flat-list">${COMPETITORS.map((c) => competitorRow(c, r)).join("")}</div>
  `;

  const searchEl = document.getElementById("modelSearch");
  searchEl.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderUpdateTab();
  });
  // preserve focus & caret after re-render
  const activeEl = document.activeElement;
  if (activeEl && activeEl.id === "modelSearch") {
    searchEl.focus();
    searchEl.selectionStart = searchEl.selectionEnd = searchEl.value.length;
  }

  el.querySelectorAll("[data-model]").forEach((input) => {
    input.addEventListener("change", (e) => setModelToday(input.dataset.model, e.target.value));
  });
  el.querySelectorAll("[data-comp]").forEach((input) => {
    input.addEventListener("change", (e) => setCompetitorToday(input.dataset.comp, e.target.value));
  });

  const stockDetails = document.getElementById("stockDetails");
  if (stockDetails && state.stockOpen) stockDetails.open = true;
  if (stockDetails) {
    stockDetails.addEventListener("toggle", () => { state.stockOpen = stockDetails.open; });
  }
  el.querySelectorAll("[data-stock]").forEach((input) => {
    input.addEventListener("change", (e) => setStock(input.dataset.stock, e.target.value));
  });
}

function modelRow(name, r) {
  const m = r.models[name] || { today: 0, month: 0 };
  return `
    <div class="flat-row">
      <div class="flat-row-name">
        <div class="flat-name">${name}</div>
        <div class="flat-month">Tháng: ${m.month}</div>
      </div>
      <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" class="flat-input" data-model="${name}" value="${m.today}" placeholder="0" />
    </div>
  `;
}
function stockRow(name, r) {
  const val = r.stock && r.stock[name] !== undefined ? r.stock[name] : "";
  return `
    <div class="stock-row">
      <div class="stock-name">${name}</div>
      <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" class="stock-input" data-stock="${name}" value="${val}" placeholder="0" />
    </div>
  `;
}
function competitorRow(name, r) {
  const c = r.competitors[name];
  return `
    <div class="flat-row">
      <div class="flat-row-name">
        <div class="flat-name">${name}</div>
        <div class="flat-month">Tháng: ${c.month}</div>
      </div>
      <input type="number" min="0" step="1" inputmode="numeric" pattern="[0-9]*" class="flat-input" data-comp="${name}" value="${c.today}" placeholder="0" />
    </div>
  `;
}

/* ---------------- Tab 3: Xuất báo cáo ---------------- */
function renderExportTab() {
  const el = document.getElementById("tabContent");
  if (!state.report) { el.innerHTML = `<div class="card"><p>Chưa có báo cáo.</p></div>`; return; }
  const text = buildExportText();
  el.innerHTML = `
    <div class="card">
      <div class="card-title">Xem trước báo cáo</div>
      <pre id="exportPreview" class="export-pre">${text}</pre>
    </div>
    <button id="btnCopy" class="btn btn-primary">📋 Copy báo cáo</button>
    <button id="btnHistory" class="btn btn-ghost">🕘 Lịch sử</button>
    <button id="btnBackup" class="btn btn-ghost">⬇️ Backup (xuất dữ liệu)</button>
    <label class="btn btn-ghost file-label">⬆️ Restore (nhập dữ liệu)
      <input type="file" id="restoreFile" accept="application/json" style="display:none" />
    </label>
    <div id="historyPanel"></div>
  `;
  document.getElementById("btnCopy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Đã copy báo cáo!");
    } catch (e) {
      toast("Không thể copy tự động, vui lòng copy thủ công.");
    }
  });
  document.getElementById("btnBackup").addEventListener("click", exportBackup);
  document.getElementById("restoreFile").addEventListener("change", async (e) => {
    if (e.target.files[0]) {
      await importBackup(e.target.files[0]);
      toast("Đã khôi phục dữ liệu!");
    }
  });
  document.getElementById("btnHistory").addEventListener("click", async () => {
    const panel = document.getElementById("historyPanel");
    const all = await idbAllByIndex("REPORT", "byMsnv", state.msnv);
    all.sort((a, b) => (a.date < b.date ? 1 : -1));
    panel.innerHTML = `
      <div class="card">
        <div class="card-title">10 báo cáo gần nhất</div>
        ${all.slice(0, 10).map((r) => `
          <button class="history-item" data-id="${r.id}">
            <span>${r.date}</span><span class="muted">${r.status}</span>
          </button>
        `).join("")}
      </div>
    `;
    panel.querySelectorAll(".history-item").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const rec = await idbGet("REPORT", btn.dataset.id);
        state.report = rec;
        renderExportTab();
      });
    });
  });
}

/* ---------------- Toast ---------------- */
let toastTimer = null;
function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------------- Init ---------------- */
window.addEventListener("DOMContentLoaded", boot);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
