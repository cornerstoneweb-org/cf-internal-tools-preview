// Shared UI pieces: header, nav, toasts, empty states. Keep tool-specific
// rendering in the tool's own app.js.
import { SITE, TOOLS } from "../../config/site.config.js";

export function renderHeader(mount, { current } = {}) {
  const links = TOOLS.filter((t) => t.enabled)
    .map((t) => `<a href="/${t.path}"${t.id === current ? ' aria-current="page"' : ""}>${t.name}</a>`)
    .join("");
  mount.innerHTML = `
    <header class="cf-header">
      <a class="cf-brand" href="/">${SITE.siteTitle}</a>
      <nav class="cf-nav">${links}</nav>
    </header>`;
}

export function toast(message) {
  const el = document.createElement("div");
  el.className = "cf-toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}
