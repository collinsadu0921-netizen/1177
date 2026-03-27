import { createClient } from "@/lib/supabase/server";
import type { Encounter, QueueItem, ApiResult } from "@/lib/types";

function rowToEncounter(data: Record<string, unknown>): Encounter {
  return {
    id: data.id as string,
    patientId: data.patient_id as string,
    chiefComplaint: data.chief_complaint as string,
    symptoms: (data.symptoms as Encounter["symptoms"]) ?? [],
    triageOutcome: data.triage_outcome as Encounter["triageOutcome"],
    status: data.status as Encounter["status"],
    clinicianId: data.clinician_id as string | null,
    clinicianNotes: data.clinician_notes as string | null,
    closedAt: data.closed_at as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
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

export async function getClinicianQueue(): Promise<ApiResult<QueueItem[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("encounters")
    .select("id, patient_id, chief_complaint, triage_outcome, status, created_at, patients(full_name)")
    .in("status", ["pending_review", "reviewed"])
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };

  const items: QueueItem[] = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const patient = r.patients as { full_name: string } | null;
    const triage = r.triage_outcome as { level: string } | null;
    return {
      encounterId: r.id as string,
      patientId: r.patient_id as string,
      patientName: patient?.full_name ?? "Unknown",
      chiefComplaint: r.chief_complaint as string,
      triageLevel: (triage?.level ?? "self_care") as QueueItem["triageLevel"],
      createdAt: r.created_at as string,
      status: r.status as QueueItem["status"],
    };
  });

  return { data: items, error: null };
}
