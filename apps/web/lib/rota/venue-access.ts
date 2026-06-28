import type { DbClient } from "@/lib/supabase/db";

export async function canManageVenue(
  supabase: DbClient,
  venueId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("can_manage_venue", {
    p_venue_id: venueId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function canManageAnyVenue(
  supabase: DbClient,
  venueIds: string[],
): Promise<boolean> {
  const uniqueVenueIds = [...new Set(venueIds.filter(Boolean))];

  for (const venueId of uniqueVenueIds) {
    if (await canManageVenue(supabase, venueId)) {
      return true;
    }
  }

  return false;
}
