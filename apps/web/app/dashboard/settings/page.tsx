import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
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
      description="Venue profile and account preferences."
    >
      <div className="mx-auto max-w-2xl space-y-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Venue</CardTitle>
            <CardDescription>Branding and regional defaults.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings_timezone">Timezone</Label>
              <Input id="settings_timezone" placeholder="Europe/London" disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
