"use client";

import { useMemo, useState } from "react";
import { CountBarList } from "@/components/reports/count-bar-list";
import { ReportKpiGrid } from "@/components/reports/report-kpi-grid";
import { computeReports } from "@/lib/reports/calculations";
import {
  reportDateRangeOptions,
  resolveReportDateRange,
  type ReportDateRangeKey,
} from "@/lib/reports/date-range";
import { formatCurrency } from "@/lib/mock/rota";
import type { ReportsPayload } from "@/lib/reports/types";
import { cn } from "@/lib/utils";

interface ReportsViewProps {
  payload: ReportsPayload;
}

function ReportSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="v-card overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function ReportsView({ payload }: ReportsViewProps) {
  const [rangeKey, setRangeKey] = useState<ReportDateRangeKey>(payload.defaultRange);

  const reports = useMemo(
    () => computeReports(payload.snapshot, rangeKey),
    [payload.snapshot, rangeKey],
  );

  const activeRange = resolveReportDateRange(rangeKey);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {reportDateRangeOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setRangeKey(option.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              rangeKey === option.key
                ? "bg-brand-700 text-white"
                : "bg-white text-muted-foreground ring-1 ring-stone-200 hover:bg-slate-50   dark:ring-stone-700",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Showing data for <span className="font-medium text-foreground/90">{activeRange.label}</span>.
        Team totals reflect your current roster; events, enquiries, and shifts are filtered by date.
      </p>

      <ReportKpiGrid kpis={reports.kpis} />

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportSection
          title="Event activity"
          description="Events filtered by start date in the selected range."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground/90">By status</h3>
              <CountBarList items={reports.eventActivity.byStatus} />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground/90">By event type</h3>
              <CountBarList items={reports.eventActivity.byEventType} />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground/90">By space</h3>
              <CountBarList items={reports.eventActivity.bySpace} />
            </div>
            <div className="flex items-center justify-center rounded-xl bg-slate-50 p-6">
              <div className="text-center">
                <p className="text-3xl font-semibold text-foreground">
                  {reports.eventActivity.upcomingEventsCount}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Upcoming in range</p>
              </div>
            </div>
          </div>
        </ReportSection>

        <ReportSection
          title="Enquiry pipeline"
          description="Enquiries filtered by created date in the selected range."
        >
          <div className="mb-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Conversion rate</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {reports.enquiryPipeline.conversionRate}%
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Pipeline value</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {formatCurrency(reports.enquiryPipeline.pipelineValue)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Converted</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {reports.enquiryPipeline.convertedCount}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Proposals viewed</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {reports.enquiryPipeline.proposalsViewed}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Proposals responded</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {reports.enquiryPipeline.proposalsResponded}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Interested</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {reports.enquiryPipeline.interestedResponses}
              </p>
            </div>
          </div>
          <h3 className="mb-3 text-sm font-medium text-foreground/90">By status</h3>
          <CountBarList items={reports.enquiryPipeline.byStatus} />
        </ReportSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportSection
          title="Rota & staffing"
          description="Shift hours and labour cost use the same rota calculation logic."
        >
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total shifts</p>
              <p className="mt-1 text-2xl font-semibold">{reports.rotaStaffing.totalShifts}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Confirmed</p>
              <p className="mt-1 text-2xl font-semibold">{reports.rotaStaffing.confirmedShifts}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending</p>
              <p className="mt-1 text-2xl font-semibold">{reports.rotaStaffing.pendingShifts}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Declined</p>
              <p className="mt-1 text-2xl font-semibold">{reports.rotaStaffing.declinedShifts}</p>
            </div>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Scheduled hours</dt>
              <dd className="font-medium text-foreground">
                {reports.rotaStaffing.totalScheduledHours.toFixed(1)}h
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Estimated labour cost</dt>
              <dd className="font-medium text-foreground">
                {formatCurrency(reports.rotaStaffing.estimatedLabourCost)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Avg. labour cost per event</dt>
              <dd className="font-medium text-foreground">
                {reports.rotaStaffing.averageLabourCostPerEvent === null
                  ? "—"
                  : formatCurrency(reports.rotaStaffing.averageLabourCostPerEvent)}
              </dd>
            </div>
          </dl>
        </ReportSection>

        <ReportSection
          title="Team"
          description="Roster totals are current; unavailable today uses approved or pending unavailability."
        >
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total members</p>
              <p className="mt-1 text-2xl font-semibold">{reports.team.totalMembers}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Unavailable today</p>
              <p className="mt-1 text-2xl font-semibold">{reports.team.unavailableToday}</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground/90">By role</h3>
              <CountBarList items={reports.team.byRole} emptyLabel="No team members yet" />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground/90">By status</h3>
              <CountBarList items={reports.team.byStatus} emptyLabel="No team members yet" />
            </div>
          </div>
        </ReportSection>
      </div>
    </div>
  );
}
