import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Link Expired | SkrubCRM',
  robots: { index: false },
}

export default function ExpiredPage() {
  return (
    <main className="bg-slate-950 min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6">⏱️</div>
        <h1 className="text-2xl font-black text-slate-50 mb-3">That link has expired</h1>
        <p className="text-slate-400 mb-8">
          Portal login links expire after 15 minutes and can only be used once. Request a new one below — it takes 5 seconds.
        </p>
        <Link href="/portal"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-bold px-8 py-4 rounded-xl">
          Request a New Link
        </Link>
        <p className="text-slate-600 text-xs mt-6">
          If you keep having trouble, email <a href="mailto:support@skrubcrm.com" className="text-slate-400 hover:underline">support@skrubcrm.com</a>
        </p>
      </div>
    </main>
  )
}
