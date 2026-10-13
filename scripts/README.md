# Scripts

## serve.mjs — local preview with live reload

```
node scripts/serve.mjs              serve, watch, open the browser
node scripts/serve.mjs --no-open    don't open a browser
node scripts/serve.mjs --port 5000  use a different port
```

Or just double-click **Start Preview.command** in the repo root.

Serves the repo root, so absolute paths (`/shared/...`, `/tools/...`) behave
the same locally as they will in production. Defaults to port 4173 and
walks upward if that one is busy. Lands on the Staff Hub.

### Live reload

Any file you save triggers a reload in every open tab. The reload script is
injected into HTML responses as they are served, so no source file is
modified and nothing dev-only can be committed by accident.

If the server restarts, open tabs reconnect on their own and reload once,
so you don't have to touch the browser.

Ignored by the watcher: `.git`, `node_modules`, `brand-assets`, `Graphics`,
dotfiles.

### Gotcha for automated checks

The live-reload connection stays open by design, so Playwright's
`waitUntil: "networkidle"` will never fire against this server. Use
`domcontentloaded` or `load` instead.

## build-brand-library.mjs — the Brand page download library

```
node scripts/build-brand-library.mjs
```

Reads the master brand library (which lives outside this repo at
`~/Projects/cornerstone/brand-assets`, set `CF_BRAND_ASSETS` to override),
copies the web-resolution PNG and JPG of each mark into
`shared/assets/brand/library/`, and writes `tools/staff-hub/brand-library.js`.

Currently 54 marks, 108 files, 4.3 MB.

Only PNG and JPG are copied. EPS and PSD stay in the master library: staff
cannot open them and they would bloat the repo. Print-resolution files are
also left behind; the web files are 1200px, which covers slides, documents
and most print.

The script renames as it goes, so staff see useful labels rather than file
names: campus abbreviations expand (BW to Brentwood), the "Horziontal" typo
in the source filenames is corrected, and the wordmark variants read
Stacked and Horizontal.

Re-run it whenever Communications updates the master library, then commit
the changed files.

## admin-passphrase.mjs — set the admin gate phrase

```
node scripts/admin-passphrase.mjs "your phrase"
```

Prints the SHA-256 hash to paste into `tools/staff-hub/config.js` under
`admin.passphraseHash`. Hashing keeps the phrase out of the source.

It does not make the admin view secure. Static site, no server, so anyone
with dev tools reaches that view regardless. The gate keeps a maintenance
screen out of staff's way. Nothing behind it should matter if a staff member
saw it. Real access control waits for `docs/auth.md`.

## build-data.mjs — Excel to JSON

Reads workbooks from OneDrive and writes flat JSON into
`tools/<tool>/data/`. Not implemented yet; fill in when the first workbook
exists.

```
node scripts/build-data.mjs <tool>
```
