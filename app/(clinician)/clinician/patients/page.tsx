import Link from "next/link";
import { Users, ChevronRight, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllPatients } from "@/domains/patients/queries";
import { initials, formatDate } from "@/lib/utils";

export const metadata = { title: "Patients" };

export default async function PatientsPage() {
  const result = await getAllPatients();
  const patients = result.data ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Patients</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {patients.length} registered patient{patients.length !== 1 ? "s" : ""}
        </p>
      </div>

      {patients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6 text-muted-foreground" />}
          title="No patients yet"
          description="Patients will appear here once they complete registration."
          variant="dashed"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {patients.map((p) => (
            <Link key={p.id} href={`/clinician/patients/${p.id}`}>
              <Card interactive>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar size="default">
                      <AvatarFallback>{initials(p.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{p.fullName}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {p.phone}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Since {formatDate(p.createdAt)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
