# CF Internal Tools

Read `docs/privacy.md` before adding any data, table, file or feature. The
short version, which is not optional:

- Everything in this repo and on the Pages site is public, sign-in or not.
- Personal or staff-only data lives only in Supabase behind RLS, never in
  `content.js`, `config.js`, JSON, PDFs, images, comments or commit messages.
- Every new table: RLS on, per-role policies, explicit GRANTs in the same
  migration, nothing for `anon`, tested signed out / as staff / as the role
  owner, then run the security advisor.
- Personal tables default to "own rows only" plus a named role.
- No secrets except the publishable key. Private files go in a private
  Storage bucket.
- When unsure whether something is public, treat it as private and ask Ryan.

Other conventions: `docs/conventions.md`. Architecture: `docs/architecture.md`.
Push rule: Claude may commit and push to this preview repo freely. Changes to the
live repo (cf-internal-tools) are pushed only after Ryan says "ship it".

## Local design workflow

1. Design: edit this clone locally and view it at
   http://localhost:5173/tools/staff-hub/ (start with
   `node scripts/serve.mjs --no-open --port 5173`; it reloads on save).
   Don't commit or push during this stage.
2. Test: commit and push to this preview repo when Ryan asks.
3. Live: copy to the live repo only after Ryan says "ship it".

Port 4173 on Ryan's Mac is an always-on server for the live clone, so it
won't show changes made here.
