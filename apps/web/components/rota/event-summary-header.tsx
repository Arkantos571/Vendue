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
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to rota
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{data.eventName}</h2>
            <RotaStatusBadge status={data.rotaStatus} />
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Client: {data.clientName}</p>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Date</dt>
                <dd className="text-sm text-slate-900 dark:text-slate-100">{formatDate(data.date)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Time</dt>
                <dd className="text-sm text-slate-900 dark:text-slate-100">
                  {formatEventTimeRange(data)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Space</dt>
                <dd className="text-sm text-slate-900 dark:text-slate-100">{data.space}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Guests</dt>
                <dd className="text-sm text-slate-900 dark:text-slate-100">{data.guestCount}</dd>
              </div>
            </div>
          </dl>
        </div>

        <Link
          href={`/dashboard/events/${data.eventId}`}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:bg-slate-900/50"
        >
          View event
        </Link>
      </div>
    </div>
  );
}
