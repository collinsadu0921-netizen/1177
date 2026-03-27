import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Skeleton — pulse placeholder for loading states.
 * Use in loading.tsx files and Suspense fallbacks.
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/** Pre-composed skeleton for a card row (icon + two text lines). */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border/50 bg-card p-4 shadow-card", className)}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

/** Pre-composed skeleton for a list of cards. */
function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Page-level skeleton — title + subtitle + list. */
function SkeletonPage({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6 py-6", className)}>
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <SkeletonList count={4} />
    </div>
  );
}

/** Table row skeleton for admin/clinician list views. */
function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-border/50 last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4 rounded", i === 0 ? "w-32" : i === cols - 1 ? "w-16 ml-auto" : "flex-1")}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonList, SkeletonPage, SkeletonTableRow };
