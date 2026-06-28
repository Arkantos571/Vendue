import type { Metadata } from "next";
import { StaffAvailabilityView } from "@/components/staff/staff-availability-view";
import { StaffEmptyState } from "@/components/staff/staff-empty-state";
import { StaffShell } from "@/components/staff/staff-shell";
import { loadStaffHomeData } from "@/lib/staff/data";

export const metadata: Metadata = {
  title: "Availability",
};

export default async function StaffAvailabilityPage() {
  const { profile } = await loadStaffHomeData();

  if (!profile) {
    return (
      <StaffShell title="Availability" backHref="/staff">
        <StaffEmptyState
          title="No staff profile found for this email yet."
          description="Ask your venue manager to add you to the team with the same email you use to sign in."
        />
      </StaffShell>
    );
  }

  return (
    <StaffShell title="Availability" backHref="/staff">
      <StaffAvailabilityView />
    </StaffShell>
  );
}
