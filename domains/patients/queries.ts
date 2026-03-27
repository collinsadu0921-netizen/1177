import { createClient } from "@/lib/supabase/server";
import type { Patient, ApiResult } from "@/lib/types";

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

  return {
    data: {
      id: data.id,
      userId: data.user_id,
      fullName: data.full_name,
      dateOfBirth: data.date_of_birth,
      sex: data.sex,
      phone: data.phone,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    error: null,
  };
}
