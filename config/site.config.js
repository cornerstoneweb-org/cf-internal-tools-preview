// Site-wide configuration. Copy and structure live here, not in code.
// A wording change should be a one-line edit in this file.

export const SITE = {
  orgName: "Cornerstone Fellowship",
  siteTitle: "Cornerstone Staff Tools",
  supportContact: "", // who staff email when a tool is broken
};

// The preview (staging) site. Same code and same Supabase as live, but every
// tool shows regardless of its flag below, and the page wears a Preview badge.
// localhost is always treated as preview.
// GitHub's default address for the cf-internal-tools-preview repo. Live has a
// custom domain, so this hostname only ever serves the preview copy.
export const PREVIEW_HOSTS = ["cornerstoneweb-org.github.io"];

export const CAMPUSES = [
  { id: "livermore", name: "Livermore" },
  { id: "brentwood", name: "Brentwood" },
  { id: "walnut-creek", name: "Walnut Creek" },
  { id: "san-ramon-valley", name: "San Ramon Valley" },
  { id: "hayward", name: "Hayward" },
  { id: "online", name: "Online" },
];

// Feature flags. A tool only appears on the home page and only loads when
// enabled. Build a tool fully before flipping it on. On a preview host every
// tool shows, so it can be tested there first.
export const TOOLS = [
  {
    id: "staff-hub",
    name: "Staff Hub",
    blurb: "Everything staff need in one place.",
    path: "tools/staff-hub/",
    enabled: true,
    owner: "Ryan",
  },
  {
    id: "facilities",
    name: "Facilities Request",
    blurb: "Submit and track a facilities request.",
    path: "tools/facilities/",
    enabled: false,
    owner: "Joe",
  },
  {
    id: "it",
    name: "IT Request",
    blurb: "Submit and track an IT request.",
    path: "tools/it/",
    enabled: false,
    owner: "Dennis",
  },
  {
    id: "comms",
    name: "Comms Request",
    blurb: "Request a communication or announcement.",
    path: "tools/comms/",
    enabled: false,
    owner: "TBD",
  },
];

// Roles used by auth and RLS. Keep this list and the database in sync.
export const ROLES = ["staff", "facilities_admin", "it_admin", "comms_admin", "super_admin"];
