#!/usr/bin/env node
// Local preview server for CF internal tools.
//
//   node scripts/serve.mjs            serve, watch, open the browser
//   node scripts/serve.mjs --no-open  don't open a browser
//   node scripts/serve.mjs --port 5000
//
// Serves the repo root so absolute paths behave the same as they will in
// production. Watches for file changes and reloads any open tab. The reload
// script is injected into HTML as it is served, so no source file is
// modified and nothing dev-only can be committed by accident.
//
// No dependencies. Node 18+.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const OPEN = !args.includes("--no-open");
const portArg = args.indexOf("--port");
const START_PORT = portArg > -1 ? Number(args[portArg + 1]) : 4173;
const LANDING = "/tools/staff-hub/";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

const IGNORE = /(^|[\\/])(\.git|node_modules|brand-assets|Graphics|\.DS_Store)([\\/]|$)/;

const RELOAD_SNIPPET = `
<script>
(() => {
  let wasDown = false;
  const connect = () => {
    const es = new EventSource("/__reload");
    es.onmessage = (e) => { if (e.data === "reload") location.reload(); };
    es.onopen = () => { if (wasDown) location.reload(); wasDown = false; };
    es.onerror = () => { wasDown = true; es.close(); setTimeout(connect, 700); };
  };
  connect();
})();
</script>`;

/* ---------- live reload clients ---------- */
const clients = new Set();
let timer = null;

function notify(file) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const rel = path.relative(ROOT, file) || "?";
    console.log(`  changed  ${rel}  ->  reloading ${clients.size} tab${clients.size === 1 ? "" : "s"}`);
    for (const res of clients) res.write("data: reload\n\n");
  }, 90);
}

try {
  fs.watch(ROOT, { recursive: true }, (_evt, filename) => {
    if (!filename) return;
    const f = String(filename);
    if (IGNORE.test(f)) return;
    if (f.endsWith("~") || f.startsWith(".")) return;
    notify(path.join(ROOT, f));
  });
} catch {
  console.log("  (recursive watch unavailable on this platform; live reload off)");
}

/* ---------- server ---------- */
function send(res, code, type, body, extra = {}) {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store", ...extra });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.url === "/__reload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    });
    res.write(": connected\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  let rel = decodeURIComponent(req.url.split("?")[0]);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(ROOT, rel);

  // Never serve outside the repo.
  if (!file.startsWith(ROOT)) return send(res, 403, "text/plain", "Forbidden");

  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    return send(res, 404, "text/html; charset=utf-8",
      `<!doctype html><meta charset="utf-8">
       <body style="background:#0A1614;color:#F1F3F0;font:16px system-ui;padding:3rem">
       <h1 style="color:#FE8730">404</h1>
       <p><code>${rel}</code> is not in the repo.</p>
       <p><a style="color:#32B9DB" href="${LANDING}">Go to the Staff Hub</a></p>
       ${RELOAD_SNIPPET}`);
  }

  const ext = path.extname(file);
  const type = TYPES[ext] ?? "application/octet-stream";

  if (ext === ".html") {
    let html = fs.readFileSync(file, "utf8");
    html = html.includes("</body>")
      ? html.replace("</body>", `${RELOAD_SNIPPET}\n</body>`)
      : html + RELOAD_SNIPPET;
    return send(res, 200, type, html);
  }

  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(res);
});

function listen(port, attempt = 0) {
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && attempt < 12) return listen(port + 1, attempt + 1);
    console.error(err.message);
    process.exit(1);
  });
  server.listen(port, () => {
    const url = `http://localhost:${port}${LANDING}`;
    console.log("");
    console.log("  CF internal tools preview");
    console.log("  ─────────────────────────");
    console.log(`  Staff Hub   ${url}`);
    console.log(`  All tools   http://localhost:${port}/`);
    console.log("  Live reload on. Leave the tab open and it updates on save.");
    console.log("  Ctrl+C to stop.");
    console.log("");
    if (OPEN) {
      const cmd = process.platform === "darwin" ? "open"
        : process.platform === "win32" ? "start" : "xdg-open";
      spawn(cmd, [url], { stdio: "ignore", detached: true, shell: process.platform === "win32" }).unref();
    }
  });
}

listen(START_PORT);
