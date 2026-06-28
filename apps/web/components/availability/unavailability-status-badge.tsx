import { cn } from "@/lib/utils";
import type { UnavailabilityStatus } from "@/lib/availability/types";
import { unavailabilityStatusLabels } from "@/lib/availability/types";

const styles: Record<UnavailabilityStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60",
  approved: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

export function UnavailabilityStatusBadge({ status }: { status: UnavailabilityStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {unavailabilityStatusLabels[status]}
    </span>
  );
}
