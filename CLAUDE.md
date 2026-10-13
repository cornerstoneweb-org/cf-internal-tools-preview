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
Leave file changes uncommitted for Ryan to review and push.
