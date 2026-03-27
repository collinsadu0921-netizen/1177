import { createClient } from "@/lib/supabase/server";
import type { Patient, ApiResult } from "@/lib/types";

function rowToPatient(data: Record<string, unknown>): Patient {
  return {
    id:               data.id as string,
    userId:           data.user_id as string,
    fullName:         data.full_name as string,
    dateOfBirth:      data.date_of_birth as string,
    sex:              data.sex as Patient["sex"],
    phone:            data.phone as string,
    location:         (data.location as string | null) ?? null,
    emergencyContact: (data.emergency_contact as Patient["emergencyContact"]) ?? null,
    createdAt:        data.created_at as string,
    updatedAt:        data.updated_at as string,
  };
}

export async function getAllPatients(): Promise<ApiResult<Patient[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) return { data: null, error: error.message };
  return {
    data: (data ?? []).map((row) => rowToPatient(row as Record<string, unknown>)),
    error: null,
  };
}

export async function getPatientById(
  id: string
): Promise<ApiResult<Patient | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };
  return { data: rowToPatient(data as Record<string, unknown>), error: null };
}

export async function getPatientByUserId(
  userId: string
): Promise<ApiResult<Patient | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };

  if (!data) return { data: null, error: null };
  return { data: rowToPatient(data as Record<string, unknown>), error: null };
}
