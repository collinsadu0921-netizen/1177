import { AlertCircle, CheckCircle, Clock, Info, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { triageBadgeVariant } from "@/domains/triage/engine";
import { cn } from "@/lib/utils";
import type { TriageOutcome } from "@/lib/types";

interface TriageResultCardProps {
  outcome: TriageOutcome;
}

// Per-level visual config
const LEVEL_CONFIG = {
  emergency: {
    icon:    AlertCircle,
    surface: "bg-red-50 border border-red-200",
    iconCn:  "text-red-500",
    textCn:  "text-red-900",
    mutedCn: "text-red-700/70",
    divider: "border-red-200/60",
  },
  urgent: {
    icon:    ShieldAlert,
    surface: "bg-orange-50 border border-orange-200",
    iconCn:  "text-orange-500",
    textCn:  "text-orange-900",
    mutedCn: "text-orange-700/70",
    divider: "border-orange-200/60",
  },
  semi_urgent: {
    icon:    Clock,
    surface: "bg-amber-50 border border-amber-200",
    iconCn:  "text-amber-500",
    textCn:  "text-amber-900",
    mutedCn: "text-amber-700/70",
    divider: "border-amber-200/60",
  },
  non_urgent: {
    icon:    Info,
    surface: "bg-green-50 border border-green-200",
    iconCn:  "text-green-600",
    textCn:  "text-green-900",
    mutedCn: "text-green-700/70",
    divider: "border-green-200/60",
  },
  self_care: {
    icon:    CheckCircle,
    surface: "bg-blue-50 border border-blue-200",
    iconCn:  "text-blue-500",
    textCn:  "text-blue-900",
    mutedCn: "text-blue-700/70",
    divider: "border-blue-200/60",
  },
} as const;

/**
 * TriageResultCard — the primary outcome display after symptom assessment.
 *
 * The most important element on the outcome screen.
 * Each triage level gets its own distinct colour treatment so the
 * urgency is unmistakable at a glance.
 */
export function TriageResultCard({ outcome }: TriageResultCardProps) {
  const config = LEVEL_CONFIG[outcome.level];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl p-5 animate-fade-in",
        config.surface
      )}
      role="region"
      aria-label="Triage assessment result"
    >
      {/* Header row */}
      <div className="flex items-start gap-3 mb-4">
        <Icon
          className={cn("h-6 w-6 shrink-0 mt-0.5", config.iconCn)}
          aria-hidden
          strokeWidth={1.75}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className={cn("font-bold text-base leading-tight", config.textCn)}>
              Assessment Result
            </p>
            <Badge variant={triageBadgeVariant(outcome.level)}>
              {outcome.label}
            </Badge>
          </div>
          <p className={cn("text-sm leading-relaxed", config.textCn)}>
            {outcome.recommendation}
          </p>
        </div>
      </div>

      {/* Seek care timing */}
      <div className={cn("pt-3 border-t", config.divider)}>
        <p className={cn("text-[11px] font-semibold uppercase tracking-widest mb-0.5", config.mutedCn)}>
          When to seek care
        </p>
        <p className={cn("text-sm font-semibold", config.textCn)}>
          {outcome.seekCareWithin}
        </p>
      </div>
    </div>
  );
}
