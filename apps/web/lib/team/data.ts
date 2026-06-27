import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import type { MockTeamMember } from "@/lib/mock/team";
import { toMockTeamMember, type TeamMemberRow } from "@/lib/team/mappers";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const TEAM_MEMBER_SELECT = `
  id, venue_id, profile_id, full_name, email, phone,
  role, job_title, department, employment_type,
  availability_status, status, hourly_rate, notes,
  created_at, updated_at
`;

export async function loadTeamMemberForPage(teamMemberId: string): Promise<MockTeamMember | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { supabase, user } = await requireAuthenticatedClient(
    `/sign-in?redirect=/dashboard/team/${teamMemberId}`,
  );
  const venueId = await getPrimaryVenueId(supabase, user.id);

  if (!venueId) {
    return null;
  }

  const { data, error } = await supabase
    .from("team_members")
    .select(TEAM_MEMBER_SELECT)
    .eq("id", teamMemberId)
    .eq("venue_id", venueId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toMockTeamMember(data as TeamMemberRow);
}
