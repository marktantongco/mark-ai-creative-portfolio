#!/usr/bin/env bash
# =============================================================
# deploy.sh — one-shot deploy for the Cloudflare Analytics Worker
# =============================================================
#
# What this does:
#   1. Verifies wrangler is installed (and the user is logged in).
#   2. Creates the ANALYTICS_KV namespace if it doesn't exist yet.
#   3. Substitutes ${ANALYTICS_KV_ID} in wrangler.toml.
#   4. Deploys the Worker via `wrangler deploy`.
#   5. Prints the Worker URL — copy this into NEXT_PUBLIC_ANALYTICS_ENDPOINT
#      in your GitHub Actions secrets.
#
# Idempotent: re-running redeploys the same Worker (no duplicate namespaces).
#
# Failure modes:
#   - wrangler not installed → exit 1 with install instructions
#   - not logged in → wrangler prompts, then either proceeds or exits
#   - KV namespace creation race (two simultaneous runs) → second run sees
#     the namespace already exists and reuses it
#   - wrangler.toml has ${ANALYTICS_KV_ID} but env var unset → exit 1
#     telling user to export it
# -------------------------------------------------------------

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Color helpers (no-op if not a TTY, so CI logs are clean)
if [ -t 1 ]; then
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  RED='\033[0;31m'
  CYAN='\033[0;36m'
  NC='\033[0m'
else
  GREEN='' YELLOW='' RED='' CYAN='' NC=''
fi

log()  { echo -e "${GREEN}[deploy]${NC} $*"; }
warn() { echo -e "${YELLOW}[deploy]${NC} $*"; }
err()  { echo -e "${RED}[deploy]${NC} $*" >&2; }
step() { echo -e "${CYAN}[deploy]${NC} $*"; }

# -------------------------------------------------------------
# Step 1 — wrangler presence + auth
# -------------------------------------------------------------
if ! command -v wrangler >/dev/null 2>&1; then
  err "wrangler not found."
  err "Install: npm install -g wrangler (or: brew install cloudflare-wrangler)"
  exit 1
fi
log "wrangler version: $(wrangler --version)"

# `wrangler whoami` exits non-zero if not logged in
if ! wrangler whoami >/dev/null 2>&1; then
  step "Not logged in. Launching browser for OAuth…"
  wrangler login
fi
log "Authenticated as: $(wrangler whoami 2>&1 | grep -iE 'account|email' | head -1 || echo '(unknown)')"

# -------------------------------------------------------------
# Step 2 — KV namespace
# -------------------------------------------------------------
NAMESPACE_NAME="ANALYTICS_KV"

# Try to find an existing namespace with the binding name. wrangler's KV
# list output is JSON; we use jq if available, else grep.
step "Looking for existing KV namespace: $NAMESPACE_NAME"
EXISTING_ID=""
if command -v jq >/dev/null 2>&1; then
  EXISTING_ID=$(wrangler kv:namespace list 2>/dev/null \
    | jq -r --arg n "$NAMESPACE_NAME" '.[] | select(.title == $n) | .id' 2>/dev/null \
    | head -1 || true)
else
  EXISTING_ID=$(wrangler kv:namespace list 2>/dev/null \
    | grep -B1 "\"title\":\"$NAMESPACE_NAME\"" \
    | grep -oE '"id":"[a-f0-9]+"' \
    | head -1 \
    | cut -d'"' -f4 || true)
fi

if [ -n "$EXISTING_ID" ]; then
  log "Reusing existing KV namespace: $NAMESPACE_NAME (id=$EXISTING_ID)"
else
  step "Creating KV namespace: $NAMESPACE_NAME"
  CREATE_OUT=$(wrangler kv:namespace create "$NAMESPACE_NAME" 2>&1) || {
    err "Failed to create KV namespace:"
    err "$CREATE_OUT"
    exit 1
  }
  # Output looks like: ... id = "abc123..."
  EXISTING_ID=$(echo "$CREATE_OUT" | grep -oE 'id = "[a-f0-9]+"' | head -1 | cut -d'"' -f2)
  if [ -z "$EXISTING_ID" ]; then
    err "Could not parse namespace id from wrangler output:"
    err "$CREATE_OUT"
    err "Set ANALYTICS_KV_ID manually and re-run."
    exit 1
  fi
  log "Created KV namespace: $NAMESPACE_NAME (id=$EXISTING_ID)"
fi

# -------------------------------------------------------------
# Step 3 — substitute KV id into wrangler.toml
# -------------------------------------------------------------
export ANALYTICS_KV_ID="$EXISTING_ID"
step "Using ANALYTICS_KV_ID=$ANALYTICS_KV_ID"

# Sanity-check that wrangler.toml has the placeholder (so substitution works)
if ! grep -q '\${ANALYTICS_KV_ID}' wrangler.toml; then
  warn "wrangler.toml does not contain \${ANALYTICS_KV_ID} — using literal id in file."
  warn "If the file has a hard-coded id, this is fine. If not, the deploy will fail."
fi

# -------------------------------------------------------------
# Step 4 — deploy
# -------------------------------------------------------------
step "Running: wrangler deploy"
DEPLOY_OUT=$(wrangler deploy 2>&1) || {
  err "wrangler deploy failed:"
  err "$DEPLOY_OUT"
  exit 1
}
echo "$DEPLOY_OUT"

# -------------------------------------------------------------
# Step 5 — extract + print the Worker URL for the user
# -------------------------------------------------------------
WORKER_URL=$(echo "$DEPLOY_OUT" | grep -oE 'https://[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev' | head -1 || true)
if [ -z "$WORKER_URL" ]; then
  warn "Could not parse Worker URL from wrangler output."
  warn "Look for it in the deploy output above (often under 'Published ...')."
else
  echo ""
  echo -e "${GREEN}============================================================${NC}"
  echo -e "${GREEN}✅ Worker deployed successfully${NC}"
  echo -e "${GREEN}============================================================${NC}"
  echo ""
  echo -e "Worker URL: ${CYAN}${WORKER_URL}${NC}"
  echo ""
  echo "NEXT STEP — set this in your GitHub Actions secret:"
  echo "  Repository → Settings → Secrets and variables → Actions → New secret"
  echo "  Name:  NEXT_PUBLIC_ANALYTICS_ENDPOINT"
  echo "  Value: ${WORKER_URL}"
  echo ""
  echo "Also set (for re-deploys from CI):"
  echo "  Name:  ANALYTICS_KV_ID"
  echo "  Value: ${ANALYTICS_KV_ID}"
  echo ""
  echo "Once both secrets are set, the next push to main will build with"
  echo "the analytics endpoint wired up — the local buffer will drain to"
  echo "the Worker on GitHub Pages for the first time."
fi
