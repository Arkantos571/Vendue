import { combineDateTime } from "@/lib/events/mappers";

export const MIN_EVENT_DURATION_MINUTES = 30;
export const MAX_EVENT_DURATION_MINUTES = 24 * 60;
/** Latest selectable end time on the following day (05:30). */
export const MAX_NEXT_DAY_END_MINUTES = 5 * 60 + 30;

export interface TimeOption {
  value: string;
  label: string;
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

export const EVENT_END_TIME_OPTIONS: TimeOption[] = [
  ...EVENT_START_TIME_OPTIONS,
  ...EVENT_START_TIME_OPTIONS.filter(
    (option) => timeToMinutes(option.value) <= MAX_NEXT_DAY_END_MINUTES,
  ).map((option) => ({
    value: `next:${option.value}`,
    label: `${option.label} next day`,
  })),
];

export function parseEndTimeValue(value: string): { time: string; nextDay: boolean } {
  if (value.startsWith("next:")) {
    return { time: value.slice(5), nextDay: true };
  }
  return { time: value, nextDay: false };
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
  endTimeValue: string,
): { startsAt: string; endsAt: string } | { error: string } {
  if (!eventDate || !startTime || !endTimeValue) {
    return { error: "Event date and times are required." };
  }

  const { time: endTime, nextDay } = parseEndTimeValue(endTimeValue);
  const startMinutes = timeToMinutes(startTime);
  const endMinutesOnDay = timeToMinutes(endTime);

  if (nextDay) {
    if (endMinutesOnDay > MAX_NEXT_DAY_END_MINUTES) {
      return { error: "End time cannot be later than 05:30 the next day." };
    }
  } else if (endMinutesOnDay <= startMinutes) {
    return {
      error: "End time must be after start time, or choose a next-day end time.",
    };
  }

  const duration = calculateEventDurationMinutes(startTime, endTime, nextDay);

  if (duration < MIN_EVENT_DURATION_MINUTES) {
    return { error: "Event must be at least 30 minutes long." };
  }

  if (duration > MAX_EVENT_DURATION_MINUTES) {
    return { error: "Event cannot be longer than 24 hours." };
  }

  const endDate = nextDay ? addDaysToDate(eventDate, 1) : eventDate;

  return {
    startsAt: combineDateTime(eventDate, startTime),
    endsAt: combineDateTime(endDate, endTime),
  };
}
