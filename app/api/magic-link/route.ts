import { NextRequest, NextResponse } from 'next/server'
import { createMagicLink, verifyMagicLink } from '@/lib/magic-link'
import { Resend } from 'resend'

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

// Rate limit: simple in-memory (upgrade to KV/Redis for multi-instance)
const attempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = attempts.get(ip)
  if (!record || record.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (record.count >= 5) return true
  record.count++
  return false
}

// POST /api/magic-link — request a magic link
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 })
  }

  let email: string
  try {
    const body = await request.json()
    email = (body.email ?? '').toString().toLowerCase().trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const link = await createMagicLink(email)

  // Always return 200 — don't leak whether the email exists
  if (link) {
    await getResend().emails.send({
      from: 'SkrubCRM <reports@skrubcrm.com>',
      to: email,
      subject: 'Your SkrubCRM portal access link',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#0f172a;margin-bottom:8px">Your portal link</h2>
          <p style="color:#475569;margin-bottom:24px">Click below to access your SkrubCRM portal. This link expires in 15 minutes and can only be used once.</p>
          <a href="${link}" style="display:inline-block;background:#6366f1;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">
            Open My Portal
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:32px">If you didn't request this, ignore this email. Your account is safe.</p>
        </div>
      `,
    }).catch(err => console.error('Magic link email failed:', err))
  }

  return NextResponse.json({ sent: true })
}

// GET /api/magic-link?token=... — verify and exchange for session
export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get('token') ?? ''

  const customer = await verifyMagicLink(token)

  if (!customer) {
    return NextResponse.redirect(new URL('/portal/expired', request.url))
  }

  // Set httpOnly session cookie
  const response = NextResponse.redirect(new URL('/portal', request.url))
  response.cookies.set('session_customer_id', customer.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
  response.cookies.set('session_tier', customer.subscription_tier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  return response
}
