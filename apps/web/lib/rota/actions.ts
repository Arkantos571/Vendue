"use server";

import { randomUUID } from "crypto";
import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import { queryVenueEventById, queryVenueEvents } from "@/lib/events/event-select";
import { toMockEvent, type EventRowWithJoins } from "@/lib/events/mappers";
import type { RotaBuilderData, RotaEventSummary } from "@/lib/mock/rota";
import {
  buildRotaBuilderData,
  toAssignedShift,
  toRotaEventSummary,
  type RotaShiftRow,
} from "@/lib/rota/mappers";
import { encodeArrivalInNotes, resolveShiftTimestamps } from "@/lib/rota/shift-time";
import { toMockTeamMember, type TeamMemberRow } from "@/lib/team/mappers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { rotaPublishSchemaError } from "@/lib/supabase/schema-errors";
import { canManageVenue } from "@/lib/rota/venue-access";

const ROTA_SHIFT_SELECT = `
  id, venue_id, event_id, team_member_id, role_label, section,
  starts_at, ends_at, break_minutes, status, hourly_rate, notes,
  team_members ( id, full_name, hourly_rate, availability_status, status, role )
`;

const TEAM_MEMBER_SELECT = `
  id, venue_id, profile_id, full_name, email, phone,
  role, job_title, department, employment_type,
  availability_status, status, hourly_rate, notes,
  created_at, updated_at
`;

export type RotaActionResult<T> =
  | ({ success: true; noVenue?: boolean } & T)
  | { success: false; error: string };

export type CreateRotaShiftInput = {
  event_id: string;
  team_member_id: string;
  role_label: string;
  section: string;
  arrival_time: string;
  start_time: string;
  finish_time: string;
  finish_is_next_day?: boolean;
  break_minutes: number;
  notes?: string;
};

function dbErrorMessage(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong. Please try again.";
}

async function loadVenueContext(
  redirectPath: string,
): Promise<
  | { supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"]; venueId: string }
  | { noVenue: true }
> {
  const { supabase, user } = await requireAuthenticatedClient(redirectPath);
  const venueId = await getPrimaryVenueId(supabase, user.id);

  if (!venueId) {
    return { noVenue: true };
  }

  return { supabase, venueId };
}

async function fetchEventForVenue(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  venueId: string,
  eventId: string,
) {
  const { row } = await queryVenueEventById(supabase, venueId, eventId);
  return row;
}

async function fetchShiftsForEvent(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  venueId: string,
  eventId: string,
): Promise<RotaShiftRow[]> {
  const { data, error } = await supabase
    .from("rota_shifts")
    .select(ROTA_SHIFT_SELECT)
    .eq("venue_id", venueId)
    .eq("event_id", eventId)
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as RotaShiftRow[] | null) ?? [];
}

async function fetchTeamMembers(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  venueId: string,
) {
  const { data, error } = await supabase
    .from("team_members")
    .select(TEAM_MEMBER_SELECT)
    .eq("venue_id", venueId)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as TeamMemberRow[] | null)?.map(toMockTeamMember) ?? [];
}

export async function loadRotaOverviewAction(): Promise<
  RotaActionResult<{ events: RotaEventSummary[]; migrationRequired?: boolean }>
> {
  if (!isSupabaseConfigured()) {
    return { success: true, events: [], noVenue: true };
  }

  try {
    const context = await loadVenueContext("/sign-in?redirect=/dashboard/rota");

    if (!("supabase" in context)) {
      return { success: true, events: [], noVenue: true };
    }

    const { supabase, venueId } = context;
    const nowIso = new Date().toISOString();

    const { rows: events, rotaPublishSchemaReady } = await queryVenueEvents((select) =>
      supabase
        .from("events")
        .select(select)
        .eq("venue_id", venueId)
        .gte("ends_at", nowIso)
        .order("starts_at", { ascending: true }),
    );

    if (events.length === 0) {
      return {
        success: true,
        events: [],
        migrationRequired: !rotaPublishSchemaReady,
      };
    }

    const eventIds = events.map((event) => event.id);

    const { data: shiftRows, error: shiftsError } = await supabase
      .from("rota_shifts")
      .select(ROTA_SHIFT_SELECT)
      .eq("venue_id", venueId)
      .in("event_id", eventIds);

    if (shiftsError) {
      return { success: false, error: dbErrorMessage(shiftsError) };
    }

    const shiftsByEvent = new Map<string, RotaShiftRow[]>();

    for (const shift of (shiftRows as RotaShiftRow[] | null) ?? []) {
      if (!shift.event_id) continue;
      const list = shiftsByEvent.get(shift.event_id) ?? [];
      list.push(shift);
      shiftsByEvent.set(shift.event_id, list);
    }

    const summaries = events.map((row) => {
      const event = toMockEvent(row);
      const eventShifts = (shiftsByEvent.get(event.id) ?? []).map((shift) =>
        toAssignedShift(shift, event.date),
      );
      return toRotaEventSummary(event, eventShifts);
    });

    return {
      success: true,
      events: summaries,
      migrationRequired: !rotaPublishSchemaReady,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load rota overview.";
    return { success: false, error: message };
  }
}

export async function loadRotaBuilderAction(
  eventId: string,
): Promise<RotaActionResult<{ data: RotaBuilderData | null; migrationRequired?: boolean }>> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: null, noVenue: true };
  }

  try {
    const context = await loadVenueContext(`/sign-in?redirect=/dashboard/rota/${eventId}`);

    if (!("supabase" in context)) {
      return { success: true, data: null, noVenue: true };
    }

    const { supabase, venueId } = context;
    const { row: eventRow, rotaPublishSchemaReady } = await queryVenueEventById(
      supabase,
      venueId,
      eventId,
    );

    if (!eventRow) {
      return { success: true, data: null };
    }

    const event = toMockEvent(eventRow);
    const [shiftRows, teamMembers] = await Promise.all([
      fetchShiftsForEvent(supabase, venueId, eventId),
      fetchTeamMembers(supabase, venueId),
    ]);

    const assignedShifts = shiftRows.map((shift) => toAssignedShift(shift, event.date));
    const data = buildRotaBuilderData(event, assignedShifts, teamMembers);

    return {
      success: true,
      data,
      migrationRequired: !rotaPublishSchemaReady,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load rota builder.";
    return { success: false, error: message };
  }
}

export async function createRotaShiftAction(
  input: CreateRotaShiftInput,
): Promise<RotaActionResult<{ shiftId: string }>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  try {
    const context = await loadVenueContext(
      `/sign-in?redirect=/dashboard/rota/${input.event_id}`,
    );

    if (!("supabase" in context)) {
      return { success: false, error: "Set up your venue before building rotas." };
    }

    const { supabase, venueId } = context;
    const eventRow = await fetchEventForVenue(supabase, venueId, input.event_id);

    if (!eventRow) {
      return { success: false, error: "Event not found." };
    }

    const event = toMockEvent(eventRow);

    const timestamps = resolveShiftTimestamps(
      event.date,
      input.start_time,
      input.finish_time,
      { finishIsNextDay: input.finish_is_next_day },
    );

    if ("error" in timestamps) {
      return { success: false, error: timestamps.error };
    }

    const { data: teamMember, error: memberError } = await supabase
      .from("team_members")
      .select("id, hourly_rate")
      .eq("id", input.team_member_id)
      .eq("venue_id", venueId)
      .maybeSingle();

    if (memberError || !teamMember) {
      return { success: false, error: "Team member not found." };
    }

    const hourlyRate =
      teamMember.hourly_rate !== null && teamMember.hourly_rate !== undefined
        ? Number(teamMember.hourly_rate)
        : null;

    const shiftId = randomUUID();
    const notes = encodeArrivalInNotes(
      input.arrival_time,
      input.start_time,
      input.notes?.trim() || null,
    );

    const { error } = await supabase.from("rota_shifts").insert({
      id: shiftId,
      venue_id: venueId,
      event_id: input.event_id,
      team_member_id: input.team_member_id,
      role_label: input.role_label.trim(),
      section: input.section.trim() || null,
      starts_at: timestamps.startsAt,
      ends_at: timestamps.endsAt,
      break_minutes: input.break_minutes,
      hourly_rate: hourlyRate,
      notes,
      status: "scheduled",
    });

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, shiftId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add shift.";
    return { success: false, error: message };
  }
}

export async function deleteRotaShiftAction(
  shiftId: string,
  eventId: string,
): Promise<RotaActionResult<{ ok: true }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const context = await loadVenueContext(`/sign-in?redirect=/dashboard/rota/${eventId}`);

    if (!("supabase" in context)) {
      return { success: false, error: "Set up your venue before building rotas." };
    }

    const { supabase, venueId } = context;

    const { error } = await supabase
      .from("rota_shifts")
      .delete()
      .eq("id", shiftId)
      .eq("venue_id", venueId)
      .eq("event_id", eventId);

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove shift.";
    return { success: false, error: message };
  }
}

async function assertManager(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  venueId: string,
): Promise<{ success: false; error: string } | null> {
  const allowed = await canManageVenue(supabase, venueId);
  if (!allowed) {
    return { success: false, error: "Only managers can update rota publish status." };
  }
  return null;
}

async function countActiveShifts(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  venueId: string,
  eventId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("rota_shifts")
    .select("id", { count: "exact", head: true })
    .eq("venue_id", venueId)
    .eq("event_id", eventId)
    .neq("status", "cancelled");

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function markRotaReadyAction(
  eventId: string,
): Promise<RotaActionResult<{ ok: true }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const context = await loadVenueContext(`/sign-in?redirect=/dashboard/rota/${eventId}`);
    if (!("supabase" in context)) {
      return { success: false, error: "Set up your venue before building rotas." };
    }

    const { supabase, venueId } = context;
    const denied = await assertManager(supabase, venueId);
    if (denied) return denied;

    const shiftCount = await countActiveShifts(supabase, venueId, eventId);
    if (!shiftCount) {
      return { success: false, error: "Add at least one shift before marking ready." };
    }

    const { error } = await supabase
      .from("events")
      .update({ rota_status: "ready_to_publish", rota_published_at: null })
      .eq("id", eventId)
      .eq("venue_id", venueId);

    if (error) {
      const schemaError = rotaPublishSchemaError(error);
      if (schemaError) return schemaError;
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark rota ready.";
    return { success: false, error: message };
  }
}

export async function revertRotaToDraftAction(
  eventId: string,
): Promise<RotaActionResult<{ ok: true }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const context = await loadVenueContext(`/sign-in?redirect=/dashboard/rota/${eventId}`);
    if (!("supabase" in context)) {
      return { success: false, error: "Set up your venue before building rotas." };
    }

    const { supabase, venueId } = context;
    const denied = await assertManager(supabase, venueId);
    if (denied) return denied;

    const { data: shifts, error: shiftsError } = await supabase
      .from("rota_shifts")
      .select("status")
      .eq("venue_id", venueId)
      .eq("event_id", eventId)
      .in("status", ["confirmed", "declined"]);

    if (shiftsError) {
      return { success: false, error: dbErrorMessage(shiftsError) };
    }

    if ((shifts ?? []).length > 0) {
      return {
        success: false,
        error: "Cannot unpublish after staff have confirmed or declined shifts.",
      };
    }

    const { error } = await supabase
      .from("events")
      .update({ rota_status: "draft", rota_published_at: null })
      .eq("id", eventId)
      .eq("venue_id", venueId);

    if (error) {
      const schemaError = rotaPublishSchemaError(error);
      if (schemaError) return schemaError;
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to revert rota to draft.";
    return { success: false, error: message };
  }
}

export async function publishRotaAction(
  eventId: string,
): Promise<RotaActionResult<{ ok: true; message: string }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const context = await loadVenueContext(`/sign-in?redirect=/dashboard/rota/${eventId}`);

    if (!("supabase" in context)) {
      return { success: false, error: "Set up your venue before building rotas." };
    }

    const { supabase, venueId } = context;
    const denied = await assertManager(supabase, venueId);
    if (denied) return denied;

    const shiftCount = await countActiveShifts(supabase, venueId, eventId);
    if (!shiftCount) {
      return { success: false, error: "Add at least one shift before publishing the rota." };
    }

    const now = new Date().toISOString();

    const { error: eventError } = await supabase
      .from("events")
      .update({ rota_status: "published", rota_published_at: now })
      .eq("id", eventId)
      .eq("venue_id", venueId);

    if (eventError) {
      const schemaError = rotaPublishSchemaError(eventError);
      if (schemaError) return schemaError;
      return { success: false, error: dbErrorMessage(eventError) };
    }

    const { error: notifyError } = await supabase.rpc("notify_staff_rota_published", {
      p_event_id: eventId,
    });

    if (notifyError) {
      console.error("Failed to notify staff of rota publish:", notifyError.message);
    }

    return {
      success: true,
      ok: true as const,
      message:
        "Rota published. Staff with linked accounts were notified. Email delivery will be added later.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish rota.";
    return { success: false, error: message };
  }
}
