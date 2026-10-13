# Staff Hub

Owner: Ryan
Status: V1 built, local only. Not published anywhere.

## Run it

```
cd ~/Projects/cornerstone/cf-internal-tools
node scripts/serve.mjs
```

Then open http://localhost:4173/tools/staff-hub/

## How it is built

An app shell: fixed sidebar, sticky top bar, and a view that swaps on the
URL hash. `#/home` is the dashboard, `#/software` and friends are section
pages. No page loads, no build step, no framework.

Typing in the top search replaces the view with results across every
section, grouped by section. An empty result offers to email Ryan what the
person was looking for, which is how gaps get found.

- `content.js` is the source of truth for every section, card and link.
  Adding a link or changing copy happens here and nowhere else.
- `config.js` holds labels and two feature flags: `search` and
  `showDisabled`.
- `app.js` renders from those two files. It should rarely need editing.
- `styles.css` is Staff Hub only. The shell, sidebar, top bar and pills are
  in `shared/css/base.css` so the next tool inherits them.
- Brand tokens are in `shared/css/tokens.css`, taken from
  cornerstoneweb.org: Manrope, #0693B2 with black text on it, 8px radius.

## Home is a welcome, not a dashboard

V1 is a resource center. Home is a short written welcome plus four quick
links. Nothing else.

The copy lives in `CONFIG.labels.welcomeTitle`, `welcomeLede` and
`welcomeBody` (an array, one paragraph per entry). Voice notes are in
`00_Program/design-language.md`: match cornerstoneweb.org, warm and plain,
second person.

Quick links are four on purpose. They are a convenience below the welcome,
not the feature of the page. Request forms are not among them because people
go to Requests for those.

The dashboard pieces are built but switched off in `config.js`:

| Flag | State | What it is |
|---|---|---|
| `browse` | off | section cards on Home. Removed: the sidebar already lists every section. |
| `quickActions` | on | the circle-icon row |
| `greeting` | off | A rotating "Hi, {name}" greeting instead of the fixed welcome |
| `tiles` | off | the four computed stat tiles |
| `homePanels` | off | "Your tools" and "Needs attention" |

Flip `tiles` and `homePanels` on when the hub earns a dashboard. The code
for both is still there and still works.

Tile values are computed from content at render time, never typed in, so no
tile can quietly become wrong. Adding one means a key in `CONFIG.tiles` and
a case in `tileValue()`.

Quick actions are declared in `CONTENT.quickActions`. Every one is a working
link on purpose. A row of "coming soon" buttons is worse than no row.

## Rebuilt from

The Canva site at cornerstonefellowship.my.canva.site/staff-hub, audited
2026-09-20. Audit, findings and link inventory are in the workspace folder
under `01_Staff-Hub/reference/`.
The workspace folder is OneDrive `CF Work Files/11_CLAUDE_Code/Staff Internal Tools_CC/`
(replaced `11_CLAUDE-Workspace/CF Internal Tools/` on 2026-10-11).

## Staff never see maintenance metadata

Owner names, review dates and "not checked yet" do not appear anywhere a
staff member looks. That information drifts, and drifted metadata tells
people the wrong story: "Not checked yet" reads as "this might be wrong"
when the link is probably fine.

It all moved to `#/admin`.

## The admin view

`#/admin`, not linked from the nav. Lists, in priority order:

1. Items past their review date, oldest first
2. Links that do not go anywhere yet, with SharePoint ones called out
3. Sections with nothing in them
4. Items never checked

### The gate is a curtain, not a lock

This is a static site with no server. Anyone with dev tools reaches the
admin view regardless of the passphrase. The gate keeps a maintenance screen
out of staff's way, and that is all it does.

**Never put anything behind it that would matter if a staff member saw it.**
Real access control waits for the Entra ID decision in `docs/auth.md`.

The passphrase is stored as a SHA-256 hash so the phrase itself is not in
the source:

```
node scripts/admin-passphrase.mjs "your phrase"
```

Paste the hash into `config.js` under `admin.passphraseHash`. Unlock lasts
for the browser session only. Do not reuse a password from anywhere else.

## Ownership and freshness

Every card carries `owner` and `reviewed` in `content.js`. The page computes
the review state at render time, so there is nothing to maintain but the two
fields.

| State | When | How it looks |
|---|---|---|
| ok | inside the review window | not shown |
| due-soon | within 45 days of the deadline | not shown |
| overdue | past the deadline | listed on `#/admin` |
| never | `reviewed` is null | listed on `#/admin` |

Nothing in this table renders on a staff-facing page. `CONFIG.features.freshness`
is off; turning it on puts the old pills back on public cards.

`reviewEvery` is in months. A card's own value wins, then its section's, then
`defaultReviewEvery` in `config.js`.

To record a review: set `reviewed` to today's date. That is the whole
workflow.

Most dates start as `null` on purpose. Claude did not invent review dates.
The only two real ones came from the old site's file names (roster October
2025, handbook April 2025), and both are already overdue, which is the point.

The footer counts how many items need checking. It drops as you work through
them.

## Announcements

`CONTENT.announcement` in `content.js`. Set it to `null` when there is
nothing to say.

- `level`: `"info"` (cyan bar) or `"urgent"` (orange bar)
- `until`: optional `YYYY-MM-DD`, hides itself after that date
- `link` / `linkLabel`: optional call to action

Dismissal is remembered per announcement, keyed on a hash of the text, so
changing the wording brings the banner back for everyone who dismissed the
old one. Storage access is wrapped in try/catch; if it fails the banner just
shows.

## What changed from the Canva version

- Five pages became one searchable page
- Dropbox public links replaced with "Moving to SharePoint" placeholders
- Resources and Tutorials are honest placeholders instead of dead nav items
- Facilities added to Requests, marked coming soon
- OnePoint appears under both Software and HR, since staff look in both

## Parked sections

A section with `enabled: false` is shown so staff know it is coming, but it
is not a link anywhere, it cannot be reached by typing its URL, and its
cards are excluded from search. Parked sections sort to the bottom of the
nav and the Browse grid regardless of their order in `content.js`.

Currently parked: Reference Guides (2 cards written), Resources, Tutorials.

The admin view lists a parked section that still has content under "Parked
for V2", separately from sections that are genuinely empty.

Full list: `00_Program/v2-backlog.md` in the workspace folder.

## Known open items

- Review dates need a first pass. Every card except two says "Not checked
  yet" until someone confirms it.

- HR and reference documents need real SharePoint links, restricted to CF
  users. Until then they show as placeholders.
- Staff values scripture references were copied from the live site and may
  be mispaired there. Verify against the HR source document.
- Facilities request has no form yet.
- Room reservation guides exist for Livermore only.
