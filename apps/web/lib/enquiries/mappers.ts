import { splitDateTime } from "@/lib/events/mappers";
import {
  eventEndsNextDay,
  formatEventTimeRange,
  timeToMinutes,
} from "@/lib/events/event-time";
import type {
  EnquiryActivityItem,
  EnquiryLinkedEvent,
  EnquiryPipelineStats,
  EnquiryPriority,
  EnquirySource,
  EnquiryStatus,
  MockEnquiry,
} from "@/lib/mock/enquiries";
import type { EventStatus } from "@/types";
import type {
  EnquiryPriority as DbEnquiryPriority,
  EnquirySource as DbEnquirySource,
  EnquiryStatus as DbEnquiryStatus,
} from "@/types";

export interface ProfileJoin {
  full_name: string | null;
}

export interface ConvertedEventJoin {
  id: string;
  title: string;
  status: EventStatus;
  starts_at: string;
  ends_at: string;
}

export interface EnquiryRowWithJoins {
  id: string;
  venue_id: string;
  event_name: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  company: string | null;
  client_preferences: string | null;
  requested_date: string | null;
  preferred_start_time: string | null;
  preferred_end_time: string | null;
  event_type_id: string | null;
  space_id: string | null;
  guest_count: number | null;
  budget_estimate: number | string | null;
  estimated_value: number | string | null;
  status: DbEnquiryStatus;
  source: DbEnquirySource;
  priority: DbEnquiryPriority;
  assigned_profile_id: string | null;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  proposal_title: string | null;
  proposal_intro: string | null;
  proposal_notes: string | null;
  proposed_package: string | null;
  proposal_inclusions: string | null;
  proposal_terms: string | null;
  proposal_internal_notes: string | null;
  proposal_valid_until: string | null;
  lost_reason: string | null;
  notes: string | null;
  internal_notes: string | null;
  activity: unknown;
  converted_event_id: string | null;
  converted_at: string | null;
  created_at: string;
  event_types?: { name: string } | { name: string }[] | null;
  spaces?: { name: string } | { name: string }[] | null;
  profiles?: ProfileJoin | ProfileJoin[] | null;
  events?: ConvertedEventJoin | ConvertedEventJoin[] | null;
}

function joinName<T extends { name: string }>(value: T | T[] | null | undefined): string {
  if (!value) return "—";
  return Array.isArray(value) ? (value[0]?.name ?? "—") : value.name;
}

function joinProfileName(value: ProfileJoin | ProfileJoin[] | null | undefined): string {
  if (!value) return "Unassigned";
  const profile = Array.isArray(value) ? value[0] : value;
  return profile?.full_name?.trim() || "Unassigned";
}

function toLinkedEvent(
  value: ConvertedEventJoin | ConvertedEventJoin[] | null | undefined,
): EnquiryLinkedEvent | null {
  if (!value) return null;
  const event = Array.isArray(value) ? value[0] : value;
  if (!event) return null;

  const start = splitDateTime(event.starts_at);
  const end = splitDateTime(event.ends_at);

  return {
    id: event.id,
    title: event.title,
    date: start.date,
    startTime: start.time,
    endTime: end.time,
    endsNextDay: end.date > start.date,
    status: event.status,
  };
}

function parseAmount(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Postgres `time` values arrive as HH:MM:SS — normalise to HH:MM. */
export function normalizeTimeValue(value: string | null | undefined): string {
  if (!value) return "";
  const match = value.match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
}

export function inferPreferredEndIsNextDay(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return false;
  return timeToMinutes(endTime) <= timeToMinutes(startTime);
}

function toDateOnly(iso: string | null): string | null {
  if (!iso) return null;
  return iso.slice(0, 10);
}

function parseActivity(
  value: unknown,
  fallback: EnquiryActivityItem[],
): EnquiryActivityItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback;
  }

  const parsed = value.filter(
    (item): item is EnquiryActivityItem =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "title" in item &&
      "timestamp" in item,
  );

  return parsed.length > 0 ? parsed : fallback;
}

function buildPlaceholderActivity(enquiry: {
  id: string;
  createdAt: string;
  status: EnquiryStatus;
}): EnquiryActivityItem[] {
  return [
    {
      id: `${enquiry.id}-received`,
      type: "received",
      title: "Enquiry received",
      description: "Captured in Venudue. Full activity sync is coming in a later phase.",
      timestamp: enquiry.createdAt,
      actor: "System",
    },
    ...(enquiry.status === "contacted"
      ? [
          {
            id: `${enquiry.id}-contacted`,
            type: "contacted" as const,
            title: "Marked as contacted",
            description: "Status updated in Venudue.",
            timestamp: enquiry.createdAt,
            actor: "Team",
          },
        ]
      : []),
  ];
}

export function toMockEnquiry(row: EnquiryRowWithJoins): MockEnquiry {
  const preferredStartTime = normalizeTimeValue(row.preferred_start_time);
  const preferredEndTime = normalizeTimeValue(row.preferred_end_time);
  const preferredEndIsNextDay = inferPreferredEndIsNextDay(
    preferredStartTime,
    preferredEndTime,
  );

  return {
    id: row.id,
    eventName: row.event_name,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    company: row.company,
    clientPreferences: row.client_preferences,
    requestedDate: row.requested_date ?? "",
    preferredStartTime,
    preferredEndTime,
    preferredEndIsNextDay,
    eventType: joinName(row.event_types),
    eventTypeId: row.event_type_id ?? "",
    spacePreference: row.space_id ? joinName(row.spaces) : "No preference",
    spacePreferenceId: row.space_id,
    guestCount: row.guest_count ?? 0,
    budgetEstimate: parseAmount(row.budget_estimate),
    estimatedValue: parseAmount(row.estimated_value),
    status: row.status as EnquiryStatus,
    source: row.source as EnquirySource,
    priority: row.priority as EnquiryPriority,
    assignedOwner: joinProfileName(row.profiles),
    lastContactDate: toDateOnly(row.last_contact_at),
    nextFollowUpDate: toDateOnly(row.next_follow_up_at),
    proposalTitle: row.proposal_title,
    proposalIntro: row.proposal_intro,
    proposalNotes: row.proposal_notes,
    proposedPackage: row.proposed_package,
    proposalInclusions: row.proposal_inclusions,
    proposalTerms: row.proposal_terms,
    proposalInternalNotes: row.proposal_internal_notes,
    proposalValidUntil: row.proposal_valid_until,
    lostReason: row.lost_reason,
    notes: row.notes,
    internalNotes: row.internal_notes,
    activity: parseActivity(
      row.activity,
      buildPlaceholderActivity({
        id: row.id,
        createdAt: row.created_at,
        status: row.status as EnquiryStatus,
      }),
    ),
    convertedEventId: row.converted_event_id,
    convertedAt: row.converted_at,
    linkedEvent: toLinkedEvent(row.events),
    createdAt: row.created_at,
  };
}

export function formatEnquiryTimeRange(enquiry: {
  preferredStartTime: string;
  preferredEndTime: string;
  preferredEndIsNextDay?: boolean;
}): string {
  if (!enquiry.preferredStartTime || !enquiry.preferredEndTime) {
    return "—";
  }

  return formatEventTimeRange({
    startTime: enquiry.preferredStartTime,
    endTime: enquiry.preferredEndTime,
    endsNextDay:
      enquiry.preferredEndIsNextDay ??
      eventEndsNextDay({
        startTime: enquiry.preferredStartTime,
        endTime: enquiry.preferredEndTime,
      }),
  });
}

export function buildEnquiryPipelineStats(enquiries: MockEnquiry[]): EnquiryPipelineStats {
  const active = enquiries.filter((enquiry) => enquiry.status !== "lost");

  return {
    newEnquiries: enquiries.filter((enquiry) => enquiry.status === "new").length,
    awaitingReply: enquiries.filter(
      (enquiry) => enquiry.status === "new" || enquiry.status === "contacted",
    ).length,
    proposalSent: enquiries.filter((enquiry) => enquiry.status === "proposal_sent").length,
    openEnquiries: enquiries.filter(
      (enquiry) =>
        enquiry.status !== "lost" &&
        enquiry.status !== "confirmed" &&
        !enquiry.convertedEventId,
    ).length,
    conversionRate:
      active.length === 0
        ? 0
        : Math.round(
            (enquiries.filter((enquiry) => enquiry.status === "confirmed").length / active.length) *
              100,
          ),
  };
}

export function isFollowUpOverdue(enquiry: MockEnquiry): boolean {
  if (!enquiry.nextFollowUpDate) return false;
  if (enquiry.status === "confirmed" || enquiry.status === "lost") return false;
  const today = new Date().toISOString().slice(0, 10);
  return enquiry.nextFollowUpDate < today;
}
