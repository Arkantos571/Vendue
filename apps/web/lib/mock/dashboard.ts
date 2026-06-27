import type { EventStatus } from "@/types";

export interface DashboardStats {
  upcomingEvents: number;
  openRotaGaps: number;
  teamMembers: number;
  onboardingComplete: number;
  onboardingTotal: number;
}

export interface ActivityItem {
  id: string;
  type: "event" | "rota" | "team" | "onboarding";
  message: string;
  timestamp: string;
  actor: string;
}

export interface UpcomingEventPreview {
  id: string;
  title: string;
  space: string;
  date: string;
  startsAt: string;
  guestCount: number;
  status: EventStatus;
}

export interface RotaGapPreview {
  id: string;
  eventTitle: string;
  role: string;
  date: string;
  time: string;
  space: string;
  priority: "high" | "medium";
}

export interface OnboardingChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  href: string;
}

export const dashboardStats: DashboardStats = {
  upcomingEvents: 4,
  openRotaGaps: 3,
  teamMembers: 12,
  onboardingComplete: 3,
  onboardingTotal: 4,
};

export const recentActivity: ActivityItem[] = [
  {
    id: "act-1",
    type: "event",
    message: "Wedding reception confirmed for Main Ballroom",
    timestamp: "2026-06-26T09:15:00Z",
    actor: "Alex Morgan",
  },
  {
    id: "act-2",
    type: "rota",
    message: "Bar staff shift added for Corporate Dinner",
    timestamp: "2026-06-26T08:40:00Z",
    actor: "Jordan Lee",
  },
  {
    id: "act-3",
    type: "team",
    message: "Sam Patel invited to the venue team",
    timestamp: "2026-06-25T16:20:00Z",
    actor: "Alex Morgan",
  },
  {
    id: "act-4",
    type: "onboarding",
    message: "Event types configured for The Grand Assembly",
    timestamp: "2026-06-25T14:05:00Z",
    actor: "Alex Morgan",
  },
  {
    id: "act-5",
    type: "event",
    message: "Private dining enquiry moved to draft",
    timestamp: "2026-06-25T11:30:00Z",
    actor: "Jordan Lee",
  },
];

export const upcomingEvents: UpcomingEventPreview[] = [
  {
    id: "evt-1",
    title: "Corporate Dinner — Meridian Group",
    space: "Main Ballroom",
    date: "2026-06-27",
    startsAt: "18:30",
    guestCount: 120,
    status: "confirmed",
  },
  {
    id: "evt-2",
    title: "Wedding Reception — Chen & Walsh",
    space: "Garden Terrace",
    date: "2026-06-28",
    startsAt: "17:00",
    guestCount: 85,
    status: "confirmed",
  },
  {
    id: "evt-3",
    title: "Product Launch Breakfast",
    space: "Boardroom Suite",
    date: "2026-06-29",
    startsAt: "08:00",
    guestCount: 40,
    status: "draft",
  },
  {
    id: "evt-4",
    title: "Charity Gala Evening",
    space: "Main Ballroom",
    date: "2026-07-02",
    startsAt: "19:00",
    guestCount: 200,
    status: "confirmed",
  },
];

export const rotaGaps: RotaGapPreview[] = [
  {
    id: "gap-1",
    eventTitle: "Corporate Dinner — Meridian Group",
    role: "Head waiter",
    date: "2026-06-27",
    time: "17:30 – 23:00",
    space: "Main Ballroom",
    priority: "high",
  },
  {
    id: "gap-2",
    eventTitle: "Corporate Dinner — Meridian Group",
    role: "Bar staff",
    date: "2026-06-27",
    time: "18:00 – 23:30",
    space: "Main Ballroom",
    priority: "high",
  },
  {
    id: "gap-3",
    eventTitle: "Wedding Reception — Chen & Walsh",
    role: "Events coordinator",
    date: "2026-06-28",
    time: "15:00 – 22:00",
    space: "Garden Terrace",
    priority: "medium",
  },
];

export const onboardingChecklist: OnboardingChecklistItem[] = [
  {
    id: "ob-1",
    label: "Venue profile",
    description: "Name, type, and regional defaults",
    completed: true,
    href: "/dashboard/settings#venue-setup",
  },
  {
    id: "ob-2",
    label: "Spaces configured",
    description: "Rooms and areas available for events",
    completed: true,
    href: "/dashboard/settings#venue-setup",
  },
  {
    id: "ob-3",
    label: "Event types defined",
    description: "Templates for faster event creation",
    completed: true,
    href: "/dashboard/settings#venue-setup",
  },
  {
    id: "ob-4",
    label: "Team roster started",
    description: "Add staff before building rotas",
    completed: false,
    href: "/dashboard/team",
  },
];
