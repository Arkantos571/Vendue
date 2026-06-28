import { requireAuthenticatedClient } from "@/lib/auth/session";
import {
  toStaffMemberProfile,
  toStaffShift,
  type StaffShiftRow,
  type TeamMemberRow,
} from "@/lib/staff/mappers";
import type { StaffHomeData, StaffMemberProfile, StaffShift } from "@/lib/staff/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const TEAM_MEMBER_SELECT = `
  id, full_name, email, venue_id,
  venues ( name )
`;

const STAFF_SHIFT_SELECT = `
  id, venue_id, event_id, team_member_id, role_label, section,
  starts_at, ends_at, break_minutes, status, notes,
  venues ( name ),
  events (
    title, starts_at, ends_at, guest_count,
    spaces ( name ),
    event_types ( name )
  )
`;

async function loadMatchedTeamMembers(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  userId: string,
  email: string | undefined,
): Promise<StaffMemberProfile[]> {
  let query = supabase.from("team_members").select(TEAM_MEMBER_SELECT);

  if (email) {
    query = query.or(`profile_id.eq.${userId},email.ilike.${email}`);
  } else {
    query = query.eq("profile_id", userId);
  }

  const { data, error } = await query.order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as TeamMemberRow[] | null) ?? []).map(toStaffMemberProfile);
}

async function loadShiftsForTeamMembers(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  teamMemberIds: string[],
  options?: { shiftId?: string; upcomingOnly?: boolean },
): Promise<StaffShift[]> {
  if (teamMemberIds.length === 0) {
    return [];
  }

  let query = supabase
    .from("rota_shifts")
    .select(STAFF_SHIFT_SELECT)
    .in("team_member_id", teamMemberIds)
    .neq("status", "cancelled");

  if (options?.shiftId) {
    query = query.eq("id", options.shiftId);
  } else if (options?.upcomingOnly !== false) {
    query = query.gte("ends_at", new Date().toISOString());
  }

  const { data, error } = await query.order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as StaffShiftRow[] | null) ?? []).map(toStaffShift);
}

export async function loadStaffHomeData(): Promise<StaffHomeData> {
  if (!isSupabaseConfigured()) {
    return { profile: null, nextShift: null, upcomingShifts: [] };
  }

  const { supabase, user } = await requireAuthenticatedClient("/sign-in?redirect=/staff");
  const profiles = await loadMatchedTeamMembers(supabase, user.id, user.email ?? undefined);

  if (profiles.length === 0) {
    return { profile: null, nextShift: null, upcomingShifts: [] };
  }

  const teamMemberIds = profiles.map((profile) => profile.id);
  const upcomingShifts = await loadShiftsForTeamMembers(supabase, teamMemberIds);

  return {
    profile: profiles[0] ?? null,
    nextShift: upcomingShifts[0] ?? null,
    upcomingShifts,
  };
}

export async function loadStaffShiftsList(): Promise<{
  profile: StaffMemberProfile | null;
  shifts: StaffShift[];
}> {
  if (!isSupabaseConfigured()) {
    return { profile: null, shifts: [] };
  }

  const { supabase, user } = await requireAuthenticatedClient("/sign-in?redirect=/staff/shifts");
  const profiles = await loadMatchedTeamMembers(supabase, user.id, user.email ?? undefined);

  if (profiles.length === 0) {
    return { profile: null, shifts: [] };
  }

  const shifts = await loadShiftsForTeamMembers(
    supabase,
    profiles.map((profile) => profile.id),
  );

  return {
    profile: profiles[0] ?? null,
    shifts,
  };
}

export async function loadStaffShiftDetail(shiftId: string): Promise<{
  profile: StaffMemberProfile | null;
  shift: StaffShift | null;
}> {
  if (!isSupabaseConfigured()) {
    return { profile: null, shift: null };
  }

  const { supabase, user } = await requireAuthenticatedClient(
    `/sign-in?redirect=/staff/shifts/${shiftId}`,
  );
  const profiles = await loadMatchedTeamMembers(supabase, user.id, user.email ?? undefined);

  if (profiles.length === 0) {
    return { profile: null, shift: null };
  }

  const shifts = await loadShiftsForTeamMembers(
    supabase,
    profiles.map((profile) => profile.id),
    { shiftId, upcomingOnly: false },
  );

  return {
    profile: profiles[0] ?? null,
    shift: shifts[0] ?? null,
  };
}
