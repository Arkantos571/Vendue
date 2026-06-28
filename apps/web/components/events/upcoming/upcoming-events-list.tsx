"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FunctionSheetStatusBadge } from "@/components/events/function-sheet-status-badge";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import { RotaStatusBadge } from "@/components/rota/rota-status-badge";
import { formatEventTimeRange } from "@/lib/events/event-time";
import { cn, formatDate } from "@/lib/utils";
import { loadEventsAction } from "@/lib/events/actions";
import type { MockEvent } from "@/lib/mock/events";
import {
  groupUpcomingByDate,
  getUpcomingOperationalEvents,
  type UpcomingFilter,
} from "@/lib/events/operational";

const filters: { value: UpcomingFilter; label: string }[] = [
  { value: "next_7_days", label: "Next 7 days" },
  { value: "next_30_days", label: "Next 30 days" },
  { value: "this_month", label: "This month" },
  { value: "needs_attention", label: "Needs attention" },
];

export function UpcomingEventsList() {
  const router = useRouter();
  const [filter, setFilter] = useState<UpcomingFilter>("next_7_days");
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

  const operationalEvents = useMemo(
    () => getUpcomingOperationalEvents(events, filter),
    [events, filter],
  );
  const grouped = useMemo(() => groupUpcomingByDate(operationalEvents), [operationalEvents]);

  function navigate(eventId: string) {
    router.push(`/dashboard/events/${eventId}`);
  }

  function handleKeyDown(e: React.KeyboardEvent, eventId: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(eventId);
    }
  }

  if (isLoading) {
    return (
      <div className="v-empty">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading upcoming events…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-red-900">Could not load upcoming events</p>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (noVenue) {
    return (
      <VenueRequiredEmptyState message="Set up your venue before viewing upcoming events" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === value
                ? "bg-brand-700 text-white"
                : "bg-white text-slate-600 dark:text-slate-300 ring-1 ring-stone-200 hover:bg-slate-50 dark:bg-slate-900  dark:ring-stone-700 dark:hover:bg-slate-800",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="v-empty">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No upcoming events found</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try another filter to see more events.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ date, events: dayEvents }) => (
            <section key={date}>
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDate(date)}</h3>

              <div className="hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <th className="px-6 py-3">Event</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Space</th>
                      <th className="px-4 py-3">Guests</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Rota</th>
                      <th className="px-4 py-3">Function sheet</th>
                      <th className="px-6 py-3">Warnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {dayEvents.map(({ event, rotaStatus, functionSheetStatus, warnings }) => (
                      <tr
                        key={event.id}
                        role="link"
                        tabIndex={0}
                        onClick={() => navigate(event.id)}
                        onKeyDown={(e) => handleKeyDown(e, event.id)}
                        className="cursor-pointer transition-colors hover:bg-slate-50/80 focus-visible:bg-slate-50/80 dark:hover:bg-slate-800/50 dark:focus-visible:bg-slate-800/50 focus-visible:outline-none"
                        aria-label={`View ${event.title}`}
                      >
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{event.title}</td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{event.clientName}</td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                          {formatEventTimeRange(event)}
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{event.space}</td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{event.guestCount}</td>
                        <td className="px-4 py-4">
                          <StatusBadge status={event.status} />
                        </td>
                        <td className="px-4 py-4">
                          <RotaStatusBadge status={rotaStatus} />
                        </td>
                        <td className="px-4 py-4">
                          <FunctionSheetStatusBadge status={functionSheetStatus} />
                        </td>
                        <td className="px-6 py-4">
                          {warnings.length > 0 ? (
                            <ul className="space-y-1">
                              {warnings.map((warning) => (
                                <li
                                  key={warning}
                                  className="flex items-center gap-1.5 text-xs text-amber-700"
                                >
                                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                  {warning}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-xs text-stone-400">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 lg:hidden">
                {dayEvents.map(({ event, rotaStatus, functionSheetStatus, warnings }) => (
                  <div
                    key={event.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(event.id)}
                    onKeyDown={(e) => handleKeyDown(e, event.id)}
                    className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900/50/80"
                    aria-label={`View ${event.title}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{event.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{event.clientName}</p>
                      </div>
                      <StatusBadge status={event.status} />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">Time</dt>
                        <dd className="text-slate-700 dark:text-slate-300">
                          {formatEventTimeRange(event)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">Space</dt>
                        <dd className="text-slate-700 dark:text-slate-300">{event.space}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">Guests</dt>
                        <dd className="text-slate-700 dark:text-slate-300">{event.guestCount}</dd>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <RotaStatusBadge status={rotaStatus} />
                        <FunctionSheetStatusBadge status={functionSheetStatus} />
                      </div>
                    </dl>
                    {warnings.length > 0 && (
                      <ul className="mt-3 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3">
                        {warnings.map((warning) => (
                          <li
                            key={warning}
                            className="flex items-center gap-1.5 text-xs text-amber-700"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
