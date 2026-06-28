import { UserPlus } from "lucide-react";
import { AvailabilityBadge } from "@/components/team/availability-badge";
import { formatHourlyRate } from "@/lib/mock/team";
import type { AvailableStaffMember } from "@/lib/mock/rota";

interface AvailableStaffPanelProps {
  staff: AvailableStaffMember[];
  onAddToRota: (member: AvailableStaffMember) => void;
}

function StaffRow({
  member,
  onAddToRota,
}: {
  member: AvailableStaffMember;
  onAddToRota: (member: AvailableStaffMember) => void;
}) {
  return (
    <li className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-stone-900 dark:text-stone-100">{member.name}</p>
        <p className="text-sm text-stone-500 dark:text-stone-400">{member.role}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <AvailabilityBadge status={member.availability} />
          {member.isUnavailableForEvent ? (
            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">
              Unavailable
            </span>
          ) : null}
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {formatHourlyRate(member.hourlyRate)}
          </span>
          <span className="text-xs text-stone-400 dark:text-stone-500">
            · {member.upcomingShiftsCount} upcoming shift
            {member.upcomingShiftsCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAddToRota(member)}
        className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
      >
        <UserPlus className="h-4 w-4" />
        Add to rota
      </button>
    </li>
  );
}

export function AvailableStaffPanel({ staff, onAddToRota }: AvailableStaffPanelProps) {
  const available = staff.filter((member) => !member.isUnavailableForEvent);
  const unavailable = staff.filter((member) => member.isUnavailableForEvent);

  if (staff.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <div className="border-b border-stone-100 px-6 py-4 dark:border-stone-800">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Available staff</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Team members not yet on this rota.
          </p>
        </div>
        <p className="px-6 py-8 text-sm text-stone-500 dark:text-stone-400">
          All roster-eligible staff are already assigned to this rota.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <div className="border-b border-stone-100 px-6 py-4 dark:border-stone-800">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Available staff</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            No unavailability conflicts for this event.
          </p>
        </div>
        {available.length === 0 ? (
          <p className="px-6 py-8 text-sm text-stone-500 dark:text-stone-400">
            Everyone left on the roster is marked unavailable for this event time.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {available.map((member) => (
              <StaffRow key={member.id} member={member} onAddToRota={onAddToRota} />
            ))}
          </ul>
        )}
      </div>

      {unavailable.length > 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50/40 shadow-sm dark:border-red-900/60 dark:bg-red-950/20">
          <div className="border-b border-red-100 px-6 py-4 dark:border-red-900/40">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">Unavailable staff</h3>
            <p className="mt-1 text-sm text-red-800/80 dark:text-red-300/80">
              You can still assign them, but they have recorded unavailability during this event.
            </p>
          </div>
          <ul className="divide-y divide-red-100 dark:divide-red-900/40">
            {unavailable.map((member) => (
              <StaffRow key={member.id} member={member} onAddToRota={onAddToRota} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
