import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <DashboardShell
      title="Settings"
      description="Venue profile, configuration, and account preferences."
    >
      <SettingsView />
    </DashboardShell>
  );
}
