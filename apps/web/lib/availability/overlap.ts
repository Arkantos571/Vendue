import { combineDateTime } from "@/lib/events/mappers";
import {
  addDaysToDate,
  eventEndsNextDay,
  timeToMinutes,
} from "@/lib/events/event-time";
import type {
  ScheduleAvailabilityIndicator,
  UnavailabilityPeriod,
  UnavailabilityStatus,
} from "@/lib/availability/types";

export type TimeWindow = {
  date: string;
  startTime: string;
  endTime: string;
  endsNextDay?: boolean;
};

type MsRange = { startMs: number; endMs: number };

export function isBlockingUnavailabilityStatus(status: UnavailabilityStatus): boolean {
  return status === "pending" || status === "approved";
}

function toMs(iso: string): number {
  return new Date(iso).getTime();
}

function rangesOverlap(a: MsRange, b: MsRange): boolean {
  return a.startMs < b.endMs && b.startMs < a.endMs;
}

function hasTimeBounds(period: Pick<UnavailabilityPeriod, "startTime" | "endTime">): boolean {
  return Boolean(period.startTime && period.endTime);
}

export function unavailabilityToRange(
  period: Pick<UnavailabilityPeriod, "startDate" | "endDate" | "startTime" | "endTime">,
): MsRange {
  if (!hasTimeBounds(period)) {
    return {
      startMs: toMs(combineDateTime(period.startDate, "00:00")),
      endMs: toMs(combineDateTime(addDaysToDate(period.endDate, 1), "00:00")),
    };
  }

  const startTime = period.startTime!;
  const endTime = period.endTime!;
  let endDate = period.endDate;

  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    endDate = addDaysToDate(period.endDate, 1);
  }

  return {
    startMs: toMs(combineDateTime(period.startDate, startTime)),
    endMs: toMs(combineDateTime(endDate, endTime)),
  };
}

export function windowToRange(window: TimeWindow): MsRange {
  const endsNextDay = eventEndsNextDay(window);
  const endDate = endsNextDay ? addDaysToDate(window.date, 1) : window.date;

  return {
    startMs: toMs(combineDateTime(window.date, window.startTime)),
    endMs: toMs(combineDateTime(endDate, window.endTime)),
  };
}

export function overlapsUnavailability(
  periods: UnavailabilityPeriod[],
  window: TimeWindow,
): boolean {
  const target = windowToRange(window);

  return periods
    .filter((period) => isBlockingUnavailabilityStatus(period.status))
    .some((period) => rangesOverlap(unavailabilityToRange(period), target));
}

export function todayDateString(timeZone = "Europe/London"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function computeScheduleAvailabilityIndicator(
  periods: UnavailabilityPeriod[],
  referenceDate = todayDateString(),
): ScheduleAvailabilityIndicator {
  const blocking = periods.filter((period) => isBlockingUnavailabilityStatus(period.status));

  if (blocking.length === 0) {
    return "available";
  }

  const todayStart = toMs(combineDateTime(referenceDate, "00:00"));
  const todayEnd = toMs(combineDateTime(addDaysToDate(referenceDate, 1), "00:00"));
  const soonEnd = toMs(combineDateTime(addDaysToDate(referenceDate, 8), "00:00"));

  const todayRange: MsRange = { startMs: todayStart, endMs: todayEnd };

  if (blocking.some((period) => rangesOverlap(unavailabilityToRange(period), todayRange))) {
    return "unavailable_today";
  }

  const soonRange: MsRange = { startMs: todayEnd, endMs: soonEnd };

  if (blocking.some((period) => rangesOverlap(unavailabilityToRange(period), soonRange))) {
    return "unavailable_soon";
  }

  return "available";
}

export function formatUnavailabilityRange(period: UnavailabilityPeriod): string {
  const sameDay = period.startDate === period.endDate;

  if (!hasTimeBounds(period)) {
    return sameDay ? period.startDate : `${period.startDate} – ${period.endDate}`;
  }

  const overnight =
    timeToMinutes(period.endTime!) <= timeToMinutes(period.startTime!) ||
    period.endDate !== period.startDate;
  const endLabel = overnight ? `${period.endTime} +1` : period.endTime!;

  if (sameDay) {
    return `${period.startDate} · ${period.startTime} – ${endLabel}`;
  }

  return `${period.startDate} ${period.startTime} – ${period.endDate} ${endLabel}`;
}

export function isUpcomingUnavailability(
  period: UnavailabilityPeriod,
  referenceDate = todayDateString(),
): boolean {
  const referenceMs = toMs(combineDateTime(referenceDate, "00:00"));
  return unavailabilityToRange(period).endMs > referenceMs;
}
