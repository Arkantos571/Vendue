"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { RotaCompletionIndicator } from "@/components/events/rota-completion-indicator";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import { Input } from "@/components/ui/input";
import { formatEventTimeRange } from "@/lib/events/event-time";
import { cn, formatDate } from "@/lib/utils";
import { loadEventsAction } from "@/lib/events/actions";
import { type EventStatusFilter, type MockEvent } from "@/lib/mock/events";

const statusFilters: { value: EventStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function EventsList() {
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noVenue, setNoVenue] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>("all");

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

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;

      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.clientName.toLowerCase().includes(query) ||
        event.space.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [events, search, statusFilter]);

  if (isLoading) {
    return (
      <div className="v-empty">
        <p className="text-sm text-stone-500">Loading events…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-red-900">Could not load events</p>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (noVenue) {
    return <VenueRequiredEmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            type="search"
            placeholder="Search events, clients, or spaces…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800"
        >
          <Plus className="h-4 w-4" />
          New event
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              statusFilter === value
                ? "bg-brand-700 text-white"
                : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-700 dark:hover:bg-stone-800",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="v-empty">
          <p className="text-sm font-medium text-stone-900">No events found</p>
          <p className="mt-1 text-sm text-stone-500">
            Try adjusting your search or filters, or create a new event.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50 text-xs font-medium uppercase tracking-wide text-stone-500">
                  <th className="px-6 py-3">Event</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Space</th>
                  <th className="px-4 py-3">Guests</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-6 py-3">Rota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEvents.map((event) => (
                  <EventTableRow key={event.id} event={event} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EventTableRow({ event }: { event: MockEvent }) {
  const router = useRouter();

  function navigate() {
    router.push(`/dashboard/events/${event.id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate();
    }
  }

  return (
    <tr
      role="link"
      tabIndex={0}
      onClick={navigate}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer transition-colors hover:bg-stone-50/80 focus-visible:bg-stone-50/80 dark:hover:bg-stone-800/50 dark:focus-visible:bg-stone-800/50 focus-visible:outline-none"
      aria-label={`View ${event.title}`}
    >
      <td className="px-6 py-4">
        <span className="font-medium text-stone-900">{event.title}</span>
      </td>
      <td className="px-4 py-4 text-stone-600">{event.clientName}</td>
      <td className="px-4 py-4 text-stone-600">{formatDate(event.date)}</td>
      <td className="px-4 py-4 text-stone-600">
        {formatEventTimeRange(event)}
      </td>
      <td className="px-4 py-4 text-stone-600">{event.space}</td>
      <td className="px-4 py-4 text-stone-600">{event.guestCount}</td>
      <td className="px-4 py-4">
        <StatusBadge status={event.status} />
      </td>
      <td className="px-4 py-4 text-stone-600">{event.assignedStaffCount}</td>
      <td className="px-6 py-4">
        <RotaCompletionIndicator
          assigned={event.assignedStaffCount}
          required={event.requiredStaffCount}
          compact
        />
      </td>
    </tr>
  );
}

function EventCard({ event }: { event: MockEvent }) {
  return (
    <Link
      href={`/dashboard/events/${event.id}`}
      className="block v-card p-5 transition-colors hover:border-stone-300 hover:bg-stone-50/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-stone-900">{event.title}</p>
          <p className="mt-1 text-sm text-stone-500">{event.clientName}</p>
        </div>
        <StatusBadge status={event.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-stone-400">Date</dt>
          <dd className="mt-0.5 text-stone-700">{formatDate(event.date)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">Time</dt>
          <dd className="mt-0.5 text-stone-700">
            {formatEventTimeRange(event)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">Space</dt>
          <dd className="mt-0.5 text-stone-700">{event.space}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">Guests</dt>
          <dd className="mt-0.5 text-stone-700">{event.guestCount}</dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-stone-100 pt-4">
        <span className="text-xs text-stone-500">
          {event.assignedStaffCount} staff assigned
        </span>
        <RotaCompletionIndicator
          assigned={event.assignedStaffCount}
          required={event.requiredStaffCount}
          compact
        />
      </div>
    </Link>
  );
}
