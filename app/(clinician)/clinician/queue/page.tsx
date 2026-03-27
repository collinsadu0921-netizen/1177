import { InboxIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { QueueItemRow } from "@/components/clinician/queue-item-row";
import { getClinicianQueue } from "@/domains/encounters/queries";
import type { TriageLevel } from "@/lib/types";

export const metadata = { title: "Patient Queue" };

const TRIAGE_ORDER: TriageLevel[] = [
  "emergency",
  "urgent",
  "semi_urgent",
  "non_urgent",
  "self_care",
];

export default async function QueuePage() {
  const result = await getClinicianQueue();
  const items = result.data ?? [];

  // Sort by triage urgency, then by created time
  const sorted = [...items].sort((a, b) => {
    const ai = TRIAGE_ORDER.indexOf(a.triageLevel);
    const bi = TRIAGE_ORDER.indexOf(b.triageLevel);
    if (ai !== bi) return ai - bi;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const pending = sorted.filter((i) => i.status === "pending_review");
  const reviewed = sorted.filter((i) => i.status === "reviewed");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Patient Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {items.length} case{items.length !== 1 ? "s" : ""} awaiting review
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 flex flex-col items-center text-center gap-3">
            <InboxIcon className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">Queue is clear</p>
              <p className="text-sm text-muted-foreground mt-1">
                All cases have been reviewed.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending review section */}
          {pending.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pending Review ({pending.length})
              </h2>
              {pending.map((item) => (
                <QueueItemRow key={item.encounterId} item={item} />
              ))}
            </div>
          )}

          {/* Already reviewed, not yet closed */}
          {reviewed.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Reviewed — Awaiting Closure ({reviewed.length})
              </h2>
              {reviewed.map((item) => (
                <QueueItemRow key={item.encounterId} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
