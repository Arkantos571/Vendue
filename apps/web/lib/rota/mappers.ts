import { splitDateTime } from "@/lib/events/mappers";
import type { MockTeamMember } from "@/lib/mock/team";
import {
  calculateShiftCost,
  calculateShiftHours,
  decodeArrivalTime,
  finishTimeFromTimestamps,
  stripArrivalFromNotes,
} from "@/lib/rota/shift-time";
import type {
  AssignedShift,
  AvailableStaffMember,
  LabourSummary,
  RotaBuilderData,
  RotaEventSummary,
  RotaStatus,
  ShiftStatus,
  StaffingRequirement,
} from "@/lib/mock/rota";
import type { MockEvent } from "@/lib/mock/events";
import { buildShiftConfirmationSummary } from "@/lib/rota/shift-confirmation";
import type { RotaShiftStatus } from "@/src/types/database";

export interface RotaShiftRow {
  id: string;
  venue_id: string;
  event_id: string | null;
  team_member_id: string;
  role_label: string | null;
  section: string | null;
  starts_at: string;
  ends_at: string;
  break_minutes: number;
  status: RotaShiftStatus;
  hourly_rate: number | string | null;
  notes: string | null;
  team_members?: TeamMemberJoin | TeamMemberJoin[] | null;
}

interface TeamMemberJoin {
  id: string;
  full_name: string;
  hourly_rate: number | string | null;
  availability_status: MockTeamMember["availabilityStatus"];
  status: MockTeamMember["status"];
  role: MockTeamMember["role"] | null;
}

function joinRow<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function parseRate(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toUiShiftStatus(status: RotaShiftStatus): ShiftStatus {
  if (status === "confirmed" || status === "completed") return "confirmed";
  if (status === "declined") return "declined";
  if (status === "scheduled") return "notified";
  return "draft";
}

export function toAssignedShift(row: RotaShiftRow, eventDate: string): AssignedShift {
  const start = splitDateTime(row.starts_at);
  const { finishTime, finishIsNextDay } = finishTimeFromTimestamps(
    eventDate,
    row.starts_at,
    row.ends_at,
  );
  const arrivalTime = decodeArrivalTime(row.notes, start.time);
  const hourlyRate = parseRate(row.hourly_rate);
  const member = joinRow(row.team_members);

  return {
    id: row.id,
    staffMemberId: row.team_member_id,
    staffName: member?.full_name ?? "Unknown",
    role: row.role_label ?? "Staff",
    section: row.section ?? "—",
    arrivalTime,
    startTime: start.time,
    finishTime,
    finishIsNextDay,
    breakMinutes: row.break_minutes,
    hourlyRate,
    estimatedCost: calculateShiftCost(
      start.time,
      finishTime,
      finishIsNextDay,
      row.break_minutes,
      hourlyRate,
    ),
    notes: stripArrivalFromNotes(row.notes),
    status: toUiShiftStatus(row.status),
  };
}

export function buildLabourSummary(
  shifts: AssignedShift[],
  requiredStaff = 0,
): LabourSummary {
  const totalScheduledHours = shifts.reduce(
    (total, shift) =>
      total +
      calculateShiftHours(
        shift.startTime,
        shift.finishTime,
        shift.finishIsNextDay ?? false,
        shift.breakMinutes,
      ),
    0,
  );
  const estimatedLabourCost = shifts.reduce((total, shift) => total + shift.estimatedCost, 0);
  const assignedStaff = shifts.length;
  const remainingGaps = Math.max(0, requiredStaff - assignedStaff);

  return {
    totalScheduledHours,
    estimatedLabourCost,
    requiredStaff,
    assignedStaff,
    remainingGaps,
  };
}

export function toRotaEventSummary(
  event: MockEvent,
  shifts: AssignedShift[],
): RotaEventSummary {
  const labour = buildLabourSummary(shifts, 0);
  const assignedStaffCount = shifts.length;

  const confirmationSummary = buildShiftConfirmationSummary(shifts);

  return {
    eventId: event.id,
    eventName: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    endsNextDay: event.endsNextDay,
    space: event.space,
    guestCount: event.guestCount,
    rotaStatus: event.rotaStatus ?? "draft",
    assignedStaffCount,
    requiredStaffCount: assignedStaffCount,
    gapCount: 0,
    estimatedLabourCost: labour.estimatedLabourCost,
    totalScheduledHours: labour.totalScheduledHours,
    confirmedCount: confirmationSummary.confirmedCount,
    pendingConfirmationCount: confirmationSummary.pendingCount,
    declinedCount: confirmationSummary.declinedCount,
    rotaPublishedAt: event.rotaPublishedAt ?? null,
  };
}

export function isRosterEligible(status: MockTeamMember["status"]): boolean {
  return status === "active" || status === "invited";
}

export function toAvailableStaffMember(
  member: MockTeamMember,
  assignedShiftCount: number,
): AvailableStaffMember {
  return {
    id: member.id,
    name: member.fullName,
    role: member.role.charAt(0).toUpperCase() + member.role.slice(1),
    availability: member.availabilityStatus,
    hourlyRate: member.hourlyRate,
    upcomingShiftsCount: assignedShiftCount,
  };
}

export function buildRotaBuilderData(
  event: MockEvent,
  shifts: AssignedShift[],
  teamMembers: MockTeamMember[],
  staffingRequirements: StaffingRequirement[] = [],
): RotaBuilderData {
  const assignedIds = new Set(shifts.map((shift) => shift.staffMemberId));
  const shiftCounts = new Map<string, number>();

  for (const shift of shifts) {
    shiftCounts.set(shift.staffMemberId, (shiftCounts.get(shift.staffMemberId) ?? 0) + 1);
  }

  const availableStaff = teamMembers
    .filter((member) => isRosterEligible(member.status))
    .map((member) => toAvailableStaffMember(member, shiftCounts.get(member.id) ?? 0));

  const labourSummary = buildLabourSummary(shifts, staffingRequirements.reduce((t, r) => t + r.required, 0) || shifts.length);

  return {
    eventId: event.id,
    eventName: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    endsNextDay: event.endsNextDay,
    space: event.space,
    guestCount: event.guestCount,
    clientName: event.clientName,
    rotaStatus: event.rotaStatus ?? "draft",
    staffingRequirements,
    assignedShifts: shifts,
    availableStaff,
    labourSummary,
    confirmationSummary: buildShiftConfirmationSummary(shifts),
    rotaPublishedAt: event.rotaPublishedAt ?? null,
  };
}
