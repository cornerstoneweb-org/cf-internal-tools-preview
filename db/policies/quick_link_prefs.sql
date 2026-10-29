-- RLS for public.quick_link_prefs (migration 0006).
-- anon: no grant, gets nothing. authenticated: CF staff, own row only, for
-- every action. A trigger stamps user_id from the session, so nobody can
-- write a row for someone else. No role reads anyone else's picks.
-- Tested 2026-10-25 in a rolled-back transaction: staff A sees and edits only
-- A's row; staff B sees, updates and deletes 0 of A's; a non-CF email sees 0;
-- anon gets permission denied. Security advisor: nothing new.
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
