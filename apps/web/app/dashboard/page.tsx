import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  EnquiriesDashboardSection,
  OnboardingChecklistSection,
  OverviewCardsSection,
  RecentActivitySection,
  RotaGapsPreviewSection,
  UpcomingEventsTableSection,
} from "@/components/dashboard/dashboard-sections";
import {
  EnquiriesWidgetSkeleton,
  OnboardingChecklistSkeleton,
  OverviewCardsSkeleton,
  RecentActivitySkeleton,
  RotaGapsPreviewSkeleton,
  UpcomingEventsTableSkeleton,
} from "@/components/dashboard/dashboard-skeletons";

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Operations overview"
      description="Venue, events, and staffing at a glance."
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <Suspense fallback={<OverviewCardsSkeleton />}>
          <OverviewCardsSection />
        </Suspense>

        <Suspense fallback={<EnquiriesWidgetSkeleton />}>
          <EnquiriesDashboardSection />
        </Suspense>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Suspense fallback={<RecentActivitySkeleton />}>
              <RecentActivitySection />
            </Suspense>
          </div>
          <Suspense fallback={<OnboardingChecklistSkeleton />}>
            <OnboardingChecklistSection />
          </Suspense>
        </div>

        <Suspense fallback={<UpcomingEventsTableSkeleton />}>
          <UpcomingEventsTableSection />
        </Suspense>

        <Suspense fallback={<RotaGapsPreviewSkeleton />}>
          <RotaGapsPreviewSection />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
