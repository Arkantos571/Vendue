import { cn } from "@/lib/utils";
import { staffShiftStatusLabels } from "@/lib/staff/mappers";
import type { RotaShiftStatus } from "@/src/types/database";

const styles: Record<RotaShiftStatus, string> = {
  scheduled: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  confirmed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  completed: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
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
