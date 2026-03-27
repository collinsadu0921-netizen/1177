import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/types";

/**
 * Role-aware session middleware.
 *
 * Routing contract:
 *   patient   → home at /app
 *   clinician → home at /clinician/queue
 *   admin     → home at /admin
 *
 * Role is read from user.app_metadata.role (set server-side, trusted).
 * Falls back to user.user_metadata.role (set by user), then defaults to "patient".
 *
 * ⚠️  Production note: always use app_metadata.role set via a service-role
 *      hook or admin API — never rely solely on user_metadata.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Path classification ────────────────────────────────────────────────────

  const isPatientLogin     = pathname === "/login" || pathname === "/verify";
  const isClinicianLogin   = pathname === "/clinician/login";
  const isPublicAuth       = isPatientLogin || isClinicianLogin;
  const isOnboarding       = pathname === "/onboarding";
  const isPatientApp       = pathname === "/app" || pathname.startsWith("/app/");
  const isClinicianPortal  = pathname.startsWith("/clinician/") && !isClinicianLogin;
  const isAdminPortal      = pathname.startsWith("/admin");

  // ── Unauthenticated ────────────────────────────────────────────────────────

  if (!user) {
    if (isPatientApp || isOnboarding || isAdminPortal) {
      return redirectTo(request, "/login");
    }
    if (isClinicianPortal) {
      return redirectTo(request, "/clinician/login");
    }
    // Public auth routes: allow through
    return supabaseResponse;
  }

  // ── Authenticated — resolve role ───────────────────────────────────────────

  const role: UserRole =
    (user.app_metadata?.role as UserRole) ||
    (user.user_metadata?.role as UserRole) ||
    "patient";

  const roleDashboard: Record<UserRole, string> = {
    patient:   "/app",
    clinician: "/clinician/queue",
    admin:     "/admin",
  };

  // ── Redirect authenticated users away from login pages ────────────────────

  if (isPublicAuth) {
    return redirectTo(request, roleDashboard[role]);
  }

  // ── Enforce role isolation ─────────────────────────────────────────────────

  if (role === "patient") {
    if (isClinicianPortal || isAdminPortal) {
      return redirectTo(request, "/app");
    }
  }

  if (role === "clinician") {
    if (isPatientApp || isOnboarding || isAdminPortal) {
      return redirectTo(request, "/clinician/queue");
    }
  }

  if (role === "admin") {
    // Admins can access admin routes freely; redirect away from patient/clinician areas.
    if (isPatientApp || isOnboarding || isClinicianPortal) {
      return redirectTo(request, "/admin");
    }
  }

  return supabaseResponse;
}

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}
