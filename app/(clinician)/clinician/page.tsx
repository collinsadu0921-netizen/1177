import { redirect } from "next/navigation";

export default function ClinicianIndexPage() {
  redirect("/clinician/queue");
}
