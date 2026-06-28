"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { EditShiftForm, type EditShiftInput } from "@/components/rota/edit-shift-form";
import { ShiftStatusBadge } from "@/components/rota/shift-status-badge";
import { Button } from "@/components/ui/button";
import { formatEventEndTime } from "@/lib/events/event-time";
import { formatCurrencyPrecise, type AssignedShift, type AvailableStaffMember } from "@/lib/mock/rota";
import { formatHourlyRate } from "@/lib/mock/team";

interface AssignedShiftsListProps {
  shifts: AssignedShift[];
  staffOptions: AvailableStaffMember[];
  onDeleteShift?: (shiftId: string) => void;
  onUpdateShift?: (input: EditShiftInput) => Promise<void>;
  isDeletingShiftId?: string | null;
  isUpdatingShiftId?: string | null;
}

function formatFinishTime(shift: AssignedShift): string {
  return formatEventEndTime(shift.finishTime, shift.finishIsNextDay ?? false);
}

export function AssignedShiftsList({
  shifts,
  staffOptions,
  onDeleteShift,
  onUpdateShift,
  isDeletingShiftId,
  isUpdatingShiftId,
}: AssignedShiftsListProps) {
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);

  if (shifts.length === 0) {
    return (
      <div className="v-panel">
        <h3 className="text-sm font-semibold text-foreground">Assigned shifts</h3>
        <p className="mt-4 text-sm text-muted-foreground">
          No shifts assigned yet. Add staff from the panel below or use the add shift form.
        </p>
      </div>
    );
  }

  const showActions = onDeleteShift || onUpdateShift;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-foreground">Assigned shifts</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {shifts.length} shift{shifts.length !== 1 ? "s" : ""} on this rota
        </p>
      </div>

      <div className="space-y-0">
        {shifts.map((shift) => (
          <div key={shift.id} className="border-b border-slate-100 p-4 last:border-b-0 dark:border-slate-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{shift.staffName}</p>
                <p className="text-sm text-muted-foreground">
                  {shift.role} · {shift.section} · {shift.startTime} – {formatFinishTime(shift)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatHourlyRate(shift.hourlyRate)} · {formatCurrencyPrecise(shift.estimatedCost)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ShiftStatusBadge status={shift.status} />
                {onUpdateShift ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUpdatingShiftId === shift.id}
                    onClick={() => setEditingShiftId(editingShiftId === shift.id ? null : shift.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                ) : null}
                {onDeleteShift ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDeletingShiftId === shift.id}
                    onClick={() => {
                      if (window.confirm(`Remove ${shift.staffName} from this rota?`)) {
                        onDeleteShift(shift.id);
                      }
                    }}
                    className="text-red-700 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
            {shift.notes ? <p className="mt-2 text-sm text-muted-foreground">{shift.notes}</p> : null}
            {editingShiftId === shift.id && onUpdateShift ? (
              <EditShiftForm
                shift={shift}
                staffOptions={staffOptions}
                isSubmitting={isUpdatingShiftId === shift.id}
                onCancel={() => setEditingShiftId(null)}
                onSave={async (input) => {
                  await onUpdateShift(input);
                  setEditingShiftId(null);
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
