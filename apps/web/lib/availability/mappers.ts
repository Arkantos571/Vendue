import type { UnavailabilityPeriod, UnavailabilityStatus } from "@/lib/availability/types";

export interface UnavailabilityRow {
  id: string;
  venue_id: string;
  team_member_id: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  status: UnavailabilityStatus;
  created_at: string;
  updated_at: string;
}

export function toUnavailabilityPeriod(row: UnavailabilityRow): UnavailabilityPeriod {
  return {
    id: row.id,
    venueId: row.venue_id,
    teamMemberId: row.team_member_id,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: row.start_time,
    endTime: row.end_time,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function groupUnavailabilityByTeamMember(
  rows: UnavailabilityRow[],
): Map<string, UnavailabilityPeriod[]> {
  const map = new Map<string, UnavailabilityPeriod[]>();

  for (const row of rows) {
    const period = toUnavailabilityPeriod(row);
    const list = map.get(period.teamMemberId) ?? [];
    list.push(period);
    map.set(period.teamMemberId, list);
  }

  return map;
}
