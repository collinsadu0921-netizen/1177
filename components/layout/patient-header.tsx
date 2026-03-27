import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

interface PatientHeaderProps {
  name?: string;
  subtitle?: string;
}

export function PatientHeader({ name, subtitle }: PatientHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="page-container flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-lg tracking-tight">
            eHealth
          </span>
          {subtitle && (
            <span className="text-muted-foreground text-sm">{subtitle}</span>
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
