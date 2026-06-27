"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  formatDayHeading,
  formatMonthYear,
  formatWeekRange,
  getWeekDates,
  mockToday,
  type CalendarViewMode,
} from "@/lib/mock/event-calendar";
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

  const periodLabel =
    viewMode === "month"
      ? formatMonthYear(mockToday)
      : viewMode === "week"
        ? formatWeekRange(getWeekDates(mockToday))
        : formatDayHeading(mockToday);

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
        {viewMode === "month" && <EventCalendarMonthView />}
        {viewMode === "week" && (
          <div className="p-4">
            <EventCalendarWeekView />
          </div>
        )}
        {viewMode === "day" && <EventCalendarDayView />}
      </div>
    </div>
  );
}
