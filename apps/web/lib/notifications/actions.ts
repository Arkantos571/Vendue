"use server";

import { requireAuthenticatedClient } from "@/lib/auth/session";
import { loadUnreadNotificationCount } from "@/lib/notifications/data";
import { notificationCategoryForType } from "@/lib/notifications/categories";
import type { ActivityItem } from "@/lib/mock/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type NotificationActionResult<T> =
  | ({ success: true } & T)
  | { success: false; error: string };

function dbErrorMessage(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong. Please try again.";
}

export async function loadUnreadNotificationCountAction(): Promise<
  NotificationActionResult<{ count: number }>
> {
  if (!isSupabaseConfigured()) {
    return { success: true, count: 0 };
  }

  try {
    const count = await loadUnreadNotificationCount();
    return { success: true, count };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load unread count.";
    return { success: false, error: message };
  }
}

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionResult<{ ok: true }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const { supabase } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard/notifications",
    );

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
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
    const { supabase } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard/notifications",
    );

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
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

const NOTIFICATION_ACTIVITY_SELECT =
  "id, type, title, body, metadata, created_at";

function notificationActivityType(type: string): ActivityItem["type"] {
  const category = notificationCategoryForType(type);
  if (category === "rota") return "rota";
  if (category === "staff") return "team";
  if (category === "events") return "event";
  if (category === "enquiries") return "event";
  return "onboarding";
}

function notificationActor(metadata: unknown): string {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return "Venue team";
  }

  const actor = (metadata as Record<string, unknown>).actor_name;
  return typeof actor === "string" && actor.trim() ? actor.trim() : "Venue team";
}

function toActivityItem(row: {
  id: string;
  type: string;
  title: string;
  body: string | null;
  metadata: unknown;
  created_at: string;
}): ActivityItem {
  return {
    id: row.id,
    type: notificationActivityType(row.type),
    message: row.body?.trim() || row.title,
    timestamp: row.created_at,
    actor: notificationActor(row.metadata),
  };
}

export async function loadRecentActivityAction(): Promise<
  NotificationActionResult<{ items: ActivityItem[] }>
> {
  if (!isSupabaseConfigured()) {
    return { success: true, items: [] };
  }

  try {
    const { supabase } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard",
    );

    const { data, error } = await supabase
      .from("notifications")
      .select(NOTIFICATION_ACTIVITY_SELECT)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    const items = ((data as Array<{
      id: string;
      type: string;
      title: string;
      body: string | null;
      metadata: unknown;
      created_at: string;
    }> | null) ?? []).map(toActivityItem);

    return { success: true, items };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load recent activity.";
    return { success: false, error: message };
  }
}


