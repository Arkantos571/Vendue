"use server";

import { parseEndTimeSelection } from "@/lib/events/event-time";
import type { DbClient } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type PublicEnquiryActionResult<T> =
  | ({ success: true } & T)
  | { success: false; error: string };

export type PublicVenueOption = {
  id: string;
  name: string;
  publicSlug: string | null;
};

export type PublicVenueBySlug = {
  venueId: string;
  venueName: string;
  publicSlug: string;
  enquiryFormEnabled: boolean;
};

export type PublicEnquiryFormOptions = {
  venueId: string;
  venueName: string;
  spaces: { id: string; name: string }[];
  eventTypes: { id: string; name: string }[];
};

export type SubmitPublicEnquiryInput = {
  venue_id: string;
  event_name: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  requested_date: string;
  preferred_start_time?: string;
  preferred_end_time?: string;
  end_is_next_day?: boolean;
  event_type_id?: string;
  space_id?: string;
  guest_count: number;
  budget_estimate?: number;
  notes?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function dbErrorMessage(error: { message?: string } | null): string {
  const message = error?.message ?? "Something went wrong. Please try again.";
  if (message.includes("Invalid venue")) {
    return "Please choose a valid venue.";
  }
  if (message.includes("Enquiry form unavailable")) {
    return "This enquiry form is currently unavailable.";
  }
  return message;
}

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export async function loadPublicVenuesAction(): Promise<
  PublicEnquiryActionResult<{ venues: PublicVenueOption[] }>
> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Enquiry form is not available right now." };
  }

  try {
    const supabase = (await createClient()) as unknown as DbClient;
    const { data, error } = await supabase.rpc("list_public_venues");

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    return {
      success: true,
      venues: ((data ?? []) as { id: string; name: string; public_slug?: string | null }[]).map((venue) => ({
        id: venue.id,
        name: venue.name,
        publicSlug: venue.public_slug ?? null,
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load venues.";
    return { success: false, error: message };
  }
}


export async function loadPublicVenueBySlugAction(
  venueSlug: string,
): Promise<PublicEnquiryActionResult<{ venue: PublicVenueBySlug | null }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Enquiry form is not available right now." };
  }

  const slug = venueSlug.trim().toLowerCase();
  if (!slug) {
    return { success: true, venue: null };
  }

  try {
    const supabase = (await createClient()) as unknown as DbClient;
    const { data, error } = await supabase.rpc("get_public_venue_by_slug", {
      p_public_slug: slug,
    });

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { success: true, venue: null };
    }

    const payload = data as {
      venue_id: string;
      venue_name: string;
      public_slug: string;
      enquiry_form_enabled: boolean;
    };

    return {
      success: true,
      venue: {
        venueId: payload.venue_id,
        venueName: payload.venue_name,
        publicSlug: payload.public_slug,
        enquiryFormEnabled: payload.enquiry_form_enabled,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load venue.";
    return { success: false, error: message };
  }
}

export async function loadPublicEnquiryFormOptionsAction(
  venueId: string,
): Promise<PublicEnquiryActionResult<{ options: PublicEnquiryFormOptions | null }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Enquiry form is not available right now." };
  }

  if (!venueId.trim()) {
    return { success: true, options: null };
  }

  try {
    const supabase = (await createClient()) as unknown as DbClient;
    const { data, error } = await supabase.rpc("get_public_enquiry_form_options", {
      p_venue_id: venueId,
    });

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { success: true, options: null };
    }

    const payload = data as {
      venue_id: string;
      venue_name: string;
      spaces?: { id: string; name: string }[];
      event_types?: { id: string; name: string }[];
    };

    return {
      success: true,
      options: {
        venueId: payload.venue_id,
        venueName: payload.venue_name,
        spaces: payload.spaces ?? [],
        eventTypes: payload.event_types ?? [],
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load enquiry form options.";
    return { success: false, error: message };
  }
}

export async function submitPublicEnquiryAction(
  input: SubmitPublicEnquiryInput,
): Promise<PublicEnquiryActionResult<{ enquiryId: string }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Enquiry form is not available right now." };
  }

  const eventName = input.event_name.trim();
  const clientName = input.client_name.trim();
  const clientEmail = input.client_email.trim().toLowerCase();
  const venueId = input.venue_id.trim();

  if (!venueId) {
    return { success: false, error: "Please choose a venue." };
  }

  if (!eventName) {
    return { success: false, error: "Event name is required." };
  }

  if (!clientName) {
    return { success: false, error: "Client name is required." };
  }

  if (!clientEmail || !EMAIL_PATTERN.test(clientEmail)) {
    return { success: false, error: "A valid client email is required." };
  }

  if (!input.requested_date || !isValidDateString(input.requested_date)) {
    return { success: false, error: "A valid requested event date is required." };
  }

  if (!input.guest_count || input.guest_count < 1) {
    return { success: false, error: "Guest count must be at least 1." };
  }

  if (input.budget_estimate !== undefined && input.budget_estimate < 0) {
    return { success: false, error: "Budget estimate cannot be negative." };
  }

  let preferredStartTime: string | null = null;
  let preferredEndTime: string | null = null;
  let endIsNextDay = false;

  if (input.preferred_start_time && input.preferred_end_time) {
    const { time: endTime, nextDay } = parseEndTimeSelection(
      input.preferred_end_time,
      input.end_is_next_day,
    );

    preferredStartTime = input.preferred_start_time;
    preferredEndTime = endTime;
    endIsNextDay = nextDay;

    if (!nextDay && endTime <= input.preferred_start_time) {
      return {
        success: false,
        error: "End time must be after start time, or choose a next-day end time.",
      };
    }
  } else if (input.preferred_start_time) {
    preferredStartTime = input.preferred_start_time;
  } else if (input.preferred_end_time) {
    const parsed = parseEndTimeSelection(input.preferred_end_time, input.end_is_next_day);
    preferredEndTime = parsed.time;
    endIsNextDay = parsed.nextDay;
  }

  try {
    const supabase = (await createClient()) as unknown as DbClient;
    const { data, error } = await supabase.rpc("submit_public_enquiry", {
      p_venue_id: venueId,
      p_event_name: eventName,
      p_client_name: clientName,
      p_client_email: clientEmail,
      p_client_phone: input.client_phone?.trim() || null,
      p_requested_date: input.requested_date,
      p_preferred_start_time: preferredStartTime,
      p_preferred_end_time: preferredEndTime,
      p_end_is_next_day: endIsNextDay,
      p_event_type_id: input.event_type_id || null,
      p_space_id: input.space_id || null,
      p_guest_count: input.guest_count,
      p_budget_estimate:
        input.budget_estimate !== undefined && input.budget_estimate >= 0
          ? input.budget_estimate
          : null,
      p_notes: input.notes?.trim() || null,
    });

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    if (!data) {
      return { success: false, error: "Failed to submit enquiry." };
    }

    return { success: true, enquiryId: String(data) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit enquiry.";
    return { success: false, error: message };
  }
}
