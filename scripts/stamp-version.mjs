#!/usr/bin/env node
// Cache-busting. Runs automatically on every commit (see .githooks/pre-commit).
//
// GitHub Pages lets browsers keep each file for up to 10 minutes, and each
// tool is built from several JS/CSS files that load each other. Without this,
// a push can show a mix of old and new files for a while.
//
// What it does, in every tools/*/index.html:
//   1. Adds ?v=<stamp> to local stylesheet links and the entry <script src>.
//   2. Writes an import map between the version markers so every local JS
//      module, however deeply imported, is fetched as file.js?v=<stamp>.
// Only the index.html files change, so commits stay readable.
//
// Usage: node scripts/stamp-version.mjs            (prints the files it changed)

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14); // yyyymmddhhmmss

const SKIP = new Set([".git", "node_modules", "scripts", ".githooks", "db", "docs"]);
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name) || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}
const jsFiles = walk(root);

const START = "<!-- version:start (written by scripts/stamp-version.mjs, do not edit) -->";
const END = "<!-- version:end -->";
const changed = [];

const toolsDir = path.join(root, "tools");
for (const tool of fs.readdirSync(toolsDir)) {
  const file = path.join(toolsDir, tool, "index.html");
  if (!fs.existsSync(file)) continue;
  const dir = path.dirname(file);
  let html = fs.readFileSync(file, "utf8");
  const before = html;

  // 1. Local CSS links and the entry script get ?v=
  html = html.replace(/(<link[^>]+rel="stylesheet"[^>]+href=")(?!https?:)([^"?]+\.css)(\?v=\w+)?(")/g, `$1$2?v=${stamp}$4`);
  html = html.replace(/(<script[^>]+type="module"[^>]+src=")(?!https?:)([^"?]+\.js)(\?v=\w+)?(")/g, `$1$2?v=${stamp}$4`);

  // 2. Import map for every local module
  const imports = {};
  for (const js of jsFiles) {
    let rel = path.relative(dir, js).split(path.sep).join("/");
    if (!rel.startsWith(".")) rel = "./" + rel;
    imports[rel] = `${rel}?v=${stamp}`;
  }
  const block = `${START}
  <meta name="app-version" content="${stamp}">
  <script type="importmap">${JSON.stringify({ imports }, null, 2).replace(/\n/g, "\n  ")}</script>
  ${END}`;
  if (html.includes(START)) {
    html = html.replace(new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END}`), block);
  } else {
    html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n  ${block}`);
  }

  if (html !== before) { fs.writeFileSync(file, html); changed.push(path.relative(root, file)); }
}
// 3. version.json at the site root. Open pages check it (no cache) and
//    reload themselves when a newer version has been pushed.
fs.writeFileSync(path.join(root, "version.json"), JSON.stringify({ version: stamp }) + "\n");
changed.push("version.json");

process.stdout.write(changed.join("\n") + (changed.length ? "\n" : ""));
