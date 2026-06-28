"use server";

import { randomUUID } from "crypto";
import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import {
  buildEnquiryPipelineStats,
  toMockEnquiry,
  type EnquiryRowWithJoins,
} from "@/lib/enquiries/mappers";
import { parseEndTimeSelection, resolveEventTimestamps } from "@/lib/events/event-time";
import type { EnquiryPipelineStats, EnquirySource, MockEnquiry } from "@/lib/mock/enquiries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { EnquiryPriority, EnquiryStatus, EventStatus } from "@/types";

const ENQUIRY_SELECT = `
  id, venue_id, event_name, client_name, client_email, client_phone,
  company, client_preferences, requested_date, preferred_start_time,
  preferred_end_time, event_type_id, space_id, guest_count, budget_estimate,
  estimated_value, status, source, priority, assigned_profile_id,
  last_contact_at, next_follow_up_at, notes, internal_notes, activity,
  converted_event_id, converted_at, created_at,
  event_types ( name ),
  spaces ( name ),
  profiles!enquiries_assigned_profile_id_fkey ( full_name ),
  events!enquiries_converted_event_id_fkey ( id, title, status, starts_at, ends_at )
`;

export type EnquiriesActionResult<T> =
  | ({ success: true; noVenue?: boolean } & T)
  | { success: false; error: string };


export type ConvertEnquiryToEventInput = {
  enquiry_id: string;
  title: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  end_is_next_day?: boolean;
  space_id: string;
  event_type_id: string;
  guest_count: number;
  notes?: string;
  status?: EventStatus;
};

export type UpdateEnquiryInput = CreateEnquiryInput & {
  enquiry_id: string;
  status: EnquiryStatus;
};

export type CreateEnquiryInput = {
  event_name: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  requested_date: string;
  preferred_start_time?: string;
  preferred_end_time?: string;
  end_is_next_day?: boolean;
  event_type_id: string;
  space_id?: string;
  guest_count?: number;
  budget_estimate?: number;
  source: EnquirySource;
  priority: EnquiryPriority;
  notes?: string;
  status?: EnquiryStatus;
};

function dbErrorMessage(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong. Please try again.";
}

async function fetchVenueEnquiries(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  venueId: string,
): Promise<MockEnquiry[]> {
  const { data, error } = await supabase
    .from("enquiries")
    .select(ENQUIRY_SELECT)
    .eq("venue_id", venueId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as EnquiryRowWithJoins[] | null) ?? []).map(toMockEnquiry);
}

export async function loadEnquiriesAction(): Promise<
  EnquiriesActionResult<{ enquiries: MockEnquiry[]; pipelineStats: EnquiryPipelineStats }>
> {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      enquiries: [],
      pipelineStats: buildEnquiryPipelineStats([]),
      noVenue: true,
    };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard/enquiries",
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return {
        success: true,
        enquiries: [],
        pipelineStats: buildEnquiryPipelineStats([]),
        noVenue: true,
      };
    }

    const enquiries = await fetchVenueEnquiries(supabase, venueId);

    return {
      success: true,
      enquiries,
      pipelineStats: buildEnquiryPipelineStats(enquiries),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load enquiries.";
    return { success: false, error: message };
  }
}

export async function loadEnquiryFormOptionsAction(): Promise<
  EnquiriesActionResult<{
    spaces: { id: string; name: string }[];
    eventTypes: { id: string; name: string }[];
  }>
> {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      spaces: [],
      eventTypes: [],
      noVenue: true,
    };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard/enquiries/new",
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return {
        success: true,
        spaces: [],
        eventTypes: [],
        noVenue: true,
      };
    }

    const [{ data: spaces, error: spacesError }, { data: eventTypes, error: eventTypesError }] =
      await Promise.all([
        supabase
          .from("spaces")
          .select("id, name")
          .eq("venue_id", venueId)
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("event_types")
          .select("id, name")
          .eq("venue_id", venueId)
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

    if (spacesError) {
      return { success: false, error: dbErrorMessage(spacesError) };
    }

    if (eventTypesError) {
      return { success: false, error: dbErrorMessage(eventTypesError) };
    }

    return {
      success: true,
      spaces: spaces ?? [],
      eventTypes: eventTypes ?? [],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load enquiry form options.";
    return { success: false, error: message };
  }
}

export async function createEnquiryAction(
  input: CreateEnquiryInput,
): Promise<EnquiriesActionResult<{ enquiryId: string }>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard/enquiries/new",
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return {
        success: false,
        error: "Set up your venue before managing enquiries.",
      };
    }

    const eventName = input.event_name.trim();
    const clientName = input.client_name.trim();
    const clientEmail = input.client_email.trim();

    if (!eventName) {
      return { success: false, error: "Event name is required." };
    }

    if (!clientName) {
      return { success: false, error: "Client name is required." };
    }

    if (!clientEmail) {
      return { success: false, error: "Client email is required." };
    }

    if (!input.requested_date) {
      return { success: false, error: "Requested event date is required." };
    }

    if (!input.event_type_id) {
      return { success: false, error: "Event type is required." };
    }

    let preferredStartTime: string | null = null;
    let preferredEndTime: string | null = null;

    if (input.preferred_start_time && input.preferred_end_time) {
      const { time: endTime, nextDay } = parseEndTimeSelection(
        input.preferred_end_time,
        input.end_is_next_day,
      );

      preferredStartTime = input.preferred_start_time;
      preferredEndTime = endTime;

      if (
        !nextDay &&
        endTime <= input.preferred_start_time
      ) {
        return {
          success: false,
          error: "End time must be after start time, or choose a next-day end time.",
        };
      }
    } else if (input.preferred_start_time) {
      preferredStartTime = input.preferred_start_time;
    } else if (input.preferred_end_time) {
      preferredEndTime = parseEndTimeSelection(
        input.preferred_end_time,
        input.end_is_next_day,
      ).time;
    }

    const budgetEstimate =
      input.budget_estimate !== undefined && input.budget_estimate >= 0
        ? input.budget_estimate
        : null;

    const enquiryId = randomUUID();

    const { error } = await supabase.from("enquiries").insert({
      id: enquiryId,
      venue_id: venueId,
      event_name: eventName,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: input.client_phone?.trim() || null,
      requested_date: input.requested_date,
      preferred_start_time: preferredStartTime,
      preferred_end_time: preferredEndTime,
      event_type_id: input.event_type_id,
      space_id: input.space_id || null,
      guest_count: input.guest_count && input.guest_count > 0 ? input.guest_count : null,
      budget_estimate: budgetEstimate,
      estimated_value: budgetEstimate,
      status: input.status ?? "new",
      source: input.source,
      priority: input.priority,
      notes: input.notes?.trim() || null,
      activity: [],
      created_by: user.id,
    });

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, enquiryId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create enquiry.";
    return { success: false, error: message };
  }
}

export async function updateEnquiryStatusAction(input: {
  enquiry_id: string;
  status: EnquiryStatus;
  set_last_contact?: boolean;
}): Promise<EnquiriesActionResult<{ enquiry: MockEnquiry }>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase is not configured.",
    };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/enquiries/${input.enquiry_id}`,
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: false, error: "Set up your venue before managing enquiries." };
    }

    const update: {
      status: EnquiryStatus;
      last_contact_at?: string;
    } = {
      status: input.status,
    };

    if (input.set_last_contact) {
      update.last_contact_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("enquiries")
      .update(update)
      .eq("id", input.enquiry_id)
      .eq("venue_id", venueId)
      .select(ENQUIRY_SELECT)
      .maybeSingle();

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    if (!data) {
      return { success: false, error: "Enquiry not found." };
    }

    return { success: true, enquiry: toMockEnquiry(data as EnquiryRowWithJoins) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update enquiry.";
    return { success: false, error: message };
  }
}
export async function convertEnquiryToEventAction(
  input: ConvertEnquiryToEventInput,
): Promise<EnquiriesActionResult<{ eventId: string; enquiry: MockEnquiry }>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase is not configured.",
    };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/enquiries/${input.enquiry_id}`,
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: false, error: "Set up your venue before converting enquiries." };
    }

    const { data: existing, error: loadError } = await supabase
      .from("enquiries")
      .select("id, converted_event_id, status")
      .eq("id", input.enquiry_id)
      .eq("venue_id", venueId)
      .maybeSingle();

    if (loadError) {
      return { success: false, error: dbErrorMessage(loadError) };
    }

    if (!existing) {
      return { success: false, error: "Enquiry not found." };
    }

    if (existing.converted_event_id) {
      return {
        success: false,
        error: "This enquiry has already been converted to an event.",
      };
    }

    const title = input.title.trim();
    const clientName = input.client_name.trim();

    if (!title) {
      return { success: false, error: "Event name is required." };
    }

    if (!clientName) {
      return { success: false, error: "Client name is required." };
    }

    if (!input.event_date) {
      return { success: false, error: "Event date is required." };
    }

    if (!input.start_time || !input.end_time) {
      return { success: false, error: "Start and end times are required." };
    }

    if (!input.space_id) {
      return { success: false, error: "Space is required." };
    }

    if (!input.event_type_id) {
      return { success: false, error: "Event type is required." };
    }

    if (!input.guest_count || input.guest_count < 1) {
      return { success: false, error: "Guest count is required." };
    }

    const timestamps = resolveEventTimestamps(
      input.event_date,
      input.start_time,
      input.end_time,
      { endIsNextDay: input.end_is_next_day },
    );

    if ("error" in timestamps) {
      return { success: false, error: timestamps.error };
    }

    const eventId = randomUUID();
    const convertedAt = new Date().toISOString();

    const { error: insertError } = await supabase.from("events").insert({
      id: eventId,
      venue_id: venueId,
      space_id: input.space_id,
      event_type_id: input.event_type_id,
      enquiry_id: input.enquiry_id,
      title,
      status: input.status ?? "draft",
      starts_at: timestamps.startsAt,
      ends_at: timestamps.endsAt,
      guest_count: input.guest_count,
      client_name: clientName,
      client_email: input.client_email?.trim() || null,
      client_phone: input.client_phone?.trim() || null,
      notes: input.notes?.trim() || null,
      created_by: user.id,
    });

    if (insertError) {
      return { success: false, error: dbErrorMessage(insertError) };
    }

    const { data: updated, error: updateError } = await supabase
      .from("enquiries")
      .update({
        converted_event_id: eventId,
        converted_at: convertedAt,
        status: "confirmed",
      })
      .eq("id", input.enquiry_id)
      .eq("venue_id", venueId)
      .is("converted_event_id", null)
      .select(ENQUIRY_SELECT)
      .maybeSingle();

    if (updateError || !updated) {
      await supabase.from("events").delete().eq("id", eventId).eq("venue_id", venueId);

      if (updateError) {
        return { success: false, error: dbErrorMessage(updateError) };
      }

      return {
        success: false,
        error: "This enquiry was already converted by another session.",
      };
    }

    return {
      success: true,
      eventId,
      enquiry: toMockEnquiry(updated as EnquiryRowWithJoins),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to convert enquiry.";
    return { success: false, error: message };
  }
}

export async function updateEnquiryAction(
  input: UpdateEnquiryInput,
): Promise<EnquiriesActionResult<{ enquiryId: string }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/enquiries/${input.enquiry_id}/edit`,
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: false, error: "Set up your venue before managing enquiries." };
    }

    const { data: existing, error: loadError } = await supabase
      .from("enquiries")
      .select("id, converted_event_id")
      .eq("id", input.enquiry_id)
      .eq("venue_id", venueId)
      .maybeSingle();

    if (loadError) {
      return { success: false, error: dbErrorMessage(loadError) };
    }

    if (!existing) {
      return { success: false, error: "Enquiry not found." };
    }

    const eventName = input.event_name.trim();
    const clientName = input.client_name.trim();
    const clientEmail = input.client_email.trim();

    if (!eventName) {
      return { success: false, error: "Event name is required." };
    }

    if (!clientName) {
      return { success: false, error: "Client name is required." };
    }

    if (!clientEmail) {
      return { success: false, error: "Client email is required." };
    }

    if (!input.requested_date) {
      return { success: false, error: "Requested event date is required." };
    }

    if (!input.event_type_id) {
      return { success: false, error: "Event type is required." };
    }

    let preferredStartTime: string | null = null;
    let preferredEndTime: string | null = null;

    if (input.preferred_start_time && input.preferred_end_time) {
      const { time: endTime, nextDay } = parseEndTimeSelection(
        input.preferred_end_time,
        input.end_is_next_day,
      );

      preferredStartTime = input.preferred_start_time;
      preferredEndTime = endTime;

      if (!nextDay && endTime <= input.preferred_start_time) {
        return {
          success: false,
          error: "End time must be after start time, or choose a next-day end time.",
        };
      }
    } else if (input.preferred_start_time) {
      preferredStartTime = input.preferred_start_time;
    } else if (input.preferred_end_time) {
      preferredEndTime = parseEndTimeSelection(
        input.preferred_end_time,
        input.end_is_next_day,
      ).time;
    }

    const budgetEstimate =
      input.budget_estimate !== undefined && input.budget_estimate >= 0
        ? input.budget_estimate
        : null;

    const { error } = await supabase
      .from("enquiries")
      .update({
        event_name: eventName,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: input.client_phone?.trim() || null,
        requested_date: input.requested_date,
        preferred_start_time: preferredStartTime,
        preferred_end_time: preferredEndTime,
        event_type_id: input.event_type_id,
        space_id: input.space_id || null,
        guest_count: input.guest_count && input.guest_count > 0 ? input.guest_count : null,
        budget_estimate: budgetEstimate,
        estimated_value: budgetEstimate,
        status: input.status,
        source: input.source,
        priority: input.priority,
        notes: input.notes?.trim() || null,
      })
      .eq("id", input.enquiry_id)
      .eq("venue_id", venueId);

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, enquiryId: input.enquiry_id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update enquiry.";
    return { success: false, error: message };
  }
}
