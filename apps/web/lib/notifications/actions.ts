"use server";

import { requireAuthenticatedClient } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type NotificationActionResult<T> =
  | ({ success: true } & T)
  | { success: false; error: string };

function dbErrorMessage(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong. Please try again.";
}

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionResult<{ ok: true }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard/notifications",
    );

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("profile_id", user.id)
      .is("read_at", null);

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark notification read.";
    return { success: false, error: message };
  }
}

export async function markAllNotificationsReadAction(): Promise<
  NotificationActionResult<{ ok: true }>
> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard/notifications",
    );

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("profile_id", user.id)
      .is("read_at", null);

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, ok: true as const };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark notifications read.";
    return { success: false, error: message };
  }
}
