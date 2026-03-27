-- ─────────────────────────────────────────────
-- eHealth MVP — Patient profile extended fields
-- ─────────────────────────────────────────────

-- Add location (free-text city / region)
alter table public.patients
  add column if not exists location text;

-- Add emergency contact as structured JSONB
-- Shape: { name: text, phone: text, relationship: text }
alter table public.patients
  add column if not exists emergency_contact jsonb;
