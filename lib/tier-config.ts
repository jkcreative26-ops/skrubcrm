// Single source of truth for tier metadata used across landing page, portal, and checkout

export type Brand = 'skrubcrm' | 'fillcrm' | 'combo'
export type CrmProvider = 'hubspot' | 'salesforce' | 'pipedrive'

export interface TierConfig {
  id: string              // matches subscription_tier in Supabase
  brand: Brand
  name: string
  price: number           // monthly, fee-adjusted
  netPrice: number        // after ~3% processor fee
  description: string
  features: string[]
  highlight?: boolean     // show "Most Popular" badge
  crmProvider?: CrmProvider
}

export const SKRUBCRM_TIERS: TierConfig[] = [
  {
    id: 'clean',
    brand: 'skrubcrm',
    name: 'Clean',
    price: 154,
    netPrice: 149,
    description: 'Weekly CRM scan with email report',
    features: [
      'Weekly automated scan',
      'Ghost leads & duplicates detected',
      'Missing field report',
      'Email report every Monday',
      'HubSpot, Salesforce, or Pipedrive',
    ],
  },
  {
    id: 'skrub',
    brand: 'skrubcrm',
    name: 'Skrub',
    price: 309,
    netPrice: 299,
    description: '2× weekly scans + auto-fix',
    highlight: true,
    features: [
      'Everything in Clean',
      '2× weekly scans',
      'Auto-fix: duplicates, orphans, missing fields',
      'Dead deal tagging',
      'Stalled deal alerts',
    ],
  },
  {
    id: 'scour',
    brand: 'skrubcrm',
    name: 'Scour',
    price: 515,
    netPrice: 499,
    description: 'Daily scans + Slack alerts + full auto-fix',
    features: [
      'Everything in Skrub',
      'Daily scans',
      'Real-time Slack alerts',
      'Revenue-at-risk scoring',
      'Priority email support',
    ],
  },
  {
    id: 'agency',
    brand: 'skrubcrm',
    name: 'Agency',
    price: 1029,
    netPrice: 999,
    description: 'Multi-portal: all 3 CRMs, Slack + Teams',
    features: [
      'Everything in Scour',
      'Unlimited client portals',
      'All 3 CRMs under one account',
      'Slack + Microsoft Teams alerts',
      'White-label reports',
      'Dedicated account manager',
    ],
  },
]

export const FILLCRM_TIERS: TierConfig[] = [
  {
    id: 'fillcrm_starter',
    brand: 'fillcrm',
    name: 'Starter',
    price: 82,
    netPrice: 79,
    description: '1 lead magnet + email sequence per month',
    features: [
      '1 AI lead magnet/month',
      '1 five-email nurture sequence',
      '24-hour delivery',
      'PDF-ready format',
      'Your niche, your audience',
    ],
  },
  {
    id: 'fillcrm_growth',
    brand: 'fillcrm',
    name: 'Growth',
    price: 154,
    netPrice: 149,
    description: '2 systems/mo + SkrubCRM cross-brand triggers',
    highlight: true,
    features: [
      '2 lead systems/month',
      'SkrubCRM ghost-lead → sequence trigger',
      'Priority 18h delivery',
      'A/B subject line variants',
      'Monthly performance review',
    ],
  },
  {
    id: 'fillcrm_pro',
    brand: 'fillcrm',
    name: 'Pro',
    price: 257,
    netPrice: 249,
    description: '3 systems/mo + 12h delivery + Slack alerts',
    features: [
      '3 lead systems/month',
      'Priority 12-hour delivery',
      'Real-time Slack delivery alerts',
      'Dedicated content strategist review',
      'Revision included per system',
    ],
  },
  {
    id: 'fillcrm_agency',
    brand: 'fillcrm',
    name: 'Agency',
    price: 463,
    netPrice: 449,
    description: '5–10 systems/mo, white-label, sub-accounts',
    features: [
      '5–10 lead systems/month',
      'White-label — zero FillCRM branding',
      'Sub-accounts per client',
      'Client-facing delivery reports',
      'Approval workflow before client receives',
      '1 revision per system',
    ],
  },
]

export const COMBO_TIERS: TierConfig[] = [
  // HubSpot
  { id: 'combo_hs_starter', brand: 'combo', name: 'Starter Bundle', price: 189, netPrice: 183, crmProvider: 'hubspot',
    description: 'SkrubCRM Clean + FillCRM Starter — save $47/mo',
    features: ['SkrubCRM Clean ($154/mo value)', 'FillCRM Starter ($82/mo value)', '20% off both — save $47/mo', 'Cross-brand automation included'] },
  { id: 'combo_hs_growth',  brand: 'combo', name: 'Growth Bundle',  price: 371, netPrice: 360, crmProvider: 'hubspot', highlight: true,
    description: 'SkrubCRM Skrub + FillCRM Growth — save $92/mo',
    features: ['SkrubCRM Skrub ($309/mo value)', 'FillCRM Growth ($154/mo value)', '20% off both — save $92/mo', 'Ghost lead → sequence automation'] },
  { id: 'combo_hs_pro',     brand: 'combo', name: 'Pro Bundle',     price: 618, netPrice: 599, crmProvider: 'hubspot',
    description: 'SkrubCRM Scour + FillCRM Pro — save $154/mo',
    features: ['SkrubCRM Scour ($515/mo value)', 'FillCRM Pro ($257/mo value)', '20% off both — save $154/mo', 'Daily scans + same-day sequences'] },
  { id: 'combo_hs_agency',  brand: 'combo', name: 'Agency Bundle',  price: 1194, netPrice: 1158, crmProvider: 'hubspot',
    description: 'SkrubCRM Agency + FillCRM Agency — save $298/mo',
    features: ['SkrubCRM Agency ($1,029/mo value)', 'FillCRM Agency ($463/mo value)', '20% off both — save $298/mo', 'Full white-label for both products'] },
  // Salesforce (same prices, different IDs)
  { id: 'combo_sf_starter', brand: 'combo', name: 'Starter Bundle', price: 189, netPrice: 183, crmProvider: 'salesforce',
    description: 'SkrubCRM Clean + FillCRM Starter — save $47/mo', features: ['SkrubCRM Clean', 'FillCRM Starter', 'Save $47/mo', 'Salesforce native'] },
  { id: 'combo_sf_growth',  brand: 'combo', name: 'Growth Bundle',  price: 371, netPrice: 360, crmProvider: 'salesforce', highlight: true,
    description: 'SkrubCRM Skrub + FillCRM Growth — save $92/mo', features: ['SkrubCRM Skrub', 'FillCRM Growth', 'Save $92/mo', 'Salesforce native'] },
  { id: 'combo_sf_pro',     brand: 'combo', name: 'Pro Bundle',     price: 618, netPrice: 599, crmProvider: 'salesforce',
    description: 'SkrubCRM Scour + FillCRM Pro — save $154/mo', features: ['SkrubCRM Scour', 'FillCRM Pro', 'Save $154/mo', 'Salesforce native'] },
  { id: 'combo_sf_agency',  brand: 'combo', name: 'Agency Bundle',  price: 1194, netPrice: 1158, crmProvider: 'salesforce',
    description: 'Both Agency tiers — save $298/mo', features: ['Both Agency tiers', 'Save $298/mo', 'Salesforce native', 'White-label'] },
  // Pipedrive
  { id: 'combo_pd_starter', brand: 'combo', name: 'Starter Bundle', price: 189, netPrice: 183, crmProvider: 'pipedrive',
    description: 'SkrubCRM Clean + FillCRM Starter — save $47/mo', features: ['SkrubCRM Clean', 'FillCRM Starter', 'Save $47/mo', 'Pipedrive native'] },
  { id: 'combo_pd_growth',  brand: 'combo', name: 'Growth Bundle',  price: 371, netPrice: 360, crmProvider: 'pipedrive', highlight: true,
    description: 'SkrubCRM Skrub + FillCRM Growth — save $92/mo', features: ['SkrubCRM Skrub', 'FillCRM Growth', 'Save $92/mo', 'Pipedrive native'] },
  { id: 'combo_pd_pro',     brand: 'combo', name: 'Pro Bundle',     price: 618, netPrice: 599, crmProvider: 'pipedrive',
    description: 'SkrubCRM Scour + FillCRM Pro — save $154/mo', features: ['SkrubCRM Scour', 'FillCRM Pro', 'Save $154/mo', 'Pipedrive native'] },
  { id: 'combo_pd_agency',  brand: 'combo', name: 'Agency Bundle',  price: 1194, netPrice: 1158, crmProvider: 'pipedrive',
    description: 'Both Agency tiers — save $298/mo', features: ['Both Agency tiers', 'Save $298/mo', 'Pipedrive native', 'White-label'] },
]

export const ALL_TIERS = [...SKRUBCRM_TIERS, ...FILLCRM_TIERS, ...COMBO_TIERS]

export function getTierById(id: string): TierConfig | undefined {
  return ALL_TIERS.find(t => t.id === id)
}

export function isSkrubTier(tier: string): boolean {
  return ['clean', 'skrub', 'scour', 'agency'].includes(tier) ||
         tier.startsWith('salesforce_') || tier.startsWith('pipedrive_')
}

export function isFillTier(tier: string): boolean {
  return tier.startsWith('fillcrm_')
}

export function isComboTier(tier: string): boolean {
  return tier.startsWith('combo_')
}

export function hasSkrubAccess(tier: string): boolean {
  return isSkrubTier(tier) || isComboTier(tier)
}

export function hasFillAccess(tier: string): boolean {
  return isFillTier(tier) || isComboTier(tier)
}
