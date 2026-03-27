"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home",    label: "Home",    icon: Home },
  { href: "/history", label: "History", icon: Clock },
  { href: "/profile", label: "Profile", icon: User },
];

/**
 * BottomNav — fixed mobile navigation bar.
 *
 * Active indicator: a short bar above the icon + bold text + primary color.
 * Inactive: muted gray. No background fill on active to keep it clean.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-nav safe-bottom",
        "bg-background/96 backdrop-blur-md",
        "border-t border-border/50",
      )}
    >
      <div className="page-container flex items-stretch h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 pt-1",
                "relative transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active bar indicator at top */}
              <span
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2",
                  "h-0.5 rounded-full transition-all duration-200",
                  isActive
                    ? "w-6 bg-primary"
                    : "w-0 bg-transparent"
                )}
                aria-hidden
              />

              <Icon
                className="h-5 w-5"
                strokeWidth={isActive ? 2.5 : 1.75}
                aria-hidden
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "font-semibold" : ""
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
