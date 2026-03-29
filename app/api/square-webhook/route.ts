// ── Square-only webhook handler ───────────────────────────────────────────────
// Square sends HMAC-SHA256 in the x-square-hmacsha256-signature header.
// Signature = base64(HMAC-SHA256(signatureKey, notificationUrl + rawBody))
// Reference: https://developer.squareup.com/docs/webhooks/validate-notifications

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

// ── Signature verification ────────────────────────────────────────────────────

function verifySquareSignature(
  rawBody: string,
  signature: string,
  notificationUrl: string
): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  if (!key) {
    console.error('SQUARE_WEBHOOK_SIGNATURE_KEY not set')
    return false
  }
  const hmac     = crypto.createHmac('sha256', key)
  hmac.update(notificationUrl + rawBody)
  const expected = hmac.digest('base64')

  // Both buffers must be the same length for timingSafeEqual
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length) return false

  return crypto.timingSafeEqual(sigBuf, expBuf)
}

// ── Maps Square catalog variation IDs → subscription tiers ───────────────────
// All 20 plans: SkrubCRM solo (4) + FillCRM solo (4) + Combos HS/SF/PD × 4 (12)

function squareCatalogIdToTier(catalogObjectId: string | undefined): string | null {
  if (!catalogObjectId) return null

  const map: Record<string, string> = {
    // ── SkrubCRM solo ────────────────────────────────────────────────────────
    [process.env.SQUARE_SKRUBCRM_CLEAN    ?? '']: 'clean',
    [process.env.SQUARE_SKRUBCRM_SKRUB    ?? '']: 'skrub',
    [process.env.SQUARE_SKRUBCRM_SCOUR    ?? '']: 'scour',
    [process.env.SQUARE_SKRUBCRM_AGENCY   ?? '']: 'agency',
    // ── FillCRM solo ─────────────────────────────────────────────────────────
    [process.env.SQUARE_FILLCRM_STARTER   ?? '']: 'fillcrm_starter',
    [process.env.SQUARE_FILLCRM_GROWTH    ?? '']: 'fillcrm_growth',
    [process.env.SQUARE_FILLCRM_PRO       ?? '']: 'fillcrm_pro',
    [process.env.SQUARE_FILLCRM_AGENCY    ?? '']: 'fillcrm_agency',
    // ── HubSpot combos ───────────────────────────────────────────────────────
    [process.env.SQUARE_COMBO_HS_STARTER  ?? '']: 'combo_hs_starter',
    [process.env.SQUARE_COMBO_HS_GROWTH   ?? '']: 'combo_hs_growth',
    [process.env.SQUARE_COMBO_HS_PRO      ?? '']: 'combo_hs_pro',
    [process.env.SQUARE_COMBO_HS_AGENCY   ?? '']: 'combo_hs_agency',
    // ── Salesforce combos ────────────────────────────────────────────────────
    [process.env.SQUARE_COMBO_SF_STARTER  ?? '']: 'combo_sf_starter',
    [process.env.SQUARE_COMBO_SF_GROWTH   ?? '']: 'combo_sf_growth',
    [process.env.SQUARE_COMBO_SF_PRO      ?? '']: 'combo_sf_pro',
    [process.env.SQUARE_COMBO_SF_AGENCY   ?? '']: 'combo_sf_agency',
    // ── Pipedrive combos ─────────────────────────────────────────────────────
    [process.env.SQUARE_COMBO_PD_STARTER  ?? '']: 'combo_pd_starter',
    [process.env.SQUARE_COMBO_PD_GROWTH   ?? '']: 'combo_pd_growth',
    [process.env.SQUARE_COMBO_PD_PRO      ?? '']: 'combo_pd_pro',
    [process.env.SQUARE_COMBO_PD_AGENCY   ?? '']: 'combo_pd_agency',
  }
  delete map[''] // prevent false match when env var is missing
  return map[catalogObjectId] ?? null
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody  = await request.text()
  const sig      = request.headers.get('x-square-hmacsha256-signature') ?? ''

  const notificationUrl = process.env.SQUARE_WEBHOOK_URL
  if (!notificationUrl) {
    console.error('SQUARE_WEBHOOK_URL not set — cannot verify signature')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  if (!verifySquareSignature(rawBody, sig, notificationUrl)) {
    console.error('Square webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
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

      // ── New payment (one-time or first subscription charge) ──────────────
      case 'payment.completed': {
        await handlePaymentCompleted(payload)
        break
      }

      // ── Subscription created / renewed ───────────────────────────────────
      case 'subscription.created':
      case 'subscription.updated': {
        await handleSubscriptionUpsert(payload, true)
        break
      }

      // ── Subscription cancelled / deactivated ─────────────────────────────
      case 'subscription.canceled':
      case 'subscription.deactivated': {
        await handleSubscriptionUpsert(payload, false)
        break
      }

      default:
        // Acknowledge all other events without processing
        break
    }
  } catch (err) {
    console.error(`Error handling Square event [${eventType}]:`, err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

// ── Event handlers ────────────────────────────────────────────────────────────

async function handlePaymentCompleted(
  payload: Record<string, unknown>
): Promise<void> {
  const data    = payload.data as Record<string, unknown> | undefined
  const obj     = data?.object as Record<string, unknown> | undefined
  const payment = obj?.payment as Record<string, unknown> | undefined

  if (!payment) {
    console.warn('payment.completed: missing payment object')
    return
  }

  const email            = payment.buyer_email_address as string | undefined
  const squareCustomerId = payment.customer_id as string | undefined
  const catalogObjectId  = payment.catalog_object_id as string | undefined
  const amountMoney      = payment.amount_money as { amount?: number; currency?: string } | undefined
  const amountCents      = amountMoney?.amount ?? 0

  if (!email) {
    console.warn('payment.completed: missing buyer_email_address — skipping')
    return
  }

  const tier = squareCatalogIdToTier(catalogObjectId)
  if (!tier) {
    console.warn(`payment.completed: unknown catalog_object_id [${catalogObjectId}] — tier not set`)
  }

  const { error } = await supabase
    .from('customers')
    .upsert(
      {
        email:               email.toLowerCase().trim(),
        square_customer_id:  squareCustomerId ?? null,
        subscription_tier:   tier ?? 'unknown',
        active:              true,
      },
      { onConflict: 'email' }
    )

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`)

  console.log(`payment.completed — email: ${email}, tier: ${tier ?? 'unknown'}, amount_cents: ${amountCents}`)
}

async function handleSubscriptionUpsert(
  payload: Record<string, unknown>,
  active: boolean
): Promise<void> {
  const data         = payload.data as Record<string, unknown> | undefined
  const obj          = data?.object as Record<string, unknown> | undefined
  const subscription = obj?.subscription as Record<string, unknown> | undefined

  if (!subscription) {
    console.warn(`${payload.type}: missing subscription object`)
    return
  }

  const squareCustomerId = subscription.customer_id as string | undefined
  const planVariationId  = subscription.plan_variation_id as string | undefined

  if (!squareCustomerId) {
    console.warn(`${payload.type}: missing customer_id`)
    return
  }

  const tier = squareCatalogIdToTier(planVariationId)

  const update: Record<string, unknown> = { active }
  if (tier) update.subscription_tier = tier

  const { error } = await supabase
    .from('customers')
    .update(update)
    .eq('square_customer_id', squareCustomerId)

  if (error) throw new Error(`Supabase update failed: ${error.message}`)

  console.log(`${payload.type} — square_customer_id: ${squareCustomerId}, tier: ${tier ?? 'unchanged'}, active: ${active}`)
}
