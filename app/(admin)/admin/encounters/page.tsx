import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllEncounters } from "@/domains/encounters/queries";
import { triageBadgeVariant } from "@/domains/triage/engine";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Encounters — Admin" };

const STATUS_LABELS: Record<string, string> = {
  in_progress:    "In Progress",
  pending_review: "Pending Review",
  reviewed:       "Reviewed",
  closed:         "Closed",
};

export default async function AdminEncountersPage() {
  const result = await getAllEncounters();
  const encounters = result.data ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Encounters</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {encounters.length} total encounter{encounters.length !== 1 ? "s" : ""}
        </p>
      </div>

      {encounters.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6 text-muted-foreground" />}
          title="No encounters yet"
          description="Patient encounters will appear here once submitted."
          variant="dashed"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Complaint
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                  Triage
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {encounters.map((enc) => (
                <tr key={enc.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/clinician/encounters/${enc.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {enc.chiefComplaint}
                    </Link>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      #{enc.id.slice(0, 8)}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {enc.triageOutcome ? (
                      <Badge
                        variant={triageBadgeVariant(enc.triageOutcome.level as never)}
                        size="sm"
                      >
                        {enc.triageOutcome.label}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        enc.status === "closed"
                          ? "closed"
                          : enc.status === "pending_review"
                          ? "pending"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {STATUS_LABELS[enc.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                    {formatDate(enc.createdAt)}
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
