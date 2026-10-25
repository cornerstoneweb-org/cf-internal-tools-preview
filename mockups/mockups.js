// Staff Hub style mockups. Five takes on the current Home, one per
// reference. Content mirrors tools/staff-hub/content.js (public copy only).
// Local design exploration; not part of the hub.

const I = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.8-3.3 3.2-5 6-5s5.2 1.7 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14c2.4.2 4 1.8 4.5 4.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L4 16.8V20h3.2l5.3-5.3a4 4 0 0 0 5.2-5.4l-2.5 2.5-2.3-.5-.5-2.3z"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-3.8 3.8-6 7-6s6 2.2 7 6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  out: '<path d="M7 17 17 7M8 7h9v9"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="m14 6 3 3"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
  building: '<path d="M4 21V5l8-2v18M12 8l8 2v11M3 21h18M8 8v.01M8 12v.01M8 16v.01M16 13v.01M16 17v.01"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  talk: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h7M8.5 14h4"/>',
  flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6 0-3.6 3-5.6 3.8-9 2 1.3 3 3 3.2 5 1-.6 1.6-1.8 1.8-3 2 1.6 4.2 4.2 4.2 7 0 3.4-2.6 6-6.5 6z"/>',
  sunrise: '<path d="M3 18h18M6 18a6 6 0 0 1 12 0M12 4v4M4.9 9.9l1.4 1.4M19.1 9.9l-1.4 1.4"/>',
  sprout: '<path d="M12 21v-9M12 12c0-4 3-6 7-6 0 4-3 6-7 6zM12 14c0-3-2.4-5-6-5 0 3 2.4 5 6 5z"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  horn: '<path d="M4 10v4h3l6 4V6L7 10z"/><path d="M17 9a4 4 0 0 1 0 6"/>',
  home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
};
const ic = (k, cls = "ic") =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;

const now = new Date();
const C = {
  name: "Ryan",
  weekday: now.toLocaleDateString("en-US", { weekday: "long" }),
  dateLong: now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
  announce: { label: "Heads up", text: "Employee Benefits Open Enrollment meeting: Wed, Oct 28, 10 AM, Livermore campus, 4/5 Grade Room.", day: "28", month: "Oct", when: "Wed, 10 AM" },
  quick: [
    { k: "mail", label: "Email", note: "Outlook" },
    { k: "chat", label: "Teams", note: "Chat and calls" },
    { k: "people", label: "Central", note: "CCB" },
    { k: "clock", label: "OnePoint", note: "Pay and time off" },
    { k: "wrench", label: "Facilities", note: "Repairs and keys" },
    { k: "person", label: "Roster", note: "Staff directory" },
  ],
  requests: [
    { k: "pen", title: "Graphic Design", body: "Digital or print designs for your ministry.", team: "Communications" },
    { k: "video", title: "Video Design", body: "Start a video for your ministry or program.", team: "Communications" },
    { k: "web", title: "Web Design", body: "Need a new or updated webpage?", team: "Communications" },
    { k: "building", title: "Facilities", body: "Repairs, building issues, keys and access.", team: "Facilities" },
  ],
  sections: [
    { k: "doc", id: "requests", title: "Requests", body: "Ask another team for something." },
    { k: "grid", id: "software", title: "Software", body: "The programs we use to get work done." },
    { k: "people", id: "hr", title: "Human Resources", body: "Pay, time off, policies and paperwork." },
    { k: "layers", id: "brand", title: "Brand", body: "Logos, colors, and how to use them." },
  ],
  values: [
    { k: "heart", title: "We Are Healthy", short: "Caring for your whole self, as worship." },
    { k: "talk", title: "We Are Honest", short: "Talk with people, not about them." },
    { k: "flame", title: "We Are Hungry", short: "A whatever-it-takes attitude." },
    { k: "sunrise", title: "We Are Hopeful", short: "Owners, not renters." },
    { k: "sprout", title: "We Are Humble", short: "God's promotion, not self-promotion." },
  ],
  nav: ["Home", "Requests", "Software", "HR", "Roster"],
  searchPh: "Search the hub, or ask where something lives",
};

const logo = (white) =>
  `<img class="logo" src="/shared/assets/brand/cf-logo-horizontal-${white ? "white" : "black"}.png" alt="Cornerstone Fellowship">`;
const navLinks = (cls = "") =>
  C.nav.map((n, i) => `<a href="#" class="${cls}" ${i === 0 ? 'aria-current="page"' : ""}>${n}</a>`).join("");
const searchField = (cls, btn = "") => `
  <form class="${cls}" role="search" onsubmit="return false">
    <label class="vh" for="q-${cls}">Search the hub</label>
    ${ic("search")}
    <input id="q-${cls}" type="search" placeholder="${C.searchPh}" autocomplete="off">
    ${btn}
  </form>`;
const contact = `<p class="contact">Can't find something? <a href="#">Tell Ryan Bicker what you were looking for.</a></p>`;

/* ---------- 1. Lobby (SSCL myHub) ---------- */
function lobby() {
  return `
  <header class="l-top">
    <div class="wrap l-top-in">
      ${logo(false)}
      <nav class="l-nav" aria-label="Main">${navLinks()}</nav>
      <button class="l-avatar" type="button" aria-label="Your account">RB</button>
    </div>
  </header>
  <main id="main">
    <section class="l-hero">
      <div class="wrap">
        <p class="l-hi">Hi ${C.name}, welcome to</p>
        <h1>Staff Hub</h1>
        <p class="l-ann">${ic("horn")}<span>${C.announce.text}</span></p>
      </div>
    </section>
    <div class="wrap l-searchrow">
      ${searchField("l-search", `<button type="submit" class="l-go">Search</button>`)}
      <div class="l-chips"><span>Quick links:</span>${C.quick.slice(0, 4).map((q) => `<a href="#">${q.label}</a>`).join("")}</div>
    </div>
    <section class="wrap l-cards" aria-label="Browse the hub">
      ${C.sections.map((s) => `
        <a class="l-card" href="#">
          <span class="l-badge">${ic(s.k)}</span>
          <h2>${s.title}</h2>
          <p>${s.body}</p>
          <span class="l-view">View</span>
        </a>`).join("")}
    </section>
    <section class="wrap l-split">
      <div>
        <h2 class="l-h">Start a request</h2>
        <ul class="l-list">
          ${C.requests.map((r) => `<li><a href="#">${ic(r.k)}<span><b>${r.title}</b><small>${r.body}</small></span>${ic("chev", "ic chev")}</a></li>`).join("")}
        </ul>
      </div>
      <div>
        <h2 class="l-h">Everyday tools</h2>
        <ul class="l-tools">
          ${C.quick.map((q) => `<li><a href="#">${ic(q.k)}<b>${q.label}</b><small>${q.note}</small></a></li>`).join("")}
        </ul>
      </div>
    </section>
    <section class="l-values">
      <div class="wrap">
        <h2 class="l-h">How we work around here</h2>
        <ol>${C.values.map((v) => `<li><b>${v.title}</b><span>${v.short}</span></li>`).join("")}</ol>
      </div>
    </section>
    <footer class="wrap">${contact}</footer>
  </main>`;
}

/* ---------- 2. Soft (HealthTech SaaS) ---------- */
function soft() {
  const tints = ["lime", "teal", "orange", "cyan"];
  return `
  <div class="s-frame">
    <header class="s-top">
      ${logo(false)}
      <nav class="s-nav" aria-label="Main">${navLinks()}</nav>
      <a class="s-cta" href="#"><span>${ic("plus")}</span>New request</a>
    </header>
    <main id="main">
      <section class="s-hero">
        <h1><span class="vh">Staff Hub. </span><span aria-hidden="true">Staff Hub</span></h1>
        <div class="s-hero-foot">
          <p><b>Hi, ${C.name}.</b> Find a form, a policy, a poster or a person, then get back to ministry.</p>
          ${searchField("s-search", `<button type="submit" class="s-go" aria-label="Search">${ic("arrow")}</button>`)}
        </div>
      </section>
      <section class="s-tray" aria-label="Browse the hub">
        ${C.sections.map((s, i) => `
          <a class="s-card s-${tints[i]}" href="#">
            <h2>${s.title}</h2>
            <p>${s.body}</p>
            ${ic(s.k, "ic s-art")}
          </a>`).join("")}
      </section>
      <section class="s-band">
        <div class="s-ann">
          <span class="s-date"><b>${C.announce.day}</b>${C.announce.month}</span>
          <p><b>${C.announce.label}.</b> ${C.announce.text}</p>
        </div>
      </section>
      <section class="s-two">
        <div>
          <h2 class="s-h">The places you go every day</h2>
          <ul class="s-quick">
            ${C.quick.map((q) => `<li><a href="#"><span>${ic(q.k)}</span><b>${q.label}</b><small>${q.note}</small></a></li>`).join("")}
          </ul>
        </div>
        <div>
          <h2 class="s-h">Start a request</h2>
          <ul class="s-req">
            ${C.requests.map((r) => `<li><a href="#"><b>${r.title}</b><small>${r.body}</small><span class="s-arrow">${ic("arrow")}</span></a></li>`).join("")}
          </ul>
        </div>
      </section>
      <section class="s-values">
        <h2 class="s-h center">How we work around here</h2>
        ${C.values.map((v, i) => `
          <details ${i === 0 ? "open" : ""}>
            <summary>${v.title}${ic("plus", "ic s-pm")}</summary>
            <p>${v.short}</p>
          </details>`).join("")}
      </section>
      <footer>${contact}</footer>
    </main>
  </div>`;
}

/* ---------- 3. Tiles (Smart Home Hub) ---------- */
function tiles() {
  return `
  <header class="t-top">
    ${logo(false)}
    <nav class="t-nav" aria-label="Main">${navLinks()}</nav>
  </header>
  <main id="main" class="t-grid">
    <h1 class="vh">Staff Hub home</h1>
    <section class="t-tile t-hello">
      <p class="t-label">${C.dateLong}</p>
      <p class="t-greet">Hello, ${C.name}</p>
      ${searchField("t-search")}
    </section>
    <section class="t-tile t-event" aria-labelledby="t-ev">
      <h2 class="t-label" id="t-ev">Coming up</h2>
      <p class="t-big">${C.announce.day}<small>${C.announce.month}</small></p>
      <p>Open Enrollment meeting<br>${C.announce.when}, Livermore campus, 4/5 Grade Room</p>
    </section>
    <section class="t-tile t-quick" aria-labelledby="t-q">
      <h2 class="t-label" id="t-q">Every day</h2>
      <ul>${C.quick.map((q) => `<li><a href="#"><span class="t-dot">${ic(q.k)}</span>${q.label}</a></li>`).join("")}</ul>
    </section>
    <section class="t-tile t-req" aria-labelledby="t-r">
      <h2 class="t-label" id="t-r">Start a request</h2>
      <ul>${C.requests.map((r) => `<li><a href="#"><span>${r.title}</span>${ic("arrow")}</a></li>`).join("")}</ul>
    </section>
    ${C.sections.slice(1).map((s, i) => `
      <a class="t-tile t-sec t-sec-${i}" href="#">
        <h2 class="t-label">${s.title}</h2>
        <p>${s.body}</p>
        ${ic(s.k, "ic t-secic")}
      </a>`).join("")}
    <section class="t-tile t-values" aria-labelledby="t-v">
      <h2 class="t-label" id="t-v">How we work</h2>
      <div class="t-circles" aria-hidden="true"><span>Healthy</span><span>Honest</span></div>
      <ul>${C.values.map((v) => `<li><b>${v.title.replace("We Are ", "")}</b> ${v.short}</li>`).join("")}</ul>
    </section>
    <footer class="t-tile t-foot">${contact}</footer>
  </main>
  <nav class="t-tabbar" aria-label="Main">
    ${["home:Home", "doc:Requests", "people:HR", "person:Roster", "search:Search"].map((t, i) => {
      const [k, l] = t.split(":");
      return `<a href="#" ${i === 0 ? 'aria-current="page"' : ""}>${ic(k)}<span>${l}</span></a>`;
    }).join("")}
  </nav>`;
}

/* ---------- 4. Night (Traders Hub) ---------- */
function dots() {
  const cols = 64, rows = 16, w = 1200, h = 300, out = [];
  for (let c = 0; c < cols; c++) {
    const x = (c + 0.5) * (w / cols);
    const t = c / (cols - 1);
    const top = rows * (0.95 - 0.75 * Math.exp(-((t - 0.52) ** 2) / 0.06));
    for (let r = Math.floor(top); r < rows; r++) {
      const y = (r + 0.5) * (h / rows);
      const lit = (c * 7 + r * 3) % 11 === 0;
      const o = (0.25 + 0.6 * (1 - (r - top) / rows)).toFixed(2);
      out.push(`<rect x="${(x - 3).toFixed(1)}" y="${(y - 4).toFixed(1)}" width="${lit ? 6 : 4}" height="${lit ? 8 : 6}" rx="1" fill="${lit ? "#CDD943" : "#7FC9DA"}" opacity="${o}"/>`);
    }
  }
  return `<svg class="n-dots" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${out.join("")}</svg>`;
}
function night() {
  return `
    <header class="n-top">
      ${logo(true)}
      <nav class="n-nav" aria-label="Main">${navLinks()}</nav>
      <a class="n-cta" href="#">New request ${ic("out")}</a>
    </header>
    <main id="main">
      <section class="n-hero">
        <h1>Everything you need,<br>all in one place.</h1>
        <p>Hi ${C.name}. Search for a form, policy or person, start a request, or jump into the tools you use every day.</p>
        <div class="n-btns">
          <a class="n-btn light" href="#">Start a request</a>
          <a class="n-btn dark" href="#">Browse the hub ${ic("out")}</a>
        </div>
        ${searchField("n-search")}
        ${dots()}
      </section>
      <section class="n-light">
        <h2 class="n-h">Built for Cornerstone staff.<br>Simple on purpose.</h2>
        <p class="n-sub">${C.announce.label}: ${C.announce.text}</p>
        <div class="n-cards">
          <article class="n-card n-paper">
            <h3>Start a request</h3>
            <ul>${C.requests.map((r) => `<li><a href="#">${r.title}${ic("out")}</a></li>`).join("")}</ul>
          </article>
          <article class="n-card n-ink">
            <h3>Every day</h3>
            <ul class="n-q">${C.quick.map((q) => `<li><a href="#">${ic(q.k)}<span>${q.label}</span></a></li>`).join("")}</ul>
          </article>
          <article class="n-card n-glow">
            <h3>How we work</h3>
            <ul class="n-v">${C.values.map((v) => `<li><b>${v.title}</b><span>${v.short}</span></li>`).join("")}</ul>
          </article>
        </div>
        <div class="n-row">
          ${C.sections.map((s) => `<a class="n-pill" href="#">${ic(s.k)}<span><b>${s.title}</b><small>${s.body}</small></span></a>`).join("")}
        </div>
        <footer>${contact}</footer>
      </section>
    </main>`;
}

/* ---------- 5. Connected (Talenta) ---------- */
function campusMap(dark) {
  const pins = [
    { x: 290, y: 165, n: "Walnut Creek" },
    { x: 610, y: 105, n: "Brentwood" },
    { x: 470, y: 295, n: "Livermore" },
    { x: 800, y: 235, n: "Online" },
  ];
  const inside = (x, y) =>
    ((x - 470) / 380) ** 2 + ((y - 200) / 170) ** 2 < 1 ||
    ((x - 760) / 160) ** 2 + ((y - 230) / 110) ** 2 < 1;
  const sq = [];
  for (let x = 20; x < 1000; x += 18)
    for (let y = 20; y < 400; y += 18)
      if (inside(x, y)) sq.push(`<rect x="${x}" y="${y}" width="11" height="11" rx="1.5"/>`);
  const cx = Math.round(pins.reduce((t, p) => t + p.x, 0) / pins.length);
  const cy = Math.round(pins.reduce((t, p) => t + p.y, 0) / pins.length);
  // Every campus links to every other one, so no campus reads as the hub.
  const arcs = [];
  pins.forEach((a, i) => pins.slice(i + 1).forEach((b) => {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    const mx = (a.x + b.x) / 2 - (dy / len) * len * 0.22;
    const my = (a.y + b.y) / 2 + (dx / len) * len * 0.22 * (dy > 0 ? 1 : -1);
    arcs.push(`<path d="M${a.x} ${a.y} Q${mx.toFixed(0)} ${Math.min(my, (a.y + b.y) / 2 - 30).toFixed(0)} ${b.x} ${b.y}"/>`);
  }));
  return `<svg class="c-map ${dark ? "dark" : ""}" viewBox="0 0 1000 420" aria-hidden="true">
    <g class="c-sq">${sq.join("")}</g>
    <g class="c-arcs">${arcs.join("")}</g>
    <g class="c-spokes">${pins.map((p) => `<path d="M${cx} ${cy} L${p.x} ${p.y}"/>`).join("")}</g>
    <g class="c-center"><circle cx="${cx}" cy="${cy}" r="40"/><image href="/shared/assets/brand/cf-icon-white.png" x="${cx - 24}" y="${cy - 24}" width="48" height="48"/></g>
    ${pins.map((p) => `<g class="c-pin"><circle cx="${p.x}" cy="${p.y}" r="14"/><path d="M${p.x - 6} ${p.y}h12M${p.x} ${p.y - 6}v12"/><text x="${p.x}" y="${p.y + 36}">${p.n}</text></g>`).join("")}
  </svg>`;
}
function connected() {
  return `
  <header class="c-top">
    ${logo(false)}
    <nav class="c-nav" aria-label="Main">${navLinks()}</nav>
  </header>
  <main id="main" class="c-main">
    <section class="c-slide c-dark">
      <svg class="c-gather" viewBox="0 0 1000 420" preserveAspectRatio="xMaxYMid slice" aria-hidden="true"></svg>
      <div class="c-copy">
        <h1>The Connected<br><span>Staff Hub</span></h1>
        <p><b>Connecting</b> every one of us with the forms, tools and people we need. Many people, one church.</p>
        ${searchField("c-search")}
      </div>
      <p class="c-foot"><span>Hi, ${C.name}</span><span>${C.dateLong}</span></p>
    </section>
    <section class="c-slide c-light c-ann">
      <h2>${C.announce.label}</h2>
      <p>${C.announce.text}</p>
    </section>
    <section class="c-slide c-light c-split">
      <div>
        <h2 class="c-h">Start a <span>request</span></h2>
        <ul class="c-req">${C.requests.map((r) => `<li><a href="#">${ic(r.k)}<span><b>${r.title}</b><small>${r.body}</small></span>${ic("arrow", "ic c-arrow")}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h2 class="c-h">Every <span>day</span></h2>
        <ul class="c-quick">${C.quick.map((q) => `<li><a href="#">${ic(q.k)}<b>${q.label}</b><small>${q.note}</small></a></li>`).join("")}</ul>
      </div>
    </section>
    <section class="c-slide c-light c-browse" aria-label="Browse the hub">
      ${C.sections.map((s) => `<a href="#">${ic(s.k)}<b>${s.title}</b><small>${s.body}</small></a>`).join("")}
    </section>
    <section class="c-slide c-dark c-values">
      <h2 class="c-h">How we <span>work</span></h2>
      <ul>${C.values.map((v) => `<li>${ic(v.k)}<b>${v.title}</b><small>${v.short}</small></li>`).join("")}</ul>
    </section>
    <footer>${contact}</footer>
  </main>`;
}


/* ---------- 6. Editorial (Mental Health Resource Hubs) ---------- */
function editorial() {
  return `
  <div class="e-page">
    <header class="e-top">
      ${logo(false)}
      <nav class="e-nav" aria-label="Main">${navLinks()}</nav>
      <a class="e-link" href="#">New request ${ic("out")}</a>
    </header>
    <main id="main">
      <section class="e-hero">
        <div class="e-orb" aria-hidden="true"></div>
        <div class="e-copy">
          <h1>Staff<br>Hub</h1>
          <p>Hi ${C.name}. Everything you need to do your job well, from forms and policies to the people who can help.</p>
          ${searchField("e-search")}
        </div>
        <aside class="e-note" aria-labelledby="e-note-h">
          <h2 id="e-note-h">${C.announce.label}</h2>
          <p class="e-day">${C.announce.month} ${C.announce.day}</p>
          <p>${C.announce.text}</p>
        </aside>
      </section>
      <section class="e-band">
        <div class="e-white">
          <div class="e-col">
            <span class="e-pill">Start a request</span>
            <p class="e-lede">The teams behind the scenes, one form away.</p>
          </div>
          <ul class="e-rows">${C.requests.map((r) => `<li><a href="#"><span class="e-ico">${ic(r.k)}</span><span><b>${r.title}</b><small>${r.team}</small></span><span class="e-cap">Start ${ic("out")}</span></a></li>`).join("")}</ul>
        </div>
        <div class="e-dark">
          <h2>How we work around here</h2>
          <ul>${C.values.map((v) => `<li><b>${v.title}</b> ${v.short}</li>`).join("")}</ul>
          <a class="e-link light" href="#">Read our staff values ${ic("out")}</a>
        </div>
      </section>
      <section class="e-quick">
        <h2>Every day</h2>
        <ul>${C.quick.map((q) => `<li><a href="#">${ic(q.k)}<b>${q.label}</b><small>${q.note}</small></a></li>`).join("")}</ul>
      </section>
      <section class="e-browse" aria-label="Browse the hub">
        ${C.sections.map((s) => `<a href="#"><b>${s.title}</b><span>${s.body}</span><span class="e-cap">Explore ${ic("out")}</span></a>`).join("")}
      </section>
      <footer>${contact}</footer>
    </main>
  </div>`;
}

/* ---------- 7. Library (Customer stories hub) ---------- */
function library() {
  const items = [
    ...C.requests.map((r) => ({ ...r, tag: "Request", link: "Start a request" })),
    ...C.sections.slice(1).map((s) => ({ ...s, tag: "Section", link: "Open" })),
    { k: "doc", title: "Employee Handbook", body: "Search any policy, or browse by section.", tag: "HR", link: "Open" },
    { k: "clock", title: "Pay Dates", body: "Paydays are every other Thursday.", tag: "HR", link: "See dates" },
  ];
  const tints = ["teal", "orange", "lime", "cyan"];
  return `
  <header class="b-top">
    <div class="b-wrap b-top-in">
      ${logo(false)}
      <nav class="b-nav" aria-label="Main">${navLinks()}</nav>
    </div>
  </header>
  <main id="main" class="b-wrap b-main">
    <section class="b-head">
      <h1>Hi ${C.name}, what do you need today?</h1>
      ${searchField("b-search", `<button type="submit" class="b-go">Search</button>`)}
      <ul class="b-filters" aria-label="Filter">
        ${["Everything", "Requests", "HR", "Software", "Brand"].map((f, i) => `<li><button type="button" ${i === 0 ? 'aria-pressed="true"' : 'aria-pressed="false"'}>${f}</button></li>`).join("")}
      </ul>
    </section>
    <p class="b-ann">${ic("horn")}<span><b>${C.announce.label}:</b> ${C.announce.text}</span></p>
    <section class="b-grid" aria-label="Everything in the hub">
      ${items.map((it, i) => `
        <a class="b-card" href="#">
          <span class="b-art b-${tints[i % 4]}">${ic(it.k)}</span>
          <span class="b-body">
            <span class="b-tag">${it.tag}</span>
            <b>${it.title}</b>
            <span class="b-text">${it.body}</span>
            <span class="b-more">${it.link} ${ic("chev")}</span>
          </span>
        </a>`).join("")}
    </section>
    <section class="b-values">
      <h2>How we work around here</h2>
      <ul>${C.values.map((v) => `<li>${ic(v.k)}<b>${v.title}</b><span>${v.short}</span></li>`).join("")}</ul>
    </section>
    <footer>${contact}</footer>
  </main>`;
}

/* ---------- 8. Warm (Dyslexia & Dyscalculia education) ---------- */
const lantern = `<svg class="w-art" viewBox="0 0 300 300" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <g stroke="#1D1D1F" stroke-width="3">
    <path d="M150 40v26M98 58l14 22M202 58l-14 22M62 104l24 10M238 104l-24 10"/>
    <path d="M122 92h56l10 18H112z"/>
    <path d="M116 110h68v84a10 10 0 0 1-10 10h-48a10 10 0 0 1-10-10z" fill="#FFF1E4"/>
    <path d="M150 74a12 12 0 0 1 12 12v6h-24v-6a12 12 0 0 1 12-12z"/>
    <path d="M128 204h44l-6 18h-32z"/>
    <path d="M116 230c-10 6-16 16-16 28h100c0-12-6-22-16-28"/>
    <path d="M136 230v-8M164 230v-8"/>
  </g>
  <path d="M150 128c10 14 14 24 14 32a14 14 0 0 1-28 0c0-8 4-18 14-32z" fill="#FE8730" stroke="#B65B0D" stroke-width="2.5"/>
  <circle cx="72" cy="150" r="6" fill="#FE8730"/><circle cx="232" cy="160" r="5" fill="#FE8730"/><circle cx="210" cy="36" r="4" fill="#FE8730"/><circle cx="88" cy="40" r="4" fill="#0693B2"/>
</svg>`;
function warm() {
  return `
  <div class="w-page">
    <header class="w-top">
      <span class="w-brand">${logo(false)}</span>
      <nav class="w-nav" aria-label="Main">${navLinks()}</nav>
      <a class="w-btn dark small" href="#">New request</a>
    </header>
    <main id="main">
      <section class="w-hero">
        <div>
          <h1>Hi ${C.name}. Find what you need, then get back to ministry.</h1>
          ${searchField("w-search")}
          <div class="w-btns">
            <a class="w-btn dark" href="#">Start a request</a>
            <a class="w-btn soft" href="#">Browse the hub</a>
          </div>
        </div>
        ${lantern}
      </section>
      <section class="w-panel">
        <div class="w-panel-copy">
          <h2>The places you go every day, all in one spot.</h2>
          <p>${C.announce.label}: ${C.announce.text}</p>
        </div>
        <ul class="w-quick">${C.quick.map((q) => `<li><a href="#"><span class="w-tag">${q.note}</span><b>${q.label}</b><span class="w-sketch">${ic(q.k)}</span></a></li>`).join("")}</ul>
      </section>
      <section class="w-two">
        <div>
          <h2 class="w-h">Ask another team</h2>
          <ul class="w-req">${C.requests.map((r) => `<li><a href="#"><span>${ic(r.k)}</span><b>${r.title}</b><small>${r.body}</small></a></li>`).join("")}</ul>
        </div>
        <div>
          <h2 class="w-h">Browse the hub</h2>
          <ul class="w-req">${C.sections.slice(1).map((s) => `<li><a href="#"><span>${ic(s.k)}</span><b>${s.title}</b><small>${s.body}</small></a></li>`).join("")}</ul>
        </div>
      </section>
      <section class="w-values">
        <h2 class="w-h">How we work around here</h2>
        <ul>${C.values.map((v) => `<li><span class="w-dot">${ic(v.k)}</span><b>${v.title}</b><small>${v.short}</small></li>`).join("")}</ul>
      </section>
      <footer>${contact}</footer>
    </main>
  </div>`;
}


/* ---------- 9. Resource (Ionic Resource Center) ---------- */
function resource() {
  const feature = [
    { cls: "r-orange", k: "building", tag: "Requests", title: "Ask another team for something", btn: "Start a request" },
    { cls: "r-jungle", k: "people", tag: "Human Resources", title: "Pay, time off, policies and paperwork", btn: "Open HR" },
    { cls: "r-teal", k: "grid", tag: "Software", title: "The programs we use to get work done", btn: "See software" },
  ];
  const tabs = [["star", "Featured"], ["doc", "Requests"], ["people", "HR"], ["grid", "Software"], ["layers", "Brand"]];
  const tints = ["r-c1", "r-c2", "r-c3", "r-c4"];
  return `
  <div class="r-page">
    <header class="r-top">
      ${logo(false)}
      <nav class="r-nav" aria-label="Main">${navLinks()}</nav>
      <button class="r-iconbtn" type="button" aria-label="Search">${ic("search")}</button>
      <a class="r-signin" href="#">New request</a>
    </header>
    <main id="main">
      <section class="r-head">
        <h1>Staff Hub</h1>
        <p>Hi ${C.name}. Everything for Cornerstone staff, from request forms and software to HR policies and the people who can help.</p>
      </section>
      <section class="r-feature" aria-label="Featured">
        ${feature.map((f) => `
          <a class="r-fcard ${f.cls}" href="#">
            ${ic(f.k, "ic r-fart")}
            <span class="r-ftag">${f.tag}</span>
            <b>${f.title}</b>
            <span class="r-fbtn">${f.btn}</span>
          </a>`).join("")}
      </section>
      <nav class="r-tabs" aria-label="Browse by type">
        ${tabs.map(([k, l], i) => `<a href="#" ${i === 0 ? 'aria-current="page"' : ""}>${ic(k === "star" ? "sunrise" : k)}${l}</a>`).join("")}
      </nav>
      <div class="r-sheet">
        <p class="r-ann">${ic("horn")}<span><b>${C.announce.label}:</b> ${C.announce.text}</span></p>
        <section>
          <div class="r-rowhead"><h2>Start a request</h2><a href="#">See all ${ic("arrow")}</a></div>
          <div class="r-cards">
            ${C.requests.map((r, i) => `
              <a class="r-card ${tints[i]}" href="#">
                ${ic(r.k, "ic r-cart")}
                <span class="r-ctag">${r.team}</span>
                <b>${r.title}</b>
                <span class="r-read">Start now</span>
              </a>`).join("")}
          </div>
        </section>
        <section>
          <div class="r-rowhead"><h2>Every day</h2><a href="#">See all ${ic("arrow")}</a></div>
          <ul class="r-quick">${C.quick.map((q) => `<li><a href="#"><span>${ic(q.k)}</span><b>${q.label}</b><small>${q.note}</small></a></li>`).join("")}</ul>
        </section>
        <section>
          <div class="r-rowhead"><h2>How we work around here</h2></div>
          <ul class="r-values">${C.values.map((v) => `<li><b>${v.title}</b><span>${v.short}</span></li>`).join("")}</ul>
        </section>
        <footer>${contact}</footer>
      </div>
    </main>
  </div>`;
}


// Connected hero: a dim pixel field, plus lime squares that start scattered
// and gather into the CF mark. Every square is a person; none is labeled.
function buildGather(svg) {
  const NS = "http://www.w3.org/2000/svg";
  const RES = 240, N = 40;                      // the mark is sampled onto an N x N grid
  const phone = matchMedia("(max-width: 900px)").matches;
  // Desktop: wide field, mark on the right, field fades out toward the title on the left.
  // Phone: tall field, mark centered at the top, field fades out toward the title below.
  const L = phone
    ? (() => {
        const r = svg.getBoundingClientRect(), W = 400, H = Math.round((W * r.height) / r.width) || 700;
        return { W, H, STEP: 13, SIZE: 9, MSTEP: 3.8, MSIZE: 3, cx: W / 2, cy: 105,
                 fade: (x, y) => Math.max(0, Math.min(1, (250 - y) / 150)) };
      })()
    : { W: 1000, H: 420, STEP: 15, SIZE: 10, MSTEP: 7, MSIZE: 5.5, cx: 790, cy: 200,
        fade: (x) => Math.max(0, Math.min(1, (x - 330) / 330)) };
  const { W, H, STEP, SIZE, MSTEP, MSIZE, fade } = L;
  // A different CF color each visit: green, blue or orange.
  const hues = ["#CDD943", "#32B9DB", "#FE8730"];
  svg.closest(".c-slide").style.setProperty("--hue", hues[Math.floor(Math.random() * hues.length)]);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", phone ? "xMidYMin slice" : "xMaxYMid slice");
  const ox = L.cx - (N * MSTEP) / 2, oy = L.cy - (N * MSTEP) / 2;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = c.height = RES;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0, RES, RES);
    const px = g.getImageData(0, 0, RES, RES).data;
    const lit = new Set();
    const b = RES / N;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      let a = 0;
      for (let y = Math.floor(j * b); y < (j + 1) * b; y++)
        for (let x = Math.floor(i * b); x < (i + 1) * b; x++) a = Math.max(a, px[(y * RES + x) * 4 + 3]);
      if (a > 120) lit.add(`${i},${j}`);
    }
    const frag = document.createDocumentFragment();
    for (let x = 0; x < W; x += STEP) for (let y = 0; y < H; y += STEP) {
      const f = fade(x, y);
      if (f <= 0) continue;
      const r = document.createElementNS(NS, "rect");
      Object.entries({ x, y, width: SIZE, height: SIZE, rx: 1.5, class: "g-bg", opacity: f.toFixed(2) }).forEach(([k, v]) => r.setAttribute(k, v));
      frag.appendChild(r);
    }
    const people = [];
    lit.forEach((key) => {
      const [i, j] = key.split(",").map(Number);
      const tx = ox + i * MSTEP, ty = oy + j * MSTEP;
      const r = document.createElementNS(NS, "rect");
      Object.entries({ x: tx, y: ty, width: MSIZE, height: MSIZE, rx: 1, class: "g-p" }).forEach(([k, v]) => r.setAttribute(k, v));
      let sx, sy;
      sx = Math.random() * (W - 10); sy = Math.random() * (H - 10);
      r.style.transform = still ? "none" : `translate(${(sx - tx).toFixed(0)}px, ${(sy - ty).toFixed(0)}px)`;
      r.style.transitionDelay = `${(Math.random() * 900).toFixed(0)}ms`;
      people.push(r);
      frag.appendChild(r);
    });
    svg.appendChild(frag);
    if (!still) {
      svg.getBoundingClientRect(); // commit the scattered start before moving
      setTimeout(() => people.forEach((r) => { r.style.transform = "translate(0, 0)"; r.classList.add("in"); }), 80);
    }
    else people.forEach((r) => r.classList.add("in"));
  };
  img.src = "/shared/assets/brand/library/icon/icon-outline-white.png";
}

const VIEWS = { lobby, soft, tiles, night, connected, editorial, library, warm, resource };
const app = document.getElementById("app");
const btns = [...document.querySelectorAll(".switcher button")];

function show(v, push = true) {
  if (!VIEWS[v]) v = "lobby";
  document.body.dataset.v = v;
  app.innerHTML = VIEWS[v]();
  const g = app.querySelector(".c-gather");
  if (g) buildGather(g);
  btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
  btns.find((b) => b.dataset.v === v)?.scrollIntoView({ inline: "center", block: "nearest" });
  if (push) history.replaceState(null, "", "#" + v);
  window.scrollTo(0, 0);
}
btns.forEach((b) => b.addEventListener("click", () => show(b.dataset.v)));
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;
  const keys = Object.keys(VIEWS);
  const i = keys.indexOf(document.body.dataset.v);
  if (e.key === "ArrowRight") show(keys[(i + 1) % keys.length]);
  if (e.key === "ArrowLeft") show(keys[(i + keys.length - 1) % keys.length]);
  if (/^[1-9]$/.test(e.key)) show(keys[+e.key - 1]);
});
show(location.hash.slice(1), false);
matchMedia("(max-width: 900px)").addEventListener("change", () => {
  if (document.body.dataset.v === "connected") show("connected", false);
});
