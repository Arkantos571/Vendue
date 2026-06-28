import type { ReportDateRangeKey } from "@/lib/reports/date-range";

export interface ReportCountItem {
  label: string;
  count: number;
}

export interface ReportsKpis {
  totalEvents: number;
  upcomingEvents: number;
  confirmedEvents: number;
  openEnquiries: number;
  convertedEnquiries: number;
  teamMembers: number;
  publishedRotas: number;
  totalScheduledLabourHours: number;
  estimatedLabourCost: number;
}

export interface ReportsEventActivity {
  byStatus: ReportCountItem[];
  byEventType: ReportCountItem[];
  bySpace: ReportCountItem[];
  upcomingEventsCount: number;
}

export interface ReportsEnquiryPipeline {
  byStatus: ReportCountItem[];
  conversionRate: number;
  pipelineValue: number;
  convertedCount: number;
  totalCount: number;
  proposalsViewed: number;
  proposalsResponded: number;
  interestedResponses: number;
}

export interface ReportsRotaStaffing {
  totalShifts: number;
  confirmedShifts: number;
  pendingShifts: number;
  declinedShifts: number;
  totalScheduledHours: number;
  estimatedLabourCost: number;
  averageLabourCostPerEvent: number | null;
}

export interface ReportsTeamSummary {
  totalMembers: number;
  byRole: ReportCountItem[];
  byStatus: ReportCountItem[];
  unavailableToday: number;
}

export interface ReportsSnapshot {
  events: {
    id: string;
    title: string;
    status: string;
    startsAt: string;
    rotaStatus: string;
    eventType: string;
    space: string;
  }[];
  enquiries: {
    id: string;
    status: string;
    createdAt: string;
    estimatedValue: number;
    convertedEventId: string | null;
    proposalViewedAt: string | null;
    proposalRespondedAt: string | null;
    proposalClientResponse: string | null;
  }[];
  shifts: {
    id: string;
    eventId: string | null;
    status: string;
    startsAt: string;
    endsAt: string;
    breakMinutes: number;
    hourlyRate: number;
    eventDate: string;
  }[];
  teamMembers: {
    id: string;
    role: string;
    status: string;
  }[];
  unavailabilityTodayMemberIds: string[];
}

export interface ReportsPayload {
  snapshot: ReportsSnapshot;
  defaultRange: ReportDateRangeKey;
}

export interface ComputedReports {
  kpis: ReportsKpis;
  eventActivity: ReportsEventActivity;
  enquiryPipeline: ReportsEnquiryPipeline;
  rotaStaffing: ReportsRotaStaffing;
  team: ReportsTeamSummary;
}
