import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EventsList } from "@/components/events/events-list";

export const metadata: Metadata = {
  title: "Events",
};

export default function EventsPage() {
  return (
    <DashboardShell
      title="Events"
      description="Plan and manage hospitality bookings."
    >
      <div className="mx-auto max-w-7xl">
        <EventsList />
      </div>
    </DashboardShell>
  );
}
