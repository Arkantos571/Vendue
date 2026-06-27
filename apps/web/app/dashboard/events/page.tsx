import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Events",
};

export default function EventsPage() {
  return (
    <DashboardShell
      title="Events"
      description="Plan and manage hospitality bookings."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-600">
            Events connect to spaces, clients, and rota shifts.
          </p>
          <Button disabled>New event</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No events yet</CardTitle>
            <CardDescription>
              Complete venue setup first, then create your first event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/onboarding"
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Go to venue setup →
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
