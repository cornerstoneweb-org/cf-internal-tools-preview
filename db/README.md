# Database

Supabase Postgres. Applied through the Supabase MCP connector, not through a
local CLI, because Cowork cannot reach Supabase over HTTP.

## migrations/
Numbered SQL files, applied in order. Never edit a migration that has already
been applied. Add a new one.

Naming: `0001_create_requests.sql`, `0002_add_status_column.sql`

## policies/
Row Level Security policy definitions, one file per table. Every table that
holds real data gets RLS enabled and a written policy here.

A policy is not done until it has been tested by actually querying as each
role and confirming the wrong role gets nothing back. Same standard as the
personal build.

## Rule
No table goes live without RLS enabled. Not one.
