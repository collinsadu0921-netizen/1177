"use server";

import { createClient } from "@/lib/supabase/server";
import { runTriage } from "@/domains/triage/engine";
import type { Encounter, SymptomEntry, ApiResult } from "@/lib/types";

export async function createEncounter(
  patientId: string,
  chiefComplaint: string,
  symptoms: SymptomEntry[]
): Promise<ApiResult<Encounter>> {
  const supabase = await createClient();

  const triageOutcome = runTriage(symptoms);

  const { data, error } = await supabase
    .from("encounters")
    .insert({
      patient_id: patientId,
      chief_complaint: chiefComplaint,
      symptoms: symptoms,
      triage_outcome: triageOutcome,
      status: "pending_review",
      clinician_id: null,
      clinician_notes: null,
      closed_at: null,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  return {
    data: {
      id: data.id,
      patientId: data.patient_id,
      chiefComplaint: data.chief_complaint,
      symptoms: data.symptoms,
      triageOutcome: data.triage_outcome,
      status: data.status,
      clinicianId: data.clinician_id,
      clinicianNotes: data.clinician_notes,
      closedAt: data.closed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    error: null,
  };
}

export async function closeEncounter(
  encounterId: string,
  clinicianId: string,
  notes: string
): Promise<ApiResult<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("encounters")
    .update({
      status: "closed",
      clinician_id: clinicianId,
      clinician_notes: notes,
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", encounterId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
