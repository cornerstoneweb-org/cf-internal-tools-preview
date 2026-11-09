-- 0011: A holding table for loads too large for one connector call. The
-- export is sent in numbered pieces, joined in order, passed to
-- private.budget_replace, and then deleted. Owner only; no API role can see it.
create table private.budget_load_chunks (
  seq  int primary key,
  body text not null
);
alter table private.budget_load_chunks enable row level security;
revoke all on private.budget_load_chunks from public, anon, authenticated;
