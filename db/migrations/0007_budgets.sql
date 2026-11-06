-- 0007: Per-person budgets, read by the Staff Hub's Budget page.
--
-- Data classification: staff-only, one budget at a time. The numbers live
-- only here, behind RLS, never in the repo. Ryan decided on 2026-11-05 that
-- budgets are not personal data, so they can load before daily backups are on.
-- A lost table is rebuilt from the Finance export, which stays in OneDrive.
--
-- Who sees what (private.can_see_budget):
--   Not signed in / non-CF account : nothing
--   CF staff                       : budgets they have a budget_access row for
--   Admin                          : everything
--   Writes                         : nobody through the API. Finance's export is
--                                    loaded by the database owner through
--                                    private.budget_replace (scripts/budget-export.py).
--
-- Each load replaces everything, because QuickBooks can change earlier months.

create table public.budget_load (
  id             boolean primary key default true check (id),
  fiscal_year    text not null,
  budget_version text,
  drop_date      date,
  period_start   date not null,
  through_date   date not null,
  generated_at   timestamptz,
  loaded_at      timestamptz not null default now()
);

create table public.budgets (
  budget_id     text primary key,
  budget_name   text not null,
  location_code text not null,
  location_name text not null,
  owner_name    text
);

create table public.budget_access (
  email       text not null check (email = lower(email)),
  budget_id   text not null references public.budgets(budget_id) on delete cascade,
  access_type text not null check (access_type in ('owner','supervisor','viewer')),
  primary key (email, budget_id)
);
create index budget_access_budget on public.budget_access (budget_id);

create table public.budget_lines (
  id           bigint generated always as identity primary key,
  budget_id    text not null references public.budgets(budget_id) on delete cascade,
  class_code   text not null,
  class_name   text,
  account_code text not null,
  account_name text,
  account_type text not null check (account_type in ('Expense','Income')),
  annual       numeric(14,2) not null,
  monthly      numeric(14,2)[] not null check (cardinality(monthly) = 12)  -- Sep to Aug
);
create index budget_lines_budget on public.budget_lines (budget_id);

create table public.budget_transactions (
  id             bigint generated always as identity primary key,
  budget_id      text not null references public.budgets(budget_id) on delete cascade,
  txn_date       date not null,
  class_code     text not null,
  account_code   text not null,
  account_name   text,
  posted_account text,
  kind           text not null check (kind in ('expense','income')),
  amount         numeric(14,2) not null,
  payee_display  text,
  memo_display   text,
  pending_review boolean not null default false
);
create index budget_transactions_budget on public.budget_transactions (budget_id, txn_date);

create table public.budget_notes (
  id        bigint generated always as identity primary key,
  budget_id text not null references public.budgets(budget_id) on delete cascade,
  note      text not null
);
create index budget_notes_budget on public.budget_notes (budget_id);

alter table public.budget_load         enable row level security;
alter table public.budgets             enable row level security;
alter table public.budget_access       enable row level security;
alter table public.budget_lines        enable row level security;
alter table public.budget_transactions enable row level security;
alter table public.budget_notes        enable row level security;

revoke all on public.budget_load, public.budgets, public.budget_access, public.budget_lines,
  public.budget_transactions, public.budget_notes from public, anon, authenticated;
grant select on public.budget_load, public.budgets, public.budget_access, public.budget_lines,
  public.budget_transactions, public.budget_notes to authenticated;

-- The one rule. The email comes from the signed token, so the browser can't
-- change it. Definer rights let it read budget_access past that table's RLS.
create function private.can_see_budget(b text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select public.is_cf_staff() and (
    private.has_role('admin') or exists (
      select 1 from public.budget_access a
      where a.budget_id = b and a.email = lower(auth.jwt() ->> 'email')
    )
  );
$$;
revoke all on function private.can_see_budget(text) from public, anon;
grant execute on function private.can_see_budget(text) to authenticated;

-- Dates only. It lets the page say "updated through" and nothing more.
create policy "CF staff can read the load date"
  on public.budget_load for select to authenticated
  using ((select public.is_cf_staff()));

create policy "Budgets you may see"
  on public.budgets for select to authenticated
  using (private.can_see_budget(budget_id));

create policy "Your own access rows, or all for admin"
  on public.budget_access for select to authenticated
  using ((select public.is_cf_staff()) and (
    email = lower((select auth.jwt()) ->> 'email') or (select private.has_role('admin'))
  ));

create policy "Lines of budgets you may see"
  on public.budget_lines for select to authenticated
  using (private.can_see_budget(budget_id));

create policy "Transactions of budgets you may see"
  on public.budget_transactions for select to authenticated
  using (private.can_see_budget(budget_id));

create policy "Notes of budgets you may see"
  on public.budget_notes for select to authenticated
  using (private.can_see_budget(budget_id));

-- Replaces everything in one transaction, so nobody sees a half-finished load.
-- Access names become staff emails here; any name without exactly one active
-- roster match stops the whole load. `aliases` maps a Finance spelling to the
-- roster spelling. Owner only: not callable by any API role.
create function private.budget_replace(p jsonb)
returns jsonb language plpgsql set search_path = ''
as $$
declare
  bad text;
  aliases jsonb := coalesce(p -> 'aliases', '{}'::jsonb);
begin
  create temp table _access on commit drop as
    select coalesce(aliases ->> a.person_name, a.person_name) as person_name, a.budget_id, a.access_type
    from jsonb_to_recordset(p -> 'access') as a(person_name text, budget_id text, access_type text);

  select string_agg(distinct a.person_name, ', ') into bad
  from _access a
  where (select count(*) from public.staff_directory s
         where s.active and lower(s.first_name || ' ' || s.last_name) = lower(a.person_name)) <> 1;
  if bad is not null then
    raise exception 'No single active roster match for: %', bad;
  end if;

  delete from public.budgets;
  delete from public.budget_load;

  insert into public.budget_load (fiscal_year, budget_version, drop_date, period_start, through_date, generated_at)
  select a.fiscal_year, a.budget_version, a.drop_date, a.period_start, a.through_date, a.generated_at
  from jsonb_to_record(p -> 'about') as a(fiscal_year text, budget_version text, drop_date date,
    period_start date, through_date date, generated_at timestamptz);

  insert into public.budgets (budget_id, budget_name, location_code, location_name, owner_name)
  select b.budget_id, b.budget_name, b.location_code, b.location_name, b.owner_name
  from jsonb_to_recordset(p -> 'budgets') as b(budget_id text, budget_name text,
    location_code text, location_name text, owner_name text);

  insert into public.budget_access (email, budget_id, access_type)
  select lower(s.email), a.budget_id, a.access_type
  from _access a
  join public.staff_directory s
    on s.active and lower(s.first_name || ' ' || s.last_name) = lower(a.person_name);

  insert into public.budget_lines (budget_id, class_code, class_name, account_code, account_name,
    account_type, annual, monthly)
  select l.budget_id, l.class_code, l.class_name, l.account_code, l.account_name, l.account_type, l.annual,
    array(select m::numeric(14,2) from jsonb_array_elements_text(l.monthly) as m)
  from jsonb_to_recordset(p -> 'lines') as l(budget_id text, class_code text, class_name text,
    account_code text, account_name text, account_type text, annual numeric, monthly jsonb);

  insert into public.budget_transactions (budget_id, txn_date, class_code, account_code, account_name,
    posted_account, kind, amount, payee_display, memo_display, pending_review)
  select t.budget_id, t.txn_date, t.class_code, t.account_code, t.account_name, t.posted_account,
    t.kind, t.amount, t.payee_display, t.memo_display, t.pending_review
  from jsonb_to_recordset(p -> 'transactions') as t(budget_id text, txn_date date, class_code text,
    account_code text, account_name text, posted_account text, kind text, amount numeric,
    payee_display text, memo_display text, pending_review boolean);

  insert into public.budget_notes (budget_id, note)
  select n.budget_id, n.note
  from jsonb_to_recordset(p -> 'notes') as n(budget_id text, note text);

  return jsonb_build_object(
    'budgets', (select count(*) from public.budgets),
    'access', (select count(*) from public.budget_access),
    'lines', (select count(*) from public.budget_lines),
    'transactions', (select count(*) from public.budget_transactions),
    'notes', (select count(*) from public.budget_notes));
end;
$$;
revoke all on function private.budget_replace(jsonb) from public, anon, authenticated;
