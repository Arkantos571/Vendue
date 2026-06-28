import { requireAuthenticatedClient } from "@/lib/auth/session";
import { toAppNotification, type AppNotification } from "@/lib/notifications/mappers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Notification } from "@/src/types/database";

export async function loadNotificationsForPage(): Promise<AppNotification[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { supabase, user } = await requireAuthenticatedClient(
    "/sign-in?redirect=/dashboard/notifications",
  );

  const { data, error } = await supabase
    .from("notifications")
    .select("id, venue_id, profile_id, type, title, body, metadata, read_at, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as Notification[] | null) ?? []).map(toAppNotification);
}

export async function loadUnreadNotificationCount(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const { supabase, user } = await requireAuthenticatedClient("/sign-in");

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .is("read_at", null);

  if (error) {
    return 0;
  }

  return count ?? 0;
}
