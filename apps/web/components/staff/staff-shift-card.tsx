import Link from "next/link";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { StaffShiftStatusBadge } from "@/components/staff/staff-shift-status-badge";
import { formatStaffShiftTimeRange } from "@/lib/staff/mappers";
import type { StaffShift } from "@/lib/staff/types";
import { formatDate } from "@/lib/utils";

export function StaffShiftCard({ shift, compact = false }: { shift: StaffShift; compact?: boolean }) {
  return (
    <Link
      href={`/staff/shifts/${shift.id}`}
      className="block rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50/30 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-brand-900 dark:hover:bg-brand-950/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-stone-900 dark:text-stone-100">
            {shift.eventName}
          </p>
          <p className="mt-0.5 truncate text-sm text-stone-500 dark:text-stone-400">{shift.venueName}</p>
        </div>
        <StaffShiftStatusBadge status={shift.status} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-stone-700 dark:text-stone-300">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-stone-400" />
          <span>
            {formatDate(shift.date)} · Arrive {shift.arrivalTime} ·{" "}
            {formatStaffShiftTimeRange(shift)}
          </span>
        </div>
        {!compact && (
          <>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-stone-400" />
              <span>
                {shift.role} · {shift.section}
                {shift.breakMinutes > 0 ? ` · ${shift.breakMinutes}m break` : ""}
              </span>
            </div>
            {shift.notes && (
              <p className="rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:bg-stone-800/60 dark:text-stone-300">
                {shift.notes}
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end text-xs font-medium text-brand-700 dark:text-brand-400">
        View shift
        <ChevronRight className="ml-1 h-4 w-4" />
      </div>
    </Link>
  );
}
