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

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<ApiResult<null>> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

/**
 * Called after OTP verification succeeds.
 * Returns the path the client should navigate to:
 *   - "/onboarding" if the patient has no profile record yet
 *   - "/app" if the profile is already complete
 */
export async function getPostAuthRedirect(): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "/login";

  const { data } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return data ? "/app" : "/onboarding";
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
