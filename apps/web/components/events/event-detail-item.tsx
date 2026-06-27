import type { LucideIcon } from "lucide-react";

export function EventDetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon?: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />}
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
        <dd className="mt-1 text-sm text-stone-900">{value}</dd>
      </div>
    </div>
  );
}
