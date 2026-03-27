import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background page-container text-center gap-6">
      <div>
        <p className="text-7xl font-bold text-primary/20 tracking-tight">404</p>
        <h1 className="text-2xl font-bold mt-2">Page not found</h1>
        <p className="text-muted-foreground text-sm mt-2 max-w-xs">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Button asChild size="lg">
          <Link href="/app">
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/app/history">
            <Search className="h-4 w-4" />
            View history
          </Link>
        </Button>
      </div>
    </div>
  );
}
