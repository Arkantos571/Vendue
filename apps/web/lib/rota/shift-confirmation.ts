import type { AssignedShift, ShiftStatus } from "@/lib/mock/rota";

export interface ShiftConfirmationSummary {
  totalAssigned: number;
  confirmedCount: number;
  pendingCount: number;
  declinedCount: number;
}

function isPendingStatus(status: ShiftStatus): boolean {
  return status === "notified" || status === "draft";
}

export function buildShiftConfirmationSummary(
  shifts: AssignedShift[],
): ShiftConfirmationSummary {
  const activeShifts = shifts.filter((shift) => shift.status !== "declined");

  return {
    totalAssigned: activeShifts.length,
    confirmedCount: shifts.filter((shift) => shift.status === "confirmed").length,
    pendingCount: shifts.filter((shift) => isPendingStatus(shift.status)).length,
    declinedCount: shifts.filter((shift) => shift.status === "declined").length,
  };
}

export function formatConfirmationSummary(summary: ShiftConfirmationSummary): string {
  if (summary.totalAssigned === 0) {
    return "No shifts assigned";
  }

  return `${summary.confirmedCount}/${summary.totalAssigned} confirmed`;
}
