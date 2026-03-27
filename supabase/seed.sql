-- ─────────────────────────────────────────────────────────────────────────────
-- eHealth MVP — Demo Seed Data
-- Run with: supabase db seed  (local dev)
-- Or:       psql $DATABASE_URL < supabase/seed.sql
--
-- Demo credentials (all accounts):
--   Password:  Demo1234!
--
--   Patients:
--     amara@demo.health   (Amara Osei, Accra)
--     kwame@demo.health   (Kwame Mensah, Kumasi — diabetes + hypertension)
--     fatima@demo.health  (Fatima Ibrahim, Tamale)
--
--   Clinicians:
--     dr.amoah@demo.health    (Dr. Sarah Amoah — General Practice)
--     dr.boateng@demo.health  (Dr. Emmanuel Boateng — Emergency Medicine)
--
--   Admin:
--     admin@demo.health
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- ─── Idempotent cleanup ───────────────────────────────────────────────────────
-- Remove by known UUIDs so re-running produces a clean, consistent state.
delete from public.clinician_notes
  where id::text like 'd000000%';

delete from public.encounters
  where id::text like 'c000000%';

delete from public.clinicians
  where id::text like 'b000000%';

delete from public.patients
  where id::text like 'a000000%';

delete from auth.users
  where id::text like '0000000%';

-- ─── Auth users ───────────────────────────────────────────────────────────────
-- Uses pgcrypto (enabled by default in Supabase) to hash the demo password.

insert into auth.users (
  id, instance_id, aud, role,
  email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  created_at, updated_at
) values
  -- Patient: Amara Osei
  (
    '00000001-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'amara@demo.health',
    crypt('Demo1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"role":"patient"}'::jsonb,
    '{"full_name":"Amara Osei"}'::jsonb,
    false, '', '', '', '',
    now() - interval '60 days', now()
  ),
  -- Patient: Kwame Mensah
  (
    '00000002-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'kwame@demo.health',
    crypt('Demo1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"role":"patient"}'::jsonb,
    '{"full_name":"Kwame Mensah"}'::jsonb,
    false, '', '', '', '',
    now() - interval '90 days', now()
  ),
  -- Patient: Fatima Ibrahim
  (
    '00000003-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'fatima@demo.health',
    crypt('Demo1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"role":"patient"}'::jsonb,
    '{"full_name":"Fatima Ibrahim"}'::jsonb,
    false, '', '', '', '',
    now() - interval '30 days', now()
  ),
  -- Clinician: Dr. Sarah Amoah
  (
    '00000004-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dr.amoah@demo.health',
    crypt('Demo1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"role":"clinician"}'::jsonb,
    '{"full_name":"Dr. Sarah Amoah"}'::jsonb,
    false, '', '', '', '',
    now() - interval '120 days', now()
  ),
  -- Clinician: Dr. Emmanuel Boateng
  (
    '00000005-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dr.boateng@demo.health',
    crypt('Demo1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"role":"clinician"}'::jsonb,
    '{"full_name":"Dr. Emmanuel Boateng"}'::jsonb,
    false, '', '', '', '',
    now() - interval '120 days', now()
  ),
  -- Admin
  (
    '00000006-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin@demo.health',
    crypt('Demo1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
    '{"full_name":"Demo Admin"}'::jsonb,
    false, '', '', '', '',
    now() - interval '120 days', now()
  );

-- ─── Patient profiles ─────────────────────────────────────────────────────────

insert into public.patients (
  id, user_id, full_name, date_of_birth, sex, phone, location, emergency_contact,
  created_at, updated_at
) values
  (
    'a0000001-0000-0000-0000-000000000000',
    '00000001-0000-0000-0000-000000000000',
    'Amara Osei',
    '1990-03-15',
    'female',
    '+233244100001',
    'East Legon, Accra',
    '{"name":"Kofi Osei","phone":"+233244100099","relationship":"Husband"}'::jsonb,
    now() - interval '60 days', now()
  ),
  (
    'a0000002-0000-0000-0000-000000000000',
    '00000002-0000-0000-0000-000000000000',
    'Kwame Mensah',
    '1972-07-22',
    'male',
    '+233244100002',
    'Ahodwo, Kumasi',
    '{"name":"Abena Mensah","phone":"+233244100098","relationship":"Wife"}'::jsonb,
    now() - interval '90 days', now()
  ),
  (
    'a0000003-0000-0000-0000-000000000000',
    '00000003-0000-0000-0000-000000000000',
    'Fatima Ibrahim',
    '1996-11-08',
    'female',
    '+233244100003',
    'Tamale Central, Tamale',
    '{"name":"Ibrahim Sumaila","phone":"+233244100097","relationship":"Father"}'::jsonb,
    now() - interval '30 days', now()
  );

-- ─── Clinician profiles ───────────────────────────────────────────────────────

insert into public.clinicians (id, user_id, full_name, specialty, created_at)
values
  (
    'b0000001-0000-0000-0000-000000000000',
    '00000004-0000-0000-0000-000000000000',
    'Dr. Sarah Amoah',
    'General Practice',
    now() - interval '120 days'
  ),
  (
    'b0000002-0000-0000-0000-000000000000',
    '00000005-0000-0000-0000-000000000000',
    'Dr. Emmanuel Boateng',
    'Emergency Medicine',
    now() - interval '120 days'
  );

-- ─── Encounters ───────────────────────────────────────────────────────────────
-- 10 encounters spanning all status states and triage levels.
--
-- Status breakdown:   pending_review ×5  |  reviewed ×3  |  closed ×2
-- Triage breakdown:   emergency ×2  |  urgent ×2  |  semi_urgent ×3  |  non_urgent ×2  |  self_care ×1

insert into public.encounters (
  id, patient_id, chief_complaint, symptoms, triage_outcome, intake_context,
  status, channel, clinician_id,
  clinician_notes, diagnosis, prescription, referral,
  closed_at, created_at, updated_at
) values

  -- ── E1: Kwame — Chest pain — EMERGENCY — CLOSED ───────────────────────────
  (
    'c0000001-0000-0000-0000-000000000000',
    'a0000002-0000-0000-0000-000000000000',
    'Chest pain and difficulty breathing',
    '[
      {"symptomId":"chest_pain","label":"Chest pain or tightness","severity":"severe","duration":"less_than_1_day"},
      {"symptomId":"shortness_of_breath","label":"Shortness of breath","severity":"severe","duration":"less_than_1_day"},
      {"symptomId":"palpitations","label":"Heart palpitations","severity":"moderate","duration":"less_than_1_day"}
    ]'::jsonb,
    '{
      "level":"emergency","label":"Emergency",
      "recommendation":"Seek emergency care immediately",
      "rationale":"Severe chest pain with difficulty breathing and palpitations — emergency danger signs triggered.",
      "seekCareWithin":"Immediately — do not wait",
      "nextAction":"emergency","nextActionLabel":"Seek emergency care now"
    }'::jsonb,
    '{
      "categoryId":"cough",
      "dangerSigns":["ds_cough_chest","ds_cough_sentence"],
      "takesMedication":true,
      "medication":"Metformin 500mg, Lisinopril 10mg",
      "conditions":["diabetes","hypertension"]
    }'::jsonb,
    'closed', 'mobile',
    'b0000002-0000-0000-0000-000000000000',
    'Patient presented with acute chest pain radiating to left arm, shortness of breath, and diaphoresis. ECG changes consistent with STEMI. Referred immediately to Korle Bu Teaching Hospital cardiology unit.',
    'Suspected acute coronary syndrome (STEMI)',
    null,
    'Emergency cardiology referral — patient transported to Korle Bu Teaching Hospital',
    now() - interval '6 days',
    now() - interval '7 days', now() - interval '6 days'
  ),

  -- ── E2: Amara — Fever + stiff neck — EMERGENCY — REVIEWED ─────────────────
  (
    'c0000002-0000-0000-0000-000000000000',
    'a0000001-0000-0000-0000-000000000000',
    'High fever with stiff neck and sensitivity to light',
    '[
      {"symptomId":"fever","label":"Fever or chills","severity":"severe","duration":"1_3_days"},
      {"symptomId":"headache","label":"Headache","severity":"severe","duration":"1_3_days"},
      {"symptomId":"neck_stiffness","label":"Stiff neck","severity":"severe","duration":"1_3_days"}
    ]'::jsonb,
    '{
      "level":"emergency","label":"Emergency",
      "recommendation":"Seek emergency care immediately",
      "rationale":"Multiple emergency danger signs: stiff neck with fever and confusion — possible bacterial meningitis.",
      "seekCareWithin":"Immediately — do not wait",
      "nextAction":"emergency","nextActionLabel":"Seek emergency care now"
    }'::jsonb,
    '{
      "categoryId":"fever",
      "dangerSigns":["ds_fever_neck","ds_fever_confused","ds_fever_high"],
      "takesMedication":false,
      "medication":null,
      "conditions":["none"]
    }'::jsonb,
    'reviewed', 'web',
    'b0000001-0000-0000-0000-000000000000',
    'Presentation consistent with bacterial meningitis. Temperature 39.8°C, photophobia, nuchal rigidity present. Patient alert but distressed. Immediate hospital referral made.',
    'Suspected bacterial meningitis',
    null,
    'Emergency hospital referral — do not delay. Patient directed to Ridge Hospital emergency department.',
    null,
    now() - interval '4 days', now() - interval '3 days'
  ),

  -- ── E3: Fatima — Spreading rash + fever — URGENT — PENDING ────────────────
  (
    'c0000003-0000-0000-0000-000000000000',
    'a0000003-0000-0000-0000-000000000000',
    'Rash spreading across my arms and back with fever',
    '[
      {"symptomId":"rash","label":"Rash or skin irritation","severity":"moderate","duration":"1_3_days"},
      {"symptomId":"fever","label":"Fever or chills","severity":"moderate","duration":"1_3_days"},
      {"symptomId":"itching","label":"Itching","severity":"mild","duration":"1_3_days"}
    ]'::jsonb,
    '{
      "level":"urgent","label":"Urgent",
      "recommendation":"Go to an urgent care clinic today",
      "rationale":"Rash spreading rapidly with fever — requires urgent clinical evaluation.",
      "seekCareWithin":"Within 2–4 hours",
      "nextAction":"clinic","nextActionLabel":"Find urgent care clinic"
    }'::jsonb,
    '{
      "categoryId":"skin",
      "dangerSigns":["ds_skin_spreading","ds_skin_fever"],
      "takesMedication":false,
      "medication":null,
      "conditions":["none"]
    }'::jsonb,
    'pending_review', 'web',
    null, null, null, null, null, null,
    now() - interval '36 hours', now() - interval '36 hours'
  ),

  -- ── E4: Kwame — Severe headache + vision — URGENT — PENDING ───────────────
  (
    'c0000004-0000-0000-0000-000000000000',
    'a0000002-0000-0000-0000-000000000000',
    'Severe headache for two days with dizziness and blurred vision',
    '[
      {"symptomId":"headache","label":"Headache","severity":"severe","duration":"1_3_days"},
      {"symptomId":"dizziness","label":"Dizziness or vertigo","severity":"moderate","duration":"1_3_days"},
      {"symptomId":"vision_changes","label":"Vision changes","severity":"mild","duration":"1_3_days"}
    ]'::jsonb,
    '{
      "level":"urgent","label":"Urgent",
      "recommendation":"Go to an urgent care clinic today",
      "rationale":"Severe headache with visual disturbance in a hypertensive patient — possible hypertensive emergency.",
      "seekCareWithin":"Within 2–4 hours",
      "nextAction":"clinic","nextActionLabel":"Find urgent care clinic"
    }'::jsonb,
    '{
      "categoryId":"headache",
      "dangerSigns":["ds_head_vomit"],
      "takesMedication":true,
      "medication":"Metformin 500mg, Lisinopril 10mg",
      "conditions":["diabetes","hypertension"]
    }'::jsonb,
    'pending_review', 'web',
    null, null, null, null, null, null,
    now() - interval '28 hours', now() - interval '28 hours'
  ),

  -- ── E5: Amara — Persistent cough — SEMI-URGENT — REVIEWED ─────────────────
  (
    'c0000005-0000-0000-0000-000000000000',
    'a0000001-0000-0000-0000-000000000000',
    'Persistent cough and chest tightness for nearly a week',
    '[
      {"symptomId":"cough","label":"Cough","severity":"moderate","duration":"4_7_days"},
      {"symptomId":"shortness_of_breath","label":"Shortness of breath","severity":"mild","duration":"4_7_days"},
      {"symptomId":"wheezing","label":"Wheezing","severity":"mild","duration":"4_7_days"}
    ]'::jsonb,
    '{
      "level":"semi_urgent","label":"See a doctor",
      "recommendation":"Book a doctor consultation",
      "rationale":"Persistent respiratory symptoms in a patient with known asthma history.",
      "seekCareWithin":"Within 24 hours",
      "nextAction":"doctor","nextActionLabel":"Book doctor consultation"
    }'::jsonb,
    '{
      "categoryId":"cough",
      "dangerSigns":[],
      "takesMedication":false,
      "medication":null,
      "conditions":["asthma"]
    }'::jsonb,
    'reviewed', 'web',
    'b0000001-0000-0000-0000-000000000000',
    'Likely asthma exacerbation triggered by harmattan dust. Wheeze on auscultation bilaterally. O2 sats 96%. Advised to resume salbutamol inhaler and limit outdoor exposure during dry season.',
    'Asthma exacerbation — mild to moderate',
    'Salbutamol inhaler 2 puffs PRN. Beclomethasone 200mcg BD for 7 days.',
    null,
    null,
    now() - interval '5 days', now() - interval '4 days'
  ),

  -- ── E6: Fatima — Stomach cramps — SEMI-URGENT — PENDING ───────────────────
  (
    'c0000006-0000-0000-0000-000000000000',
    'a0000003-0000-0000-0000-000000000000',
    'Stomach cramps and vomiting since last night',
    '[
      {"symptomId":"abdominal_pain","label":"Abdominal pain","severity":"moderate","duration":"less_than_1_day"},
      {"symptomId":"nausea","label":"Nausea","severity":"moderate","duration":"less_than_1_day"},
      {"symptomId":"vomiting","label":"Vomiting","severity":"moderate","duration":"less_than_1_day"}
    ]'::jsonb,
    '{
      "level":"semi_urgent","label":"See a doctor",
      "recommendation":"Book a doctor consultation",
      "rationale":"Moderate abdominal pain with repeated vomiting and inability to keep fluids down.",
      "seekCareWithin":"Within 24 hours",
      "nextAction":"doctor","nextActionLabel":"Book doctor consultation"
    }'::jsonb,
    '{
      "categoryId":"stomach",
      "dangerSigns":["ds_gut_fluids"],
      "takesMedication":false,
      "medication":null,
      "conditions":["none"]
    }'::jsonb,
    'pending_review', 'mobile',
    null, null, null, null, null, null,
    now() - interval '20 hours', now() - interval '20 hours'
  ),

  -- ── E7: Amara — Anxiety + sleep — SEMI-URGENT — PENDING ───────────────────
  (
    'c0000007-0000-0000-0000-000000000000',
    'a0000001-0000-0000-0000-000000000000',
    'Feeling anxious and unable to sleep for several days',
    '[
      {"symptomId":"anxiety","label":"Anxiety or panic","severity":"moderate","duration":"4_7_days"},
      {"symptomId":"sleep_problems","label":"Sleep difficulties","severity":"moderate","duration":"4_7_days"},
      {"symptomId":"low_mood","label":"Low mood or depression","severity":"mild","duration":"4_7_days"}
    ]'::jsonb,
    '{
      "level":"semi_urgent","label":"See a doctor",
      "recommendation":"Book a doctor consultation",
      "rationale":"Moderate anxiety and sleep disturbance persisting more than 4 days — warrants clinical assessment.",
      "seekCareWithin":"Within 24 hours",
      "nextAction":"doctor","nextActionLabel":"Book doctor consultation"
    }'::jsonb,
    '{
      "categoryId":"other",
      "dangerSigns":[],
      "takesMedication":false,
      "medication":null,
      "conditions":["none"]
    }'::jsonb,
    'pending_review', 'web',
    null, null, null, null, null, null,
    now() - interval '14 hours', now() - interval '14 hours'
  ),

  -- ── E8: Kwame — Fatigue + weight loss — NON-URGENT — CLOSED ──────────────
  (
    'c0000008-0000-0000-0000-000000000000',
    'a0000002-0000-0000-0000-000000000000',
    'Fatigue, poor appetite and unexplained weight loss over two weeks',
    '[
      {"symptomId":"fatigue","label":"Fatigue or low energy","severity":"moderate","duration":"more_than_1_week"},
      {"symptomId":"weight_loss","label":"Unexplained weight loss","severity":"mild","duration":"more_than_1_week"},
      {"symptomId":"loss_of_appetite","label":"Loss of appetite","severity":"moderate","duration":"more_than_1_week"},
      {"symptomId":"night_sweats","label":"Night sweats","severity":"mild","duration":"more_than_1_week"}
    ]'::jsonb,
    '{
      "level":"non_urgent","label":"Nurse follow-up",
      "recommendation":"Request a nurse follow-up",
      "rationale":"Chronic fatigue and weight loss in a patient with diabetes — warrants clinical review within 2–3 days.",
      "seekCareWithin":"Within 2–3 days",
      "nextAction":"nurse","nextActionLabel":"Request nurse follow-up"
    }'::jsonb,
    '{
      "categoryId":"other",
      "dangerSigns":[],
      "takesMedication":true,
      "medication":"Metformin 500mg once daily",
      "conditions":["diabetes"]
    }'::jsonb,
    'closed', 'web',
    'b0000001-0000-0000-0000-000000000000',
    'Patient with known T2DM presenting with 3 kg unintentional weight loss, polyuria, and fatigue. HbA1c 10.2% at last check 3 months ago. Dietary recall shows high carbohydrate intake. Medication adjusted and dietary counselling arranged.',
    'Uncontrolled type 2 diabetes mellitus with symptomatic hyperglycaemia',
    'Metformin 1000mg BD (dose increased). Continue monitoring fasting glucose.',
    'Nutritionist referral arranged. Diabetes nurse educator follow-up in 2 weeks.',
    now() - interval '9 days',
    now() - interval '10 days', now() - interval '9 days'
  ),

  -- ── E9: Fatima — Back pain — NON-URGENT — REVIEWED ────────────────────────
  (
    'c0000009-0000-0000-0000-000000000000',
    'a0000003-0000-0000-0000-000000000000',
    'Lower back pain after moving furniture at home',
    '[
      {"symptomId":"back_pain","label":"Back pain","severity":"mild","duration":"4_7_days"},
      {"symptomId":"joint_pain","label":"Joint pain or swelling","severity":"mild","duration":"4_7_days"}
    ]'::jsonb,
    '{
      "level":"non_urgent","label":"Nurse follow-up",
      "recommendation":"Request a nurse follow-up",
      "rationale":"Mild musculoskeletal pain after physical exertion — suitable for nurse follow-up.",
      "seekCareWithin":"Within 2–3 days",
      "nextAction":"nurse","nextActionLabel":"Request nurse follow-up"
    }'::jsonb,
    '{
      "categoryId":"injury",
      "dangerSigns":[],
      "takesMedication":false,
      "medication":null,
      "conditions":["none"]
    }'::jsonb,
    'reviewed', 'mobile',
    'b0000002-0000-0000-0000-000000000000',
    'Mechanical lower back strain following heavy lifting. No radiculopathy. Straight leg raise negative bilaterally. Advised rest, local heat application, and NSAIDs with food.',
    'Mechanical lower back pain — acute musculoskeletal strain',
    'Ibuprofen 400mg three times daily with food for 5 days. Rest for 2–3 days.',
    null,
    null,
    now() - interval '3 days', now() - interval '2 days'
  ),

  -- ── E10: Kwame — Sore throat — SELF-CARE — PENDING ────────────────────────
  (
    'c0000010-0000-0000-0000-000000000000',
    'a0000002-0000-0000-0000-000000000000',
    'Mild sore throat and blocked nose since this morning',
    '[
      {"symptomId":"sore_throat","label":"Sore throat","severity":"mild","duration":"less_than_1_day"},
      {"symptomId":"fatigue","label":"Fatigue or low energy","severity":"mild","duration":"less_than_1_day"}
    ]'::jsonb,
    '{
      "level":"self_care","label":"Self care",
      "recommendation":"You can manage this at home",
      "rationale":"Mild upper respiratory symptoms with no danger signs — manageable at home with rest and fluids.",
      "seekCareWithin":"Monitor — see a doctor if symptoms worsen or persist beyond 5 days",
      "nextAction":"pharmacy","nextActionLabel":"Visit a pharmacy"
    }'::jsonb,
    '{
      "categoryId":"fever",
      "dangerSigns":[],
      "takesMedication":true,
      "medication":"Metformin 500mg, Lisinopril 10mg",
      "conditions":["diabetes","hypertension"]
    }'::jsonb,
    'pending_review', 'web',
    null, null, null, null, null, null,
    now() - interval '8 hours', now() - interval '8 hours'
  );

-- ─── Clinician notes ─────────────────────────────────────────────────────────
-- One note per reviewed/closed encounter (the notes on encounters are kept
-- in sync for backwards-compatibility with the flat columns).

insert into public.clinician_notes (
  id, encounter_id, clinician_id, notes, diagnosis, prescription, referral,
  created_at, updated_at
) values
  -- E1: Kwame chest pain (closed — Dr. Boateng)
  (
    'd0000001-0000-0000-0000-000000000000',
    'c0000001-0000-0000-0000-000000000000',
    'b0000002-0000-0000-0000-000000000000',
    'Patient presented with acute chest pain radiating to left arm, shortness of breath, and diaphoresis. ECG changes consistent with STEMI. Referred immediately to Korle Bu Teaching Hospital cardiology unit.',
    'Suspected acute coronary syndrome (STEMI)',
    null,
    'Emergency cardiology referral — patient transported to Korle Bu Teaching Hospital',
    now() - interval '6 days', now() - interval '6 days'
  ),
  -- E2: Amara fever/neck (reviewed — Dr. Amoah)
  (
    'd0000002-0000-0000-0000-000000000000',
    'c0000002-0000-0000-0000-000000000000',
    'b0000001-0000-0000-0000-000000000000',
    'Presentation consistent with bacterial meningitis. Temperature 39.8°C, photophobia, nuchal rigidity present. Patient alert but distressed. Immediate hospital referral made.',
    'Suspected bacterial meningitis',
    null,
    'Emergency hospital referral — do not delay. Patient directed to Ridge Hospital emergency department.',
    now() - interval '3 days', now() - interval '3 days'
  ),
  -- E5: Amara cough (reviewed — Dr. Amoah)
  (
    'd0000003-0000-0000-0000-000000000000',
    'c0000005-0000-0000-0000-000000000000',
    'b0000001-0000-0000-0000-000000000000',
    'Likely asthma exacerbation triggered by harmattan dust. Wheeze on auscultation bilaterally. O2 sats 96%. Advised to resume salbutamol inhaler and limit outdoor exposure during dry season.',
    'Asthma exacerbation — mild to moderate',
    'Salbutamol inhaler 2 puffs PRN. Beclomethasone 200mcg BD for 7 days.',
    null,
    now() - interval '4 days', now() - interval '4 days'
  ),
  -- E8: Kwame fatigue (closed — Dr. Amoah)
  (
    'd0000004-0000-0000-0000-000000000000',
    'c0000008-0000-0000-0000-000000000000',
    'b0000001-0000-0000-0000-000000000000',
    'Patient with known T2DM presenting with 3 kg unintentional weight loss, polyuria, and fatigue. HbA1c 10.2% at last check 3 months ago. Dietary recall shows high carbohydrate intake. Medication adjusted and dietary counselling arranged.',
    'Uncontrolled type 2 diabetes mellitus with symptomatic hyperglycaemia',
    'Metformin 1000mg BD (dose increased). Continue monitoring fasting glucose.',
    'Nutritionist referral arranged. Diabetes nurse educator follow-up in 2 weeks.',
    now() - interval '9 days', now() - interval '9 days'
  ),
  -- E9: Fatima back pain (reviewed — Dr. Boateng)
  (
    'd0000005-0000-0000-0000-000000000000',
    'c0000009-0000-0000-0000-000000000000',
    'b0000002-0000-0000-0000-000000000000',
    'Mechanical lower back strain following heavy lifting. No radiculopathy. Straight leg raise negative bilaterally. Advised rest, local heat application, and NSAIDs with food.',
    'Mechanical lower back pain — acute musculoskeletal strain',
    'Ibuprofen 400mg three times daily with food for 5 days. Rest for 2–3 days.',
    null,
    now() - interval '2 days', now() - interval '2 days'
  );

commit;
