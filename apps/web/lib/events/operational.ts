import type { MockEvent } from "@/lib/mock/events";
import type { FunctionSheetStatus } from "@/lib/mock/event-calendar";
import type { RotaStatus } from "@/lib/mock/rota";

export type UpcomingFilter = "next_7_days" | "next_30_days" | "this_month" | "needs_attention";

export interface UpcomingEventOperational {
  event: MockEvent;
  rotaStatus: RotaStatus;
  functionSheetStatus: FunctionSheetStatus;
  warnings: string[];
  needsAttention: boolean;
}

function parseDate(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

function daysBetween(from: Date, to: Date): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function isUpcomingEvent(event: MockEvent): boolean {
  return event.status !== "completed" && event.status !== "cancelled";
}

export function buildOperationalPlaceholder(event: MockEvent): UpcomingEventOperational {
  const warnings: string[] = [];

  if (event.assignedStaffCount < event.requiredStaffCount) {
    warnings.push("Rota not complete");
  }

  if (event.status === "draft") {
    warnings.push("Client confirmation pending");
    warnings.push("Function sheet draft");
  }

  const functionSheetStatus: FunctionSheetStatus =
    event.status === "draft" ? "draft" : "in_progress";

  return {
    event,
    rotaStatus: "draft",
    functionSheetStatus,
    warnings,
    needsAttention: warnings.length > 0,
  };
}

function isWithinDays(event: MockEvent, days: number, from: Date): boolean {
  const eventDate = parseDate(event.date);
  const diff = daysBetween(from, eventDate);
  return diff >= 0 && diff <= days;
}

function isThisMonth(event: MockEvent, reference: Date): boolean {
  const eventDate = parseDate(event.date);
  return (
    eventDate.getFullYear() === reference.getFullYear() &&
    eventDate.getMonth() === reference.getMonth()
  );
}

export function getUpcomingOperationalEvents(
  events: MockEvent[],
  filter: UpcomingFilter,
  referenceDate: Date = new Date(),
): UpcomingEventOperational[] {
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  const base = events
    .filter(isUpcomingEvent)
    .filter((event) => {
      const eventDate = parseDate(event.date);
      return eventDate >= today;
    })
    .map(buildOperationalPlaceholder);

  const filtered = base.filter(({ event, needsAttention }) => {
    switch (filter) {
      case "next_7_days":
        return isWithinDays(event, 7, today);
      case "next_30_days":
        return isWithinDays(event, 30, today);
      case "this_month":
        return isThisMonth(event, today);
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
