import { getEventById, mockEvents, type MockEvent } from "@/lib/mock/events";
import {
  getRotaEventSummary,
  rotaStatusLabels,
  type RotaStatus,
} from "@/lib/mock/rota";

export type CalendarViewMode = "month" | "week" | "day";

export type UpcomingFilter = "next_7_days" | "next_30_days" | "this_month" | "needs_attention";

export type FunctionSheetStatus = "draft" | "in_progress" | "ready";

export const functionSheetStatusLabels: Record<FunctionSheetStatus, string> = {
  draft: "Draft",
  in_progress: "In progress",
  ready: "Ready",
};

/** Mock "today" anchor for calendar and upcoming filters. */
export const mockToday = new Date("2026-06-27T12:00:00");

export interface CalendarEventEntry {
  event: MockEvent;
  setupTime: string | null;
}

export interface UpcomingEventOperational {
  event: MockEvent;
  rotaStatus: RotaStatus;
  functionSheetStatus: FunctionSheetStatus;
  warnings: string[];
  needsAttention: boolean;
}

const operationalMeta: Record<
  string,
  { functionSheetStatus: FunctionSheetStatus; warnings: string[] }
> = {
  "evt-1": {
    functionSheetStatus: "in_progress",
    warnings: ["Rota not complete"],
  },
  "evt-2": {
    functionSheetStatus: "in_progress",
    warnings: ["Rota not complete"],
  },
  "evt-3": {
    functionSheetStatus: "draft",
    warnings: [
      "Rota not complete",
      "Dietary requirements missing",
      "Function sheet draft",
      "Client confirmation pending",
    ],
  },
  "evt-4": {
    functionSheetStatus: "ready",
    warnings: [],
  },
  "evt-7": {
    functionSheetStatus: "ready",
    warnings: [],
  },
};

function parseDate(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function subtractHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = Math.max(0, h * 60 + m - hours * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function isUpcomingEvent(event: MockEvent): boolean {
  return event.status !== "completed" && event.status !== "cancelled";
}

export function getCalendarEvents(): MockEvent[] {
  return mockEvents.filter(isUpcomingEvent);
}

export function toCalendarEntry(event: MockEvent): CalendarEventEntry {
  const setupOffset = event.guestCount >= 100 ? 3 : event.guestCount >= 40 ? 2 : 1;
  return {
    event,
    setupTime: subtractHours(event.startTime, setupOffset),
  };
}

export function getEventsOnDate(date: string): CalendarEventEntry[] {
  return getCalendarEvents()
    .filter((event) => event.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map(toCalendarEntry);
}

export function getMonthGrid(referenceDate: Date): { date: Date; inMonth: boolean }[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return { date, inMonth: date.getMonth() === month };
  });
}

export function getWeekDates(referenceDate: Date): Date[] {
  const day = referenceDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(date);
}

export function formatWeekRange(dates: Date[]): string {
  const start = dates[0];
  const end = dates[dates.length - 1];
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(start);
  const endLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: sameMonth ? undefined : "short",
    year: "numeric",
  }).format(end);
  return `${startLabel} – ${endLabel}`;
}

export function formatDayHeading(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function buildUpcomingOperational(event: MockEvent): UpcomingEventOperational {
  const rotaSummary = getRotaEventSummary(event.id);
  const rotaStatus = rotaSummary?.rotaStatus ?? "draft";
  const meta = operationalMeta[event.id] ?? {
    functionSheetStatus: event.status === "draft" ? "draft" : "in_progress",
    warnings:
      event.assignedStaffCount < event.requiredStaffCount ? ["Rota not complete"] : [],
  };

  const warnings = [...meta.warnings];
  if (event.status === "draft" && !warnings.includes("Client confirmation pending")) {
    warnings.push("Client confirmation pending");
  }

  return {
    event,
    rotaStatus,
    functionSheetStatus: meta.functionSheetStatus,
    warnings,
    needsAttention:
      warnings.length > 0 ||
      rotaStatus === "draft" ||
      (rotaSummary?.pendingConfirmationCount ?? 0) > 0,
  };
}

function daysBetween(from: Date, to: Date): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function isWithinDays(event: MockEvent, days: number, from: Date = mockToday): boolean {
  const eventDate = parseDate(event.date);
  const diff = daysBetween(from, eventDate);
  return diff >= 0 && diff <= days;
}

function isThisMonth(event: MockEvent, reference: Date = mockToday): boolean {
  const eventDate = parseDate(event.date);
  return (
    eventDate.getFullYear() === reference.getFullYear() &&
    eventDate.getMonth() === reference.getMonth()
  );
}

export function getUpcomingOperationalEvents(filter: UpcomingFilter): UpcomingEventOperational[] {
  const base = mockEvents.filter(isUpcomingEvent).map(buildUpcomingOperational);

  const filtered = base.filter(({ event, needsAttention }) => {
    switch (filter) {
      case "next_7_days":
        return isWithinDays(event, 7);
      case "next_30_days":
        return isWithinDays(event, 30);
      case "this_month":
        return isThisMonth(event);
      case "needs_attention":
        return needsAttention;
      default:
        return true;
    }
  });

  return filtered.sort((a, b) => {
    const dateCompare = a.event.date.localeCompare(b.event.date);
    if (dateCompare !== 0) return dateCompare;
    return a.event.startTime.localeCompare(b.event.startTime);
  });
}

export function groupUpcomingByDate(
  events: UpcomingEventOperational[],
): { date: string; events: UpcomingEventOperational[] }[] {
  const groups = new Map<string, UpcomingEventOperational[]>();

  for (const entry of events) {
    const existing = groups.get(entry.event.date) ?? [];
    existing.push(entry);
    groups.set(entry.event.date, existing);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, groupedEvents]) => ({ date, events: groupedEvents }));
}

export function getRotaStatusLabel(status: RotaStatus): string {
  return rotaStatusLabels[status];
}

export function getEventOperationalMeta(eventId: string): UpcomingEventOperational | undefined {
  const event = getEventById(eventId);
  if (!event || !isUpcomingEvent(event)) return undefined;
  return buildUpcomingOperational(event);
}
