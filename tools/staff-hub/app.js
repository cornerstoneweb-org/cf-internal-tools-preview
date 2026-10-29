import { CONFIG } from "./config.js";
import { CONTENT } from "./content.js";
import { CAMPUSES, TOOLS, PREVIEW_HOSTS } from "../../config/site.config.js";
import { BRAND_LIBRARY } from "./brand-library.js";
import { getSession, isStaff, displayName, userMeta, signIn, signOut, selectAll, saveMine, clearMine } from "../../shared/js/auth.js";
import { watchForNewVersion } from "../../shared/js/version-check.js";
import { toast } from "../../shared/js/ui.js";
import { mountFacilities } from "../facilities/facilities.js";
import { drawHeroPixels } from "./hero-pixels.js";

const LIB = "../../shared/assets/brand/library/";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const DAY = 86400000;
const MONTH_FMT = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
const DATE_FMT = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });

/* ================= staff values graphic ================= */
// Line icons, 24px grid, drawn with currentColor so each value's color
// carries through. Keyed by the card's `icon` field in content.js.
const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const VALUE_ICONS = {
  heart:   svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  talk:    svg('<path d="M4 5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M19 9h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-4-3h-3"/>'),
  flame:   svg('<path d="M12 21c-3.9 0-7-2.8-7-6.6 0-3.1 2.2-5.3 3.6-6.8.4 1.8 1.4 3 2.6 3.4C11 7.6 12.6 4.6 15 3c-.3 3 1.3 4.5 2.6 6 1 1.2 1.4 2.8 1.4 4.4 0 4.2-3.1 7.6-7 7.6z"/>'),
  sunrise: svg('<path d="M4 18h16M7 18a5 5 0 0 1 10 0"/><path d="M12 5v3M5.6 9.6l2 2M18.4 9.6l-2 2M3 21h18"/>'),
  sprout:  svg('<path d="M12 21v-9"/><path d="M12 12C12 8 9 6 5 6c0 4 3 6 7 6z"/><path d="M12 14c0-4 3-6 7-6 0 4-3 6-7 6z"/>'),
};
// App-icon and section glyphs, same 24px line style. Keyed by `icon` in
// content.js (quick links and sections) and CONFIG.tabs.
const ICONS = {
  mail:     svg('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>'),
  chat:     svg('<path d="M4 5h16v11H9l-5 4z"/>'),
  people:   svg('<circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9.5" r="2.4"/><path d="M3 19c.6-3.3 3-5 6-5s5.4 1.7 6 5M15 14.2c2.6-.3 4.9 1 5.5 4"/>'),
  clock:    svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>'),
  doc:      svg('<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
  person:   svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6"/>'),
  wrench:   svg('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
  requests: svg('<path d="M4 5h16v11H9l-5 4z"/><path d="M12 8v5M9.5 10.5h5"/>'),
  grid:     svg('<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>'),
  hr:       svg('<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18"/>'),
  layers:   svg('<path d="M12 3 3 8l9 5 9-5z"/><path d="m3 13 9 5 9-5"/>'),
  book:     svg('<path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5z"/><path d="M12 6v13.5"/>'),
  play:     svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9.5 4.5 2.5-4.5 2.5z"/>'),
  home:     svg('<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/>'),
  search:   svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
  chevron:  svg('<path d="m9 6 6 6-6 6"/>'),
};
const isInternal = (url) => String(url ?? "").startsWith("#");

const valueWord = (title) => String(title ?? "").replace(/^we are\s+/i, "");
const valueCards = () => sections().filter((s) => onHome(s) && s.enabled).flatMap((s) => s.cards);

function openValue(i) {
  const cards = valueCards();
  if (!cards.length) return;
  const n = (i + cards.length) % cards.length;
  const c = cards[n];
  const d = $("value-dialog");
  d.style.setProperty("--v", c.accent ?? "var(--teal)");
  d.dataset.index = n;
  d.querySelector(".vd-ic").innerHTML = VALUE_ICONS[c.icon] ?? "";
  d.querySelector(".vd-kicker").textContent = CONFIG.labels.valuesLead;
  d.querySelector(".vd-title").textContent = valueWord(c.title);
  d.querySelector(".vd-body").textContent = c.body ?? "";
  const ref = d.querySelector(".vd-ref");
  ref.textContent = c.meta ?? "";
  ref.hidden = !c.meta;
  d.querySelector(".vd-count").textContent = `${n + 1} of ${cards.length}`;
  if (!d.open) d.showModal();
}

function wireValues() {
  const d = document.createElement("dialog");
  d.id = "value-dialog";
  d.className = "vd";
  d.setAttribute("aria-labelledby", "vd-title");
  d.innerHTML = `
    <div class="vd-card">
      <button type="button" class="vd-x" data-vd="close" aria-label="Close">&times;</button>
      <div class="vd-top">
        <span class="vd-ic" aria-hidden="true"></span>
        <p class="vd-kicker"></p>
        <h2 class="vd-title" id="vd-title"></h2>
      </div>
      <p class="vd-body"></p>
      <p class="vd-ref"></p>
      <div class="vd-nav">
        <button type="button" data-vd="prev" aria-label="Previous value">&larr;</button>
        <span class="vd-count"></span>
        <button type="button" data-vd="next" aria-label="Next value">&rarr;</button>
      </div>
    </div>`;
  document.body.appendChild(d);

  $("view").addEventListener("click", (e) => {
    const b = e.target.closest(".hv-item");
    if (b) openValue(Number(b.dataset.value));
  });
  d.addEventListener("click", (e) => {
    const act = e.target.closest("[data-vd]")?.dataset.vd;
    const i = Number(d.dataset.index);
    if (act === "close" || e.target === d) d.close();
    else if (act === "prev") openValue(i - 1);
    else if (act === "next") openValue(i + 1);
  });
  d.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") openValue(Number(d.dataset.index) - 1);
    if (e.key === "ArrowRight") openValue(Number(d.dataset.index) + 1);
  });
}

/* ================= freshness ================= */
// Pure, so it can be reasoned about and tested on its own.
export function freshness(card, section, now = Date.now()) {
  const every = card.reviewEvery ?? section.reviewEvery ?? CONFIG.defaultReviewEvery;
  if (!card.reviewed) return { state: "never", label: CONFIG.labels.neverReviewed };

  const checked = new Date(card.reviewed + "T00:00:00");
  if (Number.isNaN(checked.getTime())) return { state: "never", label: CONFIG.labels.neverReviewed };

  const due = new Date(checked);
  due.setMonth(due.getMonth() + every);
  const daysLeft = Math.ceil((due.getTime() - now) / DAY);

  if (daysLeft < 0) return { state: "overdue", label: CONFIG.labels.overdue, checked };
  if (daysLeft <= CONFIG.dueSoonDays) return { state: "due-soon", label: CONFIG.labels.dueSoon, checked };
  return { state: "ok", label: `${CONFIG.labels.reviewedOn} ${MONTH_FMT.format(checked)}`, checked };
}
const needsAttention = (f) => f.state === "never" || f.state === "overdue";
const pillClass = (s) => (s === "overdue" ? "pill-warn" : s === "due-soon" ? "pill-warn" : s === "ok" ? "pill-ok" : "pill-mute");

/* ================= data helpers ================= */
// Facilities shows only when its flag in site.config.js is on, or on a
// preview host so it can still be tested. Off, its tile and route disappear
// and its Requests card reads "Coming soon".
const PREVIEW = ["localhost", "127.0.0.1", ...PREVIEW_HOSTS].includes(location.hostname);
const FACILITIES_ON = PREVIEW || TOOLS.find((t) => t.id === "facilities")?.enabled === true;
const hiddenUrl = (url) => !FACILITIES_ON && /^#\/?facilities/.test(url ?? "");
const SECTIONS = CONTENT.sections.map((s) => ({
  ...s,
  cards: s.cards.map((c) => c.links?.some((l) => hiddenUrl(l.url))
    ? { ...c, links: c.links.map((l) => hiddenUrl(l.url) ? { label: l.label, url: null, status: "pending" } : l) }
    : c),
}));
const QUICK_ACTIONS = (CONTENT.quickActions ?? []).filter((a) => !hiddenUrl(a.url));
const slug = (t) => String(t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Quick links each person can choose (2026-10-25). Only the hub's own links
// are offered, never a typed-in address, so every choice works. Picks are
// saved as these keys in the quick_link_prefs table (own row only, RLS).
// A key whose link is later removed is simply skipped.
const QUICK_MAX = 12;
const GRIP = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
let myQuick = null;   // null = the usual links from content.js
function quickCatalog() {
  const G = CONFIG.labels.quickGroups;
  const fromCards = (id, prefix, icon, group) => (sections().find((x) => x.id === id && x.enabled)?.cards ?? [])
    .map((c) => ({ c, link: (c.links ?? []).find((l) => linkStatus(l) === "ok") }))
    .filter((x) => x.link)
    .map(({ c, link }) => ({ key: `${prefix}-${slug(c.title)}`, label: c.title, note: link.label, url: link.url, icon, group }));
  return [
    ...QUICK_ACTIONS.map((a) => ({ key: a.id ?? slug(a.label), label: a.label, note: a.note ?? "", url: a.url, icon: a.icon, group: G.everyday })),
    ...fromCards("software", "sw", "grid", G.software),
    ...fromCards("requests", "rq", "requests", G.requests),
    ...liveSections().filter((x) => !onHome(x)).map((x) => ({
      key: `pg-${x.id}`, label: x.title, note: CONFIG.labels.quickPageNote, url: `#/${x.id}`, icon: x.icon in ICONS ? x.icon : "doc", group: G.pages,
    })),
  ];
}
function myQuickItems() {
  const cat = quickCatalog();
  if (!myQuick) return cat.filter((x) => x.group === CONFIG.labels.quickGroups.everyday);
  const byKey = new Map(cat.map((x) => [x.key, x]));
  return myQuick.map((k) => byKey.get(k)).filter(Boolean);
}
function appsHTML() {
  const items = myQuickItems();
  if (!items.length) return `<p class="empty-soft">${esc(CONFIG.labels.quickEmpty)}</p>`;
  return items.map((a) => {
    const out = isInternal(a.url) ? "" : ' target="_blank" rel="noopener"';
    return `<a class="app" href="${esc(a.url)}"${out}>
      <span class="app-ic" aria-hidden="true">${ICONS[a.icon] ?? ICONS.doc}</span>
      <b>${esc(a.label)}</b><span class="app-note">${esc(a.note ?? "")}</span>
    </a>`;
  }).join("");
}
const sections = () => SECTIONS;
// Each section's accent rides along as a CSS custom property, so one value in
// content.js colors the nav dot, the home card and the section page together.
const ac = (s) => s?.accent ?? "var(--sec-default)";
const liveSections = () => sections().filter((s) => s.enabled);
// Sections placed on Home have no page of their own, so they stay out of the
// nav and off the router.
const onHome = (s) => s.placement === "home";
const navSections = () =>
  sections()
    .filter((s) => !onHome(s) && s.placement !== "linked")
    .filter((s) => s.enabled || CONFIG.features.showDisabled)
    .sort((a, b) => Number(b.enabled) - Number(a.enabled));  // live first, parked last
const allCards = () => liveSections().flatMap((s) => s.cards.map((c) => ({ card: c, section: s })));
// Overdue first, then never checked. An item with a real date that has
// lapsed is a stronger signal than one nobody has gotten to yet.
const ATTENTION_ORDER = { overdue: 0, never: 1 };
const attentionList = () =>
  allCards()
    .map((x) => ({ ...x, f: freshness(x.card, x.section) }))
    .filter((x) => needsAttention(x.f))
    .sort((a, b) => (ATTENTION_ORDER[a.f.state] ?? 9) - (ATTENTION_ORDER[b.f.state] ?? 9));

function tileValue(key) {
  switch (key) {
    case "items": return String(allCards().length);
    case "needsReview": return String(attentionList().length);
    case "campuses": return String(CAMPUSES.length);
    case "keepers": return String(new Set(allCards().map(({ card }) => card.owner).filter(Boolean)).size);
    default: return "";
  }
}

const haystack = (card, section) => [
  card.title, card.body, card.meta, card.owner, section.title, card.search,
  ...(card.links ?? []).map((l) => l.label),
].filter(Boolean).join(" ").toLowerCase();

/* ================= pieces ================= */
const linkStatus = (link) => link.status ?? (link.url ? "ok" : "pending");

// A card is "coming soon" when it has links and not one of them is live.
// Nothing on it is actionable yet, so the whole card goes quiet.
const cardSoon = (card) =>
  Boolean(card.links?.length) && card.links.every((l) => linkStatus(l) !== "ok");

// primary: the card's first working link. It stretches over the whole card
// (CSS .link-primary::before), so clicking anywhere on the card opens it.
// Any other links on the card sit above that layer and still work on their own.
function linkHTML(link, primary = false) {
  const status = linkStatus(link);
  const note = link.note ? ` <span class="link-note">${esc(link.note)}</span>` : "";
  if (status === "ok") {
    const ext = /^https?:/.test(link.url);
    const dl = link.download ? ` download target="_blank" rel="noopener"` : (ext ? ' target="_blank" rel="noopener"' : "");
    return `<li><a class="link${primary ? " link-primary" : ""}${link.download ? " link-dl" : ""}" href="${esc(link.url)}"${dl}>${esc(link.label)}</a>${note}</li>`;
  }
  // Staff see one honest label. "Moving to SharePoint" is internal jargon and
  // means nothing to them; the distinction lives on the admin view.
  // The pill carries the section's accent, not a flat grey. It is the one
  // spot of colour left on a card that has gone quiet.
  return `<li><span class="link link-off">${esc(link.label)}</span> <span class="pill pill-soon">${esc(CONFIG.labels.comingSoon)}</span></li>`;
}

function cardHTML(card, section) {
  // Staff-facing cards carry no owner and no review state. That is internal
  // bookkeeping, and stale bookkeeping tells staff the wrong story. It lives
  // on the admin view instead.
  const meta = card.meta ? `<p class="card-meta">${esc(card.meta)}</p>` : "";
  const primaryIdx = (card.links ?? []).findIndex((l) => linkStatus(l) === "ok");
  const links = card.links?.length
    ? `<ul class="card-links">${card.links.map((l, i) => linkHTML(l, i === primaryIdx)).join("")}</ul>` : "";
  const soon = cardSoon(card) ? " card-soon" : "";
  const click = primaryIdx >= 0 ? " card-click" : "";
  return `<article class="card${soon}${click}" style="--sec:${ac(section)}" data-search="${esc(haystack(card, section))}">
      <h3>${esc(card.title)}</h3>
      <p class="card-body">${card.dynamic ? dynamicBody(card) : esc(card.body)}</p>
      ${meta}${links}
    </article>`;
}

function cardsHTML(section, cards = section.cards) {
  if (!cards.length) return `<p class="empty">${esc(CONFIG.labels.comingSoon)}</p>`;
  return `<div class="cards cards-${esc(section.layout)}">${cards.map((c) => cardHTML(c, section)).join("")}</div>`;
}

/* ================= views ================= */
// Picked once per visit so the greeting does not change while you click
// around. Falls back to "Hello, {name}" if the list is empty.
let greeting = null;
let firstName = "";   // set at sign-in from the Microsoft account

// "Hi, {name}" -> "Hi, Ryan", or "Hi" with no name.
function withName(text) {
  return firstName
    ? text.replaceAll("{name}", firstName)
    : text.replace(/,?\s*\{name\}/g, "");
}
function greetingText() {
  if (greeting) return greeting;
  const list = CONFIG.labels.greetings ?? [];
  greeting = list.length
    ? list[Math.floor(Math.random() * list.length)]
    : "Hello, {name}";
  return greeting;
}

function homeView() {
  const L = CONFIG.labels;
  // The dark "Connected" hero: the greeting, one line, the search, and the
  // date along the bottom. hero-pixels.js draws the pixel field
  // that gathers into the CF mark.
  const head = CONFIG.features.greeting
    ? `<section class="hero">
         <svg class="hero-pixels" aria-hidden="true"></svg>
         <div class="hero-text">
           ${heroNoticeHTML()}
           <h1>${esc(withName(greetingText()))}<br><span>${esc(L.heroWelcome)}</span></h1>
           <p class="hero-sub">${esc(L.heroLine)}</p>
           ${CONFIG.features.search ? `<label class="spot">
             ${ICONS.search}<input type="search" id="hero-q" autocomplete="off" spellcheck="false"
               placeholder="${esc(L.heroSearch ?? L.searchPlaceholder)}" aria-label="Search the hub">
           </label>` : ""}
         </div>
         <p class="hero-foot">${esc(DATE_FMT.format(new Date()))}</p>
       </section>
       <div class="hero-results" id="hero-results" aria-live="polite"></div>`
    : `<div class="welcome">
         <h1>${esc(L.welcomeTitle)}</h1>
         <p class="welcome-lede">${esc(L.welcomeLede)}</p>
         ${(L.welcomeBody ?? []).map((para) => `<p>${esc(para)}</p>`).join("")}
       </div>`;

  const blockHead = (title, subText) => `<div class="sec-head"><h2>${esc(title)}</h2>${subText ? `<p>${esc(subText)}</p>` : ""}</div>`;

  // Quick links: the person's own picks, or the usual ones. "Edit" opens
  // the picker (wireQuickEdit).
  const quick = CONFIG.features.quickActions
    ? `<section class="quick-block">
         <div class="sec-head sec-head-row"><div><h2>${esc(L.quickHeading)}</h2><p>${esc(L.quickSub)}</p></div>
           <button type="button" class="btn btn-ghost quick-edit" data-quick-edit>${esc(L.quickEdit)}</button></div>
         <div class="apps" id="apps">${appsHTML()}</div>
       </section>` : "";

  // Sections as a tile grid. The first live section gets the big tile and
  // lists what is inside it; the rest get a tile each; parked sections share
  // one quiet "coming later" tile.
  let browse = "";
  if (CONFIG.features.browse) {
    const live = navSections().filter((s) => s.enabled);
    const parked = CONFIG.features.showDisabled ? navSections().filter((s) => !s.enabled && s.teaser !== false) : [];
    const [lead, ...rest] = live;
    const tile = (s) => `<a class="bt" href="#/${esc(s.id)}" style="--sec:${ac(s)}">
        <span class="bt-ic" aria-hidden="true">${ICONS[s.icon] ?? ICONS.grid}</span>
        <span class="bt-tag">${esc(s.title)}</span>
        <h3>${esc(s.blurb)}</h3>
        <span class="bt-go">${esc(L.open)}</span>
      </a>`;
    const leadTile = lead ? `<div class="bt bt-lead" style="--sec:${ac(lead)}">
        <a class="bt-lead-head" href="#/${esc(lead.id)}">
          <span class="bt-tag">${esc(lead.title)}</span>
          <h3>${esc(lead.blurb)}</h3>
        </a>
        <ul class="bt-list">${lead.cards.map((c) => {
          const live = (c.links ?? []).find((l) => linkStatus(l) === "ok");
          if (!live) return `<li><span class="bt-row is-off">${esc(c.title)}<span class="pill pill-soon">${esc(L.comingSoon)}</span></span></li>`;
          const out = isInternal(live.url) ? "" : ' target="_blank" rel="noopener"';
          return `<li><a class="bt-row" href="${esc(live.url)}"${out}>${esc(c.title)}${ICONS.chevron}</a></li>`;
        }).join("")}</ul>
      </div>` : "";
    const later = parked.length ? `<div class="bt bt-later" aria-disabled="true" aria-label="${esc(L.laterTitle)}">
        <span class="bt-ic" aria-hidden="true">${ICONS.book}</span>
        <h3>${esc(parked.map((s) => s.title).join(", "))}</h3>
        <span class="bt-go">${esc(L.comingSoon)}</span>
      </div>` : "";
    browse = `<section class="browse-block">
        ${blockHead(L.browseHeading, L.browseSub)}
        <div class="bento">${leadTile}${rest.map(tile).join("")}${later}</div>
      </section>`;
  }

  // Staff values as five color cards. Tapping one opens the full wording
  // and scripture in a dialog.
  const homeSections = sections().filter((s) => onHome(s) && s.enabled);
  const values = homeSections.map((s) => `
    <section class="home-values" style="--sec:${ac(s)}">
      ${blockHead(L.valuesHeading, L.valuesHint)}
      <ul class="hv-row">${s.cards.map((c, i) => `
        <li><button type="button" class="hv-item" data-value="${i}" style="--v:${esc(c.accent ?? "var(--teal)")}"
            aria-haspopup="dialog" aria-label="${esc(c.title)}">
          <span class="hv-ic" aria-hidden="true">${VALUE_ICONS[c.icon] ?? ""}</span>
          <small>${esc(L.valuesLead)}</small>
          <b>${esc(valueWord(c.title))}.</b>
          ${c.short ? `<i>${esc(c.short)}</i>` : ""}
        </button></li>`).join("")}</ul>
    </section>`).join("");

  const tiles = CONFIG.features.tiles
    ? `<div class="tiles">${CONFIG.tiles.map((k) => {
        const l = CONFIG.tileLabels[k] ?? { k, n: "" };
        const v = tileValue(k);
        const warn = k === "needsReview" && v !== "0" ? " tile-warn" : "";
        return `<div class="tile${warn}"><div class="tile-k">${esc(l.k)}</div>
                <div class="tile-v">${esc(v)}</div><div class="tile-n">${esc(l.n)}</div></div>`;
      }).join("")}</div>` : "";

  let panels = "";
  if (CONFIG.features.homePanels) {
    const att = attentionList();
    const attention = `<div class="panel">
        <div class="panel-head"><h2>${esc(CONFIG.labels.attentionHeading)}</h2></div>
        ${att.length ? att.slice(0, 6).map(({ card, section, f }) =>
          `<a class="rowlink" href="#/${esc(section.id)}">
            <span class="row-main"><b>${esc(card.title)}</b>
            <span>${esc(section.title)}${card.owner ? " · " + esc(card.owner) : ""}</span></span>
            <span class="pill ${pillClass(f.state)}">${esc(f.label)}</span></a>`
        ).join("") + (att.length > 6
          ? `<p class="empty-soft">${esc(`and ${att.length - 6} more not checked yet`)}</p>` : "")
          : `<p class="empty-soft">${esc(CONFIG.labels.nothingToAttend)}</p>`}
      </div>`;
    const software = sections().find((s) => s.id === "software");
    const tools = software ? `<div class="panel">
        <div class="panel-head"><h2>${esc(CONFIG.labels.toolsHeading)}</h2>
          <a href="#/software">${esc(CONFIG.labels.seeAll)} ${software.cards.length} →</a></div>
        ${software.cards.map((c) => `
          <a class="rowlink" href="#/software">
            <span class="row-main"><b>${esc(c.title)}</b><span>${esc(CONFIG.labels.owner)} ${esc(c.owner ?? "")}</span></span>
            <span class="pill ${pillClass(freshness(c, software).state)}">${esc(freshness(c, software).label)}</span>
          </a>`).join("")}
      </div>` : "";
    panels = `<div class="cols">${tools}${attention}</div>`;
  }

  // Order: greeting, daily links, sections, then the values.
  return `${head}${quick}${browse}${values}${tiles}${panels}`;
}

function sectionView(section) {
  const empty = !section.enabled || section.cards.length === 0;
  return `<div class="page-head has-accent" style="--sec:${ac(section)}">
      <div><h1 class="page-title">${esc(section.title)}</h1>
      <p class="page-sub">${esc(section.blurb)}</p></div>
    </div>
    ${empty ? `<p class="empty">${esc(CONFIG.labels.comingSoon)}</p>` : cardsHTML(section)}`;
}

function brandView(section) {
  const b = section;
  const head = `<div class="page-head has-accent" style="--sec:${ac(section)}">
      <div><h1 class="page-title">${esc(section.title)}</h1>
      <p class="page-sub">${esc(section.blurb)}</p></div>
    </div>`;

  const canva = b.home ? `<div class="brand-lead">
      <h2>${esc(b.home.title)}</h2>
      <p>${esc(b.home.body)}</p>
      <div class="brand-lead-links">
        ${b.home.links.map((l, i) => `<a class="btn${i ? " btn-ghost" : ""}" href="${esc(l.url)}"${/^https?:/.test(l.url) ? ' target="_blank" rel="noopener"' : ""}>${esc(l.label)}</a>`).join("")}
      </div>
    </div>` : "";

  const swatch = (c) => `<button type="button" class="swatch" data-hex="${esc(c.hex)}" title="Copy ${esc(c.hex)}">
      <span class="swatch-chip" style="background:${esc(c.hex)}"></span>
      <span class="swatch-name">${esc(c.name)}</span>
      <span class="swatch-hex">${esc(c.hex)}</span>
    </button>`;

  const palette = b.palette ? `<h2 class="block-head">Colors</h2>
      <div class="swatches">${b.palette.primary.map(swatch).join("")}</div>
      <div class="swatches swatches-sec">${b.palette.secondary.map(swatch).join("")}</div>
      ${b.palette.note ? `<p class="brand-note">${esc(b.palette.note)}</p>` : ""}` : "";

  const guides = b.guides?.length ? `<h2 class="block-head">Using the marks</h2>
      <div class="cards cards-full">${b.guides.map((g) => `
        <article class="card" style="--sec:${ac(section)}">
          <h3>${esc(g.title)}</h3>
          <p class="card-body">${esc(g.body)}</p>
        </article>`).join("")}</div>` : "";

  const downloads = BRAND_LIBRARY.map((g) => `
      <h2 class="block-head">${esc(g.title)} <span class="count">${g.assets.length}</span></h2>
      <p class="brand-note brand-note-top">${esc(g.blurb)}</p>
      <div class="assets">${g.assets.map((a) => `
        <figure class="asset asset-${esc(a.variant)}">
          <div class="asset-art"><img src="${esc(LIB + (a.png ?? a.jpg))}" alt="${esc(a.name)} ${esc(a.variant)}" loading="lazy"></div>
          <figcaption>
            <b>${esc(a.name)}</b>
            <span>${esc(a.variant)}</span>
            <span class="asset-dl">
              ${a.png ? `<a href="${esc(LIB + a.png)}" download>PNG</a>` : ""}
              ${a.jpg ? `<a href="${esc(LIB + a.jpg)}" download>JPG</a>` : ""}
            </span>
          </figcaption>
        </figure>`).join("")}</div>`).join("");

  return head + canva + palette + guides
    + `<h2 class="block-head">Download</h2>
       <p class="brand-note brand-note-top">Web resolution, 1200px wide. PNG has a transparent background. Enough for slides, documents and most print.</p>`
    + downloads;
}

/* ================= staff directory ================= */
// People come from the locked staff_directory table after sign-in.
let STAFF = [];
const campusOf = (code) => CONFIG.campuses?.[code] ?? { label: code, color: "var(--slate)" };
const personName = (p) => `${p.first_name} ${p.last_name}`;
const teams = (kind, email) => `https://teams.microsoft.com/l/${kind}/0/0?users=${encodeURIComponent(email)}`;

function staffLinks(p) {
  return [
    { label: CONFIG.labels.dirChatLong, url: teams("chat", p.email) },
    { label: CONFIG.labels.dirCallLong, url: teams("call", p.email) },
    { label: CONFIG.labels.dirEmail, url: `mailto:${p.email}` },
  ];
}

// People also become cards in the Staff Directory section, so the global
// search finds them ("Dennis", "facilities") like any other card.
function loadStaff(rows) {
  STAFF = rows.slice().sort((a, b) =>
    a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name));
  const section = sections().find((s) => s.id === "directory");
  if (!section) return;
  section.cards = STAFF.map((p) => ({
    title: personName(p), body: p.title ?? "", meta: campusOf(p.campus_code).label,
    owner: "HR", reviewed: null, generated: true, links: staffLinks(p),
  }));
}

const ICON_CHAT = svg('<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z"/>');
const ICON_CALL = svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>');
const ICON_MAIL = svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>');

function directoryView(section) {
  const codes = [...new Set(STAFF.map((p) => p.campus_code))]
    .sort((a, b) => campusOf(a).label.localeCompare(campusOf(b).label));
  const people = STAFF.map((p) => {
    const c = campusOf(p.campus_code);
    const q = `${personName(p)} ${p.title ?? ""} ${c.label}`.toLowerCase();
    return `<li class="person" data-campus="${esc(p.campus_code)}" data-q="${esc(q)}" style="--camp:${esc(c.color)}">
      <span class="person-av" aria-hidden="true">${esc((p.first_name[0] + p.last_name[0]).toUpperCase())}</span>
      <span class="person-main">
        <b>${esc(personName(p))}</b>
        <span class="person-title">${esc(p.title ?? "")}</span>
        <span class="person-camp">${esc(c.label)}</span>
      </span>
      <span class="person-acts">
        <a href="${esc(teams("chat", p.email))}" target="_blank" rel="noopener" title="${esc(CONFIG.labels.dirChatLong)}" aria-label="${esc(CONFIG.labels.dirChatLong + " with " + personName(p))}">${ICON_CHAT}<span>${esc(CONFIG.labels.dirChat)}</span></a>
        <a href="${esc(teams("call", p.email))}" target="_blank" rel="noopener" title="${esc(CONFIG.labels.dirCallLong)}" aria-label="${esc(CONFIG.labels.dirCallLong + " " + personName(p))}">${ICON_CALL}<span>${esc(CONFIG.labels.dirCall)}</span></a>
        <a href="mailto:${esc(p.email)}" title="${esc(p.email)}" aria-label="${esc("Email " + personName(p))}">${ICON_MAIL}<span>${esc(CONFIG.labels.dirEmail)}</span></a>
      </span>
    </li>`;
  }).join("");
  const parent = section.parent ? sections().find((x) => x.id === section.parent) : null;
  const back = parent ? `<a class="back-link" href="#/${esc(parent.id)}">← ${esc(parent.title)}</a>` : "";
  return `${back}<div class="page-head has-accent" style="--sec:${ac(section)}">
      <div><h1 class="page-title">${esc(section.title)}</h1>
      <p class="page-sub">${esc(section.blurb)}</p></div>
    </div>
    <div class="dir-tools">
      <input type="search" id="dir-q" class="dir-q" placeholder="${esc(CONFIG.labels.dirSearch)}" aria-label="${esc(CONFIG.labels.dirSearch)}" autocomplete="off">
      <div class="dir-chips" role="group" aria-label="Campus">
        <button type="button" class="chip is-on" data-campus="">${esc(CONFIG.labels.dirAll)}</button>
        ${codes.map((c) => `<button type="button" class="chip" data-campus="${esc(c)}" style="--camp:${esc(campusOf(c).color)}">${esc(campusOf(c).label)}</button>`).join("")}
      </div>
    </div>
    <p class="dir-count" id="dir-count" aria-live="polite"></p>
    <ul class="people" id="dir-list">${people}</ul>
    <p class="empty" id="dir-none" hidden>${esc(CONFIG.labels.dirNone)}</p>`;
}

function wireDirectory() {
  const q = $("dir-q"); if (!q) return;
  let campus = "";
  const apply = () => {
    const term = q.value.trim().toLowerCase();
    let n = 0;
    for (const li of $("dir-list").children) {
      const show = (!campus || li.dataset.campus === campus) && (!term || li.dataset.q.includes(term));
      li.hidden = !show; if (show) n++;
    }
    $("dir-count").textContent = CONFIG.labels.dirCount(n);
    $("dir-none").hidden = n > 0;
  };
  q.addEventListener("input", apply);
  document.querySelectorAll(".dir-chips .chip").forEach((b) => b.addEventListener("click", () => {
    campus = b.dataset.campus;
    document.querySelectorAll(".dir-chips .chip").forEach((x) => x.classList.toggle("is-on", x === b));
    apply();
  }));
  apply();
}

/* ================= HR dates (pay dates, holidays) ================= */
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const LONG_DAY = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
const SHORT_DAY = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const fmtLong = (s) => LONG_DAY.format(parseYmd(s));
const fmtShort = (s) => SHORT_DAY.format(parseYmd(s));
function daysUntil(s) {
  const today = parseYmd(ymd(new Date()));
  return Math.round((parseYmd(s) - today) / DAY);
}
const inDays = (n) => (n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`);
const nextOf = (rows) => rows.find((r) => r[0] >= ymd(new Date())) ?? null;

// Holidays next to each other (Thanksgiving + day after) read as one closure.
function nextClosure() {
  const rows = CONTENT.holidays ?? [];
  const i = rows.findIndex((r) => r[0] >= ymd(new Date()));
  if (i < 0) return null;
  let end = i;
  while (end + 1 < rows.length && daysBetween(rows[end][0], rows[end + 1][0]) <= 3
    && sameName(rows[i][1], rows[end + 1][1])) end++;
  return { start: rows[i][0], end: rows[end][0], name: rows[i][1] };
}
const daysBetween = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / DAY);
const sameName = (a, b) => b.toLowerCase().includes(a.split(" ")[0].toLowerCase());

function dynamicBody(card) {
  if (card.dynamic === "nextPayday") {
    const n = nextOf(CONTENT.payDates ?? []);
    return n ? `Next payday: <b>${esc(fmtLong(n[0]))}</b> <span class="soft">(${esc(inDays(daysUntil(n[0])))})</span>`
             : esc(card.body);
  }
  if (card.dynamic === "nextHoliday") {
    const c = nextClosure();
    if (!c) return esc(card.body);
    const when = c.start === c.end ? fmtLong(c.start) : `${fmtShort(c.start)} to ${fmtShort(c.end)}`;
    return `Next closure: <b>${esc(c.name)}</b>, ${esc(when)} <span class="soft">(${esc(inDays(daysUntil(c.start)))})</span>`;
  }
  return esc(card.body);
}

function datesPage(section, headers, rows, pdf) {
  const parent = sections().find((x) => x.id === section.parent);
  const today = ymd(new Date());
  const nextIdx = rows.findIndex((r) => r.key >= today);
  return `${parent ? `<a class="back-link" href="#/${esc(parent.id)}">← ${esc(parent.title)}</a>` : ""}
    <div class="page-head has-accent" style="--sec:${ac(section)}">
      <div><h1 class="page-title">${esc(section.title)}</h1>
      <p class="page-sub">${esc(section.blurb)}</p></div>
      ${pdf ? `<a class="btn btn-ghost dl-btn" href="${esc(pdf)}" download target="_blank" rel="noopener">Download PDF</a>` : ""}
    </div>
    ${rows.some((r) => r.key < today) ? `<button type="button" class="linkish past-toggle" id="past-toggle">Show earlier dates (${rows.filter((r) => r.key < today).length})</button>` : ""}
    <table class="dates hide-past" id="dates">
      <thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r, i) => `<tr class="${r.key < today ? "is-past" : ""}${i === nextIdx ? " is-next" : ""}">
        ${r.cells.map((c, j) => `<td>${j === 0 && i === nextIdx ? `<span class="next-tag">Next</span> ` : ""}${esc(c)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>`;
}

// Upcoming dates first; earlier ones fold away behind a toggle.
function wireDates() {
  const b = $("past-toggle"); if (!b) return;
  const label = b.textContent;
  b.addEventListener("click", () => {
    const hidden = $("dates").classList.toggle("hide-past");
    b.textContent = hidden ? label : "Hide earlier dates";
  });
}

const LABOR_DIR = "../../shared/assets/docs/labor-law/";
const ICON_DL = svg('<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>');

function laborLawView(section) {
  const parent = sections().find((x) => x.id === section.parent);
  const groups = [...new Set((CONTENT.laborNotices ?? []).map((n) => n.group))];
  return `${parent ? `<a class="back-link" href="#/${esc(parent.id)}">← ${esc(parent.title)}</a>` : ""}
    <div class="page-head has-accent" style="--sec:${ac(section)}">
      <div><h1 class="page-title">${esc(section.title)}</h1>
      <p class="page-sub">${esc(section.blurb)}</p></div>
    </div>
    ${groups.map((g) => `
      <h2 class="block-head">${esc(g)}</h2>
      <ul class="docs">${CONTENT.laborNotices.filter((n) => n.group === g).map((n) => `
        <li><a class="doc" href="${esc(LABOR_DIR + n.file)}" target="_blank" rel="noopener" download>
          <span class="doc-main"><b>${esc(n.title)}</b><span>${esc(n.agency)}</span></span>
          <span class="doc-dl" aria-hidden="true">${ICON_DL}<span>PDF</span></span>
        </a></li>`).join("")}
      </ul>`).join("")}`;
}

function payDatesView(section) {
  const rows = (CONTENT.payDates ?? []).map(([pay, a, b]) => ({
    key: pay, cells: [fmtLong(pay), `${fmtShort(a)} to ${fmtShort(b)}`],
  }));
  return datesPage(section, ["Payday", "Pay period"], rows, CONTENT.hrDocs?.payDatesPdf);
}
function holidaysView(section) {
  const rows = (CONTENT.holidays ?? []).map(([d, name]) => ({ key: d, cells: [fmtLong(d), name] }));
  return datesPage(section, ["Date", "Holiday"], rows, CONTENT.hrDocs?.holidaysPdf);
}

/* ================= employee handbook ================= */
// Sections come from the locked handbook_sections table after sign-in.
let HANDBOOK = [];

// The PDF's headings are ALL CAPS. Shown as title case, keeping acronyms.
const KEEP_CAPS = new Set(["PTO", "FMLA", "CFRA", "COBRA", "HIPPA", "HIPAA", "PDL", "IRS", "W-2"]);
const SMALL = new Set(["and", "of", "or", "the", "for", "on", "to", "from", "with", "in", "at", "by", "a", "an"]);
function niceTitle(t) {
  if (/[a-z]/.test(t)) return t;
  return t.split(" ").map((w, i) => {
    const bare = w.replace(/[^A-Z0-9-]/g, "");
    if (KEEP_CAPS.has(bare) || /\d/.test(w)) return w;
    const lw = w.toLowerCase();
    if (i > 0 && SMALL.has(lw)) return lw;
    return lw.replace(/^(\W*)(\w)/, (m, a, b) => a + b.toUpperCase());
  }).join(" ");
}

// Sections also become cards in the Handbook section, so the main search
// finds "mileage" and points at Expense Reimbursement. Headings with no text
// of their own (like "Character & Conduct") are skipped as results.
function loadHandbook(rows) {
  HANDBOOK = rows.slice().sort((a, b) => a.sort_order - b.sort_order)
    .map((r) => ({ ...r, nice: niceTitle(r.title) }));
  const section = sections().find((s) => s.id === "handbook");
  if (!section) return;
  section.cards = HANDBOOK.filter((r) => r.body).map((r) => ({
    title: r.nice, body: snippet(r.body), meta: CONFIG.labels.hbPage(r.page), search: r.body,
    owner: "Bou", reviewed: null, generated: true,
    links: [{ label: "Read this section", url: `#/handbook/${r.sort_order}` }],
  }));
}
const flat = (t) => t.replace(/[•\s]+/g, " ").trim();
function snippet(body, n = 140) {
  const t = flat(body);
  return t.length > n ? t.slice(0, t.lastIndexOf(" ", n)) + "…" : t;
}

// Wraps every match of term in <mark>. Everything else is escaped.
function hl(text, term) {
  if (!term) return esc(text);
  const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  let out = "", last = 0;
  for (const m of text.matchAll(re)) {
    out += esc(text.slice(last, m.index)) + `<mark>${esc(m[0])}</mark>`;
    last = m.index + m[0].length;
  }
  return out + esc(text.slice(last));
}

// Body text is plain: blank lines split paragraphs, "•" marks a bullet (the
// PDF extraction leaves stray ones, so runs of them collapse to one).
function hbBodyHTML(body, term) {
  const t = body.replace(/(?:\s*•)+\s*\n\n/g, "\n\n• ").replace(/^\n\n/, "");
  const paras = t.split(/\n{2,}/).map((x) => x.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
  let html = "", list = [];
  const flush = () => { if (list.length) { html += `<ul>${list.join("")}</ul>`; list = []; } };
  for (const p of paras) {
    if (p.startsWith("•")) list.push(`<li>${hl(p.replace(/^[•\s]+/, ""), term)}</li>`);
    else { flush(); html += `<p>${hl(p.replace(/[\s•]+$/, ""), term)}</p>`; }
  }
  flush();
  return html;
}

function handbookView(section) {
  const parent = sections().find((x) => x.id === section.parent);
  const pdf = CONTENT.hrDocs?.handbookPdf;
  const edition = HANDBOOK[0]?.edition;
  const items = HANDBOOK.map((r) => {
    const q = `${r.title} ${flat(r.body)}`.toLowerCase();
    const head = `<span class="hb-t">${esc(r.nice)}</span><span class="hb-p">${esc(CONFIG.labels.hbPage(r.page))}</span>`;
    return r.body
      ? `<li class="hb-item lvl-${r.level}" id="hb-${r.sort_order}" data-q="${esc(q)}">
          <details><summary>${head}</summary><div class="hb-body" data-i="${r.sort_order}"></div></details></li>`
      : `<li class="hb-item hb-group lvl-${r.level}" id="hb-${r.sort_order}" data-q="${esc(q)}"><div class="hb-head">${head}</div></li>`;
  }).join("");
  return `${parent ? `<a class="back-link" href="#/${esc(parent.id)}">← ${esc(parent.title)}</a>` : ""}
    <div class="page-head has-accent" style="--sec:${ac(section)}">
      <div><h1 class="page-title">${esc(section.title)}</h1>
      <p class="page-sub">${esc(section.blurb)}</p></div>
      ${pdf ? `<a class="btn btn-ghost dl-btn" href="${esc(pdf)}" target="_blank" rel="noopener">${esc(CONFIG.labels.hbPdf)}</a>` : ""}
    </div>
    ${HANDBOOK.length ? `
    <div class="dir-tools hb-tools">
      <input type="search" id="hb-q" class="dir-q" placeholder="${esc(CONFIG.labels.hbSearch)}" aria-label="Search the handbook" autocomplete="off">
      <button type="button" class="chip" id="hb-all">${esc(CONFIG.labels.hbExpand)}</button>
    </div>
    <p class="dir-count" id="hb-count" aria-live="polite"></p>
    <ol class="hb" id="hb-list">${items}</ol>
    <p class="empty" id="hb-none" hidden>${esc(CONFIG.labels.hbNone)}</p>
    ${edition ? `<p class="hb-edition">${esc(CONFIG.labels.hbEdition(edition))}</p>` : ""}`
    : `<p class="empty">${esc(CONFIG.labels.comingSoon)}</p>`}`;
}

function wireHandbook(openId) {
  const q = $("hb-q"); if (!q) return;
  const byId = new Map(HANDBOOK.map((r) => [String(r.sort_order), r]));
  const fill = (li, term) => {
    const box = li.querySelector(".hb-body");
    if (box) box.innerHTML = hbBodyHTML(byId.get(box.dataset.i).body, term);
  };
  // Text is drawn when a section opens, not up front: 119 sections is a lot of DOM.
  for (const d of document.querySelectorAll("#hb-list details")) {
    d.addEventListener("toggle", () => { if (d.open) fill(d.parentElement, q.value.trim()); });
  }
  let timer = null;
  const apply = () => {
    const raw = q.value.trim(), term = raw.toLowerCase();
    let n = 0;
    const items = [...$("hb-list").children];
    for (const li of items) {
      const hit = !term || li.dataset.q.includes(term);
      li.hidden = !hit;
      if (hit && !li.classList.contains("hb-group")) n++;
      const d = li.querySelector("details");
      if (!d) continue;
      d.open = Boolean(term) && hit && n <= 25;   // open the first 25 matches
      if (d.open) fill(li, raw);
      const t = li.querySelector(".hb-t");
      t.innerHTML = hl(byId.get(li.id.slice(3)).nice, raw);
    }
    // Keep a heading visible when one of its sub-sections matches.
    let group = null;
    for (const li of items) {
      if (li.classList.contains("lvl-0")) group = li;
      else if (!li.hidden && group) group.hidden = false;
    }
    $("hb-count").textContent = CONFIG.labels.hbCount(n, raw);
    $("hb-none").hidden = n > 0;
  };
  q.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(apply, 120); });
  $("hb-all").addEventListener("click", () => {
    const ds = [...document.querySelectorAll("#hb-list li:not([hidden]) details")];
    const open = !ds.every((d) => d.open);
    ds.forEach((d) => { d.open = open; });
    $("hb-all").textContent = open ? CONFIG.labels.hbCollapse : CONFIG.labels.hbExpand;
  });
  apply();
  // #/handbook/42 opens section 42 and scrolls to it (from a search result).
  const target = openId != null && $("hb-" + openId);
  if (target) {
    const d = target.querySelector("details");
    if (d) { d.open = true; fill(target, ""); }
    target.classList.add("is-target");
    requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  }
}

function searchView(q) {
  const hits = allCards().filter(({ card, section }) => haystack(card, section).includes(q));
  if (!hits.length) {
    return `<h1 class="page-title">${esc(CONFIG.labels.noResults)}</h1>
      <p class="page-sub">${esc(CONFIG.labels.noResultsHint)}</p>
      <p class="ask">Still stuck? <a href="mailto:${esc(CONTENT.contact.email)}?subject=${encodeURIComponent("Staff Hub: I looked for \"" + q + "\"")}">Tell ${esc(CONTENT.contact.name)} what you were looking for</a>. That is how the hub gets better.</p>`;
  }
  const byId = new Map();
  for (const h of hits) {
    if (!byId.has(h.section.id)) byId.set(h.section.id, { section: h.section, cards: [] });
    byId.get(h.section.id).cards.push(h.card);
  }
  return `<h1 class="page-title">${esc(CONFIG.labels.resultsFor(q, hits.length))}</h1>
    ${[...byId.values()].map(({ section, cards }) => `
      <h2 class="block-head">${esc(section.title)}</h2>${cardsHTML(section, cards)}`).join("")}`;
}

/* ================= admin drift report ================= */
const UNLOCK_KEY = "cf-staffhub-admin";

async function sha256(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const isUnlocked = () => {
  if (CONFIG.admin.gate !== "passphrase") return true;
  try { return sessionStorage.getItem(UNLOCK_KEY) === "1"; } catch { return false; }
};

// Everything an admin would want flagged, in one pass over the content.
export function drift() {
  const overdue = [], never = [], dead = [], empty = [], parked = [];
  for (const s of sections()) {
    if (!s.enabled && s.cards.length > 0) { parked.push({ section: s }); continue; }
    if (!s.enabled || s.cards.length === 0) { empty.push({ section: s }); continue; }
    for (const c of s.cards) {
      if (c.generated) continue;   // built from data at sign-in; reviewed at the source
      const f = freshness(c, s);
      if (f.state === "overdue") overdue.push({ card: c, section: s, f });
      else if (f.state === "never") never.push({ card: c, section: s, f });
      for (const l of c.links ?? []) {
        const st = l.status ?? (l.url ? "ok" : "pending");
        if (st !== "ok") dead.push({ card: c, section: s, link: l, status: st });
      }
    }
  }
  const age = (x) => (x.f.checked ? Math.floor((Date.now() - x.f.checked.getTime()) / DAY) : 0);
  overdue.sort((a, b) => age(b) - age(a));
  return { overdue, never, dead, empty, parked,
    total: overdue.length + never.length + dead.length + empty.length + parked.length };
}

function driftRow(title, section, owner, right, tone) {
  return `<div class="drift-row">
      <span class="row-main"><b>${esc(title)}</b>
      <span>${esc(section)}${owner ? " · " + esc(owner) : ""}</span></span>
      <span class="pill ${esc(tone)}">${esc(right)}</span>
    </div>`;
}

function driftGroup(heading, rows) {
  if (!rows.length) return "";
  return `<h2 class="block-head">${esc(heading)} <span class="count">${rows.length}</span></h2>
    <div class="drift">${rows.join("")}</div>`;
}

function adminView() {
  const a = CONFIG.admin;
  if (!a.enabled) return homeView();

  if (a.gate === "passphrase" && !isUnlocked()) {
    if (!a.passphraseHash) {
      return `<h1 class="page-title">${esc(CONFIG.labels.adminNoHash)}</h1>
        <p class="page-lede">${esc(CONFIG.labels.adminNoHashHint)}</p>`;
    }
    return `<div class="gate">
        <h1 class="page-title">${esc(CONFIG.labels.adminLocked)}</h1>
        <p class="page-sub">${esc(CONFIG.labels.adminLockedHint)}</p>
        <form id="gate-form" autocomplete="off">
          <input type="password" id="gate-input" aria-label="Passphrase" autocomplete="current-password">
          <button class="btn" type="submit">${esc(CONFIG.labels.adminUnlock)}</button>
        </form>
        <p class="gate-err" id="gate-err" hidden>${esc(CONFIG.labels.adminWrong)}</p>
      </div>`;
  }

  const d = drift();
  const head = `<div class="page-head">
      <div><h1 class="page-title">${esc(CONFIG.labels.adminTitle)}</h1>
      <p class="page-sub">${esc(CONFIG.labels.adminLede)}</p></div>
      ${a.gate === "passphrase" ? `<button class="btn btn-ghost" id="gate-lock">${esc(CONFIG.labels.adminLock)}</button>` : ""}
    </div>`;

  if (d.total === 0) {
    return head + `<p class="empty-soft">${esc(CONFIG.labels.adminClean)}</p>`;
  }

  const fmtAge = (x) => {
    if (!x.f.checked) return CONFIG.labels.overdue;
    const days = Math.floor((Date.now() - x.f.checked.getTime()) / DAY);
    const months = Math.round(days / 30);
    return months >= 12 ? `${Math.floor(months / 12)}y ${months % 12}m ago` : `${months}m ago`;
  };

  return head
    + driftGroup(CONFIG.labels.groupOverdue,
        d.overdue.map((x) => driftRow(x.card.title, x.section.title, x.card.owner, fmtAge(x), "pill-warn")))
    + driftGroup(CONFIG.labels.groupDead,
        d.dead.map((x) => driftRow(`${x.card.title}: ${x.link.label}`, x.section.title, x.card.owner,
          x.status === "sharepoint" ? "SharePoint" : "No link", "pill-warn")))
    + driftGroup(CONFIG.labels.groupParked,
        d.parked.map((x) => driftRow(x.section.title, "Built, switched off", null,
          `${x.section.cards.length} ready`, "pill-mute")))
    + driftGroup(CONFIG.labels.groupEmpty,
        d.empty.map((x) => driftRow(x.section.title, "Section", null, "Empty", "pill-mute")))
    + driftGroup(CONFIG.labels.groupNever,
        d.never.map((x) => driftRow(x.card.title, x.section.title, x.card.owner, "Not checked", "pill-mute")))
    + `<p class="empty-soft">${esc(CONFIG.labels.adminHowTo)}</p>`;
}

/* ================= quick links editor ================= */
function wireQuickEdit() {
  const L = CONFIG.labels;
  const d = document.createElement("dialog");
  d.className = "qe";
  d.setAttribute("aria-labelledby", "qe-title");
  document.body.appendChild(d);
  let draft = [];

  // Drag the handle to reorder (mouse or finger). With a keyboard, focus the
  // handle and use the up and down arrow keys.
  const row = (x, i) => `<li data-key="${esc(x.key)}">
      <button type="button" class="qe-grip" data-i="${i}" aria-label="${esc(L.quickMove(x.label))}">${GRIP}</button>
      <span class="qe-ic" aria-hidden="true">${ICONS[x.icon] ?? ICONS.doc}</span>
      <span class="qe-name"><b>${esc(x.label)}</b><small>${esc(x.note)}</small></span>
      <button type="button" data-qe="remove" data-i="${i}" aria-label="${esc(L.quickRemove(x.label))}">&times;</button>
    </li>`;
  function draw() {
    const cat = quickCatalog();
    const byKey = new Map(cat.map((x) => [x.key, x]));
    const chosen = draft.map((k) => byKey.get(k)).filter(Boolean);
    const full = chosen.length >= QUICK_MAX;
    const groups = [...new Set(cat.map((x) => x.group))];
    d.innerHTML = `<div class="qe-card">
        <div class="qe-head"><h2 id="qe-title">${esc(L.quickEditTitle)}</h2>
          <button type="button" class="qe-x" data-qe="cancel" aria-label="${esc(L.quickCancel)}">&times;</button></div>
        <p class="qe-help">${esc(L.quickEditHelp(QUICK_MAX))}</p>
        <h3>${esc(L.quickShowing)} <span>${chosen.length}/${QUICK_MAX}</span></h3>
        ${chosen.length ? `<ol class="qe-chosen">${chosen.map((x, i) => row(x, i)).join("")}</ol>`
          : `<p class="empty-soft">${esc(L.quickNone)}</p>`}
        <h3>${esc(L.quickAdd)}</h3>
        ${groups.map((g) => {
          const left = cat.filter((x) => x.group === g && !draft.includes(x.key));
          return left.length ? `<p class="qe-group">${esc(g)}</p><ul class="qe-pool">${left.map((x) => `<li>
              <button type="button" data-qe="add" data-key="${esc(x.key)}" ${full ? "disabled" : ""}>
                <span class="qe-ic" aria-hidden="true">${ICONS[x.icon] ?? ICONS.doc}</span>
                <span class="qe-name"><b>${esc(x.label)}</b><small>${esc(x.note)}</small></span>
                <span class="qe-plus" aria-hidden="true">+</span><span class="vh">${esc(L.quickAddOne)}</span>
              </button></li>`).join("")}</ul>` : "";
        }).join("")}
        <div class="qe-foot">
          <button type="button" class="qe-reset" data-qe="reset">${esc(L.quickReset)}</button>
          <button type="button" class="btn btn-ghost" data-qe="cancel">${esc(L.quickCancel)}</button>
          <button type="button" class="btn" data-qe="save">${esc(L.quickSave)}</button>
        </div>
      </div>`;
  }
  const refresh = () => { const a = $("apps"); if (a) a.innerHTML = appsHTML(); };

  $("view").addEventListener("click", (e) => {
    if (!e.target.closest("[data-quick-edit]")) return;
    draft = myQuickItems().map((x) => x.key);
    draw();
    d.showModal();
  });
  d.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-qe]");
    if (!b) { if (e.target === d) d.close(); return; }
    const i = Number(b.dataset.i);
    switch (b.dataset.qe) {
      case "add": if (draft.length < QUICK_MAX) draft.push(b.dataset.key); break;
      case "remove": draft.splice(i, 1); break;
      case "cancel": d.close(); return;
      case "reset":
      case "save": {
        b.disabled = true;
        try {
          if (b.dataset.qe === "reset") { await clearMine("quick_link_prefs"); myQuick = null; }
          else { await saveMine("quick_link_prefs", { links: draft }); myQuick = [...draft]; }
          refresh();
          d.close();
          toast(L.quickSaved);
        } catch (err) {
          console.warn("[hub] quick links", err);
          toast(L.quickSaveFailed);
          b.disabled = false;
        }
        return;
      }
      default: return;
    }
    // Keep focus nearby after a redraw so keyboard users are not lost.
    draw();
    (b.dataset.qe === "remove" && d.querySelector(`[data-qe="remove"][data-i="${Math.min(i, draft.length - 1)}"]`)
      || d.querySelector(".qe-chosen li:last-child [data-qe=remove]") || d.querySelector(".qe-x"))?.focus();
  });

  // Keyboard reordering on the grip.
  d.addEventListener("keydown", (e) => {
    const g = e.target.closest(".qe-grip");
    if (!g || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    const i = Number(g.dataset.i), j = e.key === "ArrowUp" ? i - 1 : i + 1;
    if (j < 0 || j >= draft.length) return;
    [draft[i], draft[j]] = [draft[j], draft[i]];
    draw();
    d.querySelector(`.qe-grip[data-i="${j}"]`)?.focus();
  });

  // Drag and drop with pointer events, so it works with a mouse and on phones.
  let drag = null;
  d.addEventListener("pointerdown", (e) => {
    const g = e.target.closest(".qe-grip");
    if (!g) return;
    e.preventDefault();
    const li = g.closest("li");
    const box = li.getBoundingClientRect();
    drag = { li, list: li.parentElement, startY: e.clientY, offset: e.clientY - box.top };
    li.classList.add("is-dragging");
    g.setPointerCapture(e.pointerId);
  });
  d.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const { li, list } = drag;
    li.style.transform = `translateY(${e.clientY - drag.startY}px)`;
    // Step the row past each neighbour whose middle the pointer has crossed.
    for (let moved = true; moved;) {
      moved = false;
      const prev = li.previousElementSibling, next = li.nextElementSibling;
      const mid = (el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
      const top = li.offsetTop;
      if (prev && e.clientY < mid(prev)) { list.insertBefore(li, prev); moved = true; }
      else if (next && e.clientY > mid(next)) { list.insertBefore(li, next.nextSibling); moved = true; }
      if (moved) {
        drag.startY += li.offsetTop - top;
        li.style.transform = `translateY(${e.clientY - drag.startY}px)`;
      }
    }
  });
  const endDrag = () => {
    if (!drag) return;
    draft = [...drag.list.children].map((x) => x.dataset.key);
    drag = null;
    draw();
  };
  d.addEventListener("pointerup", endDrag);
  d.addEventListener("pointercancel", endDrag);
}

/* ================= announcement ================= */
const KEY = "cf-staffhub-dismissed";
const ICON_ANN = svg('<path d="M4 10v4a1 1 0 0 0 1 1h2l6 4V5L7 9H5a1 1 0 0 0-1 1z"/><path d="M16.5 9a4 4 0 0 1 0 6"/><path d="M19 6.5a7.5 7.5 0 0 1 0 11"/>');
const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h); };

// The current announcement, or null when there is none, it has expired, or
// this person dismissed it.
function activeAnnouncement() {
  const a = CONTENT.announcement;
  if (!CONFIG.features.announcement || !a?.text) return null;
  if (a.until) {
    const until = new Date(a.until + "T23:59:59");
    if (!Number.isNaN(until.getTime()) && Date.now() > until.getTime()) return null;
  }
  const id = hash(a.text + (a.link ?? ""));
  try { if (localStorage.getItem(KEY) === id) return null; } catch { /* show it */ }
  const level = a.level === "urgent" ? "urgent" : "info";
  const tag = a.label ?? (level === "urgent" ? CONFIG.labels.annUrgent : CONFIG.labels.annInfo);
  return { a, id, level, tag };
}

// Info notices live in the Home hero (heroNoticeHTML). The banner across the
// top is for urgent ones, or for any notice when the hero is off.
function announcementHTML() {
  const n = activeAnnouncement();
  if (!n || (n.level === "info" && CONFIG.features.greeting)) return "";
  const cta = n.a.link ? `<a class="ann-cta" href="${esc(n.a.link)}">${esc(n.a.linkLabel ?? "Details")}</a>` : "";
  return `<div class="ann ann-${n.level}" id="ann" data-id="${esc(n.id)}" role="status">
      <span class="ann-ic" aria-hidden="true">${ICON_ANN}</span>
      <div class="ann-body"><span class="ann-tag">${esc(n.tag)}</span><p>${esc(n.a.text)}</p></div>
      ${cta}
      <button type="button" id="ann-x" aria-label="Dismiss">&times;</button>
    </div>`;
}

// A bright badge at the top of the hero text: the event's short name and
// day, fading in once the CF mark has gathered. Tap it for the full notice.
function heroNoticeHTML() {
  const n = activeAnnouncement();
  if (!n || n.level !== "info") return "";
  const short = n.a.title ? `${n.a.title}${n.a.when ? ` · ${n.a.when}` : ""}` : n.a.text;
  const cta = n.a.link ? `<a class="hn-cta" href="${esc(n.a.link)}">${esc(n.a.linkLabel ?? "Details")}</a>` : "";
  return `<details class="hero-note" data-id="${esc(n.id)}">
      <summary><span class="hn-ic" aria-hidden="true">${ICON_ANN}</span><span class="hn-text">${esc(short)}</span><span class="hn-more">${esc(CONFIG.labels.annMore)}</span></summary>
      <div class="hn-panel">
        <span class="hn-tag">${esc(n.tag)}</span>
        <p>${esc(n.a.text)}</p>
        <div class="hn-act">${cta}<button type="button" class="hn-x">${esc(CONFIG.labels.annHide)}</button></div>
      </div>
    </details>`;
}

/* ================= shell ================= */
function renderNav(active) {
  // Top nav: Home plus every live section. Parked sections are not listed
  // here; they show on Home in the "Coming later" tile.
  const items = [`<a href="#/home"${active === "home" ? ' class="is-active"' : ""}>Home</a>`];
  for (const s of navSections().filter((x) => x.enabled)) {
    const cls = active === s.id ? ' class="is-active"' : "";
    items.push(`<a href="#/${esc(s.id)}"${cls} style="--sec:${ac(s)}"${active === s.id ? ' aria-current="page"' : ""}>${esc(s.title)}</a>`);
  }
  $("nav").innerHTML = items.join("");
  renderTabs(active);
}

// Phone tab bar. A tab is active for its own page and for pages filed under
// it (Pay Dates lights up HR), unless that page has a tab of its own.
function renderTabs(active) {
  const bar = $("tabbar");
  if (!bar) return;
  const hash = (location.hash.replace(/^#\/?/, "") || "home").toLowerCase().split("/")[0];
  const tabIds = (CONFIG.tabs ?? []).map((t) => t.id).filter(Boolean);
  const current = tabIds.includes(hash) ? hash : active;
  const searching = document.body.classList.contains("search-open");
  bar.innerHTML = (CONFIG.tabs ?? []).map((t) => {
    if (t.search) {
      return `<button type="button" data-open-search class="${searching ? "is-active" : ""}">${ICONS[t.icon] ?? ""}${esc(t.label)}</button>`;
    }
    const on = !searching && current === t.id;
    return `<a href="#/${esc(t.id)}"${on ? ' class="is-active" aria-current="page"' : ""}>${ICONS[t.icon] ?? ""}${esc(t.label)}</a>`;
  }).join("");
}

/* ================= search panel ================= */
// Search drops out of the nav bar like Spotlight. Opening it focuses the box;
// closing it clears the box and puts the page back.
function openSearch() {
  if (!CONFIG.features.search) return;
  // On Home the hero has a real search box, so use it instead of dropping
  // the nav panel. Results show right under the hero.
  const hero = $("hero-q");
  if (hero && !document.body.classList.contains("search-open")) {
    hero.focus();
    hero.scrollIntoView({ block: "center", behavior: "smooth" });
    return;
  }
  document.body.classList.add("search-open");
  $("search-open").setAttribute("aria-expanded", "true");
  renderTabs(null);
  $("search").focus();
}
function closeSearch() {
  document.body.classList.remove("search-open");
  $("search-open").setAttribute("aria-expanded", "false");
  if ($("search").value) { $("search").value = ""; $("clear").hidden = true; }
  route();
}

function healthHTML() {
  if (!CONFIG.features.healthLine || !CONFIG.features.freshness) return "";
  const n = attentionList().length;
  return n === 0 ? CONFIG.labels.healthAllGood : CONFIG.labels.healthNeedsWork(n);
}

function route() {
  $("view").classList.remove("hero-searching");
  const q = $("search").value.trim().toLowerCase();
  if (q) {
    renderNav(null);
    $("view").innerHTML = searchView(q);
    return;
  }
  // "#/handbook/42" = section "handbook", sub "42".
  const [id, sub] = (location.hash.replace(/^#\/?/, "") || "home").toLowerCase().split("/");

  if (id === "admin") {
    renderNav(null);
    $("view").innerHTML = adminView();
    $("search").placeholder = CONFIG.labels.searchPlaceholder;
    document.title = "Admin · Staff Hub";
    wireGate();
    return;
  }

  // Facilities Requests is its own tool (tools/facilities/) drawn inside the
  // hub so it shares the nav and the Microsoft sign-in. It owns everything
  // after #/facilities.
  if (id === "facilities" && FACILITIES_ON) {
    renderNav("requests");
    $("search").placeholder = CONFIG.labels.searchPlaceholder;
    mountFacilities($("view"), { userName: firstName, toast });
    return;
  }

  const found = sections().find((s) => s.id === id);
  // Parked sections are not reachable; neither are sections that live on Home.
  const section = found?.enabled && !onHome(found) ? found : null;
  renderNav(section ? (section.parent ?? section.id) : "home");
  $("view").innerHTML = section
    ? (section.layout === "brand" ? brandView(section)
      : section.layout === "directory" ? directoryView(section)
      : section.layout === "laborlaw" ? laborLawView(section)
      : section.layout === "handbook" ? handbookView(section)
      : section.layout === "paydates" ? payDatesView(section)
      : section.layout === "holidays" ? holidaysView(section)
      : sectionView(section))
    : homeView();
  if (!section) drawHeroPixels(document.querySelector(".hero-pixels"));
  $("search").placeholder = section
    ? CONFIG.labels.sectionSearchPlaceholder(section.title)
    : CONFIG.labels.searchPlaceholder;
  document.title = `${section ? section.title + " · " : ""}Staff Hub | Cornerstone Fellowship`;
  if (section?.layout === "brand") wireSwatches();
  if (section?.layout === "directory") wireDirectory();
  if (section?.layout === "handbook") wireHandbook(sub);
  if (section?.layout === "paydates" || section?.layout === "holidays") wireDates();
}

// Swatches copy their hex. Clipboard can be unavailable or refused, so the
// button says what happened either way rather than silently doing nothing.
function wireSwatches() {
  for (const el of document.querySelectorAll(".swatch")) {
    el.addEventListener("click", async () => {
      const hex = el.dataset.hex;
      try {
        await navigator.clipboard.writeText(hex);
        el.classList.add("is-copied");
        setTimeout(() => el.classList.remove("is-copied"), 1200);
      } catch {
        el.classList.add("is-failed");
        setTimeout(() => el.classList.remove("is-failed"), 1600);
      }
    });
  }
}

function wireGate() {
  const form = $("gate-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const ok = (await sha256($("gate-input").value)) === CONFIG.admin.passphraseHash;
      if (ok) {
        try { sessionStorage.setItem(UNLOCK_KEY, "1"); } catch { /* fine */ }
        route();
      } else {
        $("gate-err").hidden = false;
        $("gate-input").value = "";
        $("gate-input").focus();
      }
    });
    $("gate-input").focus();
  }
  const lock = $("gate-lock");
  if (lock) lock.addEventListener("click", () => {
    try { sessionStorage.removeItem(UNLOCK_KEY); } catch { /* fine */ }
    route();
  });
}

function boot() {
  $("announce").innerHTML = announcementHTML();
  const x = $("ann-x");
  if (x) x.addEventListener("click", () => {
    const el = $("ann");
    try { localStorage.setItem(KEY, el.dataset.id); } catch { /* fine */ }
    el.remove();
  });
  // The hero notice is redrawn with Home, so listen on the page.
  document.addEventListener("click", (e) => {
    const x = e.target.closest(".hn-x");
    if (!x) return;
    const note = x.closest(".hero-note");
    try { localStorage.setItem(KEY, note.dataset.id); } catch { /* fine */ }
    note.remove();
  });

  const c = CONTENT.contact;
  $("contact").innerHTML = `${esc(c.prompt)} <a href="mailto:${esc(c.email)}">${esc(c.name)}</a>`;
  $("health").textContent = healthHTML();
  if (!CONFIG.features.search) $("search-open").hidden = true;

  wireValues();
  wireQuickEdit();
  route();
}

/* ================= sign-in ================= */
// Protected cards live in Supabase (table hub_cards), readable only by signed-
// in CF staff. They are merged into their sections after sign-in, so every
// view, search included, treats them like any other card.
function mergeProtectedCards(rows) {
  for (const r of rows) {
    const section = sections().find((s) => s.id === r.section_id);
    if (!section) { console.warn("[hub] no section for card", r.section_id, r.title); continue; }
    section.cards.push({
      title: r.title, body: r.body ?? "", meta: r.meta ?? undefined,
      owner: r.owner ?? undefined, reviewed: r.reviewed ?? null,
      links: Array.isArray(r.links) ? r.links : [],
    });
  }
}

const initials = (name) => String(name).split(/[\s@.]+/).filter(Boolean).slice(0, 2)
  .map((w) => w[0].toUpperCase()).join("") || "CF";

function firstNameOf(session) {
  const m = userMeta(session);
  const full = m.given_name || m.full_name || m.name || "";
  // Only use it if it looks like a real name, not an email address.
  return full.includes("@") ? "" : full.trim().split(/\s+/)[0] ?? "";
}

function renderMe(session) {
  firstName = firstNameOf(session);
  const name = displayName(session);
  $("avatar").textContent = initials(name);
  $("me-name").textContent = name;
  $("me-role").textContent = session.user.email ?? "";
  $("me-line").innerHTML = `${esc(CONFIG.labels.signedInAs)} ${esc(session.user.email ?? name)} ·
    <button type="button" class="linkish" id="sign-out">${esc(CONFIG.labels.signOut)}</button>`;
  $("sign-out").addEventListener("click", () => signOut());
  $("menu-sign-out").onclick = () => signOut();
}

function showGate(message, buttonLabel, action) {
  document.body.classList.add("is-locked");
  $("signin").hidden = false;
  $("signin-title").textContent = CONFIG.labels.gateTitle;
  $("signin-msg").textContent = message;
  const b = $("signin-button");
  $("signin-btn-label").textContent = buttonLabel ?? CONFIG.labels.gateButton;
  b.hidden = !action;
  b.onclick = action ?? null;
}

async function start() {
  let session = null;
  try {
    session = await getSession();
  } catch (e) {
    console.error("[hub] session check failed", e);
    return showGate(CONFIG.labels.gateError);
  }
  if (!session) return showGate(CONFIG.labels.gateMsg, CONFIG.labels.gateButton, () => signIn());
  if (!isStaff(session)) {
    return showGate(CONFIG.labels.gateNotStaff(session.user.email ?? "That"),
      CONFIG.labels.gateNotStaffButton, () => signOut());
  }
  const [cards, staff, handbook, quickPrefs] = await Promise.all([
    selectAll("hub_cards", "sort_order"),
    selectAll("staff_directory", "last_name"),
    selectAll("handbook_sections", "sort_order"),
    selectAll("quick_link_prefs"),
  ]);
  if (quickPrefs[0]) myQuick = quickPrefs[0].links ?? [];
  mergeProtectedCards(cards);
  loadStaff(staff);
  loadHandbook(handbook);
  // Labor law notices become cards too, so the main search finds "sick leave".
  const labor = sections().find((x) => x.id === "laborlaw");
  if (labor) labor.cards = (CONTENT.laborNotices ?? []).map((n) => ({
    title: n.title, body: `${n.group} notice from ${n.agency}.`, owner: "Bou", reviewed: null, generated: true,
    links: [{ label: "Download PDF", url: LABOR_DIR + n.file, download: true }],
  }));
  $("signin").hidden = true;
  document.body.classList.remove("is-locked");
  renderMe(session);
  boot();
}

watchForNewVersion();
if (PREVIEW) document.body.insertAdjacentHTML("beforeend",
  `<div class="preview-badge" title="${esc(CONFIG.labels.previewBadgeNote)}">${esc(CONFIG.labels.previewBadge)}</div>`);
start();

// Going somewhere clears the filter and closes search. Without this, an
// active search keeps winning over the route and destinations like #/admin
// never render.
window.addEventListener("hashchange", () => {
  if ($("search").value) { $("search").value = ""; $("clear").hidden = true; }
  document.body.classList.remove("search-open");
  $("search-open").setAttribute("aria-expanded", "false");
  closeMenu();
  route();
  window.scrollTo(0, 0);
});
$("search").addEventListener("input", () => { $("clear").hidden = !$("search").value; route(); });
$("clear").addEventListener("click", () => { $("search").value = ""; $("clear").hidden = true; route(); $("search").focus(); });
$("search-open").addEventListener("click", () =>
  document.body.classList.contains("search-open") ? closeSearch() : openSearch());
// The hero search box on Home. Results render under the hero and the rest
// of Home steps aside until the box is cleared.
function heroSearch(value) {
  const q = value.trim().toLowerCase();
  $("view").classList.toggle("hero-searching", !!q);
  $("hero-results").innerHTML = q ? searchView(q) : "";
}
document.addEventListener("input", (e) => {
  if (e.target.id === "hero-q") heroSearch(e.target.value);
});
document.addEventListener("keydown", (e) => {
  if (e.target.id === "hero-q" && e.key === "Escape") {
    e.target.value = ""; heroSearch(""); e.target.blur();
  }
});
// Anything marked data-open-search (the Search tab) opens it.
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-open-search]")) { e.preventDefault(); openSearch(); }
  if (!e.target.closest(".me")) closeMenu();
});
document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "");
  if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
    e.preventDefault(); openSearch();
  }
  if (e.key === "Escape" && document.body.classList.contains("search-open")) closeSearch();
  if (e.key === "Escape") closeMenu();
});

/* ================= account menu ================= */
function closeMenu() {
  $("me-menu").hidden = true;
  $("avatar").setAttribute("aria-expanded", "false");
}
$("avatar").addEventListener("click", () => {
  const open = $("me-menu").hidden;
  $("me-menu").hidden = !open;
  $("avatar").setAttribute("aria-expanded", String(open));
});
