import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
