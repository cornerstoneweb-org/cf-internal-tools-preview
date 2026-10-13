# Privacy guardrails

These rules apply to every tool in this repo. They are not preferences. The
pre-commit check (`scripts/privacy-check.mjs`) enforces the ones a script can
catch; the rest are on whoever is building, human or Claude.

## The one fact everything rests on

**Everything in this repo is public.** GitHub Pages serves every committed
file to anyone with the URL, signed in or not. The Microsoft sign-in screen
hides the page; it does not lock the files. Making the repo private does not
change this (only GitHub Enterprise Cloud can gate a Pages site). Git history
keeps every file forever, even after it is deleted.

The bulletin board test: if it could not be pinned on the lobby bulletin
board, it does not go in this repo.

## Where data goes

| Kind of data | Examples | Where it lives |
|---|---|---|
| Public | Links, how-tos, labor law posters, pay date calendar | Repo is fine |
| Staff-only | Directory, handbook text, internal notices | Supabase table, RLS: CF staff |
| Personal | Anything about one person: PTO, reviews, pay, requests, home info | Supabase table, RLS: that person + named role |
| Sensitive files | A PDF or image with any of the above | Private Supabase Storage bucket |
| Source workbooks | Rosters, exports, Excel masters | OneDrive only, never the repo |

When unsure which row something is, treat it as the stricter one and ask Ryan.

## Rules

1. **No personal or staff-only data in the repo.** Not in `content.js`,
   `config.js`, `data/*.json`, committed PDFs or images, SQL seed files,
   code comments, or commit messages. This includes files that are never
   committed but sit in the folder.
2. **Every table is locked before it holds data.** RLS on, a policy for
   each role that needs access, explicit GRANTs in the same migration
   (required for new tables from Oct 30, 2026), and nothing for `anon`.
3. **Test every policy before real data goes in.** Check as signed out (gets
   nothing), as ordinary staff, and as the role owner. Run the Supabase
   security advisor after every schema change.
4. **Least access.** Staff-wide tables use `is_cf_staff()`. Personal tables
   default to "your own rows only," with a named role (HR, Finance, Admin)
   granted more on purpose. Never the insert-only, no-login trick from the
   personal site.
5. **No secrets in the repo or the browser.** The Supabase URL and
   publishable key are the only keys that ship. Service role keys, `sb_secret_`
   keys and the Entra client secret never enter this repo.
6. **Files people upload or that describe a person** go in a private Storage
   bucket, served with short-lived signed URLs, never under `shared/assets/`.
7. **Backups before personal data.** Supabase Pro (daily backups, no pausing)
   must be on before the first personal dataset is loaded.
8. **Few hands on the dashboard.** Supabase org access stays with Ryan and
   Dennis. Anyone with dashboard access can read every table.

## What the pre-commit check blocks

- Spreadsheets, Word docs, CSVs, archives and database dumps anywhere.
- PDFs outside `shared/assets/docs/`. Anything added there must pass the
  bulletin board test.
- Lines that look like a Social Security number, a phone number, or a secret
  key.

If it blocks something that truly is public, fix the pattern or the file, not
the check. `git commit --no-verify` skips it and should be rare enough that
you remember each time.
