-- 0006: Each person's chosen Quick links on Home. Applied 2026-10-25 via the
-- MCP connector.
--
-- Data classification: a personal preference, but low risk. One row per
-- person holding a short list of link keys from content.js (e.g. "mail",
-- "teams"). No names, no free text, nothing an attacker could use. Losing it
-- (no backups before Pro) only resets someone to the default links. Ryan
-- chose account-saved links on 2026-10-25 knowing Pro is not on yet.
--
-- RLS: your own row only, CF staff only. Nothing for anon. No role sees
-- anyone else's picks; nobody needs to.

create table public.quick_link_prefs (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  links      text[] not null default '{}'
             check (cardinality(links) <= 24
                    and array_position(links, null) is null
                    and coalesce(length(array_to_string(links, '')), 0) <= 24 * 40),
  updated_at timestamptz not null default now()
);

alter table public.quick_link_prefs enable row level security;

revoke all on public.quick_link_prefs from public, anon;
grant select, insert, update, delete on public.quick_link_prefs to authenticated;

-- Nobody can write a row for someone else, whatever user_id they send.
create or replace function private.quick_link_prefs_stamp()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.user_id    := auth.uid();
  new.updated_at := now();
  return new;
end;
$$;

create trigger quick_link_prefs_stamp
  before insert or update on public.quick_link_prefs
  for each row execute function private.quick_link_prefs_stamp();

create policy "Staff read their own quick links"
  on public.quick_link_prefs for select to authenticated
  using ((select public.is_cf_staff()) and user_id = (select auth.uid()));

create policy "Staff add their own quick links"
  on public.quick_link_prefs for insert to authenticated
  with check ((select public.is_cf_staff()) and user_id = (select auth.uid()));

create policy "Staff change their own quick links"
  on public.quick_link_prefs for update to authenticated
  using ((select public.is_cf_staff()) and user_id = (select auth.uid()))
  with check ((select public.is_cf_staff()) and user_id = (select auth.uid()));

create policy "Staff clear their own quick links"
  on public.quick_link_prefs for delete to authenticated
  using ((select public.is_cf_staff()) and user_id = (select auth.uid()));
