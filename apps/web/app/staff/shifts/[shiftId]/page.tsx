import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaffEmptyState } from "@/components/staff/staff-empty-state";
import { StaffShiftActions } from "@/components/staff/staff-shift-actions";
import { StaffShiftStatusBadge } from "@/components/staff/staff-shift-status-badge";
import { StaffShell } from "@/components/staff/staff-shell";
import { formatStaffShiftTimeRange } from "@/lib/staff/mappers";
import { loadStaffShiftDetail } from "@/lib/staff/data";
import { formatDate } from "@/lib/utils";

interface StaffShiftDetailPageProps {
  params: Promise<{ shiftId: string }>;
}

export async function generateMetadata({ params }: StaffShiftDetailPageProps): Promise<Metadata> {
  const { shiftId } = await params;
  const { shift } = await loadStaffShiftDetail(shiftId);
  return { title: shift?.eventName ?? "Shift detail" };
}

export default async function StaffShiftDetailPage({ params }: StaffShiftDetailPageProps) {
  const { shiftId } = await params;
  const { profile, shift } = await loadStaffShiftDetail(shiftId);

  if (!profile) {
    return (
      <StaffShell title="Shift detail" backHref="/staff/shifts">
        <StaffEmptyState
          title="No staff profile found for this email yet."
          description="Ask your venue manager to add you to the team with the same email you use to sign in."
        />
      </StaffShell>
    );
  }

  if (!shift) {
    notFound();
  }

  const details = [
    { label: "Venue", value: shift.venueName },
    { label: "Date", value: formatDate(shift.date) },
    { label: "Arrival", value: shift.arrivalTime },
    { label: "Shift time", value: formatStaffShiftTimeRange(shift) },
    { label: "Role", value: shift.role },
    { label: "Section", value: shift.section },
    { label: "Break", value: shift.breakMinutes > 0 ? `${shift.breakMinutes} minutes` : "None" },
    { label: "Space", value: shift.space },
    { label: "Event type", value: shift.eventType },
    ...(shift.guestCount != null
      ? [{ label: "Guest count", value: String(shift.guestCount) }]
      : []),
  ];

  return (
    <StaffShell title="Shift detail" backHref="/staff/shifts">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {shift.eventName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{shift.venueName}</p>
            </div>
            <StaffShiftStatusBadge status={shift.status} />
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {details.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-1 text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          {shift.notes && (
            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notes
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {shift.notes}
              </p>
            </div>
          )}
        </section>

        <StaffShiftActions shift={shift} />
      </div>
    </StaffShell>
  );
}
