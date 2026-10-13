#!/bin/bash
# Double-click once. Keeps the local preview running in the background
# whenever you're logged in to this Mac, so this bookmark always works:
#
#     http://localhost:4173/tools/staff-hub/
#
# Double-click again to turn it off. Pages reload on their own when a
# file changes. Nothing here touches GitHub or the live site.

cd "$(dirname "$0")" || exit 1
REPO="$(pwd)"
LABEL="org.cornerstoneweb.cf-preview"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
URL="http://localhost:4173/tools/staff-hub/"

if [ -f "$PLIST" ]; then
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
  rm -f "$PLIST"
  echo ""
  echo "  Always-on preview is OFF."
  echo "  Double-click this file again to turn it back on."
  echo ""
  read -r -p "  Press Return to close. "
  exit 0
fi

NODE="$(command -v node)"
if [ -z "$NODE" ]; then
  echo ""
  echo "  Node isn't installed. Get the LTS build from https://nodejs.org,"
  echo "  then double-click this file again."
  echo ""
  read -r -p "  Press Return to close. "
  exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE</string>
    <string>$REPO/scripts/serve.mjs</string>
    <string>--no-open</string>
  </array>
  <key>WorkingDirectory</key><string>$REPO</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/cf-preview.log</string>
  <key>StandardErrorPath</key><string>/tmp/cf-preview.log</string>
</dict>
</plist>
PL

launchctl bootstrap "gui/$(id -u)" "$PLIST"
sleep 1
open "$URL"
echo ""
echo "  Always-on preview is ON."
echo "  Bookmark this:  $URL"
echo "  It starts by itself when you log in. Double-click this file to turn it off."
echo ""
read -r -p "  Press Return to close. "
