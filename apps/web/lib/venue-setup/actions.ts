"use server";

import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/auth/profile";
import type { DbClient } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createEmptyVenueDraft } from "@/lib/venue-setup/defaults";
import { slugifyVenueName, uniqueVenueSlug } from "@/lib/venue-setup/slug";
import type { VenueOnboardingDraft } from "@/types";

export type VenueSetupActionResult =
  | { success: true; draft: VenueOnboardingDraft; message?: string }
  | { success: false; error: string };

function dbErrorMessage(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong. Please try again.";
}

async function requireAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/sign-in?redirect=/dashboard/settings%23venue-setup");
  }

  const db = supabase as unknown as DbClient;

  await ensureProfile(db, user);

  return { supabase: db, user };
}

export async function loadVenueSetupAction(): Promise<VenueSetupActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: true, draft: createEmptyVenueDraft() };
  }

  const { supabase, user } = await requireAuthenticatedClient();

  const { data: membership, error: membershipError } = await supabase
    .from("venue_members")
    .select(
      `venue_id, venues (
        id, name, venue_type, accent_colour, default_opening_hours
      )`,
    )
    .eq("profile_id", user.id)
    .not("joined_at", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    return { success: false, error: dbErrorMessage(membershipError) };
  }

  const venueRelation = membership?.venues as
    | {
        id: string;
        name: string;
        venue_type: VenueOnboardingDraft["venue_type"];
        accent_colour: string | null;
        default_opening_hours: string | null;
      }
    | {
        id: string;
        name: string;
        venue_type: VenueOnboardingDraft["venue_type"];
        accent_colour: string | null;
        default_opening_hours: string | null;
      }[]
    | null
    | undefined;
  const venue = Array.isArray(venueRelation) ? venueRelation[0] : venueRelation;

  if (!venue) {
    return { success: true, draft: createEmptyVenueDraft() };
  }

  const [{ data: spaces, error: spacesError }, { data: eventTypes, error: eventTypesError }] =
    await Promise.all([
      supabase
        .from("spaces")
        .select("name, capacity, description")
        .eq("venue_id", venue.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("event_types")
        .select("name, description, default_duration_minutes")
        .eq("venue_id", venue.id)
        .order("sort_order", { ascending: true }),
    ]);

  if (spacesError) {
    return { success: false, error: dbErrorMessage(spacesError) };
  }

  if (eventTypesError) {
    return { success: false, error: dbErrorMessage(eventTypesError) };
  }

  const draft: VenueOnboardingDraft = {
    venue_id: venue.id,
    name: venue.name,
    venue_type: venue.venue_type,
    accent_colour: venue.accent_colour ?? "#5c4b8a",
    default_opening_hours: venue.default_opening_hours ?? "",
    spaces:
      spaces && spaces.length > 0
        ? spaces.map((space: { name: string; capacity: number | null; description: string | null }) => ({
            name: space.name,
            capacity: space.capacity,
            description: space.description ?? "",
          }))
        : [createEmptyVenueDraft().spaces[0]],
    event_types:
      eventTypes && eventTypes.length > 0
        ? eventTypes.map((eventType: { name: string; description: string | null; default_duration_minutes: number | null }) => ({
            name: eventType.name,
            description: eventType.description ?? "",
            default_duration_minutes: eventType.default_duration_minutes,
          }))
        : [createEmptyVenueDraft().event_types[0]],
  };

  return { success: true, draft };
}

export async function saveVenueSetupAction(
  draft: VenueOnboardingDraft,
): Promise<VenueSetupActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const { supabase, user } = await requireAuthenticatedClient();

  const trimmedName = draft.name.trim();
  if (!trimmedName) {
    return { success: false, error: "Venue name is required." };
  }

  const spaces = draft.spaces
    .map((space) => ({
      name: space.name.trim(),
      capacity: space.capacity,
      description: space.description?.trim() || null,
    }))
    .filter((space) => space.name.length > 0);

  const eventTypes = draft.event_types
    .map((eventType) => ({
      name: eventType.name.trim(),
      description: eventType.description?.trim() || null,
      default_duration_minutes: eventType.default_duration_minutes,
    }))
    .filter((eventType) => eventType.name.length > 0);

  if (spaces.length === 0) {
    return { success: false, error: "Add at least one space." };
  }

  if (eventTypes.length === 0) {
    return { success: false, error: "Add at least one event type." };
  }

  let venueId = draft.venue_id;

  if (!venueId) {
    let slug = slugifyVenueName(trimmedName);
    let venue = null;
    let venueError = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = await supabase
        .from("venues")
        .insert({
          name: trimmedName,
          slug: attempt === 0 ? slug : uniqueVenueSlug(trimmedName),
          venue_type: draft.venue_type,
          accent_colour: draft.accent_colour,
          default_opening_hours: draft.default_opening_hours.trim() || null,
        })
        .select("id")
        .single();

      venue = result.data;
      venueError = result.error;

      if (!venueError) {
        break;
      }

      if (venueError.code !== "23505") {
        break;
      }
    }

    if (venueError || !venue) {
      return { success: false, error: dbErrorMessage(venueError) };
    }

    venueId = venue.id;

    const { error: memberError } = await supabase.from("venue_members").upsert(
      {
        venue_id: venueId,
        profile_id: user.id,
        role: "owner",
        joined_at: new Date().toISOString(),
      },
      { onConflict: "venue_id,profile_id" },
    );

    if (memberError) {
      return { success: false, error: dbErrorMessage(memberError) };
    }
  } else {
    const { error: updateError } = await supabase
      .from("venues")
      .update({
        name: trimmedName,
        venue_type: draft.venue_type,
        accent_colour: draft.accent_colour,
        default_opening_hours: draft.default_opening_hours.trim() || null,
      })
      .eq("id", venueId);

    if (updateError) {
      return { success: false, error: dbErrorMessage(updateError) };
    }

    const { error: deleteSpacesError } = await supabase
      .from("spaces")
      .delete()
      .eq("venue_id", venueId);

    if (deleteSpacesError) {
      return { success: false, error: dbErrorMessage(deleteSpacesError) };
    }

    const { error: deleteEventTypesError } = await supabase
      .from("event_types")
      .delete()
      .eq("venue_id", venueId);

    if (deleteEventTypesError) {
      return { success: false, error: dbErrorMessage(deleteEventTypesError) };
    }
  }

  const { error: insertSpacesError } = await supabase.from("spaces").insert(
    spaces.map((space, index) => ({
      venue_id: venueId!,
      name: space.name,
      capacity: space.capacity,
      description: space.description,
      sort_order: index,
      is_active: true,
    })),
  );

  if (insertSpacesError) {
    return { success: false, error: dbErrorMessage(insertSpacesError) };
  }

  const { error: insertEventTypesError } = await supabase.from("event_types").insert(
    eventTypes.map((eventType, index) => ({
      venue_id: venueId!,
      name: eventType.name,
      description: eventType.description,
      default_duration_minutes: eventType.default_duration_minutes,
      colour: draft.accent_colour,
      sort_order: index,
      is_active: true,
    })),
  );

  if (insertEventTypesError) {
    return { success: false, error: dbErrorMessage(insertEventTypesError) };
  }

  return {
    success: true,
    draft: { ...draft, venue_id: venueId },
    message: draft.venue_id ? "Venue setup saved." : "Venue created and setup saved.",
  };
}
