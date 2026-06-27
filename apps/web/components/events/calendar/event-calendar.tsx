"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  formatDayHeading,
  formatMonthYear,
  formatWeekRange,
  getWeekDates,
  type CalendarViewMode,
} from "@/lib/events/calendar";
import { loadEventsAction } from "@/lib/events/actions";
import type { MockEvent } from "@/lib/mock/events";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import { CalendarNavControls } from "@/components/events/calendar/calendar-nav-controls";
import { EventCalendarDayView } from "@/components/events/calendar/day-view";
import { EventCalendarMonthView } from "@/components/events/calendar/month-view";
import { EventCalendarWeekView } from "@/components/events/calendar/week-view";

const viewModes: { value: CalendarViewMode; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
];

export function EventCalendar() {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [referenceDate] = useState(() => new Date());
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noVenue, setNoVenue] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      const result = await loadEventsAction();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error);
        setEvents([]);
        setNoVenue(false);
      } else {
        setEvents(result.events);
        setNoVenue(Boolean(result.noVenue));
      }

      setIsLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const periodLabel =
    viewMode === "month"
      ? formatMonthYear(referenceDate)
      : viewMode === "week"
        ? formatWeekRange(getWeekDates(referenceDate))
        : formatDayHeading(referenceDate);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-stone-500">Loading calendar…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-red-900">Could not load calendar</p>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (noVenue) {
    return <VenueRequiredEmptyState message="Set up your venue before viewing the calendar" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {viewModes.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setViewMode(value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                viewMode === value
                  ? "bg-brand-700 text-white"
                  : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <CalendarNavControls label={periodLabel} />

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        {viewMode === "month" && (
          <EventCalendarMonthView events={events} referenceDate={referenceDate} />
        )}
        {viewMode === "week" && (
          <div className="p-4">
            <EventCalendarWeekView events={events} referenceDate={referenceDate} />
          </div>
        )}
        {viewMode === "day" && (
          <EventCalendarDayView events={events} referenceDate={referenceDate} />
        )}
      </div>
    </div>
  );
}
