#!/usr/bin/env python3
"""Turn Finance's Staff Hub Budget Export into the SQL that loads it.

    python3 scripts/budget-export.py "<export.xlsx>" "<out.sql>" [--alias "Finance Name=Roster Name"]

Read columns by header name and keep codes as text (see the Notes file in the
export folder). The output holds real budget data: write it to a temp folder,
never into this repo. Run the SQL as the database owner.
"""
import json, sys
import openpyxl



def sheet(wb, name):
    rows = list(wb[name].iter_rows(values_only=True))
    head = rows[0]
    return [dict(zip(head, r)) for r in rows[1:] if any(v is not None for v in r)]


def text(v):
    return None if v is None else str(v).strip()


def num(v):
    n = round(float(v or 0), 2)
    return int(n) if n == int(n) else n


def main():
    path, out = sys.argv[1], sys.argv[2]
    aliases = {}
    for i, a in enumerate(sys.argv):
        if a == "--alias":
            k, v = sys.argv[i + 1].split("=", 1)
            aliases[k] = v
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    for name in ("About", "Budgets", "Access", "Budget_Lines", "Transactions", "Notes", "Campus_Income"):
        if name not in wb.sheetnames:
            sys.exit(f"Missing sheet: {name}")
    months = [f"m{n:02d}" for n in range(1, 13)]
    payload = {
        "aliases": aliases,
        "about": {r["field"]: text(r["value"]) for r in sheet(wb, "About")},
        "budgets": [{k: text(r[k]) for k in ("budget_id", "budget_name", "location_code", "location_name", "owner_name")}
                    for r in sheet(wb, "Budgets")],
        "access": [{k: text(r[k]) for k in ("person_name", "budget_id", "access_type")} for r in sheet(wb, "Access")],
        # Plain rows: order must match private.budget_replace.
        "lines": [[text(r[k]) for k in ("budget_id", "class_code", "class_name", "account_code", "account_name", "account_type")]
                  + [num(r["annual"]), [num(r[m]) for m in months]]
                  for r in sheet(wb, "Budget_Lines")],
        "transactions": [[text(r["budget_id"]), text(r["date"]), text(r["class_code"]), text(r["class_name"]),
                          text(r["account_code"]), text(r["account_name"]), text(r["posted_account"]), r["kind"], num(r["amount"]),
                          # Finance's rule: anyone not on its cleared list shows generically.
                          text(r["payee_display"]) or ("Individual" if r["kind"] == "income" else "Reimbursement"),
                          text(r["memo_display"]), text(r["pending_review"]) == "yes"]
                         for r in sheet(wb, "Transactions")],
        "notes": [{k: text(r[k]) for k in ("budget_id", "note")} for r in sheet(wb, "Notes")],
        "campus": [[text(r[k]) for k in ("location_code", "location_name", "account_code", "account_name")]
                   + [num(r["annual"]), [num(r[m]) for m in months],
                      [num(r[f"a{n:02d}"]) for n in range(1, 13)], text(r["note"])]
                   for r in sheet(wb, "Campus_Income")],
    }
    known = {b["budget_id"] for b in payload["budgets"]}
    for name in ("access", "lines", "transactions", "notes"):
        stray = {r["budget_id"] if isinstance(r, dict) else r[0] for r in payload[name]} - known
        if stray:
            sys.exit(f"{name} names budgets not on the Budgets sheet: {stray}")
    tag = "budget_load"
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    if f"${tag}$" in body:
        sys.exit("Quote tag appears in the data")
    with open(out, "w") as f:
        f.write(f"select private.budget_replace(${tag}${body}${tag}$::jsonb);\n")
    print({k: len(v) for k, v in payload.items() if isinstance(v, list)}, payload["about"]["through_date"])


main()
