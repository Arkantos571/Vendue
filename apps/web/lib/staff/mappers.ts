import { splitDateTime } from "@/lib/events/mappers";
import { formatEventEndTime } from "@/lib/events/event-time";
import {
  decodeArrivalTime,
  finishTimeFromTimestamps,
  stripArrivalFromNotes,
} from "@/lib/rota/shift-time";
import type { StaffMemberProfile, StaffShift } from "@/lib/staff/types";
import type { RotaShiftStatus } from "@/src/types/database";

export interface StaffShiftRow {
  id: string;
  venue_id: string;
  event_id: string | null;
  team_member_id: string;
  role_label: string | null;
  section: string | null;
  starts_at: string;
  ends_at: string;
  break_minutes: number;
  status: RotaShiftStatus;
  notes: string | null;
  venues?: { name: string } | { name: string }[] | null;
  events?:
    | {
        title: string;
        starts_at: string;
        ends_at: string;
        guest_count: number | null;
        spaces?: { name: string } | { name: string }[] | null;
        event_types?: { name: string } | { name: string }[] | null;
      }
    | {
        title: string;
        starts_at: string;
        ends_at: string;
        guest_count: number | null;
        spaces?: { name: string } | { name: string }[] | null;
        event_types?: { name: string } | { name: string }[] | null;
      }[]
    | null;
}

export interface TeamMemberRow {
  id: string;
  full_name: string;
  email: string;
  venue_id: string;
  venues?: { name: string } | { name: string }[] | null;
}

function joinName<T extends { name: string }>(value: T | T[] | null | undefined): string {
  if (!value) return "—";
  return Array.isArray(value) ? (value[0]?.name ?? "—") : value.name;
}

export function toStaffMemberProfile(row: TeamMemberRow): StaffMemberProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    venueId: row.venue_id,
    venueName: joinName(row.venues),
  };
}

export function toStaffShift(row: StaffShiftRow): StaffShift {
  const event = Array.isArray(row.events) ? row.events[0] : row.events;
  const eventDate = event ? splitDateTime(event.starts_at).date : splitDateTime(row.starts_at).date;
  const start = splitDateTime(row.starts_at);
  const { finishTime, finishIsNextDay } = finishTimeFromTimestamps(
    eventDate,
    row.starts_at,
    row.ends_at,
  );
  const arrivalTime = decodeArrivalTime(row.notes, start.time);

  return {
    id: row.id,
    teamMemberId: row.team_member_id,
    eventId: row.event_id,
    eventName: event?.title ?? "Shift",
    venueId: row.venue_id,
    venueName: joinName(row.venues),
    date: eventDate,
    arrivalTime,
    startTime: start.time,
    finishTime,
    finishIsNextDay,
    role: row.role_label ?? "Staff",
    section: row.section ?? "—",
    breakMinutes: row.break_minutes,
    notes: stripArrivalFromNotes(row.notes),
    status: row.status,
    space: joinName(event?.spaces),
    eventType: joinName(event?.event_types),
    guestCount: event?.guest_count ?? null,
  };
}

export function formatStaffShiftTimeRange(shift: {
  startTime: string;
  finishTime: string;
  finishIsNextDay?: boolean;
}): string {
  const endsNextDay = shift.finishIsNextDay ?? false;
  return `${shift.startTime} – ${formatEventEndTime(shift.finishTime, endsNextDay)}`;
}

export const staffShiftStatusLabels: Record<RotaShiftStatus, string> = {
  scheduled: "Not confirmed",
  confirmed: "Confirmed",
  declined: "Declined",
  completed: "Completed",
  cancelled: "Cancelled",
};
