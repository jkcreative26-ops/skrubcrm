import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — SkrubCRM',
  description: 'How SkrubCRM collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <main className="bg-slate-950 text-slate-100 min-h-screen">
      <nav className="bg-slate-950/90 border-b border-slate-800 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-black text-indigo-400">Skrub<span className="text-slate-100">CRM</span></Link>
        <Link href="/portal" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">Sign In</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-black text-slate-50 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: March 28, 2026</p>

        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">1. What we collect</h2>
            <p>We collect the minimum information necessary to deliver the service:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside text-slate-400">
              <li>Your email address (used for portal access and report delivery)</li>
              <li>Your CRM access credentials (read-only scopes where possible, used only to run scans)</li>
              <li>Payment information — processed entirely by Square. We never see or store your card number.</li>
              <li>Usage data (scan logs, portal activity) to operate and improve the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">2. How we use your data</h2>
            <p>We use your data to:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside text-slate-400">
              <li>Run scheduled CRM health scans and deliver reports</li>
              <li>Send portal access links and service notifications</li>
              <li>Manage your subscription and billing</li>
              <li>Diagnose errors and improve reliability</li>
            </ul>
            <p className="mt-3">We do not sell your data. We do not use your CRM data to train models or share it with third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">3. Data storage and security</h2>
            <p>Your data is stored on Supabase (hosted on AWS infrastructure in the US). We use encrypted connections (TLS) for all data in transit and encrypted storage at rest. Access is restricted to service operations only — your data is not accessible to third-party vendors beyond our infrastructure providers.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">4. CRM access</h2>
            <p>When you connect a CRM (HubSpot, Salesforce, or Pipedrive), we request read access to the data needed to run scans. We do not write to your CRM during scans. Scan results are stored in our system and visible only to you in your portal. You can revoke CRM access at any time from within the CRM's connected apps settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">5. Cookies and sessions</h2>
            <p>We use a single httpOnly session cookie to keep you logged into your portal. This cookie expires after 8 hours. We do not use advertising cookies or third-party tracking.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">6. Data retention</h2>
            <p>We retain your account data for as long as your subscription is active. After cancellation, your data is retained for 90 days, then permanently deleted. You can request immediate deletion by emailing <a href="mailto:support@skrubcrm.com" className="text-indigo-400 hover:underline">support@skrubcrm.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">7. Your rights</h2>
            <p>You can request a copy of your data, ask us to correct inaccurate information, or request deletion at any time. Email <a href="mailto:support@skrubcrm.com" className="text-indigo-400 hover:underline">support@skrubcrm.com</a> with your request. We'll respond within 5 business days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">8. Changes to this policy</h2>
            <p>We'll notify active customers by email before making material changes to this policy. Continued use after notice constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3">9. Contact</h2>
            <p>Questions about this policy: <a href="mailto:support@skrubcrm.com" className="text-indigo-400 hover:underline">support@skrubcrm.com</a></p>
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
