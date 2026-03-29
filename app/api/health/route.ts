import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(): Promise<NextResponse> {
  const checks: Record<string, string> = {}

  // Supabase reachability
  try {
    await supabase.from('customers').select('id').limit(1)
    checks.supabase = 'ok'
  } catch {
    checks.supabase = 'error'
  }

  // Env var presence (never expose values)
  const required = [
    'SQUARE_ACCESS_TOKEN', 'SQUARE_LOCATION_ID', 'SQUARE_WEBHOOK_SIGNATURE_KEY',
    'RESEND_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  ]
  const missing = required.filter(k => !process.env[k])
  checks.env = missing.length === 0 ? 'ok' : `missing: ${missing.join(', ')}`

  const allOk = Object.values(checks).every(v => v === 'ok')

  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', checks, ts: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  )
}
