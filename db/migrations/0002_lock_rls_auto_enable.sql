-- 0002: The "automatic RLS" helper Supabase installs is a SECURITY DEFINER
-- function in the public schema, so the API could call it. It only needs to
-- run from its event trigger. Take it off the public API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
