import Link from "next/link";
import { InboxIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { QueueItemRow } from "@/components/clinician/queue-item-row";
import { getClinicianQueueFull } from "@/domains/encounters/queries";
import { cn } from "@/lib/utils";
import type { TriageLevel, QueueItem } from "@/lib/types";

export const metadata = { title: "Patient Queue" };

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

const TRIAGE_ORDER: TriageLevel[] = [
  "emergency",
  "urgent",
  "semi_urgent",
  "non_urgent",
  "self_care",
];

type TabKey = "active" | "pending" | "reviewed" | "closed";

const TABS: { key: TabKey; label: string }[] = [
  { key: "active",   label: "Active"      },
  { key: "pending",  label: "Pending"     },
  { key: "reviewed", label: "In Progress" },
  { key: "closed",   label: "Closed"      },
];

function sortByUrgency(items: QueueItem[]): QueueItem[] {
  return [...items].sort((a, b) => {
    const ai = TRIAGE_ORDER.indexOf(a.triageLevel);
    const bi = TRIAGE_ORDER.indexOf(b.triageLevel);
    if (ai !== bi) return ai - bi;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export default async function QueuePage({ searchParams }: PageProps) {
  const { tab = "active" } = await searchParams;
  const activeTab = (["active", "pending", "reviewed", "closed"].includes(tab)
    ? tab
    : "active") as TabKey;

  const result = await getClinicianQueueFull();
  const all = result.data ?? [];

  const counts = {
    active:   all.filter((i) => i.status !== "closed").length,
    pending:  all.filter((i) => i.status === "pending_review").length,
    reviewed: all.filter((i) => i.status === "reviewed").length,
    closed:   all.filter((i) => i.status === "closed").length,
  };

  const filtered = sortByUrgency(
    activeTab === "pending"  ? all.filter((i) => i.status === "pending_review") :
    activeTab === "reviewed" ? all.filter((i) => i.status === "reviewed") :
    activeTab === "closed"   ? all.filter((i) => i.status === "closed") :
    /* active (default) */     all.filter((i) => i.status !== "closed")
  );

  const pendingItems  = filtered.filter((i) => i.status === "pending_review");
  const reviewedItems = filtered.filter((i) => i.status === "reviewed");
  const showSections  = activeTab === "active" && pendingItems.length > 0 && reviewedItems.length > 0;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Patient Queue</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {counts.active} active case{counts.active !== 1 ? "s" : ""} awaiting review
        </p>
      </div>

      {/* Tab strip */}
      <div className="flex items-center gap-0.5 border-b border-border/50 -mx-4 px-4">
        {TABS.map(({ key, label }) => {
          const isActive = activeTab === key;
          const count    = counts[key];
          return (
            <Link
              key={key}
              href={key === "active" ? "/clinician/queue" : `/clinician/queue?tab=${key}`}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold tabular-nums",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 flex flex-col items-center text-center gap-3">
            <InboxIcon className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium">
                {activeTab === "closed" ? "No closed cases" : "Queue is clear"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "closed"
                  ? "Closed encounters will appear here."
                  : "All active cases have been reviewed."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : showSections ? (
        /* Active tab with both pending and in-progress — show labelled sections */
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Pending review ({pendingItems.length})
            </p>
            {pendingItems.map((item) => (
              <QueueItemRow key={item.encounterId} item={item} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              In progress ({reviewedItems.length})
            </p>
            {reviewedItems.map((item) => (
              <QueueItemRow key={item.encounterId} item={item} />
            ))}
          </div>
        </div>
      ) : (
        /* Single-status tabs — flat list */
        <div className="flex flex-col gap-2">
          {filtered.map((item) => (
            <QueueItemRow key={item.encounterId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
