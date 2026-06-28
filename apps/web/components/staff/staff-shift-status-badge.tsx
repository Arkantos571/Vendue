import { cn } from "@/lib/utils";
import { staffShiftStatusLabels } from "@/lib/staff/mappers";
import type { RotaShiftStatus } from "@/src/types/database";

const styles: Record<RotaShiftStatus, string> = {
  scheduled:
    "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60",
  confirmed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  declined:
    "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  completed: "bg-slate-100 text-slate-600 dark:text-slate-300 dark:bg-slate-800 ",
  cancelled: "bg-slate-100 text-slate-500 dark:text-slate-400 dark:bg-slate-800 ",
};

export function StaffShiftStatusBadge({ status }: { status: RotaShiftStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {staffShiftStatusLabels[status]}
    </span>
  );
}
