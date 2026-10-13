import { CONFIG } from "./config.js";
import { renderHeader } from "../../shared/js/ui.js";
// import { requireStaff } from "../../shared/js/auth.js";

renderHeader(document.getElementById("header"), { current: CONFIG.id });

// await requireStaff();  // enable once docs/auth.md is resolved

document.getElementById("app").innerHTML = `<p>${CONFIG.emptyState}</p>`;
