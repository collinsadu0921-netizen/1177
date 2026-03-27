# Demo Setup

## Quick start

### Option A — Local Supabase (recommended for development)

```bash
# Start local Supabase
supabase start

# Apply migrations + seed
supabase db reset        # runs all migrations then seed.sql automatically
```

### Option B — Hosted Supabase (staging/demo environment)

```bash
# Copy your environment variables
cp .env.local.example .env.local   # fill in URL and service role key

# Run the seed script
npm run seed
```

The seed script is idempotent — running it again resets demo data to its original state.

---

## Demo accounts

**Password for all accounts:** `Demo1234!`

| Role | Email | Name | Notes |
|------|-------|------|-------|
| Patient | `amara@demo.health` | Amara Osei | 3 encounters: 1 reviewed, 2 pending |
| Patient | `kwame@demo.health` | Kwame Mensah | 4 encounters: 1 closed, 1 reviewed, 2 pending. Has diabetes + hypertension. |
| Patient | `fatima@demo.health` | Fatima Ibrahim | 3 encounters: 1 reviewed, 2 pending |
| Clinician | `dr.amoah@demo.health` | Dr. Sarah Amoah | General Practice. Has reviewed 3 cases. |
| Clinician | `dr.boateng@demo.health` | Dr. Emmanuel Boateng | Emergency Medicine. Has reviewed 2 cases. |
| Admin | `admin@demo.health` | Demo Admin | Full admin access. |

---

## What's seeded

### 10 encounters across all statuses and triage levels

| # | Patient | Chief complaint | Triage | Status |
|---|---------|-----------------|--------|--------|
| 1 | Kwame | Chest pain and difficulty breathing | 🔴 Emergency | Closed |
| 2 | Amara | High fever with stiff neck | 🔴 Emergency | Reviewed |
| 3 | Fatima | Spreading rash with fever | 🟠 Urgent | Pending |
| 4 | Kwame | Severe headache + blurred vision | 🟠 Urgent | Pending |
| 5 | Amara | Persistent cough and chest tightness | 🟡 See a doctor | Reviewed |
| 6 | Fatima | Stomach cramps and vomiting | 🟡 See a doctor | Pending |
| 7 | Amara | Anxiety and sleep problems | 🟡 See a doctor | Pending |
| 8 | Kwame | Fatigue and unexplained weight loss | 🟢 Nurse follow-up | Closed |
| 9 | Fatima | Lower back pain after lifting | 🟢 Nurse follow-up | Reviewed |
| 10 | Kwame | Mild sore throat | 🔵 Self care | Pending |

### Clinician queue (pending review)

When signed in as a clinician, the queue shows 5 pending cases:
- 2 urgent (rash, headache)
- 2 semi-urgent (stomach, anxiety)
- 1 self-care (sore throat)

### Admin dashboard

- 3 patients, 2 clinicians
- 5 pending, 3 reviewed, 2 closed encounters

---

## Demo flow suggestions

### Clinician demo
1. Sign in as `dr.amoah@demo.health`
2. Queue shows 5 pending cases sorted by urgency
3. Open Fatima's spreading rash (urgent) — shows danger signs, symptoms, intake context
4. Write clinical notes and mark as reviewed
5. Browse reviewed/closed history

### Patient demo
1. Sign in as `kwame@demo.health`
2. History shows past encounters including the closed chest pain case
3. Start a new encounter using the intake flow
4. Receive a triage result

### Admin demo
1. Sign in as `admin@demo.health`
2. Dashboard shows aggregate stats
3. Browse encounters with filter tabs (all / active / closed)
4. View clinician roster
