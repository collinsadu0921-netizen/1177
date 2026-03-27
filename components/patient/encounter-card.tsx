import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { triageBadgeVariant } from "@/domains/triage/engine";
import type { Encounter } from "@/lib/types";

interface EncounterCardProps {
  encounter: Encounter;
}

const STATUS_LABELS: Record<Encounter["status"], string> = {
  in_progress: "In Progress",
  pending_review: "Pending Review",
  reviewed: "Reviewed",
  closed: "Closed",
};

export function EncounterCard({ encounter }: EncounterCardProps) {
  const triage = encounter.triageOutcome;

  return (
    <Link href={`/encounter/${encounter.id}`}>
      <Card className="card-hover cursor-pointer active:scale-[0.99] transition-transform">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {encounter.chiefComplaint}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatRelativeTime(encounter.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {triage && (
                <Badge variant={triageBadgeVariant(triage.level)}>
                  {triage.label}
                </Badge>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant={encounter.status === "closed" ? "closed" : "pending"}
              className="text-[10px]"
            >
              {STATUS_LABELS[encounter.status]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {encounter.symptoms.length} symptom
              {encounter.symptoms.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
