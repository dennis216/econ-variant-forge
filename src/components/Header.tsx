import { BarChart3 } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
          <BarChart3 className="w-[18px] h-[18px] text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold text-foreground tracking-tight leading-tight">
            EconVariant
          </h1>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Economics Exam Generator
          </p>
        </div>
      </div>
    </header>
  );
}
