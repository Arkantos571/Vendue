import { splitDateTime } from "@/lib/events/mappers";
import {
  isTimestampInRange,
  resolveReportDateRange,
  type ReportDateRangeKey,
} from "@/lib/reports/date-range";
import type {
  ComputedReports,
  ReportCountItem,
  ReportsSnapshot,
} from "@/lib/reports/types";
import {
  calculateShiftCost,
  calculateShiftHours,
  finishTimeFromTimestamps,
} from "@/lib/rota/shift-time";

function countByField(items: string[]): ReportCountItem[] {
  const totals = new Map<string, number>();

  for (const item of items) {
    const label = item.trim() || "Unknown";
    totals.set(label, (totals.get(label) ?? 0) + 1);
  }

  return [...totals.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function shiftLabourTotals(shift: ReportsSnapshot["shifts"][number]) {
  const start = splitDateTime(shift.startsAt);
  const { finishTime, finishIsNextDay } = finishTimeFromTimestamps(
    shift.eventDate,
    shift.startsAt,
    shift.endsAt,
  );

  const hours = calculateShiftHours(
    start.time,
    finishTime,
    finishIsNextDay,
    shift.breakMinutes,
  );
  const cost = calculateShiftCost(
    start.time,
    finishTime,
    finishIsNextDay,
    shift.breakMinutes,
    shift.hourlyRate,
  );

  return { hours, cost };
}

function isOpenEnquiry(enquiry: ReportsSnapshot["enquiries"][number]): boolean {
  return enquiry.status !== "lost" && enquiry.status !== "confirmed" && !enquiry.convertedEventId;
}

function isConvertedEnquiry(enquiry: ReportsSnapshot["enquiries"][number]): boolean {
  return enquiry.status === "confirmed" || Boolean(enquiry.convertedEventId);
}

export function computeReports(
  snapshot: ReportsSnapshot,
  rangeKey: ReportDateRangeKey,
  now = new Date(),
): ComputedReports {
  const range = resolveReportDateRange(rangeKey, now);

  const eventsInRange = snapshot.events.filter((event) =>
    isTimestampInRange(event.startsAt, range),
  );
  const enquiriesInRange = snapshot.enquiries.filter((enquiry) =>
    isTimestampInRange(enquiry.createdAt, range),
  );
  const shiftsInRange = snapshot.shifts.filter(
    (shift) => shift.status !== "cancelled" && isTimestampInRange(shift.startsAt, range),
  );

  const nowMs = now.getTime();
  const upcomingEvents = eventsInRange.filter(
    (event) =>
      new Date(event.startsAt).getTime() >= nowMs &&
      event.status !== "cancelled" &&
      event.status !== "completed",
  );

  const labour = shiftsInRange.reduce(
    (totals, shift) => {
      const { hours, cost } = shiftLabourTotals(shift);
      totals.hours += hours;
      totals.cost += cost;
      return totals;
    },
    { hours: 0, cost: 0 },
  );

  const eventIdsWithShifts = new Set(
    shiftsInRange.map((shift) => shift.eventId).filter((id): id is string => Boolean(id)),
  );

  const averageLabourCostPerEvent =
    eventIdsWithShifts.size > 0 ? labour.cost / eventIdsWithShifts.size : null;

  const activeEnquiries = enquiriesInRange.filter((enquiry) => enquiry.status !== "lost");
  const convertedCount = enquiriesInRange.filter(isConvertedEnquiry).length;
  const conversionRate =
    activeEnquiries.length === 0
      ? 0
      : Math.round((convertedCount / activeEnquiries.length) * 100);

  const pipelineValue = enquiriesInRange
    .filter(isOpenEnquiry)
    .reduce((total, enquiry) => total + enquiry.estimatedValue, 0);

  return {
    kpis: {
      totalEvents: eventsInRange.length,
      upcomingEvents: upcomingEvents.length,
      confirmedEvents: eventsInRange.filter((event) => event.status === "confirmed").length,
      openEnquiries: enquiriesInRange.filter(isOpenEnquiry).length,
      convertedEnquiries: convertedCount,
      teamMembers: snapshot.teamMembers.length,
      publishedRotas: eventsInRange.filter((event) => event.rotaStatus === "published").length,
      totalScheduledLabourHours: labour.hours,
      estimatedLabourCost: labour.cost,
    },
    eventActivity: {
      byStatus: countByField(eventsInRange.map((event) => event.status.replaceAll("_", " "))),
      byEventType: countByField(eventsInRange.map((event) => event.eventType)),
      bySpace: countByField(eventsInRange.map((event) => event.space)),
      upcomingEventsCount: upcomingEvents.length,
    },
    enquiryPipeline: {
      byStatus: countByField(enquiriesInRange.map((enquiry) => enquiry.status.replaceAll("_", " "))),
      conversionRate,
      pipelineValue,
      convertedCount,
      totalCount: enquiriesInRange.length,
      proposalsViewed: enquiriesInRange.filter((enquiry) => Boolean(enquiry.proposalViewedAt)).length,
      proposalsResponded: enquiriesInRange.filter((enquiry) => Boolean(enquiry.proposalRespondedAt)).length,
      interestedResponses: enquiriesInRange.filter(
        (enquiry) => enquiry.proposalClientResponse === "interested",
      ).length,
    },
    rotaStaffing: {
      totalShifts: shiftsInRange.length,
      confirmedShifts: shiftsInRange.filter((shift) => shift.status === "confirmed").length,
      pendingShifts: shiftsInRange.filter((shift) => shift.status === "scheduled").length,
      declinedShifts: shiftsInRange.filter((shift) => shift.status === "declined").length,
      totalScheduledHours: labour.hours,
      estimatedLabourCost: labour.cost,
      averageLabourCostPerEvent,
    },
    team: {
      totalMembers: snapshot.teamMembers.length,
      byRole: countByField(snapshot.teamMembers.map((member) => member.role.replaceAll("_", " "))),
      byStatus: countByField(snapshot.teamMembers.map((member) => member.status)),
      unavailableToday: snapshot.unavailabilityTodayMemberIds.length,
    },
  };
}
