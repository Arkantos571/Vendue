"use server";

import { randomUUID } from "crypto";
import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import type { EmploymentType, MockTeamMember, TeamRole } from "@/lib/mock/team";
import { buildFullName, toMockTeamMember, type TeamMemberRow } from "@/lib/team/mappers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { TeamMemberStatus } from "@/types";

const TEAM_MEMBER_SELECT = `
  id, venue_id, profile_id, full_name, email, phone,
  role, job_title, department, employment_type,
  availability_status, status, hourly_rate, notes,
  created_at, updated_at
`;

export type TeamActionResult<T> =
  | ({ success: true; noVenue?: boolean } & T)
  | { success: false; error: string };

export type CreateTeamMemberInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: TeamRole;
  employment_type: EmploymentType;
  hourly_rate?: number;
  notes?: string;
  send_invite?: boolean;
};

function dbErrorMessage(error: { message?: string; code?: string } | null): string {
  if (error?.code === "23505") {
    return "A team member with this email already exists for your venue.";
  }

  return error?.message ?? "Something went wrong. Please try again.";
}

async function fetchVenueTeamMembers(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  venueId: string,
): Promise<MockTeamMember[]> {
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

export async function loadTeamMembersAction(): Promise<
  TeamActionResult<{ members: MockTeamMember[] }>
> {
  if (!isSupabaseConfigured()) {
    return { success: true, members: [], noVenue: true };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard/team",
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: true, members: [], noVenue: true };
    }

    const members = await fetchVenueTeamMembers(supabase, venueId);
    return { success: true, members };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load team members.";
    return { success: false, error: message };
  }
}

export async function loadTeamMemberAction(
  teamMemberId: string,
): Promise<TeamActionResult<{ member: MockTeamMember | null }>> {
  if (!isSupabaseConfigured()) {
    return { success: true, member: null, noVenue: true };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/team/${teamMemberId}`,
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: true, member: null, noVenue: true };
    }

    const { data, error } = await supabase
      .from("team_members")
      .select(TEAM_MEMBER_SELECT)
      .eq("id", teamMemberId)
      .eq("venue_id", venueId)
      .maybeSingle();

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    if (!data) {
      return { success: true, member: null };
    }

    return {
      success: true,
      member: toMockTeamMember(data as TeamMemberRow),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load team member.";
    return { success: false, error: message };
  }
}

export async function createTeamMemberAction(
  input: CreateTeamMemberInput,
): Promise<TeamActionResult<{ teamMemberId: string }>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      "/sign-in?redirect=/dashboard/team/new",
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return {
        success: false,
        error: "Set up your venue before adding team members.",
      };
    }

    const firstName = input.first_name.trim();
    const lastName = input.last_name.trim();
    const email = input.email.trim().toLowerCase();
    const fullName = buildFullName(firstName, lastName);

    if (!firstName) {
      return { success: false, error: "First name is required." };
    }

    if (!lastName) {
      return { success: false, error: "Last name is required." };
    }

    if (!email) {
      return { success: false, error: "Email is required." };
    }

    if (!input.role) {
      return { success: false, error: "Role is required." };
    }

    if (!input.employment_type) {
      return { success: false, error: "Employment type is required." };
    }

    const status: TeamMemberStatus = input.send_invite ? "invited" : "active";

    const teamMemberId = randomUUID();

    const { error } = await supabase.from("team_members").insert({
      id: teamMemberId,
      venue_id: venueId,
      full_name: fullName,
      email,
      phone: input.phone?.trim() || null,
      role: input.role,
      employment_type: input.employment_type,
      hourly_rate: input.hourly_rate ?? null,
      notes: input.notes?.trim() || null,
      status,
      availability_status: "available",
    });

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, teamMemberId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create team member.";
    return { success: false, error: message };
  }
}
