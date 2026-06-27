import { mockEventTypes, mockSpaces } from "@/lib/mock/events";

export type EnquiryStatus =
  | "new"
  | "contacted"
  | "proposal_sent"
  | "confirmed"
  | "lost";

export type EnquiryStatusFilter = "all" | EnquiryStatus;

export type EnquiryPriority = "low" | "medium" | "high";

export type EnquirySource =
  | "website"
  | "phone"
  | "email"
  | "referral"
  | "walk_in"
  | "agency";

export interface EnquiryActivityItem {
  id: string;
  type: "received" | "contacted" | "proposal_sent" | "follow_up" | "confirmed" | "lost";
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface MockEnquiry {
  id: string;
  eventName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  company: string | null;
  clientPreferences: string | null;
  requestedDate: string;
  preferredStartTime: string;
  preferredEndTime: string;
  preferredEndIsNextDay?: boolean;
  eventType: string;
  eventTypeId: string;
  spacePreference: string;
  spacePreferenceId: string | null;
  guestCount: number;
  budgetEstimate: number;
  estimatedValue: number;
  status: EnquiryStatus;
  source: EnquirySource;
  assignedOwner: string;
  lastContactDate: string | null;
  nextFollowUpDate: string | null;
  priority: EnquiryPriority;
  notes: string | null;
  internalNotes: string | null;
  activity: EnquiryActivityItem[];
  createdAt: string;
}

export interface EnquiryPipelineStats {
  newEnquiries: number;
  awaitingReply: number;
  proposalSent: number;
  conversionRate: number;
}

export const enquiryStatusLabels: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  proposal_sent: "Proposal sent",
  confirmed: "Confirmed",
  lost: "Lost",
};

export const enquiryStatusFilters: { value: EnquiryStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "proposal_sent", label: "Proposal sent" },
  { value: "confirmed", label: "Confirmed" },
  { value: "lost", label: "Lost" },
];

export const enquirySourceLabels: Record<EnquirySource, string> = {
  website: "Website",
  phone: "Phone",
  email: "Email",
  referral: "Referral",
  walk_in: "Walk-in",
  agency: "Agency",
};

export const enquiryPriorityLabels: Record<EnquiryPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const enquirySourceOptions = Object.entries(enquirySourceLabels).map(([value, label]) => ({
  value: value as EnquirySource,
  label,
}));

export function formatEnquiryCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const mockEnquiries: MockEnquiry[] = [
  {
    id: "enq-1",
    eventName: "Summer Product Launch Dinner",
    clientName: "Tom Bradley",
    clientEmail: "tom@novatech.io",
    clientPhone: "+44 7700 902101",
    company: "NovaTech Ltd",
    clientPreferences: "Prefers modern plating and minimal branding in room.",
    requestedDate: "2026-07-15",
    preferredStartTime: "18:30",
    preferredEndTime: "23:00",
    eventType: "Corporate dinner",
    eventTypeId: "etype-2",
    spacePreference: "Main Ballroom",
    spacePreferenceId: "space-1",
    guestCount: 85,
    budgetEstimate: 12000,
    estimatedValue: 14500,
    status: "new",
    source: "website",
    assignedOwner: "Alex Morgan",
    lastContactDate: null,
    nextFollowUpDate: "2026-06-28",
    priority: "high",
    notes: "Interested in AV package and vegetarian menu for 12 guests.",
    internalNotes: "Strong lead — respond within 24 hours.",
    createdAt: "2026-06-26T08:30:00Z",
    activity: [
      {
        id: "enq-1-a1",
        type: "received",
        title: "Enquiry received",
        description: "Submitted via website contact form.",
        timestamp: "2026-06-26T08:30:00Z",
        actor: "System",
      },
      {
        id: "enq-1-a2",
        type: "follow_up",
        title: "Follow-up due",
        description: "Initial response and availability check.",
        timestamp: "2026-06-28T09:00:00Z",
        actor: "Alex Morgan",
      },
    ],
  },
  {
    id: "enq-2",
    eventName: "Autumn Wedding Reception",
    clientName: "Emily Walsh",
    clientEmail: "emily.walsh@email.com",
    clientPhone: "+44 7700 902102",
    company: null,
    clientPreferences: "Garden ceremony followed by terrace reception.",
    requestedDate: "2026-09-12",
    preferredStartTime: "16:00",
    preferredEndTime: "23:30",
    eventType: "Wedding reception",
    eventTypeId: "etype-1",
    spacePreference: "Garden Terrace",
    spacePreferenceId: "space-2",
    guestCount: 90,
    budgetEstimate: 22000,
    estimatedValue: 26500,
    status: "contacted",
    source: "referral",
    assignedOwner: "Jordan Lee",
    lastContactDate: "2026-06-25",
    nextFollowUpDate: "2026-06-29",
    priority: "high",
    notes: "Referred by Chen & Walsh wedding. Wants tasting session.",
    internalNotes: "Send brochure and sample menu options.",
    createdAt: "2026-06-24T14:00:00Z",
    activity: [
      {
        id: "enq-2-a1",
        type: "received",
        title: "Enquiry received",
        description: "Referral from previous client.",
        timestamp: "2026-06-24T14:00:00Z",
        actor: "System",
      },
      {
        id: "enq-2-a2",
        type: "contacted",
        title: "Client contacted",
        description: "Intro call completed — shared availability for September.",
        timestamp: "2026-06-25T11:30:00Z",
        actor: "Jordan Lee",
      },
      {
        id: "enq-2-a3",
        type: "follow_up",
        title: "Follow-up due",
        description: "Send proposal and tasting invite.",
        timestamp: "2026-06-29T10:00:00Z",
        actor: "Jordan Lee",
      },
    ],
  },
  {
    id: "enq-3",
    eventName: "Executive Board Dinner",
    clientName: "James Wright",
    clientEmail: "j.wright@apexholdings.com",
    clientPhone: "+44 7700 902103",
    company: "Apex Holdings",
    clientPreferences: "Private dining, discrete service, no photography.",
    requestedDate: "2026-07-08",
    preferredStartTime: "19:00",
    preferredEndTime: "22:30",
    eventType: "Corporate dinner",
    eventTypeId: "etype-2",
    spacePreference: "Boardroom Suite",
    spacePreferenceId: "space-3",
    guestCount: 18,
    budgetEstimate: 4500,
    estimatedValue: 5200,
    status: "proposal_sent",
    source: "email",
    assignedOwner: "Alex Morgan",
    lastContactDate: "2026-06-26",
    nextFollowUpDate: "2026-07-01",
    priority: "medium",
    notes: "Wine pairing required. Two board members gluten-free.",
    internalNotes: "Proposal v2 sent with updated wine list.",
    createdAt: "2026-06-20T10:15:00Z",
    activity: [
      {
        id: "enq-3-a1",
        type: "received",
        title: "Enquiry received",
        description: "Email enquiry from executive assistant.",
        timestamp: "2026-06-20T10:15:00Z",
        actor: "System",
      },
      {
        id: "enq-3-a2",
        type: "contacted",
        title: "Client contacted",
        description: "Requirements call with EA and James Wright.",
        timestamp: "2026-06-22T15:00:00Z",
        actor: "Alex Morgan",
      },
      {
        id: "enq-3-a3",
        type: "proposal_sent",
        title: "Proposal sent",
        description: "Sent board dinner package proposal (£5,200).",
        timestamp: "2026-06-26T09:45:00Z",
        actor: "Alex Morgan",
      },
    ],
  },
  {
    id: "enq-4",
    eventName: "Charity Fundraiser Gala",
    clientName: "Helen Foster",
    clientEmail: "helen@brightfuture.org",
    clientPhone: "+44 7700 902104",
    company: "Bright Future Foundation",
    clientPreferences: "Silent auction area and VIP reception.",
    requestedDate: "2026-10-18",
    preferredStartTime: "18:30",
    preferredEndTime: "00:30",
    eventType: "Charity gala",
    eventTypeId: "etype-5",
    spacePreference: "Main Ballroom",
    spacePreferenceId: "space-1",
    guestCount: 180,
    budgetEstimate: 35000,
    estimatedValue: 42000,
    status: "confirmed",
    source: "phone",
    assignedOwner: "Jordan Lee",
    lastContactDate: "2026-06-24",
    nextFollowUpDate: null,
    priority: "high",
    notes: "Deposit received. Converted to confirmed booking.",
    internalNotes: "Linked to evt-4 planning — repeat annual client.",
    createdAt: "2026-05-10T09:00:00Z",
    activity: [
      {
        id: "enq-4-a1",
        type: "received",
        title: "Enquiry received",
        description: "Phone enquiry for annual gala.",
        timestamp: "2026-05-10T09:00:00Z",
        actor: "Jordan Lee",
      },
      {
        id: "enq-4-a2",
        type: "proposal_sent",
        title: "Proposal sent",
        description: "Full gala package proposal sent.",
        timestamp: "2026-05-18T14:00:00Z",
        actor: "Jordan Lee",
      },
      {
        id: "enq-4-a3",
        type: "confirmed",
        title: "Booking confirmed",
        description: "Contract signed and deposit paid.",
        timestamp: "2026-06-24T16:30:00Z",
        actor: "Jordan Lee",
      },
    ],
  },
  {
    id: "enq-5",
    eventName: "Private Birthday Celebration",
    clientName: "David Morrison",
    clientEmail: "david.morrison@email.com",
    clientPhone: "+44 7700 902105",
    company: null,
    clientPreferences: "Intimate dinner, champagne toast at 20:00.",
    requestedDate: "2026-08-22",
    preferredStartTime: "19:00",
    preferredEndTime: "23:00",
    eventType: "Private dining",
    eventTypeId: "etype-3",
    spacePreference: "Private Dining Room",
    spacePreferenceId: "space-4",
    guestCount: 28,
    budgetEstimate: 6000,
    estimatedValue: 7200,
    status: "contacted",
    source: "walk_in",
    assignedOwner: "Sophie Clarke",
    lastContactDate: "2026-06-23",
    nextFollowUpDate: "2026-06-30",
    priority: "medium",
    notes: "Visited venue after anniversary dinner. Interested in similar setup.",
    internalNotes: "Awaiting guest count confirmation.",
    createdAt: "2026-06-22T17:00:00Z",
    activity: [
      {
        id: "enq-5-a1",
        type: "received",
        title: "Enquiry received",
        description: "Walk-in visit — brochure taken.",
        timestamp: "2026-06-22T17:00:00Z",
        actor: "Sophie Clarke",
      },
      {
        id: "enq-5-a2",
        type: "contacted",
        title: "Client contacted",
        description: "Follow-up email sent with private dining options.",
        timestamp: "2026-06-23T10:00:00Z",
        actor: "Sophie Clarke",
      },
    ],
  },
  {
    id: "enq-6",
    eventName: "Agency Summer Party",
    clientName: "Rachel Green",
    clientEmail: "rachel.green@agency.com",
    clientPhone: "+44 7700 902106",
    company: "Green & Co Agency",
    clientPreferences: null,
    requestedDate: "2026-07-20",
    preferredStartTime: "14:00",
    preferredEndTime: "22:00",
    eventType: "Private dining",
    eventTypeId: "etype-3",
    spacePreference: "Garden Terrace",
    spacePreferenceId: "space-2",
    guestCount: 70,
    budgetEstimate: 9000,
    estimatedValue: 11000,
    status: "lost",
    source: "agency",
    assignedOwner: "Alex Morgan",
    lastContactDate: "2026-06-18",
    nextFollowUpDate: null,
    priority: "low",
    notes: "Client chose competitor venue due to date conflict.",
    internalNotes: "Archive — may re-engage next year.",
    createdAt: "2026-06-05T11:00:00Z",
    activity: [
      {
        id: "enq-6-a1",
        type: "received",
        title: "Enquiry received",
        description: "Agency RFP received.",
        timestamp: "2026-06-05T11:00:00Z",
        actor: "System",
      },
      {
        id: "enq-6-a2",
        type: "proposal_sent",
        title: "Proposal sent",
        description: "Sent summer party package.",
        timestamp: "2026-06-12T09:00:00Z",
        actor: "Alex Morgan",
      },
      {
        id: "enq-6-a3",
        type: "lost",
        title: "Marked as lost",
        description: "Client confirmed booking elsewhere.",
        timestamp: "2026-06-18T14:00:00Z",
        actor: "Alex Morgan",
      },
    ],
  },
  {
    id: "enq-7",
    eventName: "Conference Day Catering",
    clientName: "Sarah Chen",
    clientEmail: "sarah.chen@meridiangroup.com",
    clientPhone: "+44 7700 902107",
    company: "Meridian Group",
    clientPreferences: "Breakout lunches and all-day coffee stations.",
    requestedDate: "2026-08-05",
    preferredStartTime: "08:00",
    preferredEndTime: "17:00",
    eventType: "Conference day",
    eventTypeId: "etype-4",
    spacePreference: "Boardroom Suite",
    spacePreferenceId: "space-3",
    guestCount: 55,
    budgetEstimate: 8500,
    estimatedValue: 9800,
    status: "proposal_sent",
    source: "email",
    assignedOwner: "Jordan Lee",
    lastContactDate: "2026-06-26",
    nextFollowUpDate: "2026-07-02",
    priority: "medium",
    notes: "Multi-room setup. AV partner to be confirmed by client.",
    internalNotes: "Proposal includes AM/PM catering breakdown.",
    createdAt: "2026-06-18T13:00:00Z",
    activity: [
      {
        id: "enq-7-a1",
        type: "received",
        title: "Enquiry received",
        description: "Email from events coordinator.",
        timestamp: "2026-06-18T13:00:00Z",
        actor: "System",
      },
      {
        id: "enq-7-a2",
        type: "contacted",
        title: "Client contacted",
        description: "Discovery call — confirmed delegate count and dietary needs.",
        timestamp: "2026-06-22T11:00:00Z",
        actor: "Jordan Lee",
      },
      {
        id: "enq-7-a3",
        type: "proposal_sent",
        title: "Proposal sent",
        description: "Conference catering proposal sent.",
        timestamp: "2026-06-26T10:30:00Z",
        actor: "Jordan Lee",
      },
    ],
  },
];

export const enquiryPipelineStats: EnquiryPipelineStats = {
  newEnquiries: mockEnquiries.filter((e) => e.status === "new").length,
  awaitingReply: mockEnquiries.filter((e) => e.status === "new" || e.status === "contacted").length,
  proposalSent: mockEnquiries.filter((e) => e.status === "proposal_sent").length,
  conversionRate: Math.round(
    (mockEnquiries.filter((e) => e.status === "confirmed").length /
      mockEnquiries.filter((e) => e.status !== "lost").length) *
      100,
  ),
};

export function getEnquiryById(id: string): MockEnquiry | undefined {
  return mockEnquiries.find((enquiry) => enquiry.id === id);
}

export { mockEventTypes, mockSpaces };
