// ── ARCHIVED — 2026-03-28 ─────────────────────────────────────────────────────
// Legacy unified Stripe+Square webhook handler. No longer active.
// Active Square-only handler is at: app/api/square-webhook/route.ts
// This file is kept at the project root for reference only. NOT deployed.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { constructStripeEvent } from '@/lib/stripe'
import type Stripe from 'stripe'
import crypto from 'crypto'

// ─── Square webhook signature verification ─────────────────────────────────

function verifySquareSignature(
  rawBody: string,
  signature: string,
  notificationUrl: string
): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  if (!signatureKey) {
    console.error('SQUARE_WEBHOOK_SIGNATURE_KEY is not set')
    return false
  }
  // Square HMAC-SHA256: key + notification_url + raw_body
  const hmac = crypto.createHmac('sha256', signatureKey)
  hmac.update(notificationUrl + rawBody)
  const expected = hmac.digest('base64')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

// ─── Stripe requires raw body for signature verification ───────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text()

  // ── Detect Square vs Stripe by header ──
  const squareSignature = request.headers.get('x-square-hmacsha256-signature')

  if (squareSignature) {
    return handleSquareWebhook(request, rawBody, squareSignature)
  }

  return handleStripeWebhook(request, rawBody)
}

// ─── Square handler ────────────────────────────────────────────────────────

async function handleSquareWebhook(
  request: NextRequest,
  rawBody: string,
  signature: string
): Promise<NextResponse> {
  // SQUARE_WEBHOOK_URL must be explicitly set — do not fall back to request host
  // (host header can be spoofed; Square signature verification would pass for attacker-controlled URLs)
  const notificationUrl = process.env.SQUARE_WEBHOOK_URL
  if (!notificationUrl) {
    console.error('SQUARE_WEBHOOK_URL is not set — Square signature verification will fail')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  if (!verifySquareSignature(rawBody, signature, notificationUrl as string)) {
    console.error('Square webhook signature verification failed')
    return NextResponse.json(
      { error: 'Invalid Square signature' },
      { status: 400 }
    )
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = payload.type as string

  try {
    switch (eventType) {
      case 'payment.completed': {
        await handleSquarePaymentCompleted(payload)
        break
      }
      default:
        // Acknowledge all other Square events without processing
        break
    }
  } catch (error) {
    console.error(`Error handling Square event ${eventType}:`, error)
    return NextResponse.json(
      { error: 'Square webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

async function handleSquarePaymentCompleted(
  payload: Record<string, unknown>
): Promise<void> {
  const data = payload.data as Record<string, unknown> | undefined
  const object = data?.object as Record<string, unknown> | undefined
  const payment = object?.payment as Record<string, unknown> | undefined

  if (!payment) {
    console.warn('Square payment.completed missing payment object')
    return
  }

  const email = payment.buyer_email_address as string | undefined
  const squareCustomerId = payment.customer_id as string | undefined
  const amountMoney = payment.amount_money as { amount?: number; currency?: string } | undefined
  const amountCents = amountMoney?.amount ?? 0

  if (!email) {
    console.warn('Square payment.completed missing buyer_email_address — skipping')
    return
  }

  // Map payment amount to SkrubCRM tier
  const tier = squarePriceToTier(payment.catalog_object_id as string | undefined)

  // Upsert into SkrubCRM customers table
  const { error } = await supabase
    .from('customers')
    .upsert(
      {
        email,
        square_customer_id: squareCustomerId ?? null,
        subscription_tier: tier ?? 'unknown',
        active: true,
      },
      { onConflict: 'email' }
    )

  if (error) {
    throw new Error(`Failed to upsert Square customer: ${error.message}`)
  }

  console.log(
    `Square payment.completed processed — email: ${email}, tier: ${tier ?? 'unknown'}, amount: ${amountCents}`
  )
}

// Maps Square catalog object IDs to subscription tiers
// Covers all 20 production plans: SkrubCRM solo (4) + FillCRM solo (4) + Combos HS/SF/PD × 4 (12)
// ENV var names match square-production.env and Master_CRM_System_v2.md exactly
function squarePriceToTier(catalogObjectId: string | undefined): string | null {
  if (!catalogObjectId) return null

  // Validate all 20 Square catalog IDs are present
  const requiredVars = [
    // SkrubCRM solo
    'SQUARE_SKRUBCRM_CLEAN',
    'SQUARE_SKRUBCRM_SKRUB',
    'SQUARE_SKRUBCRM_SCOUR',
    'SQUARE_SKRUBCRM_AGENCY',
    // FillCRM solo
    'SQUARE_FILLCRM_STARTER',
    'SQUARE_FILLCRM_GROWTH',
    'SQUARE_FILLCRM_PRO',
    'SQUARE_FILLCRM_AGENCY',
    // HubSpot combos
    'SQUARE_COMBO_HS_STARTER',
    'SQUARE_COMBO_HS_GROWTH',
    'SQUARE_COMBO_HS_PRO',
    'SQUARE_COMBO_HS_AGENCY',
    // Salesforce combos
    'SQUARE_COMBO_SF_STARTER',
    'SQUARE_COMBO_SF_GROWTH',
    'SQUARE_COMBO_SF_PRO',
    'SQUARE_COMBO_SF_AGENCY',
    // Pipedrive combos
    'SQUARE_COMBO_PD_STARTER',
    'SQUARE_COMBO_PD_GROWTH',
    'SQUARE_COMBO_PD_PRO',
    'SQUARE_COMBO_PD_AGENCY',
  ]
  for (const v of requiredVars) {
    if (!process.env[v]) {
      console.error(`Missing required Square env var: ${v}`)
    }
  }

  const map: Record<string, string> = {
    // ── SkrubCRM solo plans ──────────────────────────────────────────────
    [process.env.SQUARE_SKRUBCRM_CLEAN    ?? '']: 'clean',
    [process.env.SQUARE_SKRUBCRM_SKRUB    ?? '']: 'skrub',
    [process.env.SQUARE_SKRUBCRM_SCOUR    ?? '']: 'scour',
    [process.env.SQUARE_SKRUBCRM_AGENCY   ?? '']: 'agency',

    // ── FillCRM solo plans ───────────────────────────────────────────────
    [process.env.SQUARE_FILLCRM_STARTER   ?? '']: 'fillcrm_starter',
    [process.env.SQUARE_FILLCRM_GROWTH    ?? '']: 'fillcrm_growth',
    [process.env.SQUARE_FILLCRM_PRO       ?? '']: 'fillcrm_pro',
    [process.env.SQUARE_FILLCRM_AGENCY    ?? '']: 'fillcrm_agency',

    // ── HubSpot combo bundles ────────────────────────────────────────────
    [process.env.SQUARE_COMBO_HS_STARTER  ?? '']: 'combo_hs_starter',
    [process.env.SQUARE_COMBO_HS_GROWTH   ?? '']: 'combo_hs_growth',
    [process.env.SQUARE_COMBO_HS_PRO      ?? '']: 'combo_hs_pro',
    [process.env.SQUARE_COMBO_HS_AGENCY   ?? '']: 'combo_hs_agency',

    // ── Salesforce combo bundles ─────────────────────────────────────────
    [process.env.SQUARE_COMBO_SF_STARTER  ?? '']: 'combo_sf_starter',
    [process.env.SQUARE_COMBO_SF_GROWTH   ?? '']: 'combo_sf_growth',
    [process.env.SQUARE_COMBO_SF_PRO      ?? '']: 'combo_sf_pro',
    [process.env.SQUARE_COMBO_SF_AGENCY   ?? '']: 'combo_sf_agency',

    // ── Pipedrive combo bundles ──────────────────────────────────────────
    [process.env.SQUARE_COMBO_PD_STARTER  ?? '']: 'combo_pd_starter',
    [process.env.SQUARE_COMBO_PD_GROWTH   ?? '']: 'combo_pd_growth',
    [process.env.SQUARE_COMBO_PD_PRO      ?? '']: 'combo_pd_pro',
    [process.env.SQUARE_COMBO_PD_AGENCY   ?? '']: 'combo_pd_agency',
  }
  // Remove empty-string key to prevent false matches when env vars are missing
  delete map['']
  return map[catalogObjectId] ?? null
}

// ─── Stripe handler ────────────────────────────────────────────────────────

async function handleStripeWebhook(
  request: NextRequest,
  rawBody: string
): Promise<NextResponse> {
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = constructStripeEvent(rawBody, signature)
  } catch (error) {
    console.error('Stripe webhook verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancelled(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        break
    }
  } catch (error) {
    console.error(`Error handling Stripe webhook event ${event.type}:`, error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

// ─── Stripe event handlers ─────────────────────────────────────────────────

function priceIdToTier(priceId: string): string | null {
  // Validate Stripe secret key format — must be sk_live_ or sk_test_, never pk_
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? ''
  if (stripeKey && !stripeKey.startsWith('sk_')) {
    throw new Error(
      `STRIPE_SECRET_KEY must start with sk_ (secret key). ` +
      `Got: ${stripeKey.slice(0, 7)}... — this looks like a publishable key.`
    )
  }

  // Validate webhook secret format
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''
  if (webhookSecret && !webhookSecret.startsWith('whsec_')) {
    throw new Error(
      `STRIPE_WEBHOOK_SECRET must start with whsec_. ` +
      `Got: ${webhookSecret.slice(0, 6)}... — check your Stripe Dashboard → Webhooks.`
    )
  }

  const map: Record<string, string> = {
    [process.env.STRIPE_SKRUBCRM_CLEAN  ?? '']: 'clean',
    [process.env.STRIPE_SKRUBCRM_SKRUB  ?? '']: 'skrub',
    [process.env.STRIPE_SKRUBCRM_SCOUR  ?? '']: 'scour',
    [process.env.STRIPE_SKRUBCRM_AGENCY ?? '']: 'agency',
    // FillCRM tiers
    [process.env.STRIPE_FILLCRM_STARTER ?? '']: 'fillcrm_starter',
    [process.env.STRIPE_FILLCRM_GROWTH  ?? '']: 'fillcrm_growth',
    [process.env.STRIPE_FILLCRM_PRO     ?? '']: 'fillcrm_pro',
    [process.env.STRIPE_FILLCRM_AGENCY  ?? '']: 'fillcrm_agency',
  }
  // Remove empty-string key to prevent false matches when env vars are missing
  delete map['']
  return map[priceId] ?? null
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription
): Promise<void> {
  const stripeCustomerId = subscription.customer as string
  const isActive =
    subscription.status === 'active' || subscription.status === 'trialing'

  const priceId = subscription.items.data[0]?.price?.id ?? ''
  const tier = priceIdToTier(priceId)

  const updatePayload: Record<string, unknown> = { active: isActive }
  if (tier) {
    updatePayload.subscription_tier = tier
  } else {
    console.warn(`Unknown Stripe price ID: ${priceId} — tier not updated`)
  }

  const { error } = await supabase
    .from('customers')
    .update(updatePayload)
    .eq('stripe_customer_id', stripeCustomerId)

  if (error) {
    throw new Error(`Failed to update customer status: ${error.message}`)
  }
}

async function handleSubscriptionCancelled(
  subscription: Stripe.Subscription
): Promise<void> {
  const stripeCustomerId = subscription.customer as string

  const { error } = await supabase
    .from('customers')
    .update({ active: false })
    .eq('stripe_customer_id', stripeCustomerId)

  if (error) {
    throw new Error(`Failed to deactivate customer: ${error.message}`)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const stripeCustomerId = invoice.customer as string
  console.warn(`Payment failed for Stripe customer: ${stripeCustomerId}`)
}
