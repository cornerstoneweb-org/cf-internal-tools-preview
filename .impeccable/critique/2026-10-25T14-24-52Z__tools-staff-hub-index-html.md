---
target: home page
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/ryanbicker/Projects/cornerstone/cf-internal-tools-preview/tools/staff-hub/index.html"
target_fingerprint: "sha256:ab93661b3261ee2641c81af4cbde784e1c35ed8c5f19dc1fef856637f37fd399"
target_path: /Users/ryanbicker/Projects/cornerstone/cf-internal-tools-preview/tools/staff-hub/index.html
timestamp: 2026-10-25T14-24-52Z
slug: tools-staff-hub-index-html
---
Method: dual-agent (A: design review · B: detector + browser)

# Staff Hub home page critique (Oct 25, 2026)

Target: `tools/staff-hub/` in the preview clone, viewed at http://localhost:5173/tools/staff-hub/

**Limit of this run:** the Microsoft sign-in screen covers the page, and neither reviewer signed in. The signed-in home was judged from source code; only the sign-in screen was checked in the browser.

## Score: 27/40 (solid and usable)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | System status | 3 | "Checking your sign-in…" can hang if a data load fails (app.js:1186-1203) |
| 2 | Real-world match | 3 | Phone hides the notes that explain "Central" = CCB, "OnePoint" = pay (styles.css:387) |
| 3 | User control | 2 | Hero search has no clear button; typing hides all of Home; Esc is the only way back (styles.css:81, 86) |
| 4 | Consistency | 2 | White icons on orange and cyan break DESIGN.md's own rule; Requests reachable 4 ways |
| 5 | Error prevention | 3 | Dead links show "Coming soon" instead of breaking |
| 6 | Recognition | 3 | Every icon labeled; phone drops the second line |
| 7 | Efficiency | 3 | "/" and Cmd-K shortcuts, one-tap quick links |
| 8 | Minimalist design | 2 | About 30 targets, lots of duplication, "Coming soon" on the welcome page |
| 9 | Error recovery | 3 | Great "tell Ryan" mailto; but exact-phrase search misses "pay day", "laptop broken" (app.js:805) |
| 10 | Help | 3 | Footer contact and empty-state mailto are good |

## Specificity verdict
Mostly authored for Cornerstone: staff values with scripture, the "tell Ryan what you were looking for" empty state, real campus vocabulary, the Jungle Night hero. The skeleton (greeting hero, search bar, app icons, bento grid, shelf) is generic intranet. The hero spends the best space on "Welcome to the Staff Hub. We're so glad you're here." every visit, and has no campus photos (content.js:98 is empty).

Automated scan agreed on the contrast problems and found style drift: 81 font sizes, 17 colors, and 15 corner radii in styles.css that aren't in DESIGN.md. Inter flagged as overused, but DESIGN.md picks it on purpose (false positive). The "dark glow" flag is a false positive from the dark sign-in backdrop. The striped-bar flag belongs to the Facilities demo banner, not Home.

## What's working
1. The no-results mailto to Ryan, pre-filled with the search. It is the product's feedback loop.
2. Copy and flag discipline: plain, warm, no em dashes, no maintenance metadata shown.
3. Phone shell: labeled bottom tab bar, 16px inputs, safe areas, reduced motion.

## Priority issues
1. **[P1] "Coming soon" items on the welcome page.** IT Support in the Requests tile is a dead grey row (content.js:168-175). Facilities too when it's flagged off. "Coming later: Budget Report Access" tile. Product principle 3 says a coming-soon button is worse than none. Note: the IT link was removed on purpose ("a replacement is a decision"), so the fix is either hide it on Home or give it an interim "Email Dennis" action. Command: distill.
2. **[P1] Quick-link icons fail contrast and are small.** White glyphs on orange (OnePoint) and cyan (Teams), about 2.3:1 (content.js:115, 117). Labels ~13px, notes ~12px and hidden on phone. Fix: dark glyphs on those two tiles, labels to 15px+, keep the note on phone. Commands: polish, typeset.
3. **[P2] Phone tab bar labels too pale.** #8E8E93 at 10.5px (base.css:190), about 3.3:1, lighter than DESIGN.md's floor. Fix: Faint #6E6E73, 11-12px. Command: audit.
4. **[P2] No way out of hero search on a phone.** No × button; screen readers re-hear the whole results grid each keystroke (app.js:281). Fix: add ×, announce only the result count. Command: harden.
5. **[P2] Hero is sentiment, not the job.** On a phone the Requests tile falls below the first screen. Fix: shorter hero on phone, "Start a request" next to search, optional campus photos or "this week" info (payday, office closures). Commands: layout, clarify.

## Persona red flags
- **Non-techy pastor on a phone, laptop broken:** types "laptop broken", search misses; sees small icons with no explanation; finds "IT Support · Coming soon", dead end; pale tab labels.
- **Screen-reader user:** search chatter; "Coming later" tile's label hides its real text (app.js:329); value cards announce title only.
- **Stress tester:** multi-word queries miss; failed data load leaves the sign-in screen stuck; random greeting makes "what do you see?" support calls harder.

## Minor
- `/` keyboard hint means nothing to this audience (hidden on phone already).
- Two search boxes 200px apart on desktop.
- 64px gaps between sections add a lot of phone scrolling.
- Values cards 4 and 5 sit off-screen on phone with no scroll cue.
- Preview badge is white on orange, but only shows on preview and localhost.

## Questions to consider
1. If the job is "find it or ask for it, then get back to ministry," why is the biggest element a greeting and not "What do you need today?"
2. Would anyone miss the "Browse the hub" grid if the nav already lists the same four sections?
3. Should Home change with the calendar: "Payday is Thursday," "Offices closed Monday"?
