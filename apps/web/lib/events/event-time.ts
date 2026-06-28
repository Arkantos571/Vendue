import { combineDateTime } from "@/lib/events/mappers";

export const MIN_EVENT_DURATION_MINUTES = 30;
export const MAX_EVENT_DURATION_MINUTES = 24 * 60;
/** Latest selectable end time on the following day (05:30). */
export const MAX_NEXT_DAY_END_MINUTES = 5 * 60 + 30;

export interface TimeOption {
  value: string;
  label: string;
  nextDay?: boolean;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function buildSameDayHalfHourOptions(): TimeOption[] {
  const options: TimeOption[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 30]) {
      const value = `${pad(hour)}:${pad(minute)}`;
      options.push({ value, label: value });
    }
  }
  return options;
}

export const EVENT_START_TIME_OPTIONS = buildSameDayHalfHourOptions();

/** @deprecated Use getEndTimeOptionsForStart for filtered options. */
export const EVENT_END_TIME_OPTIONS: TimeOption[] = [
  ...EVENT_START_TIME_OPTIONS,
  ...EVENT_START_TIME_OPTIONS.filter(
    (option) => timeToMinutes(option.value) <= MAX_NEXT_DAY_END_MINUTES,
  ).map((option) => ({
    value: option.value,
    label: `${option.label} next day`,
    nextDay: true,
  })),
];

export function getEndTimeOptionsForStart(startTime: string): {
  sameDay: TimeOption[];
  nextDay: TimeOption[];
} {
  const startMinutes = timeToMinutes(startTime);

  const sameDay = EVENT_START_TIME_OPTIONS.filter(
    (option) => timeToMinutes(option.value) > startMinutes,
  ).map((option) => ({
    value: option.value,
    label: option.label,
    nextDay: false,
  }));

  const nextDay = EVENT_START_TIME_OPTIONS.filter(
    (option) => timeToMinutes(option.value) <= MAX_NEXT_DAY_END_MINUTES,
  ).map((option) => ({
    value: option.value,
    label: `${option.label} next day`,
    nextDay: true,
  }));

  return { sameDay, nextDay };
}

export function endSelectionKey(time: string, nextDay: boolean): string {
  return nextDay ? `next|${time}` : `same|${time}`;
}

export function parseEndSelectionKey(key: string): { time: string; nextDay: boolean } {
  if (key.startsWith("next|")) {
    return { time: key.slice(5), nextDay: true };
  }
  if (key.startsWith("same|")) {
    return { time: key.slice(5), nextDay: false };
  }
  return { time: key, nextDay: false };
}

export function parseEndTimeSelection(
  endTime: string,
  endIsNextDay?: boolean,
): { time: string; nextDay: boolean } {
  const trimmed = endTime.trim();

  if (endIsNextDay === true) {
    return { time: stripEndTimePrefix(trimmed), nextDay: true };
  }

  if (endIsNextDay === false) {
    return { time: stripEndTimePrefix(trimmed), nextDay: false };
  }

  if (trimmed.startsWith("next|") || trimmed.startsWith("next:")) {
    return { time: trimmed.slice(5), nextDay: true };
  }

  if (trimmed.startsWith("same|")) {
    return { time: trimmed.slice(5), nextDay: false };
  }

  return { time: trimmed, nextDay: false };
}

function stripEndTimePrefix(value: string): string {
  if (value.startsWith("next|") || value.startsWith("next:")) {
    return value.slice(5);
  }
  if (value.startsWith("same|")) {
    return value.slice(5);
  }
  return value;
}

export function addDaysToDate(date: string, days: number): string {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
}

export function eventEndsNextDay(event: {
  startTime: string;
  endTime: string;
  endsNextDay?: boolean;
}): boolean {
  if (event.endsNextDay !== undefined) {
    return event.endsNextDay;
  }
  return timeToMinutes(event.endTime) <= timeToMinutes(event.startTime);
}

export function formatEventEndTime(endTime: string, endsNextDay: boolean): string {
  return endsNextDay ? `${endTime} +1` : endTime;
}

export function formatEventTimeRange(event: {
  startTime: string;
  endTime: string;
  endsNextDay?: boolean;
}): string {
  const endsNextDay = eventEndsNextDay(event);
  return `${event.startTime} – ${formatEventEndTime(event.endTime, endsNextDay)}`;
}

export function calculateEventDurationMinutes(
  startTime: string,
  endTime: string,
  endIsNextDay: boolean,
): number {
  const startMinutes = timeToMinutes(startTime);
  let endMinutes = timeToMinutes(endTime);

  if (endIsNextDay) {
    endMinutes += 24 * 60;
  } else if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return endMinutes - startMinutes;
}

export function resolveEventTimestamps(
  eventDate: string,
  startTime: string,
  endTime: string,
  options?: { endIsNextDay?: boolean },
): { startsAt: string; endsAt: string } | { error: string } {
  if (!eventDate || !startTime || !endTime) {
    return { error: "Event date and times are required." };
  }

  const { time: normalizedEndTime, nextDay } = parseEndTimeSelection(
    endTime,
    options?.endIsNextDay,
  );

  if (!/^\d{2}:\d{2}$/.test(normalizedEndTime)) {
    return { error: "Event date and times are required." };
  }

  const startMinutes = timeToMinutes(startTime);
  const endMinutesOnDay = timeToMinutes(normalizedEndTime);

  if (nextDay) {
    if (endMinutesOnDay > MAX_NEXT_DAY_END_MINUTES) {
      return { error: "End time cannot be later than 05:30 the next day." };
    }
  } else if (endMinutesOnDay <= startMinutes) {
    return {
      error: "End time must be after start time, or choose a next-day end time.",
    };
  }

  const duration = calculateEventDurationMinutes(startTime, normalizedEndTime, nextDay);

  if (duration < MIN_EVENT_DURATION_MINUTES) {
    return { error: "Event must be at least 30 minutes long." };
  }

  if (duration > MAX_EVENT_DURATION_MINUTES) {
    return { error: "Event cannot be longer than 24 hours." };
  }

  const endDate = nextDay ? addDaysToDate(eventDate, 1) : eventDate;

  return {
    startsAt: combineDateTime(eventDate, startTime),
    endsAt: combineDateTime(endDate, normalizedEndTime),
  };
}
