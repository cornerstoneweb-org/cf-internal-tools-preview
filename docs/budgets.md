# Budget page

Each person sees the budgets they are assigned. Finance owns the numbers and
the access list; the hub only displays them. Numbers live only in Supabase
(`db/migrations/0007_budgets.sql`), never in this repo.

## Monthly update

1. Finance saves `Staff Hub Budget Export - thru YYYY-MM-DD.xlsx` in its Staff
   Hub Export folder, with a `Notes for Staff Hub.md` beside it. It is readable
   only on Ryan's Mac. Read the notes first; they win over older instructions.
2. Take the file with the latest through date. If it was rebuilt for the same
   date, compare `generated_at` on the About sheet with `budget_load`.
3. Run `python3 scripts/budget-export.py "<file>" "<temp folder>/budget_load.sql"`.
   The output holds real data, so it never goes in this repo. Delete it after.
4. Run that SQL as the database owner through the Supabase connector. It
   replaces every budget row in one transaction. A name on the Access sheet
   with no single active roster match stops the load. `--alias "A=B"` maps a
   Finance spelling to the roster spelling for one run; fix the source too.
   A roster `preferred_name` also counts as a match.
   A file too large for one call goes in pieces: insert each piece into
   `private.budget_load_chunks`, compare the joined md5 with the local file,
   then run `private.budget_replace` on the joined text and delete the pieces.
5. Check one budget against Finance's PDF.

## Who sees what (Nov 17, 2026)

- `budgets.visibility = 'ryan_chris'` (Central Services, Online) is checked
  before any access row: only admins and the private `budgets_all` role
  (Chris) can read those budgets, their rows, or their access rows.
- Everyone else follows their access rows. Area pastors supervise every
  Ministry Budget at their campus and see that campus's giving.
- Lines and transactions match on location + class + account; Central budgets
  repeat a class and account across 9X locations.

## Campus income

`budget_campus_income` holds monthly totals, never gifts or donors. Only
supervisors of that location and admins can read it, and it sits above the
ministries on the roll-up. It is compared to plan through the last full month.

## Rules

- The Budget page went live on Nov 17, 2026. `previewOnly: true` on a section in
  content.js hides it on live; RLS is the lock either way.
- "View as" narrows budgets on screen for an admin. It is a preview of the
  page, not a test of RLS. Test RLS as in `db/policies/budgets.sql`.
- Formulas match the check-in PDF. Don't work out new ones here.
