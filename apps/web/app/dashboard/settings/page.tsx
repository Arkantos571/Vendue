import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { VenueOnboardingForm } from "@/components/onboarding/venue-onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <DashboardShell
      title="Settings"
      description="Venue profile, configuration, and account preferences."
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Profile settings will sync with Supabase Auth.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings_email">Email</Label>
              <Input id="settings_email" type="email" placeholder="you@venue.com" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings_name">Full name</Label>
              <Input id="settings_name" placeholder="Alex Morgan" disabled />
            </div>
          </CardContent>
        </Card>

        <Card id="venue-setup">
          <CardHeader>
            <CardTitle>Venue Setup</CardTitle>
            <CardDescription>
              Configure your venue, spaces, and event types. These settings change rarely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VenueOnboardingForm />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
