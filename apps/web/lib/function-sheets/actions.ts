"use server";

import { randomUUID } from "crypto";
import { getPrimaryVenueId, requireAuthenticatedClient } from "@/lib/auth/session";
import {
  deriveFunctionSheetStatus,
} from "@/lib/function-sheets/defaults";
import {
  toFunctionSheet,
  toFunctionSheetInsertPayload,
} from "@/lib/function-sheets/mappers";
import type { FunctionSheet } from "@/lib/mock/function-sheet";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { EventFunctionSheet } from "@/src/types/database";

const FUNCTION_SHEET_SELECT = `
  id, venue_id, event_id, status,
  running_order, setup, food_and_beverage, staffing_plan, checklist, internal_notes,
  created_at, updated_at
`;

export type FunctionSheetActionResult<T> =
  | ({ success: true } & T)
  | { success: false; error: string };

export type SaveFunctionSheetInput = {
  event_id: string;
  function_sheet_id?: string | null;
  running_order: FunctionSheet["runningOrder"];
  setup: FunctionSheet["setup"];
  food_and_beverage: FunctionSheet["foodAndBeverage"];
  checklist: FunctionSheet["checklist"];
  internal_notes: FunctionSheet["internalNotes"];
};

function dbErrorMessage(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong. Please try again.";
}

export async function saveFunctionSheetAction(
  input: SaveFunctionSheetInput,
): Promise<FunctionSheetActionResult<{ functionSheet: FunctionSheet }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/events/${input.event_id}`,
    );
    const venueId = await getPrimaryVenueId(supabase, user.id);

    if (!venueId) {
      return { success: false, error: "Set up your venue before saving function sheets." };
    }

    const { data: eventRow, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("id", input.event_id)
      .eq("venue_id", venueId)
      .maybeSingle();

    if (eventError) {
      return { success: false, error: dbErrorMessage(eventError) };
    }

    if (!eventRow) {
      return { success: false, error: "Event not found." };
    }

    const status = deriveFunctionSheetStatus(input.checklist);
    const payload = toFunctionSheetInsertPayload(
      {
        id: input.function_sheet_id ?? null,
        eventId: input.event_id,
        status,
        runningOrder: input.running_order,
        setup: input.setup,
        foodAndBeverage: input.food_and_beverage,
        staffingPlan: {
          managerOnDuty: null,
          supervisors: [],
          bartenders: [],
          waiters: [],
          runners: [],
          security: [],
          reception: [],
        },
        checklist: input.checklist,
        internalNotes: input.internal_notes,
      },
      venueId,
      input.event_id,
    );

    if (input.function_sheet_id) {
      const { data, error } = await supabase
        .from("event_function_sheets")
        .update({
          status: payload.status,
          running_order: payload.running_order,
          setup: payload.setup,
          food_and_beverage: payload.food_and_beverage,
          staffing_plan: payload.staffing_plan,
          checklist: payload.checklist,
          internal_notes: payload.internal_notes,
        })
        .eq("id", input.function_sheet_id)
        .eq("venue_id", venueId)
        .eq("event_id", input.event_id)
        .select(FUNCTION_SHEET_SELECT)
        .maybeSingle();

      if (error) {
        return { success: false, error: dbErrorMessage(error) };
      }

      if (!data) {
        return { success: false, error: "Function sheet not found." };
      }

      return {
        success: true,
        functionSheet: toFunctionSheet(data as EventFunctionSheet),
      };
    }

    const { data: existing } = await supabase
      .from("event_function_sheets")
      .select("id")
      .eq("event_id", input.event_id)
      .eq("venue_id", venueId)
      .maybeSingle();

    if (existing?.id) {
      const { data, error } = await supabase
        .from("event_function_sheets")
        .update({
          status: payload.status,
          running_order: payload.running_order,
          setup: payload.setup,
          food_and_beverage: payload.food_and_beverage,
          staffing_plan: payload.staffing_plan,
          checklist: payload.checklist,
          internal_notes: payload.internal_notes,
        })
        .eq("id", existing.id)
        .eq("venue_id", venueId)
        .select(FUNCTION_SHEET_SELECT)
        .maybeSingle();

      if (error) {
        return { success: false, error: dbErrorMessage(error) };
      }

      if (!data) {
        return { success: false, error: "Failed to update function sheet." };
      }

      return {
        success: true,
        functionSheet: toFunctionSheet(data as EventFunctionSheet),
      };
    }

    const sheetId = randomUUID();
    const { data, error } = await supabase
      .from("event_function_sheets")
      .insert({
        id: sheetId,
        ...payload,
      })
      .select(FUNCTION_SHEET_SELECT)
      .maybeSingle();

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    if (!data) {
      return { success: false, error: "Failed to create function sheet." };
    }

    return {
      success: true,
      functionSheet: toFunctionSheet(data as EventFunctionSheet),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save function sheet.";
    return { success: false, error: message };
  }
}
