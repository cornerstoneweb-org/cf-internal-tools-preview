-- 0010: The name someone goes by, when it differs from the roster's first
-- name. The site shows it; first_name stays as HR has it. The values are set
-- through the connector and are not in this file, because the repo is public.
-- Budget loads accept either name.
alter table public.staff_directory add column preferred_name text;

do $m$
declare f text := pg_get_functiondef('private.budget_replace(jsonb)'::regprocedure);
declare n int := (length(f) - length(replace(f, $s$lower(s.first_name || ' ' || s.last_name) = lower(a.person_name)$s$, ''))) / length($s$lower(s.first_name || ' ' || s.last_name) = lower(a.person_name)$s$);
begin
  if n <> 2 then raise exception 'expected 2 name matches, found %', n; end if;
  execute replace(f, $s$lower(s.first_name || ' ' || s.last_name) = lower(a.person_name)$s$,
    $s$lower(a.person_name) in (lower(s.first_name || ' ' || s.last_name), lower(s.preferred_name || ' ' || s.last_name))$s$);
end $m$;
revoke all on function private.budget_replace(jsonb) from public, anon, authenticated;
