import { cn } from "@/lib/utils";
import { shiftStatusLabels, type ShiftStatus } from "@/lib/mock/rota";

const shiftStatusStyles: Record<ShiftStatus, string> = {
  draft:
    "bg-slate-100 text-muted-foreground dark:bg-slate-800 ",
  notified:
    "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60",
  confirmed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  declined:
    "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

export function ShiftStatusBadge({ status }: { status: ShiftStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        shiftStatusStyles[status],
      )}
    >
      {shiftStatusLabels[status]}
    </span>
  );
}
