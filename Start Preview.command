#!/bin/bash
# Double-click this in Finder to preview the CF internal tools locally.
# It starts a local server, opens your browser, and reloads the page
# automatically whenever a file changes. Close this window to stop.

cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "  Node isn't installed, or isn't on this shell's PATH."
  echo "  Install it from https://nodejs.org (the LTS build), then"
  echo "  double-click this file again."
  echo ""
  read -r -p "  Press Return to close. "
  exit 1
fi

clear
node scripts/serve.mjs

echo ""
echo "  Preview stopped."
read -r -p "  Press Return to close. "
