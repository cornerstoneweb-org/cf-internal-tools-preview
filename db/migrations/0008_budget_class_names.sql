-- 0008: Finance added class_name to Transactions, because some classes have
-- spending but no budget line. Lines and transactions now load as plain rows
-- with the columns listed once, which keeps a full export small enough to send
-- through the connector.
alter table public.budget_transactions add column class_name text;

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
