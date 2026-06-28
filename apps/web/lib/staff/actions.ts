"use server";

import { requireAuthenticatedClient } from "@/lib/auth/session";
import { toStaffShift, type StaffShiftRow } from "@/lib/staff/mappers";
import type { StaffShift } from "@/lib/staff/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type StaffActionResult<T> =
  | ({ success: true } & T)
  | { success: false; error: string };

function dbErrorMessage(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong. Please try again.";
}

export async function confirmStaffShiftAction(
  shiftId: string,
): Promise<StaffActionResult<{ shift: StaffShift }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const { supabase } = await requireAuthenticatedClient(
      `/sign-in?redirect=/staff/shifts/${shiftId}`,
    );

    const { data: existing, error: loadError } = await supabase
      .from("rota_shifts")
      .select("id, status, team_member_id")
      .eq("id", shiftId)
      .maybeSingle();

    if (loadError) {
      return { success: false, error: dbErrorMessage(loadError) };
    }

    if (!existing) {
      return { success: false, error: "Shift not found." };
    }

    if (existing.status === "confirmed") {
      return { success: false, error: "This shift is already confirmed." };
    }

    if (existing.status !== "scheduled") {
      return { success: false, error: "This shift can no longer be confirmed." };
    }

    const { data, error } = await supabase
      .from("rota_shifts")
      .update({ status: "confirmed" })
      .eq("id", shiftId)
      .eq("status", "scheduled")
      .select(`
        id, venue_id, event_id, team_member_id, role_label, section,
        starts_at, ends_at, break_minutes, status, notes,
        venues ( name ),
        events (
          title, starts_at, ends_at, guest_count,
          spaces ( name ),
          event_types ( name )
        )
      `)
      .maybeSingle();

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    if (!data) {
      return { success: false, error: "Unable to confirm shift." };
    }

    return {
      success: true,
      shift: toStaffShift(data as StaffShiftRow),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm shift.";
    return { success: false, error: message };
  }
}
