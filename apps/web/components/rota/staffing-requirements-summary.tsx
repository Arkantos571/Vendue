import type { StaffingRequirement } from "@/lib/mock/rota";

interface StaffingRequirementsSummaryProps {
  requirements: StaffingRequirement[];
}

export function StaffingRequirementsSummary({ requirements }: StaffingRequirementsSummaryProps) {
  return (
    <div className="v-panel">
      <h3 className="text-sm font-semibold text-stone-900">Staffing requirements</h3>
      <p className="mt-1 text-sm text-stone-500">
        Roles and headcount needed for this event.
      </p>

      <div className="mt-4 space-y-3">
        {requirements.map((requirement) => {
          const isFilled = requirement.assigned >= requirement.required;
          const gap = Math.max(0, requirement.required - requirement.assigned);

          return (
            <div key={requirement.role} className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-900">{requirement.role}</p>
                <p className="text-xs text-stone-500">
                  {requirement.assigned} of {requirement.required} assigned
                  {gap > 0 && <span className="text-amber-600"> · {gap} gap{gap !== 1 ? "s" : ""}</span>}
                </p>
              </div>
              <div className="flex h-2 w-24 overflow-hidden rounded-full bg-stone-100">
                <div
                  className={isFilled ? "bg-emerald-500" : "bg-amber-500"}
                  style={{
                    width: `${Math.min(100, (requirement.assigned / requirement.required) * 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
