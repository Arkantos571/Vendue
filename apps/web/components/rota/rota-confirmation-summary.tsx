import { CheckCircle2, Clock, UserX, Users } from "lucide-react";
import { formatConfirmationSummary, type ShiftConfirmationSummary } from "@/lib/rota/shift-confirmation";
import { cn } from "@/lib/utils";

interface RotaConfirmationSummaryProps {
  summary: ShiftConfirmationSummary;
  className?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  tone: "default" | "success" | "warning" | "danger";
}) {
  const tones = {
    default: "border-stone-200 bg-white text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100",
    success:
      "border-emerald-200 bg-emerald-50/50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
    warning:
      "border-amber-200 bg-amber-50/50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
    danger:
      "border-red-200 bg-red-50/50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
  };

  return (
    <div className={cn("rounded-lg border p-3", tones[tone])}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide opacity-80">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function RotaConfirmationSummary({ summary, className }: RotaConfirmationSummaryProps) {
  return (
    <div className={cn("v-panel", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Shift confirmations
          </h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {formatConfirmationSummary(summary)}
            {summary.pendingCount > 0 ? ` · ${summary.pendingCount} pending` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Assigned" value={summary.totalAssigned} icon={Users} tone="default" />
        <StatCard label="Confirmed" value={summary.confirmedCount} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending" value={summary.pendingCount} icon={Clock} tone="warning" />
        <StatCard label="Declined" value={summary.declinedCount} icon={UserX} tone="danger" />
      </div>
    </div>
  );
}
