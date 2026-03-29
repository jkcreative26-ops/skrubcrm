#!/usr/bin/env bash
# ── SkrubCRM v3 — Full Deployment Script ─────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.deploy"
[[ ! -f "$ENV_FILE" ]] && echo "❌  .env.deploy not found." && exit 1
source "$ENV_FILE"

required=(
  VERCEL_TOKEN VERCEL_PROJECT_ID SUPABASE_DB_URL
  SQUARE_ACCESS_TOKEN SQUARE_LOCATION_ID SQUARE_WEBHOOK_SIGNATURE_KEY
  NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY
  RESEND_API_KEY
)
missing=0
for var in "${required[@]}"; do
  [[ -z "${!var:-}" ]] && echo "❌  Missing: $var" && missing=1
done
[[ $missing -eq 1 ]] && exit 1

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║       SkrubCRM v3 — Deployment Script                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

push_env() {
  local key="$1" value="$2" target="${3:-production}"
  local q="" 
  [[ -n "${VERCEL_TEAM_ID:-}" ]] && q="?teamId=${VERCEL_TEAM_ID}"
  local base="https://api.vercel.com" proj="${VERCEL_PROJECT_ID}"

  # Get IDs of existing vars with this key, delete each
  local list_resp ids
  list_resp=$(curl -sf "${base}/v9/projects/${proj}/env${q}" 
    -H "Authorization: Bearer ${VERCEL_TOKEN}" 2>/dev/null || echo "{\"envs\":[]}")
  ids=$(echo "$list_resp" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for e in data.get('envs', []):
    if e.get('key') == sys.argv[1]:
        print(e['id'])
" "$key" 2>/dev/null || true)

  for env_id in $ids; do
    curl -sf -X DELETE "${base}/v9/projects/${proj}/env/${env_id}${q}" 
      -H "Authorization: Bearer ${VERCEL_TOKEN}" >/dev/null 2>&1 || true
  done

  local response
  response=$(curl -sf -X POST 
    "${base}/v10/projects/${proj}/env${q}" 
    -H "Authorization: Bearer ${VERCEL_TOKEN}" 
    -H "Content-Type: application/json" 
    -d "{\"key\":\"${key}\",\"value\":\"${value}\",\"type\":\"encrypted\",\"target\":[\"${target}\"]}" 
    2>&1) || { echo "  ❌  Failed to push ${key}: $response"; return 1; }
  echo "  ✓  ${key}"
}

echo "▶ STEP 1/4  Pushing Square catalog IDs (20 plans)..."
SQUARE_ENV="$SCRIPT_DIR/square-production.env"
[[ ! -f "$SQUARE_ENV" ]] && echo "❌  square-production.env not found" && exit 1

while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" == \#* ]] && continue
  [[ "$key" =~ ^(SQUARE_ACCESS_TOKEN|SQUARE_LOCATION_ID|SQUARE_WEBHOOK_SIGNATURE_KEY|SQUARE_WEBHOOK_URL|SQUARE_ENVIRONMENT)$ ]] && continue
  value="${value%%#*}"; value="${value%"${value##*[![:space:]]}"}"
  key="${key%"${key##*[![:space:]]}"}"
  [[ -z "$value" ]] && continue
  push_env "$key" "$value"
done < "$SQUARE_ENV"
echo ""

echo "▶ STEP 2/4  Pushing secrets..."
push_env "SQUARE_ACCESS_TOKEN"           "$SQUARE_ACCESS_TOKEN"
push_env "SQUARE_LOCATION_ID"            "$SQUARE_LOCATION_ID"
push_env "SQUARE_WEBHOOK_SIGNATURE_KEY"  "$SQUARE_WEBHOOK_SIGNATURE_KEY"
push_env "SQUARE_WEBHOOK_URL"            "https://skrubcrm.com/api/square-webhook"
push_env "SQUARE_ENVIRONMENT"            "production"
push_env "NEXT_PUBLIC_SUPABASE_URL"      "$NEXT_PUBLIC_SUPABASE_URL"
push_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
push_env "SUPABASE_SERVICE_ROLE_KEY"     "$SUPABASE_SERVICE_ROLE_KEY"
push_env "RESEND_API_KEY"                "$RESEND_API_KEY"
push_env "NEXT_PUBLIC_SITE_URL"          "https://skrubcrm.com"
echo ""

echo "▶ STEP 3/4  Running supabase-schema-additions.sql..."
SQL_FILE="$SCRIPT_DIR/supabase-schema-additions.sql"
[[ ! -f "$SQL_FILE" ]] && echo "❌  supabase-schema-additions.sql not found" && exit 1
if ! command -v psql &>/dev/null; then
  echo "⚠️   psql not found — skipping schema step."
  echo "    brew install libpq && brew link --force libpq"
else
  psql "$SUPABASE_DB_URL" -f "$SQL_FILE" --quiet && echo "  ✓  Schema applied"
fi
echo ""

echo "▶ STEP 4/4  Triggering Vercel production redeploy..."
tp=""
[[ -n "${VERCEL_TEAM_ID:-}" ]] && tp="teamId=${VERCEL_TEAM_ID}"
tpq=""; [[ -n "$tp" ]] && tpq="?${tp}"

latest=$(curl -sf 
  "https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&target=production&limit=1${tp:+&$tp}" 
  -H "Authorization: Bearer ${VERCEL_TOKEN}" | 
  python3 -c "import sys,json; d=json.load(sys.stdin)['deployments']; print(d[0]['uid'] if d else '')" 2>/dev/null || echo "")

if [[ -z "$latest" ]]; then
  echo "⚠️   Could not get latest deployment ID. Trigger manually in Vercel dashboard."
else
  rr=$(curl -sf -X POST 
    "https://api.vercel.com/v13/deployments${tpq}" 
    -H "Authorization: Bearer ${VERCEL_TOKEN}" 
    -H "Content-Type: application/json" 
    -d "{\"deploymentId\":\"${latest}\",\"target\":\"production\",\"meta\":{\"action\":\"skrubcrm-v3-go-live\"}}" 
    2>&1) || true
  url=$(echo "$rr" | python3 -c "import sys,json; print(json.load(sys.stdin).get('url',''))" 2>/dev/null || echo "")
  [[ -n "$url" ]] && echo "  ✓  Redeploy triggered: https://${url}" || echo "  ⚠️   Trigger manually: Vercel → Deployments → Redeploy"
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  Done. Run: bash verify.sh                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
