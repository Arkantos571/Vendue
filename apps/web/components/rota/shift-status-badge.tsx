import { cn } from "@/lib/utils";
import { shiftStatusLabels, type ShiftStatus } from "@/lib/mock/rota";

const shiftStatusStyles: Record<ShiftStatus, string> = {
  draft: "bg-stone-100 text-stone-600",
  notified: "bg-sky-50 text-sky-700",
  confirmed: "bg-emerald-50 text-emerald-700",
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
