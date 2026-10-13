// Pre-commit privacy check. Blocks the commit if staged changes include a
// file type or a line that should never be public. See docs/privacy.md.
// Run by .githooks/pre-commit. Exit 1 blocks the commit.
import { execSync } from "node:child_process";

const git = (cmd) => execSync(`git ${cmd}`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

// Files that describe people or hold raw data. Never public.
const BLOCKED_TYPES = /\.(xlsx|xlsm|xls|csv|tsv|docx|doc|pptx|numbers|pages|key|zip|7z|rar|dump|backup|bak|sqlite|db|pem|p12|pfx)$/i;
// PDFs are allowed only here, and only if they pass the bulletin board test.
const PDF_OK = /^shared\/assets\/docs\//;

// Line patterns. Checked only on added lines of text files.
const PATTERNS = [
  ["a Social Security number", /\b\d{3}-\d{2}-\d{4}\b/],
  ["a phone number", /(?<![\w.])\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}(?!\d)/],
  ["a Supabase secret key", /\bsb_secret_[A-Za-z0-9_-]{8,}/],
  ["a service role key", /service_role["']?\s*[:=]\s*["']ey/i],
  ["a JWT or API token", /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/],
  ["a client secret", /client[_-]?secret["']?\s*[:=]\s*["'][^"']{8,}/i],
];
// Files allowed to describe the patterns above.
const SKIP_LINES = new Set(["scripts/privacy-check.mjs", "docs/privacy.md", "CLAUDE.md"]);

const problems = [];
const files = git("diff --cached --name-only --diff-filter=ACMR -z").split("\0").filter(Boolean);

for (const f of files) {
  if (BLOCKED_TYPES.test(f)) problems.push(`${f}: this file type is never committed. Keep it in OneDrive.`);
  else if (/\.pdf$/i.test(f) && !PDF_OK.test(f)) problems.push(`${f}: PDFs only go under shared/assets/docs/, and only if they are public.`);
}

const diff = git("diff --cached -U0 --no-color --diff-filter=ACMR");
let file = null, line = 0;
for (const row of diff.split("\n")) {
  if (row.startsWith("+++ ")) { file = row.slice(6); continue; }
  const hunk = row.match(/^@@ -\S+ \+(\d+)/);
  if (hunk) { line = Number(hunk[1]); continue; }
  if (row.startsWith("+") && !row.startsWith("+++")) {
    if (file && !SKIP_LINES.has(file)) {
      for (const [what, re] of PATTERNS) {
        if (re.test(row)) problems.push(`${file}:${line}: looks like ${what}.`);
      }
    }
    line++;
  }
}

if (problems.length) {
  console.error("\nPrivacy check blocked this commit (see docs/privacy.md):\n");
  for (const p of problems) console.error("  - " + p);
  console.error("\nEverything in this repo is public. Move the data to Supabase or OneDrive.\n");
  process.exit(1);
}
