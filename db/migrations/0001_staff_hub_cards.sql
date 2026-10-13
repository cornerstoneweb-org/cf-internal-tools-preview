-- 0001: Staff Hub protected content.
--
-- Cards in this table are merged into the Staff Hub sections after sign-in.
-- Anything that should NOT be public goes here, not in content.js (the repo
-- and the site files are public).
--
-- Access: signed-in CF staff only. Writes happen through the Supabase MCP
-- connector / SQL editor, never from the browser.

-- Who counts as CF staff: signed in through Microsoft (Azure provider, which
-- is locked to the CF tenant) with a cornerstoneweb.org address. Belt and
-- suspenders: the tenant lock alone already keeps outsiders out.
create or replace function public.is_cf_staff()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() ->> 'email') ilike '%@cornerstoneweb.org'
    and (auth.jwt() -> 'app_metadata' ->> 'provider') = 'azure',
    false
  );
$$;

create table public.hub_cards (
  id          uuid primary key default gen_random_uuid(),
  section_id  text not null,            -- matches a section id in content.js (e.g. 'hr')
  title       text not null,
  body        text,
  meta        text,
  links       jsonb not null default '[]'::jsonb,  -- [{ "label": "...", "url": "..." }]
  owner       text,
  reviewed    date,
  sort_order  int  not null default 0,
  updated_at  timestamptz not null default now()
);

alter table public.hub_cards enable row level security;

-- New tables are not auto-exposed in this project. Grant exactly what the
-- browser needs: read, for signed-in users, filtered by the policy below.
revoke all on public.hub_cards from anon, authenticated;
grant select on public.hub_cards to authenticated;
