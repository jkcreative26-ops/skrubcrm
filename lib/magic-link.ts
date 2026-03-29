import crypto from 'crypto'
import { supabase } from './supabase'

const EXPIRY_MINUTES = 15

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createMagicLink(email: string): Promise<string | null> {
  // Verify customer exists and is active
  const { data: customer, error } = await supabase
    .from('customers')
    .select('id, email, active')
    .eq('email', email.toLowerCase().trim())
    .eq('active', true)
    .single()

  if (error || !customer) return null

  const token = generateToken()
  const expires = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000).toISOString()

  const { error: updateError } = await supabase
    .from('customers')
    .update({
      magic_link_token: token,
      magic_link_expires_at: expires,
    })
    .eq('id', customer.id)

  if (updateError) {
    console.error('Failed to save magic link token:', updateError.message)
    return null
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://skrubcrm.com'
  return `${baseUrl}/portal?token=${token}`
}

export async function verifyMagicLink(token: string): Promise<{ id: string; email: string; subscription_tier: string } | null> {
  if (!token || token.length !== 64) return null

  const { data: customer, error } = await supabase
    .from('customers')
    .select('id, email, subscription_tier, magic_link_token, magic_link_expires_at, active')
    .eq('magic_link_token', token)
    .eq('active', true)
    .single()

  if (error || !customer) return null

  // Check expiry
  if (!customer.magic_link_expires_at || new Date(customer.magic_link_expires_at) < new Date()) {
    return null
  }

  // One-time use: clear the token immediately after verification
  await supabase
    .from('customers')
    .update({ magic_link_token: null, magic_link_expires_at: null })
    .eq('id', customer.id)

  return {
    id: customer.id,
    email: customer.email,
    subscription_tier: customer.subscription_tier,
  }
}
