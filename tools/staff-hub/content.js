// Staff Hub content. Source of truth for every section, card and link.
// Editing copy, adding a link, or recording a review happens here.
//
// Card shape:
//   {
//     title, body, meta,
//     owner:    "Name"        who keeps this accurate. Required.
//     reviewed: "YYYY-MM-DD"  when a human last confirmed it. null = never.
//     reviewEvery: 12         months until it needs checking again.
//                             Omit to use the section default.
//     links: [{ label, url, note, status }]
//   }
//
// link.status:
//   "ok"         url works (implied when url is set)
//   "pending"    url is null, renders "Coming soon", not clickable
//   "sharepoint" url is null, renders "Moving to SharePoint", not clickable
//
// Dropbox URLs from the old Canva site are deliberately NOT recorded here.
// They are unauthenticated public links and are being replaced with
// SharePoint links restricted to CF users.
//
// ON REVIEW DATES: most are null on purpose. Claude did not invent them.
// A date here means a person actually checked the item. The two real dates
// below came from the source filenames on the old site. Fill in the rest as
// you verify each one, and the flags clear themselves.

// The full handbook PDF. Internal, so it stays in SharePoint and only opens
// for signed-in CF accounts. Update here when HR moves or replaces the file.
const HANDBOOK_PDF = "https://cornerstoneweb-my.sharepoint.com/:b:/g/personal/ryanb_cornerstoneweb_org/IQC3-R_S5lvEQp8Csz8F1v3DARTI-WGY6EBBnGu4jZEU-M8?e=OW1O0L";

export const CONTENT = {
  tagline: "Everything staff need, in one place.",

  // HR dates. Source: HR's 2026 Pay Day Notice and 2026 Holidays PDFs.
  // Public-safe (no pay amounts, nothing personal). Add next year's rows
  // below when HR publishes them; past dates drop off the "next" line on
  // their own. Dates are YYYY-MM-DD.
  payDates: [
    // [pay date, period start, period end]
    ["2026-01-08", "2025-12-21", "2026-01-03"], ["2026-01-22", "2026-01-04", "2026-01-17"],
    ["2026-02-05", "2026-01-18", "2026-01-31"], ["2026-02-19", "2026-02-01", "2026-02-14"],
    ["2026-03-05", "2026-02-15", "2026-02-28"], ["2026-03-19", "2026-03-01", "2026-03-14"],
    ["2026-04-02", "2026-03-15", "2026-03-28"], ["2026-04-16", "2026-03-29", "2026-04-11"],
    ["2026-04-30", "2026-04-12", "2026-04-25"], ["2026-05-14", "2026-04-26", "2026-05-09"],
    ["2026-05-28", "2026-05-10", "2026-05-23"], ["2026-06-11", "2026-05-24", "2026-06-06"],
    ["2026-06-25", "2026-06-07", "2026-06-20"], ["2026-07-09", "2026-06-21", "2026-07-04"],
    ["2026-07-23", "2026-07-05", "2026-07-18"], ["2026-08-06", "2026-07-19", "2026-08-01"],
    ["2026-08-20", "2026-08-02", "2026-08-15"], ["2026-09-03", "2026-08-16", "2026-08-29"],
    ["2026-09-17", "2026-08-30", "2026-09-12"], ["2026-10-01", "2026-09-13", "2026-09-26"],
    ["2026-10-15", "2026-09-27", "2026-10-10"], ["2026-10-29", "2026-10-11", "2026-10-24"],
    ["2026-11-12", "2026-10-25", "2026-11-07"], ["2026-11-25", "2026-11-08", "2026-11-21"],
    ["2026-12-10", "2026-11-22", "2026-12-05"], ["2026-12-24", "2026-12-06", "2026-12-19"],
    ["2027-01-07", "2026-12-20", "2027-01-02"],
  ],
  holidays: [
    // [date, name]  Offices closed.
    ["2026-01-01", "New Year's Day"], ["2026-01-19", "Martin Luther King Jr. Day"],
    ["2026-02-16", "Presidents' Day"], ["2026-05-25", "Memorial Day"],
    ["2026-06-19", "Juneteenth"], ["2026-07-03", "Independence Day"],
    ["2026-09-07", "Labor Day"], ["2026-11-26", "Thanksgiving Day"],
    ["2026-11-27", "Day after Thanksgiving"], ["2026-12-25", "Christmas Day"],
    ["2026-12-28", "Day after Christmas"],
  ],
  // Labor law notices. Government postings, public by law, so they live in
  // the site files: shared/assets/docs/labor-law/. To update one, replace the
  // PDF (same file name) and edit the line here.
  laborNotices: [
    { group: "California", title: "Workplace Discrimination and Harassment", agency: "Civil Rights Department", file: "ca-discrimination-harassment.pdf" },
    { group: "California", title: "Sexual Harassment", agency: "Civil Rights Department", file: "ca-sexual-harassment.pdf" },
    { group: "California", title: "Transgender and Gender Nonconforming Employee Rights", agency: "Civil Rights Department", file: "ca-transgender-rights.pdf" },
    { group: "California", title: "Family Care, Medical Leave and Pregnancy Disability Leave", agency: "Civil Rights Department", file: "ca-family-medical-pregnancy-leave.pdf" },
    { group: "California", title: "Rights and Obligations as a Pregnant Employee", agency: "Civil Rights Department", file: "ca-pregnant-employee-rights.pdf" },
    { group: "California", title: "Paid Sick Leave", agency: "Labor Commissioner", file: "ca-paid-sick-leave.pdf" },
    { group: "California", title: "Unemployment, Disability and Paid Family Leave", agency: "EDD", file: "ca-edd-ui-di-pfl.pdf" },
    { group: "California", title: "Safety and Health Protection on the Job", agency: "Cal/OSHA", file: "ca-safety-health-calosha.pdf" },
    { group: "California", title: "Whistleblower Protections", agency: "Labor Commissioner", file: "ca-whistleblower.pdf" },
    { group: "California", title: "Time Off to Vote", agency: "Secretary of State", file: "ca-time-off-to-vote.pdf" },
    { group: "California", title: "Payday Notice (2026 pay dates)", agency: "Cornerstone HR", file: "../hr/2026-Pay-Dates.pdf" },
    { group: "Federal", title: "Minimum Wage and Overtime (FLSA)", agency: "U.S. Department of Labor", file: "fed-minimum-wage-flsa.pdf" },
    { group: "Federal", title: "Family and Medical Leave Act (FMLA)", agency: "U.S. Department of Labor", file: "fed-fmla.pdf" },
    { group: "Federal", title: "Know Your Rights: Workplace Discrimination", agency: "EEOC", file: "fed-eeo-know-your-rights.pdf" },
    { group: "Federal", title: "Employee Polygraph Protection Act", agency: "U.S. Department of Labor", file: "fed-polygraph.pdf" },
    { group: "Federal", title: "Uniformed Services Employment Rights (USERRA)", agency: "U.S. Department of Labor", file: "fed-userra.pdf" },
  ],
  hrDocs: {
    payDatesPdf: "../../shared/assets/docs/hr/2026-Pay-Dates.pdf",
    holidaysPdf: "../../shared/assets/docs/hr/2026-Holidays.pdf",
    handbookPdf: HANDBOOK_PDF,
  },

  // Photos for the welcome banner on Home. One is picked at random on each
  // visit. Files live in shared/assets/photos/ (web-sized, about 1800px wide).
  //   place:  optional label shown in the corner, e.g. "Brentwood"
  //   focus:  optional CSS object-position, to keep the subject in frame
  // Empty = plain CF teal banner. Add photos here when good ones come in.
  heroPhotos: [],

  contact: {
    name: "Ryan Bicker",
    email: "ryanb@cornerstoneweb.org",
    prompt: "Can't find something?",
  },

  // The things staff open every day, drawn as app icons on Home.
  //   icon:   a key from QUICK_ICONS in app.js
  //   accent: the tile color. ink: the icon color (default white). Use a
  //           dark ink on lime, which is too light for a white icon.
  //   url:    "#/..." stays in the hub; anything else opens a new tab.
  // Request forms live under Requests. Facilities is the one exception,
  // pinned here because staff use it often.
  quickActions: [
    { icon: "mail",   label: "Email",    note: "Outlook",          accent: "var(--teal)",   url: "https://outlook.office.com/" },
    { icon: "chat",   label: "Teams",    note: "Chat and calls",   accent: "var(--cyan)",   url: "https://teams.microsoft.com/v2/" },
    { icon: "people", label: "Central",  note: "CCB",              accent: "var(--jungle)", ink: "var(--lime)", url: "https://cornerstonefellowship.ccbchurch.com/goto/login" },
    { icon: "clock",  label: "OnePoint", note: "Pay and time off", accent: "var(--orange)", url: "https://secure.onehcm.com/ta/CFLCA.login?rnd=QSZ&NoRedirect=1" },
    { icon: "wrench", label: "Facilities", note: "Request",       accent: "var(--lime)",   ink: "var(--jungle)", url: "#/facilities" },
    { icon: "person", label: "Roster",   note: "Staff directory",  accent: "#FFFFFF",       ink: "var(--teal)",   url: "#/directory" },
  ],

  // Set to null when there is nothing to announce.
  //   level:  "info" (cyan) or "urgent" (orange)
  //   until:  "YYYY-MM-DD", hides itself after this date. Optional.
  //   link / linkLabel: optional call to action.
  announcement: {
    level: "info",
    text: "The Staff Hub is new. Tell Ryan what's missing or wrong.",
    link: "mailto:ryanb@cornerstoneweb.org?subject=Staff%20Hub%20feedback",
    linkLabel: "Send feedback",
    until: null,
  },

  sections: [
    {
      id: "requests", icon: "requests",
      accent: "var(--sec-requests)",
      title: "Requests",
      blurb: "Ask another team for something.",
      enabled: true,
      layout: "compact",
      reviewEvery: 12,
      cards: [
        {
          title: "Graphic Design",
          body: "Request digital or print designs for your ministry.",
          owner: "Communications",
          reviewed: null,
          links: [{ label: "Start a request", url: "https://forms.monday.com/forms/6de2b801c96808d6d23344a75eddab75?r=use1" }],
        },
        {
          title: "Video Design",
          body: "Start a video request for your ministry or program.",
          owner: "Communications",
          reviewed: null,
          links: [{ label: "Start a request", url: "https://forms.monday.com/forms/059e6ecd1f5dc95eb69f8138e27fc9c9?r=use1" }],
        },
        {
          title: "Web Design",
          body: "Need a new or updated webpage?",
          owner: "Communications",
          reviewed: null,
          links: [{ label: "Start a request", url: "https://forms.monday.com/forms/b4b919ea5e6710981ec65e4228f7d248?r=use1" }],
        },
        {
          title: "IT Support",
          body: "Something not working? Let us help.",
          owner: "Dennis",
          reviewed: null,
          // The old Wufoo form is retired. Link removed on purpose; a
          // replacement is a decision, not an oversight.
          links: [{ label: "Open a ticket", url: null, status: "pending" }],
        },
        {
          title: "Facilities",
          body: "Repairs, building issues, keys and access.",
          owner: "Joe",
          reviewed: null,
          // Points at the Facilities mockup (demo data) while Ryan and Joe review it.
          links: [{ label: "Start a request", url: "#/facilities" }],
        },
      ],
    },

    {
      id: "software", icon: "grid",
      accent: "var(--sec-software)",
      title: "Software",
      blurb: "The programs we use to get work done.",
      enabled: true,
      layout: "full",
      reviewEvery: 12,
      cards: [
        {
          title: "Office 365",
          body: "Our cloud productivity suite: email, calendars, file storage, and Word, Excel, PowerPoint, Teams and OneDrive. Keeps work connected and reachable from anywhere.",
          owner: "Dennis",
          reviewed: null,
          links: [
            { label: "Account page", url: "https://myaccount.microsoft.com/?ref=MeControl" },
            { label: "Email in your browser", url: "https://outlook.office.com/" },
            { label: "Set up your phone", url: "https://support.microsoft.com/en-us/office/set-up-office-apps-and-email-on-a-mobile-device-7dabb6cb-0046-40b6-81fe-767e0b1f014f" },
          ],
        },
        {
          title: "Teams",
          body: "Chat, video meetings, calls and file collaboration. Connected to Office 365, so documents and conversations live together.",
          owner: "Dennis",
          reviewed: null,
          links: [
            { label: "Download the app", url: "https://www.microsoft.com/en-us/microsoft-teams/download-app" },
            { label: "Open in your browser", url: "https://teams.microsoft.com/v2/" },
          ],
        },
        {
          title: "Central (CCB)",
          body: "Our church management system. People, groups, events, giving and volunteers in one place, so we can connect, communicate and follow up.",
          owner: "Ryan",
          reviewed: null,
          links: [
            { label: "Log in to Central", url: "https://cornerstonefellowship.ccbchurch.com/goto/login" },
            { label: "Help center", url: "https://support.pushpay.com/s/topics-chms", note: "hosted by CCB" },
            { label: "Guide documents", url: null, status: "pending" },
          ],
        },
        {
          title: "Canva",
          body: "Our design tool for graphics, presentations, flyers and social content. Drag-and-drop editing with templates and brand colors. For anything more involved, the Communications Team can help.",
          owner: "Communications",
          reviewed: null,
          links: [
            { label: "Request an account", url: "mailto:ryanb@cornerstoneweb.org" },
            { label: "Beginner's guide", url: "https://www.canva.com/learn/how-to-canva-beginners-guide/" },
            { label: "Request a design", url: "https://forms.monday.com/forms/6de2b801c96808d6d23344a75eddab75?r=use1" },
          ],
        },
        {
          title: "Ramp",
          body: "Our corporate card and expense platform. Purchasing, real-time spend tracking and automated expense reports.",
          owner: "Ryan",
          reviewed: null,
          links: [{ label: "Log in to Ramp", url: "https://app.ramp.com/sign-in" }],
        },
        {
          title: "OnePoint",
          body: "Your HR dashboard. Pay stubs, time off, benefits and personal information.",
          owner: "Bou",
          reviewed: null,
          links: [{ label: "Log in to OnePoint", url: "https://secure.onehcm.com/ta/CFLCA.login?rnd=QSZ&NoRedirect=1" }],
        },
      ],
    },

    {
      id: "hr", icon: "hr",
      accent: "var(--sec-hr)",
      title: "Human Resources",
      blurb: "Pay, time off, policies and paperwork.",
      enabled: true,
      layout: "compact",
      reviewEvery: 6,
      cards: [
        {
          title: "Staff Roster",
          body: "Who does what around here. Chat, call or email anyone on staff.",
          owner: "Bou",
          reviewed: "2025-10-01", // from the old file name, Updated October 2025
          reviewEvery: 3,
          links: [{ label: "Open the roster", url: "#/directory" }],
        },
        {
          title: "Pay Dates",
          body: "When you get paid in 2026.",
          dynamic: "nextPayday",   // body shows the next payday, computed live
          owner: "Bou",
          reviewed: "2026-09-22",
          reviewEvery: 12,
          links: [
            { label: "See all pay dates", url: "#/paydates" },
            { label: "Download PDF", url: "../../shared/assets/docs/hr/2026-Pay-Dates.pdf", download: true },
          ],
        },
        {
          title: "Holidays",
          body: "When the offices are closed in 2026.",
          dynamic: "nextHoliday",
          owner: "Bou",
          reviewed: "2026-09-22",
          reviewEvery: 12,
          links: [
            { label: "See all holidays", url: "#/holidays" },
            { label: "Download PDF", url: "../../shared/assets/docs/hr/2026-Holidays.pdf", download: true },
          ],
        },
        {
          title: "Employee Handbook",
          body: "Policies, expectations and how things work here.",
          owner: "Bou",
          reviewed: "2025-04-23", // from the old file name, Revised 04.23.25
          reviewEvery: 12,
          // Searchable text lives in the locked handbook_sections table. The PDF
          // itself stays in SharePoint/OneDrive (link opens for CF accounts only).
          links: [
            { label: "Search the handbook", url: "#/handbook" },
            { label: "Open the PDF", url: HANDBOOK_PDF },
          ],
        },
        {
          title: "Labor Law Notices",
          body: "California and federal labor law postings.",
          owner: "Bou",
          reviewed: null,
          reviewEvery: 12,
          links: [{ label: "See all notices", url: "#/laborlaw" }],
        },
        {
          title: "OnePoint",
          body: "Pay stubs, time off requests and benefits.",
          owner: "Bou",
          reviewed: null,
          links: [{ label: "Log in to OnePoint", url: "https://secure.onehcm.com/ta/CFLCA.login?rnd=QSZ&NoRedirect=1" }],
        },
      ],
    },

    {
      id: "brand", icon: "layers",
      accent: "var(--sec-brand)",
      title: "Brand",
      blurb: "Logos, colors, and how to use them.",
      enabled: true,
      layout: "brand",
      reviewEvery: 12,

      // Where the brand actually lives day to day.
      home: {
        title: "Everything starts in Canva",
        body: "Our templates, brand colors and fonts are already set up in Canva. Building there is faster than starting from a blank file, and it keeps everything looking like us. If a project is bigger than a template, the Communications Team can take it from here.",
        links: [
          { label: "Open Canva", url: "https://www.canva.com/" },
          { label: "Request an account", url: "mailto:ryanb@cornerstoneweb.org?subject=Canva%20account%20request" },
          { label: "Request a design", url: "https://forms.monday.com/forms/6de2b801c96808d6d23344a75eddab75?r=use1" },
        ],
      },

      // Values sampled from the master brand library, 2026-09-20.
      // See 00_Program/brand-notes.md on the three blues in circulation.
      palette: {
        primary: [
          { name: "Cerulean", hex: "#07AED9" },
          { name: "Black", hex: "#000000" },
          { name: "White", hex: "#FFFFFF" },
        ],
        secondary: [
          { name: "Cadmium Orange", hex: "#F78C2E" },
          { name: "Bitter Lemon", hex: "#CEDC2D" },
          { name: "Dark Grey", hex: "#585C5F" },
          { name: "Light Gray", hex: "#D3D4D6" },
        ],
        note: "Tap a swatch to copy the hex. The church website uses a slightly deeper blue (#0693B2) for links and buttons; Communications is reconciling the two.",
      },

      // Practical guidance, not policy. Communications has the final say.
      guides: [
        {
          title: "Which mark to use",
          body: "Start with the full Cornerstone logo. Use the icon on its own only when space is genuinely tight, like an avatar or a favicon. Use a campus or ministry mark when the material belongs to that campus or team specifically, not for general church communication.",
        },
        {
          title: "Black, white or blue",
          body: "Black on light backgrounds, white on dark or on photos. Blue is for when the mark needs to carry color on its own. If a logo is hard to read against what is behind it, you picked the wrong version, not the wrong background.",
        },
        {
          title: "PNG or JPG",
          body: "PNG almost always. It has a transparent background, so it sits on any color. Use JPG only when something refuses to accept a PNG. The white JPGs come with a black background baked in, which is usually not what you want.",
        },
        {
          title: "Leave it alone",
          body: "Do not stretch it, recolor it, add effects, or rebuild it from scratch. Give it a clear margin roughly the height of the letters around all sides. If you need something these files do not cover, ask rather than improvise.",
        },
      ],

      cards: [],
    },

    {
      id: "paydates",
      accent: "var(--sec-hr)",
      title: "Pay Dates",
      blurb: "Paydays are every other Thursday. Earlier when a holiday gets in the way.",
      enabled: true, placement: "linked", parent: "hr", layout: "paydates", cards: [],
    },
    {
      id: "holidays",
      accent: "var(--sec-hr)",
      title: "Holidays",
      blurb: "Days the offices are closed.",
      enabled: true, placement: "linked", parent: "hr", layout: "holidays", cards: [],
    },

    {
      id: "laborlaw",
      accent: "var(--sec-hr)",
      title: "Labor Law Notices",
      blurb: "The California and federal workplace notices every employee has a right to see.",
      enabled: true, placement: "linked", parent: "hr", layout: "laborlaw", cards: [],
    },

    {
      id: "handbook",
      accent: "var(--sec-hr)",
      title: "Employee Handbook",
      blurb: "Search any policy, or browse by section. Page numbers match the PDF.",
      // Text comes from the locked handbook_sections table after sign-in.
      enabled: true, placement: "linked", parent: "hr", layout: "handbook", cards: [],
    },

    {
      id: "directory",
      accent: "var(--sec-hr)",
      title: "Staff Roster",
      // placement: "linked" = its own page, but no sidebar entry. Reached from
      // the Staff Roster card on Human Resources. parent keeps HR highlighted.
      placement: "linked",
      parent: "hr",
      blurb: "Find anyone on staff and reach them in Teams.",
      enabled: true,
      // People are NOT listed here. They load from the locked staff_directory
      // table in Supabase after sign-in, so the roster never sits in the
      // public repo. See db/migrations/0003_staff_directory.sql.
      layout: "directory",
      reviewEvery: 6,
      cards: [],
    },

    {
      id: "values",
      accent: "var(--sec-values)",
      title: "Our Staff Values",
      blurb: "The five we hold each other to.",
      enabled: true,
      // placement: "home" means this section has no page and no nav entry.
      // It renders on Home under the welcome. Cards stay searchable and the
      // admin view still tracks them. Delete this line to give it a page back.
      placement: "home",
      layout: "values",
      reviewEvery: 24,
      cards: [
        {
          title: "We Are Healthy", short: "Caring for your whole self, as worship.", accent: "var(--lime-d)", icon: "heart",
          body: "Live a balanced life that honors God by caring for your whole self: spiritually, physically, emotionally, mentally, financially, and within your family. Steward your body and life as God's temple, pursuing habits that reflect worship in all areas.",
          meta: "1 Corinthians 3:16-17, 4:5, 6:19-20, 10:31; 1 Timothy 4:8",
          owner: "Chris", reviewed: null,
        },
        {
          title: "We Are Honest", short: "Talk with people, not about them.", accent: "var(--teal)", icon: "talk",
          body: "When differences arise, we go directly to each other for understanding, lead with grace and truth, talk with people not about them, and stay open and vulnerable.",
          meta: "Matthew 18; 1 Corinthians 4:4, 4:19-21, 6:1-11, 13:6; 2 Corinthians 7:8-16",
          owner: "Chris", reviewed: null,
        },
        {
          title: "We Are Hungry", short: "A whatever-it-takes attitude.", accent: "var(--orange)", icon: "flame",
          body: "Work diligently with a mindset of perseverance and growth. Set goals, pursue excellence, and maintain a whatever-it-takes attitude marked by healthy competition and reliance on God's grace to accomplish what He has called you to.",
          meta: "1 Corinthians 4:11-13, 15:10",
          owner: "Chris", reviewed: null,
        },
        {
          title: "We Are Hopeful", short: "Owners, not renters.", accent: "var(--sec-guides)", icon: "sunrise",
          body: "We trust where God is leading Cornerstone, believing the best, not assuming the worst. We stay open-handed, open to change, and act as owners, not renters.",
          meta: "1 Corinthians 13:7; 2 Corinthians 1:10-11, 13:11",
          owner: "Chris", reviewed: null,
        },
        {
          title: "We Are Humble", short: "God's promotion, not self-promotion.", accent: "var(--sec-values)", icon: "sprout",
          body: "We admit mistakes, celebrate teammates, listen well, and don't take ourselves too seriously. We seek God's promotion, not self-promotion.",
          meta: "1 Corinthians 4:6-7, 4:18-19, 13:4; 2 Corinthians 12:9",
          owner: "Chris", reviewed: null,
        },
      ],
    },

    { id: "resources", icon: "book", accent: "var(--sec-default)", title: "Resources", blurb: "Coming in a future release.", enabled: false, layout: "compact", cards: [] },
    { id: "tutorials", icon: "play", accent: "var(--sec-default)", title: "Tutorials", blurb: "Coming in a future release.", enabled: false, layout: "compact", cards: [] },
    {
      id: "guides", icon: "book",
      accent: "var(--sec-guides)",
      title: "Reference Guides",
      blurb: "How to do the things that come up.",
      enabled: false,   // parked for V2. Cards below are kept, not shown.
      layout: "compact",
      reviewEvery: 12,
      cards: [
        {
          title: "Reserve a Room: Livermore",
          body: "How to book space at the Livermore campus.",
          owner: "Joe",
          reviewed: null,
          links: [{ label: "Open the guide", url: null, status: "sharepoint" }],
        },
        {
          title: "Reserve a Room: Other Campuses",
          body: "Brentwood, Walnut Creek, San Ramon Valley, Hayward.",
          owner: "Joe",
          reviewed: null,
          links: [{ label: "Open the guide", url: null, status: "pending" }],
        },
      ],
    },

  ],
};
