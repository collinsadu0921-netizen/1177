import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";

interface ClinicianHeaderProps {
  name?: string;
  queueCount?: number;
}

/**
 * ClinicianHeader — top bar for the clinician workspace.
 * Includes queue count badge and role label for quick context.
 */
export function ClinicianHeader({ name, queueCount }: ClinicianHeaderProps) {
  return (
    <header className="sticky top-0 z-header bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="page-container-wide flex h-14 items-center justify-between">
        {/* Left: brand + role */}
        <div className="flex items-center gap-3">
          <Link
            href="/clinician/queue"
            className="flex items-center gap-2 focus-visible:outline-none"
            aria-label="Clinician queue"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                width="14" height="14" viewBox="0 0 14 14"
                fill="none" xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M7 2v10M2 7h10"
                  stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-sm font-bold tracking-tight text-foreground">
              eHealth
            </span>
          </Link>

          {/* Role pill */}
          <span className="hidden sm:inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700 ring-1 ring-primary-200">
            Clinician
          </span>

          {/* Queue alert badge */}
          {typeof queueCount === "number" && queueCount > 0 && (
            <Badge variant="destructive" size="sm" dot>
              {queueCount} pending
            </Badge>
          )}
        </div>

        {/* Right: avatar */}
        {name ? (
          <Avatar size="sm">
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted" aria-hidden />
        )}
      </div>
    </header>
  );
}
