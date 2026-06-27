import Link from "next/link";
import { cn } from "@/lib/utils";
import { dateToKey, getEventsOnDate, getMonthGrid } from "@/lib/events/calendar";
import type { MockEvent } from "@/lib/mock/events";

interface EventCalendarMonthViewProps {
  events: MockEvent[];
  referenceDate: Date;
}

export function EventCalendarMonthView({ events, referenceDate }: EventCalendarMonthViewProps) {
  const grid = getMonthGrid(referenceDate);
  const todayKey = dateToKey(new Date());
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50/80">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wide text-stone-500"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {grid.map(({ date, inMonth }) => {
          const key = dateToKey(date);
          const dayEvents = getEventsOnDate(events, key);
          const isToday = key === todayKey;

          return (
            <div
              key={key}
              className={cn(
                "min-h-28 border-b border-r border-stone-100 p-2",
                !inMonth && "bg-stone-50/60",
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                    isToday
                      ? "bg-brand-700 text-white"
                      : inMonth
                        ? "text-stone-700"
                        : "text-stone-400",
                  )}
                >
                  {date.getDate()}
                </span>
              </div>
              <div className="space-y-1">
                {dayEvents.map(({ event }) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    title={event.title}
                    className="block truncate rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-800 transition-colors hover:bg-brand-100"
                  >
                    {event.startTime} {event.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
