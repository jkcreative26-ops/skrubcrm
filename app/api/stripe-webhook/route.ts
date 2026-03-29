// ── ARCHIVED ROUTE — 2026-03-28 ──────────────────────────────────────────────
// Stripe integration has been removed. All payments run through Square.
// Active webhook: /api/square-webhook
// This route returns 410 Gone so any misconfigured Stripe webhook endpoint
// gets a clean error instead of a silent 404.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'This endpoint is no longer active. Payments are processed through Square.' },
    { status: 410 }
  )
}
