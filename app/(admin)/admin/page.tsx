import Link from "next/link";
import { Users, ClipboardList, Stethoscope, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAllPatients } from "@/domains/patients/queries";
import { getAllEncounters } from "@/domains/encounters/queries";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [patientsResult, encountersResult] = await Promise.all([
    getAllPatients(),
    getAllEncounters(),
  ]);

  const patients   = patientsResult.data   ?? [];
  const encounters = encountersResult.data ?? [];

  const pending   = encounters.filter((e) => e.status === "pending_review").length;
  const closed    = encounters.filter((e) => e.status === "closed").length;
  const emergency = encounters.filter(
    (e) => e.triageOutcome?.level === "emergency"
  ).length;

  const stats = [
    {
      label: "Total Patients",
      value: patients.length,
      icon: Users,
      href: "/admin/users",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Encounters",
      value: encounters.length,
      icon: ClipboardList,
      href: "/admin/encounters",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Review",
      value: pending,
      icon: Stethoscope,
      href: "/admin/encounters",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Emergency Triage",
      value: emergency,
      icon: AlertTriangle,
      href: "/admin/encounters",
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform overview and key metrics
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link key={label} href={href}>
            <Card interactive className="h-full">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-4.5 w-4.5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent encounters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent Encounters
          </h2>
          <Link
            href="/admin/encounters"
            className="text-xs text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {encounters.slice(0, 5).map((enc) => (
            <Card key={enc.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{enc.chiefComplaint}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(enc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    enc.status === "closed"
                      ? "bg-green-50 text-green-700"
                      : enc.status === "pending_review"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {enc.status.replace("_", " ")}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
