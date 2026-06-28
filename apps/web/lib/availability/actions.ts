"use server";

import { randomUUID } from "crypto";
import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import {
  computeScheduleAvailabilityIndicator,
  isUpcomingUnavailability,
  todayDateString,
} from "@/lib/availability/overlap";
import {
  groupUnavailabilityByTeamMember,
  toUnavailabilityPeriod,
  type UnavailabilityRow,
} from "@/lib/availability/mappers";
import type {
  ScheduleAvailabilityIndicator,
  UnavailabilityInput,
  UnavailabilityPeriod,
} from "@/lib/availability/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const UNAVAILABILITY_SELECT = `
  id, venue_id, team_member_id, start_date, end_date,
  start_time, end_time, reason, status, created_at, updated_at
`;

import { UNAVAILABILITY_SCHEMA_HINT } from "@/lib/availability/constants";


export type AvailabilityActionResult<T> =
  | ({ success: true; migrationRequired?: boolean } & T)
  | { success: false; error: string };

function dbErrorMessage(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong. Please try again.";
}

function isUnavailabilitySchemaMissing(error: { message?: string } | null): boolean {
  const message = (error?.message ?? "").toLowerCase();
  return message.includes("unavailability") && message.includes("does not exist");
}

function validateUnavailabilityInput(input: UnavailabilityInput): string | null {
  if (!input.start_date || !input.end_date) {
    return "Start and end dates are required.";
  }

  if (input.end_date < input.start_date) {
    return "End date must be on or after start date.";
  }

  const hasStart = Boolean(input.start_time?.trim());
  const hasEnd = Boolean(input.end_time?.trim());

  if (hasStart !== hasEnd) {
    return "Provide both start and end times, or leave both empty for full-day unavailability.";
  }

  if (hasStart && hasEnd) {
    if (!/^\d{2}:\d{2}$/.test(input.start_time!.trim()) || !/^\d{2}:\d{2}$/.test(input.end_time!.trim())) {
      return "Times must use HH:MM format.";
    }
  }

  return null;
}

async function loadMatchedTeamMemberIds(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  userId: string,
  email: string | undefined,
): Promise<string[]> {
  let query = supabase.from("team_members").select("id");

  if (email) {
    query = query.or(`profile_id.eq.${userId},email.ilike.${email}`);
  } else {
    query = query.eq("profile_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data as { id: string }[] | null) ?? []).map((row) => row.id);
}

async function fetchVenueUnavailability(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  venueId: string,
  options?: { teamMemberId?: string; upcomingOnly?: boolean },
): Promise<{ periods: UnavailabilityPeriod[]; migrationRequired: boolean }> {
  let query = supabase
    .from("unavailability")
    .select(UNAVAILABILITY_SELECT)
    .eq("venue_id", venueId)
    .order("start_date", { ascending: true });

  if (options?.teamMemberId) {
    query = query.eq("team_member_id", options.teamMemberId);
  }

  const { data, error } = await query;

  if (error) {
    if (isUnavailabilitySchemaMissing(error)) {
      return { periods: [], migrationRequired: true };
    }
    throw new Error(error.message);
  }

  let periods = ((data as UnavailabilityRow[] | null) ?? []).map(toUnavailabilityPeriod);

  if (options?.upcomingOnly !== false) {
    const today = todayDateString();
    periods = periods.filter((period) => isUpcomingUnavailability(period, today));
  }

  return { periods, migrationRequired: false };
}

export async function loadTeamMemberUnavailabilityAction(
  teamMemberId: string,
): Promise<AvailabilityActionResult<{ periods: UnavailabilityPeriod[] }>> {
  if (!isSupabaseConfigured()) {
    return { success: true, periods: [], migrationRequired: true };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/team/${teamMemberId}`,
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: true, periods: [] };
    }

    const { periods, migrationRequired } = await fetchVenueUnavailability(supabase, venueId, {
      teamMemberId,
    });

    return { success: true, periods, migrationRequired };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load unavailability.";
    return { success: false, error: message };
  }
}

export async function loadTeamScheduleIndicatorsAction(): Promise<
  AvailabilityActionResult<{ indicators: Record<string, ScheduleAvailabilityIndicator> }>
> {
  if (!isSupabaseConfigured()) {
    return { success: true, indicators: {} };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard/team",
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: true, indicators: {} };
    }

    const { periods, migrationRequired } = await fetchVenueUnavailability(supabase, venueId);
    const grouped = groupUnavailabilityByTeamMember(
      periods.map((period) => ({
        id: period.id,
        venue_id: period.venueId,
        team_member_id: period.teamMemberId,
        start_date: period.startDate,
        end_date: period.endDate,
        start_time: period.startTime,
        end_time: period.endTime,
        reason: period.reason,
        status: period.status,
        created_at: period.createdAt,
        updated_at: period.updatedAt,
      })),
    );

    const indicators: Record<string, ScheduleAvailabilityIndicator> = {};

    for (const [teamMemberId, memberPeriods] of grouped.entries()) {
      indicators[teamMemberId] = computeScheduleAvailabilityIndicator(memberPeriods);
    }

    return { success: true, indicators, migrationRequired };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load availability.";
    return { success: false, error: message };
  }
}

export async function createManagerUnavailabilityAction(
  teamMemberId: string,
  input: UnavailabilityInput,
): Promise<AvailabilityActionResult<{ periodId: string }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: UNAVAILABILITY_SCHEMA_HINT };
  }

  const validationError = validateUnavailabilityInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/team/${teamMemberId}`,
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: false, error: "Set up your venue before managing availability." };
    }

    const periodId = randomUUID();

    const { error } = await supabase.from("unavailability").insert({
      id: periodId,
      venue_id: venueId,
      team_member_id: teamMemberId,
      start_date: input.start_date,
      end_date: input.end_date,
      start_time: input.start_time?.trim() || null,
      end_time: input.end_time?.trim() || null,
      reason: input.reason?.trim() || null,
      status: input.status ?? "approved",
    });

    if (error) {
      if (isUnavailabilitySchemaMissing(error)) {
        return { success: false, error: UNAVAILABILITY_SCHEMA_HINT };
      }
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, periodId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add unavailability.";
    return { success: false, error: message };
  }
}

export async function deleteManagerUnavailabilityAction(
  periodId: string,
  teamMemberId: string,
): Promise<AvailabilityActionResult<object>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: UNAVAILABILITY_SCHEMA_HINT };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/team/${teamMemberId}`,
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: false, error: "Set up your venue before managing availability." };
    }

    const { error } = await supabase
      .from("unavailability")
      .delete()
      .eq("id", periodId)
      .eq("venue_id", venueId)
      .eq("team_member_id", teamMemberId);

    if (error) {
      if (isUnavailabilitySchemaMissing(error)) {
        return { success: false, error: UNAVAILABILITY_SCHEMA_HINT };
      }
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete unavailability.";
    return { success: false, error: message };
  }
}

export async function loadStaffUnavailabilityAction(): Promise<
  AvailabilityActionResult<{ periods: UnavailabilityPeriod[]; teamMemberId: string | null }>
> {
  if (!isSupabaseConfigured()) {
    return { success: true, periods: [], teamMemberId: null, migrationRequired: true };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/staff/availability",
    );
    const teamMemberIds = await loadMatchedTeamMemberIds(supabase, user.id, user.email ?? undefined);

    if (teamMemberIds.length === 0) {
      return { success: true, periods: [], teamMemberId: null };
    }

    const teamMemberId = teamMemberIds[0]!;

    const { data, error } = await supabase
      .from("unavailability")
      .select(UNAVAILABILITY_SELECT)
      .eq("team_member_id", teamMemberId)
      .order("start_date", { ascending: true });

    if (error) {
      if (isUnavailabilitySchemaMissing(error)) {
        return { success: true, periods: [], teamMemberId, migrationRequired: true };
      }
      return { success: false, error: dbErrorMessage(error) };
    }

    const today = todayDateString();
    const periods = ((data as UnavailabilityRow[] | null) ?? [])
      .map(toUnavailabilityPeriod)
      .filter((period) => isUpcomingUnavailability(period, today));

    return { success: true, periods, teamMemberId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load your availability.";
    return { success: false, error: message };
  }
}

export async function createStaffUnavailabilityAction(
  input: UnavailabilityInput,
): Promise<AvailabilityActionResult<{ periodId: string }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: UNAVAILABILITY_SCHEMA_HINT };
  }

  const validationError = validateUnavailabilityInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/staff/availability",
    );
    const teamMemberIds = await loadMatchedTeamMemberIds(supabase, user.id, user.email ?? undefined);

    if (teamMemberIds.length === 0) {
      return { success: false, error: "No staff profile found for this email yet." };
    }

    const { data: member, error: memberError } = await supabase
      .from("team_members")
      .select("id, venue_id")
      .eq("id", teamMemberIds[0]!)
      .maybeSingle();

    if (memberError || !member) {
      return { success: false, error: "No staff profile found for this email yet." };
    }

    const periodId = randomUUID();

    const { error } = await supabase.from("unavailability").insert({
      id: periodId,
      venue_id: member.venue_id,
      team_member_id: member.id,
      start_date: input.start_date,
      end_date: input.end_date,
      start_time: input.start_time?.trim() || null,
      end_time: input.end_time?.trim() || null,
      reason: input.reason?.trim() || null,
      status: "pending",
    });

    if (error) {
      if (isUnavailabilitySchemaMissing(error)) {
        return { success: false, error: UNAVAILABILITY_SCHEMA_HINT };
      }
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, periodId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add unavailability.";
    return { success: false, error: message };
  }
}

export async function deleteStaffUnavailabilityAction(
  periodId: string,
): Promise<AvailabilityActionResult<object>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: UNAVAILABILITY_SCHEMA_HINT };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/staff/availability",
    );
    const teamMemberIds = await loadMatchedTeamMemberIds(supabase, user.id, user.email ?? undefined);

    if (teamMemberIds.length === 0) {
      return { success: false, error: "No staff profile found for this email yet." };
    }

    const { error } = await supabase
      .from("unavailability")
      .delete()
      .eq("id", periodId)
      .eq("team_member_id", teamMemberIds[0]!);

    if (error) {
      if (isUnavailabilitySchemaMissing(error)) {
        return { success: false, error: UNAVAILABILITY_SCHEMA_HINT };
      }
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete unavailability.";
    return { success: false, error: message };
  }
}
