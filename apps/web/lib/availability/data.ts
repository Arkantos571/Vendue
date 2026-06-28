import {
  groupUnavailabilityByTeamMember,
  type UnavailabilityRow,
} from "@/lib/availability/mappers";
import type { UnavailabilityPeriod } from "@/lib/availability/types";
import type { requireAuthenticatedClient } from "@/lib/auth/session";

const UNAVAILABILITY_SELECT = `
  id, venue_id, team_member_id, start_date, end_date,
  start_time, end_time, reason, status, created_at, updated_at
`;

function isUnavailabilitySchemaMissing(error: { message?: string } | null): boolean {
  const message = (error?.message ?? "").toLowerCase();
  return message.includes("unavailability") && message.includes("does not exist");
}

export async function fetchVenueUnavailabilityMap(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  venueId: string,
): Promise<{ map: Map<string, UnavailabilityPeriod[]>; migrationRequired: boolean }> {
  const { data, error } = await supabase
    .from("unavailability")
    .select(UNAVAILABILITY_SELECT)
    .eq("venue_id", venueId)
    .order("start_date", { ascending: true });

  if (error) {
    if (isUnavailabilitySchemaMissing(error)) {
      return { map: new Map(), migrationRequired: true };
    }
    throw new Error(error.message);
  }

  const map = groupUnavailabilityByTeamMember((data as UnavailabilityRow[] | null) ?? []);

  return { map, migrationRequired: false };
}
