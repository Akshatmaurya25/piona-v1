-- Migration: Add API key to services table
-- This allows services to be accessed via API key instead of service ID

-- Add API key column
ALTER TABLE services
ADD COLUMN IF NOT EXISTS api_key VARCHAR(64) UNIQUE;

-- Generate API keys for existing services (32 bytes = 64 hex chars)
UPDATE services
SET api_key = encode(gen_random_bytes(32), 'hex')
WHERE api_key IS NULL;

-- Make it NOT NULL after populating existing rows
ALTER TABLE services
ALTER COLUMN api_key SET NOT NULL;

-- Add index for fast lookups by API key
CREATE INDEX IF NOT EXISTS idx_services_api_key ON services(api_key);

-- Add a comment for documentation
COMMENT ON COLUMN services.api_key IS 'Unique API key for external integrations';
