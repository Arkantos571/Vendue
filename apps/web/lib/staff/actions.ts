"use server";

import { requireAuthenticatedClient } from "@/lib/auth/session";
import { toStaffShift, type StaffShiftRow } from "@/lib/staff/mappers";
import type { StaffShift } from "@/lib/staff/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type StaffActionResult<T> =
  | ({ success: true } & T)
  | { success: false; error: string };

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

function dbErrorMessage(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong. Please try again.";
}

async function loadStaffShift(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  shiftId: string,
): Promise<StaffActionResult<{ shift: StaffShift }>> {
  const { data, error } = await supabase
    .from("rota_shifts")
    .select(STAFF_SHIFT_SELECT)
    .eq("id", shiftId)
    .maybeSingle();

  if (error) {
    return { success: false, error: dbErrorMessage(error) };
  }

  if (!data) {
    return { success: false, error: "Shift not found." };
  }

  return {
    success: true,
    shift: toStaffShift(data as StaffShiftRow),
  };
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
      .select("id, status")
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

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("rota_shifts")
      .update({
        status: "confirmed",
        confirmed_at: now,
        declined_at: null,
      })
      .eq("id", shiftId)
      .eq("status", "scheduled")
      .select(STAFF_SHIFT_SELECT)
      .maybeSingle();

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    if (!data) {
      return { success: false, error: "Unable to confirm shift." };
    }

    const { error: notifyError } = await supabase.rpc("notify_managers_shift_confirmed", {
      p_shift_id: shiftId,
    });

    if (notifyError) {
      console.error("Failed to notify managers of shift confirmation:", notifyError.message);
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

export async function declineStaffShiftAction(
  shiftId: string,
  note?: string,
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
      .select("id, status")
      .eq("id", shiftId)
      .maybeSingle();

    if (loadError) {
      return { success: false, error: dbErrorMessage(loadError) };
    }

    if (!existing) {
      return { success: false, error: "Shift not found." };
    }

    if (existing.status === "declined") {
      return { success: false, error: "This shift is already declined." };
    }

    if (existing.status !== "scheduled") {
      return { success: false, error: "This shift can no longer be declined." };
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("rota_shifts")
      .update({
        status: "declined",
        declined_at: now,
        confirmed_at: null,
        response_note: note?.trim() || null,
      })
      .eq("id", shiftId)
      .eq("status", "scheduled");

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    const { error: notifyError } = await supabase.rpc("notify_managers_shift_declined", {
      p_shift_id: shiftId,
    });

    if (notifyError) {
      console.error("Failed to notify managers of shift decline:", notifyError.message);
    }

    return loadStaffShift(supabase, shiftId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to decline shift.";
    return { success: false, error: message };
  }
}
