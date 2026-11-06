-- 0009: Campus income on the roll-up: monthly totals of tithes, offerings and
-- rent by location. Totals only, never individual gifts or donors.
--
-- Who sees it: staff with a supervisor row on any budget at that location, and
-- admins. A budget owner or viewer does not, unless they also supervise there.
create table public.budget_campus_income (
  location_code text not null,
  location_name text not null,
  account_code  text not null,
  account_name  text not null,
  annual        numeric(14,2) not null,
  monthly       numeric(14,2)[] not null check (cardinality(monthly) = 12),   -- plan, Sep to Aug
  received      numeric(14,2)[] not null check (cardinality(received) = 12),  -- received, Sep to Aug
  note          text,
  primary key (location_code, account_code)
);
alter table public.budget_campus_income enable row level security;
revoke all on public.budget_campus_income from public, anon, authenticated;
grant select on public.budget_campus_income to authenticated;

create function private.can_see_campus_income(l text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select public.is_cf_staff() and (
    private.has_role('admin') or exists (
      select 1 from public.budget_access a
      join public.budgets b on b.budget_id = a.budget_id
      where b.location_code = l and a.access_type = 'supervisor'
        and a.email = lower(auth.jwt() ->> 'email')
    )
  );
$$;
revoke all on function private.can_see_campus_income(text) from public, anon;
grant execute on function private.can_see_campus_income(text) to authenticated;

create policy "Supervisors of that location and admins"
  on public.budget_campus_income for select to authenticated
  using (private.can_see_campus_income(location_code));

create or replace function private.budget_replace(p jsonb)
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
  delete from public.budget_campus_income;

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

  -- [budget_id, class_code, class_name, account_code, account_name, account_type, annual, [12 months]]
  insert into public.budget_lines (budget_id, class_code, class_name, account_code, account_name,
    account_type, annual, monthly)
  select r ->> 0, r ->> 1, r ->> 2, r ->> 3, r ->> 4, r ->> 5, (r ->> 6)::numeric,
    array(select m::numeric(14,2) from jsonb_array_elements_text(r -> 7) as m)
  from jsonb_array_elements(p -> 'lines') as r;

  -- [budget_id, date, class_code, class_name, account_code, account_name, posted_account,
  --  kind, amount, payee_display, memo_display, pending_review]
  insert into public.budget_transactions (budget_id, txn_date, class_code, class_name, account_code,
    account_name, posted_account, kind, amount, payee_display, memo_display, pending_review)
  select r ->> 0, (r ->> 1)::date, r ->> 2, r ->> 3, r ->> 4, r ->> 5, r ->> 6, r ->> 7,
    (r ->> 8)::numeric, r ->> 9, r ->> 10, (r ->> 11)::boolean
  from jsonb_array_elements(p -> 'transactions') as r;

  -- [location_code, location_name, account_code, account_name, annual, [12 plan], [12 received], note]
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
    'access', (select count(*) from public.budget_access),
    'lines', (select count(*) from public.budget_lines),
    'transactions', (select count(*) from public.budget_transactions),
    'notes', (select count(*) from public.budget_notes),
    'campus', (select count(*) from public.budget_campus_income));
end;
$$;
revoke all on function private.budget_replace(jsonb) from public, anon, authenticated;
