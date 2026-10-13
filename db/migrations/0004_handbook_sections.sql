-- 0004: Employee Handbook, one row per section, for the searchable
-- Handbook page on the Staff Hub. The handbook is internal, so it lives
-- here behind RLS and never in the public repo.
-- Source: "Revised 2025 Employee_Handbook-04.23.25.pdf" (69 pages), split on
-- its table of contents. page = the printed page number in that PDF.
-- To refresh after a new edition: send Claude the new PDF; it re-parses and
-- replaces the rows through the MCP connector and updates edition.
create table public.handbook_sections (
  id         serial primary key,
  sort_order int  not null,              -- reading order, 0 = acknowledgement
  level      int  not null default 0,    -- 0 = heading, 1 = sub-section
  title      text not null,
  page       int  not null,
  body       text not null default '',   -- plain text; blank lines split paragraphs, "•" marks bullets
  edition    text not null default '2025 (rev. 04.23.25)'
);
alter table public.handbook_sections enable row level security;
revoke all on public.handbook_sections from anon, authenticated;
grant select on public.handbook_sections to authenticated;
