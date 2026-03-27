import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { triageBadgeVariant } from "@/domains/triage/engine";
import { cn } from "@/lib/utils";
import type { Encounter } from "@/lib/types";

interface EncounterCardProps {
  encounter: Encounter;
  /** Compact variant for home page preview (default) vs. full for history */
  variant?: "compact" | "full";
}

const STATUS_LABELS: Record<Encounter["status"], string> = {
  in_progress:    "In Progress",
  pending_review: "Pending Review",
  reviewed:       "Reviewed",
  closed:         "Closed",
};

const STATUS_BADGE: Record<Encounter["status"], Encounter["status"]> = {
  in_progress:    "in_progress",
  pending_review: "pending",
  reviewed:       "reviewed",
  closed:         "closed",
} as unknown as Record<Encounter["status"], Encounter["status"]>;

// Left border accent keyed to triage level
const TRIAGE_ACCENT: Record<string, string> = {
  emergency:  "border-l-red-400",
  urgent:     "border-l-orange-400",
  semi_urgent:"border-l-amber-400",
  non_urgent: "border-l-green-400",
  self_care:  "border-l-blue-400",
};

export function EncounterCard({ encounter, variant = "compact" }: EncounterCardProps) {
  const triage     = encounter.triageOutcome;
  const accentClass = triage ? TRIAGE_ACCENT[triage.level] : "border-l-border/60";
  const href = `/app/history/${encounter.id}`;

  return (
    <Link href={href} className="block group">
      <Card
        interactive
        className={cn("border-l-4 overflow-hidden", accentClass)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0 space-y-2">

              {/* Chief complaint — dominant line */}
              <p className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
                {encounter.chiefComplaint}
              </p>

              {/* Badges row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {triage && (
                  <Badge
                    variant={triageBadgeVariant(triage.level)}
                    size="sm"
                    dot
                  >
                    {triage.label}
                  </Badge>
                )}
                <Badge
                  variant={
                    encounter.status === "closed"    ? "closed"
                    : encounter.status === "reviewed" ? "reviewed"
                    : encounter.status === "in_progress" ? "in_progress"
                    : "pending"
                  }
                  size="sm"
                >
                  {STATUS_LABELS[encounter.status]}
                </Badge>
              </div>

              {/* Date line */}
              <p className="text-[11px] text-muted-foreground">
                {formatRelativeTime(encounter.createdAt)}
                {" · "}
                {formatDate(encounter.createdAt)}
              </p>
            </div>

            <ChevronRight
              className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5 group-hover:text-muted-foreground transition-colors"
              aria-hidden
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
