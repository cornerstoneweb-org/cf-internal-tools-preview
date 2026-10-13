-- RLS for public.handbook_sections
-- anon: no grant, gets nothing. authenticated: CF staff (Microsoft sign-in) only.
-- Writes: database owner only (MCP connector / SQL editor).
-- Verified Sept 2026: anon = permission denied, non-CF account = 0 rows, CF staff = 119 rows.
create policy "CF staff can read the handbook"
  on public.handbook_sections for select to authenticated
  using ((select public.is_cf_staff()));
