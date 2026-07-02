"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/auth/profile";
import type { DbClient } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createEmptyVenueDraft } from "@/lib/venue-setup/defaults";
import {
  isValidPublicSlug,
  normalizePublicSlug,
  slugifyVenueName,
  uniqueVenueSlug,
} from "@/lib/venue-setup/slug";
import type { VenueOnboardingDraft } from "@/types";
import type { OnboardingChecklistItem } from "@/lib/mock/dashboard";

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

  const profileResult = await ensureProfile(db, user);
  if (profileResult.error) {
    throw new Error(`Profile setup failed: ${profileResult.error}`);
  }

  return { supabase: db, user };
}

export async function loadVenueSetupAction(): Promise<VenueSetupActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: true, draft: createEmptyVenueDraft() };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient();

  const { data: membership, error: membershipError } = await supabase
    .from("venue_members")
    .select("venue_id")
    .eq("profile_id", user.id)
    .not("joined_at", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    return { success: false, error: dbErrorMessage(membershipError) };
  }

  if (!membership?.venue_id) {
    return { success: true, draft: createEmptyVenueDraft() };
  }

  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("id, name, venue_type, venue_type_custom, accent_colour, default_opening_hours, public_slug, enquiry_form_enabled")
    .eq("id", membership.venue_id)
    .maybeSingle();

  if (venueError) {
    return { success: false, error: dbErrorMessage(venueError) };
  }

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
    venue_type_custom: venue.venue_type_custom ?? "",
    accent_colour: venue.accent_colour ?? "#5c4b8a",
    default_opening_hours: venue.default_opening_hours ?? "",
    public_slug: venue.public_slug ?? slugifyVenueName(venue.name),
    enquiry_form_enabled: venue.enquiry_form_enabled ?? true,
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load venue setup.";
    return { success: false, error: message };
  }
}


async function resolvePublicSlugForSave(
  supabase: DbClient,
  venueId: string | null,
  draft: VenueOnboardingDraft,
): Promise<{ slug: string | null; error?: string }> {
  if (!draft.enquiry_form_enabled) {
    const trimmed = draft.public_slug.trim();
    return { slug: trimmed ? normalizePublicSlug(trimmed) : null };
  }

  const candidate = normalizePublicSlug(draft.public_slug.trim() || draft.name);
  if (!isValidPublicSlug(candidate)) {
    return {
      slug: null,
      error: "Public slug must use lowercase letters, numbers, and hyphens only (at least 2 characters).",
    };
  }

  let query = supabase.from("venues").select("id").eq("public_slug", candidate).limit(1);
  if (venueId) {
    query = query.neq("id", venueId);
  }

  const { data: conflict, error } = await query.maybeSingle();
  if (error) {
    return { slug: null, error: dbErrorMessage(error) };
  }

  if (conflict) {
    return { slug: null, error: "That public slug is already taken. Choose another." };
  }

  return { slug: candidate };
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

  try {
    const { supabase, user } = await requireAuthenticatedClient();

  const trimmedName = draft.name.trim();
  if (!trimmedName) {
    return { success: false, error: "Venue name is required." };
  }

  const venueTypeCustom = draft.venue_type_custom.trim();
  if (draft.venue_type === "other" && !venueTypeCustom) {
    return { success: false, error: "Enter a custom venue type." };
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
  const slugResult = await resolvePublicSlugForSave(supabase, venueId, draft);
  if (slugResult.error) {
    return { success: false, error: slugResult.error };
  }
  const publicSlug = slugResult.slug;

  if (!venueId) {
    const newVenueId = randomUUID();
    const slug = slugifyVenueName(trimmedName);
    let venueError: { message?: string; code?: string } | null = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = await supabase.from("venues").insert({
        id: newVenueId,
        name: trimmedName,
        slug: attempt === 0 ? slug : uniqueVenueSlug(trimmedName),
        venue_type: draft.venue_type,
        venue_type_custom: draft.venue_type === "other" ? venueTypeCustom : null,
        accent_colour: draft.accent_colour,
        default_opening_hours: draft.default_opening_hours.trim() || null,
        public_slug: publicSlug,
        enquiry_form_enabled: draft.enquiry_form_enabled,
      });

      venueError = result.error;

      if (!venueError) {
        break;
      }

      if (venueError.code !== "23505") {
        break;
      }
    }

    if (venueError) {
      return { success: false, error: dbErrorMessage(venueError) };
    }

    const { error: memberError } = await supabase.from("venue_members").upsert(
      {
        venue_id: newVenueId,
        profile_id: user.id,
        role: "owner",
        joined_at: new Date().toISOString(),
      },
      { onConflict: "venue_id,profile_id" },
    );

    if (memberError) {
      return { success: false, error: dbErrorMessage(memberError) };
    }

    venueId = newVenueId;
  } else {
    const { error: updateError } = await supabase
      .from("venues")
      .update({
        name: trimmedName,
        venue_type: draft.venue_type,
        venue_type_custom: draft.venue_type === "other" ? venueTypeCustom : null,
        accent_colour: draft.accent_colour,
        default_opening_hours: draft.default_opening_hours.trim() || null,
        public_slug: publicSlug,
        enquiry_form_enabled: draft.enquiry_form_enabled,
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
    draft: { ...draft, venue_id: venueId, public_slug: publicSlug ?? draft.public_slug },
    message: draft.venue_id ? "Venue setup saved." : "Venue created and setup saved.",
  };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save venue setup.";
    return { success: false, error: message };
  }
}

export type OnboardingChecklistActionResult =
  | { success: true; items: OnboardingChecklistItem[]; complete: number; total: number }
  | { success: false; error: string };

export async function loadOnboardingChecklistAction(): Promise<OnboardingChecklistActionResult> {
  if (!isSupabaseConfigured()) {
    const items = [
      {
        id: "ob-1",
        label: "Venue profile",
        description: "Name, type, and regional defaults",
        completed: false,
        href: "/dashboard/settings#venue-setup",
      },
      {
        id: "ob-2",
        label: "Spaces configured",
        description: "Rooms and areas available for events",
        completed: false,
        href: "/dashboard/settings#venue-setup",
      },
      {
        id: "ob-3",
        label: "Event types defined",
        description: "Templates for faster event creation",
        completed: false,
        href: "/dashboard/settings#venue-setup",
      },
      {
        id: "ob-4",
        label: "Team roster started",
        description: "Add staff before building rotas",
        completed: false,
        href: "/dashboard/team",
      },
    ];
    return { success: true, items, complete: 0, total: items.length };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient();

    const { data: membership, error: membershipError } = await supabase
      .from("venue_members")
      .select("venue_id")
      .eq("profile_id", user.id)
      .not("joined_at", "is", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      return { success: false, error: dbErrorMessage(membershipError) };
    }

    if (!membership?.venue_id) {
      const items = [
        {
          id: "ob-1",
          label: "Venue profile",
          description: "Name, type, and regional defaults",
          completed: false,
          href: "/dashboard/onboarding",
        },
        {
          id: "ob-2",
          label: "Spaces configured",
          description: "Rooms and areas available for events",
          completed: false,
          href: "/dashboard/onboarding",
        },
        {
          id: "ob-3",
          label: "Event types defined",
          description: "Templates for faster event creation",
          completed: false,
          href: "/dashboard/onboarding",
        },
        {
          id: "ob-4",
          label: "Team roster started",
          description: "Add staff before building rotas",
          completed: false,
          href: "/dashboard/team",
        },
      ];
      return { success: true, items, complete: 0, total: items.length };
    }

    const venueId = membership.venue_id;

    const [
      { data: venue, error: venueError },
      { count: spaceCount, error: spacesError },
      { count: eventTypeCount, error: eventTypesError },
      { count: teamCount, error: teamError },
    ] = await Promise.all([
      supabase
        .from("venues")
        .select("name, venue_type")
        .eq("id", venueId)
        .maybeSingle(),
      supabase
        .from("spaces")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId),
      supabase
        .from("event_types")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId),
      supabase
        .from("team_members")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId)
        .in("status", ["active", "invited"]),
    ]);

    if (venueError) {
      return { success: false, error: dbErrorMessage(venueError) };
    }
    if (spacesError) {
      return { success: false, error: dbErrorMessage(spacesError) };
    }
    if (eventTypesError) {
      return { success: false, error: dbErrorMessage(eventTypesError) };
    }
    if (teamError) {
      return { success: false, error: dbErrorMessage(teamError) };
    }

    const profileComplete = Boolean(venue?.name?.trim() && venue?.venue_type);
    const spacesComplete = (spaceCount ?? 0) > 0;
    const eventTypesComplete = (eventTypeCount ?? 0) > 0;
    const teamComplete = (teamCount ?? 0) > 0;

    const items: OnboardingChecklistItem[] = [
      {
        id: "ob-1",
        label: "Venue profile",
        description: "Name, type, and regional defaults",
        completed: profileComplete,
        href: "/dashboard/settings#venue-setup",
      },
      {
        id: "ob-2",
        label: "Spaces configured",
        description: "Rooms and areas available for events",
        completed: spacesComplete,
        href: "/dashboard/settings#venue-setup",
      },
      {
        id: "ob-3",
        label: "Event types defined",
        description: "Templates for faster event creation",
        completed: eventTypesComplete,
        href: "/dashboard/settings#venue-setup",
      },
      {
        id: "ob-4",
        label: "Team roster started",
        description: "Add staff before building rotas",
        completed: teamComplete,
        href: "/dashboard/team",
      },
    ];

    const complete = items.filter((item) => item.completed).length;

    return {
      success: true,
      items,
      complete,
      total: items.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load onboarding checklist.";
    return { success: false, error: message };
  }
}


