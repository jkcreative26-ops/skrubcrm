'use client'
import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { getTierById, SKRUBCRM_TIERS, FILLCRM_TIERS, COMBO_TIERS } from '@/lib/tier-config'

function CheckoutForm() {
  const params  = useSearchParams()
  const planId  = params.get('plan') ?? ''
  const cancelled = params.get('cancelled') === '1'
  const tier    = getTierById(planId)

  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const isFill  = planId.startsWith('fillcrm_')
  const accent  = isFill ? 'teal' : 'indigo'
  const accentBg    = isFill ? 'bg-teal-600 hover:bg-teal-500'   : 'bg-indigo-600 hover:bg-indigo-500'
  const accentBorder = isFill ? 'border-teal-500/30 bg-teal-500/10 text-teal-300' : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
  const accentText  = isFill ? 'text-teal-400' : 'text-indigo-400'

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, email }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Network error. Check your connection and try again.')
      setLoading(false)
    }
  }

  // Unknown plan — show plan picker
  if (!tier) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-black text-slate-50 mb-4">Choose a plan</h1>
        <p className="text-slate-400 mb-10">Select the plan that fits your team.</p>
        <div className="grid md:grid-cols-4 gap-5 mb-10">
          {SKRUBCRM_TIERS.map(t => (
            <a key={t.id} href={`/checkout?plan=${t.id}`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-colors text-left">
              <div className="text-xs text-indigo-400 font-semibold mb-1">SkrubCRM</div>
              <div className="font-bold text-slate-50">{t.name}</div>
              <div className="text-2xl font-black text-slate-100 mt-2">${t.price}<span className="text-sm text-slate-500">/mo</span></div>
            </a>
          ))}
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {FILLCRM_TIERS.map(t => (
            <a key={t.id} href={`/checkout?plan=${t.id}`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-teal-500/50 transition-colors text-left">
              <div className="text-xs text-teal-400 font-semibold mb-1">FillCRM</div>
              <div className="font-bold text-slate-50">{t.name}</div>
              <div className="text-2xl font-black text-slate-100 mt-2">${t.price}<span className="text-sm text-slate-500">/mo</span></div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  const isFillTier = tier.brand === 'fillcrm'
  const isCombo    = tier.brand === 'combo'

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <a href="/" className="text-slate-500 text-sm hover:text-slate-300 transition-colors mb-8 inline-block">← Back</a>

      {cancelled && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm px-4 py-3 rounded-xl">
          Your checkout was cancelled. No charge was made. Ready when you are.
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-10">

        {/* Order summary */}
        <div className="md:col-span-2 order-2 md:order-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-8">
            <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${accentText}`}>
              {isFillTier ? 'FillCRM' : isCombo ? 'Bundle' : 'SkrubCRM'}
            </div>
            <h2 className="text-xl font-black text-slate-50 mb-1">{tier.name}</h2>
            <p className="text-slate-400 text-sm mb-4">{tier.description}</p>
            <div className="text-3xl font-black text-slate-50 mb-1">
              ${tier.price}<span className="text-sm text-slate-500 font-normal">/month</span>
            </div>
            <p className="text-xs text-slate-600 mb-5">Billed monthly. Cancel anytime.</p>
            <ul className="space-y-2 border-t border-slate-800 pt-4">
              {tier.features.map(f => (
                <li key={f} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-green-400 shrink-0 mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Checkout form */}
        <div className="md:col-span-3 order-1 md:order-2">
          <h1 className="text-2xl font-black text-slate-50 mb-2">Complete your order</h1>
          <p className="text-slate-400 text-sm mb-6">
            You'll be redirected to Square's secure checkout. We never store your card details.
          </p>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
              />
              <p className="text-xs text-slate-600 mt-1">We'll send your portal access link to this address.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className={`w-full ${accentBg} disabled:opacity-50 text-white font-bold py-4 rounded-xl text-base transition-colors shadow-lg`}>
              {loading ? 'Redirecting to checkout…' : `Subscribe — $${tier.price}/mo`}
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-600 pt-2">
              <span>🔒 SSL encrypted</span>
              <span>·</span>
              <span>Powered by Square</span>
              <span>·</span>
              <span>Cancel anytime</span>
            </div>
          </form>

          <div className={`mt-8 border ${accentBorder} rounded-xl p-4 text-sm`}>
            <strong>What happens next:</strong> After payment, you'll get an email from{' '}
            {isFillTier ? 'delivery@fillcrm.com' : 'reports@skrubcrm.com'} with your portal access link.{' '}
            {isFillTier
              ? 'Your first lead system will be delivered within your tier\'s window.'
              : 'Your first CRM scan will run within 24 hours.'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <main className="bg-slate-950 min-h-screen text-slate-100">
      <nav className="bg-slate-950/90 border-b border-slate-800 px-6 h-14 flex items-center">
        <a href="/" className="text-lg font-black text-indigo-400">Skrub<span className="text-slate-100">CRM</span></a>
      </nav>
      <Suspense fallback={<div className="text-slate-400 text-sm p-10">Loading…</div>}>
        <CheckoutForm />
      </Suspense>
    </main>
  )
}
