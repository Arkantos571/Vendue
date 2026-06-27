import { cn } from "@/lib/utils";
import { rotaStatusLabels, type RotaStatus } from "@/lib/mock/rota";

const rotaStatusStyles: Record<RotaStatus, string> = {
  draft: "bg-stone-100 text-stone-700",
  needs_attention: "bg-amber-50 text-amber-700",
  ready_to_publish: "bg-emerald-50 text-emerald-700",
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
