import { CalendarDays, MapPin, Users } from "lucide-react";
import { EventDetailItem } from "@/components/events/event-detail-item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockEvent } from "@/lib/mock/events";
import { formatDate } from "@/lib/utils";

export function EventOverviewSection({ event }: { event: MockEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event overview</CardTitle>
        <CardDescription>Schedule, space, and capacity.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <EventDetailItem icon={CalendarDays} label="Date" value={formatDate(event.date)} />
          <EventDetailItem
            icon={CalendarDays}
            label="Time"
            value={`${event.startTime} – ${event.endTime}`}
          />
          <EventDetailItem icon={MapPin} label="Space" value={event.space} />
          <EventDetailItem icon={Users} label="Guest count" value={String(event.guestCount)} />
          <EventDetailItem label="Event type" value={event.eventType} />
        </dl>
      </CardContent>
    </Card>
  );
}
