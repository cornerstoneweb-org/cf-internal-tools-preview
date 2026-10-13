# CF Internal Tools

Staff-facing internal tools for Cornerstone Fellowship. One repo, one deployed
site, one login. Each tool is a folder under `tools/`.

## Live tools

| Path | Tool | Status |
|---|---|---|
| `/tools/staff-hub/` | Staff Hub | Pilot, in progress |
| `/tools/facilities/` | Facilities request | Planned |
| `/tools/it/` | IT request | Planned |
| `/tools/comms/` | Comms request | Planned |

## Layout

```
config/            Site-wide config: org info, campuses, feature flags per tool
shared/            Everything more than one tool uses
  css/             tokens.css (brand), base.css (shared look)
  js/              auth.js, supabase.js, data.js, ui.js
  data/            Reference JSON used across tools (campuses, departments)
  assets/          Images, fonts
tools/<tool>/      One self-contained tool
  index.html       Entry point
  app.js           Tool logic
  styles.css       Tool-only styles
  config.js        Tool copy, labels, feature flags
  data/            Generated JSON for this tool (build output, committed)
scripts/           Build and dev scripts (Excel to JSON, local server)
db/                Supabase schema
  migrations/      Numbered .sql, applied through the Supabase MCP connector
  policies/        RLS policy definitions, one file per table
docs/              Architecture, auth decision, conventions, deploy
```

## Two folders, on purpose

Code lives here, outside OneDrive. Git and OneDrive sync fight each other and
corrupt `.git`.

Documents, decisions, source Excel workbooks and reference material live in
OneDrive:

`CF Work Files/11_CLAUDE_Code/Staff Internal Tools_CC/`

Build scripts read workbooks from that OneDrive path and write JSON into
`tools/<tool>/data/` here. The generated JSON is committed. The workbooks are
not.

## Before anything goes live

Auth is unresolved. See `docs/auth.md`. Nothing with real staff data ships
until that decision is made.

## Publishing

Claude edits files and leaves them uncommitted. Ryan reviews the diff in
GitHub Desktop and pushes. Database changes go directly through the Supabase
MCP connector.
