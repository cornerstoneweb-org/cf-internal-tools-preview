import { TOOLS } from "../../config/site.config.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const list = document.getElementById("tool-list");
const enabled = TOOLS.filter((t) => t.enabled);

list.innerHTML = enabled.length
  ? enabled.map((t) => `
      <li><a class="tool-card" href="${esc(t.path)}">
        <h2>${esc(t.name)}</h2>
        <p>${esc(t.blurb)}</p>
        ${t.owner ? `<span class="owner">Kept by ${esc(t.owner)}</span>` : ""}
      </a></li>`).join("")
  : `<li class="tool-card"><h2>Nothing live yet</h2>
     <p>Tools appear here once they are switched on in config/site.config.js.</p></li>`;
