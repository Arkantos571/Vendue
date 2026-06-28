import { cn } from "@/lib/utils";
import { enquiryStatusLabels, type EnquiryStatus } from "@/lib/mock/enquiries";

const styles: Record<EnquiryStatus, string> = {
  new: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  contacted: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  proposal_sent: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  confirmed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  lost: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
};

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {enquiryStatusLabels[status]}
    </span>
  );
}
