import type { Notification } from "@/src/types/database";

export interface AppNotification {
  id: string;
  venueId: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  eventId: string | null;
  shiftId: string | null;
}

function metadataString(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

export function toAppNotification(row: Notification): AppNotification {
  return {
    id: row.id,
    venueId: row.venue_id,
    type: row.type,
    title: row.title,
    body: row.body ?? "",
    createdAt: row.created_at,
    readAt: row.read_at,
    eventId: metadataString(row.metadata, "event_id"),
    shiftId: metadataString(row.metadata, "shift_id"),
  };
}
