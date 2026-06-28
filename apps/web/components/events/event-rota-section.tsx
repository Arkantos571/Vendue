import Link from "next/link";
import { Users } from "lucide-react";
import { RotaCompletionIndicator } from "@/components/events/rota-completion-indicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEventTimeRange } from "@/lib/events/event-time";
import type { MockEvent } from "@/lib/mock/events";

interface EventRotaSectionProps {
  event: MockEvent;
  hasRotaBuilder: boolean;
}

export function EventRotaSection({ event, hasRotaBuilder }: EventRotaSectionProps) {
  const openShifts = event.rotaShifts.filter((shift) => !shift.staffName).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Rota summary</CardTitle>
          <CardDescription>
            {event.assignedStaffCount} of {event.requiredStaffCount} shifts filled
            {openShifts > 0 && ` · ${openShifts} gap${openShifts === 1 ? "" : "s"}`}
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <RotaCompletionIndicator
            assigned={event.assignedStaffCount}
            required={event.requiredStaffCount}
          />
          {hasRotaBuilder && (
            <Link
              href={`/dashboard/rota/${event.id}`}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              <Users className="h-4 w-4" />
              Build rota
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {event.rotaShifts.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No shifts scheduled yet.</p>
        ) : (
          <ul className="divide-y divide-stone-100 rounded-lg border border-slate-200 dark:border-slate-800">
            {event.rotaShifts.map((shift, index) => (
              <li
                key={`${shift.role}-${index}`}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{shift.role}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatEventTimeRange(event)}
                  </p>
                </div>
                <span
                  className={
                    shift.staffName
                      ? "text-sm text-slate-700 dark:text-slate-300"
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
  );
}
