import { formatCurrency, formatCurrencyPrecise, type LabourSummary } from "@/lib/mock/rota";

interface LabourCostSummaryProps {
  summary: LabourSummary;
}

export function LabourCostSummary({ summary }: LabourCostSummaryProps) {
  const items = [
    { label: "Total scheduled hours", value: `${summary.totalScheduledHours.toFixed(1)} hrs` },
    { label: "Estimated labour cost", value: formatCurrency(summary.estimatedLabourCost) },
    { label: "Required staff", value: String(summary.requiredStaff) },
    { label: "Assigned staff", value: String(summary.assignedStaff) },
    {
      label: "Remaining gaps",
      value: String(summary.remainingGaps),
      highlight: summary.remainingGaps > 0,
    },
  ];

  return (
    <div className="v-panel">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Labour summary</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Estimated cost based on assigned shifts.
      </p>

      <dl className="mt-4 space-y-3">
        {items.map(({ label, value, highlight }) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <dt className="text-sm text-slate-600 dark:text-slate-300">{label}</dt>
            <dd
              className={
                highlight
                  ? "text-sm font-semibold text-amber-700"
                  : "text-sm font-semibold text-slate-900 dark:text-slate-100"
              }
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 rounded-lg bg-brand-50 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-700">Total estimate</p>
        <p className="mt-0.5 text-lg font-semibold text-brand-900">
          {formatCurrencyPrecise(summary.estimatedLabourCost)}
        </p>
      </div>
    </div>
  );
}
