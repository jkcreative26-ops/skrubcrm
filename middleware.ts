import { NextRequest, NextResponse } from 'next/server'

// Routes that require an active session cookie
const PROTECTED = ['/portal/expired']

// API routes that require session (portal data endpoints)
const PROTECTED_API = ['/api/portal/me', '/api/portal/settings']

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const customerId = request.cookies.get('session_customer_id')?.value

  // Protect portal API routes
  if (PROTECTED_API.some(p => pathname.startsWith(p))) {
    if (!customerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next()
  response.headers.set('X-Robots-Tag', pathname.startsWith('/portal') ? 'noindex' : 'index,follow')

  return response
}

export const config = {
  matcher: ['/portal/:path*', '/api/portal/:path*'],
}
