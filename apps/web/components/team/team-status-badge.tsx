import { cn } from "@/lib/utils";
import type { TeamMemberStatus } from "@/types";

const statusStyles: Record<TeamMemberStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  invited: "bg-sky-50 text-sky-700",
  inactive: "bg-slate-100 text-muted-foreground",
};

const statusLabels: Record<TeamMemberStatus, string> = {
  active: "Active",
  invited: "Invited",
  inactive: "Inactive",
};

export function TeamStatusBadge({ status }: { status: TeamMemberStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
