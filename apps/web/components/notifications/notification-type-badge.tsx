import { cn } from "@/lib/utils";
import { notificationTypeLabels } from "@/lib/notifications/categories";

const styles: Record<string, string> = {
  rota_published: "bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-300",
  shift_added: "bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
  shift_updated: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  shift_confirmed: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  shift_declined: "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  function_sheet_updated: "bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300",
  enquiry_converted: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  proposal_viewed: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  proposal_response: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
};

export function NotificationTypeBadge({ type }: { type: string }) {
  const label = notificationTypeLabels[type] ?? type.replaceAll("_", " ");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[type] ?? "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
      )}
    >
      {label}
    </span>
  );
}
