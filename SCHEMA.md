# eHealth MVP — Database Schema Reference

## Overview

The schema lives in `supabase/migrations/` and is applied in order. All tables
use Row Level Security (RLS). Application reads go through the Supabase anon/user
JWT; privileged writes (provisioning clinicians, admin mutations) use the service
role key server-side.

---

## Tables

### `public.patients`

Stores the patient profile linked to a Supabase auth user.

| Column           | Type        | Notes                                              |
|------------------|-------------|----------------------------------------------------|
| `id`             | uuid PK     | `gen_random_uuid()`                                |
| `user_id`        | uuid FK      | → `auth.users(id)` ON DELETE CASCADE, UNIQUE       |
| `full_name`      | text        |                                                    |
| `date_of_birth`  | date        |                                                    |
| `sex`            | text        | `male \| female \| other \| prefer_not_to_say`     |
| `phone`          | text        | Default `''`                                       |
| `location`       | text        | Nullable. Free-text location.                      |
| `emergency_contact` | jsonb    | Nullable. `{ name, phone, relationship }`          |
| `created_at`     | timestamptz |                                                    |
| `updated_at`     | timestamptz | Auto-updated via trigger                           |

**Indexes:** `patients_full_name_idx` (full_name)

**RLS policies:**
- `patients_own` — patient can read/write their own row (`auth.uid() = user_id`)
- `patients_admin_read` — admin role can SELECT all rows

---

### `public.clinicians`

Stores the clinician profile linked to a Supabase auth user.

| Column       | Type        | Notes                                    |
|--------------|-------------|------------------------------------------|
| `id`         | uuid PK     |                                          |
| `user_id`    | uuid FK     | → `auth.users(id)` ON DELETE CASCADE, UNIQUE |
| `full_name`  | text        |                                          |
| `specialty`  | text        | Nullable                                 |
| `created_at` | timestamptz |                                          |

**Indexes:** `clinicians_full_name_idx` (full_name)

**RLS policies:**
- `clinicians_own` — clinician can read/write their own row
- `clinicians_admin_read` — admin role can SELECT all rows

---

### `public.encounters`

Central table representing a patient consultation episode.

| Column            | Type        | Notes                                                   |
|-------------------|-------------|---------------------------------------------------------|
| `id`              | uuid PK     |                                                         |
| `patient_id`      | uuid FK     | → `public.patients(id)` ON DELETE CASCADE               |
| `chief_complaint` | text        |                                                         |
| `symptoms`        | jsonb       | Array of `SymptomEntry` objects (see JSONB section)     |
| `triage_outcome`  | jsonb       | `TriageOutcome` object or null (see JSONB section)      |
| `intake_context`  | jsonb       | `IntakeContext` object or null (see JSONB section)      |
| `status`          | text        | `in_progress \| pending_review \| reviewed \| closed`   |
| `channel`         | text        | `web \| mobile \| in_person \| phone`. Default `'web'`  |
| `clinician_id`    | uuid FK     | → `public.clinicians(id)`. Nullable                     |
| `clinician_notes` | text        | Flat notes field (legacy; see `clinician_notes` table)  |
| `diagnosis`       | text        | Nullable                                                |
| `prescription`    | text        | Nullable                                                |
| `referral`        | text        | Nullable                                                |
| `closed_at`       | timestamptz | Set when status transitions to `closed`                 |
| `created_at`      | timestamptz |                                                         |
| `updated_at`      | timestamptz | Auto-updated via trigger                                |

**Indexes:**
- `encounters_patient_id_idx` (patient_id)
- `encounters_status_idx` (status)
- `encounters_created_at_idx` (created_at DESC)
- `encounters_clinician_id_idx` (clinician_id) WHERE clinician_id IS NOT NULL
- `encounters_triage_level_idx` ((triage_outcome ->> 'level')) WHERE triage_outcome IS NOT NULL

**RLS policies:**
- `encounters_patient_read` — patient can SELECT their own encounters
- `encounters_patient_insert` — patient can INSERT for their own patient_id
- `encounters_clinician_all` — clinicians can SELECT/UPDATE/etc all encounters
- `encounters_admin_read` — admin role can SELECT all rows

**Status flow:**
```
in_progress → pending_review → reviewed → closed
```

---

### `public.clinician_notes`

Normalized documentation history for a clinician's notes on an encounter.
Allows multiple saves/edits to be preserved as an audit trail.

| Column         | Type        | Notes                                              |
|----------------|-------------|----------------------------------------------------|
| `id`           | uuid PK     |                                                    |
| `encounter_id` | uuid FK     | → `public.encounters(id)` ON DELETE CASCADE        |
| `clinician_id` | uuid FK     | → `public.clinicians(id)` ON DELETE SET NULL       |
| `notes`        | text        | Nullable. Free-text clinical notes                 |
| `diagnosis`    | text        | Nullable                                           |
| `prescription` | text        | Nullable                                           |
| `referral`     | text        | Nullable                                           |
| `created_at`   | timestamptz |                                                    |
| `updated_at`   | timestamptz | Auto-updated via trigger                           |

**Indexes:**
- `clinician_notes_encounter_id_idx` (encounter_id)
- `clinician_notes_clinician_id_idx` (clinician_id) WHERE clinician_id IS NOT NULL

**RLS policies:**
- `clinician_notes_patient_read` — patient can SELECT notes for their own encounters
- `clinician_notes_clinician_read` — clinicians can SELECT all notes
- `clinician_notes_clinician_insert` — clinicians can INSERT
- `clinician_notes_clinician_update` — clinicians can UPDATE their own notes
- `clinician_notes_admin_read` — admin role can SELECT all rows

---

## JSONB Column Designs

### `encounters.symptoms` — `SymptomEntry[]`

```json
[
  {
    "symptomId": "headache",
    "label": "Headache",
    "severity": "moderate",
    "duration": "1_3_days",
    "notes": "Throbbing, worse in the morning"
  }
]
```

Severity: `mild | moderate | severe`
Duration: `less_than_1_day | 1_3_days | 4_7_days | more_than_1_week`

Rationale: symptom sets are small (typically 1–5 items), append-only per encounter,
and never queried relationally. JSONB avoids a join for every encounter fetch.

---

### `encounters.triage_outcome` — `TriageOutcome`

```json
{
  "level": "urgent",
  "label": "Urgent",
  "recommendation": "Visit an urgent care clinic today",
  "rationale": "Two or more moderate symptoms with a duration over 3 days.",
  "seekCareWithin": "Within 2–4 hours",
  "nextAction": "clinic",
  "nextActionLabel": "Find a clinic"
}
```

Level: `emergency | urgent | semi_urgent | non_urgent | self_care`

Rationale: triage is computed once per encounter and read back as a whole unit.
No cross-encounter queries on individual triage fields (except level, which has
a functional index on `triage_outcome ->> 'level'`).

---

### `encounters.intake_context` — `IntakeContext`

```json
{
  "categoryId": "fever",
  "dangerSigns": ["high_fever", "difficulty_breathing"],
  "takesMedication": true,
  "medication": "Metformin 500mg",
  "conditions": ["diabetes", "hypertension"]
}
```

Rationale: intake context is display-only data used to show the clinician
what the patient reported during guided intake. It is never queried relationally.

---

### `patients.emergency_contact` — `EmergencyContact`

```json
{
  "name": "Jane Doe",
  "phone": "+254700000000",
  "relationship": "Spouse"
}
```

---

## Relationships

```
auth.users
  ├── patients (user_id)           1:1
  └── clinicians (user_id)         1:1

patients
  └── encounters (patient_id)      1:N

clinicians
  ├── encounters (clinician_id)    1:N  (assigned clinician)
  └── clinician_notes (clinician_id) 1:N

encounters
  └── clinician_notes (encounter_id) 1:N
```

---

## Migrations

| File                                  | Description                                      |
|---------------------------------------|--------------------------------------------------|
| `0001_initial_schema.sql`             | Core tables, RLS, patient/clinician/encounter indexes, updated_at trigger |
| `0002_patients_extra_fields.sql`      | `location`, `emergency_contact` columns on patients |
| `0003_encounters_intake_context.sql`  | `intake_context` JSONB column on encounters      |
| `0004_encounter_clinical_fields.sql`  | `diagnosis`, `prescription`, `referral` columns  |
| `0005_indexes_channel_rls.sql`        | `channel` column, performance indexes, admin RLS policies |
| `0006_clinician_notes_table.sql`      | Normalized `clinician_notes` table               |

---

## TypeScript Types

All domain types are in `lib/types/index.ts`. Key mappings:

| DB column (snake_case)       | TS field (camelCase)         |
|------------------------------|------------------------------|
| `patient_id`                 | `patientId`                  |
| `chief_complaint`            | `chiefComplaint`             |
| `triage_outcome`             | `triageOutcome`              |
| `intake_context`             | `intakeContext`              |
| `clinician_id`               | `clinicianId`                |
| `clinician_notes`            | `clinicianNotes`             |
| `closed_at`                  | `closedAt`                   |
| `created_at`                 | `createdAt`                  |
| `updated_at`                 | `updatedAt`                  |
| `encounter_id`               | `encounterId`                |

JSONB columns are parsed from the DB response and typed as their respective
interfaces (`SymptomEntry[]`, `TriageOutcome`, `IntakeContext`, `EmergencyContact`).
