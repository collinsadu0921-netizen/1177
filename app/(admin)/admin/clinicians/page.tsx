import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllClinicians } from "@/domains/clinicians/queries";
import { initials, formatDate } from "@/lib/utils";

export const metadata = { title: "Clinicians — Admin" };

export default async function AdminCliniciansPage() {
  const result     = await getAllClinicians();
  const clinicians = result.data ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clinicians</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {clinicians.length} clinical staff account{clinicians.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Provision note */}
      <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Clinician accounts are provisioned via the Supabase admin API.
        Set <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">role = &apos;clinician&apos;</code> in{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">app_metadata</code> to grant portal access.
      </div>

      {/* List */}
      {clinicians.length === 0 ? (
        <EmptyState
          icon={<Stethoscope className="h-6 w-6 text-muted-foreground" />}
          title="No clinicians yet"
          description="Provisioned clinician accounts will appear here."
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
                  Account created
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                  Portal
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
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                    {c.specialty ?? <span className="italic opacity-40">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Link
                      href={`/clinician/queue`}
                      className="text-xs text-primary hover:underline"
                    >
                      View queue →
                    </Link>
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
