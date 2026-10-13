// Excel to JSON build step. One schema, many datasets.
// Usage: node scripts/build-data.mjs <tool>
//
// Not implemented yet. Fill in once the first workbook exists.
// Requires: npm i xlsx

import path from "node:path";
import os from "node:os";

export const ONEDRIVE_ROOT = path.join(
  os.homedir(),
  "Library/CloudStorage/OneDrive-CornerstoneFellowshipofLivermoreCalifornia",
  "CF Work Files/11_CLAUDE_Code/Staff Internal Tools_CC"
);

const tool = process.argv[2];
if (!tool) {
  console.error("Usage: node scripts/build-data.mjs <tool>");
  process.exit(1);
}

console.log(`No build defined for "${tool}" yet.`);
console.log(`Workbooks expected under: ${ONEDRIVE_ROOT}`);
