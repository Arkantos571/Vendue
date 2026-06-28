"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { UpcomingEventPreview } from "@/lib/mock/dashboard";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UpcomingEventsTableProps {
  events: UpcomingEventPreview[];
}

export function UpcomingEventsTable({ events }: UpcomingEventsTableProps) {
  const router = useRouter();

  function navigateToEvent(eventId: string) {
    router.push(`/dashboard/events/${eventId}`);
  }

  function handleRowKeyDown(event: React.KeyboardEvent, eventId: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateToEvent(eventId);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <Link href="/dashboard/events/upcoming" className="group min-w-0 flex-1">
          <CardTitle className="transition-colors group-hover:text-brand-700">
            Upcoming events
          </CardTitle>
          <CardDescription>Bookings scheduled for the week ahead.</CardDescription>
        </Link>
        <Link
          href="/dashboard/events/upcoming"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent className="px-0 pb-0 sm:px-6 sm:pb-5">
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="px-6 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Space</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Guests</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {events.map((event) => (
                <tr
                  key={event.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigateToEvent(event.id)}
                  onKeyDown={(e) => handleRowKeyDown(e, event.id)}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-slate-50/80 dark:bg-slate-800/50 focus-visible:bg-slate-50/80 dark:bg-slate-800/50 focus-visible:outline-none",
                  )}
                  aria-label={`View ${event.title}`}
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{event.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Starts {event.startsAt}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{event.space}</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatDate(event.date)}</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{event.guestCount}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={event.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 sm:hidden">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50/80 dark:bg-slate-800/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800/80"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(event.date)} · Starts {event.startsAt}
                  </p>
                </div>
                <StatusBadge status={event.status} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Space</dt>
                  <dd className="text-slate-700 dark:text-slate-300">{event.space}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Guests</dt>
                  <dd className="text-slate-700 dark:text-slate-300">{event.guestCount}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
