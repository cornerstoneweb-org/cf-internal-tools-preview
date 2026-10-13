// Reload an open page when a newer version has been pushed.
// Compares <meta name="app-version"> (stamped at commit time) with
// version.json, fetched without cache. Runs on load and whenever the tab
// comes back into view. See scripts/stamp-version.mjs.
const VERSION_URL = new URL("../../version.json", import.meta.url);
const RELOAD_KEY = "cf-version-reloaded";

async function check() {
  const mine = document.querySelector('meta[name="app-version"]')?.content;
  if (!mine) return;
  try {
    const res = await fetch(VERSION_URL, { cache: "no-store" });
    if (!res.ok) return;
    const { version } = await res.json();
    if (!version || version === mine) { sessionStorage.removeItem(RELOAD_KEY); return; }
    // Only once per version, so a slow deploy can never cause a reload loop.
    if (sessionStorage.getItem(RELOAD_KEY) === version) return;
    sessionStorage.setItem(RELOAD_KEY, version);
    location.reload();
  } catch { /* offline or blocked: keep the page as is */ }
}

export function watchForNewVersion() {
  check();
  document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
}
