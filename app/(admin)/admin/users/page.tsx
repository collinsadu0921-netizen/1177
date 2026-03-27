import { Users, Phone, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllPatients } from "@/domains/patients/queries";
import { initials, formatDate } from "@/lib/utils";

export const metadata = { title: "Users — Admin" };

const SEX_LABELS: Record<string, string> = {
  male:              "Male",
  female:            "Female",
  other:             "Other",
  prefer_not_to_say: "–",
};

export default async function AdminUsersPage() {
  const result = await getAllPatients();
  const patients = result.data ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {patients.length} registered patient{patients.length !== 1 ? "s" : ""}
        </p>
      </div>

      {patients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6 text-muted-foreground" />}
          title="No users yet"
          description="Registered patients will appear here."
          variant="dashed"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Patient
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                  Phone
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">
                  Sex
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
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
                        <p className="text-xs text-muted-foreground font-mono">
                          {p.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {p.phone}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {SEX_LABELS[p.sex] ?? p.sex}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(p.createdAt)}
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
