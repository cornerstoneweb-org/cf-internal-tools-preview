// Facilities Requests, mounted inside the Staff Hub at #/facilities.
//
//   #/facilities              default page for whoever is viewing
//   #/facilities/mine         my requests
//   #/facilities/queue        facilities team queue and dashboard
//   #/facilities/approvals    Ryan's approvals
//   #/facilities/new          new request form
//   #/facilities/r/1048       one request
//
// MOCKUP: demo data in this browser only. The visibility rules below (staff
// see their own, team notes hidden from requesters, approvals only for Ryan)
// are the same rules the Supabase RLS policies will enforce for real. Here
// they only decide what to draw.

import { CONFIG } from "./config.js";
import { CAMPUSES } from "../../config/site.config.js";
import { demoRequests } from "./demo-data.js";

const L = CONFIG.labels;
const STORE = "cf-facilities-demo-v1";
const VIEWER = "cf-facilities-viewer";
const BASE = "#/facilities";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC = {
  wrench: svg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3.5 17.5a2.1 2.1 0 0 0 3 3l5.8-5.8a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>'),
  key:    svg('<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>'),
  plus:   svg('<path d="M12 5v14M5 12h14"/>'),
  back:   svg('<path d="m15 6-6 6 6 6"/>'),
  camera: svg('<rect x="3" y="7" width="18" height="13" rx="2.5"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8.5 7 10 4.5h4L15.5 7"/>'),
  x:      svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  alert:  svg('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>'),
  lock:   svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
};

/* ================= state ================= */
const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } };

function loadRequests() {
  try {
    const saved = JSON.parse(read(STORE) ?? "null");
    if (Array.isArray(saved)) return saved;
  } catch { /* fall through to a fresh seed */ }
  return demoRequests();
}

const state = {
  requests: loadRequests(),
  viewer: CONFIG.viewers.some((v) => v.id === read(VIEWER)) ? read(VIEWER) : "staff",
  filters: { status: "open", who: "all", campus: "all", q: "" },
  draftPhotos: [],
};
if (state.viewer === "eric") state.filters.who = "eric";

let mountEl = null;
let ctx = { userName: "", toast: () => {} };

function save() {
  if (!write(STORE, JSON.stringify(state.requests))) {
    ctx.toast("Demo storage is full. Use Reset demo.");
  }
}

/* ================= helpers ================= */
const campuses = () => CAMPUSES.filter((c) => !CONFIG.campusExclude.includes(c.id));
// Home campus pre-selects on the form. Real version: the signed-in person's
// campus_code from staff_directory. Mockup: CONFIG.demoHomeCampus.
const homeCampus = () => ctxHomeCampus ?? (CONFIG.demo ? CONFIG.demoHomeCampus : null);
let ctxHomeCampus = null;
const campusName = (id) => CAMPUSES.find((c) => c.id === id)?.name ?? id;
const statusOf = (id) => CONFIG.statuses.find((s) => s.id === id) ?? CONFIG.statuses[0];
const priOf = (id) => CONFIG.priorities.find((p) => p.id === id) ?? CONFIG.priorities[1];
const typeOf = (id) => CONFIG.types.find((t) => t.id === id) ?? CONFIG.types[0];
const PRI_RANK = { emergency: 0, week: 1, whenever: 2 };
const isOpen = (r) => r.status !== "done";
const isTeam = (v = state.viewer) => v === "joe" || v === "eric";
const isRyan = (v = state.viewer) => v === "ryan";
const seesAll = (v = state.viewer) => v !== "staff";

// Who is doing things right now. The signed-in person is "me" when they act
// as a staff member; otherwise they are standing in for Joe, Eric or Ryan.
const actor = () => (state.viewer === "staff" ? "me" : state.viewer);

function nameOf(id, req) {
  if (id === "me") return ctx.userName || "You";
  if (id === "system") return L.teamsTag;
  const t = CONFIG.team.find((x) => x.id === id);
  if (t) return t.name;
  if (id === CONFIG.approver.id) return CONFIG.approver.name;
  if (req?.requester?.id === id) return req.requester.name;
  return id;
}
const assigneeName = (r) => r.assignee
  ? (r.assignee === "vendor" && r.vendor ? `${nameOf("vendor")} · ${r.vendor}` : nameOf(r.assignee))
  : L.unassigned;

function ago(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}
const ageDays = (r) => (Date.now() - new Date(r.createdAt).getTime()) / 86400000;
const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const DAY_ONLY = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

function visible(r) {
  return seesAll() || r.requester.id === "me";
}
const approvalsOn = () => CONFIG.features?.approvals === true;
const pendingApprovals = () => !approvalsOn() ? [] : state.requests.filter((r) => r.approval?.state === "pending");

function statusPill(r) {
  const s = statusOf(r.status);
  return `<span class="fx-pill fx-st-${s.tone}">${esc(s.label)}</span>`;
}
function priPill(r) {
  const p = priOf(r.priority);
  return `<span class="fx-pill fx-pri-pill fx-pri-${p.id}">${esc(p.label)}</span>`;
}
function approvalTag(r) {
  if (!approvalsOn() || !r.approval) return "";
  if (r.approval.state === "pending") return `<span class="fx-pill fx-ap-pending">Needs approval</span>`;
  if (r.approval.state === "approved") return `<span class="fx-pill fx-ap-ok">Approved</span>`;
  return `<span class="fx-pill fx-ap-no">Declined</span>`;
}

function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

/* ================= shell ================= */
function demoBar() {
  if (!CONFIG.demo) return "";
  const btns = CONFIG.viewers.map((v) =>
    `<button type="button" class="fx-viewer${v.id === state.viewer ? " is-on" : ""}" data-viewer="${esc(v.id)}"
      aria-pressed="${v.id === state.viewer}" title="${esc(v.note)}">${esc(v.label)}</button>`).join("");
  return `<div class="fx-demo" role="region" aria-label="Demo controls">
      <div class="fx-demo-top">
        <span class="fx-demo-tag">${esc(L.demoTag)}</span>
        <span class="fx-demo-note">${esc(L.demoNote)}</span>
        <button type="button" class="linkish fx-reset" data-act="reset">${esc(L.demoReset)}</button>
      </div>
      <div class="fx-viewers" role="group" aria-label="${esc(L.demoViewing)}">
        <span class="fx-viewers-k">${esc(L.demoViewing)}</span>${btns}
      </div>
    </div>`;
}

function tabsHTML(page) {
  const mine = state.requests.filter((r) => r.requester.id === "me" && isOpen(r)).length;
  const open = state.requests.filter(isOpen).length;
  const tabs = [];
  if (seesAll()) tabs.push({ id: "queue", label: L.tabQueue, n: open });
  if (isRyan() && approvalsOn()) tabs.push({ id: "approvals", label: L.tabApprovals, n: pendingApprovals().length, hot: true });
  tabs.push({ id: "mine", label: L.tabMine, n: mine });
  return `<nav class="fx-tabs" aria-label="Facilities pages">${tabs.map((t) =>
    `<a href="${BASE}/${t.id}" class="${page === t.id ? "is-on" : ""}"${page === t.id ? ' aria-current="page"' : ""}>${esc(t.label)}${t.n ? ` <span class="fx-count${t.hot ? " is-hot" : ""}">${t.n}</span>` : ""}</a>`).join("")}</nav>`;
}

function headHTML(page) {
  return `<div class="page-head has-accent fx-head" style="--sec:var(--sec-requests)">
      <div><h1 class="page-title">${esc(L.title)}</h1><p class="page-sub">${esc(L.sub)}</p></div>
      <a class="btn fx-new" href="${BASE}/new">${IC.plus}${esc(L.newRequest)}</a>
    </div>
    ${tabsHTML(page)}`;
}

/* ================= lists ================= */
function rowHTML(r) {
  const who = seesAll() ? ` · ${esc(nameOf(r.requester.id, r))}` : "";
  const assignee = seesAll()
    ? `<span class="fx-assignee${r.assignee ? "" : " is-none"}">${esc(r.assignee ? assigneeName(r) : "Unassigned")}</span>` : "";
  const photo = r.photos?.length ? `<span class="fx-has-photo" title="Has photos">${IC.camera}</span>` : "";
  return `<a class="fx-row" href="${BASE}/r/${r.id}" data-q="${esc([r.id, r.title, r.details, r.location, campusName(r.campus), nameOf(r.requester.id, r), assigneeName(r)].join(" ").toLowerCase())}">
      <span class="fx-dot fx-pri-${esc(r.priority)}" title="${esc(priOf(r.priority).label)}"></span>
      <span class="fx-type" title="${esc(typeOf(r.type).label)}">${IC[typeOf(r.type).icon]}</span>
      <span class="fx-row-main">
        <span class="fx-row-top"><span class="fx-id">#${r.id}</span><b>${esc(r.title)}</b>${photo}</span>
        <span class="fx-row-sub">${esc(campusName(r.campus))} · ${esc(r.location)}${who} · ${esc(ago(r.createdAt))}</span>
      </span>
      <span class="fx-row-side">${approvalTag(r)}${assignee}${statusPill(r)}</span>
    </a>`;
}

function sortRequests(list) {
  return [...list].sort((a, b) => {
    if (isOpen(a) !== isOpen(b)) return isOpen(a) ? -1 : 1;
    if (isOpen(a)) {
      const p = PRI_RANK[a.priority] - PRI_RANK[b.priority];
      return p || new Date(a.createdAt) - new Date(b.createdAt);   // oldest first
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function mineView() {
  const mine = state.requests.filter((r) => r.requester.id === "me");
  const list = sortRequests(mine);
  return `${headHTML("mine")}
    ${list.length ? `<div class="fx-list">${list.map(rowHTML).join("")}</div>`
      : `<div class="empty fx-empty">${esc(L.mineEmpty)}<br><a class="btn fx-empty-btn" href="${BASE}/new">${esc(L.newRequest)}</a></div>`}`;
}

function filtered() {
  const f = state.filters;
  return sortRequests(state.requests.filter((r) => {
    if (f.status === "open" && !isOpen(r)) return false;
    if (f.status !== "open" && f.status !== "all" && r.status !== f.status) return false;
    if (f.who === "none" && r.assignee) return false;
    if (f.who !== "all" && f.who !== "none" && r.assignee !== f.who) return false;
    if (f.campus !== "all" && r.campus !== f.campus) return false;
    return true;
  }));
}

function chips(group, options, current) {
  return `<div class="fx-chips" role="group">${options.map((o) =>
    `<button type="button" class="chip${o.id === current ? " is-on" : ""}" data-filter="${group}" data-val="${esc(o.id)}" aria-pressed="${o.id === current}">${esc(o.label)}</button>`).join("")}</div>`;
}

function queueView() {
  const all = state.requests;
  const open = all.filter(isOpen);
  const emergency = open.filter((r) => r.priority === "emergency").length;
  const old = open.filter((r) => ageDays(r) > 7).length;
  const waiting = pendingApprovals().length;
  const tile = (k, v, n, warn) => `<div class="tile${warn && v ? " tile-warn" : ""}"><div class="tile-k">${esc(k)}</div><div class="tile-v">${v}</div><div class="tile-n">${esc(n)}</div></div>`;

  const counts = campuses().map((c) => ({ c, n: open.filter((r) => r.campus === c.id).length }));
  const max = Math.max(1, ...counts.map((x) => x.n));
  const bars = counts.map(({ c, n }) => `<button type="button" class="fx-bar${state.filters.campus === c.id ? " is-on" : ""}" data-filter="campus" data-val="${state.filters.campus === c.id ? "all" : c.id}">
      <span class="fx-bar-k">${esc(c.name)}</span>
      <span class="fx-bar-track"><span class="fx-bar-fill" style="width:${(n / max) * 100}%"></span></span>
      <span class="fx-bar-n">${n}</span></button>`).join("");

  const f = state.filters;
  const statusOpts = [{ id: "open", label: L.filterOpen }, ...CONFIG.statuses.map((s) => ({ id: s.id, label: s.label })), { id: "all", label: L.filterAll }];
  const whoOpts = [{ id: "all", label: L.filterAll }, { id: "none", label: L.filterUnassigned },
    ...CONFIG.team.map((t) => ({ id: t.id, label: t.id === state.viewer ? L.filterMine : t.name }))];
  const campusOpts = `<option value="all">All campuses</option>${campuses().map((c) =>
    `<option value="${esc(c.id)}"${f.campus === c.id ? " selected" : ""}>${esc(c.name)}</option>`).join("")}`;

  const list = filtered();
  return `${headHTML("queue")}
    <div class="tiles fx-tiles">
      ${tile(L.tileOpen, open.length, L.tileOpenN)}
      ${tile(L.tileEmergency, emergency, L.tileEmergencyN, true)}
      ${tile(L.tileOld, old, L.tileOldN, true)}
      ${approvalsOn() ? tile(L.tileApproval, waiting, L.tileApprovalN) : ""}
    </div>
    <div class="fx-queue">
      <div class="fx-queue-main">
        <div class="fx-filters">
          ${chips("status", statusOpts, f.status)}
          ${chips("who", whoOpts, f.who)}
          <div class="fx-filter-row">
            <select class="fx-select" data-filter="campus" aria-label="Campus">${campusOpts}</select>
            <input type="search" class="fx-q" id="fx-q" placeholder="${esc(L.searchPlaceholder)}" value="${esc(f.q)}" aria-label="${esc(L.searchPlaceholder)}">
          </div>
        </div>
        <p class="fx-count-line" id="fx-count"></p>
        <div class="fx-list" id="fx-list">${list.map(rowHTML).join("")}</div>
        <p class="empty fx-none" id="fx-none" hidden>${esc(L.queueEmpty)}</p>
      </div>
      <aside class="panel fx-campus">
        <div class="panel-head"><h2>${esc(L.byCampus)}</h2></div>
        ${bars}
      </aside>
    </div>`;
}

// Search filters the drawn rows in place so the box keeps focus.
function applySearch() {
  const list = document.getElementById("fx-list");
  if (!list) return;
  const q = state.filters.q.trim().toLowerCase();
  let shown = 0;
  for (const row of list.children) {
    const hit = !q || row.dataset.q.includes(q);
    row.hidden = !hit;
    if (hit) shown++;
  }
  document.getElementById("fx-none").hidden = shown > 0;
  document.getElementById("fx-count").textContent = `${shown} request${shown === 1 ? "" : "s"}`;
}

function approvalsView() {
  const pending = pendingApprovals();
  const decided = state.requests.filter((r) => r.approval && r.approval.state !== "pending")
    .sort((a, b) => new Date(b.approval.decidedAt ?? 0) - new Date(a.approval.decidedAt ?? 0)).slice(0, 5);
  const card = (r) => `<article class="fx-apcard">
      <div class="fx-apcard-top">
        <div><a class="fx-aptitle" href="${BASE}/r/${r.id}"><span class="fx-id">#${r.id}</span> ${esc(r.title)}</a>
        <p class="fx-row-sub">${esc(campusName(r.campus))} · ${esc(r.location)} · from ${esc(nameOf(r.approval.by, r))} ${esc(ago(r.approval.at))}</p></div>
        <div class="fx-amount">${esc(r.approval.amount || "No amount")}</div>
      </div>
      ${r.approval.note ? `<p class="fx-apnote">${esc(r.approval.note)}</p>` : ""}
      <div class="fx-apacts">
        <input type="text" class="fx-input" id="fx-dn-${r.id}" placeholder="Optional note back to Joe" aria-label="Note back to Joe">
        <button type="button" class="btn" data-act="approve" data-id="${r.id}">${esc(L.approve)}</button>
        <button type="button" class="btn btn-ghost" data-act="decline" data-id="${r.id}">${esc(L.decline)}</button>
      </div>
    </article>`;
  return `${headHTML("approvals")}
    ${pending.length ? pending.map(card).join("") : `<p class="empty">${esc(L.approvalsEmpty)}</p>`}
    ${decided.length ? `<h2 class="fx-h2">Recently decided</h2><div class="fx-list">${decided.map(rowHTML).join("")}</div>` : ""}`;
}

/* ================= new request ================= */
function newView() {
  state.draftPhotos = [];
  const types = CONFIG.types.map((t, i) => `<label class="fx-pick">
      <input type="radio" name="type" value="${esc(t.id)}"${i === 0 ? " checked" : ""}>
      <span class="fx-pick-in"><span class="fx-pick-ic">${IC[t.icon]}</span><b>${esc(t.label)}</b><span>${esc(t.blurb)}</span></span>
    </label>`).join("");
  const home = homeCampus();
  const camp = campuses().map((c) => `<label class="fx-chip-radio"><input type="radio" name="campus" value="${esc(c.id)}"${c.id === home ? " checked" : ""} required><span>${esc(c.name)}</span></label>`).join("");
  const pri = CONFIG.priorities.map((p) => `<label class="fx-pri-opt fx-pri-${p.id}">
      <input type="radio" name="priority" value="${esc(p.id)}"${p.id === "week" ? " checked" : ""}>
      <span><b><i class="fx-dot fx-pri-${p.id}"></i>${esc(p.label)}</b><span>${esc(p.blurb)}</span></span>
    </label>`).join("");
  return `<a class="fx-back" href="${BASE}">${IC.back}${esc(L.back)}</a>
    <div class="page-head has-accent fx-head" style="--sec:var(--sec-requests)">
      <div><h1 class="page-title">${esc(L.formTitle)}</h1></div>
    </div>
    <form class="fx-form" id="fx-form" novalidate>
      ${CONFIG.types.length > 1 ? `<fieldset class="fx-field"><legend>${esc(L.formType)}</legend><div class="fx-picks">${types}</div></fieldset>` : `<input type="hidden" name="type" value="${esc(CONFIG.types[0].id)}">`}

      <label class="fx-field"><span class="fx-label">${esc(L.formTitleLabel)}</span>
        <input class="fx-input" name="title" maxlength="90" required>
        <span class="fx-hint">${esc(L.formTitleHint)}</span>
        <span class="fx-err" data-err="title" hidden>Add a short summary.</span></label>

      <fieldset class="fx-field"><legend>${esc(L.formCampus)}</legend><div class="fx-chips">${camp}</div>
        ${home ? `<p class="fx-hint">${esc(L.formCampusHint)}</p>` : ""}
        <p class="fx-err" data-err="campus" hidden>Pick a campus.</p></fieldset>

      <label class="fx-field"><span class="fx-label">${esc(L.formLocation)}</span>
        <input class="fx-input" name="location" maxlength="120" required>
        <span class="fx-hint">${esc(L.formLocationHint)}</span>
        <span class="fx-err" data-err="location" hidden>Tell Joe where to go.</span></label>



      <label class="fx-field"><span class="fx-label">${esc(L.formDetails)}</span>
        <textarea class="fx-input" name="details" rows="4" maxlength="2000"></textarea>
        <span class="fx-hint">${esc(L.formDetailsHint)}</span></label>

      <fieldset class="fx-field"><legend>${esc(L.formPriority)}</legend><div class="fx-pris">${pri}</div>
        <p class="fx-warn fx-warn-emergency" id="fx-emergency" hidden>${IC.alert}<span>${esc(L.emergencyWarn)}</span></p></fieldset>

      <div class="fx-field"><span class="fx-label">${esc(L.formPhotos)}</span>
        <div class="fx-photos" id="fx-photos"></div>
        <label class="fx-addphoto" id="fx-addphoto">${IC.camera}<span>Add photos</span>
          <input type="file" accept="image/*" multiple id="fx-file" hidden></label>
        <span class="fx-hint">${esc(L.formPhotosHint)} ${esc(L.photoPrivacy)}</span></div>

      <div class="fx-submit">
        <button type="submit" class="btn">${esc(L.formSubmit)}</button>
        <a class="btn btn-ghost" href="${BASE}">${esc(L.formCancel)}</a>
      </div>
    </form>`;
}

function drawDraftPhotos() {
  const box = document.getElementById("fx-photos");
  if (!box) return;
  box.innerHTML = state.draftPhotos.map((p, i) => `<figure class="fx-thumb">
      <img src="${p.url}" alt="${esc(p.name)}"><button type="button" data-act="unphoto" data-i="${i}" aria-label="Remove photo">${IC.x}</button></figure>`).join("");
  document.getElementById("fx-addphoto").hidden = state.draftPhotos.length >= 4;
}

// Shrink to 900px JPEG so a phone photo fits in demo storage. The real
// version uploads the original to a private Storage bucket.
function shrink(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 900 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Not an image we can read")); };
    img.src = url;
  });
}

function submitForm(form) {
  const fd = new FormData(form);
  const v = (k) => String(fd.get(k) ?? "").trim();
  const missing = ["title", "campus", "location"].filter((k) => !v(k));
  form.querySelectorAll("[data-err]").forEach((el) => { el.hidden = !missing.includes(el.dataset.err); });
  if (missing.length) {
    form.querySelector(`[data-err="${missing[0]}"]`)?.closest(".fx-field")?.scrollIntoView({ block: "center", behavior: "smooth" });
    return;
  }
  const id = Math.max(1000, ...state.requests.map((r) => r.id)) + 1;
  const now = new Date().toISOString();
  const type = v("type");
  const priority = v("priority") || "week";
  const req = {
    id, type, campus: v("campus"), location: v("location"), title: v("title"), details: v("details"),
    priority, status: "new", assignee: null,
    requester: { id: "me", name: "" }, createdAt: now,
    photos: state.draftPhotos.map((p) => ({ name: p.name, url: p.url })),
    approval: null,
    activity: [
      { at: now, by: "me", text: "Submitted" },
      { at: now, by: "system", kind: "teams", to: "joe", text: priority === "emergency" ? "New emergency request" : "New request" },
    ],
  };
  if (type === "keys") req.keys = // keys type is off in v1 (CONFIG.types)
    { who: v("keysWho"), where: v("keysWhere"), needBy: v("needBy") || null };
  state.requests.push(req);
  state.draftPhotos = [];
  save();
  ctx.toast(L.sent(id));
  go(`${BASE}/r/${id}`);
}

/* ================= one request ================= */
function timelineHTML(r) {
  // A quiet record of what happened, newest first. Conversation lives in Teams.
  // Entries written in the same moment keep their order.
  const items = r.activity.map((a, i) => ({ ...a, i }))
    .filter((a) => seesAll() || !a.internal)
    .sort((a, b) => (new Date(b.at) - new Date(a.at)) || (b.i - a.i));
  return items.map((a) => {
    const text = a.kind === "teams" ? L.notified(nameOf(a.to, r)) : a.text;
    const who = a.kind === "teams" ? "" : `${esc(nameOf(a.by, r))} · `;
    return `<li class="fx-h${a.kind === "teams" ? " is-teams" : ""}"><span class="fx-h-text">${esc(text)}</span>
      <span class="fx-h-meta">${who}<time datetime="${esc(a.at)}">${esc(DATE.format(new Date(a.at)))}</time></span></li>`;
  }).join("");
}

// Opens a 1:1 Teams chat with the facilities contact, prefilled with the request.
function teamsChatUrl(r) {
  const c = CONFIG.teamsContact ?? {};
  if (!c.email) return "https://teams.microsoft.com/";
  const msg = encodeURIComponent(L.msgPrefill(r.id, r.title));
  return `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(c.email)}&message=${msg}`;
}

function messageHTML(r) {
  const name = CONFIG.teamsContact?.name ?? "Joe";
  if (actor() === "joe") return "";
  return `<section class="fx-msg">
      <p><b>${esc(L.msgHead)}</b> ${esc(L.msgBody(name))}</p>
      <a class="btn" href="${esc(teamsChatUrl(r))}" target="_blank" rel="noopener">${esc(L.msgButton(name))}</a>
    </section>`;
}

function approvalBanner(r) {
  if (!approvalsOn()) return "";
  const a = r.approval;
  if (!a) return "";
  if (a.state === "pending") return `<p class="fx-banner fx-ap-pending">${esc(L.approvalPending(a.amount))}</p>`;
  if (a.state === "approved") return `<p class="fx-banner fx-ap-ok">${esc(L.approvalApproved(a.amount))}${a.decisionNote ? ` · “${esc(a.decisionNote)}”` : ""}</p>`;
  return `<p class="fx-banner fx-ap-no">${esc(L.approvalDeclined)}${a.decisionNote ? ` · “${esc(a.decisionNote)}”` : ""}</p>`;
}

function managePanel(r) {
  if (approvalsOn() && isRyan() && r.approval?.state === "pending") {
    return `<div class="panel fx-side-panel">
      <div class="panel-head"><h2>${esc(L.tabApprovals)}</h2></div>
      <p class="fx-amount">${esc(r.approval.amount || "No amount")}</p>
      ${r.approval.note ? `<p class="fx-apnote">${esc(r.approval.note)}</p>` : ""}
      <input type="text" class="fx-input" id="fx-dn-${r.id}" placeholder="Optional note back to Joe" aria-label="Note back to Joe">
      <div class="fx-side-acts">
        <button type="button" class="btn" data-act="approve" data-id="${r.id}">${esc(L.approve)}</button>
        <button type="button" class="btn btn-ghost" data-act="decline" data-id="${r.id}">${esc(L.decline)}</button>
      </div></div>`;
  }
  if (!isTeam()) return "";
  const seg = CONFIG.statuses.map((s) => `<button type="button" class="fx-seg-btn${r.status === s.id ? " is-on" : ""}" data-act="status" data-val="${s.id}" aria-pressed="${r.status === s.id}">${esc(s.label)}</button>`).join("");
  const assign = `<option value="">${esc(L.unassigned)}</option>${CONFIG.team.map((t) =>
    `<option value="${t.id}"${r.assignee === t.id ? " selected" : ""}>${esc(t.name)}</option>`).join("")}`;
  const pri = CONFIG.priorities.map((p) => `<option value="${p.id}"${r.priority === p.id ? " selected" : ""}>${esc(p.label)}</option>`).join("");
  // Sending for approval is Joe's call, so only Joe sees it.
  const canSend = approvalsOn() && state.viewer === "joe" && r.approval?.state !== "pending" && r.status !== "done";
  return `<div class="panel fx-side-panel">
      <div class="panel-head"><h2>${esc(L.manage)}</h2></div>
      <span class="fx-label">${esc(L.status)}</span>
      <div class="fx-seg" role="group" aria-label="${esc(L.status)}">${seg}</div>
      <label class="fx-field"><span class="fx-label">${esc(L.assign)}</span>
        <select class="fx-select" data-act="assign">${assign}</select></label>
      <label class="fx-field fx-vendor" ${r.assignee === "vendor" ? "" : "hidden"}><span class="fx-label">Vendor name</span>
        <input class="fx-input" data-act="vendor" value="${esc(r.vendor ?? "")}" placeholder="Who's doing the work"></label>
      <label class="fx-field"><span class="fx-label">${esc(L.priority)}</span>
        <select class="fx-select" data-act="priority">${pri}</select></label>
      ${canSend ? `<details class="fx-approve-box">
        <summary>${esc(L.sendApproval)}</summary>
        <label class="fx-field"><span class="fx-label">${esc(L.approvalAmount)}</span>
          <input class="fx-input" id="fx-amt" inputmode="decimal" placeholder="$0"></label>
        <label class="fx-field"><span class="fx-label">${esc(L.approvalNote)}</span>
          <textarea class="fx-input" id="fx-apn" rows="2"></textarea></label>
        <button type="button" class="btn" data-act="send-approval">${esc(L.approvalSend)}</button>
      </details>` : ""}
    </div>`;
}

function detailView(id) {
  const r = state.requests.find((x) => String(x.id) === String(id));
  const back = seesAll() ? `${BASE}/queue` : `${BASE}/mine`;
  if (!r || !visible(r)) {
    return `<a class="fx-back" href="${back}">${IC.back}${esc(L.back)}</a>
      <p class="empty">That request isn't here, or it isn't yours to see.</p>`;
  }
  const t = typeOf(r.type);
  const facts = [
    [L.detailCampus, campusName(r.campus)],
    [L.detailLocation, r.location],
    [L.detailRequested, nameOf(r.requester.id, r)],
    [L.detailSubmitted, `${DATE.format(new Date(r.createdAt))} (${ago(r.createdAt)})`],
    [L.detailAssigned, assigneeName(r)],
  ];
  if (r.keys) {
    if (r.keys.who) facts.push([L.detailWho, r.keys.who]);
    if (r.keys.where) facts.push([L.detailWhere, r.keys.where]);
    if (r.keys.needBy) facts.push([L.detailNeedBy, DAY_ONLY.format(new Date(r.keys.needBy))]);
  }
  const photos = r.photos?.length ? `<div class="fx-gallery">${r.photos.map((p, i) =>
    `<button type="button" class="fx-gal" data-act="zoom" data-i="${i}" aria-label="View photo ${i + 1}"><img src="${p.url}" alt="${esc(p.name)}"></button>`).join("")}</div>` : "";
  const manage = managePanel(r);
  return `<a class="fx-back" href="${back}">${IC.back}${esc(L.back)}</a>
    <div class="fx-detail${manage ? "" : " is-solo"}" data-id="${r.id}">
      <div class="fx-detail-main">
        <div class="fx-dmeta"><span class="fx-id">#${r.id}</span><span class="fx-dtype">${IC[t.icon]}${esc(t.label)}</span>${statusPill(r)}${priPill(r)}</div>
        <h1 class="fx-dtitle">${esc(r.title)}</h1>
        ${approvalBanner(r)}
        <dl class="fx-facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
        ${r.details ? `<p class="fx-details">${esc(r.details)}</p>` : ""}
        ${photos}
        ${messageHTML(r)}
        <section class="fx-history">
          <h2 class="fx-h-head">${esc(L.timeline)}</h2>
          <ol class="fx-timeline">${timelineHTML(r)}</ol>
        </section>
      </div>
      ${manage ? `<aside class="fx-detail-side">${manage}</aside>` : ""}
    </div>`;
}

/* ================= changes ================= */
// Every change writes an activity line and, where someone should hear about
// it, a Teams line. In the real version the Teams lines are actual messages
// sent by a Power Automate flow.
function log(r, text, extra = {}) {
  r.activity.push({ at: new Date().toISOString(), by: actor(), text, ...extra });
}
function notify(r, to, text) {
  if (!to || to === actor() || to === "vendor") return;
  r.activity.push({ at: new Date().toISOString(), by: "system", kind: "teams", to, text });
}
const current = () => {
  const id = mountEl?.querySelector(".fx-detail")?.dataset.id;
  return state.requests.find((r) => String(r.id) === id);
};

function setStatus(r, val) {
  if (r.status === val) return;
  r.status = val;
  log(r, `Marked ${statusOf(val).label}`);
  notify(r, r.requester.id, val === "done" ? "Your request is done" : `Your request is now ${statusOf(val).label}`);
}
function setAssignee(r, val) {
  r.assignee = val || null;
  log(r, val ? `Assigned to ${nameOf(val)}` : "Unassigned");
  if (val && val !== "vendor") notify(r, val, "Assigned to you");
  if (val && r.status === "new") { r.status = "progress"; log(r, "Marked In progress"); }
}
function decide(r, approved) {
  const note = document.getElementById(`fx-dn-${r.id}`)?.value.trim() ?? "";
  r.approval = { ...r.approval, state: approved ? "approved" : "declined", decisionNote: note, decidedAt: new Date().toISOString() };
  log(r, `${approved ? "Approved" : "Declined"}${r.approval.amount ? ` · ${r.approval.amount}` : ""}${note ? `: ${note}` : ""}`);
  notify(r, r.approval.by ?? "joe", approved ? "Ryan approved it" : "Ryan declined it");
  save();
  ctx.toast(approved ? `#${r.id} approved. Joe got a Teams message.` : `#${r.id} declined. Joe got a Teams message.`);
  render();
}

/* ================= events ================= */
function wire() {
  if (mountEl.dataset.fxWired) return;
  mountEl.dataset.fxWired = "1";

  mountEl.addEventListener("click", (e) => {
    const t = e.target.closest("[data-viewer],[data-act],[data-filter]");
    if (!t || !mountEl.querySelector(".fx-root")?.contains(t)) return;
    if (t.matches("select,input,textarea")) return;   // handled on change/input

    if (t.dataset.viewer) {
      state.viewer = t.dataset.viewer;
      write(VIEWER, state.viewer);
      state.filters.who = state.viewer === "eric" ? "eric" : "all";
      // Stay on a request if the new viewer can see it; otherwise go home.
      const r = current();
      go(r && visible(r) ? `${BASE}/r/${r.id}` : BASE);
      return;
    }
    if (t.dataset.filter) {
      state.filters[t.dataset.filter] = t.dataset.val;
      render();
      return;
    }
    const r = current();
    const id = t.dataset.id && state.requests.find((x) => String(x.id) === t.dataset.id);
    switch (t.dataset.act) {
      case "reset":
        state.requests = demoRequests();
        state.filters = { status: "open", who: state.viewer === "eric" ? "eric" : "all", campus: "all", q: "" };
        save(); ctx.toast("Demo data reset."); go(BASE);
        break;
      case "status":
        setStatus(r, t.dataset.val); save(); render();
        break;
      case "send-approval": {
        const amt = document.getElementById("fx-amt").value.trim();
        const note = document.getElementById("fx-apn").value.trim();
        const amount = amt && !amt.startsWith("$") ? `$${amt}` : amt;
        r.approval = { state: "pending", amount, note, by: actor(), at: new Date().toISOString() };
        log(r, `Sent to Ryan for approval${amount ? ` · ${amount}` : ""}`);
        notify(r, CONFIG.approver.id, `Approval needed${amount ? ` · ${amount}` : ""}`);
        save(); ctx.toast(`Sent to Ryan. He got a Teams message.`); render();
        break;
      }
      case "approve": decide(id || r, true); break;
      case "decline": decide(id || r, false); break;
      case "unphoto":
        state.draftPhotos.splice(Number(t.dataset.i), 1); drawDraftPhotos();
        break;
      case "zoom": {
        const p = r?.photos?.[Number(t.dataset.i)];
        if (!p) break;
        const box = document.createElement("div");
        box.className = "fx-zoom";
        box.innerHTML = `<img src="${p.url}" alt="${esc(p.name)}"><button type="button" aria-label="Close">${IC.x}</button>`;
        box.addEventListener("click", () => box.remove());
        document.body.appendChild(box);
        break;
      }
    }
  });

  mountEl.addEventListener("change", async (e) => {
    const t = e.target;
    if (!t.closest(".fx-root")) return;
    if (t.matches("select[data-filter]")) { state.filters[t.dataset.filter] = t.value; render(); return; }
    if (t.matches('input[name="type"]')) {
      mountEl.querySelectorAll("[data-for]").forEach((el) => { el.hidden = el.dataset.for !== t.value; });
      return;
    }
    if (t.matches('input[name="priority"]')) {
      document.getElementById("fx-emergency").hidden = t.value !== "emergency";
      return;
    }
    if (t.matches('input[name="campus"]')) { mountEl.querySelector('[data-err="campus"]').hidden = true; return; }
    if (t.id === "fx-file") {
      for (const file of [...t.files].slice(0, 4 - state.draftPhotos.length)) {
        try { state.draftPhotos.push({ name: file.name, url: await shrink(file) }); }
        catch { ctx.toast(`Couldn't read ${file.name}.`); }
      }
      t.value = "";
      drawDraftPhotos();
      return;
    }
    const r = current();
    if (!r) return;
    if (t.dataset.act === "assign") { setAssignee(r, t.value); save(); render(); }
    if (t.dataset.act === "priority") {
      r.priority = t.value; log(r, `Priority set to ${priOf(t.value).label}`); save(); render();
    }
    if (t.dataset.act === "vendor") { r.vendor = t.value.trim(); log(r, `Vendor: ${r.vendor || "none"}`); save(); render(); }
  });

  mountEl.addEventListener("input", (e) => {
    if (!e.target.closest(".fx-root")) return;
    if (e.target.id === "fx-q") { state.filters.q = e.target.value; applySearch(); }
    if (e.target.name && e.target.closest("#fx-form")) {
      const err = mountEl.querySelector(`[data-err="${e.target.name}"]`);
      if (err && e.target.value.trim()) err.hidden = true;
    }
  });

  mountEl.addEventListener("submit", (e) => {
    if (!e.target.closest(".fx-root")) return;
    if (e.target.id === "fx-form") { e.preventDefault(); submitForm(e.target); return; }
  });
}

/* ================= entry ================= */
function render() {
  if (!mountEl) return;
  const parts = location.hash.replace(/^#\/?/, "").split("/");
  let page = (parts[1] ?? "").toLowerCase();
  const arg = parts[2];
  if (!page) page = seesAll() ? "queue" : "mine";
  if (page === "queue" && !seesAll()) page = "mine";
  if (page === "approvals" && (!isRyan() || !approvalsOn())) page = seesAll() ? "queue" : "mine";

  const body = page === "new" ? newView()
    : page === "r" ? detailView(arg)
    : page === "queue" ? queueView()
    : page === "approvals" ? approvalsView()
    : mineView();
  mountEl.innerHTML = `<div class="fx-root">${demoBar()}${body}</div>`;
  if (page === "queue") applySearch();
  if (page === "new") drawDraftPhotos();
  document.title = `Facilities · Staff Hub | Cornerstone Fellowship`;
}

export function mountFacilities(el, context = {}) {
  mountEl = el;
  ctx = { ...ctx, ...context };
  wire();
  render();
}
