-- ─────────────────────────────────────────────
-- eHealth MVP — Initial Database Schema
-- ─────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Patients ─────────────────────────────────
create table if not exists public.patients (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  full_name     text not null,
  date_of_birth date not null,
  sex           text not null check (sex in ('male', 'female', 'other', 'prefer_not_to_say')),
  phone         text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id)
);

-- ─── Clinicians ───────────────────────────────
create table if not exists public.clinicians (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  full_name     text not null,
  specialty     text,
  created_at    timestamptz not null default now(),
  unique (user_id)
);

-- ─── Encounters ───────────────────────────────
create table if not exists public.encounters (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid not null references public.patients(id) on delete cascade,
  chief_complaint  text not null,
  -- symptoms stored as JSONB array of SymptomEntry objects
  symptoms         jsonb not null default '[]',
  -- triage_outcome stored as JSONB TriageOutcome object
  triage_outcome   jsonb,
  status           text not null default 'pending_review'
                     check (status in ('in_progress', 'pending_review', 'reviewed', 'closed')),
  clinician_id     uuid references public.clinicians(id),
  clinician_notes  text,
  closed_at        timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── Row Level Security ───────────────────────

alter table public.patients enable row level security;
alter table public.clinicians enable row level security;
alter table public.encounters enable row level security;

-- Patients: only the owning user can read/write their own record
create policy "patients_own" on public.patients
  for all using (auth.uid() = user_id);

-- Clinicians: clinicians can read their own record
create policy "clinicians_own" on public.clinicians
  for all using (auth.uid() = user_id);

-- Encounters: patient can read/create their own; clinicians can read all
create policy "encounters_patient_read" on public.encounters
  for select using (
    patient_id in (
      select id from public.patients where user_id = auth.uid()
    )
  );

create policy "encounters_patient_insert" on public.encounters
  for insert with check (
    patient_id in (
      select id from public.patients where user_id = auth.uid()
    )
  );

-- Clinicians can read all encounters (via service role or clinician role claim)
create policy "encounters_clinician_all" on public.encounters
  for all using (
    exists (
      select 1 from public.clinicians where user_id = auth.uid()
    )
  );

-- ─── Indexes ──────────────────────────────────
create index if not exists encounters_patient_id_idx on public.encounters(patient_id);
create index if not exists encounters_status_idx on public.encounters(status);
create index if not exists encounters_created_at_idx on public.encounters(created_at desc);

-- ─── Updated-at trigger ───────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger patients_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

create trigger encounters_updated_at
  before update on public.encounters
  for each row execute function public.set_updated_at();
