import type { Metadata } from 'next'
import { SKRUBCRM_TIERS, FILLCRM_TIERS, COMBO_TIERS } from '@/lib/tier-config'
import type { CrmProvider } from '@/lib/tier-config'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — SkrubCRM + FillCRM',
  description: 'All plans for SkrubCRM and FillCRM. Solo or bundled across HubSpot, Salesforce, and Pipedrive.',
}

const CRM_LABELS: Record<CrmProvider, string> = {
  hubspot:    'HubSpot',
  salesforce: 'Salesforce',
  pipedrive:  'Pipedrive',
}

export default function PricingPage() {
  return (
    <main className="bg-slate-950 text-slate-100 min-h-screen">
      <nav className="bg-slate-950/90 border-b border-slate-800 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-black text-indigo-400">Skrub<span className="text-slate-100">CRM</span></Link>
        <Link href="/portal" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">Sign In</Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-slate-50 mb-4">Pricing</h1>
          <p className="text-slate-400 max-w-xl mx-auto">All prices include 3% payment processing. No setup fees. Cancel anytime.</p>
        </div>

        {/* ── SKRUBCRM ─────────────────────────────────────────── */}
        <section className="mb-20">
          <h2 className="text-2xl font-black text-slate-50 mb-2">
            <span className="text-indigo-400">SkrubCRM</span> — CRM Health Plans
          </h2>
          <p className="text-slate-500 text-sm mb-8">Works with HubSpot, Salesforce, and Pipedrive. Same price across all three.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {SKRUBCRM_TIERS.map(tier => (
              <div key={tier.id} className={`relative flex flex-col rounded-2xl p-6 border ${
                tier.highlight ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-500/20' : 'bg-slate-900 border-slate-800'
              }`}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
                )}
                <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${tier.highlight ? 'text-indigo-200' : 'text-indigo-400'}`}>SkrubCRM</div>
                <h3 className="text-xl font-black text-slate-50">{tier.name}</h3>
                <p className={`text-sm mt-1 mb-4 ${tier.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{tier.description}</p>
                <div className="mb-5">
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
                    tier.highlight ? 'bg-white text-indigo-700 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}>
                  Get {tier.name}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── FILLCRM ──────────────────────────────────────────── */}
        <section className="mb-20">
          <h2 className="text-2xl font-black text-slate-50 mb-2">
            <span className="text-teal-400">FillCRM</span> — Monthly Lead System Plans
          </h2>
          <p className="text-slate-500 text-sm mb-8">A new AI lead magnet + email sequence delivered every month.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {FILLCRM_TIERS.map(tier => (
              <div key={tier.id} className={`relative flex flex-col rounded-2xl p-6 border ${
                tier.highlight ? 'bg-teal-600 border-teal-500 shadow-xl shadow-teal-500/20' : 'bg-slate-900 border-slate-800'
              }`}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
                )}
                <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${tier.highlight ? 'text-teal-200' : 'text-teal-400'}`}>FillCRM</div>
                <h3 className="text-xl font-black text-slate-50">{tier.name}</h3>
                <p className={`text-sm mt-1 mb-4 ${tier.highlight ? 'text-teal-200' : 'text-slate-400'}`}>{tier.description}</p>
                <div className="mb-5">
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
                    tier.highlight ? 'bg-white text-teal-700 hover:bg-teal-50' : 'bg-teal-600 text-white hover:bg-teal-500'
                  }`}>
                  Get {tier.name}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── BUNDLES ──────────────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-2xl font-black text-slate-50 mb-2">
            Bundle Plans — <span className="text-amber-400">Save 20%</span>
          </h2>
          <p className="text-slate-500 text-sm mb-10">SkrubCRM + FillCRM together. Same price per CRM — choose yours below.</p>

          {(['hubspot', 'salesforce', 'pipedrive'] as CrmProvider[]).map(crm => {
            const bundles = COMBO_TIERS.filter(t => t.crmProvider === crm)
            return (
              <div key={crm} className="mb-12">
                <h3 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-3">
                  <span className="w-px h-5 bg-slate-700" />
                  {CRM_LABELS[crm]} Bundles
                </h3>
                <div className="grid md:grid-cols-4 gap-5">
                  {bundles.map(tier => (
                    <div key={tier.id} className={`relative flex flex-col rounded-2xl p-6 border ${
                      tier.highlight
                        ? 'bg-gradient-to-br from-indigo-600 to-teal-600 border-indigo-500 shadow-xl'
                        : 'bg-slate-900 border-slate-800'
                    }`}>
                      {tier.highlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">Best Value</div>
                      )}
                      <h4 className="font-black text-slate-50 mb-1">{tier.name}</h4>
                      <p className="text-slate-400 text-xs mb-4">{tier.description}</p>
                      <div className="mb-5">
                        <span className="text-3xl font-black text-slate-50">${tier.price}</span>
                        <span className="text-sm text-slate-500 ml-1">/mo</span>
                      </div>
                      <ul className="space-y-1.5 mb-6 flex-1">
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
          })}
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-slate-50 mb-6 text-center">Common questions</h2>
          <div className="space-y-4">
            {[
              ['Do I need to choose a CRM upfront?', 'Yes — your plan is tied to one CRM (HubSpot, Salesforce, or Pipedrive). Agency tier supports multiple portals under one account.'],
              ['Can I cancel anytime?', 'Yes. Cancel from your portal or email support@skrubcrm.com. No cancellation fees, no lock-in.'],
              ['What payment methods do you accept?', 'All major credit and debit cards via Square. Visa, Mastercard, Amex, and Discover are all accepted.'],
              ['When does my first scan run?', 'Within 24 hours of your first payment. You\'ll get an email report at the end of each scan cycle.'],
              ['What\'s the difference between SkrubCRM and FillCRM?', 'SkrubCRM cleans your existing CRM data. FillCRM fills your pipeline with new AI-built lead systems each month. Bundles give you both.'],
            ].map(([q, a]) => (
              <div key={q} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold text-slate-100 text-sm mb-2">{q}</h3>
                <p className="text-slate-400 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
