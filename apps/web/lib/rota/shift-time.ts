import {
  addDaysToDate,
  parseEndTimeSelection,
  resolveEventTimestamps,
  timeToMinutes,
} from "@/lib/events/event-time";
import { combineDateTime } from "@/lib/events/mappers";

const ARRIVAL_PREFIX = /^\[arrival:(\d{2}:\d{2})\]\s?/;

export function encodeArrivalInNotes(
  arrivalTime: string,
  startTime: string,
  notes: string | null,
): string | null {
  const trimmedNotes = notes?.trim() ?? "";
  if (arrivalTime === startTime) {
    return trimmedNotes || null;
  }
  const prefix = `[arrival:${arrivalTime}]`;
  return trimmedNotes ? `${prefix} ${trimmedNotes}` : prefix;
}

export function decodeArrivalTime(notes: string | null, startTime: string): string {
  if (!notes) {
    return startTime;
  }
  const match = notes.match(ARRIVAL_PREFIX);
  return match?.[1] ?? startTime;
}

export function stripArrivalFromNotes(notes: string | null): string | null {
  if (!notes) {
    return null;
  }
  const stripped = notes.replace(ARRIVAL_PREFIX, "").trim();
  return stripped || null;
}

export function resolveShiftTimestamps(
  eventDate: string,
  startTime: string,
  finishTime: string,
  options?: { finishIsNextDay?: boolean },
): { startsAt: string; endsAt: string } | { error: string } {
  return resolveEventTimestamps(eventDate, startTime, finishTime, {
    endIsNextDay: options?.finishIsNextDay,
  });
}

export function parseFinishSelectionKey(key: string): { time: string; nextDay: boolean } {
  if (key.startsWith("next|")) {
    return { time: key.slice(5), nextDay: true };
  }
  if (key.startsWith("same|")) {
    return { time: key.slice(5), nextDay: false };
  }
  return parseEndTimeSelection(key);
}

export function calculateShiftMinutes(
  startTime: string,
  finishTime: string,
  finishIsNextDay: boolean,
  breakMinutes: number,
): number {
  const startMinutes = timeToMinutes(startTime);
  let finishMinutes = timeToMinutes(finishTime);

  if (finishIsNextDay || finishMinutes <= startMinutes) {
    finishMinutes += 24 * 60;
  }

  return Math.max(0, finishMinutes - startMinutes - breakMinutes);
}

export function calculateShiftHours(
  startTime: string,
  finishTime: string,
  finishIsNextDay: boolean,
  breakMinutes: number,
): number {
  return calculateShiftMinutes(startTime, finishTime, finishIsNextDay, breakMinutes) / 60;
}

export function calculateShiftCost(
  startTime: string,
  finishTime: string,
  finishIsNextDay: boolean,
  breakMinutes: number,
  hourlyRate: number,
): number {
  return calculateShiftHours(startTime, finishTime, finishIsNextDay, breakMinutes) * hourlyRate;
}

export function finishTimeFromTimestamps(
  eventDate: string,
  startsAt: string,
  endsAt: string,
): { finishTime: string; finishIsNextDay: boolean } {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const finishTime = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
  const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
  const finishIsNextDay = endDate > startDate || endDate > eventDate;
  return { finishTime, finishIsNextDay };
}

export function combineArrivalDateTime(eventDate: string, arrivalTime: string): string {
  return combineDateTime(eventDate, arrivalTime);
}

export { addDaysToDate };
