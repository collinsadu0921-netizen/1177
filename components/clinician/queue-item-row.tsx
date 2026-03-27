import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { triageBadgeVariant } from "@/domains/triage/engine";
import type { QueueItem } from "@/lib/types";

interface QueueItemRowProps {
  item: QueueItem;
}

export function QueueItemRow({ item }: QueueItemRowProps) {
  return (
    <Link href={`/clinician/encounter/${item.encounterId}`}>
      <Card className="card-hover cursor-pointer active:scale-[0.99] transition-transform">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm truncate">
                  {item.patientName}
                </span>
                <Badge variant={triageBadgeVariant(item.triageLevel)}>
                  {item.triageLevel.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {item.chiefComplaint}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
