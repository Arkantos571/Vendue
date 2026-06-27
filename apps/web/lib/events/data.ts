import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import { toMockEvent, type EventRowWithJoins } from "@/lib/events/mappers";
import type { MockEvent } from "@/lib/mock/events";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const EVENT_SELECT = `
  id, title, status, starts_at, ends_at, guest_count,
  client_name, client_email, client_phone, notes,
  space_id, event_type_id,
  spaces ( name ),
  event_types ( name )
`;

export async function loadEventForPage(eventId: string): Promise<MockEvent | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { supabase, user } = await requireAuthenticatedClient(
    "/sign-in?redirect=/dashboard/events",
  );
  const venueId = await getPrimaryVenueId(supabase, user.id);

  if (!venueId) {
    return null;
  }

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("id", eventId)
    .eq("venue_id", venueId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toMockEvent(data as EventRowWithJoins);
}
