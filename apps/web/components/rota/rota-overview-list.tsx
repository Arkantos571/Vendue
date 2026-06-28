"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import { RotaStatusBadge } from "@/components/rota/rota-status-badge";
import { Input } from "@/components/ui/input";
import { formatEventTimeRange } from "@/lib/events/event-time";
import { formatConfirmationSummary } from "@/lib/rota/shift-confirmation";
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
      className="group cursor-pointer transition-colors hover:bg-muted/80 focus-visible:bg-muted/80 focus-visible:outline-none"
      aria-label={`Build rota for ${event.eventName}`}
    >
      <td className="px-6 py-4">
        <span className="font-medium text-foreground">{event.eventName}</span>
      </td>
      <td className="px-4 py-4 text-muted-foreground">{formatDate(event.date)}</td>
      <td className="px-4 py-4 text-muted-foreground">{formatEventTimeRange(event)}</td>
      <td className="px-4 py-4 text-muted-foreground">{event.space}</td>
      <td className="px-4 py-4 text-muted-foreground">{event.guestCount}</td>
      <td className="px-4 py-4">
        <RotaStatusBadge status={event.rotaStatus} />
        {event.rotaPublishedAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            Published {formatDate(event.rotaPublishedAt)}
          </p>
        )}
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        <div>{event.assignedStaffCount}/{event.requiredStaffCount}</div>
        {event.assignedStaffCount > 0 && (
          <div className="mt-1 text-xs text-muted-foreground">
            {formatConfirmationSummary({
              totalAssigned: event.assignedStaffCount - event.declinedCount,
              confirmedCount: event.confirmedCount,
              pendingCount: event.pendingConfirmationCount,
              declinedCount: event.declinedCount,
            })}
            {event.pendingConfirmationCount > 0 && (
              <span className="ml-1 font-medium text-amber-700 dark:text-amber-400">
                · {event.pendingConfirmationCount} pending
              </span>
            )}
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        <span className={event.gapCount > 0 ? "font-medium text-amber-700" : "text-muted-foreground"}>
          {event.gapCount}
        </span>
      </td>
      <td className="px-4 py-4 font-medium text-foreground">
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
      className="cursor-pointer rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-slate-300 hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      aria-label={`Build rota for ${event.eventName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{event.eventName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(event.date)} · {formatEventTimeRange(event)}
          </p>
        </div>
        <div className="text-right">
          <RotaStatusBadge status={event.rotaStatus} />
          {event.rotaPublishedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Published {formatDate(event.rotaPublishedAt)}
            </p>
          )}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Space</dt>
          <dd className="text-foreground/90">{event.space}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Guests</dt>
          <dd className="text-foreground/90">{event.guestCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Staff</dt>
          <dd className="text-foreground/90">
            {event.assignedStaffCount}/{event.requiredStaffCount}
            {event.assignedStaffCount > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatConfirmationSummary({
                  totalAssigned: event.assignedStaffCount - event.declinedCount,
                  confirmedCount: event.confirmedCount,
                  pendingCount: event.pendingConfirmationCount,
                  declinedCount: event.declinedCount,
                })}
              </p>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Gaps</dt>
          <dd className={event.gapCount > 0 ? "font-medium text-amber-700" : "text-foreground/90"}>
            {event.gapCount}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">Est. labour cost</dt>
          <dd className="font-medium text-foreground">{formatCurrency(event.estimatedLabourCost)}</dd>
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
  const [migrationRequired, setMigrationRequired] = useState(false);
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
        setMigrationRequired(Boolean(result.migrationRequired));
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
        <p className="text-sm text-muted-foreground">Loading rotas…</p>
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
      {migrationRequired && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Rota publish is not fully enabled yet. Run{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-900/50">
            supabase/migrations/007_rota_publish.sql
          </code>{" "}
          in Supabase SQL Editor, then reload.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                : "bg-white text-muted-foreground ring-1 ring-border hover:bg-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="v-empty">
          <p className="text-sm font-medium text-foreground">No rota events found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {events.length === 0
              ? "Create an event first, then build its rota here."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-background shadow-sm lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">Event</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Space</th>
                  <th className="px-4 py-3">Guests</th>
                  <th className="px-4 py-3">Rota status</th>
                  <th className="px-4 py-3">Staff / confirmations</th>
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
