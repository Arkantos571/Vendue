import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatEventEndTime, eventEndsNextDay } from "@/lib/events/event-time";
import { formatDate } from "@/lib/utils";
import { dateToKey, getEventsOnDate } from "@/lib/events/calendar";
import type { MockEvent } from "@/lib/mock/events";

interface EventCalendarDayViewProps {
  events: MockEvent[];
  referenceDate: Date;
}

export function EventCalendarDayView({ events, referenceDate }: EventCalendarDayViewProps) {
  const dayKey = dateToKey(referenceDate);
  const dayEvents = getEventsOnDate(events, dayKey);

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <p className="text-sm font-medium text-foreground">{formatDate(dayKey)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {dayEvents.length} event{dayEvents.length === 1 ? "" : "s"} scheduled
        </p>
      </div>

      {dayEvents.length === 0 ? (
        <p className="px-6 py-10 text-sm text-muted-foreground">No events scheduled for this day.</p>
      ) : (
        <div className="divide-y divide-stone-100">
          {dayEvents.map(({ event, setupTime }) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="block px-6 py-5 transition-colors hover:bg-muted/80"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-foreground">{event.title}</p>
                    <StatusBadge status={event.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{event.clientName} · {event.space}</p>

                  <dl className="mt-4 space-y-3">
                    {setupTime && (
                      <div className="flex gap-4 text-sm">
                        <dt className="w-24 shrink-0 font-medium text-muted-foreground">Setup</dt>
                        <dd className="text-foreground/90">{setupTime}</dd>
                      </div>
                    )}
                    <div className="flex gap-4 text-sm">
                      <dt className="w-24 shrink-0 font-medium text-muted-foreground">Event start</dt>
                      <dd className="text-foreground/90">{event.startTime}</dd>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <dt className="w-24 shrink-0 font-medium text-muted-foreground">Event end</dt>
                      <dd className="text-foreground/90">{formatEventEndTime(event.endTime, eventEndsNextDay(event))}</dd>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <dt className="w-24 shrink-0 font-medium text-muted-foreground">Guests</dt>
                      <dd className="text-foreground/90">{event.guestCount}</dd>
                    </div>
                  </dl>
                </div>

                <span className="inline-flex h-9 shrink-0 items-center rounded-lg border border-border px-3 text-sm font-medium text-foreground/90">
                  View event
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
