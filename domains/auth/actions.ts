"use server";

import { createClient } from "@/lib/supabase/server";
import type { ApiResult } from "@/lib/types";

export async function sendOtp(phone: string): Promise<ApiResult<null>> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { channel: "sms" },
  });

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function verifyOtp(
  phone: string,
  token: string
): Promise<ApiResult<null>> {
  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
