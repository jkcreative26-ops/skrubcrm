import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const customerId = request.cookies.get('session_customer_id')?.value

  if (!customerId) {
    return NextResponse.json({ customer: null }, { status: 401 })
  }

  // Validate UUID format before querying
  if (!/^[0-9a-f-]{36}$/.test(customerId)) {
    return NextResponse.json({ customer: null }, { status: 401 })
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .select('id, email, subscription_tier, crm_provider, active, slack_webhook_url, teams_webhook_url')
    .eq('id', customerId)
    .eq('active', true)
    .single()

  if (error || !customer) {
    return NextResponse.json({ customer: null }, { status: 401 })
  }

  // Fetch recent scan logs (last 20)
  const { data: scans } = await supabase
    .from('scan_logs')
    .select('id, created_at, health_score, revenue_at_risk, stall_count, missing_field_count, orphan_count, tasks_created, deals_tagged, crm_provider')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ customer, scans: scans ?? [] })
}
