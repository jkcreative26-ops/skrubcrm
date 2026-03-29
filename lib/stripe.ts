// ── ARCHIVED — 2026-03-28 ─────────────────────────────────────────────────────
// Stripe is no longer active. All payments run through Square.
// This file is kept for reference only. Nothing imports it.
// To reactivate: re-add STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET to .env.deploy
//   and restore the stripe-webhook-route.ts to app/api/stripe-webhook/route.ts.
// ─────────────────────────────────────────────────────────────────────────────

import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY ?? ''

if (key && !key.startsWith('sk_')) {
  throw new Error(
    `STRIPE_SECRET_KEY must start with sk_live_ or sk_test_. Got: ${key.slice(0, 8)}... — check Vercel env vars.`
  )
}

export const stripe = new Stripe(key, { apiVersion: '2024-04-10' })

export function constructStripeEvent(rawBody: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? ''
  if (!secret.startsWith('whsec_')) {
    throw new Error(`STRIPE_WEBHOOK_SECRET must start with whsec_. Got: ${secret.slice(0, 8)}...`)
  }
  return stripe.webhooks.constructEvent(rawBody, signature, secret)
}

// Maps Stripe price IDs → subscription tiers
// Add STRIPE_* env vars matching the Square catalog for dual-processor parity
export function stripePriceToTier(priceId: string): string | null {
  const map: Record<string, string> = {
    // SkrubCRM solo
    [process.env.STRIPE_SKRUBCRM_CLEAN    ?? '']: 'clean',
    [process.env.STRIPE_SKRUBCRM_SKRUB    ?? '']: 'skrub',
    [process.env.STRIPE_SKRUBCRM_SCOUR    ?? '']: 'scour',
    [process.env.STRIPE_SKRUBCRM_AGENCY   ?? '']: 'agency',
    // FillCRM solo
    [process.env.STRIPE_FILLCRM_STARTER   ?? '']: 'fillcrm_starter',
    [process.env.STRIPE_FILLCRM_GROWTH    ?? '']: 'fillcrm_growth',
    [process.env.STRIPE_FILLCRM_PRO       ?? '']: 'fillcrm_pro',
    [process.env.STRIPE_FILLCRM_AGENCY    ?? '']: 'fillcrm_agency',
    // HubSpot combos
    [process.env.STRIPE_COMBO_HS_STARTER  ?? '']: 'combo_hs_starter',
    [process.env.STRIPE_COMBO_HS_GROWTH   ?? '']: 'combo_hs_growth',
    [process.env.STRIPE_COMBO_HS_PRO      ?? '']: 'combo_hs_pro',
    [process.env.STRIPE_COMBO_HS_AGENCY   ?? '']: 'combo_hs_agency',
    // Salesforce combos
    [process.env.STRIPE_COMBO_SF_STARTER  ?? '']: 'combo_sf_starter',
    [process.env.STRIPE_COMBO_SF_GROWTH   ?? '']: 'combo_sf_growth',
    [process.env.STRIPE_COMBO_SF_PRO      ?? '']: 'combo_sf_pro',
    [process.env.STRIPE_COMBO_SF_AGENCY   ?? '']: 'combo_sf_agency',
    // Pipedrive combos
    [process.env.STRIPE_COMBO_PD_STARTER  ?? '']: 'combo_pd_starter',
    [process.env.STRIPE_COMBO_PD_GROWTH   ?? '']: 'combo_pd_growth',
    [process.env.STRIPE_COMBO_PD_PRO      ?? '']: 'combo_pd_pro',
    [process.env.STRIPE_COMBO_PD_AGENCY   ?? '']: 'combo_pd_agency',
  }
  delete map['']
  return map[priceId] ?? null
}
