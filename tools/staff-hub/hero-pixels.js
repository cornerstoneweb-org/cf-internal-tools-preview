// The Home hero's pixel field ("Connected" look, 2026-10-25).
// A grid of dim squares fills the dark hero and fades out behind the title.
// Lime, blue or orange squares start scattered across the hero and gather
// into the CF mark. Every square is a person; none is labeled.

const NS = "http://www.w3.org/2000/svg";
const MARK = "../../shared/assets/brand/library/icon/icon-outline-white.png";
const HUES = ["#CDD943", "#32B9DB", "#FE8730"];   // CF green, blue, orange
const PHONE = "(max-width: 720px)";
const RES = 240, N = 40;                          // the mark is sampled onto an N x N grid

let cells = null;   // the mark's lit cells, sampled once per page load

function sampleMark() {
  if (cells) return Promise.resolve(cells);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = RES;
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0, RES, RES);
      const px = g.getImageData(0, 0, RES, RES).data;
      const b = RES / N;
      cells = [];
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        let a = 0;
        for (let y = Math.floor(j * b); y < (j + 1) * b; y++)
          for (let x = Math.floor(i * b); x < (i + 1) * b; x++) a = Math.max(a, px[(y * RES + x) * 4 + 3]);
        if (a > 120) cells.push([i, j]);
      }
      resolve(cells);
    };
    img.onerror = () => resolve([]);
    img.src = MARK;
  });
}

// Desktop: wide field, mark on the right, field fades toward the title on the left.
// Phone: field across the top, mark centered, field fades toward the title below.
function layout(svg) {
  if (matchMedia(PHONE).matches) {
    const r = svg.getBoundingClientRect();
    const W = 400, H = Math.round((W * r.height) / r.width) || 700;
    return { W, H, STEP: 13, SIZE: 9, MSTEP: 3.8, MSIZE: 3, cx: W / 2, cy: 105, aspect: "xMidYMin slice",
             fade: (x, y) => Math.max(0, Math.min(1, (250 - y) / 150)) };
  }
  return { W: 1000, H: 420, STEP: 15, SIZE: 10, MSTEP: 7, MSIZE: 5.5, cx: 790, cy: 200, aspect: "xMaxYMid slice",
           fade: (x) => Math.max(0, Math.min(1, (x - 330) / 330)) };
}

function rect(attrs) {
  const r = document.createElementNS(NS, "rect");
  for (const [k, v] of Object.entries(attrs)) r.setAttribute(k, v);
  return r;
}

export async function drawHeroPixels(svg) {
  if (!svg) return;
  const hero = svg.closest(".hero");
  hero?.style.setProperty("--hue", HUES[Math.floor(Math.random() * HUES.length)]);
  const lit = await sampleMark();
  if (!svg.isConnected) return;   // the page changed while the mark loaded

  const L = layout(svg);
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  svg.setAttribute("viewBox", `0 0 ${L.W} ${L.H}`);
  svg.setAttribute("preserveAspectRatio", L.aspect);
  svg.replaceChildren();

  const frag = document.createDocumentFragment();
  for (let x = 0; x < L.W; x += L.STEP) for (let y = 0; y < L.H; y += L.STEP) {
    const f = L.fade(x, y);
    if (f > 0) frag.appendChild(rect({ x, y, width: L.SIZE, height: L.SIZE, rx: 1.5, class: "hp-bg", opacity: f.toFixed(2) }));
  }
  const ox = L.cx - (N * L.MSTEP) / 2, oy = L.cy - (N * L.MSTEP) / 2;
  const people = lit.map(([i, j]) => {
    const tx = ox + i * L.MSTEP, ty = oy + j * L.MSTEP;
    const r = rect({ x: tx, y: ty, width: L.MSIZE, height: L.MSIZE, rx: 1, class: "hp-p" });
    if (!still) {
      const sx = Math.random() * (L.W - 10), sy = Math.random() * (L.H - 10);
      r.style.transform = `translate(${(sx - tx).toFixed(0)}px, ${(sy - ty).toFixed(0)}px)`;
      r.style.transitionDelay = `${(Math.random() * 900).toFixed(0)}ms`;
    }
    frag.appendChild(r);
    return r;
  });
  svg.appendChild(frag);

  const gather = () => people.forEach((r) => { r.style.transform = "translate(0, 0)"; r.classList.add("in"); });
  if (still) gather();
  else { svg.getBoundingClientRect(); setTimeout(gather, 80); }
}

// Crossing the phone breakpoint changes the layout, so redraw.
matchMedia(PHONE).addEventListener("change", () => drawHeroPixels(document.querySelector(".hero-pixels")));
