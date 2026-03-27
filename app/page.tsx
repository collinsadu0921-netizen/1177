import { redirect } from "next/navigation";

/**
 * Root page — redirects based on auth state.
 * Supabase session check happens in middleware; this is a fallback.
 */
export default function RootPage() {
  redirect("/login");
}
