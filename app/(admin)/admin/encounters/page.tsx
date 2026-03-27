import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getEncountersForAdmin } from "@/domains/encounters/queries";
import { triageBadgeVariant } from "@/domains/triage/engine";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Encounters — Admin" };

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

type TabKey = "all" | "active" | "closed";

const STATUS_LABELS: Record<string, string> = {
  in_progress:    "In Progress",
  pending_review: "Pending",
  reviewed:       "In Progress",
  closed:         "Closed",
};

function statusBadgeVariant(status: string) {
  if (status === "closed")      return "closed"      as const;
  if (status === "reviewed")    return "reviewed"    as const;
  if (status === "in_progress") return "in_progress" as const;
  return "pending" as const;
}

export default async function AdminEncountersPage({ searchParams }: PageProps) {
  const { tab = "all" } = await searchParams;
  const activeTab = (["all", "active", "closed"].includes(tab) ? tab : "all") as TabKey;

  const result     = await getEncountersForAdmin();
  const encounters = result.data ?? [];

  const counts = {
    all:    encounters.length,
    active: encounters.filter((e) => e.status !== "closed").length,
    closed: encounters.filter((e) => e.status === "closed").length,
  };

  const filtered =
    activeTab === "active" ? encounters.filter((e) => e.status !== "closed") :
    activeTab === "closed" ? encounters.filter((e) => e.status === "closed") :
    encounters;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all",    label: "All"    },
    { key: "active", label: "Active" },
    { key: "closed", label: "Closed" },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Encounters</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {counts.all} total · {counts.active} active · {counts.closed} closed
        </p>
      </div>

      {/* Tab strip */}
      <div className="flex items-center gap-0.5 border-b border-border/50 -mx-4 px-4">
        {tabs.map(({ key, label }) => {
          const isActive = activeTab === key;
          const count    = counts[key];
          return (
            <Link
              key={key}
              href={key === "all" ? "/admin/encounters" : `/admin/encounters?tab=${key}`}
              className={cn(
                "relative flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium transition-colors",
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

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6 text-muted-foreground" />}
          title={activeTab === "closed" ? "No closed encounters" : "No encounters yet"}
          description={
            activeTab === "closed"
              ? "Closed encounters will appear here."
              : "Patient encounters will appear here once submitted."
          }
          variant="dashed"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Complaint
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                  Patient
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                  Triage
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                  Clinician
                </th>
                <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((enc) => (
                <tr key={enc.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 max-w-[200px]">
                    <Link
                      href={`/clinician/encounters/${enc.id}`}
                      className="font-medium hover:text-primary transition-colors line-clamp-1"
                    >
                      {enc.chiefComplaint}
                    </Link>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      #{enc.id.slice(0, 8)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                    {enc.patientName}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {enc.triageLevel && enc.triageLabel ? (
                      <Badge variant={triageBadgeVariant(enc.triageLevel)} size="sm" dot>
                        {enc.triageLabel}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(enc.status)} size="sm">
                      {STATUS_LABELS[enc.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {enc.clinicianName ?? (
                      <span className="text-xs italic opacity-40">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground text-right hidden xl:table-cell">
                    <span title={formatDate(enc.createdAt)}>
                      {formatRelativeTime(enc.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
