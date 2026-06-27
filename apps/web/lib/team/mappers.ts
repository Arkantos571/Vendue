import type {
  AvailabilityStatus,
  EmploymentType,
  MockTeamMember,
  TeamRole,
} from "@/lib/mock/team";

export interface TeamMemberRow {
  id: string;
  venue_id: string;
  profile_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  role: TeamRole | null;
  job_title: string | null;
  department: string | null;
  employment_type: EmploymentType | null;
  availability_status: AvailabilityStatus;
  status: MockTeamMember["status"];
  hourly_rate: number | string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "—", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function parseHourlyRate(value: number | string | null): number | null {
  if (value === null || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toMockTeamMember(row: TeamMemberRow): MockTeamMember {
  const { firstName, lastName } = splitFullName(row.full_name);

  return {
    id: row.id,
    firstName,
    lastName,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role ?? "waiter",
    employmentType: row.employment_type ?? "casual",
    status: row.status,
    hourlyRate: parseHourlyRate(row.hourly_rate),
    upcomingShiftsCount: 0,
    availabilityStatus: row.availability_status,
    notes: row.notes,
    upcomingShifts: [],
    recentActivity: [],
  };
}

export function buildFullName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}
