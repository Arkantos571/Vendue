import { randomUUID } from "crypto";
import type {
  ChecklistItem,
  FoodAndBeverage,
  FunctionSheet,
  InternalNotes,
  RunningOrderItem,
  SetupRequirements,
} from "@/lib/mock/function-sheet";
import type { MockEvent } from "@/lib/mock/events";
import type { FunctionSheetStatus } from "@/src/types/database";

const defaultTimelineActivities = [
  { activity: "Room setup complete", owner: "Events team" },
  { activity: "Client arrival", owner: "Events team" },
  { activity: "Guest arrival", owner: "Reception" },
  { activity: "Drinks reception", owner: "Bar team" },
  { activity: "Food service", owner: "Kitchen / floor" },
  { activity: "Speeches", owner: "Events coordinator" },
  { activity: "Last orders", owner: "Bar team" },
  { activity: "Event close", owner: "Manager on duty" },
] as const;

const defaultChecklistLabels = [
  "Confirm final numbers",
  "Confirm dietary requirements",
  "Confirm room layout",
  "Print signage",
  "Brief team",
  "Check AV",
  "Prepare bar stock",
  "Confirm client arrival time",
] as const;

export function buildDefaultRunningOrder(event?: MockEvent): RunningOrderItem[] {
  const startTime = event?.startTime ?? "";
  const endTime = event?.endTime ?? "";

  return defaultTimelineActivities.map((item, index) => {
    let time = "";
    if (index === 0 && startTime) {
      time = startTime;
    } else if (index === defaultTimelineActivities.length - 1 && endTime) {
      time = endTime;
    }

    return {
      time,
      activity: item.activity,
      owner: item.owner,
      notes: null,
    };
  });
}

export function buildDefaultChecklist(): ChecklistItem[] {
  return defaultChecklistLabels.map((label) => ({
    id: randomUUID(),
    label,
    completed: false,
  }));
}

function emptySetup(event?: MockEvent): SetupRequirements {
  return {
    roomLayout: event ? `${event.space} — layout TBC` : "",
    furniture: "",
    avRequirements: "",
    signage: "",
    cloakroom: "",
    accessibilityNotes: "",
  };
}

function emptyFoodAndBeverage(event?: MockEvent): FoodAndBeverage {
  return {
    packageMenu: event ? `${event.eventType} — menu TBC` : "",
    dietaryRequirements: "",
    barSetup: "",
    drinksReceptionNotes: "",
    serviceStyle: "",
  };
}

function emptyInternalNotes(event?: MockEvent): InternalNotes {
  return {
    managerNotes: event?.notes ?? "",
    riskNotes: "",
    clientPreferences: "",
  };
}

export function buildDefaultFunctionSheet(event: MockEvent): FunctionSheet {
  return {
    id: null,
    eventId: event.id,
    status: "draft",
    runningOrder: buildDefaultRunningOrder(event),
    setup: emptySetup(event),
    foodAndBeverage: emptyFoodAndBeverage(event),
    staffingPlan: {
      managerOnDuty: null,
      supervisors: [],
      bartenders: [],
      waiters: [],
      runners: [],
      security: [],
      reception: [],
    },
    checklist: buildDefaultChecklist(),
    internalNotes: emptyInternalNotes(event),
  };
}

export function emptyStaffingPlan(): FunctionSheet["staffingPlan"] {
  return {
    managerOnDuty: null,
    supervisors: [],
    bartenders: [],
    waiters: [],
    runners: [],
    security: [],
    reception: [],
  };
}

export function deriveFunctionSheetStatus(checklist: ChecklistItem[]): FunctionSheetStatus {
  if (checklist.length === 0) {
    return "draft";
  }

  const completed = checklist.filter((item) => item.completed).length;
  if (completed === checklist.length) {
    return "ready";
  }

  if (completed > 0) {
    return "in_progress";
  }

  return "draft";
}
