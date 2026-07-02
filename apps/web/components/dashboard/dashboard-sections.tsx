import { OverviewCards } from "@/components/dashboard/overview-cards";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RotaGapsPreview } from "@/components/dashboard/rota-gaps-preview";
import { UpcomingEventsTable } from "@/components/dashboard/upcoming-events-table";
import { EnquiriesDashboardWidget } from "@/components/enquiries/enquiries-dashboard-widget";
import { loadUpcomingEventsPreviewAction } from "@/lib/events/actions";
import { loadEnquiryPipelineStatsAction } from "@/lib/enquiries/actions";
import { loadRecentActivityAction } from "@/lib/notifications/actions";
import { loadRotaGapsPreviewAction } from "@/lib/rota/actions";
import { loadActiveTeamMemberCountAction } from "@/lib/team/actions";
import { loadOnboardingChecklistAction } from "@/lib/venue-setup/actions";
import {
  dashboardStats as mockDashboardStats,
  onboardingChecklist as mockOnboardingChecklist,
  recentActivity as mockRecentActivity,
  rotaGaps as mockRotaGaps,
  upcomingEvents as mockUpcomingEvents,
} from "@/lib/mock/dashboard";
import { enquiryPipelineStats as mockEnquiryPipelineStats } from "@/lib/mock/enquiries";

export async function OverviewCardsSection() {
  const [upcomingResult, rotaResult, teamResult, onboardingResult] = await Promise.all([
    loadUpcomingEventsPreviewAction(),
    loadRotaGapsPreviewAction(),
    loadActiveTeamMemberCountAction(),
    loadOnboardingChecklistAction(),
  ]);

  const stats =
    upcomingResult.success &&
    rotaResult.success &&
    teamResult.success &&
    onboardingResult.success
      ? {
          upcomingEvents: upcomingResult.totalCount,
          openRotaGaps: rotaResult.gapCount,
          teamMembers: teamResult.count,
          onboardingComplete: onboardingResult.complete,
          onboardingTotal: onboardingResult.total,
        }
      : mockDashboardStats;

  return <OverviewCards stats={stats} />;
}

export async function EnquiriesDashboardSection() {
  const result = await loadEnquiryPipelineStatsAction();
  const stats = result.success ? result.pipelineStats : mockEnquiryPipelineStats;
  return <EnquiriesDashboardWidget stats={stats} />;
}

export async function RecentActivitySection() {
  const result = await loadRecentActivityAction();
  const items = result.success ? result.items : mockRecentActivity;
  return <RecentActivity items={items} />;
}

export async function OnboardingChecklistSection() {
  const result = await loadOnboardingChecklistAction();

  if (result.success) {
    return (
      <OnboardingChecklist
        items={result.items}
        complete={result.complete}
        total={result.total}
      />
    );
  }

  return (
    <OnboardingChecklist
      items={mockOnboardingChecklist}
      complete={mockDashboardStats.onboardingComplete}
      total={mockDashboardStats.onboardingTotal}
    />
  );
}

export async function UpcomingEventsTableSection() {
  const result = await loadUpcomingEventsPreviewAction();
  const events = result.success ? result.events : mockUpcomingEvents;
  return <UpcomingEventsTable events={events} />;
}

export async function RotaGapsPreviewSection() {
  const result = await loadRotaGapsPreviewAction();
  const gaps = result.success ? result.gaps : mockRotaGaps;
  return <RotaGapsPreview gaps={gaps} />;
}
