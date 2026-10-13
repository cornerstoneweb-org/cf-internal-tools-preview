-- 0003: Staff directory. Read by the Staff Hub's Staff Directory page.
-- Master copy of the roster stays in OneDrive (HR). To refresh, Claude
-- replaces the rows from the latest roster through the MCP connector.
-- No phone numbers, by decision (Sept 2026).
create table public.staff_directory (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  last_name   text not null,
  title       text,
  campus_code text not null,          -- LV, BW, WC, SRV, CS ... see tools/staff-hub/config.js
  email       text not null unique,   -- drives the Teams chat/call and email links
  active      boolean not null default true,
  updated_at  timestamptz not null default now()
);
alter table public.staff_directory enable row level security;
revoke all on public.staff_directory from anon, authenticated;
grant select on public.staff_directory to authenticated;
