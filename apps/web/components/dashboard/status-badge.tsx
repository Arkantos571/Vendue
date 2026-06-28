import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types";

const statusStyles: Record<EventStatus, string> = {
  draft: "bg-muted text-foreground ",
  confirmed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  in_progress: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  completed: "bg-slate-100 text-muted-foreground dark:bg-slate-800 ",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300",
};

const statusLabels: Record<EventStatus, string> = {
  draft: "Draft",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
