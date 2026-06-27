import { CalendarDays, MapPin, Users } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockEvent } from "@/lib/mock/events";
import { formatDate } from "@/lib/utils";

export function FunctionSheetEventSummary({ event }: { event: MockEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event summary</CardTitle>
        <CardDescription>Key details for the day-of run sheet.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryItem label="Event name" value={event.title} />
          <SummaryItem label="Client name" value={event.clientName} />
          <SummaryItem label="Date" value={formatDate(event.date)} icon={CalendarDays} />
          <SummaryItem label="Start time" value={event.startTime} />
          <SummaryItem label="End time" value={event.endTime} />
          <SummaryItem label="Space" value={event.space} icon={MapPin} />
          <SummaryItem label="Guest count" value={String(event.guestCount)} icon={Users} />
          <SummaryItem label="Event type" value={event.eventType} />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={event.status} />
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function SummaryItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof CalendarDays;
}) {
  return (
    <div className="flex gap-3">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />}
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
        <dd className="mt-1 text-sm text-stone-900">{value}</dd>
      </div>
    </div>
  );
}
