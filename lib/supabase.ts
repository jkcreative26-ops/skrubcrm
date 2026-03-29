import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singletons — created on first use so missing env vars don't blow up at build time
let _supabase: SupabaseClient | null = null
let _supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    _supabase = createClient(url, key, { auth: { persistSession: false } })
  }
  return _supabase
}

export function getSupabaseClient(): SupabaseClient {
  if (!_supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    _supabaseClient = createClient(url, anonKey)
  }
  return _supabaseClient
}

// Legacy named exports — kept for backward compat, resolved lazily via proxy
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) { return (getSupabase() as any)[prop] },
})

export const supabaseClient = new Proxy({} as SupabaseClient, {
  get(_t, prop) { return (getSupabaseClient() as any)[prop] },
})
