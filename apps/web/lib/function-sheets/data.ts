import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import { buildDefaultFunctionSheet } from "@/lib/function-sheets/defaults";
import { toFunctionSheet } from "@/lib/function-sheets/mappers";
import { buildStaffingPlanFromShifts } from "@/lib/function-sheets/staffing";
import type { MockEvent } from "@/lib/mock/events";
import type { FunctionSheet, StaffingPlanSummary } from "@/lib/mock/function-sheet";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { EventFunctionSheet, TeamRole } from "@/src/types/database";

const FUNCTION_SHEET_SELECT = `
  id, venue_id, event_id, status,
  running_order, setup, food_and_beverage, staffing_plan, checklist, internal_notes,
  created_at, updated_at
`;

const ROTA_STAFF_SELECT = `
  role_label,
  team_members ( full_name, role )
`;

interface RotaStaffRow {
  role_label: string | null;
  team_members?: { full_name: string; role: TeamRole | null } | { full_name: string; role: TeamRole | null }[] | null;
}

function joinMember(
  value: RotaStaffRow["team_members"],
): { full_name: string; role: TeamRole | null } | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export interface FunctionSheetPageData {
  functionSheet: FunctionSheet;
  staffingPlan: StaffingPlanSummary;
  isPersisted: boolean;
}

export async function loadFunctionSheetForPage(
  eventId: string,
  event: MockEvent,
): Promise<FunctionSheetPageData | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { supabase, user } = await requireAuthenticatedClient(
    `/sign-in?redirect=/dashboard/events/${eventId}`,
  );
  const venueId = await getPrimaryVenueId(supabase, user.id);

  if (!venueId) {
    return null;
  }

  const [{ data: sheetRow }, { data: shiftRows }] = await Promise.all([
    supabase
      .from("event_function_sheets")
      .select(FUNCTION_SHEET_SELECT)
      .eq("event_id", eventId)
      .eq("venue_id", venueId)
      .maybeSingle(),
    supabase
      .from("rota_shifts")
      .select(ROTA_STAFF_SELECT)
      .eq("venue_id", venueId)
      .eq("event_id", eventId)
      .order("starts_at", { ascending: true }),
  ]);

  const staffingPlan = buildStaffingPlanFromShifts(
    ((shiftRows as RotaStaffRow[] | null) ?? []).map((row) => {
      const member = joinMember(row.team_members);
      return {
        staffName: member?.full_name ?? "Unknown",
        roleLabel: row.role_label,
        teamRole: member?.role ?? null,
      };
    }),
  );

  if (sheetRow) {
    const functionSheet = toFunctionSheet(sheetRow as EventFunctionSheet);
    return {
      functionSheet: { ...functionSheet, staffingPlan },
      staffingPlan,
      isPersisted: true,
    };
  }

  return {
    functionSheet: {
      ...buildDefaultFunctionSheet(event),
      staffingPlan,
    },
    staffingPlan,
    isPersisted: false,
  };
}
