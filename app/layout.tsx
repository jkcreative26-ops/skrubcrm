import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://skrubcrm.com'),
  title: { default: 'SkrubCRM', template: '%s | SkrubCRM' },
  description: 'Automated CRM health and AI lead systems for HubSpot, Salesforce, and Pipedrive.',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  )
}
