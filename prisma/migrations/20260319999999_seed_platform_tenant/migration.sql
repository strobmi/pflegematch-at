-- Ensure the platform tenant (pflegematch.at itself) exists.
-- This record is required for the fragebogen lead capture to work.
-- Uses ON CONFLICT DO NOTHING so re-runs are safe.

INSERT INTO "Tenant" (id, name, slug, email, status, "isPlatform", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'pflegematch.at',
  'platform',
  'office@pflegematch.at',
  'ACTIVE',
  true,
  now(),
  now()
)
ON CONFLICT (slug) DO NOTHING;
