import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { loadNotificationsForPage } from "@/lib/notifications/data";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  let notifications: Awaited<ReturnType<typeof loadNotificationsForPage>> = [];
  let loadError: string | null = null;

  try {
    notifications = await loadNotificationsForPage();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Failed to load notifications.";
  }

  return (
    <DashboardShell
      title="Notifications"
      description="Shift confirmations and venue updates"
    >
      <NotificationsList initialNotifications={notifications} loadError={loadError} />
    </DashboardShell>
  );
}
