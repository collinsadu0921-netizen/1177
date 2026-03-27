import { createClient } from "@/lib/supabase/server";
import type { Encounter, EncounterStatus, IntakeContext, QueueItem, TriageLevel, ApiResult } from "@/lib/types";

// ── Admin encounter list type (lean — no JSONB symptoms payload) ───────────

export interface AdminEncounterItem {
  id:            string;
  patientId:     string;
  patientName:   string;
  chiefComplaint: string;
  triageLevel:   TriageLevel | null;
  triageLabel:   string | null;
  status:        EncounterStatus;
  clinicianName: string | null;
  createdAt:     string;
}

function rowToEncounter(data: Record<string, unknown>): Encounter {
  return {
    id:             data.id as string,
    patientId:      data.patient_id as string,
    chiefComplaint: data.chief_complaint as string,
    symptoms:       (data.symptoms as Encounter["symptoms"]) ?? [],
    triageOutcome:  data.triage_outcome as Encounter["triageOutcome"],
    intakeContext:  (data.intake_context as IntakeContext) ?? null,
    status:         data.status as Encounter["status"],
    clinicianId:    data.clinician_id as string | null,
    clinicianNotes: data.clinician_notes as string | null,
    diagnosis:      data.diagnosis as string | null,
    prescription:   data.prescription as string | null,
    referral:       data.referral as string | null,
    closedAt:       data.closed_at as string | null,
    createdAt:      data.created_at as string,
    updatedAt:      data.updated_at as string,
  };
}

export async function getEncountersByPatient(
  patientId: string
): Promise<ApiResult<Encounter[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("encounters")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };

  return {
    data: (data ?? []).map((row) => rowToEncounter(row as Record<string, unknown>)),
    error: null,
  };
}

export async function getEncounterById(
  id: string
): Promise<ApiResult<Encounter | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("encounters")
    .select("*, patients(full_name)")
    .eq("id", id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };

  const encounter = rowToEncounter(data as Record<string, unknown>);
  return { data: encounter, error: null };
}

export async function getAllEncounters(): Promise<ApiResult<Encounter[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("encounters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };

  return {
    data: (data ?? []).map((row) => rowToEncounter(row as Record<string, unknown>)),
    error: null,
  };
}

// ── Queue helpers ──────────────────────────────────────────────────────────

function rowToQueueItem(row: Record<string, unknown>): QueueItem {
  const patient = row.patients as { full_name: string } | null;
  const triage  = row.triage_outcome as { level: string } | null;
  return {
    encounterId:    row.id as string,
    patientId:      row.patient_id as string,
    patientName:    patient?.full_name ?? "Unknown",
    chiefComplaint: row.chief_complaint as string,
    triageLevel:    (triage?.level ?? "self_care") as QueueItem["triageLevel"],
    createdAt:      row.created_at as string,
    status:         row.status as QueueItem["status"],
  };
}

/** Active queue — pending_review and reviewed only (used for header badge count) */
export async function getClinicianQueue(): Promise<ApiResult<QueueItem[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("encounters")
    .select("id, patient_id, chief_complaint, triage_outcome, status, created_at, patients(full_name)")
    .in("status", ["pending_review", "reviewed"])
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };

  return {
    data: (data ?? []).map((row) => rowToQueueItem(row as Record<string, unknown>)),
    error: null,
  };
}

/** Full queue — all statuses, for tab-filtered queue page */
export async function getClinicianQueueFull(): Promise<ApiResult<QueueItem[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("encounters")
    .select("id, patient_id, chief_complaint, triage_outcome, status, created_at, patients(full_name)")
    .in("status", ["pending_review", "reviewed", "closed"])
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };

  return {
    data: (data ?? []).map((row) => rowToQueueItem(row as Record<string, unknown>)),
    error: null,
  };
}

/** Admin encounter list — all encounters with patient + clinician names */
export async function getEncountersForAdmin(): Promise<ApiResult<AdminEncounterItem[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("encounters")
    .select("id, patient_id, chief_complaint, triage_outcome, status, clinician_id, created_at, patients(full_name), clinicians(full_name)")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };

  const items: AdminEncounterItem[] = (data ?? []).map((row) => {
    const r         = row as Record<string, unknown>;
    const patient   = r.patients   as { full_name: string } | null;
    const clinician = r.clinicians as { full_name: string } | null;
    const triage    = r.triage_outcome as { level: string; label: string } | null;
    return {
      id:             r.id as string,
      patientId:      r.patient_id as string,
      patientName:    patient?.full_name ?? "Unknown",
      chiefComplaint: r.chief_complaint as string,
      triageLevel:    (triage?.level ?? null) as TriageLevel | null,
      triageLabel:    triage?.label ?? null,
      status:         r.status as EncounterStatus,
      clinicianName:  clinician?.full_name ?? null,
      createdAt:      r.created_at as string,
    };
  });

  return { data: items, error: null };
}
