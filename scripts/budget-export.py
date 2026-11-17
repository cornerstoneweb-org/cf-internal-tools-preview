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
    # Names go once per code; a row repeats its name only where a code has more
    # than one spelling in the file.
    txns = sheet(wb, "Transactions")
    spellings = {}
    for r in sheet(wb, "Budget_Lines") + txns:
        spellings.setdefault(("c", text(r["class_code"])), set()).add(text(r["class_name"]))
        spellings.setdefault(("a", text(r["account_code"])), set()).add(text(r["account_name"]))
    one = {k: next(iter(v)) for k, v in spellings.items() if len(v) == 1}
    class_names = {k[1]: v for k, v in one.items() if k[0] == "c"}
    account_names = {k[1]: v for k, v in one.items() if k[0] == "a"}
    txn_rows = []
    for r in txns:
        c, a = text(r["class_code"]), text(r["account_code"])
        posted = text(r["posted_account"])
        txn_rows.append([text(r["budget_id"]), text(r.get("location_code")), text(r["date"]), c, a,
                         None if posted == a else posted, "e" if r["kind"] == "expense" else "i", num(r["amount"]),
                         # Finance's rule: anyone not on its cleared list shows generically.
                         text(r["payee_display"]) or ("Individual" if r["kind"] == "income" else "Reimbursement"),
                         text(r["memo_display"]), 1 if text(r["pending_review"]) == "yes" else 0,
                         None if c in class_names else text(r["class_name"]),
                         None if a in account_names else text(r["account_name"])])
        while txn_rows[-1][-1] is None:   # trailing blanks: the loader reads missing as null
            txn_rows[-1].pop()
    payload = {
        "aliases": aliases,
        "class_names": class_names,
        "account_names": account_names,
        "about": {r["field"]: text(r["value"]) for r in sheet(wb, "About")},
        "budgets": [{k: text(r.get(k)) for k in ("budget_id", "budget_name", "location_code", "location_name", "owner_name", "visibility")}
                    for r in sheet(wb, "Budgets")],
        "access": [{k: text(r[k]) for k in ("person_name", "budget_id", "access_type")} for r in sheet(wb, "Access")],
        # Plain rows: order must match private.budget_replace.
        "lines": [[text(r[k]) for k in ("budget_id", "location_code", "class_code", "class_name", "account_code", "account_name", "account_type")]
                  + [num(r["annual"]), [num(r[m]) for m in months]]
                  for r in sheet(wb, "Budget_Lines")],
        "transactions": txn_rows,
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
