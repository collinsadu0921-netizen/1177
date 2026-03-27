-- ─────────────────────────────────────────────────────────────────────────────
-- 0005 — Additional indexes, encounter channel field, admin RLS policies
-- ─────────────────────────────────────────────────────────────────────────────

-- ── encounter.channel ─────────────────────────────────────────────────────────
-- Tracks how the encounter was initiated. Defaults to 'web' for all existing rows.
alter table public.encounters
  add column if not exists channel text not null default 'web'
    check (channel in ('web', 'mobile', 'in_person', 'phone'));

-- ── Performance indexes ───────────────────────────────────────────────────────

-- Fast lookup of encounters by assigned clinician
create index if not exists encounters_clinician_id_idx
  on public.encounters(clinician_id)
  where clinician_id is not null;

-- Fast lookup of encounters by triage level (queries the JSONB level key)
create index if not exists encounters_triage_level_idx
  on public.encounters((triage_outcome ->> 'level'))
  where triage_outcome is not null;

-- patients: covering index for full-name search / listing
create index if not exists patients_full_name_idx
  on public.patients(full_name);

-- clinicians: covering index for full-name listing
create index if not exists clinicians_full_name_idx
  on public.clinicians(full_name);

-- ── Admin RLS policies ────────────────────────────────────────────────────────
-- Admins (role = 'admin' in app_metadata) can read all tables.
-- Write operations for admins are handled via service role in the application layer.

create policy "patients_admin_read" on public.patients
  for select using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "clinicians_admin_read" on public.clinicians
  for select using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "encounters_admin_read" on public.encounters
  for select using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
