# Facilities Requests

Owner: Joe

## Status
Clickable mockup (2026-09-30), demo data only. Lives inside the Staff Hub at
`#/facilities` so it shares the nav and Microsoft sign-in. Not linked from the
Requests card yet; reach it by URL.

## Files
- `facilities.js` draws every page and handles every change.
- `config.js` holds all wording, statuses, priorities, request types and the team list.
- `demo-data.js` made-up requests for the mockup. Deleted once Supabase is wired up.
- `styles.css` loaded by the Staff Hub's index.html. Everything is prefixed `fx-`.
- `app.js` / `index.html` only redirect this folder to the hub.

## Decisions so far (v1)
- Request types: repairs/maintenance and keys/access.
- Roles: staff see their own requests. Joe triages and assigns (Joe, Eric,
  vendor). Ryan sees everything and approves.
- Statuses: New, In progress, Done. "Waiting on approval" comes from the
  approval itself, not a fourth status.
- Priority: Emergency, This week, Whenever. Emergency tells people to call Joe.
- Approval: Joe's call. He can send a request to Ryan with a cost and a note.
- Campus is required (picked from a list). Location is free text.
- Photos: yes, up to 4. Real version stores them in a private Storage bucket.
- Notifications: Teams, likely through a Power Automate flow.
- Never store door or alarm codes. The form says so.
- Held for v2: key approvals and a key log.

## Before real requests
1. Supabase Pro on (backups). See docs/privacy.md.
2. Tables `facility_requests`, `facility_request_activity`, plus a role
   table for facilities team and approver. RLS: requester sees own rows and
   non-internal activity; facilities team and approver see all.
3. Private Storage bucket for photos, signed URLs.
4. Teams notifications.
5. Replace demo-data.js and the demo bar with real reads and writes.
