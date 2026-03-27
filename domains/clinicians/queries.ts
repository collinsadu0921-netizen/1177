import { createClient } from "@/lib/supabase/server";
import type { Clinician, ApiResult } from "@/lib/types";

export async function getClinicianByUserId(
  userId: string
): Promise<ApiResult<Clinician | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clinicians")
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
      specialty: data.specialty ?? null,
      createdAt: data.created_at,
    },
    error: null,
  };
}
