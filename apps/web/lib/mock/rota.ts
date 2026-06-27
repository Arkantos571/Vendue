import { getEventById } from "@/lib/mock/events";
import { mockTeamMembers, type AvailabilityStatus } from "@/lib/mock/team";

export type RotaStatus =
  | "draft"
  | "needs_attention"
  | "ready_to_publish"
  | "published";

export type RotaStatusFilter = "all" | RotaStatus;

export type ShiftStatus = "draft" | "notified" | "confirmed";

export interface RotaEventSummary {
  eventId: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  space: string;
  guestCount: number;
  rotaStatus: RotaStatus;
  assignedStaffCount: number;
  requiredStaffCount: number;
  gapCount: number;
  estimatedLabourCost: number;
}

export interface StaffingRequirement {
  role: string;
  required: number;
  assigned: number;
}

export interface AssignedShift {
  id: string;
  staffMemberId: string;
  staffName: string;
  role: string;
  section: string;
  arrivalTime: string;
  startTime: string;
  finishTime: string;
  breakMinutes: number;
  hourlyRate: number;
  estimatedCost: number;
  notes: string | null;
  status: ShiftStatus;
}

export interface AvailableStaffMember {
  id: string;
  name: string;
  role: string;
  availability: AvailabilityStatus;
  hourlyRate: number | null;
  upcomingShiftsCount: number;
}

export interface LabourSummary {
  totalScheduledHours: number;
  estimatedLabourCost: number;
  requiredStaff: number;
  assignedStaff: number;
  remainingGaps: number;
}

export interface RotaBuilderData {
  eventId: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  space: string;
  guestCount: number;
  clientName: string;
  rotaStatus: RotaStatus;
  staffingRequirements: StaffingRequirement[];
  assignedShifts: AssignedShift[];
  availableStaff: AvailableStaffMember[];
  labourSummary: LabourSummary;
}

export const rotaStatusFilters: { value: RotaStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "needs_attention", label: "Needs attention" },
  { value: "ready_to_publish", label: "Ready to publish" },
  { value: "published", label: "Published" },
];

export const rotaStatusLabels: Record<RotaStatus, string> = {
  draft: "Draft",
  needs_attention: "Needs attention",
  ready_to_publish: "Ready to publish",
  published: "Published",
};

export const shiftStatusLabels: Record<ShiftStatus, string> = {
  draft: "Draft",
  notified: "Notified",
  confirmed: "Confirmed",
};

export const rotaSections = [
  "Main floor",
  "Bar",
  "Kitchen pass",
  "Reception",
  "Garden terrace",
  "VIP area",
  "Back of house",
];

export const rotaRoleOptions = [
  "Events coordinator",
  "Head waiter",
  "Waiting staff",
  "Bar staff",
  "Runner",
  "Reception",
  "Security",
  "Supervisor",
];

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function calculateShiftHours(
  startTime: string,
  finishTime: string,
  breakMinutes: number,
): number {
  let start = parseTimeToMinutes(startTime);
  let finish = parseTimeToMinutes(finishTime);
  if (finish < start) finish += 24 * 60;
  return Math.max(0, (finish - start - breakMinutes) / 60);
}

export function calculateShiftCost(
  startTime: string,
  finishTime: string,
  breakMinutes: number,
  hourlyRate: number,
): number {
  return calculateShiftHours(startTime, finishTime, breakMinutes) * hourlyRate;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function buildShift(
  id: string,
  staffMemberId: string,
  staffName: string,
  role: string,
  section: string,
  arrivalTime: string,
  startTime: string,
  finishTime: string,
  breakMinutes: number,
  hourlyRate: number,
  notes: string | null,
  status: ShiftStatus,
): AssignedShift {
  return {
    id,
    staffMemberId,
    staffName,
    role,
    section,
    arrivalTime,
    startTime,
    finishTime,
    breakMinutes,
    hourlyRate,
    estimatedCost: calculateShiftCost(startTime, finishTime, breakMinutes, hourlyRate),
    notes,
    status,
  };
}

const builderShifts: Record<string, AssignedShift[]> = {
  "evt-1": [
    buildShift("shift-1-1", "tm-1", "Jordan Lee", "Events coordinator", "Main floor", "17:30", "18:00", "23:30", 30, 18.5, "Lead setup and client liaison", "confirmed"),
    buildShift("shift-1-2", "tm-2", "Sam Patel", "Bar staff", "Bar", "18:00", "18:30", "23:30", 30, 14.0, null, "notified"),
    buildShift("shift-1-3", "tm-3", "Alex Morgan", "Waiting staff", "Main floor", "18:00", "18:30", "23:00", 30, 13.5, "Table 1–8", "confirmed"),
    buildShift("shift-1-4", "tm-4", "Priya Shah", "Waiting staff", "Main floor", "18:00", "18:30", "23:00", 30, 12.75, "Table 9–16", "draft"),
    buildShift("shift-1-5", "tm-9", "Daniel Frost", "Supervisor", "Main floor", "17:45", "18:15", "23:30", 30, 17.0, "Floor oversight", "confirmed"),
    buildShift("shift-1-6", "tm-8", "Sophie Clarke", "Reception", "Reception", "18:00", "18:30", "22:30", 20, 14.25, "Guest arrivals", "notified"),
    buildShift("shift-1-7", "tm-5", "Marcus Okafor", "Security", "Main floor", "18:00", "18:30", "23:30", 0, 16.0, null, "draft"),
    buildShift("shift-1-8", "tm-3", "Alex Morgan", "Runner", "Back of house", "18:30", "19:00", "23:00", 15, 13.5, "Covers second section", "draft"),
  ],
  "evt-2": [
    buildShift("shift-2-1", "tm-3", "Alex Morgan", "Waiting staff", "Garden terrace", "16:00", "16:30", "23:30", 30, 13.5, "Ceremony drinks service", "confirmed"),
    buildShift("shift-2-2", "tm-4", "Priya Shah", "Waiting staff", "Garden terrace", "16:30", "17:00", "23:30", 30, 12.75, null, "notified"),
    buildShift("shift-2-3", "tm-2", "Sam Patel", "Bar staff", "Bar", "17:00", "17:30", "23:30", 30, 14.0, "Champagne toast at 20:00", "draft"),
    buildShift("shift-2-4", "tm-8", "Sophie Clarke", "Reception", "Reception", "16:30", "17:00", "22:00", 20, 14.25, "Guest list check-in", "draft"),
    buildShift("shift-2-5", "tm-9", "Daniel Frost", "Supervisor", "Garden terrace", "16:30", "17:00", "23:30", 30, 17.0, null, "draft"),
    buildShift("shift-2-6", "tm-5", "Marcus Okafor", "Security", "Garden terrace", "17:00", "17:30", "23:30", 0, 16.0, null, "draft"),
  ],
  "evt-3": [],
  "evt-4": [
    buildShift("shift-4-1", "tm-1", "Jordan Lee", "Events coordinator", "VIP area", "18:00", "18:30", "00:30", 30, 18.5, "VIP reception from 18:00", "confirmed"),
    buildShift("shift-4-2", "tm-9", "Daniel Frost", "Supervisor", "Main floor", "18:00", "18:30", "00:30", 30, 17.0, null, "confirmed"),
    buildShift("shift-4-3", "tm-2", "Sam Patel", "Bar staff", "Bar", "18:30", "19:00", "00:30", 30, 14.0, "Two bars — main and foyer", "confirmed"),
    buildShift("shift-4-4", "tm-3", "Alex Morgan", "Waiting staff", "Main floor", "19:00", "19:30", "00:00", 30, 13.5, "Silent auction tables", "confirmed"),
    buildShift("shift-4-5", "tm-4", "Priya Shah", "Waiting staff", "Main floor", "19:00", "19:30", "00:00", 30, 12.75, null, "confirmed"),
    buildShift("shift-4-6", "tm-8", "Sophie Clarke", "Reception", "Reception", "18:00", "18:30", "23:30", 20, 14.25, null, "notified"),
    buildShift("shift-4-7", "tm-5", "Marcus Okafor", "Security", "Main floor", "18:30", "19:00", "00:30", 0, 16.0, null, "confirmed"),
    buildShift("shift-4-8", "tm-2", "Sam Patel", "Bar staff", "Bar", "19:00", "19:30", "00:30", 30, 14.0, "Second bar shift", "notified"),
    buildShift("shift-4-9", "tm-3", "Alex Morgan", "Runner", "Back of house", "19:30", "20:00", "00:00", 15, 13.5, null, "draft"),
    buildShift("shift-4-10", "tm-4", "Priya Shah", "Waiting staff", "VIP area", "18:30", "19:00", "23:30", 30, 12.75, "VIP canapés", "confirmed"),
    buildShift("shift-4-11", "tm-9", "Daniel Frost", "Head waiter", "Main floor", "19:00", "19:30", "00:30", 30, 17.0, null, "confirmed"),
    buildShift("shift-4-12", "tm-1", "Jordan Lee", "Events coordinator", "Main floor", "19:30", "20:00", "00:30", 30, 18.5, "Auction coordination", "confirmed"),
    buildShift("shift-4-13", "tm-8", "Sophie Clarke", "Reception", "Reception", "23:30", "00:00", "00:30", 0, 14.25, "Departures", "draft"),
    buildShift("shift-4-14", "tm-5", "Marcus Okafor", "Security", "Main floor", "00:00", "00:15", "00:30", 0, 16.0, "Close-out", "draft"),
  ],
  "evt-7": [
    buildShift("shift-7-1", "tm-3", "Alex Morgan", "Events coordinator", "Boardroom Suite", "12:00", "12:30", "15:30", 15, 13.5, "Board lunch service", "confirmed"),
    buildShift("shift-7-2", "tm-4", "Priya Shah", "Waiting staff", "Boardroom Suite", "12:15", "12:30", "15:00", 15, 12.75, null, "confirmed"),
    buildShift("shift-7-3", "tm-9", "Daniel Frost", "Supervisor", "Boardroom Suite", "12:00", "12:30", "15:30", 15, 17.0, null, "confirmed"),
  ],
};

const staffingRequirements: Record<string, StaffingRequirement[]> = {
  "evt-1": [
    { role: "Events coordinator", required: 1, assigned: 1 },
    { role: "Supervisor", required: 1, assigned: 1 },
    { role: "Waiting staff", required: 4, assigned: 2 },
    { role: "Bar staff", required: 2, assigned: 1 },
    { role: "Reception", required: 1, assigned: 1 },
    { role: "Security", required: 1, assigned: 1 },
  ],
  "evt-2": [
    { role: "Events coordinator", required: 1, assigned: 0 },
    { role: "Supervisor", required: 1, assigned: 1 },
    { role: "Waiting staff", required: 4, assigned: 2 },
    { role: "Bar staff", required: 1, assigned: 1 },
    { role: "Reception", required: 1, assigned: 1 },
    { role: "Security", required: 1, assigned: 1 },
  ],
  "evt-3": [
    { role: "Events coordinator", required: 1, assigned: 0 },
    { role: "Waiting staff", required: 2, assigned: 0 },
    { role: "Runner", required: 1, assigned: 0 },
  ],
  "evt-4": [
    { role: "Events coordinator", required: 2, assigned: 2 },
    { role: "Head waiter", required: 1, assigned: 1 },
    { role: "Supervisor", required: 1, assigned: 1 },
    { role: "Waiting staff", required: 4, assigned: 3 },
    { role: "Bar staff", required: 2, assigned: 2 },
    { role: "Reception", required: 2, assigned: 2 },
    { role: "Security", required: 2, assigned: 2 },
  ],
  "evt-7": [
    { role: "Events coordinator", required: 1, assigned: 1 },
    { role: "Supervisor", required: 1, assigned: 1 },
    { role: "Waiting staff", required: 1, assigned: 1 },
  ],
};

const rotaStatuses: Record<string, RotaStatus> = {
  "evt-1": "needs_attention",
  "evt-2": "draft",
  "evt-3": "draft",
  "evt-4": "ready_to_publish",
  "evt-7": "published",
};

function buildAvailableStaff(excludeIds: Set<string>): AvailableStaffMember[] {
  return mockTeamMembers
    .filter((member) => member.status === "active" && !excludeIds.has(member.id))
    .map((member) => ({
      id: member.id,
      name: member.fullName,
      role: member.role.charAt(0).toUpperCase() + member.role.slice(1),
      availability: member.availabilityStatus,
      hourlyRate: member.hourlyRate,
      upcomingShiftsCount: member.upcomingShiftsCount,
    }));
}

function buildLabourSummary(
  shifts: AssignedShift[],
  requiredStaff: number,
): LabourSummary {
  const totalScheduledHours = shifts.reduce(
    (total, shift) =>
      total + calculateShiftHours(shift.startTime, shift.finishTime, shift.breakMinutes),
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

export const mockRotaEventSummaries: RotaEventSummary[] = [
  "evt-1",
  "evt-2",
  "evt-3",
  "evt-4",
  "evt-7",
].map((eventId) => {
  const event = getEventById(eventId)!;
  const shifts = builderShifts[eventId] ?? [];
  const labourCost = shifts.reduce((total, shift) => total + shift.estimatedCost, 0);
  const assignedStaffCount = shifts.length;
  const gapCount = Math.max(0, event.requiredStaffCount - assignedStaffCount);

  return {
    eventId: event.id,
    eventName: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    space: event.space,
    guestCount: event.guestCount,
    rotaStatus: rotaStatuses[eventId] ?? "draft",
    assignedStaffCount,
    requiredStaffCount: event.requiredStaffCount,
    gapCount,
    estimatedLabourCost: labourCost,
  };
});

export function getRotaBuilderByEventId(eventId: string): RotaBuilderData | undefined {
  const event = getEventById(eventId);
  if (!event) return undefined;

  const shifts = builderShifts[eventId] ?? [];
  const assignedIds = new Set(shifts.map((shift) => shift.staffMemberId));

  return {
    eventId: event.id,
    eventName: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    space: event.space,
    guestCount: event.guestCount,
    clientName: event.clientName,
    rotaStatus: rotaStatuses[eventId] ?? "draft",
    staffingRequirements: staffingRequirements[eventId] ?? [],
    assignedShifts: shifts,
    availableStaff: buildAvailableStaff(assignedIds),
    labourSummary: buildLabourSummary(shifts, event.requiredStaffCount),
  };
}

export function getRotaEventSummary(eventId: string): RotaEventSummary | undefined {
  return mockRotaEventSummaries.find((summary) => summary.eventId === eventId);
}
