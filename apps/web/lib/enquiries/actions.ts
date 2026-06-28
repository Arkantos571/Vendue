"use server";

import { randomUUID } from "crypto";
import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import {
  buildEnquiryPipelineStats,
  toMockEnquiry,
  type EnquiryRowWithJoins,
} from "@/lib/enquiries/mappers";
import { parseEndTimeSelection, resolveEventTimestamps } from "@/lib/events/event-time";
import type {
  EnquiryActivityItem,
  EnquiryPipelineStats,
  EnquirySource,
  MockEnquiry,
} from "@/lib/mock/enquiries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { EnquiryPriority, EnquiryStatus, EventStatus } from "@/types";

const ENQUIRY_SELECT = `
  id, venue_id, event_name, client_name, client_email, client_phone,
  company, client_preferences, requested_date, preferred_start_time,
  preferred_end_time, event_type_id, space_id, guest_count, budget_estimate,
  estimated_value, status, source, priority, assigned_profile_id,
  last_contact_at, next_follow_up_at, proposal_notes, proposed_package,
  proposal_valid_until, proposal_title, proposal_intro, proposal_inclusions,
  proposal_terms, proposal_internal_notes, lost_reason, notes, internal_notes, activity,
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


export type EnquiryProposalInput = {
  enquiry_id: string;
  estimated_value?: number;
  proposal_title?: string | null;
  proposal_intro?: string | null;
  proposal_notes?: string | null;
  proposed_package?: string | null;
  proposal_inclusions?: string | null;
  proposal_terms?: string | null;
  proposal_internal_notes?: string | null;
  proposal_valid_until?: string | null;
  next_follow_up_date?: string | null;
};

function dateToTimestamp(date: string | null | undefined): string | null {
  if (!date?.trim()) return null;
  return `${date.trim()}T12:00:00.000Z`;
}

function appendEnquiryActivity(
  existing: unknown,
  entry: EnquiryActivityItem,
): EnquiryActivityItem[] {
  const current = Array.isArray(existing)
    ? existing.filter(
        (item): item is EnquiryActivityItem =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "title" in item,
      )
    : [];
  return [...current, entry];
}

function buildStatusActivity(
  status: EnquiryStatus,
  actorName: string,
  lostReason?: string | null,
  reopen = false,
): EnquiryActivityItem {
  const now = new Date().toISOString();
  const map: Record<
    EnquiryStatus,
    { title: string; description: string; type: EnquiryActivityItem["type"] }
  > = {
    new: {
      title: "Enquiry reopened",
      description: "Enquiry returned to the pipeline.",
      type: "reopened",
    },
    contacted: {
      title: "Marked as contacted",
      description: "Client has been contacted.",
      type: "contacted",
    },
    proposal_sent: {
      title: "Proposal sent",
      description: "Proposal marked as sent.",
      type: "proposal_sent",
    },
    confirmed: {
      title: "Enquiry confirmed",
      description: "Client confirmed the enquiry.",
      type: "confirmed",
    },
    lost: {
      title: "Marked as lost",
      description: lostReason?.trim() || "Enquiry marked as lost.",
      type: "lost",
    },
  };

  const details = reopen && status === "contacted"
    ? {
        title: "Enquiry reopened",
        description: "Enquiry returned to active follow-up.",
        type: "reopened" as const,
      }
    : map[status];

  return {
    id: randomUUID(),
    type: details.type,
    title: details.title,
    description: details.description,
    timestamp: now,
    actor: actorName,
  };
}

async function getActorName(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  userId: string,
): Promise<string> {
  const { data } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle();
  return data?.full_name?.trim() || "Team";
}

function buildProposalUpdate(input: EnquiryProposalInput) {
  const update: Record<string, unknown> = {};

  if (input.estimated_value !== undefined) {
    update.estimated_value = input.estimated_value;
  }

  if (input.proposal_title !== undefined) {
    update.proposal_title = input.proposal_title?.trim() || null;
  }
  if (input.proposal_intro !== undefined) {
    update.proposal_intro = input.proposal_intro?.trim() || null;
  }
  if (input.proposal_inclusions !== undefined) {
    update.proposal_inclusions = input.proposal_inclusions?.trim() || null;
  }
  if (input.proposal_terms !== undefined) {
    update.proposal_terms = input.proposal_terms?.trim() || null;
  }
  if (input.proposal_internal_notes !== undefined) {
    update.proposal_internal_notes = input.proposal_internal_notes?.trim() || null;
  }
  if (input.proposal_notes !== undefined) {
    update.proposal_notes = input.proposal_notes?.trim() || null;
  }
  if (input.proposed_package !== undefined) {
    update.proposed_package = input.proposed_package?.trim() || null;
  }
  if (input.proposal_valid_until !== undefined) {
    update.proposal_valid_until = input.proposal_valid_until?.trim() || null;
  }
  if (input.next_follow_up_date !== undefined) {
    update.next_follow_up_at = dateToTimestamp(input.next_follow_up_date);
  }

  return update;
}

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
  lost_reason?: string | null;
  reopen?: boolean;
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

    const { data: existing, error: loadError } = await supabase
      .from("enquiries")
      .select("id, status, activity, converted_event_id")
      .eq("id", input.enquiry_id)
      .eq("venue_id", venueId)
      .maybeSingle();

    if (loadError) {
      return { success: false, error: dbErrorMessage(loadError) };
    }

    if (!existing) {
      return { success: false, error: "Enquiry not found." };
    }

    let nextStatus = input.status;

    if (input.reopen) {
      const canReopen =
        existing.status === "lost" ||
        (existing.status === "confirmed" && !existing.converted_event_id);

      if (!canReopen) {
        return { success: false, error: "This enquiry cannot be reopened." };
      }

      nextStatus = "contacted";
    }

    const actorName = await getActorName(supabase, user.id);
    const activity = appendEnquiryActivity(
      existing.activity,
      buildStatusActivity(nextStatus, actorName, input.lost_reason, Boolean(input.reopen)),
    );

    const update: Record<string, unknown> = {
      status: nextStatus,
      activity,
    };

    if (input.set_last_contact) {
      update.last_contact_at = new Date().toISOString();
    }

    if (nextStatus === "lost" && input.lost_reason !== undefined) {
      update.lost_reason = input.lost_reason?.trim() || null;
    }

    if (input.reopen) {
      update.lost_reason = null;
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

export async function updateEnquiryProposalAction(
  input: EnquiryProposalInput,
): Promise<EnquiriesActionResult<{ enquiry: MockEnquiry }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/enquiries/${input.enquiry_id}`,
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: false, error: "Set up your venue before managing enquiries." };
    }

    const update = buildProposalUpdate(input);

    if (Object.keys(update).length === 0) {
      return { success: false, error: "No proposal details to save." };
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
    const message = error instanceof Error ? error.message : "Failed to save proposal.";
    return { success: false, error: message };
  }
}

export async function markProposalSentAction(
  input: EnquiryProposalInput,
): Promise<EnquiriesActionResult<{ enquiry: MockEnquiry }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/enquiries/${input.enquiry_id}`,
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: false, error: "Set up your venue before managing enquiries." };
    }

    const { data: existing, error: loadError } = await supabase
      .from("enquiries")
      .select("id, activity, converted_event_id, status")
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
      return { success: false, error: "Converted enquiries cannot be updated." };
    }

    const actorName = await getActorName(supabase, user.id);
    const activity = appendEnquiryActivity(
      existing.activity,
      buildStatusActivity("proposal_sent", actorName),
    );

    const update = {
      ...buildProposalUpdate(input),
      status: "proposal_sent" as EnquiryStatus,
      last_contact_at: new Date().toISOString(),
      activity,
    };

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
    const message = error instanceof Error ? error.message : "Failed to mark proposal sent.";
    return { success: false, error: message };
  }
}

export async function loadEnquiryPipelineStatsAction(): Promise<
  EnquiriesActionResult<{ pipelineStats: EnquiryPipelineStats }>
> {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      pipelineStats: buildEnquiryPipelineStats([]),
      noVenue: true,
    };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient("/sign-in?redirect=/dashboard");
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return {
        success: true,
        pipelineStats: buildEnquiryPipelineStats([]),
        noVenue: true,
      };
    }

    const enquiries = await fetchVenueEnquiries(supabase, venueId);

    return {
      success: true,
      pipelineStats: buildEnquiryPipelineStats(enquiries),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load pipeline stats.";
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
