import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — SkrubCRM',
  description: 'Terms and conditions for using SkrubCRM and FillCRM.',
}

export default function TermsPage() {
  return (
    <main className="bg-slate-950 text-slate-100 min-h-screen">
      <nav className="bg-slate-950/90 border-b border-slate-800 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-black text-indigo-400">Skrub<span className="text-slate-100">CRM</span></Link>
        <Link href="/portal" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">Sign In</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-black text-slate-50 mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: March 28, 2026</p>

        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">1. The service</h2>
            <p>SkrubCRM and FillCRM ("the service") are subscription-based tools that audit CRM data health and deliver monthly lead generation assets. By subscribing, you agree to these terms. If you disagree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">2. Subscriptions and billing</h2>
            <p>Subscriptions are billed monthly on the date of your first payment. All prices are in USD and include applicable payment processing fees. Subscriptions renew automatically unless cancelled. You may cancel at any time from your portal or by emailing <a href="mailto:support@skrubcrm.com" className="text-indigo-400 hover:underline">support@skrubcrm.com</a>. Cancellations take effect at the end of the current billing period — no partial refunds are issued for unused days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">3. Refund policy</h2>
            <p>If the service fails to deliver your first scan or lead system within the promised window and we cannot remedy the issue within 3 business days, you are entitled to a full refund for that billing period. Refund requests must be submitted within 14 days of the missed delivery. We do not offer refunds for cancellations made after delivery has occurred.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">4. CRM access and your data</h2>
            <p>You grant us read access to your CRM solely to perform contracted scans and deliver reports. We will not write to, modify, or delete data in your CRM. You are responsible for ensuring you have authorization to connect your CRM account to our service. We do not share your CRM data with third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">5. Acceptable use</h2>
            <p>You may not use the service to process data you do not own or have authorization over. You may not resell or sublicense access without written permission. You may not attempt to reverse-engineer, scrape, or automate access to the service beyond normal portal usage.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">6. Service availability</h2>
            <p>We target 99% uptime for the portal and scan delivery. Scans are scheduled — not real-time — and delays of up to 24 hours beyond the stated window do not constitute a service failure. We reserve the right to perform maintenance that may briefly interrupt access.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">7. Limitation of liability</h2>
            <p>The service is provided "as is." We are not liable for decisions made based on scan results, for CRM data loss caused by actions outside our scope, or for indirect or consequential damages of any kind. Our total liability is limited to amounts paid in the 30 days prior to the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">8. Changes to terms</h2>
            <p>We'll notify active customers by email before making material changes to these terms. Continued use after notice constitutes acceptance. Changes to pricing require 30 days' notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">9. Contact</h2>
            <p>Questions: <a href="mailto:support@skrubcrm.com" className="text-indigo-400 hover:underline">support@skrubcrm.com</a></p>
          </section>

        </div>
      </div>

      <footer className="border-t border-slate-800 py-8 px-6 mt-16">
        <div className="max-w-3xl mx-auto flex gap-6 text-xs text-slate-600">
          <Link href="/privacy" className="hover:text-slate-400">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-400">Terms</Link>
          <a href="mailto:support@skrubcrm.com" className="hover:text-slate-400">Support</a>
        </div>
      </footer>
    </main>
  )
}
