import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime, initials } from "@/lib/utils";
import { triageBadgeVariant } from "@/domains/triage/engine";
import { cn } from "@/lib/utils";
import type { QueueItem } from "@/lib/types";

interface QueueItemRowProps {
  item: QueueItem;
}

const TRIAGE_LABELS: Record<string, string> = {
  emergency:  "Emergency",
  urgent:     "Urgent",
  semi_urgent:"Semi-urgent",
  non_urgent: "Non-urgent",
  self_care:  "Self-care",
};

// Left border accent communicates urgency immediately
const TRIAGE_ACCENT: Record<string, string> = {
  emergency:  "border-l-red-400",
  urgent:     "border-l-orange-400",
  semi_urgent:"border-l-amber-400",
  non_urgent: "border-l-green-400",
  self_care:  "border-l-blue-300",
};

const TRIAGE_AVATAR_BG: Record<string, string> = {
  emergency:  "bg-red-50 text-red-700",
  urgent:     "bg-orange-50 text-orange-700",
  semi_urgent:"bg-amber-50 text-amber-700",
  non_urgent: "bg-green-50 text-green-700",
  self_care:  "bg-blue-50 text-blue-700",
};

/**
 * QueueItemRow — a single case in the clinician's review queue.
 *
 * Left accent border = urgency level at a glance.
 * Patient name is the primary info, chief complaint secondary.
 * Time in queue is shown for urgency awareness.
 */
export function QueueItemRow({ item }: QueueItemRowProps) {
  const accentClass = TRIAGE_ACCENT[item.triageLevel] ?? "border-l-border";
  const avatarClass = TRIAGE_AVATAR_BG[item.triageLevel] ?? "bg-muted text-muted-foreground";

  return (
    <Link href={`/clinician/encounters/${item.encounterId}`} className="block">
      <Card
        interactive
        className={cn(
          "border-l-4 overflow-hidden",
          accentClass
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Patient avatar */}
            <Avatar size="default" className={cn("shrink-0 mt-0.5", avatarClass)}>
              <AvatarFallback className={avatarClass}>
                {initials(item.patientName)}
              </AvatarFallback>
            </Avatar>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm text-foreground leading-tight">
                  {item.patientName}
                </p>
                <Badge
                  variant={triageBadgeVariant(item.triageLevel)}
                  size="sm"
                  dot
                  className="shrink-0"
                >
                  {TRIAGE_LABELS[item.triageLevel] ?? item.triageLevel}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                {item.chiefComplaint}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden />
                <span>{formatRelativeTime(item.createdAt)}</span>
              </div>
            </div>

            <ChevronRight
              className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1"
              aria-hidden
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
