-- 0013: Access Ryan has paused for someone (Nov 17, 2026: Hayward and San
-- Ramon owners). Finance's file still lists them; every load drops a held row
-- after inserting access, so the hold survives monthly loads. Rows live only
-- in private.budget_access_holds, set through the connector, never here.
create table private.budget_access_holds (
  email      text not null check (email = lower(email)),
  budget_id  text not null,
  note       text,
  created_at timestamptz not null default now(),
  primary key (email, budget_id)
);
alter table private.budget_access_holds enable row level security;
revoke all on private.budget_access_holds from public, anon, authenticated;

do $m$
declare f text := pg_get_functiondef('private.budget_replace(jsonb)'::regprocedure);
declare marker text := $s$  insert into public.budget_lines (budget_id, location_code,$s$;
begin
  if position(marker in f) = 0 then raise exception 'marker not found'; end if;
  execute replace(f, marker,
    $s$  -- Holds: access Ryan has paused for someone, kept across every load.
  delete from public.budget_access a
  using private.budget_access_holds h
  where h.email = a.email and h.budget_id = a.budget_id;

$s$ || marker);
end $m$;
revoke all on function private.budget_replace(jsonb) from public, anon, authenticated;
