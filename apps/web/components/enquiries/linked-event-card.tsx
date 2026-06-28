import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEnquiryTimeRange } from "@/lib/enquiries/mappers";
import type { EnquiryLinkedEvent } from "@/lib/mock/enquiries";
import { formatDate } from "@/lib/utils";

interface LinkedEventCardProps {
  event: EnquiryLinkedEvent;
}

export function LinkedEventCard({ event }: LinkedEventCardProps) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Linked event</CardTitle>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Converted to event — operational details live on the event record.
            </p>
          </div>
          <StatusBadge status={event.status} />
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Event name</dt>
            <dd className="mt-1 text-sm font-medium text-stone-900 dark:text-stone-100">{event.title}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Date</dt>
            <dd className="mt-1 text-sm text-stone-900 dark:text-stone-100">{formatDate(event.date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Time</dt>
            <dd className="mt-1 text-sm text-stone-900 dark:text-stone-100">
              {formatEnquiryTimeRange({
                preferredStartTime: event.startTime,
                preferredEndTime: event.endTime,
                preferredEndIsNextDay: event.endsNextDay,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={event.status} />
            </dd>
          </div>
        </dl>
        <div className="mt-5">
          <Link href={`/dashboard/events/${event.id}`}>
            <Button type="button" variant="outline">
              View event
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
