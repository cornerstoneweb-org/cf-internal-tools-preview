-- 0005: Facilities Requests v1. Shared team roles, requests, timeline, and a
-- private photo bucket. Data classification: staff-only. Lives only in
-- Supabase behind RLS. Applied 2026-10-06 via the MCP connector.
--
-- PRIVACY: the role rows (who is on Facilities / Admin) were inserted directly
-- through the connector and are deliberately NOT in this file. The repo is public.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- Shared team roles (Facilities now, IT/Comm later). Never exposed via the API.
create table private.app_roles (
  email      text not null check (email = lower(email)),
  role       text not null check (role in ('facilities','admin')),
  note       text,
  created_at timestamptz not null default now(),
  primary key (email, role)
);
alter table private.app_roles enable row level security;
revoke all on private.app_roles from public, anon, authenticated;
-- (role rows inserted via connector; see privacy note above)

create or replace function private.has_role(r text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select public.is_cf_staff() and exists (
    select 1 from private.app_roles a
    where a.email = lower(auth.jwt() ->> 'email') and a.role = r
  );
$$;

create or replace function private.facilities_access()
returns boolean language sql stable security definer set search_path = ''
as $$ select private.has_role('facilities') or private.has_role('admin'); $$;

-- The page calls this to decide which tabs to show. Returns only the caller's roles.
create or replace function public.my_roles()
returns text[] language sql stable security definer set search_path = ''
as $$
  select coalesce(array_agg(a.role order by a.role), '{}')
  from private.app_roles a
  where public.is_cf_staff() and a.email = lower(auth.jwt() ->> 'email');
$$;

create table public.facility_requests (
  id                  bigint generated always as identity (start with 1001) primary key,
  type                text not null check (type in ('repair','keys')),
  campus              text not null check (length(campus) between 1 and 40),
  location            text not null check (length(location) between 1 and 200),
  title               text not null check (length(title) between 1 and 120),
  details             text check (length(details) <= 4000),
  priority            text not null check (priority in ('emergency','week','whenever')),
  status              text not null default 'new' check (status in ('new','progress','done')),
  assignee_email      text check (length(assignee_email) <= 120),
  vendor              text check (length(vendor) <= 120),
  keys_who            text check (length(keys_who) <= 200),
  keys_where          text check (length(keys_where) <= 200),
  need_by             date,
  requester_id        uuid,
  requester_email     text,
  requester_name      text,
  approval_status     text check (approval_status in ('pending','approved','declined')),
  approval_amount     numeric(10,2) check (approval_amount >= 0),
  approval_note       text check (length(approval_note) <= 1000),
  approval_decided_by text,
  approval_decided_at timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  closed_at           timestamptz
);
create index facility_requests_requester_idx on public.facility_requests (requester_id);
create index facility_requests_status_idx on public.facility_requests (status, created_at desc);

create table public.facility_updates (
  id          bigint generated always as identity primary key,
  request_id  bigint not null references public.facility_requests(id) on delete cascade,
  kind        text not null default 'comment'
              check (kind in ('comment','submitted','status','assign','priority','approval')),
  body        text not null check (length(body) between 1 and 4000),
  internal    boolean not null default false,
  author_id   uuid,
  author_name text,
  created_at  timestamptz not null default now()
);
create index facility_updates_request_idx on public.facility_updates (request_id, created_at);

create or replace function private.owns_request(rid bigint)
returns boolean language sql stable security definer set search_path = ''
as $$
  select public.is_cf_staff() and exists (
    select 1 from public.facility_requests r where r.id = rid and r.requester_id = auth.uid()
  );
$$;

create or replace function private.display_name()
returns text language sql stable set search_path = ''
as $$
  select coalesce(
    nullif(auth.jwt() -> 'user_metadata' ->> 'full_name', ''),
    nullif(auth.jwt() -> 'user_metadata' ->> 'name', ''),
    auth.jwt() ->> 'email'
  );
$$;

-- Server-controlled fields on insert: nobody can fake who sent it or pre-set status.
create or replace function private.facility_requests_before_insert()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.requester_id        := auth.uid();
  new.requester_email     := lower(auth.jwt() ->> 'email');
  new.requester_name      := private.display_name();
  new.status              := 'new';
  new.assignee_email      := null;
  new.vendor              := null;
  new.approval_status     := null;
  new.approval_amount     := null;
  new.approval_note       := null;
  new.approval_decided_by := null;
  new.approval_decided_at := null;
  new.created_at          := now();
  new.updated_at          := now();
  new.closed_at           := null;
  return new;
end;
$$;

create or replace function private.facility_requests_before_update()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.requester_id    := old.requester_id;
  new.requester_email := old.requester_email;
  new.requester_name  := old.requester_name;
  new.created_at      := old.created_at;
  new.updated_at      := now();

  if new.status = 'done' and old.status <> 'done' then new.closed_at := now();
  elsif new.status <> 'done' then new.closed_at := null;
  end if;

  if new.approval_status is distinct from old.approval_status
     and new.approval_status in ('approved','declined') then
    if not private.has_role('admin') then
      raise exception 'Only an admin can approve or decline a request';
    end if;
    new.approval_decided_by := lower(auth.jwt() ->> 'email');
    new.approval_decided_at := now();
  elsif new.approval_status is distinct from old.approval_status then
    new.approval_decided_by := null;
    new.approval_decided_at := null;
  end if;
  return new;
end;
$$;

-- Logs changes into the timeline. Runs as owner so it can write system rows.
create or replace function private.facility_requests_log()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.facility_updates (request_id, kind, body, internal)
    values (new.id, 'submitted', 'Submitted', false);
    return new;
  end if;
  if new.status is distinct from old.status then
    insert into public.facility_updates (request_id, kind, body, internal)
    values (new.id, 'status', 'Status: ' || new.status, false);
  end if;
  if new.assignee_email is distinct from old.assignee_email or new.vendor is distinct from old.vendor then
    insert into public.facility_updates (request_id, kind, body, internal)
    values (new.id, 'assign', 'Assigned: ' || coalesce(new.vendor, new.assignee_email, 'nobody'), false);
  end if;
  if new.priority is distinct from old.priority then
    insert into public.facility_updates (request_id, kind, body, internal)
    values (new.id, 'priority', 'Priority: ' || new.priority, false);
  end if;
  if new.approval_status is distinct from old.approval_status then
    insert into public.facility_updates (request_id, kind, body, internal)
    values (new.id, 'approval', 'Approval: ' || coalesce(new.approval_status, 'cleared'), true);
  end if;
  return new;
end;
$$;

create or replace function private.facility_updates_before_insert()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.author_id   := auth.uid();
  new.author_name := private.display_name();
  new.created_at  := now();
  return new;
end;
$$;

create trigger facility_requests_bi before insert on public.facility_requests
  for each row execute function private.facility_requests_before_insert();
create trigger facility_requests_bu before update on public.facility_requests
  for each row execute function private.facility_requests_before_update();
create trigger facility_requests_ai after insert on public.facility_requests
  for each row execute function private.facility_requests_log();
create trigger facility_requests_au after update on public.facility_requests
  for each row execute function private.facility_requests_log();
create trigger facility_updates_bi before insert on public.facility_updates
  for each row execute function private.facility_updates_before_insert();

alter table public.facility_requests enable row level security;
alter table public.facility_updates  enable row level security;

create policy "Staff see their own requests; facilities and admin see all"
  on public.facility_requests for select to authenticated
  using ((select public.is_cf_staff())
         and (requester_id = (select auth.uid()) or (select private.facilities_access())));

create policy "CF staff can submit requests"
  on public.facility_requests for insert to authenticated
  with check ((select public.is_cf_staff()));

create policy "Facilities and admin can update requests"
  on public.facility_requests for update to authenticated
  using ((select private.facilities_access()))
  with check ((select private.facilities_access()));

create policy "Team sees all updates; requester sees non-internal on their own"
  on public.facility_updates for select to authenticated
  using ((select private.facilities_access())
         or (not internal and private.owns_request(request_id)));

create policy "Team or requester can comment"
  on public.facility_updates for insert to authenticated
  with check (kind = 'comment' and (
    (select private.facilities_access())
    or (not internal and private.owns_request(request_id))));

-- Explicit grants (required for new tables after Oct 30, 2026). Nothing for anon.
revoke all on public.facility_requests, public.facility_updates from public, anon, authenticated;
grant select, insert, update on public.facility_requests to authenticated;
grant select, insert on public.facility_updates to authenticated;

revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;
revoke all on function public.my_roles() from public, anon;
grant execute on function public.my_roles() to authenticated;

-- Private photo bucket: path is <request id>/<file>, max 4 per request, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('facility-photos', 'facility-photos', false, 10485760,
        array['image/jpeg','image/png','image/webp','image/heic','image/heif']);

create or replace function private.photo_request_id(path text)
returns bigint language sql immutable set search_path = ''
as $$
  select case when split_part(path, '/', 1) ~ '^[0-9]{1,12}$'
              then split_part(path, '/', 1)::bigint end;
$$;

create or replace function private.can_see_photo(path text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select private.photo_request_id(path) is not null
     and (private.facilities_access() or private.owns_request(private.photo_request_id(path)));
$$;

create or replace function private.photo_slots_left(path text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select count(*) from storage.objects o
          where o.bucket_id = 'facility-photos'
            and split_part(o.name, '/', 1) = split_part(path, '/', 1)) < 4;
$$;

revoke all on function private.photo_request_id(text), private.can_see_photo(text), private.photo_slots_left(text) from public, anon;
grant execute on function private.photo_request_id(text), private.can_see_photo(text), private.photo_slots_left(text) to authenticated;

create policy "Facility photos: requester and team can view"
  on storage.objects for select to authenticated
  using (bucket_id = 'facility-photos' and private.can_see_photo(name));

create policy "Facility photos: requester and team can upload, max 4"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'facility-photos'
              and private.can_see_photo(name)
              and private.photo_slots_left(name));
