import type { StaffingPlanSummary } from "@/lib/mock/function-sheet";
import type { TeamRole } from "@/src/types/database";

export interface RotaShiftStaffRow {
  staffName: string;
  roleLabel: string | null;
  teamRole: TeamRole | null;
}

type StaffBucket =
  | "manager"
  | "supervisor"
  | "bartender"
  | "waiter"
  | "runner"
  | "security"
  | "reception";

function categorizeRole(roleLabel: string | null, teamRole: TeamRole | null): StaffBucket {
  if (teamRole) {
    if (teamRole === "manager") return "manager";
    if (teamRole === "supervisor") return "supervisor";
    if (teamRole === "bartender") return "bartender";
    if (teamRole === "waiter" || teamRole === "kitchen") return "waiter";
    if (teamRole === "runner") return "runner";
    if (teamRole === "security") return "security";
    if (teamRole === "reception") return "reception";
  }

  const label = (roleLabel ?? "").toLowerCase();
  if (label.includes("manager")) return "manager";
  if (label.includes("supervisor")) return "supervisor";
  if (label.includes("bartender") || label.includes("bar")) return "bartender";
  if (label.includes("waiter") || label.includes("server") || label.includes("floor")) {
    return "waiter";
  }
  if (label.includes("runner")) return "runner";
  if (label.includes("security")) return "security";
  if (label.includes("reception")) return "reception";

  return "waiter";
}

function pushUnique(list: string[], name: string) {
  if (!list.includes(name)) {
    list.push(name);
  }
}

export function buildStaffingPlanFromShifts(shifts: RotaShiftStaffRow[]): StaffingPlanSummary {
  const plan: StaffingPlanSummary = {
    managerOnDuty: null,
    supervisors: [],
    bartenders: [],
    waiters: [],
    runners: [],
    security: [],
    reception: [],
  };

  for (const shift of shifts) {
    const bucket = categorizeRole(shift.roleLabel, shift.teamRole);
    const name = shift.staffName.trim();
    if (!name) {
      continue;
    }

    switch (bucket) {
      case "manager":
        if (!plan.managerOnDuty) {
          plan.managerOnDuty = name;
        } else {
          pushUnique(plan.supervisors, name);
        }
        break;
      case "supervisor":
        pushUnique(plan.supervisors, name);
        break;
      case "bartender":
        pushUnique(plan.bartenders, name);
        break;
      case "waiter":
        pushUnique(plan.waiters, name);
        break;
      case "runner":
        pushUnique(plan.runners, name);
        break;
      case "security":
        pushUnique(plan.security, name);
        break;
      case "reception":
        pushUnique(plan.reception, name);
        break;
    }
  }

  return plan;
}
