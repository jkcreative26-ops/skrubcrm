'use client'
import { useState, useEffect } from 'react'
import { hasSkrubAccess, hasFillAccess, getTierById } from '@/lib/tier-config'

interface ScanLog {
  id: string
  created_at: string
  health_score: number
  revenue_at_risk: number
  stall_count: number
  missing_field_count: number
  orphan_count: number
  tasks_created: number
  deals_tagged: number
  crm_provider: string
}

interface CustomerSession {
  id: string
  email: string
  subscription_tier: string
  crm_provider: string
  active: boolean
  slack_webhook_url?: string
  teams_webhook_url?: string
}

export default function PortalPage() {
  const [customer, setCustomer] = useState<CustomerSession | null>(null)
  const [scans, setScans] = useState<ScanLog[]>([])
  const [loading, setLoading] = useState(true)
  const [authState, setAuthState] = useState<'checking' | 'needs-login' | 'authenticated'>('checking')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSent, setLoginSent] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'scans' | 'fill' | 'settings'>('overview')

  useEffect(() => {
    fetch('/api/portal/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.customer) {
          setCustomer(data.customer)
          setScans(data.scans ?? [])
          setAuthState('authenticated')
        } else {
          setAuthState('needs-login')
        }
      })
      .catch(() => setAuthState('needs-login'))
      .finally(() => setLoading(false))
  }, [])

  async function requestMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!loginEmail) return
    setLoginLoading(true)
    await fetch('/api/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail }),
    })
    setLoginSent(true)
    setLoginLoading(false)
  }

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading your portal…</div>
      </div>
    )
  }

  if (authState === 'needs-login') {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-2xl font-black text-indigo-400 mb-2">Skrub<span className="text-slate-100">CRM</span></div>
            <h1 className="text-xl font-bold text-slate-50">Access your portal</h1>
            <p className="text-slate-400 text-sm mt-2">Enter your account email and we'll send a secure login link.</p>
          </div>
          {loginSent ? (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 text-center">
              <div className="text-2xl mb-3">📬</div>
              <h2 className="font-bold text-slate-50 mb-2">Check your inbox</h2>
              <p className="text-slate-400 text-sm">We sent a login link to <strong className="text-slate-200">{loginEmail}</strong>. It expires in 15 minutes.</p>
              <button onClick={() => { setLoginSent(false); setLoginEmail('') }}
                className="mt-4 text-indigo-400 text-sm hover:underline">
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={requestMagicLink} className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 mb-4"
              />
              <button type="submit" disabled={loginLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                {loginLoading ? 'Sending…' : 'Send Login Link'}
              </button>
              <p className="text-xs text-slate-600 text-center mt-4">No password. One-time link. 15 minute expiry.</p>
            </form>
          )}
        </div>
      </div>
    )
  }

  if (!customer) return null

  const tier = getTierById(customer.subscription_tier)
  const skrubAccess = hasSkrubAccess(customer.subscription_tier)
  const fillAccess  = hasFillAccess(customer.subscription_tier)
  const latestScan  = scans[0]

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100">

      {/* ── PORTAL NAV ────────────────────────────────────────── */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-black text-indigo-400">Skrub<span className="text-slate-100">CRM</span></span>
          <div className="hidden md:flex gap-1">
            {[
              { id: 'overview', label: 'Overview' },
              ...(skrubAccess ? [{ id: 'scans', label: 'Scan History' }] : []),
              ...(fillAccess  ? [{ id: 'fill',  label: 'FillCRM' }] : []),
              { id: 'settings', label: 'Settings' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-500">{customer.email}</div>
            <div className={`text-xs font-semibold ${tier ? 'text-indigo-400' : 'text-slate-400'}`}>
              {tier?.name ?? customer.subscription_tier}
            </div>
          </div>
          <a href="/api/portal/logout" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Sign out</a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── OVERVIEW TAB ──────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-black text-slate-50">Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">
                  {tier?.name} plan · {customer.crm_provider}
                </p>
              </div>
              {skrubAccess && (
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  customer.active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${customer.active ? 'bg-green-400' : 'bg-red-400'}`} />
                  {customer.active ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>

            {/* KPI cards */}
            {skrubAccess && latestScan && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Health Score',    value: `${latestScan.health_score ?? '--'}/100`, color: (latestScan.health_score ?? 0) >= 70 ? 'text-green-400' : (latestScan.health_score ?? 0) >= 40 ? 'text-amber-400' : 'text-red-400' },
                  { label: 'Revenue at Risk', value: `$${(latestScan.revenue_at_risk ?? 0).toLocaleString()}`, color: 'text-red-400' },
                  { label: 'Stalled Deals',   value: String(latestScan.stall_count ?? 0), color: 'text-amber-400' },
                  { label: 'Tasks Created',   value: String(latestScan.tasks_created ?? 0), color: 'text-indigo-400' },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="text-xs text-slate-500 mb-1">{kpi.label}</div>
                    <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* No scans yet */}
            {skrubAccess && !latestScan && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center mb-8">
                <div className="text-4xl mb-4">🔍</div>
                <h2 className="font-bold text-slate-50 mb-2">Your first scan is scheduled</h2>
                <p className="text-slate-400 text-sm">We'll run your first CRM scan within 24 hours and send results to {customer.email}.</p>
              </div>
            )}

            {/* Access summary */}
            <div className="grid md:grid-cols-2 gap-5">
              {skrubAccess && (
                <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-lg">🔍</div>
                    <div>
                      <h3 className="font-bold text-slate-50 text-sm">SkrubCRM</h3>
                      <div className="text-xs text-indigo-400">{tier?.name} · {customer.crm_provider}</div>
                    </div>
                  </div>
                  {latestScan ? (
                    <p className="text-slate-400 text-sm">Last scan: {new Date(latestScan.created_at).toLocaleDateString()}</p>
                  ) : (
                    <p className="text-slate-500 text-sm">First scan pending</p>
                  )}
                  <button onClick={() => setActiveTab('scans')} className="mt-4 text-indigo-400 text-sm hover:underline">
                    View scan history →
                  </button>
                </div>
              )}
              {fillAccess && (
                <div className="bg-slate-900 border border-teal-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-lg">📧</div>
                    <div>
                      <h3 className="font-bold text-slate-50 text-sm">FillCRM</h3>
                      <div className="text-xs text-teal-400">Lead System Delivery</div>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm">Next delivery: this month's system in progress</p>
                  <button onClick={() => setActiveTab('fill')} className="mt-4 text-teal-400 text-sm hover:underline">
                    View deliveries →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SCAN HISTORY TAB ──────────────────────────────── */}
        {activeTab === 'scans' && skrubAccess && (
          <div>
            <h1 className="text-2xl font-black text-slate-50 mb-8">Scan History</h1>
            {scans.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
                <p className="text-slate-400">No scans yet. Your first scan will run within 24 hours.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scans.map(scan => (
                  <div key={scan.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold text-slate-50 text-sm">{new Date(scan.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        <div className="text-xs text-slate-500 capitalize">{scan.crm_provider}</div>
                      </div>
                      <div className={`text-2xl font-black ${
                        (scan.health_score ?? 0) >= 70 ? 'text-green-400' :
                        (scan.health_score ?? 0) >= 40 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {scan.health_score ?? '--'}<span className="text-sm text-slate-500">/100</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {[
                        { label: 'Revenue Risk', value: `$${(scan.revenue_at_risk ?? 0).toLocaleString()}` },
                        { label: 'Stalled', value: scan.stall_count ?? 0 },
                        { label: 'Missing Fields', value: scan.missing_field_count ?? 0 },
                        { label: 'Orphans', value: scan.orphan_count ?? 0 },
                        { label: 'Tasks Created', value: scan.tasks_created ?? 0 },
                        { label: 'Deals Tagged', value: scan.deals_tagged ?? 0 },
                      ].map(item => (
                        <div key={item.label} className="text-center">
                          <div className="text-lg font-bold text-slate-100">{item.value}</div>
                          <div className="text-xs text-slate-500">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FILL TAB ──────────────────────────────────────── */}
        {activeTab === 'fill' && fillAccess && (
          <div>
            <h1 className="text-2xl font-black text-slate-50 mb-8">FillCRM Deliveries</h1>
            <div className="bg-slate-900 border border-teal-500/20 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-4">📬</div>
              <h2 className="font-bold text-slate-50 mb-2">This month's system is in progress</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">Your lead magnet and email sequence will be delivered to <strong className="text-slate-200">{customer.email}</strong> within your tier's delivery window.</p>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ──────────────────────────────────── */}
        {activeTab === 'settings' && (
          <SettingsTab customer={customer} />
        )}
      </div>
    </div>
  )
}

function SettingsTab({ customer }: { customer: CustomerSession }) {
  const [slackUrl, setSlackUrl]   = useState(customer.slack_webhook_url ?? '')
  const [teamsUrl, setTeamsUrl]   = useState(customer.teams_webhook_url ?? '')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)

  const tier = getTierById(customer.subscription_tier)
  const hasSlack = ['scour', 'agency', 'fillcrm_pro', 'fillcrm_agency'].some(t => customer.subscription_tier.includes(t)) ||
                   customer.subscription_tier.startsWith('combo_')
  const hasTeams = ['agency'].some(t => customer.subscription_tier.includes(t)) ||
                   customer.subscription_tier.startsWith('combo_') && customer.subscription_tier.endsWith('agency')

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/portal/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slack_webhook_url: slackUrl, teams_webhook_url: teamsUrl }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-50 mb-8">Settings</h1>
      <div className="max-w-xl space-y-6">

        {/* Account info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-bold text-slate-50 mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Email</span>
              <span className="text-slate-100">{customer.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Plan</span>
              <span className="text-indigo-400 font-semibold">{tier?.name ?? customer.subscription_tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CRM</span>
              <span className="text-slate-100 capitalize">{customer.crm_provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span className={customer.active ? 'text-green-400' : 'text-red-400'}>
                {customer.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {(hasSlack || hasTeams) && (
          <form onSubmit={saveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="font-bold text-slate-50 mb-4">Notifications</h2>
            {hasSlack && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Slack Webhook URL
                </label>
                <input
                  type="url"
                  value={slackUrl}
                  onChange={e => setSlackUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">Paste your Slack Incoming Webhook URL. Scan alerts + anomalies will post here.</p>
              </div>
            )}
            {hasTeams && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Microsoft Teams Webhook URL
                </label>
                <input
                  type="url"
                  value={teamsUrl}
                  onChange={e => setTeamsUrl(e.target.value)}
                  placeholder="https://outlook.office.com/webhook/..."
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
            <button type="submit" disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Settings'}
            </button>
          </form>
        )}

        {/* Upgrade */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-bold text-slate-50 mb-2">Change Plan</h2>
          <p className="text-slate-400 text-sm mb-4">Upgrade, downgrade, or cancel your subscription.</p>
          <a href="mailto:support@skrubcrm.com?subject=Plan%20Change%20Request"
            className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors border border-slate-700">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
