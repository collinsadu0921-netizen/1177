import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { triageBadgeVariant } from "@/domains/triage/engine";
import { cn } from "@/lib/utils";
import type { Encounter } from "@/lib/types";

interface EncounterCardProps {
  encounter: Encounter;
}

const STATUS_LABELS: Record<Encounter["status"], string> = {
  in_progress:    "In Progress",
  pending_review: "Pending Review",
  reviewed:       "Reviewed",
  closed:         "Closed",
};

// Left border accent color by triage level
const TRIAGE_ACCENT: Record<string, string> = {
  emergency:  "border-l-red-400",
  urgent:     "border-l-orange-400",
  semi_urgent:"border-l-amber-400",
  non_urgent: "border-l-green-400",
  self_care:  "border-l-blue-400",
};

/**
 * EncounterCard — patient history list item.
 *
 * Left accent border communicates triage level at a glance.
 * Chief complaint is the primary information.
 * Status and symptom count are secondary.
 */
export function EncounterCard({ encounter }: EncounterCardProps) {
  const triage = encounter.triageOutcome;
  const accentClass = triage ? TRIAGE_ACCENT[triage.level] : "border-l-border";

  return (
    <Link href={`/encounter/${encounter.id}`} className="block">
      <Card
        interactive
        className={cn(
          "border-l-4 pl-0 overflow-hidden",
          accentClass
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Chief complaint */}
              <p className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
                {encounter.chiefComplaint}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={encounter.status === "closed" ? "closed" : "pending"}
                  size="sm"
                >
                  {STATUS_LABELS[encounter.status]}
                </Badge>

                {triage && (
                  <Badge variant={triageBadgeVariant(triage.level)} size="sm">
                    {triage.label}
                  </Badge>
                )}

                <span className="text-[11px] text-muted-foreground">
                  {encounter.symptoms.length} symptom{encounter.symptoms.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Relative timestamp */}
              <p className="text-[11px] text-muted-foreground">
                {formatRelativeTime(encounter.createdAt)}
              </p>
            </div>

            <ChevronRight
              className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5"
              aria-hidden
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
