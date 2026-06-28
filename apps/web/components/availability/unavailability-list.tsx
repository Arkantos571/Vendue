"use client";

import { Trash2 } from "lucide-react";
import { UnavailabilityStatusBadge } from "@/components/availability/unavailability-status-badge";
import { formatUnavailabilityRange } from "@/lib/availability/overlap";
import type { UnavailabilityPeriod } from "@/lib/availability/types";

interface UnavailabilityListProps {
  periods: UnavailabilityPeriod[];
  deletingId?: string | null;
  canDelete?: (period: UnavailabilityPeriod) => boolean;
  onDelete?: (periodId: string) => void;
  emptyMessage?: string;
}

export function UnavailabilityList({
  periods,
  deletingId = null,
  canDelete,
  onDelete,
  emptyMessage = "No upcoming unavailability recorded.",
}: UnavailabilityListProps) {
  if (periods.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-stone-100 rounded-lg border border-slate-200 dark:divide-stone-800 dark:border-slate-700">
      {periods.map((period) => {
        const showDelete = onDelete && (canDelete ? canDelete(period) : true);

        return (
          <li
            key={period.id}
            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {formatUnavailabilityRange(period)}
                </p>
                <UnavailabilityStatusBadge status={period.status} />
              </div>
              {period.reason ? (
                <p className="mt-1 text-sm text-muted-foreground">{period.reason}</p>
              ) : null}
            </div>
            {showDelete ? (
              <button
                type="button"
                onClick={() => onDelete(period.id)}
                disabled={deletingId === period.id}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Trash2 className="h-4 w-4" />
                {deletingId === period.id ? "Removing…" : "Remove"}
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
