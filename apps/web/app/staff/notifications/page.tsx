import type { Metadata } from "next";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { StaffEmptyState } from "@/components/staff/staff-empty-state";
import { StaffShell } from "@/components/staff/staff-shell";
import { loadStaffHomeData } from "@/lib/staff/data";
import { loadStaffNotificationsForPage } from "@/lib/notifications/data";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function StaffNotificationsPage() {
  const { profile } = await loadStaffHomeData();

  if (!profile) {
    return (
      <StaffShell title="Notifications" backHref="/staff">
        <StaffEmptyState
          title="No staff profile found for this email yet."
          description="Ask your venue manager to add you to the team with the same email you use to sign in."
        />
      </StaffShell>
    );
  }

  let notifications: Awaited<ReturnType<typeof loadStaffNotificationsForPage>>["notifications"] = [];
  let migrationRequired = false;
  let loadError: string | null = null;

  try {
    const result = await loadStaffNotificationsForPage();
    notifications = result.notifications;
    migrationRequired = result.migrationRequired;
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Failed to load notifications.";
  }

  return (
    <StaffShell title="Notifications" backHref="/staff">
      <NotificationsList
        initialNotifications={notifications}
        loadError={loadError}
        migrationRequired={migrationRequired}
        audience="staff"
      />
    </StaffShell>
  );
}
