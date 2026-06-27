import type { MockEvent } from "@/lib/mock/events";
import type { EventStatus } from "@/types";

export interface EventSpaceJoin {
  name: string;
}

export interface EventTypeJoin {
  name: string;
}

export interface EventRowWithJoins {
  id: string;
  title: string;
  status: EventStatus;
  starts_at: string;
  ends_at: string;
  guest_count: number | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  notes: string | null;
  space_id: string | null;
  event_type_id: string | null;
  spaces: EventSpaceJoin | EventSpaceJoin[] | null;
  event_types: EventTypeJoin | EventTypeJoin[] | null;
}

function joinName<T extends { name: string }>(value: T | T[] | null | undefined): string {
  if (!value) return "—";
  return Array.isArray(value) ? (value[0]?.name ?? "—") : value.name;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function splitDateTime(iso: string): { date: string; time: string } {
  const date = new Date(iso);
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

export function combineDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function toMockEvent(row: EventRowWithJoins): MockEvent {
  const start = splitDateTime(row.starts_at);
  const end = splitDateTime(row.ends_at);

  return {
    id: row.id,
    title: row.title,
    clientName: row.client_name ?? "—",
    clientEmail: row.client_email ?? "",
    clientPhone: row.client_phone,
    date: start.date,
    startTime: start.time,
    endTime: end.time,
    space: joinName(row.spaces),
    spaceId: row.space_id ?? "",
    eventType: joinName(row.event_types),
    eventTypeId: row.event_type_id ?? "",
    guestCount: row.guest_count ?? 0,
    status: row.status,
    notes: row.notes,
    assignedStaffCount: 0,
    requiredStaffCount: 0,
    rotaShifts: [],
  };
}
