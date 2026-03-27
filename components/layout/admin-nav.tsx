"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Stethoscope, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin",             label: "Dashboard",  icon: LayoutDashboard, exact: true },
  { href: "/admin/users",       label: "Users",      icon: Users },
  { href: "/admin/clinicians",  label: "Clinicians", icon: Stethoscope },
  { href: "/admin/encounters",  label: "Encounters", icon: ClipboardList },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="page-container-wide flex h-11 gap-1 overflow-x-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2 px-4 text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
