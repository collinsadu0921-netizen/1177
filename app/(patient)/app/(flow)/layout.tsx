/**
 * Flow layout — full-screen flows without persistent bottom nav.
 * Applies to: /app/check, /app/check/[encounterId]
 * Each page manages its own sticky header (StepHeader or plain header).
 */
export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {children}
    </div>
  );
}
