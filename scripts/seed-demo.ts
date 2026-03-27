/**
 * eHealth MVP — Demo Seed Script
 *
 * Populates a Supabase project (local or hosted) with realistic demo data
 * using the Supabase Admin Auth API. Use this script for hosted environments
 * where direct SQL access to auth.users is not available.
 *
 * Usage:
 *   npx tsx scripts/seed-demo.ts
 *
 * Required environment variables (copy from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← must be the service role key, not anon key
 *
 * Demo credentials (all accounts use the same password):
 *   Password:  Demo1234!
 *
 *   amara@demo.health     — Patient (Accra)
 *   kwame@demo.health     — Patient (Kumasi, diabetes + hypertension)
 *   fatima@demo.health    — Patient (Tamale)
 *   dr.amoah@demo.health  — Clinician, General Practice
 *   dr.boateng@demo.health— Clinician, Emergency Medicine
 *   admin@demo.health     — Admin
 */

import { createClient } from "@supabase/supabase-js";

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing environment variables.\n" +
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "Demo1234!";

// Fixed UUIDs keep the seed idempotent across runs.
const IDS = {
  // Auth users
  authAmara:   "00000001-0000-0000-0000-000000000000",
  authKwame:   "00000002-0000-0000-0000-000000000000",
  authFatima:  "00000003-0000-0000-0000-000000000000",
  authAmoah:   "00000004-0000-0000-0000-000000000000",
  authBoateng: "00000005-0000-0000-0000-000000000000",
  authAdmin:   "00000006-0000-0000-0000-000000000000",
  // Patient profiles
  patAmara:   "a0000001-0000-0000-0000-000000000000",
  patKwame:   "a0000002-0000-0000-0000-000000000000",
  patFatima:  "a0000003-0000-0000-0000-000000000000",
  // Clinician profiles
  clinAmoah:   "b0000001-0000-0000-0000-000000000000",
  clinBoateng: "b0000002-0000-0000-0000-000000000000",
  // Encounters
  encE1: "c0000001-0000-0000-0000-000000000000",
  encE2: "c0000002-0000-0000-0000-000000000000",
  encE3: "c0000003-0000-0000-0000-000000000000",
  encE4: "c0000004-0000-0000-0000-000000000000",
  encE5: "c0000005-0000-0000-0000-000000000000",
  encE6: "c0000006-0000-0000-0000-000000000000",
  encE7: "c0000007-0000-0000-0000-000000000000",
  encE8: "c0000008-0000-0000-0000-000000000000",
  encE9: "c0000009-0000-0000-0000-000000000000",
  encE10: "c0000010-0000-0000-0000-000000000000",
  // Clinician notes
  noteN1: "d0000001-0000-0000-0000-000000000000",
  noteN2: "d0000002-0000-0000-0000-000000000000",
  noteN3: "d0000003-0000-0000-0000-000000000000",
  noteN4: "d0000004-0000-0000-0000-000000000000",
  noteN5: "d0000005-0000-0000-0000-000000000000",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

async function upsertAuthUser(opts: {
  id: string;
  email: string;
  role: "patient" | "clinician" | "admin";
  fullName: string;
  createdDaysAgo: number;
}) {
  // Delete first (admin API doesn't support update-by-id cleanly with password)
  await supabase.auth.admin.deleteUser(opts.id).catch(() => {});

  const { data, error } = await supabase.auth.admin.createUser({
    user_id: opts.id,
    email: opts.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    app_metadata: { role: opts.role },
    user_metadata: { full_name: opts.fullName },
  });

  if (error) throw new Error(`createUser ${opts.email}: ${error.message}`);
  return data.user;
}

function ok(label: string) {
  process.stdout.write(`  ✓ ${label}\n`);
}

// ─── Steps ────────────────────────────────────────────────────────────────────

async function seedAuthUsers() {
  console.log("\n── Auth users");
  await upsertAuthUser({ id: IDS.authAmara,   email: "amara@demo.health",      role: "patient",   fullName: "Amara Osei",            createdDaysAgo: 60  }); ok("amara@demo.health");
  await upsertAuthUser({ id: IDS.authKwame,   email: "kwame@demo.health",      role: "patient",   fullName: "Kwame Mensah",           createdDaysAgo: 90  }); ok("kwame@demo.health");
  await upsertAuthUser({ id: IDS.authFatima,  email: "fatima@demo.health",     role: "patient",   fullName: "Fatima Ibrahim",         createdDaysAgo: 30  }); ok("fatima@demo.health");
  await upsertAuthUser({ id: IDS.authAmoah,   email: "dr.amoah@demo.health",   role: "clinician", fullName: "Dr. Sarah Amoah",        createdDaysAgo: 120 }); ok("dr.amoah@demo.health");
  await upsertAuthUser({ id: IDS.authBoateng, email: "dr.boateng@demo.health", role: "clinician", fullName: "Dr. Emmanuel Boateng",   createdDaysAgo: 120 }); ok("dr.boateng@demo.health");
  await upsertAuthUser({ id: IDS.authAdmin,   email: "admin@demo.health",      role: "admin",     fullName: "Demo Admin",             createdDaysAgo: 120 }); ok("admin@demo.health");
}

async function seedPatients() {
  console.log("\n── Patient profiles");

  await supabase.from("patients").upsert([
    {
      id: IDS.patAmara,
      user_id: IDS.authAmara,
      full_name: "Amara Osei",
      date_of_birth: "1990-03-15",
      sex: "female",
      phone: "+233244100001",
      location: "East Legon, Accra",
      emergency_contact: { name: "Kofi Osei", phone: "+233244100099", relationship: "Husband" },
      created_at: daysAgo(60),
    },
    {
      id: IDS.patKwame,
      user_id: IDS.authKwame,
      full_name: "Kwame Mensah",
      date_of_birth: "1972-07-22",
      sex: "male",
      phone: "+233244100002",
      location: "Ahodwo, Kumasi",
      emergency_contact: { name: "Abena Mensah", phone: "+233244100098", relationship: "Wife" },
      created_at: daysAgo(90),
    },
    {
      id: IDS.patFatima,
      user_id: IDS.authFatima,
      full_name: "Fatima Ibrahim",
      date_of_birth: "1996-11-08",
      sex: "female",
      phone: "+233244100003",
      location: "Tamale Central, Tamale",
      emergency_contact: { name: "Ibrahim Sumaila", phone: "+233244100097", relationship: "Father" },
      created_at: daysAgo(30),
    },
  ], { onConflict: "id" });

  ok("3 patients");
}

async function seedClinicians() {
  console.log("\n── Clinician profiles");

  await supabase.from("clinicians").upsert([
    {
      id: IDS.clinAmoah,
      user_id: IDS.authAmoah,
      full_name: "Dr. Sarah Amoah",
      specialty: "General Practice",
      created_at: daysAgo(120),
    },
    {
      id: IDS.clinBoateng,
      user_id: IDS.authBoateng,
      full_name: "Dr. Emmanuel Boateng",
      specialty: "Emergency Medicine",
      created_at: daysAgo(120),
    },
  ], { onConflict: "id" });

  ok("2 clinicians");
}

async function seedEncounters() {
  console.log("\n── Encounters");

  const encounters = [
    // ── E1: Kwame — Chest pain — EMERGENCY — CLOSED ──────────────────────────
    {
      id: IDS.encE1,
      patient_id: IDS.patKwame,
      chief_complaint: "Chest pain and difficulty breathing",
      symptoms: [
        { symptomId: "chest_pain", label: "Chest pain or tightness", severity: "severe", duration: "less_than_1_day" },
        { symptomId: "shortness_of_breath", label: "Shortness of breath", severity: "severe", duration: "less_than_1_day" },
        { symptomId: "palpitations", label: "Heart palpitations", severity: "moderate", duration: "less_than_1_day" },
      ],
      triage_outcome: {
        level: "emergency", label: "Emergency",
        recommendation: "Seek emergency care immediately",
        rationale: "Severe chest pain with difficulty breathing and palpitations — emergency danger signs triggered.",
        seekCareWithin: "Immediately — do not wait",
        nextAction: "emergency", nextActionLabel: "Seek emergency care now",
      },
      intake_context: {
        categoryId: "cough",
        dangerSigns: ["ds_cough_chest", "ds_cough_sentence"],
        takesMedication: true,
        medication: "Metformin 500mg, Lisinopril 10mg",
        conditions: ["diabetes", "hypertension"],
      },
      status: "closed", channel: "mobile",
      clinician_id: IDS.clinBoateng,
      clinician_notes: "Patient presented with acute chest pain radiating to left arm, shortness of breath, and diaphoresis. ECG changes consistent with STEMI. Referred immediately to Korle Bu Teaching Hospital cardiology unit.",
      diagnosis: "Suspected acute coronary syndrome (STEMI)",
      prescription: null,
      referral: "Emergency cardiology referral — patient transported to Korle Bu Teaching Hospital",
      closed_at: daysAgo(6),
      created_at: daysAgo(7),
    },
    // ── E2: Amara — Fever + stiff neck — EMERGENCY — REVIEWED ────────────────
    {
      id: IDS.encE2,
      patient_id: IDS.patAmara,
      chief_complaint: "High fever with stiff neck and sensitivity to light",
      symptoms: [
        { symptomId: "fever", label: "Fever or chills", severity: "severe", duration: "1_3_days" },
        { symptomId: "headache", label: "Headache", severity: "severe", duration: "1_3_days" },
        { symptomId: "neck_stiffness", label: "Stiff neck", severity: "severe", duration: "1_3_days" },
      ],
      triage_outcome: {
        level: "emergency", label: "Emergency",
        recommendation: "Seek emergency care immediately",
        rationale: "Multiple emergency danger signs: stiff neck with fever and confusion — possible bacterial meningitis.",
        seekCareWithin: "Immediately — do not wait",
        nextAction: "emergency", nextActionLabel: "Seek emergency care now",
      },
      intake_context: {
        categoryId: "fever",
        dangerSigns: ["ds_fever_neck", "ds_fever_confused", "ds_fever_high"],
        takesMedication: false, medication: null, conditions: ["none"],
      },
      status: "reviewed", channel: "web",
      clinician_id: IDS.clinAmoah,
      clinician_notes: "Presentation consistent with bacterial meningitis. Temperature 39.8°C, photophobia, nuchal rigidity present. Patient alert but distressed. Immediate hospital referral made.",
      diagnosis: "Suspected bacterial meningitis",
      prescription: null,
      referral: "Emergency hospital referral — do not delay. Patient directed to Ridge Hospital emergency department.",
      closed_at: null,
      created_at: daysAgo(4),
    },
    // ── E3: Fatima — Spreading rash — URGENT — PENDING ───────────────────────
    {
      id: IDS.encE3,
      patient_id: IDS.patFatima,
      chief_complaint: "Rash spreading across my arms and back with fever",
      symptoms: [
        { symptomId: "rash", label: "Rash or skin irritation", severity: "moderate", duration: "1_3_days" },
        { symptomId: "fever", label: "Fever or chills", severity: "moderate", duration: "1_3_days" },
        { symptomId: "itching", label: "Itching", severity: "mild", duration: "1_3_days" },
      ],
      triage_outcome: {
        level: "urgent", label: "Urgent",
        recommendation: "Go to an urgent care clinic today",
        rationale: "Rash spreading rapidly with fever — requires urgent clinical evaluation.",
        seekCareWithin: "Within 2–4 hours",
        nextAction: "clinic", nextActionLabel: "Find urgent care clinic",
      },
      intake_context: {
        categoryId: "skin",
        dangerSigns: ["ds_skin_spreading", "ds_skin_fever"],
        takesMedication: false, medication: null, conditions: ["none"],
      },
      status: "pending_review", channel: "web",
      clinician_id: null, clinician_notes: null, diagnosis: null, prescription: null, referral: null, closed_at: null,
      created_at: hoursAgo(36),
    },
    // ── E4: Kwame — Severe headache — URGENT — PENDING ───────────────────────
    {
      id: IDS.encE4,
      patient_id: IDS.patKwame,
      chief_complaint: "Severe headache for two days with dizziness and blurred vision",
      symptoms: [
        { symptomId: "headache", label: "Headache", severity: "severe", duration: "1_3_days" },
        { symptomId: "dizziness", label: "Dizziness or vertigo", severity: "moderate", duration: "1_3_days" },
        { symptomId: "vision_changes", label: "Vision changes", severity: "mild", duration: "1_3_days" },
      ],
      triage_outcome: {
        level: "urgent", label: "Urgent",
        recommendation: "Go to an urgent care clinic today",
        rationale: "Severe headache with visual disturbance in a hypertensive patient — possible hypertensive emergency.",
        seekCareWithin: "Within 2–4 hours",
        nextAction: "clinic", nextActionLabel: "Find urgent care clinic",
      },
      intake_context: {
        categoryId: "headache",
        dangerSigns: ["ds_head_vomit"],
        takesMedication: true,
        medication: "Metformin 500mg, Lisinopril 10mg",
        conditions: ["diabetes", "hypertension"],
      },
      status: "pending_review", channel: "web",
      clinician_id: null, clinician_notes: null, diagnosis: null, prescription: null, referral: null, closed_at: null,
      created_at: hoursAgo(28),
    },
    // ── E5: Amara — Persistent cough — SEMI-URGENT — REVIEWED ────────────────
    {
      id: IDS.encE5,
      patient_id: IDS.patAmara,
      chief_complaint: "Persistent cough and chest tightness for nearly a week",
      symptoms: [
        { symptomId: "cough", label: "Cough", severity: "moderate", duration: "4_7_days" },
        { symptomId: "shortness_of_breath", label: "Shortness of breath", severity: "mild", duration: "4_7_days" },
        { symptomId: "wheezing", label: "Wheezing", severity: "mild", duration: "4_7_days" },
      ],
      triage_outcome: {
        level: "semi_urgent", label: "See a doctor",
        recommendation: "Book a doctor consultation",
        rationale: "Persistent respiratory symptoms in a patient with known asthma history.",
        seekCareWithin: "Within 24 hours",
        nextAction: "doctor", nextActionLabel: "Book doctor consultation",
      },
      intake_context: {
        categoryId: "cough",
        dangerSigns: [],
        takesMedication: false, medication: null, conditions: ["asthma"],
      },
      status: "reviewed", channel: "web",
      clinician_id: IDS.clinAmoah,
      clinician_notes: "Likely asthma exacerbation triggered by harmattan dust. Wheeze on auscultation bilaterally. O2 sats 96%. Advised to resume salbutamol inhaler and limit outdoor exposure during dry season.",
      diagnosis: "Asthma exacerbation — mild to moderate",
      prescription: "Salbutamol inhaler 2 puffs PRN. Beclomethasone 200mcg BD for 7 days.",
      referral: null, closed_at: null,
      created_at: daysAgo(5),
    },
    // ── E6: Fatima — Stomach cramps — SEMI-URGENT — PENDING ──────────────────
    {
      id: IDS.encE6,
      patient_id: IDS.patFatima,
      chief_complaint: "Stomach cramps and vomiting since last night",
      symptoms: [
        { symptomId: "abdominal_pain", label: "Abdominal pain", severity: "moderate", duration: "less_than_1_day" },
        { symptomId: "nausea", label: "Nausea", severity: "moderate", duration: "less_than_1_day" },
        { symptomId: "vomiting", label: "Vomiting", severity: "moderate", duration: "less_than_1_day" },
      ],
      triage_outcome: {
        level: "semi_urgent", label: "See a doctor",
        recommendation: "Book a doctor consultation",
        rationale: "Moderate abdominal pain with repeated vomiting and inability to keep fluids down.",
        seekCareWithin: "Within 24 hours",
        nextAction: "doctor", nextActionLabel: "Book doctor consultation",
      },
      intake_context: {
        categoryId: "stomach",
        dangerSigns: ["ds_gut_fluids"],
        takesMedication: false, medication: null, conditions: ["none"],
      },
      status: "pending_review", channel: "mobile",
      clinician_id: null, clinician_notes: null, diagnosis: null, prescription: null, referral: null, closed_at: null,
      created_at: hoursAgo(20),
    },
    // ── E7: Amara — Anxiety + sleep — SEMI-URGENT — PENDING ──────────────────
    {
      id: IDS.encE7,
      patient_id: IDS.patAmara,
      chief_complaint: "Feeling anxious and unable to sleep for several days",
      symptoms: [
        { symptomId: "anxiety", label: "Anxiety or panic", severity: "moderate", duration: "4_7_days" },
        { symptomId: "sleep_problems", label: "Sleep difficulties", severity: "moderate", duration: "4_7_days" },
        { symptomId: "low_mood", label: "Low mood or depression", severity: "mild", duration: "4_7_days" },
      ],
      triage_outcome: {
        level: "semi_urgent", label: "See a doctor",
        recommendation: "Book a doctor consultation",
        rationale: "Moderate anxiety and sleep disturbance persisting more than 4 days — warrants clinical assessment.",
        seekCareWithin: "Within 24 hours",
        nextAction: "doctor", nextActionLabel: "Book doctor consultation",
      },
      intake_context: {
        categoryId: "other",
        dangerSigns: [],
        takesMedication: false, medication: null, conditions: ["none"],
      },
      status: "pending_review", channel: "web",
      clinician_id: null, clinician_notes: null, diagnosis: null, prescription: null, referral: null, closed_at: null,
      created_at: hoursAgo(14),
    },
    // ── E8: Kwame — Fatigue + weight loss — NON-URGENT — CLOSED ──────────────
    {
      id: IDS.encE8,
      patient_id: IDS.patKwame,
      chief_complaint: "Fatigue, poor appetite and unexplained weight loss over two weeks",
      symptoms: [
        { symptomId: "fatigue", label: "Fatigue or low energy", severity: "moderate", duration: "more_than_1_week" },
        { symptomId: "weight_loss", label: "Unexplained weight loss", severity: "mild", duration: "more_than_1_week" },
        { symptomId: "loss_of_appetite", label: "Loss of appetite", severity: "moderate", duration: "more_than_1_week" },
        { symptomId: "night_sweats", label: "Night sweats", severity: "mild", duration: "more_than_1_week" },
      ],
      triage_outcome: {
        level: "non_urgent", label: "Nurse follow-up",
        recommendation: "Request a nurse follow-up",
        rationale: "Chronic fatigue and weight loss in a patient with diabetes — warrants clinical review within 2–3 days.",
        seekCareWithin: "Within 2–3 days",
        nextAction: "nurse", nextActionLabel: "Request nurse follow-up",
      },
      intake_context: {
        categoryId: "other",
        dangerSigns: [],
        takesMedication: true,
        medication: "Metformin 500mg once daily",
        conditions: ["diabetes"],
      },
      status: "closed", channel: "web",
      clinician_id: IDS.clinAmoah,
      clinician_notes: "Patient with known T2DM presenting with 3 kg unintentional weight loss, polyuria, and fatigue. HbA1c 10.2% at last check 3 months ago. Dietary recall shows high carbohydrate intake. Medication adjusted and dietary counselling arranged.",
      diagnosis: "Uncontrolled type 2 diabetes mellitus with symptomatic hyperglycaemia",
      prescription: "Metformin 1000mg BD (dose increased). Continue monitoring fasting glucose.",
      referral: "Nutritionist referral arranged. Diabetes nurse educator follow-up in 2 weeks.",
      closed_at: daysAgo(9),
      created_at: daysAgo(10),
    },
    // ── E9: Fatima — Back pain — NON-URGENT — REVIEWED ───────────────────────
    {
      id: IDS.encE9,
      patient_id: IDS.patFatima,
      chief_complaint: "Lower back pain after moving furniture at home",
      symptoms: [
        { symptomId: "back_pain", label: "Back pain", severity: "mild", duration: "4_7_days" },
        { symptomId: "joint_pain", label: "Joint pain or swelling", severity: "mild", duration: "4_7_days" },
      ],
      triage_outcome: {
        level: "non_urgent", label: "Nurse follow-up",
        recommendation: "Request a nurse follow-up",
        rationale: "Mild musculoskeletal pain after physical exertion — suitable for nurse follow-up.",
        seekCareWithin: "Within 2–3 days",
        nextAction: "nurse", nextActionLabel: "Request nurse follow-up",
      },
      intake_context: {
        categoryId: "injury",
        dangerSigns: [],
        takesMedication: false, medication: null, conditions: ["none"],
      },
      status: "reviewed", channel: "mobile",
      clinician_id: IDS.clinBoateng,
      clinician_notes: "Mechanical lower back strain following heavy lifting. No radiculopathy. Straight leg raise negative bilaterally. Advised rest, local heat application, and NSAIDs with food.",
      diagnosis: "Mechanical lower back pain — acute musculoskeletal strain",
      prescription: "Ibuprofen 400mg three times daily with food for 5 days. Rest for 2–3 days.",
      referral: null, closed_at: null,
      created_at: daysAgo(3),
    },
    // ── E10: Kwame — Sore throat — SELF-CARE — PENDING ───────────────────────
    {
      id: IDS.encE10,
      patient_id: IDS.patKwame,
      chief_complaint: "Mild sore throat and blocked nose since this morning",
      symptoms: [
        { symptomId: "sore_throat", label: "Sore throat", severity: "mild", duration: "less_than_1_day" },
        { symptomId: "fatigue", label: "Fatigue or low energy", severity: "mild", duration: "less_than_1_day" },
      ],
      triage_outcome: {
        level: "self_care", label: "Self care",
        recommendation: "You can manage this at home",
        rationale: "Mild upper respiratory symptoms with no danger signs — manageable at home with rest and fluids.",
        seekCareWithin: "Monitor — see a doctor if symptoms worsen or persist beyond 5 days",
        nextAction: "pharmacy", nextActionLabel: "Visit a pharmacy",
      },
      intake_context: {
        categoryId: "fever",
        dangerSigns: [],
        takesMedication: true,
        medication: "Metformin 500mg, Lisinopril 10mg",
        conditions: ["diabetes", "hypertension"],
      },
      status: "pending_review", channel: "web",
      clinician_id: null, clinician_notes: null, diagnosis: null, prescription: null, referral: null, closed_at: null,
      created_at: hoursAgo(8),
    },
  ];

  const { error } = await supabase.from("encounters").upsert(encounters, { onConflict: "id" });
  if (error) throw new Error(`encounters: ${error.message}`);
  ok("10 encounters");
}

async function seedClinicianNotes() {
  console.log("\n── Clinician notes");

  const notes = [
    {
      id: IDS.noteN1,
      encounter_id: IDS.encE1,
      clinician_id: IDS.clinBoateng,
      notes: "Patient presented with acute chest pain radiating to left arm, shortness of breath, and diaphoresis. ECG changes consistent with STEMI. Referred immediately to Korle Bu Teaching Hospital cardiology unit.",
      diagnosis: "Suspected acute coronary syndrome (STEMI)",
      prescription: null,
      referral: "Emergency cardiology referral — patient transported to Korle Bu Teaching Hospital",
      created_at: daysAgo(6),
    },
    {
      id: IDS.noteN2,
      encounter_id: IDS.encE2,
      clinician_id: IDS.clinAmoah,
      notes: "Presentation consistent with bacterial meningitis. Temperature 39.8°C, photophobia, nuchal rigidity present. Patient alert but distressed. Immediate hospital referral made.",
      diagnosis: "Suspected bacterial meningitis",
      prescription: null,
      referral: "Emergency hospital referral — do not delay. Patient directed to Ridge Hospital emergency department.",
      created_at: daysAgo(3),
    },
    {
      id: IDS.noteN3,
      encounter_id: IDS.encE5,
      clinician_id: IDS.clinAmoah,
      notes: "Likely asthma exacerbation triggered by harmattan dust. Wheeze on auscultation bilaterally. O2 sats 96%. Advised to resume salbutamol inhaler and limit outdoor exposure during dry season.",
      diagnosis: "Asthma exacerbation — mild to moderate",
      prescription: "Salbutamol inhaler 2 puffs PRN. Beclomethasone 200mcg BD for 7 days.",
      referral: null,
      created_at: daysAgo(4),
    },
    {
      id: IDS.noteN4,
      encounter_id: IDS.encE8,
      clinician_id: IDS.clinAmoah,
      notes: "Patient with known T2DM presenting with 3 kg unintentional weight loss, polyuria, and fatigue. HbA1c 10.2% at last check 3 months ago. Dietary recall shows high carbohydrate intake. Medication adjusted and dietary counselling arranged.",
      diagnosis: "Uncontrolled type 2 diabetes mellitus with symptomatic hyperglycaemia",
      prescription: "Metformin 1000mg BD (dose increased). Continue monitoring fasting glucose.",
      referral: "Nutritionist referral arranged. Diabetes nurse educator follow-up in 2 weeks.",
      created_at: daysAgo(9),
    },
    {
      id: IDS.noteN5,
      encounter_id: IDS.encE9,
      clinician_id: IDS.clinBoateng,
      notes: "Mechanical lower back strain following heavy lifting. No radiculopathy. Straight leg raise negative bilaterally. Advised rest, local heat application, and NSAIDs with food.",
      diagnosis: "Mechanical lower back pain — acute musculoskeletal strain",
      prescription: "Ibuprofen 400mg three times daily with food for 5 days. Rest for 2–3 days.",
      referral: null,
      created_at: daysAgo(2),
    },
  ];

  const { error } = await supabase.from("clinician_notes").upsert(notes, { onConflict: "id" });
  if (error) throw new Error(`clinician_notes: ${error.message}`);
  ok("5 clinician notes");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("eHealth MVP — seeding demo data…");
  console.log(`Target: ${SUPABASE_URL}`);

  await seedAuthUsers();
  await seedPatients();
  await seedClinicians();
  await seedEncounters();
  await seedClinicianNotes();

  console.log(`
─────────────────────────────────────────────
  Demo ready. Sign in at your app URL.

  Password for all accounts:  Demo1234!

  Patient accounts:
    amara@demo.health     Amara Osei (Accra)
    kwame@demo.health     Kwame Mensah (Kumasi)
    fatima@demo.health    Fatima Ibrahim (Tamale)

  Clinician accounts:
    dr.amoah@demo.health    Dr. Sarah Amoah
    dr.boateng@demo.health  Dr. Emmanuel Boateng

  Admin account:
    admin@demo.health
─────────────────────────────────────────────
`);
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
