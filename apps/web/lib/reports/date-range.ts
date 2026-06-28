export type ReportDateRangeKey =
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "next_30_days"
  | "all_time";

export interface ReportDateRange {
  key: ReportDateRangeKey;
  label: string;
  start: Date | null;
  end: Date | null;
}

export const reportDateRangeOptions: { key: ReportDateRangeKey; label: string }[] = [
  { key: "last_7_days", label: "Last 7 days" },
  { key: "last_30_days", label: "Last 30 days" },
  { key: "this_month", label: "This month" },
  { key: "next_30_days", label: "Next 30 days" },
  { key: "all_time", label: "All time" },
];

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function resolveReportDateRange(key: ReportDateRangeKey, now = new Date()): ReportDateRange {
  const option = reportDateRangeOptions.find((item) => item.key === key);
  const label = option?.label ?? "All time";

  if (key === "all_time") {
    return { key, label, start: null, end: null };
  }

  const today = startOfDay(now);

  if (key === "last_7_days") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { key, label, start, end: endOfDay(now) };
  }

  if (key === "last_30_days") {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return { key, label, start, end: endOfDay(now) };
  }

  if (key === "this_month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    return { key, label, start, end };
  }

  const start = today;
  const end = endOfDay(new Date(today));
  end.setDate(end.getDate() + 30);
  return { key: "next_30_days", label, start, end };
}

export function isTimestampInRange(
  iso: string | null | undefined,
  range: ReportDateRange,
): boolean {
  if (!iso) return false;
  if (range.start === null && range.end === null) return true;

  const value = new Date(iso).getTime();
  if (Number.isNaN(value)) return false;

  if (range.start && value < range.start.getTime()) return false;
  if (range.end && value > range.end.getTime()) return false;
  return true;
}
