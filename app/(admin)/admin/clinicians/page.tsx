import { Stethoscope } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Clinicians — Admin" };

// Clinicians are managed externally (via Supabase admin API / auth triggers).
// This page provides a placeholder for future clinician management UI.
export default function AdminCliniciansPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Clinicians</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage clinical staff accounts and access
        </p>
      </div>

      <EmptyState
        icon={<Stethoscope className="h-6 w-6 text-muted-foreground" />}
        title="Clinician management"
        description="Clinician accounts are provisioned via the Supabase admin API. Assign the 'clinician' role in app_metadata to grant access to the clinician portal."
        variant="dashed"
      />
    </div>
  );
}
