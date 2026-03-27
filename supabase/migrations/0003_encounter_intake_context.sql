-- eHealth MVP — Encounter intake context
-- Stores structured answers from the guided symptom intake beyond the
-- core symptoms array: selected danger signs, medication, and conditions.

alter table public.encounters
  add column if not exists intake_context jsonb;
