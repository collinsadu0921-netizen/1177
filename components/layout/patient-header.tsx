import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

interface PatientHeaderProps {
  name?: string;
}

export function PatientHeader({ name }: PatientHeaderProps) {
  return (
    <header className="sticky top-0 z-header bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="page-container flex h-14 items-center justify-between">
        {/* Brand */}
        <Link
          href="/app"
          className="flex items-center gap-2 focus-visible:outline-none"
          aria-label="eHealth home"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              width="14" height="14" viewBox="0 0 14 14"
              fill="none" xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M7 2v10M2 7h10"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-sm font-bold tracking-tight text-foreground">
            eHealth
          </span>
        </Link>

        {/* Avatar → profile */}
        <Link href="/app/profile" aria-label="Your profile">
          <Avatar size="sm">
            {name ? (
              <AvatarFallback>{initials(name)}</AvatarFallback>
            ) : (
              <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                —
              </AvatarFallback>
            )}
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
