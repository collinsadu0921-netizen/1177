import Link from "next/link";
import { AdminNav } from "@/components/layout/admin-nav";
import { Shield } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Admin header */}
      <header className="sticky top-0 z-header bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="page-container-wide flex h-14 items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 focus-visible:outline-none"
            aria-label="Admin dashboard"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-bold tracking-tight text-foreground">
              eHealth
            </span>
          </Link>
          <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700 ring-1 ring-primary-200">
            Admin
          </span>
        </div>
      </header>

      <AdminNav />
      <main className="flex-1 pb-8">{children}</main>
    </div>
  );
}
