import { requireAuthenticatedClient } from "@/lib/auth/session";
import { toAppNotification, type AppNotification } from "@/lib/notifications/mappers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Notification } from "@/src/types/database";

const NOTIFICATION_SELECT =
  "id, venue_id, profile_id, recipient_team_member_id, type, title, body, metadata, related_enquiry_id, related_event_id, related_shift_id, read_at, created_at";

function isNotificationsSchemaMissing(error: { message?: string } | null): boolean {
  const message = (error?.message ?? "").toLowerCase();
  return (
    message.includes("recipient_team_member_id") ||
    message.includes("related_event_id") ||
    message.includes("related_shift_id") ||
    message.includes("related_enquiry_id")
  ) && message.includes("does not exist");
}

const NOTIFICATION_SELECT_LEGACY =
  "id, venue_id, profile_id, type, title, body, metadata, read_at, created_at";

async function fetchNotifications(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
): Promise<{ notifications: AppNotification[]; migrationRequired: boolean }> {
  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error && isNotificationsSchemaMissing(error)) {
    const legacy = await supabase
      .from("notifications")
      .select(NOTIFICATION_SELECT_LEGACY)
      .order("created_at", { ascending: false })
      .limit(100);

    if (legacy.error) {
      throw new Error(legacy.error.message);
    }

    return {
      notifications: ((legacy.data as Notification[] | null) ?? []).map(toAppNotification),
      migrationRequired: true,
    };
  }

  if (error) {
    throw new Error(error.message);
  }

  return {
    notifications: ((data as Notification[] | null) ?? []).map(toAppNotification),
    migrationRequired: false,
  };
}

export async function loadNotificationsForPage(): Promise<{
  notifications: AppNotification[];
  migrationRequired: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { notifications: [], migrationRequired: false };
  }

  const { supabase } = await requireAuthenticatedClient(
    "/sign-in?redirect=/dashboard/notifications",
  );

  return fetchNotifications(supabase);
}

export async function loadStaffNotificationsForPage(): Promise<{
  notifications: AppNotification[];
  migrationRequired: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { notifications: [], migrationRequired: false };
  }

  const { supabase } = await requireAuthenticatedClient(
    "/sign-in?redirect=/staff/notifications",
  );

  return fetchNotifications(supabase);
}

export async function loadUnreadNotificationCount(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const { supabase } = await requireAuthenticatedClient("/sign-in");

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) {
    return 0;
  }

  return count ?? 0;
}
