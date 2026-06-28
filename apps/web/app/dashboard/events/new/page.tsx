import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NewEventForm } from "@/components/events/new-event-form";

export const metadata: Metadata = {
  title: "New event",
};

export default function NewEventPage() {
  return (
    <DashboardShell
      title="New event"
      description="Create a hospitality booking."
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>
        <NewEventForm />
      </div>
    </DashboardShell>
  );
}
