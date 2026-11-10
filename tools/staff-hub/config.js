// Copy, labels and feature flags for the Staff Hub.
// Wording changes belong here, not in app.js.
export const CONFIG = {
  id: "staff-hub",
  name: "Staff Hub",
  owner: "Ryan",

  features: {
    search: true,
    showDisabled: true,   // list disabled sections as "coming soon"
    freshness: false,     // owner + review state on PUBLIC cards. Off: it is
                          // internal bookkeeping, and stale metadata tells
                          // staff the wrong story. It lives on /admin now.
    announcement: true,   // the banner
    healthLine: false,    // "n items need checking" in the footer. Same reason.
    quickActions: false,  // "Your tools" on Home and its Edit screen. Off
                          // Nov 5 (Ryan): the top apps moved to "Start here"
                          // on Apps & Tools. quick_link_prefs stays in the
                          // database, unused, in case this comes back.
    browse: true,         // the tile grid of sections on Home. Back on with
                          // the top nav (2026-09-23): the nav is a thin row of
                          // words, the tiles say what each section is for.
    greeting: true,       // "Hi, Ryan" + date on the dark hero.
                          // Off: the plain "Welcome to the Staff Hub" text.
    tiles: false,         // stat tiles. Off in V1: this is not a dashboard.
    homePanels: false,    // "Your tools" and "Needs attention" on Home. Same reason.
  },

  defaultReviewEvery: 12,  // months
  dueSoonDays: 45,

  // The admin view at #/admin. It lists what has drifted.
  //
  // THE GATE IS A CURTAIN, NOT A LOCK. This is a static site with no server,
  // so anyone who opens dev tools can reach the admin view regardless. The
  // gate exists to keep an internal maintenance screen out of the way of
  // staff, not to protect anything. Never put anything behind it that would
  // matter if a staff member saw it. Real access control waits for the
  // Entra ID decision in docs/auth.md.
  //
  // The passphrase is stored as a SHA-256 hash so the string itself never
  // appears in the source. To set yours:
  //   node scripts/admin-passphrase.mjs "your phrase"
  // then paste the hash below.
  admin: {
    enabled: true,
    gate: "passphrase",      // "passphrase" or "none"
    passphraseHash: "",      // empty = not set yet, the view says so
    label: "Hub admin",
  },

  // Campus codes used in the staff roster. Label is what staff see.
  campuses: {
    LV:  { label: "Livermore",        color: "var(--teal)" },
    BW:  { label: "Brentwood",        color: "var(--orange)" },
    WC:  { label: "Walnut Creek",     color: "#32B9DB" },
    SRV: { label: "San Ramon Valley", color: "var(--lime-d)" },
    HW:  { label: "Hayward",          color: "#07AED9" },
    ON:  { label: "Online",           color: "#04758F" },
    CS:  { label: "Central Support",  color: "#4A5464" },
  },

  labels: {
    // Announcement banner tag, by level (content.js announcement.label overrides)
    annInfo: "Heads up",
    annUrgent: "Important",
    annHide: "Hide this",
    annMore: "Details",
    annWhen: "When",
    annWhere: "Where",
    weekHeading: "This week",
    weekToday: "Today",
    weekEvent: "Event",
    weekPayday: "Payday",
    weekClosed: "offices closed",
    startRequest: "Start a request",
    startShort: "Start",
    tellName: (n) => `Tell ${n}`,

    // Corner badge on the preview site (PREVIEW_HOSTS in site.config.js)
    previewBadge: "Demo site · all numbers are fake",
    previewBadgeNote: "Preview and demo site. Budget amounts and transactions are made up. Not what staff see.",

    // Staff directory
    dirSearch: "Search by name or role",
    dirAll: "All",
    dirCount: (n) => `${n} ${n === 1 ? "person" : "people"}`,
    dirNone: "No one matches that. Try a first name, or clear the filters.",
    dirChat: "Chat",
    dirCall: "Call",
    dirEmail: "Email",
    dirChatLong: "Chat in Teams",
    hbSearch: "Search the handbook, like \"mileage\" or \"jury duty\"",
    hbCount: (n, term) => term ? `${n} ${n === 1 ? "section mentions" : "sections mention"} "${term}"` : `${n} sections`,
    hbNone: "Nothing in the handbook matches that. Try a shorter word, or ask HR.",
    hbPdf: "Open the PDF",
    hbPage: (n) => `Page ${n}`,
    hbEdition: (e) => `Edition: ${e}`,
    hbExpand: "Expand all",
    hbCollapse: "Collapse all",
    dirCallLong: "Call in Teams",

    // Sign-in screen
    gateTitle: "Staff Hub",
    gateMsg: "Sign in with your Cornerstone Microsoft account to continue.",
    gateButton: "Sign in with Microsoft",
    gateNotStaff: (email) => `${email} isn't a Cornerstone staff account. Sign in with your @cornerstoneweb.org account.`,
    gateNotStaffButton: "Use a different account",
    gateError: "Something went wrong reaching the sign-in service. Refresh to try again.",
    signedInAs: "Signed in as",
    signOut: "Sign out",

    // The Budget page (budget.js). Numbers come from Finance; this is only copy.
    budget: {
      title: "Budget",
      loading: "Loading your budget…",
      noneTitle: "You don't have a budget assigned",
      noneBody: "If you think this is a mistake, talk to your supervisor or Ryan.",
      errorTitle: "We couldn't load your budget",
      errorBody: "Check your connection and refresh. If it keeps happening, tell Ryan.",
      through: (name, date) => `${name}, updated through ${date}`,
      throughAll: (date) => `Updated through ${date}`,
      back: "All budgets",
      remaining: "Remaining",
      remainingNote: "For the rest of the year",
      budgetNet: "Budget for the year",
      budgetNetNote: (e, i) => `${e} spending less ${i} income`,
      spending: "Spent so far",
      spendingNote: (p) => `${p} planned by now`,
      received: "Income received",
      receivedNote: (i) => `of ${i} planned for the year`,
      barLabel: (s, p, b) => `${s} spent, ${p} planned so far, ${b} budgeted for the year`,
      barSpent: (a, when) => `${a} spent through ${when}`,
      barPlanned: (a, when) => `${a} planned through ${when}`,
      barBudget: (a) => `${a} full-year spending budget`,
      campusHeading: "Campus income",
      campusReceived: (m) => `Received through ${m}`,
      campusNoFull: "Received",
      campusPlanned: "Planned",
      campusYear: "Year's plan",
      campusDiff: "Difference",
      campusBarLabel: (g, p, y) => `${g} received, ${p} planned so far, ${y} planned for the year`,
      campusPartial: (m, a) => `${m} so far: ${a}`,
      campusNote: "Monthly totals, compared through the last full month. Tap a line to see each campus. This isn't part of the ministry numbers below.",
      spendingHeading: "Spending",
      incomeHeading: "Income",
      period: "Show",
      yearToDate: "Year to date",
      showBars: "Show bars",
      fullYear: "Full fiscal year",
      from: "From",
      to: "To",
      periodNote: (m, s) => `${m}: ${s} spent.`,
      futureNote: (d) => `Spending only runs through ${d}, so later months show the plan alone.`,
      colBudget: "Budget",
      colPlanned: "Planned",
      colSpent: "Spent",
      colLeft: "Left",
      colReceived: "Received",
      colToGo: "To go",
      colLeftMonth: "Left this month",
      colToGoMonth: "To go this month",
      colLeftRange: "Left in range",
      colToGoRange: "To go in range",
      over: (a) => `${a} over`,
      spentShort: (a) => `${a} spent`,
      leftShort: (a) => `${a} left`,
      listLine: (s, n) => `${s} spent of ${n}`,
      notInBudget: "Not in budget",
      underReview: "Under review",
      noPayee: "Not shown",
      noneYet: "Nothing here yet.",
      noneInPeriod: "Nothing in these dates.",
      hint: "Tap a line to see what's in it.",
      openQuestion: "Open question:",
      myMinistries: "My ministries",
      allCampuses: "All campuses",
      allCornerstone: "All Cornerstone",
      bigPlanned: (p) => `of ${p} planned`,
      bigDiff: (a, up, giving) => giving ? (up ? `${a} ahead of plan` : `${a} behind plan`) : (up ? `${a} over plan` : `${a} under plan`),
      bigGiveNote: (m, y) => `Received through ${m || "the last full month"}. ${y} planned for the year.`,
      bigSpendNote: (m, y) => `Spent through ${m}. ${y} budgeted for the year.`,
      giving: "Giving",
      campBudgets: (n) => `${n} ${n === 1 ? "budget" : "budgets"} · tap to see them`,
      rollSpend: (s, p, b) => `${s} spent · ${p} planned so far · ${b} for the year`,
      rollGive: (g, m, p, y) => `${g} received${m ? ` through ${m}` : ""} · ${p} planned · ${y} for the year`,
      myMinistriesNote: "This adds up your ministries only. It won't match the campus report, which also has staff, building costs and giving.",
    },

    // "View as" (admins only, see the view-as section in app.js)
    viewAs: "Sign in as a different user",
    viewAsExit: "Back to my view",
    viewAsTitle: "View the hub as",
    viewAsHelp: "This only changes what you see in this tab. You stay signed in as you, and nothing is saved as them.",
    viewAsSearch: "Search by name or role",
    viewAsNone: "No one matches that.",
    viewAsCancel: "Cancel",
    viewAsBar: (name) => `Viewing as ${name}`,
    viewAsBarNote: (you) => `You're still signed in as ${you}.`,
    viewAsNoSave: "You can't save changes while viewing as someone else.",

    searchPlaceholder: "Search the hub, or ask where something lives",
    sectionSearchPlaceholder: (name) => `Search ${name.toLowerCase()}`,
    noResults: "Nothing matches that.",
    noResultsHint: "Try a shorter word, or clear the search.",
    resultsFor: (q, n) => `${n} result${n === 1 ? "" : "s"} for "${q}"`,
    comingSoon: "Coming soon",
    movingToSharePoint: "Moving to SharePoint",  // admin view only
    owner: "Kept by",
    reviewedOn: "Checked",
    dueSoon: "Review due",
    overdue: "Needs review",
    neverReviewed: "Not checked yet",
    open: "Open",
    // Voice matched to cornerstoneweb.org: warm, plain, second person, short
    // sentences. Internal, so it can be a little more direct than the public
    // site, but it should sound like the same church wrote it.
    welcomeTitle: "Welcome to the Staff Hub",
    welcomeLede: "We're so glad you're here.",
    welcomeBody: [],
    heroSub: "Welcome to the Staff Hub. We're so glad you're here.",
    // The "Connected" hero (2026-10-25): the greeting, then this line in a
    // CF color picked at random on each visit (green, blue or orange).
    heroWelcome: "Welcome to the Staff Hub",
    heroLine: "Connecting every one of us with the forms, tools and people we need.",
    // Used when the greeting itself does not already say their name.
    heroSubNamed: (name) => `Welcome to the Staff Hub, ${name}. We're so glad you're here.`,

    // The big greeting on Home. One is picked at random per visit. Every
    // line should include {name}, which becomes the person's first name from
    // their Microsoft account. If no name is available, ", {name}" is
    // dropped, so each line must still read fine without it.
    greetings: [
      "Hi, {name}",
      "Hello, {name}",
      "Hey there, {name}",
      "Good to see you, {name}",
    ],
    startHere: "Start here",
    homeStart: "Jump right in",   // Home only (Nov 10). Other ideas: "Jump to your favorites", "Frequently used"
    valueOfWeek: "Staff value of the week",
    moreTools: "Everything else",
    quickHeading: "Your tools",
    quickSub: "The apps and pages you use most. Outside apps open in a new tab.",
    opensNewTab: "opens in a new tab",
    quickEdit: "Edit",
    quickEditTitle: "Your tools",
    quickEditHelp: (n) => `Pick up to ${n}. Drag the dots to change the order. Your picks follow you to any device.`,
    quickShowing: "On your Home page",
    quickAdd: "Add more",
    quickAddOne: "Add",
    quickNone: "Nothing picked yet. Add some from the list below.",
    quickEmpty: "Nothing here yet. Tap Edit to pick some.",
    quickSave: "Save",
    quickCancel: "Cancel",
    quickReset: "Go back to the usual links",
    quickSaved: "Your tools are saved.",
    quickSaveFailed: "Couldn't save your tools. Check your connection and try again.",
    quickPageNote: "Staff Hub page",
    quickMove: (t) => `Move ${t}. Drag, or use the up and down arrow keys.`,
    quickRemove: (t) => `Remove ${t}`,
    quickGroups: { everyday: "Apps", software: "Software", requests: "Requests", pages: "Staff Hub pages" },
    heroSearch: "Search the hub, or ask where something lives",
    browseSub: "Everything staff need, in one place.",
    laterTitle: "Coming later",
    laterBody: "More is on the way.",
    searchLabel: "Search",
    valuesHeading: "How we work around here.",
    valuesLead: "We are",
    valuesHint: "Tap one to read what it means.",
    browseHeading: "Browse the hub",
    itemCount: (n) => `${n} item${n === 1 ? "" : "s"}`,
    toolsHeading: "Your tools",
    attentionHeading: "Needs attention",
    seeAll: "See all",
    nothingToAttend: "Everything is current. Nothing needs you right now.",
    healthAllGood: "Everything in the hub has been checked recently.",
    healthNeedsWork: (n) => `${n} item${n === 1 ? "" : "s"} in the hub ${n === 1 ? "needs" : "need"} checking.`,

    adminTitle: "What needs your attention",
    adminLede: "Internal maintenance view. Staff never see this page.",
    adminLocked: "Enter the passphrase",
    adminLockedHint: "This keeps a maintenance screen out of the way. It is not security.",
    adminNoHash: "No passphrase is set yet.",
    adminNoHashHint: "Run node scripts/admin-passphrase.mjs \"your phrase\" and paste the hash into config.js.",
    adminWrong: "That is not it.",
    adminUnlock: "Unlock",
    adminLock: "Lock again",
    adminClean: "Nothing has drifted. Every item is current and every link works.",
    adminHowTo: "To clear an item, set its reviewed date in content.js to today.",
    groupOverdue: "Past its review date",
    groupNever: "Never checked",
    groupDead: "Links that do not go anywhere yet",
    groupEmpty: "Sections with nothing in them",
    groupParked: "Parked for V2, content already written",
  },

  // Phone tab bar, left to right. `id` is a section id (or "home");
  // `search: true` opens search. Four or five is the most that fits.
  tabs: [
    { id: "home",      label: "Home",     icon: "home" },
    { id: "requests",  label: "Requests", icon: "requests" },
    { id: "hr",        label: "HR",       icon: "hr" },
    { id: "directory", label: "Roster",   icon: "person" },
    { search: true,    label: "Search",   icon: "search" },
  ],

  // Home tiles. Every value is computed from real content, never typed in,
  // so nothing here can quietly go stale or be wrong.
  // Add a tile by adding a key here and a case in app.js tileValue().
  tiles: ["items", "needsReview", "campuses", "keepers"],
  tileLabels: {
    items:       { k: "Items in the hub", n: "Links, guides and tools" },
    needsReview: { k: "Needs review",     n: "Past its check date" },
    campuses:    { k: "Campuses",         n: "LV · BW · WC · SRV · HW · Online" },
    keepers:     { k: "People keeping it current", n: "Named owners across the hub" },
  },
};
