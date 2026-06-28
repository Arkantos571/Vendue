import { cn } from "@/lib/utils";

interface RotaCompletionIndicatorProps {
  assigned: number;
  required: number;
  compact?: boolean;
}

export function RotaCompletionIndicator({
  assigned,
  required,
  compact = false,
}: RotaCompletionIndicatorProps) {
  const percent = required === 0 ? 100 : Math.round((assigned / required) * 100);
  const isComplete = assigned >= required;
  const isUrgent = percent < 70;

  return (
    <div className={cn("space-y-1.5", compact && "min-w-[120px]")}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400">Rota</span>
        <span
          className={cn(
            "font-medium",
            isComplete ? "text-emerald-700" : isUrgent ? "text-amber-700" : "text-slate-700 dark:text-slate-300",
          )}
        >
          {assigned}/{required}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isComplete ? "bg-emerald-500" : isUrgent ? "bg-amber-500" : "bg-brand-600",
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
