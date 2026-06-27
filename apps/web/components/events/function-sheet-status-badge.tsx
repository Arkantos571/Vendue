import { cn } from "@/lib/utils";
import {
  functionSheetStatusLabels,
  type FunctionSheetStatus,
} from "@/lib/mock/event-calendar";

const styles: Record<FunctionSheetStatus, string> = {
  draft: "bg-stone-100 text-stone-700",
  in_progress: "bg-sky-50 text-sky-700",
  ready: "bg-emerald-50 text-emerald-700",
};

export function FunctionSheetStatusBadge({ status }: { status: FunctionSheetStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {functionSheetStatusLabels[status]}
    </span>
  );
}
