/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://web.squarecdn.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      // Payment processors: Stripe + Square
      // CRM APIs: HubSpot, Pipedrive, Salesforce
      // Notifications: Slack, Teams
      // Infrastructure: Supabase, Anthropic, Resend
      "connect-src 'self'" +
        // Infrastructure
        " https://*.supabase.co" +
        " https://api.anthropic.com" +
        " https://api.resend.com" +
        // Payments — Stripe
        " https://api.stripe.com" +
        // Payments — Square
        " https://connect.squareup.com" +
        " https://connect.squareupsandbox.com" +
        " https://web.squarecdn.com" +
        // CRM — HubSpot
        " https://api.hubapi.com" +
        // CRM — Pipedrive
        " https://api.pipedrive.com" +
        // CRM — Salesforce
        " https://login.salesforce.com" +
        " https://*.salesforce.com" +
        // Notifications
        " https://hooks.slack.com" +
        " https://outlook.office.com" +
        " https://hooks.teams.microsoft.com",
      // Prevent framing from any origin
      "frame-ancestors 'none'",
      // Square Web Payments SDK loads an iframe for card entry
      "frame-src https://web.squarecdn.com https://js.squareup.com",
    ].join('; '),
  },
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  // Hide framework fingerprint
  poweredByHeader: false,
}

module.exports = nextConfig
