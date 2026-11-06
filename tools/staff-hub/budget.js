// The Budget page. Drawn inside the Staff Hub, reads only Supabase.
//
// What a person gets back is decided by RLS (db/migrations/0007_budgets.sql),
// not by this file. The one filter here is for an admin using "view as": the
// database still sees the admin, so the page narrows the rows on screen to
// what that person's access rows allow. That is a preview, never the lock.
//
// The formulas match Finance's check-in PDF, so the two always agree:
//   budget net = expense annual - income annual
//   remaining  = budget net + income received - spending
//   planned    = whole months, including the current partial month

import { getClient } from "../../shared/js/supabase.js";
import { CONFIG } from "./config.js";

const L = CONFIG.labels.budget;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const money = (n) => USD.format(Math.round(n * 100) / 100 + 0);
const sum = (rows, f) => rows.reduce((t, r) => t + Number(f(r) ?? 0), 0);
const dateOf = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const LONG = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const SHORT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const MONTH = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const MON = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

/* ---------- data ---------- */
async function rows(table) {
  const supabase = await getClient();
  const all = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select("*").order(KEYS[table].by).range(from, from + 999);
    if (error) throw error;
    all.push(...data);
    if (data.length < 1000) return all;
  }
}
const KEYS = {
  budget_load: { by: "through_date" }, budgets: { by: "budget_id" }, budget_access: { by: "budget_id" },
  budget_lines: { by: "id" }, budget_transactions: { by: "id" }, budget_notes: { by: "id" },
};

let cache = null;   // one fetch per page load; a new file means a refresh
function load() {
  cache ??= Promise.all(Object.keys(KEYS).map(rows)).then(([load, budgets, access, lines, txns, notes]) =>
    ({ load: load[0] ?? null, budgets, access, lines, txns, notes }));
  cache.catch(() => { cache = null; });
  return cache;
}

/* ---------- numbers ---------- */
// How many fiscal months the data reaches into (Sep = 1).
function monthsIn(about) {
  const a = dateOf(about.period_start), b = dateOf(about.through_date);
  return (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() + 1;
}
// The twelve fiscal months, Sep to Aug.
function monthsList(about) {
  const a = dateOf(about.period_start);
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(a.getFullYear(), a.getMonth() + i, 1);
    return { i, date: d, label: MONTH.format(d), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` };
  });
}
// A period runs from one fiscal month to another, both included. `year` means
// year to date or the full year, where "Left" is the whole year's. Any other
// range compares spending to that range's plan.
function periodOf(from, to, about) {
  const months = monthsList(about);
  const n = monthsIn(about);
  const label = from === to ? months[from].label : `${MON.format(months[from].date)} to ${MON.format(months[to].date)}`;
  return { from, to, label, keys: new Set(months.slice(from, to + 1).map((m) => m.key)),
    year: from === 0 && (to === n - 1 || to === 11), ytd: from === 0 && to === n - 1, full: from === 0 && to === 11, future: to >= n };
}
const plannedFor = (line, period) => line.monthly.slice(period.from, period.to + 1).reduce((t, v) => t + Number(v), 0);
const inPeriod = (t, period) => period.keys.has(t.txn_date.slice(0, 7));

function totals(budgetId, d) {
  const lines = d.lines.filter((l) => l.budget_id === budgetId);
  const txns = d.txns.filter((t) => t.budget_id === budgetId);
  const expense = sum(lines.filter((l) => l.account_type === "Expense"), (l) => l.annual);
  const income = sum(lines.filter((l) => l.account_type === "Income"), (l) => l.annual);
  const spent = sum(txns.filter((t) => t.kind === "expense"), (t) => t.amount);
  const received = sum(txns.filter((t) => t.kind === "income"), (t) => t.amount);
  const ytd = d.load ? periodOf(0, Math.min(monthsIn(d.load), 12) - 1, d.load) : null;
  const planned = ytd ? sum(lines.filter((l) => l.account_type === "Expense"), (l) => plannedFor(l, ytd)) : 0;
  return { expense, income, net: expense - income, spent, received, planned, remaining: expense - income + received - spent };
}

// One entry per class + account, including spending with no budget line. The
// PDF shows those with a $0 budget, and so does this.
function accounts(budgetId, kind, d) {
  const type = kind === "expense" ? "Expense" : "Income";
  const map = new Map();
  const entry = (r) => {
    const key = `${r.class_code}|${r.account_code}`;
    if (!map.has(key)) map.set(key, { class_code: r.class_code, account_code: r.account_code, account_name: r.account_name,
      class_name: r.class_name ?? null, annual: 0, monthly: Array(12).fill(0), txns: [], unplanned: true });
    return map.get(key);
  };
  for (const l of d.lines.filter((x) => x.budget_id === budgetId && x.account_type === type)) {
    Object.assign(entry(l), { annual: Number(l.annual), monthly: l.monthly, class_name: l.class_name, unplanned: false });
  }
  for (const t of d.txns.filter((x) => x.budget_id === budgetId && x.kind === kind)) entry(t).txns.push(t);
  const names = new Map(d.lines.filter((x) => x.budget_id === budgetId).map((l) => [l.class_code, l.class_name]));
  return [...map.values()]
    .map((a) => ({ ...a, class_name: a.class_name ?? names.get(a.class_code) ?? a.class_code }))
    .sort((a, b) => a.class_code.localeCompare(b.class_code) || a.account_code.localeCompare(b.account_code));
}

/* ---------- pieces ---------- */
const head = (sub) => `<div class="page-head has-accent" style="--sec:var(--sec-guides)">
    <div><h1 class="page-title">${esc(L.title)}</h1>${sub ? `<p class="page-sub">${esc(sub)}</p>` : ""}</div>
  </div>`;
const stat = (k, v, note, cls = "") => `<div class="bg-stat ${cls}"><span>${esc(k)}</span><b>${esc(v)}</b>${note ? `<small>${esc(note)}</small>` : ""}</div>`;

function leftText(left) {
  return left < 0 ? `<span class="bg-over">${esc(L.over(money(-left)))}</span>` : esc(money(left));
}

function txnList(txns, period) {
  const shown = txns.filter((t) => inPeriod(t, period)).sort((a, b) => a.txn_date.localeCompare(b.txn_date));
  if (!shown.length) return `<p class="bg-none">${esc(period.year ? L.noneYet : L.noneInPeriod)}</p>`;
  return `<ul class="bg-txns">${shown.map((t) => `<li>
      <span class="bg-t-date">${esc(SHORT.format(dateOf(t.txn_date)))}</span>
      <span class="bg-t-main"><b>${esc(t.payee_display ?? L.noPayee)}</b>${t.memo_display ? `<span>${esc(t.memo_display)}</span>` : ""}${t.pending_review ? `<em>${esc(L.underReview)}</em>` : ""}</span>
      <span class="bg-t-amt">${esc(money(t.amount))}</span>
    </li>`).join("")}</ul>`;
}

function accountRow(a, period, kind) {
  const actual = sum(a.txns.filter((t) => inPeriod(t, period)), (t) => t.amount);
  const year = sum(a.txns, (t) => t.amount);
  // "Left" compares like with like: the full year, or the month being shown.
  const left = period.year ? a.annual - year : plannedFor(a, period) - actual;
  return `<details class="bg-acct">
    <summary>
      <span class="bg-a-name"><b>${esc(a.account_name ?? a.account_code)}</b>${kind === "income" ? `<small>${esc(a.class_name)}</small>` : ""}${a.unplanned ? `<em>${esc(L.notInBudget)}</em>` : ""}</span>
      <span class="bg-num" data-k="${esc(L.colBudget)}">${esc(money(a.annual))}</span>
      <span class="bg-num bg-opt" data-k="${esc(L.colPlanned)}">${esc(money(plannedFor(a, period)))}</span>
      <span class="bg-num" data-k="${esc(kind === "expense" ? L.colSpent : L.colReceived)}">${esc(money(actual))}</span>
      <span class="bg-num" data-k="${esc(lastCol(kind, period))}">${kind === "expense" ? leftText(left) : esc(money(left))}</span>
    </summary>
    ${txnList(a.txns, period)}
  </details>`;
}

const lastCol = (kind, period) => {
  if (period.year) return kind === "expense" ? L.colLeft : L.colToGo;
  if (period.from === period.to) return kind === "expense" ? L.colLeftMonth : L.colToGoMonth;
  return kind === "expense" ? L.colLeftRange : L.colToGoRange;
};

function columns(kind, period) {
  return `<div class="bg-cols" aria-hidden="true"><span></span><span>${esc(L.colBudget)}</span><span class="bg-opt">${esc(L.colPlanned)}</span>
    <span>${esc(kind === "expense" ? L.colSpent : L.colReceived)}</span><span>${esc(lastCol(kind, period))}</span></div>`;
}

function classGroups(list, period) {
  const classes = [...new Set(list.map((a) => a.class_code))];
  return classes.map((c) => {
    const inClass = list.filter((a) => a.class_code === c);
    const name = inClass[0].class_name;
    const spent = sum(inClass.flatMap((a) => a.txns).filter((t) => inPeriod(t, period)), (t) => t.amount);
    return `<section class="bg-class"><h3><span>${esc(name)}</span><small>${esc(L.spentShort(money(spent)))}</small></h3>
      ${inClass.map((a) => accountRow(a, period, "expense")).join("")}</section>`;
  }).join("");
}

function detail(budget, d, period, multi) {
  const t = totals(budget.budget_id, d);
  const months = monthsList(d.load);
  const through = SHORT.format(dateOf(d.load.through_date));
  const pct = t.expense > 0 ? Math.min(100, (t.spent / t.expense) * 100) : 0;
  const planPct = t.expense > 0 ? Math.min(100, (t.planned / t.expense) * 100) : 0;
  const notes = d.notes.filter((x) => x.budget_id === budget.budget_id);
  const income = accounts(budget.budget_id, "income", d);
  const spentPeriod = sum(d.txns.filter((x) => x.budget_id === budget.budget_id && x.kind === "expense" && inPeriod(x, period)), (x) => x.amount);
  const option = (m, on) => `<option value="${m.i}"${on ? " selected" : ""}>${esc(m.label)}</option>`;
  return `${multi ? `<a class="back-link" href="#/budget">← ${esc(L.back)}</a>` : ""}
    ${head(L.through(budget.budget_name, LONG.format(dateOf(d.load.through_date))))}
    <section class="dcard bg-summary">
      <div class="bg-stats">
        ${stat(L.remaining, money(t.remaining), L.remainingNote, t.remaining < 0 ? "is-over" : "is-main")}
        ${stat(L.budgetNet, money(t.net), L.budgetNetNote(money(t.expense), money(t.income)))}
        ${stat(L.spending, money(t.spent), L.spendingNote(money(t.planned)))}
        ${stat(L.received, money(t.received), L.receivedNote(money(t.income)))}
      </div>
      <div class="bg-bar" role="img" aria-label="${esc(L.barLabel(Math.round(pct), Math.round(planPct)))}">
        <i style="width:${pct.toFixed(1)}%"></i><u style="left:${planPct.toFixed(1)}%"></u>
      </div>
      <p class="bg-bar-key"><span>${esc(L.barSpent(Math.round(pct)))}</span><span>${esc(L.barPlanned(Math.round(planPct)))}</span></p>
    </section>

    <section class="dcard">
      <div class="dcard-h"><h2>${esc(L.spendingHeading)}</h2></div>
      <div class="bg-range">
        <div class="bg-presets" role="group" aria-label="${esc(L.period)}">
          <button type="button" class="chip${period.ytd ? " is-on" : ""}" data-range="ytd" aria-pressed="${period.ytd}">${esc(L.yearToDate)}</button>
          <button type="button" class="chip${period.full ? " is-on" : ""}" data-range="full" aria-pressed="${period.full}">${esc(L.fullYear)}</button>
        </div>
        <label><span>${esc(L.from)}</span><select id="bg-from">${months.map((m) => option(m, m.i === period.from)).join("")}</select></label>
        <label><span>${esc(L.to)}</span><select id="bg-to">${months.map((m) => option(m, m.i === period.to)).join("")}</select></label>
      </div>
      ${period.ytd ? "" : `<p class="bg-period-note">${esc(L.periodNote(period.label, money(spentPeriod)))}${period.future ? ` ${esc(L.futureNote(through))}` : ""}</p>`}
      ${columns("expense", period)}
      ${classGroups(accounts(budget.budget_id, "expense", d), period)}
      <p class="bg-hint">${esc(L.hint)}</p>
    </section>

    ${income.length || notes.length ? `<section class="dcard">
      <div class="dcard-h"><h2>${esc(L.incomeHeading)}</h2></div>
      ${notes.map((x) => `<p class="bg-note"><b>${esc(L.openQuestion)}</b> ${esc(x.note)}</p>`).join("")}
      ${income.length ? columns("income", period) + income.map((a) => accountRow(a, period, "income")).join("") : ""}
    </section>` : ""}`;
}

function overview(budgets, access, d, viewEmail) {
  // "My ministries" counts budgets where this person is a supervisor. Viewer
  // rows show up in the list but never count, per Finance's notes.
  const mine = access.filter((a) => a.access_type === "supervisor" && (!viewEmail || a.email === viewEmail));
  const counted = budgets.filter((b) => mine.some((a) => a.budget_id === b.budget_id));
  const roll = counted.map((b) => totals(b.budget_id, d));
  const locations = [...new Map(budgets.map((b) => [b.location_code, b.location_name])).entries()]
    .sort((a, b) => a[0].localeCompare(b[0]));
  return `${head(L.throughAll(LONG.format(dateOf(d.load.through_date))))}
    ${counted.length > 1 ? `<section class="dcard bg-summary"><div class="dcard-h"><h2>${esc(L.myMinistries)}</h2></div>
      <div class="bg-stats">
        ${stat(L.remaining, money(sum(roll, (r) => r.remaining)), "", "is-main")}
        ${stat(L.budgetNet, money(sum(roll, (r) => r.net)))}
        ${stat(L.spending, money(sum(roll, (r) => r.spent)))}
        ${stat(L.received, money(sum(roll, (r) => r.received)))}
      </div><p class="bg-hint">${esc(L.myMinistriesNote)}</p></section>` : ""}
    ${locations.map(([code, name]) => `<section class="dcard"><div class="dcard-h"><h2>${esc(name)}</h2></div>
      <div class="bg-list">${budgets.filter((b) => b.location_code === code).map((b) => {
        const t = totals(b.budget_id, d);
        return `<a href="#/budget/${esc(b.budget_id)}"><b>${esc(b.budget_name)}</b>
          <span>${esc(L.listLine(money(t.spent), money(t.net)))}</span>
          <span class="bg-list-left">${esc(L.leftShort(money(t.remaining)))}</span></a>`;
      }).join("")}</div></section>`).join("")}`;
}

const noBudget = () => `${head()}<section class="dcard bg-empty"><h2>${esc(L.noneTitle)}</h2><p>${esc(L.noneBody)}</p></section>`;

/* ---------- mount ---------- */
let ticket = 0;
let range = null;   // { from, to } once someone changes it; null is year to date

export async function mountBudget(el, { sub, viewingAsEmail }) {
  const mine = ++ticket;
  el.innerHTML = `${head()}<section class="dcard"><p class="bg-loading">${esc(L.loading)}</p></section>`;
  let d;
  try {
    d = await load();
  } catch (e) {
    console.warn("[budget]", e?.message);
    if (mine === ticket) el.innerHTML = `${head()}<section class="dcard bg-empty"><h2>${esc(L.errorTitle)}</h2><p>${esc(L.errorBody)}</p></section>`;
    return;
  }
  if (mine !== ticket) return;

  // An admin viewing as someone: narrow to that person's rows on screen.
  const view = viewingAsEmail?.toLowerCase() ?? null;
  const allowed = view ? new Set(d.access.filter((a) => a.email === view).map((a) => a.budget_id)) : null;
  const budgets = d.budgets
    .filter((b) => !allowed || allowed.has(b.budget_id))
    .sort((a, b) => a.location_code.localeCompare(b.location_code) || a.budget_name.localeCompare(b.budget_name));

  if (!budgets.length || !d.load) { el.innerHTML = noBudget(); return; }
  const picked = budgets.find((b) => b.budget_id === sub) ?? (budgets.length === 1 ? budgets[0] : null);
  if (!picked) { el.innerHTML = overview(budgets, d.access, d, view); return; }

  const draw = () => {
    const last = Math.min(monthsIn(d.load), 12) - 1;
    const period = periodOf(range?.from ?? 0, range?.to ?? last, d.load);
    const open = [...el.querySelectorAll("details[open]")].map((x) => x.querySelector(".bg-a-name b")?.textContent);
    el.innerHTML = detail(picked, d, period, budgets.length > 1);
    el.querySelectorAll("details").forEach((x) => { if (open.includes(x.querySelector(".bg-a-name b")?.textContent)) x.open = true; });
    const set = (from, to) => { range = { from, to }; draw(); };
    el.querySelector("[data-range=ytd]").addEventListener("click", () => set(0, last));
    el.querySelector("[data-range=full]").addEventListener("click", () => set(0, 11));
    // A start after the end pulls the other one along, so the range stays valid.
    el.querySelector("#bg-from").addEventListener("change", (e) => {
      const from = Number(e.target.value);
      set(from, Math.max(from, period.to));
    });
    el.querySelector("#bg-to").addEventListener("change", (e) => {
      const to = Number(e.target.value);
      set(Math.min(period.from, to), to);
    });
  };
  draw();
}
