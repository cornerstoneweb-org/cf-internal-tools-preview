// Facilities Requests is drawn inside the Staff Hub (see facilities.js) so it
// shares the hub's nav and Microsoft sign-in. Anyone landing on this folder
// is sent there.
location.replace("../staff-hub/#/facilities" + location.hash.replace(/^#\/?facilities/, ""));
