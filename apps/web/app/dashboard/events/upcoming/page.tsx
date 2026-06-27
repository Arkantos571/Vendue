import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EventsViewNav } from "@/components/events/events-view-nav";
import { UpcomingEventsList } from "@/components/events/upcoming/upcoming-events-list";

export const metadata: Metadata = {
  title: "Upcoming Events",
};

export default function UpcomingEventsPage() {
  return (
    <DashboardShell
      title="Upcoming Events"
      description="Prioritised operational view of upcoming events"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <EventsViewNav />
        <UpcomingEventsList />
      </div>
    </DashboardShell>
  );
}
