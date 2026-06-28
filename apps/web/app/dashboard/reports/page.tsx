import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReportsView } from "@/components/reports/reports-view";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import { loadReportsPayload } from "@/lib/reports/data";

export const metadata: Metadata = {
  title: "Reports",
};

export default async function ReportsPage() {
  let loadError: string | null = null;

  try {
    const result = await loadReportsPayload();

    if ("noVenue" in result) {
      return (
        <DashboardShell
          title="Reports"
          description="Track event activity, enquiry pipeline, rota coverage, and labour cost."
        >
          <VenueRequiredEmptyState
            message="Set up your venue before viewing reports"
            description="Add your venue details in Settings, then return here for operational insights."
            href="/dashboard/settings"
            buttonLabel="Go to settings"
          />
        </DashboardShell>
      );
    }

    const { payload } = result;

    return (
      <DashboardShell
        title="Reports"
        description="Track event activity, enquiry pipeline, rota coverage, and labour cost."
      >
        <ReportsView payload={payload} />
      </DashboardShell>
    );
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Failed to load reports.";
  }

  return (
    <DashboardShell
      title="Reports"
      description="Track event activity, enquiry pipeline, rota coverage, and labour cost."
    >
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        {loadError}
      </div>
    </DashboardShell>
  );
}
