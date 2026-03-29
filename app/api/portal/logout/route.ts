import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'https://skrubcrm.com'))
  response.cookies.delete('session_customer_id')
  response.cookies.delete('session_tier')
  return response
}
