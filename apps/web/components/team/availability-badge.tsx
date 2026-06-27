import { cn } from "@/lib/utils";
import type { AvailabilityStatus } from "@/lib/mock/team";

const availabilityStyles: Record<AvailabilityStatus, string> = {
  available: "bg-emerald-50 text-emerald-700",
  limited: "bg-amber-50 text-amber-700",
  unavailable: "bg-stone-100 text-stone-600",
};

const availabilityLabels: Record<AvailabilityStatus, string> = {
  available: "Available",
  limited: "Limited",
  unavailable: "Unavailable",
};

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        availabilityStyles[status],
      )}
    >
      {availabilityLabels[status]}
    </span>
  );
}
