import { cn } from "@/lib/utils";
import type { ReportCountItem } from "@/lib/reports/types";

interface CountBarListProps {
  items: ReportCountItem[];
  emptyLabel?: string;
  className?: string;
}

export function CountBarList({
  items,
  emptyLabel = "No data in this range",
  className,
}: CountBarListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="capitalize text-slate-700 dark:text-slate-300">{item.label}</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-600 dark:bg-brand-500"
              style={{ width: `${Math.max(8, (item.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
