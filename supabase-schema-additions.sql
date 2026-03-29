-- SkrubCRM Schema Additions
-- Safe to run on existing database - only adds new columns and tables
-- Run AFTER supabase-schema.sql

-- ─── scan_logs additions ────────────────────────────────────────────────────

ALTER TABLE scan_logs
  ADD COLUMN IF NOT EXISTS health_score         INT           CHECK (health_score >= 0 AND health_score <= 100),
  ADD COLUMN IF NOT EXISTS revenue_at_risk      NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_time_issues INT           DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stall_count          INT           DEFAULT 0,
  ADD COLUMN IF NOT EXISTS missing_field_count  INT           DEFAULT 0,
  ADD COLUMN IF NOT EXISTS orphan_count         INT           DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tasks_created        INT           DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deals_tagged         INT           DEFAULT 0;

COMMENT ON COLUMN scan_logs.health_score          IS 'CRM health score 0-100 calculated from all detected issues';
COMMENT ON COLUMN scan_logs.revenue_at_risk       IS 'Estimated revenue at risk from identified issues';
COMMENT ON COLUMN scan_logs.response_time_issues  IS 'Count of leads/deals with delayed response times';
COMMENT ON COLUMN scan_logs.stall_count           IS 'Count of deals stalled in same stage for 21+ days';
COMMENT ON COLUMN scan_logs.missing_field_count   IS 'Count of contacts/leads missing critical fields';
COMMENT ON COLUMN scan_logs.orphan_count          IS 'Count of contacts/leads without owner assignment';
COMMENT ON COLUMN scan_logs.tasks_created         IS 'Count of auto-created follow-up tasks';
COMMENT ON COLUMN scan_logs.deals_tagged          IS 'Count of deals tagged for attention';

-- ─── customers additions ────────────────────────────────────────────────────

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS teams_webhook_url    TEXT,
  ADD COLUMN IF NOT EXISTS magic_link_token     TEXT,
  ADD COLUMN IF NOT EXISTS magic_link_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN customers.teams_webhook_url      IS 'Microsoft Teams webhook for alert notifications (Scour/Agency only)';
COMMENT ON COLUMN customers.magic_link_token       IS 'Secure token for passwordless portal access';
COMMENT ON COLUMN customers.magic_link_expires_at  IS 'Expiration timestamp for magic link (15 minutes)';

-- ─── subscription_tier constraint ───────────────────────────────────────────
-- Drops and replaces the original constraint from supabase-schema.sql
-- to add pipedrive, salesforce, and agency tiers

ALTER TABLE customers
  DROP CONSTRAINT IF EXISTS customers_subscription_tier_check,
  ADD CONSTRAINT customers_subscription_tier_check CHECK (subscription_tier IN (
    -- SkrubCRM solo tiers (v3 fee-adjusted pricing)
    'clean',            -- $154/mo
    'skrub',            -- $309/mo
    'scour',            -- $515/mo
    'agency',           -- $1,029/mo
    -- Salesforce-specific solo tiers
    'salesforce_clean', 'salesforce_skrub', 'salesforce_scour',
    -- Pipedrive-specific solo tiers
    'pipedrive_clean', 'pipedrive_skrub', 'pipedrive_scour',
    -- FillCRM solo tiers (v3)
    'fillcrm_starter',  -- $82/mo
    'fillcrm_growth',   -- $154/mo
    'fillcrm_pro',      -- $257/mo
    'fillcrm_agency',   -- $463/mo
    -- Combo bundle tiers — HubSpot
    'combo_hs_starter', -- $189/mo
    'combo_hs_growth',  -- $371/mo
    'combo_hs_pro',     -- $618/mo
    'combo_hs_agency',  -- $1,194/mo
    -- Combo bundle tiers — Salesforce
    'combo_sf_starter', 'combo_sf_growth', 'combo_sf_pro', 'combo_sf_agency',
    -- Combo bundle tiers — Pipedrive
    'combo_pd_starter', 'combo_pd_growth', 'combo_pd_pro', 'combo_pd_agency',
    -- Legacy (keep for backwards-compat if any rows exist)
    'salesforce_starter'
  ));

-- ─── crm_provider constraint ────────────────────────────────────────────────
-- FIX: base schema only allows ('hubspot', 'salesforce') — add pipedrive

ALTER TABLE customers
  DROP CONSTRAINT IF EXISTS customers_crm_provider_check,
  ADD CONSTRAINT customers_crm_provider_check CHECK (
    crm_provider IN ('hubspot', 'salesforce', 'pipedrive')
  );

-- ─── portals table ──────────────────────────────────────────────────────────
-- Agency tier: one SkrubCRM account can manage multiple CRM portals

CREATE TABLE IF NOT EXISTS portals (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  crm_provider         TEXT NOT NULL CHECK (crm_provider IN ('hubspot', 'salesforce', 'pipedrive')),
  crm_api_key          TEXT NOT NULL,
  portal_name          TEXT NOT NULL,
  active               BOOLEAN DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT now(),
  last_scan_at         TIMESTAMPTZ,

  CONSTRAINT portal_unique_name_per_owner UNIQUE (owner_customer_id, portal_name)
);

COMMENT ON TABLE   portals                      IS 'Multi-customer CRM portals managed by Agency tier customers';
COMMENT ON COLUMN  portals.owner_customer_id    IS 'Agency customer who owns this portal';
COMMENT ON COLUMN  portals.crm_provider         IS 'CRM type: hubspot, salesforce, or pipedrive';
COMMENT ON COLUMN  portals.crm_api_key          IS 'API key for CRM authentication — encrypt at app layer before storing';
COMMENT ON COLUMN  portals.portal_name          IS 'Display name for the portal (e.g. "Acme Corp")';
COMMENT ON COLUMN  portals.active               IS 'Portal is actively monitored if true';

CREATE INDEX IF NOT EXISTS idx_portals_owner_customer_id ON portals(owner_customer_id);
CREATE INDEX IF NOT EXISTS idx_portals_active            ON portals(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_portals_last_scan_at      ON portals(last_scan_at);

-- RLS: enabled as defence-in-depth. Service role key bypasses all policies.
-- App uses service role server-side, so these policies block accidental anon exposure only.
ALTER TABLE portals ENABLE ROW LEVEL SECURITY;

-- NOTE: No permissive policies defined here.
-- The absence of permissive policies = deny all for anon/authenticated roles.
-- Add a policy below only if you build a user-facing dashboard that queries
-- portals directly via the anon/authenticated role (e.g. Supabase Auth + RLS).
--
-- Example (uncomment and adapt if needed):
-- CREATE POLICY portals_owner_access ON portals
--   FOR ALL
--   USING (owner_customer_id = auth.uid())
--   WITH CHECK (owner_customer_id = auth.uid());

-- ─── scan_logs_portals junction table ───────────────────────────────────────
-- Tracks which portal each scan log belongs to (Agency tier)

CREATE TABLE IF NOT EXISTS scan_logs_portals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_log_id  UUID NOT NULL REFERENCES scan_logs(id) ON DELETE CASCADE,
  portal_id    UUID NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT scan_logs_portals_unique UNIQUE (scan_log_id, portal_id)
);

CREATE INDEX IF NOT EXISTS idx_scan_logs_portals_scan_log_id ON scan_logs_portals(scan_log_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_portals_portal_id   ON scan_logs_portals(portal_id);

COMMENT ON TABLE scan_logs_portals IS 'Maps scan results to portals for Agency tier multi-customer tracking';
