import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StaffingPlanSummary } from "@/lib/mock/function-sheet";

interface StaffingPlanSummaryCardProps {
  eventId: string;
  staffing: StaffingPlanSummary;
  hasRotaBuilder: boolean;
}

function StaffList({ label, names }: { label: string; names: string[] }) {
  if (names.length === 0) return null;

  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm text-stone-900 dark:text-stone-100">{names.join(", ")}</dd>
    </div>
  );
}

export function StaffingPlanSummaryCard({
  eventId,
  staffing,
  hasRotaBuilder,
}: StaffingPlanSummaryCardProps) {
  const hasAnyStaff =
    staffing.managerOnDuty ||
    staffing.supervisors.length > 0 ||
    staffing.bartenders.length > 0 ||
    staffing.waiters.length > 0 ||
    staffing.runners.length > 0 ||
    staffing.security.length > 0 ||
    staffing.reception.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Staffing plan summary</CardTitle>
          <CardDescription>Populated from the event rota when shifts are assigned.</CardDescription>
        </div>
        {hasRotaBuilder ? (
          <Link
            href={`/dashboard/rota/${eventId}`}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            <Users className="h-4 w-4" />
            Build rota
          </Link>
        ) : null}
      </CardHeader>
      <CardContent>
        {!hasAnyStaff ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Build the rota to populate staffing summary.
          </p>
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2">
            {staffing.managerOnDuty && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Manager on duty</dt>
                <dd className="mt-1 text-sm font-medium text-stone-900 dark:text-stone-100">
                  {staffing.managerOnDuty}
                </dd>
              </div>
            )}
            <StaffList label="Supervisors" names={staffing.supervisors} />
            <StaffList label="Bartenders" names={staffing.bartenders} />
            <StaffList label="Waiters" names={staffing.waiters} />
            <StaffList label="Runners" names={staffing.runners} />
            <StaffList label="Security" names={staffing.security} />
            <StaffList label="Reception" names={staffing.reception} />
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
