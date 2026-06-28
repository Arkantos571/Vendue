import type {
  ChecklistItem,
  FoodAndBeverage,
  FunctionSheet,
  InternalNotes,
  RunningOrderItem,
  SetupRequirements,
} from "@/lib/mock/function-sheet";
import type { EventFunctionSheet, Json } from "@/src/types/database";

function asObject(value: Json): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function parseRunningOrder(value: Json): RunningOrderItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items = value
    .map((item, index) => {
      const row = asObject(item);
      if (!row) {
        return null;
      }

      const sortOrder =
        typeof row.sort_order === "number" && Number.isFinite(row.sort_order)
          ? row.sort_order
          : index;

      return {
        sortOrder,
        item: {
          time: asString(row.time),
          activity: asString(row.activity),
          owner: asString(row.owner ?? row.owner_team),
          notes: row.notes == null ? null : asString(row.notes),
        },
      };
    })
    .filter((entry): entry is { sortOrder: number; item: RunningOrderItem } => entry !== null);

  return items
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((entry) => entry.item);
}

function parseSetup(value: Json): SetupRequirements {
  const row = asObject(value) ?? {};

  return {
    roomLayout: asString(row.roomLayout ?? row.room_layout),
    furniture: asString(row.furniture),
    avRequirements: asString(row.avRequirements ?? row.av_requirements),
    signage: asString(row.signage),
    cloakroom: asString(row.cloakroom),
    accessibilityNotes: asString(row.accessibilityNotes ?? row.accessibility_notes),
  };
}

function parseFoodAndBeverage(value: Json): FoodAndBeverage {
  const row = asObject(value) ?? {};

  return {
    packageMenu: asString(row.packageMenu ?? row.package_menu ?? row.menu_package),
    dietaryRequirements: asString(row.dietaryRequirements ?? row.dietary_requirements),
    barSetup: asString(row.barSetup ?? row.bar_setup),
    drinksReceptionNotes: asString(row.drinksReceptionNotes ?? row.drinks_reception_notes),
    serviceStyle: asString(row.serviceStyle ?? row.service_style),
  };
}

function parseChecklist(value: Json): ChecklistItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      const row = asObject(item);
      if (!row) {
        return null;
      }

      const label = asString(row.label);
      if (!label) {
        return null;
      }

      return {
        id: asString(row.id, `chk-${index}`),
        label,
        completed: Boolean(row.completed),
      };
    })
    .filter((item): item is ChecklistItem => item !== null);
}

function parseInternalNotes(value: Json): InternalNotes {
  const row = asObject(value) ?? {};

  return {
    managerNotes: asString(row.managerNotes ?? row.manager_notes),
    riskNotes: asString(row.riskNotes ?? row.risk_notes),
    clientPreferences: asString(row.clientPreferences ?? row.client_preferences),
  };
}

export function toFunctionSheet(row: EventFunctionSheet): FunctionSheet {
  return {
    id: row.id,
    eventId: row.event_id,
    status: row.status,
    runningOrder: parseRunningOrder(row.running_order),
    setup: parseSetup(row.setup),
    foodAndBeverage: parseFoodAndBeverage(row.food_and_beverage),
    staffingPlan: {
      managerOnDuty: null,
      supervisors: [],
      bartenders: [],
      waiters: [],
      runners: [],
      security: [],
      reception: [],
    },
    checklist: parseChecklist(row.checklist),
    internalNotes: parseInternalNotes(row.internal_notes),
  };
}

export function toFunctionSheetInsertPayload(
  functionSheet: FunctionSheet,
  venueId: string,
  eventId: string,
) {
  return {
    venue_id: venueId,
    event_id: eventId,
    status: functionSheet.status ?? "draft",
    running_order: functionSheet.runningOrder.map((item, index) => ({
      time: item.time,
      activity: item.activity,
      owner: item.owner,
      notes: item.notes,
      sort_order: index,
    })),
    setup: functionSheet.setup,
    food_and_beverage: functionSheet.foodAndBeverage,
    staffing_plan: {},
    checklist: functionSheet.checklist.map((item) => ({
      id: item.id,
      label: item.label,
      completed: item.completed,
    })),
    internal_notes: functionSheet.internalNotes,
  };
}
