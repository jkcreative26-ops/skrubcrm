#!/usr/bin/env bash
# ── SkrubCRM v3 — Post-Deploy Smoke Test ────────────────────────────────────
# Hits 5 critical paths on the live site and reports pass/fail for each.
# Run AFTER deploy.sh completes and Vercel redeploy finishes (~60s).
#
# USAGE:
#   bash verify.sh
#
# REQUIRES: curl
# ────────────────────────────────────────────────────────────────────────────

set -euo pipefail

BASE_URL="https://skrubcrm.com"
PASS=0
FAIL=0

check() {
  local label="$1"
  local url="$2"
  local expected_status="${3:-200}"
  local body_contains="${4:-}"

  response=$(curl -sf -o /tmp/skrub_verify_body -w "%{http_code}" \
    -H "User-Agent: SkrubCRM-smoke-test/1.0" \
    --max-time 10 \
    "$url" 2>/dev/null) || response="000"

  if [[ "$response" != "$expected_status" ]]; then
    echo "  ❌  [$label] Expected HTTP $expected_status, got $response — $url"
    FAIL=$((FAIL + 1))
    return
  fi

  if [[ -n "$body_contains" ]]; then
    if ! grep -q "$body_contains" /tmp/skrub_verify_body 2>/dev/null; then
      echo "  ❌  [$label] Response missing expected content: \"$body_contains\""
      FAIL=$((FAIL + 1))
      return
    fi
  fi

  echo "  ✓  [$label] HTTP $response"
  PASS=$((PASS + 1))
}

check_post() {
  local label="$1"
  local url="$2"
  local body="$3"
  local expected_status="${4:-400}"  # webhook endpoints reject unsigned requests — 400 = handler is alive

  response=$(curl -sf -o /tmp/skrub_verify_body -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "User-Agent: SkrubCRM-smoke-test/1.0" \
    --max-time 10 \
    -d "$body" \
    "$url" 2>/dev/null) || response="000"

  if [[ "$response" == "$expected_status" || "$response" == "400" || "$response" == "200" ]]; then
    echo "  ✓  [$label] HTTP $response (endpoint alive)"
    PASS=$((PASS + 1))
  else
    echo "  ❌  [$label] Unexpected HTTP $response — $url"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║       SkrubCRM v3 — Smoke Test                       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Target: $BASE_URL"
echo ""

# ── 1. Homepage loads ─────────────────────────────────────────────────────────
echo "▶ Checking site health..."
check "Homepage"        "$BASE_URL"              200
check "HTTPS redirect"  "http://skrubcrm.com"    301

# ── 2. Security headers present ───────────────────────────────────────────────
echo ""
echo "▶ Checking security headers..."
headers=$(curl -sf -I --max-time 10 "$BASE_URL" 2>/dev/null || echo "")

for header in "strict-transport-security" "x-content-type-options" "x-frame-options" "content-security-policy"; do
  if echo "$headers" | grep -qi "$header"; then
    echo "  ✓  [$header]"
    PASS=$((PASS + 1))
  else
    echo "  ❌  [$header] header missing"
    FAIL=$((FAIL + 1))
  fi
done

# ── 3. Webhook endpoint is alive (expects 400 on unsigned POST — not 404/500) ─
echo ""
echo "▶ Checking webhook endpoint..."
check_post "Webhook alive" \
  "$BASE_URL/api/square-webhook" \
  '{"type":"test"}' \
  400

# ── 4. Health endpoint — env vars + Supabase reachable ───────────────────────
echo ""
echo "▶ Checking /api/health..."
check "Health endpoint" "$BASE_URL/api/health" 200

# ── 5. Portal route returns 401 without session (not 404) ─────────────────────
echo ""
echo "▶ Checking portal auth gate..."
portal_status=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/api/portal/me" 2>/dev/null || echo "000")
if [[ "$portal_status" == "401" ]]; then
  echo "  ✓  [Portal auth gate] Returns 401 for unauthenticated requests"
  PASS=$((PASS + 1))
else
  echo "  ❌  [Portal auth gate] Expected 401, got $portal_status"
  FAIL=$((FAIL + 1))
fi

# ── 6. No X-Powered-By header (fingerprint hidden) ────────────────────────────
echo ""
echo "▶ Checking fingerprint suppression..."
if echo "$headers" | grep -qi "x-powered-by"; then
  echo "  ❌  [X-Powered-By] header exposed — check next.config.js poweredByHeader"
  FAIL=$((FAIL + 1))
else
  echo "  ✓  [X-Powered-By] not exposed"
  PASS=$((PASS + 1))
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
total=$((PASS + FAIL))
echo "╔══════════════════════════════════════════════════════╗"
if [[ $FAIL -eq 0 ]]; then
  echo "║  ✅  All $total checks passed. Site is live.              ║"
  echo "║                                                      ║"
  echo "║  Next: run a sandbox payment end-to-end:             ║"
  echo "║  Square test card: 4111 1111 1111 1111               ║"
else
  echo "║  ⚠️   $PASS/$total passed — $FAIL check(s) failed.                ║"
  echo "║  Review errors above before running a payment test.  ║"
fi
echo "╚══════════════════════════════════════════════════════╝"
echo ""

[[ $FAIL -gt 0 ]] && exit 1 || exit 0
