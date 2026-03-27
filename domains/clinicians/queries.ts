import { createClient } from "@/lib/supabase/server";
import type { Clinician, ApiResult } from "@/lib/types";

function rowToClinician(data: Record<string, unknown>): Clinician {
  return {
    id:        data.id as string,
    userId:    data.user_id as string,
    fullName:  data.full_name as string,
    specialty: (data.specialty as string | null) ?? null,
    createdAt: data.created_at as string,
  };
}

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

  return { data: rowToClinician(data as Record<string, unknown>), error: null };
}

export async function getAllClinicians(): Promise<ApiResult<Clinician[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clinicians")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) return { data: null, error: error.message };

  return {
    data: (data ?? []).map((row) => rowToClinician(row as Record<string, unknown>)),
    error: null,
  };
}
