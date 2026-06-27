import type { MockEvent } from "@/lib/mock/events";

export function dateToKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export type CalendarViewMode = "month" | "week" | "day";

export interface CalendarEventEntry {
  event: MockEvent;
  setupTime: string | null;
}

function subtractHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = Math.max(0, h * 60 + m - hours * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function isCalendarEvent(event: MockEvent): boolean {
  return event.status !== "completed" && event.status !== "cancelled";
}

export function toCalendarEntry(event: MockEvent): CalendarEventEntry {
  const setupOffset = event.guestCount >= 100 ? 3 : event.guestCount >= 40 ? 2 : 1;
  return {
    event,
    setupTime: subtractHours(event.startTime, setupOffset),
  };
}

export function getEventsOnDate(events: MockEvent[], date: string): CalendarEventEntry[] {
  return events
    .filter(isCalendarEvent)
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

export function filterCalendarEvents(events: MockEvent[]): MockEvent[] {
  return events.filter(isCalendarEvent);
}
