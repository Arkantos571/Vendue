import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import { toMockEnquiry, type EnquiryRowWithJoins } from "@/lib/enquiries/mappers";
import {
  toProposalVenueSummary,
  type ProposalVenueSummary,
} from "@/lib/enquiries/proposal";
import type { MockEnquiry } from "@/lib/mock/enquiries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { VenueType } from "@/types";

const ENQUIRY_SELECT = `
  id, venue_id, event_name, client_name, client_email, client_phone,
  company, client_preferences, requested_date, preferred_start_time,
  preferred_end_time, event_type_id, space_id, guest_count, budget_estimate,
  estimated_value, status, source, priority, assigned_profile_id,
  last_contact_at, next_follow_up_at, proposal_notes, proposed_package,
  proposal_valid_until, proposal_title, proposal_intro, proposal_inclusions,
  proposal_terms, proposal_internal_notes, proposal_token, proposal_published_at,
  proposal_viewed_at, proposal_status, lost_reason, notes, internal_notes, activity,
  converted_event_id, converted_at, created_at,
  event_types ( name ),
  spaces ( name ),
  profiles!enquiries_assigned_profile_id_fkey ( full_name ),
  events!enquiries_converted_event_id_fkey ( id, title, status, starts_at, ends_at )
`;

export interface EnquiryProposalPageData {
  enquiry: MockEnquiry;
  venue: ProposalVenueSummary;
}

export async function loadEnquiryForPage(enquiryId: string): Promise<MockEnquiry | null> {
  const data = await loadEnquiryProposalForPage(enquiryId);
  return data?.enquiry ?? null;
}

export async function loadEnquiryProposalForPage(
  enquiryId: string,
): Promise<EnquiryProposalPageData | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const redirect = `/sign-in?redirect=/dashboard/enquiries/${enquiryId}/proposal`;
  const { supabase, user } = await requireAuthenticatedClient(redirect);
  const venueId = await getPrimaryVenueId(supabase, user.id);

  if (!venueId) {
    return null;
  }

  const [{ data: enquiryRow, error: enquiryError }, { data: venueRow, error: venueError }] =
    await Promise.all([
      supabase
        .from("enquiries")
        .select(ENQUIRY_SELECT)
        .eq("id", enquiryId)
        .eq("venue_id", venueId)
        .maybeSingle(),
      supabase
        .from("venues")
        .select("name, venue_type, venue_type_custom, city, accent_colour")
        .eq("id", venueId)
        .maybeSingle(),
    ]);

  if (enquiryError || venueError || !enquiryRow || !venueRow) {
    return null;
  }

  return {
    enquiry: toMockEnquiry(enquiryRow as EnquiryRowWithJoins),
    venue: toProposalVenueSummary({
      name: venueRow.name,
      venue_type: venueRow.venue_type as VenueType,
      venue_type_custom: venueRow.venue_type_custom,
      city: venueRow.city,
      accent_colour: venueRow.accent_colour,
    }),
  };
}
