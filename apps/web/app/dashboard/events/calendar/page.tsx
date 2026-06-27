import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EventCalendar } from "@/components/events/calendar/event-calendar";
import { EventsViewNav } from "@/components/events/events-view-nav";

export const metadata: Metadata = {
  title: "Event Calendar",
};

export default function EventCalendarPage() {
  return (
    <DashboardShell
      title="Event Calendar"
      description="View events by day, week, and month"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <EventsViewNav />
        <EventCalendar />
      </div>
    </DashboardShell>
  );
}
