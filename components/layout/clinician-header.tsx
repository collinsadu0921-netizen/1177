import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";

interface ClinicianHeaderProps {
  name?: string;
  queueCount?: number;
}

export function ClinicianHeader({ name, queueCount }: ClinicianHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="page-container flex items-center justify-between h-14 max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="text-primary font-bold text-lg tracking-tight">
            eHealth
          </span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Clinician
          </span>
          {queueCount !== undefined && queueCount > 0 && (
            <Badge variant="destructive" className="h-5 text-xs px-1.5">
              {queueCount}
            </Badge>
          )}
        </div>
        {name && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
}
