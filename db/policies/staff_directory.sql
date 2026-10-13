-- RLS for public.staff_directory
-- anon: no grant, gets nothing. authenticated: CF staff only, active rows only.
-- Writes: database owner only (MCP connector / SQL editor).
create policy "CF staff can read the directory"
  on public.staff_directory for select to authenticated
  using ((select public.is_cf_staff()) and active);
