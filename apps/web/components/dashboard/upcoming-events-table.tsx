import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { UpcomingEventPreview } from "@/lib/mock/dashboard";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UpcomingEventsTableProps {
  events: UpcomingEventPreview[];
}

export function UpcomingEventsTable({ events }: UpcomingEventsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Upcoming events</CardTitle>
          <CardDescription>Bookings scheduled for the week ahead.</CardDescription>
        </div>
        <Link
          href="/dashboard/events"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent className="px-0 pb-0 sm:px-6 sm:pb-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs font-medium uppercase tracking-wide text-stone-500">
                <th className="px-6 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Space</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Guests</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {events.map((event) => (
                <tr key={event.id} className="group hover:bg-stone-50/80">
                  <td className="px-6 py-4">
                    <p className="font-medium text-stone-900">{event.title}</p>
                    <p className="mt-0.5 text-xs text-stone-500">Starts {event.startsAt}</p>
                  </td>
                  <td className="px-4 py-4 text-stone-600">{event.space}</td>
                  <td className="px-4 py-4 text-stone-600">{formatDate(event.date)}</td>
                  <td className="px-4 py-4 text-stone-600">{event.guestCount}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={event.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
