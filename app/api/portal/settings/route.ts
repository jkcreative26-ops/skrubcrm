import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hasSkrubAccess } from '@/lib/tier-config'

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const customerId = request.cookies.get('session_customer_id')?.value
  const tier       = request.cookies.get('session_tier')?.value ?? ''

  if (!customerId || !/^[0-9a-f-]{36}$/.test(customerId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const allowed: Record<string, unknown> = {}

  // Only write fields the tier is entitled to
  const isAgency = tier.includes('agency')
  const hasAlerts = ['scour', 'agency', 'fillcrm_pro', 'fillcrm_agency'].some(t => tier.includes(t)) || tier.startsWith('combo_')

  if (hasAlerts && typeof body.slack_webhook_url === 'string') {
    const url = body.slack_webhook_url.trim()
    if (url && !url.startsWith('https://hooks.slack.com/')) {
      return NextResponse.json({ error: 'Invalid Slack webhook URL' }, { status: 400 })
    }
    allowed.slack_webhook_url = url || null
  }

  if (isAgency && typeof body.teams_webhook_url === 'string') {
    const url = body.teams_webhook_url.trim()
    if (url && !url.startsWith('https://outlook.office.com/') && !url.startsWith('https://hooks.teams.microsoft.com/')) {
      return NextResponse.json({ error: 'Invalid Teams webhook URL' }, { status: 400 })
    }
    allowed.teams_webhook_url = url || null
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: 'No permitted fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('customers')
    .update(allowed)
    .eq('id', customerId)

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
