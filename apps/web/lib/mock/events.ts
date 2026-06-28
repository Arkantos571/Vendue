import type { EventRotaStatus, EventStatus } from "@/types";

export interface MockRotaShift {
  role: string;
  staffName: string | null;
}

export interface MockEvent {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  date: string;
  startTime: string;
  endTime: string;
  /** When true, end time is on the day after event date. Derived from times when omitted. */
  endsNextDay?: boolean;
  space: string;
  spaceId: string;
  eventType: string;
  eventTypeId: string;
  guestCount: number;
  status: EventStatus;
  notes: string | null;
  assignedStaffCount: number;
  requiredStaffCount: number;
  rotaShifts: MockRotaShift[];
  rotaStatus?: EventRotaStatus;
  rotaPublishedAt?: string | null;
}

export const mockSpaces = [
  { id: "space-1", name: "Main Ballroom" },
  { id: "space-2", name: "Garden Terrace" },
  { id: "space-3", name: "Boardroom Suite" },
  { id: "space-4", name: "Private Dining Room" },
];

export const mockEventTypes = [
  { id: "etype-1", name: "Wedding reception" },
  { id: "etype-2", name: "Corporate dinner" },
  { id: "etype-3", name: "Private dining" },
  { id: "etype-4", name: "Conference day" },
  { id: "etype-5", name: "Charity gala" },
];

export const mockEvents: MockEvent[] = [
  {
    id: "evt-1",
    title: "Corporate Dinner — Meridian Group",
    clientName: "Sarah Chen",
    clientEmail: "sarah.chen@meridiangroup.com",
    clientPhone: "+44 7700 900123",
    date: "2026-06-27",
    startTime: "18:30",
    endTime: "23:00",
    space: "Main Ballroom",
    spaceId: "space-1",
    eventType: "Corporate dinner",
    eventTypeId: "etype-2",
    guestCount: 120,
    status: "confirmed",
    notes: "Vegetarian menu required for 18 guests. AV setup from 16:00.",
    assignedStaffCount: 8,
    requiredStaffCount: 10,
    rotaShifts: [
      { role: "Events coordinator", staffName: "Jordan Lee" },
      { role: "Head waiter", staffName: null },
      { role: "Bar staff", staffName: "Sam Patel" },
      { role: "Bar staff", staffName: null },
    ],
  },
  {
    id: "evt-2",
    title: "Wedding Reception — Chen & Walsh",
    clientName: "Emily Walsh",
    clientEmail: "emily.walsh@email.com",
    clientPhone: "+44 7700 900456",
    date: "2026-06-28",
    startTime: "17:00",
    endTime: "23:30",
    space: "Garden Terrace",
    spaceId: "space-2",
    eventType: "Wedding reception",
    eventTypeId: "etype-1",
    guestCount: 85,
    status: "confirmed",
    notes: "First dance at 20:00. Sparkler send-off planned for 23:15.",
    assignedStaffCount: 6,
    requiredStaffCount: 8,
    rotaShifts: [
      { role: "Events coordinator", staffName: null },
      { role: "Waiting staff", staffName: "Alex Morgan" },
      { role: "Waiting staff", staffName: "Priya Shah" },
    ],
  },
  {
    id: "evt-3",
    title: "Product Launch Breakfast",
    clientName: "Tom Bradley",
    clientEmail: "tom@novatech.io",
    clientPhone: null,
    date: "2026-06-29",
    startTime: "08:00",
    endTime: "11:00",
    space: "Boardroom Suite",
    spaceId: "space-3",
    eventType: "Conference day",
    eventTypeId: "etype-4",
    guestCount: 40,
    status: "draft",
    notes: "Awaiting final guest count. Branding assets due Friday.",
    assignedStaffCount: 0,
    requiredStaffCount: 4,
    rotaShifts: [],
  },
  {
    id: "evt-4",
    title: "Charity Gala Evening",
    clientName: "Helen Foster",
    clientEmail: "helen@brightfuture.org",
    clientPhone: "+44 7700 900789",
    date: "2026-07-02",
    startTime: "19:00",
    endTime: "00:30",
    space: "Main Ballroom",
    spaceId: "space-1",
    eventType: "Charity gala",
    eventTypeId: "etype-5",
    guestCount: 200,
    status: "confirmed",
    notes: "Silent auction tables in foyer. VIP reception from 18:00.",
    assignedStaffCount: 12,
    requiredStaffCount: 14,
    rotaShifts: [
      { role: "Events coordinator", staffName: "Jordan Lee" },
      { role: "Bar staff", staffName: "Sam Patel" },
      { role: "Waiting staff", staffName: "Alex Morgan" },
    ],
  },
  {
    id: "evt-5",
    title: "Anniversary Dinner — Morrison Family",
    clientName: "David Morrison",
    clientEmail: "david.morrison@email.com",
    clientPhone: "+44 7700 900321",
    date: "2026-05-18",
    startTime: "19:30",
    endTime: "22:30",
    space: "Private Dining Room",
    spaceId: "space-4",
    eventType: "Private dining",
    eventTypeId: "etype-3",
    guestCount: 24,
    status: "completed",
    notes: "Champagne toast at 20:00. Cake service at 21:30.",
    assignedStaffCount: 4,
    requiredStaffCount: 4,
    rotaShifts: [
      { role: "Events coordinator", staffName: "Jordan Lee" },
      { role: "Waiting staff", staffName: "Priya Shah" },
    ],
  },
  {
    id: "evt-6",
    title: "Summer Garden Party — Cancelled",
    clientName: "Rachel Green",
    clientEmail: "rachel.green@email.com",
    clientPhone: "+44 7700 900654",
    date: "2026-07-10",
    startTime: "14:00",
    endTime: "18:00",
    space: "Garden Terrace",
    spaceId: "space-2",
    eventType: "Private dining",
    eventTypeId: "etype-3",
    guestCount: 60,
    status: "cancelled",
    notes: "Cancelled due to weather contingency. Deposit refund processed.",
    assignedStaffCount: 0,
    requiredStaffCount: 6,
    rotaShifts: [],
  },
  {
    id: "evt-7",
    title: "Board Strategy Lunch",
    clientName: "James Wright",
    clientEmail: "j.wright@apexholdings.com",
    clientPhone: "+44 7700 900987",
    date: "2026-06-27",
    startTime: "12:30",
    endTime: "15:00",
    space: "Boardroom Suite",
    spaceId: "space-3",
    eventType: "Corporate dinner",
    eventTypeId: "etype-2",
    guestCount: 16,
    status: "in_progress",
    notes: "Dietary: 2 gluten-free, 1 nut allergy.",
    assignedStaffCount: 3,
    requiredStaffCount: 3,
    rotaShifts: [
      { role: "Events coordinator", staffName: "Alex Morgan" },
      { role: "Waiting staff", staffName: "Priya Shah" },
    ],
  },
];

export type EventStatusFilter = "all" | "draft" | "confirmed" | "completed" | "cancelled";

export function getEventById(id: string): MockEvent | undefined {
  return mockEvents.find((event) => event.id === id);
}
