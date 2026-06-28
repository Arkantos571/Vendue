import type { Metadata } from "next";
import { StaffEmptyState } from "@/components/staff/staff-empty-state";
import { StaffShiftCard } from "@/components/staff/staff-shift-card";
import { StaffShell } from "@/components/staff/staff-shell";
import { loadStaffShiftsList } from "@/lib/staff/data";

export const metadata: Metadata = {
  title: "All shifts",
};

export default async function StaffShiftsPage() {
  const { profile, shifts } = await loadStaffShiftsList();

  if (!profile) {
    return (
      <StaffShell title="All shifts" backHref="/staff">
        <StaffEmptyState
          title="No staff profile found for this email yet."
          description="Ask your venue manager to add you to the team with the same email you use to sign in."
        />
      </StaffShell>
    );
  }

  return (
    <StaffShell title="All shifts" backHref="/staff">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Your shifts</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Upcoming assignments for {profile.fullName}
          </p>
        </div>

        {shifts.length === 0 ? (
          <StaffEmptyState
            title="No published shifts yet."
            description="When your manager publishes your event rota, your shifts will appear here."
          />
        ) : (
          <div className="space-y-3">
            {shifts.map((shift) => (
              <StaffShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        )}
      </div>
    </StaffShell>
  );
}
