import type { RotaShiftStatus } from "@/src/types/database";

export interface StaffMemberProfile {
  id: string;
  fullName: string;
  email: string;
  venueId: string;
  venueName: string;
}

export interface StaffShift {
  id: string;
  teamMemberId: string;
  eventId: string | null;
  eventName: string;
  venueId: string;
  venueName: string;
  date: string;
  arrivalTime: string;
  startTime: string;
  finishTime: string;
  finishIsNextDay: boolean;
  role: string;
  section: string;
  breakMinutes: number;
  notes: string | null;
  status: RotaShiftStatus;
  space: string;
  eventType: string;
  guestCount: number | null;
}

export interface StaffHomeData {
  profile: StaffMemberProfile | null;
  nextShift: StaffShift | null;
  upcomingShifts: StaffShift[];
}
