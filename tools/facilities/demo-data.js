// MADE-UP requests for the mockup. Every requester name here is fictional.
// "me" stands for whoever is signed in, so "My requests" has something in it.
// This file goes away once requests live in Supabase.

const H = 3600000;
const D = 24 * H;

// A soft placeholder "photo" so the layout shows what an attached picture
// looks like without shipping a real image.
const photo = (label, a, b) => ({ name: label, url: "data:image/svg+xml;base64," + btoa(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><g fill="none" stroke="#fff" stroke-width="10" stroke-linejoin="round" opacity=".85"><rect x="140" y="110" width="120" height="86" rx="14"/><circle cx="200" cy="153" r="24"/><path d="M172 110l10-16h36l10 16"/></g><text x="200" y="240" font-family="Helvetica,Arial" font-size="20" fill="#fff" text-anchor="middle" opacity=".9">${label}</text></svg>`) });

export function demoRequests(now = Date.now()) {
  const at = (ago) => new Date(now - ago).toISOString();
  const a = (ago, by, text, extra = {}) => ({ at: at(ago), by, text, ...extra });
  // Teams entries record who got a message and why. The page words them.
  const teams = (ago, to, text) => ({ at: at(ago), by: "system", text, kind: "teams", to });

  return [
    {
      id: 1048, type: "repair", campus: "livermore", location: "Kids wing, room 4",
      title: "Ceiling tile stained and sagging",
      details: "Brown water stain on two ceiling tiles above the reading corner. One is starting to sag. Noticed it Sunday morning after the rain.",
      priority: "emergency", status: "new", assignee: null,
      requester: { id: "r6", name: "Hannah B." }, createdAt: at(3 * H),
      photos: [photo("ceiling-tile.jpg", "#8FA3AD", "#4E5F68")],
      approval: null,
      activity: [a(3 * H, "r6", "Submitted"), teams(3 * H, "joe", "New emergency request")],
    },
    {
      id: 1047, type: "repair", campus: "brentwood", location: "Front office",
      title: "Office door won't lock",
      details: "The deadbolt turns but doesn't catch. We've been leaving the office unlocked overnight.",
      priority: "emergency", status: "progress", assignee: "eric",
      requester: { id: "me", name: "" }, createdAt: at(1 * D + 2 * H),
      keys: { who: "Front office staff", where: "Front office main door" },
      photos: [], approval: null,
      activity: [
        a(1 * D + 2 * H, "me", "Submitted"),
        teams(1 * D + 2 * H, "joe", "New emergency request"),
        a(1 * D + 1 * H, "joe", "Assigned to Eric"),
        teams(1 * D + 1 * H, "eric", "Assigned to you"),
      ],
    },
    {
      id: 1046, type: "repair", campus: "walnut-creek", location: "Lobby restroom (men's)",
      title: "Toilet runs constantly",
      details: "Second stall from the door. Jiggling the handle helps for a minute.",
      priority: "week", status: "new", assignee: null,
      requester: { id: "r2", name: "Ben O." }, createdAt: at(2 * D),
      photos: [], approval: null,
      activity: [a(2 * D, "r2", "Submitted"), teams(2 * D, "joe", "New request")],
    },
    {
      id: 1045, type: "repair", campus: "livermore", location: "Worship center, stage left",
      title: "HVAC unit making a grinding noise",
      details: "Loud grinding from the unit behind stage left when it kicks on. You can hear it during quiet moments in the service.",
      priority: "week", status: "progress", assignee: "vendor", vendor: "HVAC contractor",
      requester: { id: "r4", name: "Daniel P." }, createdAt: at(9 * D),
      photos: [], approval: { state: "pending", amount: "$2,450", note: "Blower motor and bearings. Vendor quote attached in the real version.", by: "joe", at: at(1 * D) },
      activity: [
        a(9 * D, "r4", "Submitted"),
        teams(9 * D, "joe", "New request"),
        a(8 * D, "joe", "Assigned to Vendor (HVAC contractor)"),
        a(1 * D, "joe", "Sent to Ryan for approval · $2,450"),
        teams(1 * D, "ryan", "Approval needed · $2,450"),
      ],
    },
    {
      id: 1044, type: "repair", campus: "san-ramon-valley", location: "Parking lot, east side",
      title: "Two lot lights out",
      details: "The two poles nearest the east entrance are dark. It's very dim for evening groups.",
      priority: "week", status: "progress", assignee: "eric",
      requester: { id: "r3", name: "Grace L." }, createdAt: at(11 * D),
      photos: [photo("lot-lights.jpg", "#2D3B4A", "#0F1720")], approval: null,
      activity: [
        a(11 * D, "r3", "Submitted"),
        teams(11 * D, "joe", "New request"),
        a(10 * D, "joe", "Assigned to Eric"),
        teams(10 * D, "eric", "Assigned to you"),
      ],
    },
    {
      id: 1043, type: "repair", campus: "hayward", location: "Kitchen",
      title: "Dishwasher not draining",
      details: "Standing water in the bottom after every cycle.",
      priority: "whenever", status: "new", assignee: null,
      requester: { id: "me", name: "" }, createdAt: at(4 * D),
      photos: [], approval: null,
      activity: [a(4 * D, "me", "Submitted"), teams(4 * D, "joe", "New request")],
    },
    {
      id: 1042, type: "repair", campus: "livermore", location: "Student center",
      title: "Key for new student ministry intern",
      details: "Starting next Monday. Needs the student center and the storage closet behind it.",
      priority: "week", status: "done", assignee: "joe",
      requester: { id: "r5", name: "Luis M." }, createdAt: at(15 * D),
      keys: { who: "New student ministry intern", where: "Student center, back storage closet", needBy: new Date(now - 8 * D).toISOString().slice(0, 10) },
      photos: [], approval: null,
      activity: [
        a(15 * D, "r5", "Submitted"),
        teams(15 * D, "joe", "New request"),
        a(14 * D, "joe", "Assigned to Joe"),
        a(10 * D, "joe", "Marked Done"),
        teams(10 * D, "r5", "Your request is done"),
      ],
    },
    {
      id: 1041, type: "repair", campus: "brentwood", location: "Room 12",
      title: "Window blind broken",
      details: "The pull cord snapped, blind is stuck halfway.",
      priority: "whenever", status: "done", assignee: "eric",
      requester: { id: "me", name: "" }, createdAt: at(20 * D),
      photos: [], approval: null,
      activity: [
        a(20 * D, "me", "Submitted"),
        teams(20 * D, "joe", "New request"),
        a(19 * D, "joe", "Assigned to Eric"),
        a(16 * D, "eric", "Marked Done"),
        teams(16 * D, "me", "Your request is done"),
      ],
    },
    {
      id: 1040, type: "repair", campus: "walnut-creek", location: "Courtyard",
      title: "Sprinkler head broken, water pooling",
      details: "One sprinkler head by the courtyard benches is snapped off. Big puddle every morning.",
      priority: "week", status: "progress", assignee: "joe",
      requester: { id: "r1", name: "Maya T." }, createdAt: at(13 * D),
      photos: [], approval: null,
      activity: [
        a(13 * D, "r1", "Submitted"),
        teams(13 * D, "joe", "New request"),
        a(12 * D, "joe", "Assigned to Joe"),
      ],
    },
  ];
}
