import { formatCurrency } from "@/lib/mock/rota";
import type { ReportsKpis } from "@/lib/reports/types";

interface ReportKpiGridProps {
  kpis: ReportsKpis;
}

const cards: {
  key: keyof ReportsKpis;
  label: string;
  format: (value: number) => string;
}[] = [
  { key: "totalEvents", label: "Total events", format: (v) => String(v) },
  { key: "upcomingEvents", label: "Upcoming events", format: (v) => String(v) },
  { key: "confirmedEvents", label: "Confirmed events", format: (v) => String(v) },
  { key: "openEnquiries", label: "Open enquiries", format: (v) => String(v) },
  { key: "convertedEnquiries", label: "Converted enquiries", format: (v) => String(v) },
  { key: "teamMembers", label: "Team members", format: (v) => String(v) },
  { key: "publishedRotas", label: "Published rotas", format: (v) => String(v) },
  {
    key: "totalScheduledLabourHours",
    label: "Scheduled labour hours",
    format: (v) => `${v.toFixed(1)}h`,
  },
  {
    key: "estimatedLabourCost",
    label: "Estimated labour cost",
    format: (v) => formatCurrency(v),
  },
];

export function ReportKpiGrid({ kpis }: ReportKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ key, label, format }) => (
        <div key={key} className="v-card p-4 shadow-sm dark:bg-stone-900">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            {format(kpis[key])}
          </p>
        </div>
      ))}
    </div>
  );
}
