# SkrubCRM v3 — Deployment Runbook

Two commands to go live. Everything else is automated.

---

## Prerequisites

- `curl` — already on every Mac
- `psql` — for Supabase schema step: `brew install libpq && brew link --force libpq`
- Vercel token + project ID (see step 1 below)

---

## Step 1 — Fill in .env.deploy

Open `.env.deploy` and fill in every field. Here's where to get each one:

| Variable | Where to find it |
|---|---|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens → Create |
| `VERCEL_PROJECT_ID` | Vercel → skrubcrm project → Settings → General → Project ID |
| `VERCEL_TEAM_ID` | Vercel → Team Settings → General → Team ID (blank if personal account) |
| `SUPABASE_DB_URL` | Supabase → Project → Settings → Database → URI connection string |
| `SQUARE_ACCESS_TOKEN` | Square Dashboard → Apps → My Applications → Production → Access Token |
| `SQUARE_LOCATION_ID` | Square Dashboard → Locations → click location → Location ID |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Square Dashboard → Developers → Webhooks → your endpoint → Signature Key |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → Secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → endpoint → Signing secret (`whsec_...`) |

---

## Step 2 — Run deploy

```bash
cd projects/SkrubCRM-v3
bash deploy.sh
```

This script does, in order:
1. Validates all secrets are present and correctly formatted
2. Pushes all 20 Square catalog IDs to Vercel (production env)
3. Pushes all 8 secrets (Square infra + Stripe) to Vercel
4. Runs `supabase-schema-additions.sql` against your live database
5. Triggers a Vercel production redeploy

Total runtime: ~90 seconds.

---

## Step 3 — Wait for Vercel redeploy (~60s), then verify

```bash
bash verify.sh
```

Checks: homepage loads, HTTPS redirect, 4 security headers, webhook endpoint alive, fingerprint hidden.

If all pass, you're live.

---

## Step 4 — Manual end-to-end payment test

Run one test transaction to confirm the full pipeline works:

**Square sandbox card:** `4111 1111 1111 1111`
**Stripe test card:** `4242 4242 4242 4242`

Sign up for SkrubCRM Clean ($154/mo). Confirm:
- Webhook fires (check Vercel logs)
- Row appears in Supabase `customers` table with `subscription_tier = 'clean'`
- Welcome email arrives via Resend

---

## What's in this folder

| File | Purpose |
|---|---|
| `.env.deploy` | Secrets template — fill this in, never commit |
| `deploy.sh` | Full automated deployment (env vars + schema + redeploy) |
| `verify.sh` | Post-deploy smoke test |
| `square-production.env` | All 20 Square catalog IDs (already provisioned 2026-03-28) |
| `supabase-schema-additions.sql` | Schema additions — safe to re-run (all idempotent) |
| `stripe-webhook-route.ts` | Unified webhook handler for Stripe + Square — drop into `app/api/stripe-webhook/route.ts` |

---

## Known issues resolved in v3

| Issue | Fix |
|---|---|
| `STRIPE_SECRET_KEY` was `pk_live_` | deploy.sh validates `sk_` prefix and blocks deployment |
| `STRIPE_WEBHOOK_SECRET` was `p` | deploy.sh validates `whsec_` prefix and blocks deployment |
| `crm_provider` missing Pipedrive | Fixed in `supabase-schema-additions.sql` |
| Square map only covered 4 of 20 plans | Fixed in `stripe-webhook-route.ts` — all 20 plans mapped |
| RLS portals policy used `current_user_id()` | Fixed in `supabase-schema-additions.sql` — no permissive policy; service role key bypasses RLS |
| `squareup` pinned to `latest` | Pin to `44.0.0` in `package.json` after go-live confirms stable |
