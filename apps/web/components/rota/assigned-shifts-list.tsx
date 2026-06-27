import { ShiftStatusBadge } from "@/components/rota/shift-status-badge";
import { formatCurrencyPrecise, type AssignedShift } from "@/lib/mock/rota";
import { formatHourlyRate } from "@/lib/mock/team";

interface AssignedShiftsListProps {
  shifts: AssignedShift[];
}

export function AssignedShiftsList({ shifts }: AssignedShiftsListProps) {
  if (shifts.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-stone-900">Assigned shifts</h3>
        <p className="mt-4 text-sm text-stone-500">
          No shifts assigned yet. Add staff from the panel below or use the add shift form.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-stone-900">Assigned shifts</h3>
        <p className="mt-1 text-sm text-stone-500">
          {shifts.length} shift{shifts.length !== 1 ? "s" : ""} on this rota
        </p>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/50 text-xs font-medium uppercase tracking-wide text-stone-500">
              <th className="px-6 py-3">Staff</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Arrival</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">Finish</th>
              <th className="px-4 py-3">Break</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {shifts.map((shift) => (
              <tr key={shift.id} className="hover:bg-stone-50/50">
                <td className="px-6 py-4 font-medium text-stone-900">{shift.staffName}</td>
                <td className="px-4 py-4 text-stone-600">{shift.role}</td>
                <td className="px-4 py-4 text-stone-600">{shift.section}</td>
                <td className="px-4 py-4 text-stone-600">{shift.arrivalTime}</td>
                <td className="px-4 py-4 text-stone-600">{shift.startTime}</td>
                <td className="px-4 py-4 text-stone-600">{shift.finishTime}</td>
                <td className="px-4 py-4 text-stone-600">{shift.breakMinutes} min</td>
                <td className="px-4 py-4 text-stone-600">{formatHourlyRate(shift.hourlyRate)}</td>
                <td className="px-4 py-4 font-medium text-stone-900">
                  {formatCurrencyPrecise(shift.estimatedCost)}
                </td>
                <td className="max-w-[160px] truncate px-4 py-4 text-stone-500">
                  {shift.notes ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <ShiftStatusBadge status={shift.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 lg:hidden">
        {shifts.map((shift) => (
          <div key={shift.id} className="rounded-lg border border-stone-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-stone-900">{shift.staffName}</p>
                <p className="text-sm text-stone-500">
                  {shift.role} · {shift.section}
                </p>
              </div>
              <ShiftStatusBadge status={shift.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-stone-500">Arrival</dt>
                <dd className="text-stone-700">{shift.arrivalTime}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Start – finish</dt>
                <dd className="text-stone-700">
                  {shift.startTime} – {shift.finishTime}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Break</dt>
                <dd className="text-stone-700">{shift.breakMinutes} min</dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Cost</dt>
                <dd className="font-medium text-stone-900">
                  {formatCurrencyPrecise(shift.estimatedCost)}
                </dd>
              </div>
            </dl>
            {shift.notes && (
              <p className="mt-2 text-sm text-stone-500">{shift.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
