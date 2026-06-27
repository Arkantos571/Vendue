import { cn } from "@/lib/utils";
import { enquiryStatusLabels, type EnquiryStatus } from "@/lib/mock/enquiries";

const styles: Record<EnquiryStatus, string> = {
  new: "bg-sky-50 text-sky-700",
  contacted: "bg-violet-50 text-violet-700",
  proposal_sent: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  lost: "bg-stone-100 text-stone-600",
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
