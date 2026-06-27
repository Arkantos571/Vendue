import type { TeamMemberStatus } from "@/types";

export type TeamRole =
  | "manager"
  | "supervisor"
  | "bartender"
  | "waiter"
  | "runner"
  | "reception"
  | "kitchen"
  | "security";

export type EmploymentType = "full_time" | "part_time" | "casual" | "agency";

export type AvailabilityStatus = "available" | "limited" | "unavailable";

export interface MockUpcomingShift {
  id: string;
  eventTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  roleLabel: string;
}

export interface MockTeamActivity {
  id: string;
  message: string;
  timestamp: string;
}

export interface MockTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: TeamRole;
  employmentType: EmploymentType;
  status: TeamMemberStatus;
  hourlyRate: number | null;
  upcomingShiftsCount: number;
  availabilityStatus: AvailabilityStatus;
  notes: string | null;
  upcomingShifts: MockUpcomingShift[];
  recentActivity: MockTeamActivity[];
}

export const teamRoleOptions: { value: TeamRole; label: string }[] = [
  { value: "manager", label: "Manager" },
  { value: "supervisor", label: "Supervisor" },
  { value: "bartender", label: "Bartender" },
  { value: "waiter", label: "Waiter" },
  { value: "runner", label: "Runner" },
  { value: "reception", label: "Reception" },
  { value: "kitchen", label: "Kitchen" },
  { value: "security", label: "Security" },
];

export const employmentTypeOptions: { value: EmploymentType; label: string }[] = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "casual", label: "Casual" },
  { value: "agency", label: "Agency" },
];

export type TeamRoleFilter = "all" | TeamRole;
export type TeamStatusFilter = "all" | TeamMemberStatus;

export const mockTeamMembers: MockTeamMember[] = [
  {
    id: "tm-1",
    firstName: "Jordan",
    lastName: "Lee",
    fullName: "Jordan Lee",
    email: "jordan.lee@grandassembly.com",
    phone: "+44 7700 901001",
    role: "manager",
    employmentType: "full_time",
    status: "active",
    hourlyRate: 18.5,
    upcomingShiftsCount: 4,
    availabilityStatus: "available",
    notes: "Lead events coordinator. Certified first aider.",
    upcomingShifts: [
      {
        id: "rs-1",
        eventTitle: "Corporate Dinner — Meridian Group",
        date: "2026-06-27",
        startTime: "17:30",
        endTime: "23:30",
        roleLabel: "Events coordinator",
      },
      {
        id: "rs-2",
        eventTitle: "Charity Gala Evening",
        date: "2026-07-02",
        startTime: "18:00",
        endTime: "00:30",
        roleLabel: "Events coordinator",
      },
    ],
    recentActivity: [
      { id: "ta-1", message: "Assigned to Corporate Dinner rota", timestamp: "2026-06-26T09:00:00Z" },
      { id: "ta-2", message: "Profile updated", timestamp: "2026-06-24T14:30:00Z" },
    ],
  },
  {
    id: "tm-2",
    firstName: "Sam",
    lastName: "Patel",
    fullName: "Sam Patel",
    email: "sam.patel@grandassembly.com",
    phone: "+44 7700 901002",
    role: "bartender",
    employmentType: "part_time",
    status: "active",
    hourlyRate: 14.0,
    upcomingShiftsCount: 3,
    availabilityStatus: "limited",
    notes: "Available Thu–Sun evenings only.",
    upcomingShifts: [
      {
        id: "rs-3",
        eventTitle: "Corporate Dinner — Meridian Group",
        date: "2026-06-27",
        startTime: "18:00",
        endTime: "23:30",
        roleLabel: "Bar staff",
      },
    ],
    recentActivity: [
      { id: "ta-3", message: "Shift confirmed for Charity Gala", timestamp: "2026-06-25T11:00:00Z" },
    ],
  },
  {
    id: "tm-3",
    firstName: "Alex",
    lastName: "Morgan",
    fullName: "Alex Morgan",
    email: "alex.morgan@grandassembly.com",
    phone: "+44 7700 901003",
    role: "waiter",
    employmentType: "full_time",
    status: "active",
    hourlyRate: 13.5,
    upcomingShiftsCount: 2,
    availabilityStatus: "available",
    notes: null,
    upcomingShifts: [
      {
        id: "rs-4",
        eventTitle: "Wedding Reception — Chen & Walsh",
        date: "2026-06-28",
        startTime: "16:00",
        endTime: "23:30",
        roleLabel: "Waiting staff",
      },
    ],
    recentActivity: [],
  },
  {
    id: "tm-4",
    firstName: "Priya",
    lastName: "Shah",
    fullName: "Priya Shah",
    email: "priya.shah@grandassembly.com",
    phone: "+44 7700 901004",
    role: "waiter",
    employmentType: "casual",
    status: "active",
    hourlyRate: 12.75,
    upcomingShiftsCount: 2,
    availabilityStatus: "available",
    notes: "Prefers floor service over bar work.",
    upcomingShifts: [],
    recentActivity: [
      { id: "ta-4", message: "Added to Wedding Reception rota", timestamp: "2026-06-26T08:15:00Z" },
    ],
  },
  {
    id: "tm-5",
    firstName: "Marcus",
    lastName: "Okafor",
    fullName: "Marcus Okafor",
    email: "marcus.okafor@agency-staff.co.uk",
    phone: "+44 7700 901005",
    role: "security",
    employmentType: "agency",
    status: "active",
    hourlyRate: 16.0,
    upcomingShiftsCount: 1,
    availabilityStatus: "available",
    notes: "Agency contact: BrightStaff Ltd.",
    upcomingShifts: [],
    recentActivity: [],
  },
  {
    id: "tm-6",
    firstName: "Elena",
    lastName: "Russo",
    fullName: "Elena Russo",
    email: "elena.russo@email.com",
    phone: null,
    role: "kitchen",
    employmentType: "part_time",
    status: "invited",
    hourlyRate: 13.0,
    upcomingShiftsCount: 0,
    availabilityStatus: "unavailable",
    notes: "Invite sent — awaiting account setup.",
    upcomingShifts: [],
    recentActivity: [
      { id: "ta-5", message: "Invitation sent", timestamp: "2026-06-25T16:00:00Z" },
    ],
  },
  {
    id: "tm-7",
    firstName: "Tom",
    lastName: "Hughes",
    fullName: "Tom Hughes",
    email: "tom.hughes@grandassembly.com",
    phone: "+44 7700 901007",
    role: "runner",
    employmentType: "casual",
    status: "inactive",
    hourlyRate: 11.5,
    upcomingShiftsCount: 0,
    availabilityStatus: "unavailable",
    notes: "On leave until September.",
    upcomingShifts: [],
    recentActivity: [
      { id: "ta-6", message: "Marked inactive", timestamp: "2026-06-01T10:00:00Z" },
    ],
  },
  {
    id: "tm-8",
    firstName: "Sophie",
    lastName: "Clarke",
    fullName: "Sophie Clarke",
    email: "sophie.clarke@grandassembly.com",
    phone: "+44 7700 901008",
    role: "reception",
    employmentType: "full_time",
    status: "active",
    hourlyRate: 14.25,
    upcomingShiftsCount: 1,
    availabilityStatus: "limited",
    notes: "Front-of-house lead for guest arrivals.",
    upcomingShifts: [
      {
        id: "rs-5",
        eventTitle: "Charity Gala Evening",
        date: "2026-07-02",
        startTime: "18:00",
        endTime: "23:00",
        roleLabel: "Reception",
      },
    ],
    recentActivity: [],
  },
  {
    id: "tm-9",
    firstName: "Daniel",
    lastName: "Frost",
    fullName: "Daniel Frost",
    email: "daniel.frost@grandassembly.com",
    phone: "+44 7700 901009",
    role: "supervisor",
    employmentType: "full_time",
    status: "active",
    hourlyRate: 17.0,
    upcomingShiftsCount: 3,
    availabilityStatus: "available",
    notes: "Floor supervisor for large-format events.",
    upcomingShifts: [],
    recentActivity: [
      { id: "ta-7", message: "Promoted to supervisor", timestamp: "2026-05-15T09:00:00Z" },
    ],
  },
];

export function getTeamMemberById(id: string): MockTeamMember | undefined {
  return mockTeamMembers.find((member) => member.id === id);
}

export function formatTeamRole(role: TeamRole): string {
  return teamRoleOptions.find((option) => option.value === role)?.label ?? role;
}

export function formatEmploymentType(type: EmploymentType): string {
  return employmentTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export function formatHourlyRate(rate: number | null): string {
  if (rate === null) return "—";
  return `£${rate.toFixed(2)}/hr`;
}
