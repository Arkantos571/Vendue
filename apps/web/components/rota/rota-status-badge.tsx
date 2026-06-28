import { cn } from "@/lib/utils";
import { rotaStatusLabels, type RotaStatus } from "@/lib/mock/rota";

const rotaStatusStyles: Record<RotaStatus, string> = {
  draft: "bg-muted text-foreground ",
  ready_to_publish: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  published: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
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
