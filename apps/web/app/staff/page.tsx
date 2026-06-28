import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StaffEmptyState } from "@/components/staff/staff-empty-state";
import { StaffShiftCard } from "@/components/staff/staff-shift-card";
import { StaffShell } from "@/components/staff/staff-shell";
import { loadStaffHomeData } from "@/lib/staff/data";

export const metadata: Metadata = {
  title: "My shifts",
};

export default async function StaffHomePage() {
  const { profile, nextShift, upcomingShifts } = await loadStaffHomeData();

  if (!profile) {
    return (
      <StaffShell title="Staff">
        <StaffEmptyState
          title="No staff profile found for this email yet."
          description="Ask your venue manager to add you to the team with the same email you use to sign in."
        />
      </StaffShell>
    );
  }

  return (
    <StaffShell title="My shifts">
      <div className="space-y-6">
        <section>
          <p className="text-sm text-stone-500 dark:text-stone-400">Welcome back</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-900 dark:text-stone-100">
            {profile.fullName}
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
            Your upcoming Venudue shifts
          </p>
        </section>

        {nextShift ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Next shift
              </h2>
              <span className="text-sm text-stone-500 dark:text-stone-400">
                {upcomingShifts.length} upcoming
              </span>
            </div>
            <StaffShiftCard shift={nextShift} compact />
          </section>
        ) : (
          <StaffEmptyState
            title="No upcoming shifts yet."
            description="When your manager assigns you to an event rota, your shifts will appear here."
          />
        )}

        {upcomingShifts.length > 0 && (
          <Link
            href="/staff/shifts"
            className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm font-medium text-stone-900 shadow-sm transition-colors hover:border-brand-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-brand-900"
          >
            View all shifts
            <ChevronRight className="h-4 w-4 text-brand-700 dark:text-brand-400" />
          </Link>
        )}
      </div>
    </StaffShell>
  );
}
