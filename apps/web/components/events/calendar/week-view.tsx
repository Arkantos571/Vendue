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
              "rounded-xl border border-border bg-background shadow-sm",
              isToday && "ring-2 ring-brand-200",
            )}
          >
            <div className="border-b border-border px-3 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date)}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {formatDate(date, { day: "numeric", month: "short" })}
              </p>
            </div>
            <div className="space-y-2 p-2">
              {dayEvents.length === 0 ? (
                <p className="px-2 py-4 text-xs text-muted-foreground">No events</p>
              ) : (
                dayEvents.map(({ event }) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="block rounded-lg border border-border bg-muted/50 p-3 transition-all hover:border-border hover:bg-muted"
                  >
                    <p className="text-xs font-medium text-brand-700">
                      {formatEventTimeRange(event)}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">{event.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{event.space}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{event.guestCount} guests</span>
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
