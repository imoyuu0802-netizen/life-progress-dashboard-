#!/bin/sh
set -eu

REPO_ROOT=$(git rev-parse --show-toplevel)
SITE_ID="560ce99f-7b43-4d07-acf1-6a9db372a9ec"
DEPLOY_ZIP="$REPO_ROOT/life-progress-dashboard-deploy.zip"

if command -v npx >/dev/null 2>&1; then
  NPX=$(command -v npx)
elif [ -x "/Applications/Codex.app/Contents/Resources/cua_node/bin/npx" ]; then
  NPX="/Applications/Codex.app/Contents/Resources/cua_node/bin/npx"
else
  echo "Netlify publish skipped: npx is unavailable." >&2
  exit 1
fi

cd "$REPO_ROOT"

DEPLOY_FILES="index.html styles.css app.js sw.js manifest.webmanifest icon.svg netlify.toml DEPLOY.md README.md .gitignore firebase-config.js firebase-sync.js firestore.rules FIREBASE_SETUP.md jflec-data.js"

if [ -f "$DEPLOY_ZIP" ]; then
  # shellcheck disable=SC2086
  zip -q -r -FS "$DEPLOY_ZIP" $DEPLOY_FILES
else
  # shellcheck disable=SC2086
  zip -q -r "$DEPLOY_ZIP" $DEPLOY_FILES
fi

DEPLOY_DIR=$(mktemp -d "${TMPDIR:-/tmp}/fire-dashboard-deploy.XXXXXX")
trap 'rm -rf "$DEPLOY_DIR"' EXIT INT TERM
unzip -q "$DEPLOY_ZIP" -d "$DEPLOY_DIR"

PATH="$(dirname "$NPX"):$PATH" "$NPX" --yes --package netlify-cli netlify deploy \
  --prod \
  --dir "$DEPLOY_DIR" \
  --site "$SITE_ID" \
  --message "Auto deploy $(git rev-parse --short HEAD)" \
  --json
