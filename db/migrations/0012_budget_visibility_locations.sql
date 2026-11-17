-- 0012: All campuses and Central Services (Finance export, Nov 17 2026).
--
-- budgets.visibility: 'all' follows the access rows as before. 'ryan_chris'
-- (Central Services and Online) is checked first: only admins and holders of
-- the private 'budgets_all' role may read those budgets, their lines,
-- transactions, notes and access rows, whatever the access rows say. The role
-- rows live only in private.app_roles, set through the connector, never here.
--
-- budget_lines / budget_transactions.location_code: Central budgets have lines
-- at several 9X locations with the same class and account, so the page matches
-- on location + class + account.
--
-- Campus income: supervisors of an 'all' budget at that location, plus
-- 'budgets_all' and admins. Online has only a ryan_chris budget, so only they
-- see Online giving.
alter table private.app_roles drop constraint app_roles_role_check;
alter table private.app_roles add constraint app_roles_role_check
  check (role in ('facilities','admin','budgets_all'));

alter table public.budgets add column visibility text not null default 'all'
  check (visibility in ('all','ryan_chris'));
alter table public.budget_lines add column location_code text;
alter table public.budget_transactions add column location_code text;

create or replace function private.can_see_budget(b text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select public.is_cf_staff() and (
    private.has_role('admin')
    or exists (select 1 from public.budgets x where x.budget_id = b and x.visibility = 'ryan_chris')
       and private.has_role('budgets_all')
    or exists (
      select 1 from public.budget_access a
      join public.budgets x on x.budget_id = a.budget_id and x.visibility = 'all'
      where a.budget_id = b and a.email = lower(auth.jwt() ->> 'email')
    )
  );
$$;

create or replace function private.can_see_campus_income(l text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select public.is_cf_staff() and (
    private.has_role('admin') or private.has_role('budgets_all') or exists (
      select 1 from public.budget_access a
      join public.budgets b on b.budget_id = a.budget_id and b.visibility = 'all'
      where b.location_code = l and a.access_type = 'supervisor'
        and a.email = lower(auth.jwt() ->> 'email')
    )
  );
$$;

-- Your own access rows, but never a row on a ryan_chris budget unless you may
-- see those. Admins see all rows.
drop policy "Your own access rows, or all for admin" on public.budget_access;
create policy "Your own access rows, or all for admin"
  on public.budget_access for select to authenticated
  using ((select public.is_cf_staff()) and (
    (select private.has_role('admin'))
    or (email = lower((select auth.jwt()) ->> 'email') and private.can_see_budget(budget_id))
  ));

-- Loader: names come once per code (class_names / account_names); a row
-- carries its own name only where a code has more than one spelling.
create or replace function private.budget_replace(p jsonb)
returns jsonb language plpgsql set search_path = ''
as $$
declare
  bad text;
  aliases jsonb := coalesce(p -> 'aliases', '{}'::jsonb);
  cn jsonb := coalesce(p -> 'class_names', '{}'::jsonb);
  an jsonb := coalesce(p -> 'account_names', '{}'::jsonb);
begin
  create temp table _access on commit drop as
    select coalesce(aliases ->> a.person_name, a.person_name) as person_name, a.budget_id, a.access_type
    from jsonb_to_recordset(p -> 'access') as a(person_name text, budget_id text, access_type text);

  select string_agg(distinct a.person_name, ', ') into bad
  from _access a
  where (select count(*) from public.staff_directory s
         where s.active and lower(a.person_name) in (lower(s.first_name || ' ' || s.last_name),
                                                    lower(s.preferred_name || ' ' || s.last_name))) <> 1;
  if bad is not null then
    raise exception 'No single active roster match for: %', bad;
  end if;

  delete from public.budgets;
  delete from public.budget_load;
  delete from public.budget_campus_income;

  insert into public.budget_load (fiscal_year, budget_version, drop_date, period_start, through_date, generated_at)
  select a.fiscal_year, a.budget_version, a.drop_date, a.period_start, a.through_date, a.generated_at
  from jsonb_to_record(p -> 'about') as a(fiscal_year text, budget_version text, drop_date date,
    period_start date, through_date date, generated_at timestamptz);

  insert into public.budgets (budget_id, budget_name, location_code, location_name, owner_name, visibility)
  select b.budget_id, b.budget_name, b.location_code, b.location_name, b.owner_name, coalesce(b.visibility, 'all')
  from jsonb_to_recordset(p -> 'budgets') as b(budget_id text, budget_name text,
    location_code text, location_name text, owner_name text, visibility text);

  insert into public.budget_access (email, budget_id, access_type)
  select lower(s.email), a.budget_id, a.access_type
  from _access a
  join public.staff_directory s
    on s.active and lower(a.person_name) in (lower(s.first_name || ' ' || s.last_name),
                                            lower(s.preferred_name || ' ' || s.last_name));

  -- [budget_id, location_code, class_code, class_name, account_code, account_name, account_type, annual, [12 months]]
  insert into public.budget_lines (budget_id, location_code, class_code, class_name, account_code, account_name,
    account_type, annual, monthly)
  select r ->> 0, r ->> 1, r ->> 2, r ->> 3, r ->> 4, r ->> 5, r ->> 6, (r ->> 7)::numeric,
    array(select m::numeric(14,2) from jsonb_array_elements_text(r -> 8) as m)
  from jsonb_array_elements(p -> 'lines') as r;

  -- [budget_id, location_code, date, class_code, account_code, posted_account or null (same as account),
  --  kind (e/i), amount, payee, memo, pending (0/1), class_name override, account_name override]
  insert into public.budget_transactions (budget_id, location_code, txn_date, class_code, class_name, account_code,
    account_name, posted_account, kind, amount, payee_display, memo_display, pending_review)
  select r ->> 0, r ->> 1, (r ->> 2)::date, r ->> 3, coalesce(r ->> 11, cn ->> (r ->> 3)),
    r ->> 4, coalesce(r ->> 12, an ->> (r ->> 4)), coalesce(r ->> 5, r ->> 4),
    case r ->> 6 when 'e' then 'expense' when 'i' then 'income' else r ->> 6 end,
    (r ->> 7)::numeric, r ->> 8, r ->> 9, (r ->> 10) = '1'
  from jsonb_array_elements(p -> 'transactions') as r;

  insert into public.budget_campus_income (location_code, location_name, account_code, account_name,
    annual, monthly, received, note)
  select r ->> 0, r ->> 1, r ->> 2, r ->> 3, (r ->> 4)::numeric,
    array(select m::numeric(14,2) from jsonb_array_elements_text(r -> 5) as m),
    array(select m::numeric(14,2) from jsonb_array_elements_text(r -> 6) as m),
    r ->> 7
  from jsonb_array_elements(coalesce(p -> 'campus', '[]'::jsonb)) as r;

  insert into public.budget_notes (budget_id, note)
  select n.budget_id, n.note
  from jsonb_to_recordset(p -> 'notes') as n(budget_id text, note text);

  return jsonb_build_object(
    'budgets', (select count(*) from public.budgets),
    'ryan_chris', (select count(*) from public.budgets where visibility = 'ryan_chris'),
    'access', (select count(*) from public.budget_access),
    'lines', (select count(*) from public.budget_lines),
    'transactions', (select count(*) from public.budget_transactions),
    'notes', (select count(*) from public.budget_notes),
    'campus', (select count(*) from public.budget_campus_income));
end;
$$;
revoke all on function private.budget_replace(jsonb) from public, anon, authenticated;
