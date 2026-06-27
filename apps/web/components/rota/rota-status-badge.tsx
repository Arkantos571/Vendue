import { cn } from "@/lib/utils";
import { rotaStatusLabels, type RotaStatus } from "@/lib/mock/rota";

const rotaStatusStyles: Record<RotaStatus, string> = {
  draft: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  needs_attention: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  ready_to_publish: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  published: "bg-brand-50 text-brand-700",
};

export function RotaStatusBadge({ status }: { status: RotaStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        rotaStatusStyles[status],
      )}
    >
      {rotaStatusLabels[status]}
    </span>
  );
}
