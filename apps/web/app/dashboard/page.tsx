import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnquiriesDashboardWidget } from "@/components/enquiries/enquiries-dashboard-widget";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RotaGapsPreview } from "@/components/dashboard/rota-gaps-preview";
import { UpcomingEventsTable } from "@/components/dashboard/upcoming-events-table";
import {
  dashboardStats,
  onboardingChecklist,
  recentActivity,
  rotaGaps,
  upcomingEvents,
} from "@/lib/mock/dashboard";
import { loadEnquiryPipelineStatsAction } from "@/lib/enquiries/actions";
import { enquiryPipelineStats as mockEnquiryPipelineStats } from "@/lib/mock/enquiries";

async function getEnquiryPipelineStats() {
  const result = await loadEnquiryPipelineStatsAction();
  if (result.success) {
    return result.pipelineStats;
  }
  return mockEnquiryPipelineStats;
}

export default async function DashboardPage() {
  const enquiryStats = await getEnquiryPipelineStats();

  return (
    <DashboardShell
      title="Operations overview"
      description="Venue, events, and staffing at a glance."
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <OverviewCards stats={dashboardStats} />

        <EnquiriesDashboardWidget stats={enquiryStats} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentActivity items={recentActivity} />
          </div>
          <OnboardingChecklist
            items={onboardingChecklist}
            complete={dashboardStats.onboardingComplete}
            total={dashboardStats.onboardingTotal}
          />
        </div>

        <UpcomingEventsTable events={upcomingEvents} />

        <RotaGapsPreview gaps={rotaGaps} />
      </div>
    </DashboardShell>
  );
}
