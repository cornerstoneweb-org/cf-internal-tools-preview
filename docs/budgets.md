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
   If the file is too large to send in one call, ask before changing the method.
5. Check one budget against Finance's PDF.

## Campus income

`budget_campus_income` holds monthly totals, never gifts or donors. Only
supervisors of that location and admins can read it, and it sits above the
ministries on the roll-up. It is compared to plan through the last full month.

## Rules

- `previewOnly` in content.js keeps the page off the live site until Ryan says
  "ship it". The database still holds the data; RLS is the lock.
- "View as" narrows budgets on screen for an admin. It is a preview of the
  page, not a test of RLS. Test RLS as in `db/policies/budgets.sql`.
- Formulas match the check-in PDF. Don't work out new ones here.
