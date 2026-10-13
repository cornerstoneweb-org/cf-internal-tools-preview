# Architecture

```
Excel workbook (OneDrive)          Supabase Postgres
        |                                 |
  scripts/build-data.mjs            RLS-protected tables
        |                                 |
        v                                 v
tools/<tool>/data/*.json  <----  shared/js/supabase.js
        |                                 |
        +------------> tools/<tool>/app.js <------------+
                              |
                    index.html + shared/css
                              |
                     Static hosting (Pages)
```

Two data paths, on purpose:

- Reference data that everyone reads and nobody writes (staff directory,
  campus list, policies, forms) comes from Excel through a build step into
  committed JSON. No backend, no latency, no auth on the read.
- Anything a person submits or that shows per-person status goes to Supabase
  with Row Level Security. This is the part that did not exist in the
  personal build.

## Why one repo

All four tools serve the same audience and share the same identity. One repo
means one origin, so a staff member signs in once and every tool sees the
session. Separate repos would mean separate origins and a separate sign-in
per tool.

If a tool grows enough to need its own release cadence, it can be split out
later. Start together.

## No framework

Plain HTML, CSS, vanilla JS with ES modules. No build pipeline except the
Excel to JSON step. A framework earns its place by solving a problem we
actually have; so far we do not have one.
