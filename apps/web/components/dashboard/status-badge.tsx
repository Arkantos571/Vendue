import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types";

const statusStyles: Record<EventStatus, string> = {
  draft: "bg-stone-100 text-stone-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  in_progress: "bg-sky-50 text-sky-700",
  completed: "bg-stone-100 text-stone-600",
  cancelled: "bg-red-50 text-red-700",
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
