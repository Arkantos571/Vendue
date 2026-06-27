import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
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
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 px-6 py-4">
        <p className="text-sm font-medium text-stone-900">{formatDate(dayKey)}</p>
        <p className="mt-1 text-sm text-stone-500">
          {dayEvents.length} event{dayEvents.length === 1 ? "" : "s"} scheduled
        </p>
      </div>

      {dayEvents.length === 0 ? (
        <p className="px-6 py-10 text-sm text-stone-500">No events scheduled for this day.</p>
      ) : (
        <div className="divide-y divide-stone-100">
          {dayEvents.map(({ event, setupTime }) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="block px-6 py-5 transition-colors hover:bg-stone-50/80"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-stone-900">{event.title}</p>
                    <StatusBadge status={event.status} />
                  </div>
                  <p className="mt-1 text-sm text-stone-500">{event.clientName} · {event.space}</p>

                  <dl className="mt-4 space-y-3">
                    {setupTime && (
                      <div className="flex gap-4 text-sm">
                        <dt className="w-24 shrink-0 font-medium text-stone-500">Setup</dt>
                        <dd className="text-stone-700">{setupTime}</dd>
                      </div>
                    )}
                    <div className="flex gap-4 text-sm">
                      <dt className="w-24 shrink-0 font-medium text-stone-500">Event start</dt>
                      <dd className="text-stone-700">{event.startTime}</dd>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <dt className="w-24 shrink-0 font-medium text-stone-500">Event end</dt>
                      <dd className="text-stone-700">{event.endTime}</dd>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <dt className="w-24 shrink-0 font-medium text-stone-500">Guests</dt>
                      <dd className="text-stone-700">{event.guestCount}</dd>
                    </div>
                  </dl>
                </div>

                <span className="inline-flex h-9 shrink-0 items-center rounded-lg border border-stone-200 px-3 text-sm font-medium text-stone-700">
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
