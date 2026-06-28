import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatEventTimeRange } from "@/lib/events/event-time";
import { cn, formatDate } from "@/lib/utils";
import { dateToKey, getEventsOnDate, getWeekDates } from "@/lib/events/calendar";
import type { MockEvent } from "@/lib/mock/events";

interface EventCalendarWeekViewProps {
  events: MockEvent[];
  referenceDate: Date;
}

export function EventCalendarWeekView({ events, referenceDate }: EventCalendarWeekViewProps) {
  const weekDates = getWeekDates(referenceDate);
  const todayKey = dateToKey(new Date());

  return (
    <div className="grid gap-4 lg:grid-cols-7">
      {weekDates.map((date) => {
        const key = dateToKey(date);
        const dayEvents = getEventsOnDate(events, key);
        const isToday = key === todayKey;

        return (
          <div
            key={key}
            className={cn(
              "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm",
              isToday && "ring-2 ring-brand-200",
            )}
          >
            <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date)}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {formatDate(date, { day: "numeric", month: "short" })}
              </p>
            </div>
            <div className="space-y-2 p-2">
              {dayEvents.length === 0 ? (
                <p className="px-2 py-4 text-xs text-stone-400">No events</p>
              ) : (
                dayEvents.map(({ event }) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="block rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50"
                  >
                    <p className="text-xs font-medium text-brand-700">
                      {formatEventTimeRange(event)}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{event.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{event.space}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{event.guestCount} guests</span>
                      <StatusBadge status={event.status} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
