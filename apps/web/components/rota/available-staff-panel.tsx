import { UserPlus } from "lucide-react";
import { AvailabilityBadge } from "@/components/team/availability-badge";
import { formatHourlyRate } from "@/lib/mock/team";
import type { AvailableStaffMember } from "@/lib/mock/rota";

interface AvailableStaffPanelProps {
  staff: AvailableStaffMember[];
  onAddToRota: (member: AvailableStaffMember) => void;
}

export function AvailableStaffPanel({ staff, onAddToRota }: AvailableStaffPanelProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-stone-900">Available staff</h3>
        <p className="mt-1 text-sm text-stone-500">
          Team members not yet on this rota.
        </p>
      </div>

      {staff.length === 0 ? (
        <p className="px-6 py-8 text-sm text-stone-500">
          All active staff are already assigned to this rota.
        </p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {staff.map((member) => (
            <li key={member.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-stone-900">{member.name}</p>
                <p className="text-sm text-stone-500">{member.role}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <AvailabilityBadge status={member.availability} />
                  <span className="text-xs text-stone-500">
                    {formatHourlyRate(member.hourlyRate)}
                  </span>
                  <span className="text-xs text-stone-400">
                    · {member.upcomingShiftsCount} upcoming shift
                    {member.upcomingShiftsCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAddToRota(member)}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                <UserPlus className="h-4 w-4" />
                Add to rota
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
