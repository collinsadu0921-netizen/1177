/**
 * Patient root layout — minimal wrapper.
 * Sub-groups (tabbed) and (flow) apply their own chrome.
 */
export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
