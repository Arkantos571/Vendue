import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import { toMockEvent, type EventRowWithJoins } from "@/lib/events/mappers";
import type { RotaBuilderData } from "@/lib/mock/rota";
import {
  buildRotaBuilderData,
  toAssignedShift,
  type RotaShiftRow,
} from "@/lib/rota/mappers";
import { toMockTeamMember, type TeamMemberRow } from "@/lib/team/mappers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { fetchVenueUnavailabilityMap } from "@/lib/availability/data";

const EVENT_SELECT = `
  id, title, status, starts_at, ends_at, guest_count,
  client_name, client_email, client_phone, notes,
  space_id, event_type_id,
  spaces ( name ),
  event_types ( name )
`;

const ROTA_SHIFT_SELECT = `
  id, venue_id, event_id, team_member_id, role_label, section,
  starts_at, ends_at, break_minutes, status, hourly_rate, notes,
  team_members ( id, full_name, hourly_rate, availability_status, status, role )
`;

const TEAM_MEMBER_SELECT = `
  id, venue_id, profile_id, full_name, email, phone,
  role, job_title, department, employment_type,
  availability_status, status, hourly_rate, notes,
  created_at, updated_at
`;

export async function loadRotaBuilderForPage(eventId: string): Promise<RotaBuilderData | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { supabase, user } = await requireAuthenticatedClient(
    `/sign-in?redirect=/dashboard/rota/${eventId}`,
  );
  const venueId = await getPrimaryVenueId(supabase, user.id);

  if (!venueId) {
    return null;
  }

  const { data: eventRow, error: eventError } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("id", eventId)
    .eq("venue_id", venueId)
    .maybeSingle();

  if (eventError || !eventRow) {
    return null;
  }

  const event = toMockEvent(eventRow as EventRowWithJoins);

  const [{ data: shiftRows }, { data: teamRows }, unavailabilityResult] = await Promise.all([
    supabase
      .from("rota_shifts")
      .select(ROTA_SHIFT_SELECT)
      .eq("venue_id", venueId)
      .eq("event_id", eventId)
      .order("starts_at", { ascending: true }),
    supabase
      .from("team_members")
      .select(TEAM_MEMBER_SELECT)
      .eq("venue_id", venueId)
      .order("full_name", { ascending: true }),
    fetchVenueUnavailabilityMap(supabase, venueId),
  ]);

  const assignedShifts = ((shiftRows as RotaShiftRow[] | null) ?? []).map((shift) =>
    toAssignedShift(shift, event.date),
  );
  const teamMembers = ((teamRows as TeamMemberRow[] | null) ?? []).map(toMockTeamMember);

  return buildRotaBuilderData(
    event,
    assignedShifts,
    teamMembers,
    [],
    unavailabilityResult.map,
  );
}

export async function eventExistsForVenue(eventId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { supabase, user } = await requireAuthenticatedClient(
    `/sign-in?redirect=/dashboard/rota/${eventId}`,
  );
  const venueId = await getPrimaryVenueId(supabase, user.id);

  if (!venueId) {
    return false;
  }

  const { data } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("venue_id", venueId)
    .maybeSingle();

  return Boolean(data);
}
