# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cornerstone Fellowship staff at every campus (Livermore, Brentwood, Walnut
Creek, San Ramon Valley, Hayward, Online) plus Central Support. Most of them
are pastors, and technology is not their strength. They use the hub on both
office computers and phones.

The job is short and practical: find a link, form, policy, poster or person,
or start a request, then get back to ministry. Nobody browses the hub for its
own sake.

Tool owners (Executive Pastor for Staff Hub, Facilities, IT, Comms) maintain
content and handle requests, and they are the secondary audience.

## Product Purpose

One site, one Microsoft sign-in, one place for what staff need: requests,
software, HR resources and labor law posters, the staff roster, and later the
Facilities, IT and Comms request tools. It replaced the earlier Canva site.

Success: staff stop asking the Executive Pastor where things are. When search
comes up empty, the hub offers to email what the person was looking for, so
gaps get found and filled.

## Positioning

Built around Cornerstone's own campuses, roles and resources, and it gathers
in one view what Microsoft 365 spreads across SharePoint, Forms and Teams.
Custom build only where aggregation earns it (see docs/conventions.md, buy vs
build).

## Operating Context

- Staff sign in with their Microsoft 365 work account.
- Daily tools around it: Microsoft 365, Teams, SharePoint, CCB (Central),
  PushPay, Canva, Monday.
- Changes ship to the preview site first, then to live at
  staff.cornerstoneweb.org.

## Capabilities and Constraints

- Plain HTML, CSS and vanilla JS ES modules, static hosting on GitHub Pages.
  No framework, no build step beyond Excel to JSON.
- Everything in the repo and on the site is public. Staff-only and personal
  data lives only in Supabase behind RLS (docs/privacy.md).
- Copy and labels live in config.js and content.js, not in app code.
- Tools stay hidden behind feature flags until finished.
- Staff never see maintenance metadata (owners, review dates, "not checked
  yet").
- Status: Staff Hub is live. Facilities is in demo. IT and Comms are stubs.

## Brand Commitments

- Cornerstone Fellowship name and logos in shared/assets/brand/.
- Voice matches cornerstoneweb.org: warm, plain, second person. The home
  page is a welcome, not a dashboard.
- No em dashes in any copy.

## Evidence on Hand

- Real content in tools/staff-hub/content.js and config.js.
- Labor law and HR PDFs in shared/assets/docs/.
- No testimonials, usage stats or survey data exist. Do not invent them.

## Product Principles

1. Built for people for whom tech is not a strength: obvious beats clever,
   plain words beat jargon, and every path takes as few steps as possible.
2. Works on a phone as well as on a desk.
3. Every link works. A "coming soon" button is worse than no button.
4. Privacy first: if it couldn't go on the lobby bulletin board, it isn't in
   the repo.
5. Keep it simple enough for one person to maintain.

## Accessibility & Inclusion

WCAG 2.2 AA as the bar: readable contrast, text that can grow, full keyboard
use, clear labels, and tap targets big enough for phones. Many users are not
comfortable with tech, so plain language and forgiving interactions matter as
much as the technical checklist.
