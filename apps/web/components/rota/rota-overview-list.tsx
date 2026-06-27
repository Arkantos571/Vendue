"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import { RotaStatusBadge } from "@/components/rota/rota-status-badge";
import { Input } from "@/components/ui/input";
import { formatEventTimeRange } from "@/lib/events/event-time";
import { cn, formatDate } from "@/lib/utils";
import {
  formatCurrency,
  rotaStatusFilters,
  type RotaEventSummary,
  type RotaStatusFilter,
} from "@/lib/mock/rota";
import { loadRotaOverviewAction } from "@/lib/rota/actions";

function RotaTableRow({ event }: { event: RotaEventSummary }) {
  const router = useRouter();

  function navigate() {
    router.push(`/dashboard/rota/${event.eventId}`);
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
      aria-label={`Build rota for ${event.eventName}`}
    >
      <td className="px-6 py-4">
        <span className="font-medium text-stone-900">{event.eventName}</span>
      </td>
      <td className="px-4 py-4 text-stone-600">{formatDate(event.date)}</td>
      <td className="px-4 py-4 text-stone-600">{formatEventTimeRange(event)}</td>
      <td className="px-4 py-4 text-stone-600">{event.space}</td>
      <td className="px-4 py-4 text-stone-600">{event.guestCount}</td>
      <td className="px-4 py-4">
        <RotaStatusBadge status={event.rotaStatus} />
      </td>
      <td className="px-4 py-4 text-stone-600">
        {event.assignedStaffCount}/{event.requiredStaffCount}
      </td>
      <td className="px-4 py-4">
        <span className={event.gapCount > 0 ? "font-medium text-amber-700" : "text-stone-600"}>
          {event.gapCount}
        </span>
      </td>
      <td className="px-4 py-4 font-medium text-stone-900">
        {formatCurrency(event.estimatedLabourCost)}
      </td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <Link
          href={`/dashboard/rota/${event.eventId}`}
          className="inline-flex h-8 items-center justify-center rounded-lg bg-brand-700 px-3 text-xs font-medium text-white transition-colors hover:bg-brand-800"
        >
          Build rota
        </Link>
      </td>
    </tr>
  );
}

function RotaCard({ event }: { event: RotaEventSummary }) {
  const router = useRouter();

  function navigate() {
    router.push(`/dashboard/rota/${event.eventId}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate();
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={navigate}
      onKeyDown={handleKeyDown}
      className="cursor-pointer rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-stone-300 hover:bg-stone-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      aria-label={`Build rota for ${event.eventName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-stone-900">{event.eventName}</p>
          <p className="mt-1 text-sm text-stone-500">
            {formatDate(event.date)} · {formatEventTimeRange(event)}
          </p>
        </div>
        <RotaStatusBadge status={event.rotaStatus} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-stone-500">Space</dt>
          <dd className="text-stone-700">{event.space}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500">Guests</dt>
          <dd className="text-stone-700">{event.guestCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500">Staff</dt>
          <dd className="text-stone-700">
            {event.assignedStaffCount}/{event.requiredStaffCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500">Gaps</dt>
          <dd className={event.gapCount > 0 ? "font-medium text-amber-700" : "text-stone-700"}>
            {event.gapCount}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-stone-500">Est. labour cost</dt>
          <dd className="font-medium text-stone-900">{formatCurrency(event.estimatedLabourCost)}</dd>
        </div>
      </dl>

      <div className="mt-4" onClick={(e) => e.stopPropagation()}>
        <Link
          href={`/dashboard/rota/${event.eventId}`}
          className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-brand-700 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          Build rota
        </Link>
      </div>
    </div>
  );
}

export function RotaOverviewList() {
  const [events, setEvents] = useState<RotaEventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noVenue, setNoVenue] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RotaStatusFilter>("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      const result = await loadRotaOverviewAction();

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
      const matchesStatus = statusFilter === "all" || event.rotaStatus === statusFilter;
      const matchesSearch =
        !query ||
        event.eventName.toLowerCase().includes(query) ||
        event.space.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [events, search, statusFilter]);

  if (isLoading) {
    return (
      <div className="v-empty">
        <p className="text-sm text-stone-500">Loading rotas…</p>
      </div>
    );
  }

  if (noVenue) {
    return (
      <VenueRequiredEmptyState
        message="Set up your venue before building rotas"
        description="Add your venue in Settings before scheduling event staff."
        href="/dashboard/settings"
        buttonLabel="Go to settings"
      />
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          type="search"
          placeholder="Search events or spaces…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {rotaStatusFilters.map(({ value, label }) => (
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
          <p className="text-sm font-medium text-stone-900">No rota events found</p>
          <p className="mt-1 text-sm text-stone-500">
            {events.length === 0
              ? "Create an event first, then build its rota here."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50 text-xs font-medium uppercase tracking-wide text-stone-500">
                  <th className="px-6 py-3">Event</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Space</th>
                  <th className="px-4 py-3">Guests</th>
                  <th className="px-4 py-3">Rota status</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Gaps</th>
                  <th className="px-4 py-3">Est. cost</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEvents.map((event) => (
                  <RotaTableRow key={event.eventId} event={event} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {filteredEvents.map((event) => (
              <RotaCard key={event.eventId} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
