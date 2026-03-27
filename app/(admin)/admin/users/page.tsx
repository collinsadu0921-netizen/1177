import Link from "next/link";
import { Stethoscope, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllPatients } from "@/domains/patients/queries";
import { getAllClinicians } from "@/domains/clinicians/queries";
import { initials, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Users — Admin" };

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

const SEX_LABELS: Record<string, string> = {
  male:              "Male",
  female:            "Female",
  other:             "Other",
  prefer_not_to_say: "–",
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { tab = "patients" } = await searchParams;
  const activeTab = tab === "clinicians" ? "clinicians" : "patients";

  const [patientsResult, cliniciansResult] = await Promise.all([
    getAllPatients(),
    getAllClinicians(),
  ]);

  const patients   = patientsResult.data   ?? [];
  const clinicians = cliniciansResult.data ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {patients.length} patient{patients.length !== 1 ? "s" : ""}
          {" · "}
          {clinicians.length} clinician{clinicians.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tab strip */}
      <div className="flex items-center gap-0.5 border-b border-border/50 -mx-4 px-4">
        {(["patients", "clinicians"] as const).map((key) => {
          const isActive = activeTab === key;
          const count    = key === "patients" ? patients.length : clinicians.length;
          return (
            <Link
              key={key}
              href={`/admin/users${key === "patients" ? "" : "?tab=clinicians"}`}
              className={cn(
                "relative flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium transition-colors capitalize",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {key}
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
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Patients table */}
      {activeTab === "patients" && (
        <>
          {patients.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6 text-muted-foreground" />}
              title="No patients yet"
              description="Registered patients will appear here."
              variant="dashed"
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Patient
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Role
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                      Phone
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                      Sex
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback>{initials(p.fullName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{p.fullName}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {p.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default" size="sm">Patient</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                        {p.phone}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                        {SEX_LABELS[p.sex] ?? p.sex}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                        {formatDate(p.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Clinicians table */}
      {activeTab === "clinicians" && (
        <>
          {clinicians.length === 0 ? (
            <EmptyState
              icon={<Stethoscope className="h-6 w-6 text-muted-foreground" />}
              title="No clinicians yet"
              description="Clinician accounts will appear here once provisioned."
              variant="dashed"
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Clinician
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Role
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                      Specialty
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {clinicians.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" className="bg-violet-50">
                            <AvatarFallback className="text-violet-700">
                              {initials(c.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{c.fullName}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {c.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" size="sm">Clinician</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                        {c.specialty ?? <span className="italic opacity-50">—</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
