import { AlertCircle, CheckCircle, Clock, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { triageLevelBg, triageBadgeVariant } from "@/domains/triage/engine";
import { cn } from "@/lib/utils";
import type { TriageOutcome } from "@/lib/types";

interface TriageResultCardProps {
  outcome: TriageOutcome;
}

const LEVEL_ICONS = {
  emergency: AlertCircle,
  urgent: AlertCircle,
  semi_urgent: Clock,
  non_urgent: Info,
  self_care: CheckCircle,
};

export function TriageResultCard({ outcome }: TriageResultCardProps) {
  const Icon = LEVEL_ICONS[outcome.level];

  return (
    <Card
      className={cn(
        "border-2 animate-fade-in",
        triageLevelBg(outcome.level)
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Icon className="h-6 w-6 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-base">Assessment Result</h3>
              <Badge variant={triageBadgeVariant(outcome.level)}>
                {outcome.label}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed">{outcome.recommendation}</p>
            <div className="mt-3 pt-3 border-t border-current/20">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                Seek care
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {outcome.seekCareWithin}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
