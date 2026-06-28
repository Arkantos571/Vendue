import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import { fetchVenueUnavailabilityMap } from "@/lib/availability/data";
import { isBlockingUnavailabilityStatus } from "@/lib/availability/overlap";
import { splitDateTime } from "@/lib/events/mappers";
import type { ReportsPayload, ReportsSnapshot } from "@/lib/reports/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const EVENT_SELECT = `
  id, title, status, starts_at, rota_status,
  spaces ( name ),
  event_types ( name )
`;

const ENQUIRY_SELECT = `
  id, status, created_at, estimated_value, budget_estimate, converted_event_id,
  proposal_viewed_at, proposal_responded_at, proposal_client_response
`;

const SHIFT_SELECT = `
  id, event_id, status, starts_at, ends_at, break_minutes, hourly_rate
`;

const TEAM_SELECT = `id, role, status`;

function joinName<T extends { name: string }>(value: T | T[] | null | undefined): string {
  if (!value) return "Unknown";
  return Array.isArray(value) ? (value[0]?.name ?? "Unknown") : value.name;
}

function parseRate(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function todayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function membersUnavailableToday(
  unavailabilityMap: Awaited<ReturnType<typeof fetchVenueUnavailabilityMap>>["map"],
): string[] {
  const today = todayDateString();
  const memberIds: string[] = [];

  for (const [teamMemberId, periods] of unavailabilityMap.entries()) {
    const blocked = periods.some((period) => {
      if (!isBlockingUnavailabilityStatus(period.status)) return false;
      return today >= period.startDate && today <= period.endDate;
    });

    if (blocked) {
      memberIds.push(teamMemberId);
    }
  }

  return memberIds;
}

export async function loadReportsPayload(): Promise<
  | { noVenue: true }
  | { payload: ReportsPayload }
> {
  if (!isSupabaseConfigured()) {
    return { noVenue: true };
  }

  const { supabase, user } = await requireAuthenticatedClient(
    "/sign-in?redirect=/dashboard/reports",
  );
  const venueId = await getPrimaryVenueId(supabase, user.id);

  if (!venueId) {
    return { noVenue: true };
  }

  const [eventsResult, enquiriesResult, shiftsResult, teamResult, unavailabilityResult] =
    await Promise.all([
      supabase
        .from("events")
        .select(EVENT_SELECT)
        .eq("venue_id", venueId)
        .order("starts_at", { ascending: false }),
      supabase
        .from("enquiries")
        .select(ENQUIRY_SELECT)
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false }),
      supabase
        .from("rota_shifts")
        .select(SHIFT_SELECT)
        .eq("venue_id", venueId)
        .order("starts_at", { ascending: false }),
      supabase.from("team_members").select(TEAM_SELECT).eq("venue_id", venueId),
      fetchVenueUnavailabilityMap(supabase, venueId),
    ]);

  if (eventsResult.error) throw new Error(eventsResult.error.message);
  if (enquiriesResult.error) throw new Error(enquiriesResult.error.message);
  if (shiftsResult.error) throw new Error(shiftsResult.error.message);
  if (teamResult.error) throw new Error(teamResult.error.message);

  const snapshot: ReportsSnapshot = {
    events: (eventsResult.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      startsAt: row.starts_at,
      rotaStatus: row.rota_status ?? "draft",
      eventType: joinName(row.event_types as { name: string } | { name: string }[] | null),
      space: joinName(row.spaces as { name: string } | { name: string }[] | null),
    })),
    enquiries: (enquiriesResult.data ?? []).map((row) => ({
      id: row.id,
      status: row.status,
      createdAt: row.created_at,
      estimatedValue: parseRate(row.estimated_value ?? row.budget_estimate),
      convertedEventId: row.converted_event_id,
      proposalViewedAt: row.proposal_viewed_at,
      proposalRespondedAt: row.proposal_responded_at,
      proposalClientResponse: row.proposal_client_response,
    })),
    shifts: (shiftsResult.data ?? []).map((row) => ({
      id: row.id,
      eventId: row.event_id,
      status: row.status,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      breakMinutes: row.break_minutes ?? 0,
      hourlyRate: parseRate(row.hourly_rate),
      eventDate: splitDateTime(row.starts_at).date,
    })),
    teamMembers: (teamResult.data ?? []).map((row) => ({
      id: row.id,
      role: row.role ?? "staff",
      status: row.status,
    })),
    unavailabilityTodayMemberIds: unavailabilityResult.migrationRequired
      ? []
      : membersUnavailableToday(unavailabilityResult.map),
  };

  return {
    payload: {
      snapshot,
      defaultRange: "last_30_days",
    },
  };
}
