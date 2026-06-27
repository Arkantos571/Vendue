import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { VenueOnboardingForm } from "@/components/onboarding/venue-onboarding-form";

export const metadata: Metadata = {
  title: "Venue setup",
};

export default function OnboardingPage() {
  return (
    <DashboardShell
      title="Venue setup"
      description="Configure your venue, spaces, and event types."
    >
      <div className="mx-auto max-w-3xl">
        <VenueOnboardingForm />
      </div>
    </DashboardShell>
  );
}
