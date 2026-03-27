import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileText,
  History,
  Info,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { triageBadgeVariant } from "@/domains/triage/engine";
import { getEncounterById } from "@/domains/encounters/queries";
import { cn } from "@/lib/utils";
import type { TriageLevel } from "@/lib/types";

interface PageProps {
  params: Promise<{ encounterId: string }>;
}

// ── Per-level visual config ────────────────────────────────────────────────

const HERO_CONFIG = {
  emergency:   { heroBg: "bg-red-600",    Icon: AlertCircle,  iconBg: "bg-white/20" },
  urgent:      { heroBg: "bg-orange-500", Icon: ShieldAlert,  iconBg: "bg-white/20" },
  semi_urgent: { heroBg: "bg-amber-500",  Icon: Clock,        iconBg: "bg-white/20" },
  non_urgent:  { heroBg: "bg-green-600",  Icon: Info,         iconBg: "bg-white/20" },
  self_care:   { heroBg: "bg-primary",    Icon: CheckCircle,  iconBg: "bg-white/20" },
} satisfies Record<TriageLevel, { heroBg: string; Icon: unknown; iconBg: string }>;

const SEVERITY_LABELS: Record<string, string> = {
  mild:     "Mild",
  moderate: "Moderate",
  severe:   "Severe",
};

const DURATION_LABELS: Record<string, string> = {
  less_than_1_day:  "< 1 day",
  "1_3_days":       "1–3 days",
  "4_7_days":       "4–7 days",
  more_than_1_week: "> 1 week",
};

export default async function TriageOutcomePage({ params }: PageProps) {
  const { encounterId } = await params;
  const result = await getEncounterById(encounterId);

  if (!result.data) notFound();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const enc = result.data!;

  const triage = enc.triageOutcome;
  const level  = triage?.level ?? ("self_care" as TriageLevel);
  const { heroBg, Icon, iconBg } = HERO_CONFIG[level];

  return (
    <div className="min-h-screen flex flex-col bg-background animate-page-in">

      {/* ── Color-coded hero ──────────────────────────────────────────────── */}
      <div className={cn("px-5 pt-14 pb-8 flex flex-col items-center text-center gap-4", heroBg)}>
        {/* Saved confirmation pill */}
        <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-white/90" aria-hidden />
          <span className="text-[11px] font-medium text-white/90">Assessment saved</span>
        </div>

        {/* Level icon */}
        <div className={cn("h-16 w-16 rounded-full flex items-center justify-center", iconBg)}>
          <Icon className="h-8 w-8 text-white" strokeWidth={1.75} aria-hidden />
        </div>

        {/* Triage badge */}
        {triage && (
          <Badge variant={triageBadgeVariant(level)} size="md">
            {triage.label}
          </Badge>
        )}

        {/* Recommendation headline */}
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">
            {triage?.recommendation ?? "Assessment complete"}
          </h1>
          {triage?.seekCareWithin && (
            <p className="text-sm text-white/85 mt-2 leading-relaxed">
              {triage.seekCareWithin}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 page-container py-6 flex flex-col gap-5">

        {/* ── Rationale ─────────────────────────────────────────────────── */}
        {triage?.rationale && (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm leading-relaxed text-foreground">
                {triage.rationale}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Symptoms summary ──────────────────────────────────────────── */}
        {enc.symptoms.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" aria-hidden />
                Reported symptoms
              </h2>
              <div className="divide-y divide-border/60">
                {enc.symptoms.map((s) => (
                  <div
                    key={s.symptomId}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    <span className="text-sm">{s.label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" size="sm">
                        {SEVERITY_LABELS[s.severity]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {DURATION_LABELS[s.duration]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── What happens next ─────────────────────────────────────────── */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold mb-2">What happens next?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A clinician will review your submission and may follow up with
              additional guidance. Track the status in your visit history.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Sticky footer ─────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/50 p-4 flex flex-col gap-2 safe-bottom">
        <Button asChild size="xl" className="w-full">
          <Link href="/app">
            {triage?.nextActionLabel ?? "Back to home"}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full">
          <Link href="/app/history">
            <History className="h-4 w-4 mr-2" aria-hidden />
            View visit history
          </Link>
        </Button>
      </div>
    </div>
  );
}
