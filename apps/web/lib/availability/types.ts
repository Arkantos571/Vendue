export type UnavailabilityStatus = "pending" | "approved" | "rejected";

export type ScheduleAvailabilityIndicator =
  | "available"
  | "unavailable_today"
  | "unavailable_soon";

export interface UnavailabilityPeriod {
  id: string;
  venueId: string;
  teamMemberId: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  status: UnavailabilityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UnavailabilityInput {
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
  status?: UnavailabilityStatus;
}

export const unavailabilityStatusLabels: Record<UnavailabilityStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const scheduleAvailabilityLabels: Record<ScheduleAvailabilityIndicator, string> = {
  available: "Available",
  unavailable_today: "Unavailable today",
  unavailable_soon: "Unavailable soon",
};
