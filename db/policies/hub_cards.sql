-- RLS for public.hub_cards
-- anon:          no grant, no policy. Gets nothing.
-- authenticated: may read only if public.is_cf_staff() is true.
-- writes:        no policy for anyone. Only the database owner (SQL editor /
--                MCP connector) can insert, update or delete.

create policy "CF staff can read hub cards"
  on public.hub_cards
  for select
  to authenticated
  using ((select public.is_cf_staff()));
