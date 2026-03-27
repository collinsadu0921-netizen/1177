"use server";

import { createClient } from "@/lib/supabase/server";
import type { Patient, BiologicalSex, EmergencyContact, ApiResult } from "@/lib/types";

export interface UpsertPatientInput {
  fullName: string;
  dateOfBirth: string;
  sex: BiologicalSex;
  location?: string;
  emergencyContact?: EmergencyContact;
}

export async function upsertPatient(
  input: UpsertPatientInput
): Promise<ApiResult<Patient>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("patients")
    .upsert(
      {
        user_id:           user.id,
        full_name:         input.fullName,
        date_of_birth:     input.dateOfBirth,
        sex:               input.sex,
        phone:             user.phone ?? "",
        location:          input.location ?? null,
        emergency_contact: input.emergencyContact ?? null,
        updated_at:        new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  return {
    data: {
      id:               data.id,
      userId:           data.user_id,
      fullName:         data.full_name,
      dateOfBirth:      data.date_of_birth,
      sex:              data.sex,
      phone:            data.phone,
      location:         data.location ?? null,
      emergencyContact: data.emergency_contact ?? null,
      createdAt:        data.created_at,
      updatedAt:        data.updated_at,
    },
    error: null,
  };
}
