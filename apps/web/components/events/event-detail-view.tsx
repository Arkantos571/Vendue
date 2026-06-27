import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { RotaCompletionIndicator } from "@/components/events/rota-completion-indicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockEvent } from "@/lib/mock/events";
import { formatDate } from "@/lib/utils";

interface EventDetailViewProps {
  event: MockEvent;
}

export function EventDetailView({ event }: EventDetailViewProps) {
  const openShifts = event.rotaShifts.filter((shift) => !shift.staffName).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-stone-900">{event.title}</h2>
            <StatusBadge status={event.status} />
          </div>
          <p className="mt-1 text-sm text-stone-500">{event.eventType}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-400"
          >
            <Pencil className="h-4 w-4" />
            Edit event
          </button>
          <Link
            href="/dashboard/team"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-800"
          >
            <Users className="h-4 w-4" />
            Build rota
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Event overview</CardTitle>
            <CardDescription>Schedule, space, and capacity.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem icon={CalendarDays} label="Date" value={formatDate(event.date)} />
              <DetailItem
                icon={CalendarDays}
                label="Time"
                value={`${event.startTime} – ${event.endTime}`}
              />
              <DetailItem icon={MapPin} label="Space" value={event.space} />
              <DetailItem icon={Users} label="Guest count" value={String(event.guestCount)} />
            </dl>
            {event.notes && (
              <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50/50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Notes</p>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{event.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Name" value={event.clientName} />
            <DetailItem icon={Mail} label="Email" value={event.clientEmail} />
            <DetailItem
              icon={Phone}
              label="Phone"
              value={event.clientPhone ?? "Not provided"}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Rota summary</CardTitle>
            <CardDescription>
              {event.assignedStaffCount} of {event.requiredStaffCount} shifts filled
              {openShifts > 0 && ` · ${openShifts} gap${openShifts === 1 ? "" : "s"}`}
            </CardDescription>
          </div>
          <RotaCompletionIndicator
            assigned={event.assignedStaffCount}
            required={event.requiredStaffCount}
          />
        </CardHeader>
        <CardContent>
          {event.rotaShifts.length === 0 ? (
            <p className="text-sm text-stone-500">No shifts scheduled yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
              {event.rotaShifts.map((shift, index) => (
                <li
                  key={`${shift.role}-${index}`}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-900">{shift.role}</p>
                    <p className="text-xs text-stone-500">
                      {event.startTime} – {event.endTime}
                    </p>
                  </div>
                  <span
                    className={
                      shift.staffName
                        ? "text-sm text-stone-700"
                        : "rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                    }
                  >
                    {shift.staffName ?? "Unassigned"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>Function sheet</CardTitle>
              <CardDescription>
                Run sheet, timings, and service notes will appear here.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-500">
            Function sheet builder coming soon — menu, timings, AV, and floor plan details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof CalendarDays;
  label: string;
  value: string;
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
