import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import { toMockEnquiry, type EnquiryRowWithJoins } from "@/lib/enquiries/mappers";
import type { MockEnquiry } from "@/lib/mock/enquiries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const ENQUIRY_SELECT = `
  id, venue_id, event_name, client_name, client_email, client_phone,
  company, client_preferences, requested_date, preferred_start_time,
  preferred_end_time, event_type_id, space_id, guest_count, budget_estimate,
  estimated_value, status, source, priority, assigned_profile_id,
  last_contact_at, next_follow_up_at, notes, internal_notes, activity,
  converted_event_id, created_at,
  event_types ( name ),
  spaces ( name ),
  profiles ( full_name )
`;

export async function loadEnquiryForPage(enquiryId: string): Promise<MockEnquiry | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { supabase, user } = await requireAuthenticatedClient(
    `/sign-in?redirect=/dashboard/enquiries/${enquiryId}`,
  );
  const venueId = await getPrimaryVenueId(supabase, user.id);

  if (!venueId) {
    return null;
  }

  const { data, error } = await supabase
    .from("enquiries")
    .select(ENQUIRY_SELECT)
    .eq("id", enquiryId)
    .eq("venue_id", venueId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toMockEnquiry(data as EnquiryRowWithJoins);
}
