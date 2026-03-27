export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Calm top bar accent */}
      <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
