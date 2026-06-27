import { cn } from "@/lib/utils";
import { enquiryPriorityLabels, type EnquiryPriority } from "@/lib/mock/enquiries";

const styles: Record<EnquiryPriority, string> = {
  low: "bg-stone-100 text-stone-600",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  high: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300",
};

export function EnquiryPriorityBadge({ priority }: { priority: EnquiryPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[priority],
      )}
    >
      {enquiryPriorityLabels[priority]}
    </span>
  );
}
