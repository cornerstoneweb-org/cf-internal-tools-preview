#!/usr/bin/env node
// Turn a passphrase into the SHA-256 hash that config.js expects.
//
//   node scripts/admin-passphrase.mjs "the phrase you want"
//
// Hashing keeps the phrase itself out of the source. It does NOT make the
// admin view secure. This is a static site with no server, so anyone with
// dev tools can reach that view regardless. The gate keeps an internal
// maintenance screen out of the way of staff, nothing more. Never put
// anything behind it that would matter if a staff member saw it.
//
// Do not reuse a password you use anywhere else.

import { createHash } from "node:crypto";

const phrase = process.argv.slice(2).join(" ");
if (!phrase) {
  console.error('Usage: node scripts/admin-passphrase.mjs "your phrase"');
  process.exit(1);
}

const hash = createHash("sha256").update(phrase, "utf8").digest("hex");
console.log("");
console.log("  Paste this into tools/staff-hub/config.js, admin.passphraseHash:");
console.log("");
console.log(`    passphraseHash: "${hash}",`);
console.log("");
