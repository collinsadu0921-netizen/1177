-- ─────────────────────────────────────────────────────────────────────────────
-- 0006 — Clinician notes table (normalized documentation history)
-- ─────────────────────────────────────────────────────────────────────────────
-- Replaces the flat columns on encounters (clinician_notes, diagnosis,
-- prescription, referral) with a proper history table so multiple edits
-- are preserved and the latest note can be queried efficiently.
-- The flat columns on encounters are kept for backwards-compatibility during
-- the migration window and may be dropped in a future migration.

create table if not exists public.clinician_notes (
  id             uuid primary key default gen_random_uuid(),
  encounter_id   uuid not null references public.encounters(id) on delete cascade,
  clinician_id   uuid references public.clinicians(id) on delete set null,
  notes          text,
  diagnosis      text,
  prescription   text,
  referral       text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Primary access pattern: all notes for a given encounter
create index if not exists clinician_notes_encounter_id_idx
  on public.clinician_notes(encounter_id);

-- Lookup notes written by a specific clinician
create index if not exists clinician_notes_clinician_id_idx
  on public.clinician_notes(clinician_id)
  where clinician_id is not null;

-- ── Updated-at trigger ────────────────────────────────────────────────────────

create trigger clinician_notes_updated_at
  before update on public.clinician_notes
  for each row execute function public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.clinician_notes enable row level security;

-- Patients can read notes for their own encounters
create policy "clinician_notes_patient_read" on public.clinician_notes
  for select using (
    encounter_id in (
      select e.id from public.encounters e
      join public.patients p on p.id = e.patient_id
      where p.user_id = auth.uid()
    )
  );

-- Clinicians can read all notes
create policy "clinician_notes_clinician_read" on public.clinician_notes
  for select using (
    exists (
      select 1 from public.clinicians where user_id = auth.uid()
    )
  );

-- Clinicians can insert notes
create policy "clinician_notes_clinician_insert" on public.clinician_notes
  for insert with check (
    exists (
      select 1 from public.clinicians where user_id = auth.uid()
    )
  );

-- Clinicians can update their own notes
create policy "clinician_notes_clinician_update" on public.clinician_notes
  for update using (
    clinician_id in (
      select id from public.clinicians where user_id = auth.uid()
    )
  );

-- Admins can read all notes
create policy "clinician_notes_admin_read" on public.clinician_notes
  for select using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
