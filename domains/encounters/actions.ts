"use server";

import { createClient } from "@/lib/supabase/server";
import { runTriage } from "@/domains/triage/engine";
import type { Encounter, SymptomEntry, IntakeContext, ApiResult } from "@/lib/types";

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

export async function createEncounter(
  patientId: string,
  chiefComplaint: string,
  symptoms: SymptomEntry[],
  intakeContext?: IntakeContext
): Promise<ApiResult<Encounter>> {
  const supabase = await createClient();

  const dangerSigns = intakeContext?.dangerSigns ?? [];
  const triageOutcome = runTriage(symptoms, dangerSigns);

  const { data, error } = await supabase
    .from("encounters")
    .insert({
      patient_id:      patientId,
      chief_complaint: chiefComplaint,
      symptoms:        symptoms,
      triage_outcome:  triageOutcome,
      intake_context:  intakeContext ?? null,
      status:          "pending_review",
      clinician_id:    null,
      clinician_notes: null,
      diagnosis:       null,
      prescription:    null,
      referral:        null,
      closed_at:       null,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  return { data: rowToEncounter(data as Record<string, unknown>), error: null };
}

// ── Clinical documentation fields shared across draft / review / close ─────

export interface ClinicalFields {
  clinicianNotes: string;
  diagnosis: string;
  prescription: string;
  referral: string;
}

export async function saveDraftEncounter(
  encounterId: string,
  clinicianId: string,
  fields: ClinicalFields
): Promise<ApiResult<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("encounters")
    .update({
      clinician_id:    clinicianId || null,
      clinician_notes: fields.clinicianNotes || null,
      diagnosis:       fields.diagnosis || null,
      prescription:    fields.prescription || null,
      referral:        fields.referral || null,
      updated_at:      new Date().toISOString(),
    })
    .eq("id", encounterId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function markEncounterReviewed(
  encounterId: string,
  clinicianId: string,
  fields: ClinicalFields
): Promise<ApiResult<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("encounters")
    .update({
      status:          "reviewed",
      clinician_id:    clinicianId || null,
      clinician_notes: fields.clinicianNotes || null,
      diagnosis:       fields.diagnosis || null,
      prescription:    fields.prescription || null,
      referral:        fields.referral || null,
      updated_at:      new Date().toISOString(),
    })
    .eq("id", encounterId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function closeEncounter(
  encounterId: string,
  clinicianId: string,
  fields: ClinicalFields
): Promise<ApiResult<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("encounters")
    .update({
      status:          "closed",
      clinician_id:    clinicianId || null,
      clinician_notes: fields.clinicianNotes || null,
      diagnosis:       fields.diagnosis || null,
      prescription:    fields.prescription || null,
      referral:        fields.referral || null,
      closed_at:       new Date().toISOString(),
      updated_at:      new Date().toISOString(),
    })
    .eq("id", encounterId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
