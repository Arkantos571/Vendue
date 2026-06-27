"use server";

import { randomUUID } from "crypto";
import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import { resolveEventTimestamps } from "@/lib/events/event-time";
import { toMockEvent, type EventRowWithJoins } from "@/lib/events/mappers";
import type { MockEvent } from "@/lib/mock/events";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { EventStatus } from "@/types";

const EVENT_SELECT = `
  id, title, status, starts_at, ends_at, guest_count,
  client_name, client_email, client_phone, notes,
  space_id, event_type_id,
  spaces ( name ),
  event_types ( name )
`;

export type EventsActionResult<T> =
  | ({ success: true; noVenue?: boolean } & T)
  | { success: false; error: string };

export type CreateEventInput = {
  title: string;
  client_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  space_id: string;
  event_type_id: string;
  guest_count: number;
  client_email?: string;
  client_phone?: string;
  notes?: string;
  status?: EventStatus;
};

function dbErrorMessage(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong. Please try again.";
}

async function fetchVenueEvents(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  venueId: string,
): Promise<MockEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("venue_id", venueId)
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as EventRowWithJoins[] | null)?.map(toMockEvent) ?? [];
}

export async function loadEventsAction(): Promise<
  EventsActionResult<{ events: MockEvent[] }>
> {
  if (!isSupabaseConfigured()) {
    return { success: true, events: [], noVenue: true };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard/events",
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: true, events: [], noVenue: true };
    }

    const events = await fetchVenueEvents(supabase, venueId);
    return { success: true, events };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load events.";
    return { success: false, error: message };
  }
}

export async function loadEventFormOptionsAction(): Promise<
  EventsActionResult<{
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
      "/sign-in?redirect=/dashboard/events/new",
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
      error instanceof Error ? error.message : "Failed to load event form options.";
    return { success: false, error: message };
  }
}

export async function createEventAction(
  input: CreateEventInput,
): Promise<EventsActionResult<{ eventId: string }>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard/events/new",
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return {
        success: false,
        error: "Set up your venue before creating events.",
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

    if (!input.space_id || !input.event_type_id) {
      return { success: false, error: "Space and event type are required." };
    }

    if (!input.guest_count || input.guest_count < 1) {
      return { success: false, error: "Guest count is required." };
    }

    const timestamps = resolveEventTimestamps(
      input.event_date,
      input.start_time,
      input.end_time,
    );

    if ("error" in timestamps) {
      return { success: false, error: timestamps.error };
    }

    const { startsAt, endsAt } = timestamps;

    const eventId = randomUUID();

    const { error } = await supabase.from("events").insert({
      id: eventId,
      venue_id: venueId,
      space_id: input.space_id,
      event_type_id: input.event_type_id,
      title,
      status: input.status ?? "draft",
      starts_at: startsAt,
      ends_at: endsAt,
      guest_count: input.guest_count,
      client_name: clientName,
      client_email: input.client_email?.trim() || null,
      client_phone: input.client_phone?.trim() || null,
      notes: input.notes?.trim() || null,
      created_by: user.id,
    });

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, eventId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create event.";
    return { success: false, error: message };
  }
}
