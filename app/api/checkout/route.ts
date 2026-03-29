// v44-fix-2026-03-28
import { NextRequest, NextResponse } from 'next/server'
import { SquareClient, SquareEnvironment } from 'square'
import { getTierById } from '@/lib/tier-config'
import crypto from 'crypto'

// ── Square client ─────────────────────────────────────────────────────────────
function getSquareClient() {
  const token = process.env.SQUARE_ACCESS_TOKEN
  if (!token) throw new Error('SQUARE_ACCESS_TOKEN not set')
  return new SquareClient({
    token,
    environment:
      process.env.SQUARE_ENVIRONMENT === 'sandbox'
        ? SquareEnvironment.Sandbox
        : SquareEnvironment.Production,
  })
}

// ── Rate limit ────────────────────────────────────────────────────────────────
const hits = new Map<string, { count: number; resetAt: number }>()
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const r   = hits.get(ip)
  if (!r || r.resetAt < now) { hits.set(ip, { count: 1, resetAt: now + 60_000 }); return false }
  if (r.count >= 10) return true
  r.count++
  return false
}

// ── Maps tier ID → Square catalog variation ID (from env vars) ───────────────
const TIER_TO_ENV: Record<string, string> = {
  clean:            'SQUARE_SKRUBCRM_CLEAN',
  skrub:            'SQUARE_SKRUBCRM_SKRUB',
  scour:            'SQUARE_SKRUBCRM_SCOUR',
  agency:           'SQUARE_SKRUBCRM_AGENCY',
  fillcrm_starter:  'SQUARE_FILLCRM_STARTER',
  fillcrm_growth:   'SQUARE_FILLCRM_GROWTH',
  fillcrm_pro:      'SQUARE_FILLCRM_PRO',
  fillcrm_agency:   'SQUARE_FILLCRM_AGENCY',
  combo_hs_starter: 'SQUARE_COMBO_HS_STARTER',
  combo_hs_growth:  'SQUARE_COMBO_HS_GROWTH',
  combo_hs_pro:     'SQUARE_COMBO_HS_PRO',
  combo_hs_agency:  'SQUARE_COMBO_HS_AGENCY',
  combo_sf_starter: 'SQUARE_COMBO_SF_STARTER',
  combo_sf_growth:  'SQUARE_COMBO_SF_GROWTH',
  combo_sf_pro:     'SQUARE_COMBO_SF_PRO',
  combo_sf_agency:  'SQUARE_COMBO_SF_AGENCY',
  combo_pd_starter: 'SQUARE_COMBO_PD_STARTER',
  combo_pd_growth:  'SQUARE_COMBO_PD_GROWTH',
  combo_pd_pro:     'SQUARE_COMBO_PD_PRO',
  combo_pd_agency:  'SQUARE_COMBO_PD_AGENCY',
}

// ── POST /api/checkout ────────────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let planId: string
  let email: string | undefined
  try {
    const body = await request.json()
    planId = (body.planId ?? '').toString().trim()
    email  = body.email ? body.email.toString().toLowerCase().trim() : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const tier = getTierById(planId)
  if (!tier) {
    return NextResponse.json({ error: `Unknown plan: ${planId}` }, { status: 400 })
  }

  const catalogEnvVar      = TIER_TO_ENV[planId]
  const catalogVariationId = catalogEnvVar ? process.env[catalogEnvVar] : undefined
  if (!catalogVariationId) {
    console.error(`Missing Square catalog ID for plan ${planId} (env: ${catalogEnvVar ?? 'unknown'})`)
    return NextResponse.json({ error: 'Payment configuration error. Contact support.' }, { status: 500 })
  }

  const locationId = process.env.SQUARE_LOCATION_ID
  if (!locationId) {
    console.error('SQUARE_LOCATION_ID not set')
    return NextResponse.json({ error: 'Payment configuration error. Contact support.' }, { status: 500 })
  }

  const siteUrl        = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://skrubcrm.com'
  const idempotencyKey = crypto.randomUUID()

  try {
    const client = getSquareClient()
    const response = await client.checkout.paymentLinks.create({
      idempotencyKey,
      order: {
        locationId,
        lineItems: [
          {
            name:            tier.name,
            quantity:        '1',
            catalogObjectId: catalogVariationId,
          },
        ],
      },
      checkoutOptions: {
        redirectUrl:           `${siteUrl}/portal?checkout=success&plan=${planId}`,
        merchantSupportEmail:  'support@skrubcrm.com',
        askForShippingAddress: false,
      },
      prePopulatedData: email ? { buyerEmail: email } : undefined,
    })

    const url = response?.paymentLink?.url
    if (!url) {
      console.error('Square checkout did not return a URL', response)
      return NextResponse.json({ error: 'Failed to create checkout link' }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (err: unknown) {
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>
      if ('errors' in e) console.error('Square API errors:', JSON.stringify(e.errors, null, 2))
      if ('statusCode' in e) console.error('Square statusCode:', e.statusCode)
      if ('body' in e) console.error('Square raw body:', JSON.stringify(e.body, null, 2))
    }
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Square checkout exception:', msg)
    return NextResponse.json({ error: 'Failed to create checkout link' }, { status: 500 })
  }
}
