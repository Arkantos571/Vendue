import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import { RotaStatusBadge } from "@/components/rota/rota-status-badge";
import { formatEventTimeRange } from "@/lib/events/event-time";
import { formatDate } from "@/lib/utils";
import type { RotaBuilderData } from "@/lib/mock/rota";

interface EventSummaryHeaderProps {
  data: Pick<
    RotaBuilderData,
    | "eventId"
    | "eventName"
    | "date"
    | "startTime"
    | "endTime"
    | "endsNextDay"
    | "space"
    | "guestCount"
    | "clientName"
    | "rotaStatus"
  >;
}

export function EventSummaryHeader({ data }: EventSummaryHeaderProps) {
  return (
    <div className="v-panel">
      <Link
        href="/dashboard/rota"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to rota
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">{data.eventName}</h2>
            <RotaStatusBadge status={data.rotaStatus} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Client: {data.clientName}</p>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</dt>
                <dd className="text-sm text-foreground">{formatDate(data.date)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Time</dt>
                <dd className="text-sm text-foreground">
                  {formatEventTimeRange(data)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Space</dt>
                <dd className="text-sm text-foreground">{data.space}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Guests</dt>
                <dd className="text-sm text-foreground">{data.guestCount}</dd>
              </div>
            </div>
          </dl>
        </div>

        <Link
          href={`/dashboard/events/${data.eventId}`}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground/90 transition-colors hover:bg-muted"
        >
          View event
        </Link>
      </div>
    </div>
  );
}
