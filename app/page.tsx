import type { Metadata } from 'next'
import Link from 'next/link'
import { SKRUBCRM_TIERS, FILLCRM_TIERS, COMBO_TIERS } from '@/lib/tier-config'

export const metadata: Metadata = {
  title: 'SkrubCRM — Stop Losing Deals to a Dirty CRM',
  description: 'Automated CRM scanning, cleaning, and lead system delivery for HubSpot, Salesforce, and Pipedrive. Weekly scans, auto-fix, and monthly AI lead systems.',
  openGraph: {
    title: 'SkrubCRM — Stop Losing Deals to a Dirty CRM',
    description: 'Automated CRM health for HubSpot, Salesforce, and Pipedrive.',
    url: 'https://skrubcrm.com',
    siteName: 'SkrubCRM',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <main className="bg-slate-950 text-slate-100 min-h-screen">

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="text-xl font-bold text-indigo-400 tracking-tight">
            Skrub<span className="text-slate-100">CRM</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#skrubcrm" className="hover:text-slate-100 transition-colors">SkrubCRM</a>
            <a href="#fillcrm" className="hover:text-slate-100 transition-colors">FillCRM</a>
            <a href="#bundles" className="hover:text-slate-100 transition-colors">Bundles</a>
            <a href="#pricing" className="hover:text-slate-100 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/portal" className="text-sm text-slate-400 hover:text-slate-100 transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <a href="#pricing" className="bg-indigo-600 hover:bg-indigo-500 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-lg">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            Now scanning HubSpot · Salesforce · Pipedrive
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-50 leading-tight mb-6">
            Your CRM is leaking<br />
            <span className="text-indigo-400">revenue right now.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            SkrubCRM scans your CRM every week, finds ghost leads, dead deals, duplicates, and missing fields — then fixes them automatically. FillCRM keeps your pipeline full with a new AI lead system every month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing" className="bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-indigo-500/20">
              Start Cleaning My CRM →
            </a>
            <a href="#fillcrm" className="bg-slate-800 hover:bg-slate-700 transition-colors text-slate-100 font-semibold px-8 py-4 rounded-xl text-base border border-slate-700">
              See FillCRM
            </a>
          </div>
          <p className="text-xs text-slate-600 mt-6">No setup fee. Cancel anytime. Results in first scan.</p>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ────────────────────────────────────────── */}
      <section className="border-y border-slate-800 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm">
          <span>Works with:</span>
          {['HubSpot', 'Salesforce', 'Pipedrive'].map(crm => (
            <span key={crm} className="font-semibold text-slate-300">{crm}</span>
          ))}
          <span className="text-slate-700">·</span>
          <span>Payments via <strong className="text-slate-300">Square</strong></span>
          <span className="text-slate-700">·</span>
          <span>Data in <strong className="text-slate-300">Supabase</strong></span>
        </div>
      </section>

      {/* ── SKRUBCRM SECTION ────────────────────────────────────────── */}
      <section id="skrubcrm" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-50 mb-4">
              <span className="text-indigo-400">SkrubCRM</span> — Automated CRM Health
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Set it once. Every week it scans your CRM, flags every issue, and auto-fixes the ones you approve. No manual audits. No spreadsheets. No contractor.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🔍', title: 'Scan', desc: 'Ghost leads, duplicates, missing fields, orphaned contacts, stalled deals — all found automatically' },
              { icon: '⚡', title: 'Fix', desc: 'Auto-merge duplicates, tag dead deals, create follow-up tasks, alert your team in Slack or Teams' },
              { icon: '📊', title: 'Report', desc: 'Health score, revenue at risk, what was fixed, what needs attention — delivered to your inbox every cycle' },
            ].map(item => (
              <div key={item.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-slate-50 mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SKRUBCRM PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-slate-50 mb-3">SkrubCRM Plans</h3>
          <p className="text-center text-slate-500 text-sm mb-12">All prices include 3% payment processing. You see what you pay.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {SKRUBCRM_TIERS.map(tier => (
              <div key={tier.id} className={`relative flex flex-col rounded-2xl p-6 border ${
                tier.highlight
                  ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-500/20'
                  : 'bg-slate-900 border-slate-800'
              }`}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${tier.highlight ? 'text-indigo-200' : 'text-indigo-400'}`}>
                    SkrubCRM
                  </div>
                  <h4 className="text-xl font-black text-slate-50">{tier.name}</h4>
                  <p className={`text-sm mt-1 ${tier.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{tier.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-50">${tier.price}</span>
                  <span className={`text-sm ml-1 ${tier.highlight ? 'text-indigo-200' : 'text-slate-500'}`}>/mo</span>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className={`text-sm flex items-start gap-2 ${tier.highlight ? 'text-indigo-100' : 'text-slate-300'}`}>
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a href={`/checkout?plan=${tier.id}`}
                  className={`w-full text-center py-3 rounded-xl font-bold text-sm transition-colors ${
                    tier.highlight
                      ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}>
                  Start {tier.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILLCRM SECTION ─────────────────────────────────────────── */}
      <section id="fillcrm" className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              Powered by the same account
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-50 mb-4">
              <span className="text-teal-400">FillCRM</span> — Monthly AI Lead Systems
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every month: a new AI-built lead magnet and 5-email nurture sequence, delivered ready to launch. No brief. No back-and-forth. Just a fresh system in your inbox.
            </p>
          </div>

          {/* What you get each month */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-slate-50 mb-4">What arrives every month</h3>
              <ul className="space-y-3">
                {[
                  ['📄', 'Lead Magnet', 'PDF-ready, niche-specific, zero filler. Designed to convert cold traffic.'],
                  ['📧', '5-Email Sequence', 'Nurture, educate, and convert. Subject lines included.'],
                  ['🎯', 'Audience Brief', 'Who it\'s for, the problem it solves, how to position it.'],
                  ['📊', 'Delivery Report', 'What was built, why, and how to use it.'],
                ].map(([icon, title, desc]) => (
                  <li key={title as string} className="flex items-start gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <span className="font-semibold text-slate-100 text-sm">{title}</span>
                      <p className="text-slate-400 text-sm">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-slate-50 mb-4">Cross-brand automation</h3>
              <p className="text-slate-400 text-sm mb-4">On Growth plans and above, SkrubCRM and FillCRM work together automatically:</p>
              <div className="space-y-3">
                {[
                  'SkrubCRM detects a ghost lead in your CRM',
                  'Automatically triggers a re-engagement sequence in FillCRM',
                  'Lead gets a fresh nurture system — no manual work',
                  'Sequence performance logged back to your scan dashboard',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-slate-300 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FillCRM Pricing */}
          <h3 className="text-2xl font-bold text-center text-slate-50 mb-3">FillCRM Plans</h3>
          <p className="text-center text-slate-500 text-sm mb-10">All prices include 3% payment processing.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {FILLCRM_TIERS.map(tier => (
              <div key={tier.id} className={`relative flex flex-col rounded-2xl p-6 border ${
                tier.highlight
                  ? 'bg-teal-600 border-teal-500 shadow-xl shadow-teal-500/20'
                  : 'bg-slate-900 border-slate-800'
              }`}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${tier.highlight ? 'text-teal-200' : 'text-teal-400'}`}>
                    FillCRM
                  </div>
                  <h4 className="text-xl font-black text-slate-50">{tier.name}</h4>
                  <p className={`text-sm mt-1 ${tier.highlight ? 'text-teal-200' : 'text-slate-400'}`}>{tier.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-50">${tier.price}</span>
                  <span className={`text-sm ml-1 ${tier.highlight ? 'text-teal-200' : 'text-slate-500'}`}>/mo</span>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className={`text-sm flex items-start gap-2 ${tier.highlight ? 'text-teal-100' : 'text-slate-300'}`}>
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a href={`/checkout?plan=${tier.id}`}
                  className={`w-full text-center py-3 rounded-xl font-bold text-sm transition-colors ${
                    tier.highlight
                      ? 'bg-white text-teal-700 hover:bg-teal-50'
                      : 'bg-teal-600 text-white hover:bg-teal-500'
                  }`}>
                  Start {tier.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUNDLE SECTION ──────────────────────────────────────────── */}
      <section id="bundles" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-50 mb-4">
              Bundle & Save <span className="text-amber-400">20%</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Get SkrubCRM + FillCRM together. One payment. Cross-brand automation active from day one.
            </p>
          </div>

          {/* CRM selector tabs */}
          <BundleSection />
        </div>
      </section>

      {/* ── PORTAL CTA ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">Already a customer?</h2>
          <p className="text-indigo-200 mb-8">Access your scan history, reports, and account settings in your portal.</p>
          <Link href="/portal" className="inline-block bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors">
            Open My Portal
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-lg font-bold text-indigo-400">Skrub<span className="text-slate-100">CRM</span></div>
            <p className="text-slate-500 text-xs mt-1">© 2026 SkrubCRM. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-slate-300 transition-colors">Terms</a>
            <Link href="/portal" className="hover:text-slate-300 transition-colors">Portal</Link>
            <a href="mailto:support@skrubcrm.com" className="hover:text-slate-300 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

// Client component for bundle CRM tab switcher
function BundleSection() {
  // Server-rendered default: HubSpot bundles
  const hsBundles = COMBO_TIERS.filter(t => t.crmProvider === 'hubspot')
  return (
    <div>
      <p className="text-center text-slate-500 text-sm mb-8">Showing HubSpot bundles · <a href="/pricing" className="text-indigo-400 hover:underline">See all CRMs →</a></p>
      <div className="grid md:grid-cols-4 gap-5">
        {hsBundles.map(tier => (
          <div key={tier.id} className={`relative flex flex-col rounded-2xl p-6 border ${
            tier.highlight
              ? 'bg-gradient-to-br from-indigo-600 to-teal-600 border-indigo-500 shadow-xl'
              : 'bg-slate-900 border-slate-800'
          }`}>
            {tier.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                Best Value
              </div>
            )}
            <h4 className="text-lg font-black text-slate-50 mb-1">{tier.name}</h4>
            <p className="text-slate-400 text-xs mb-4">{tier.description}</p>
            <div className="mb-5">
              <span className="text-3xl font-black text-slate-50">${tier.price}</span>
              <span className="text-sm text-slate-500 ml-1">/mo</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {tier.features.map(f => (
                <li key={f} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-green-400 shrink-0 mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
            <a href={`/checkout?plan=${tier.id}`}
              className={`w-full text-center py-2.5 rounded-xl font-bold text-sm transition-colors ${
                tier.highlight ? 'bg-white text-indigo-700 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}>
              Get Bundle
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
