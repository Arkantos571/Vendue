import { cn } from "@/lib/utils";
import type { ScheduleAvailabilityIndicator } from "@/lib/availability/types";
import { scheduleAvailabilityLabels } from "@/lib/availability/types";

const styles: Record<ScheduleAvailabilityIndicator, string> = {
  available: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  unavailable_today: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  unavailable_soon: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
};

export function ScheduleAvailabilityBadge({
  indicator,
}: {
  indicator: ScheduleAvailabilityIndicator;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[indicator],
      )}
    >
      {scheduleAvailabilityLabels[indicator]}
    </span>
  );
}
