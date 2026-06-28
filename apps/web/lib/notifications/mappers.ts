import type { Notification } from "@/src/types/database";

export interface AppNotification {
  id: string;
  venueId: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  eventId: string | null;
  shiftId: string | null;
  teamMemberId: string | null;
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
    message: row.body ?? "",
    createdAt: row.created_at,
    readAt: row.read_at,
    eventId: row.related_event_id ?? metadataString(row.metadata, "event_id"),
    shiftId: row.related_shift_id ?? metadataString(row.metadata, "shift_id"),
    teamMemberId:
      row.recipient_team_member_id ?? metadataString(row.metadata, "team_member_id"),
  };
}
