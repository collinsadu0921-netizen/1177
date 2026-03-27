import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Stethoscope,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllPatients } from "@/domains/patients/queries";
import { getAllClinicians } from "@/domains/clinicians/queries";
import { getEncountersForAdmin } from "@/domains/encounters/queries";
import { triageBadgeVariant } from "@/domains/triage/engine";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

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

export default async function AdminDashboardPage() {
  const [patientsResult, cliniciansResult, encountersResult] = await Promise.all([
    getAllPatients(),
    getAllClinicians(),
    getEncountersForAdmin(),
  ]);

  const patients   = patientsResult.data   ?? [];
  const clinicians = cliniciansResult.data ?? [];
  const encounters = encountersResult.data ?? [];

  const activeCount = encounters.filter((e) => e.status !== "closed").length;
  const closedCount = encounters.filter((e) => e.status === "closed").length;

  const stats = [
    {
      label:   "Total Patients",
      value:   patients.length,
      icon:    Users,
      href:    "/admin/users",
      iconBg:  "bg-primary/10",
      iconCn:  "text-primary",
    },
    {
      label:   "Total Clinicians",
      value:   clinicians.length,
      icon:    Stethoscope,
      href:    "/admin/clinicians",
      iconBg:  "bg-violet-50",
      iconCn:  "text-violet-600",
    },
    {
      label:   "Active Encounters",
      value:   activeCount,
      icon:    Activity,
      href:    "/admin/encounters",
      iconBg:  "bg-amber-50",
      iconCn:  "text-amber-600",
    },
    {
      label:   "Closed Encounters",
      value:   closedCount,
      icon:    CheckCircle2,
      href:    "/admin/encounters?tab=closed",
      iconBg:  "bg-green-50",
      iconCn:  "text-green-600",
    },
  ];

  const recent = encounters.slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 flex flex-col gap-8">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform overview — {new Date().toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, iconBg, iconCn }) => (
          <Link key={label} href={href}>
            <Card interactive className="h-full">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center`}>
                  <Icon className={`h-[18px] w-[18px] ${iconCn}`} aria-hidden />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent encounters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Recent Encounters
          </h2>
          <Link
            href="/admin/encounters"
            className="text-xs text-primary hover:underline font-medium"
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No encounters yet</p>
            </CardContent>
          </Card>
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
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recent.map((enc) => (
                  <tr key={enc.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 max-w-[180px]">
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
                    <td className="px-4 py-3 text-xs text-muted-foreground text-right hidden lg:table-cell">
                      {formatRelativeTime(enc.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
