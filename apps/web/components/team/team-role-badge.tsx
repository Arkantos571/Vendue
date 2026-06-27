import { formatTeamRole, type TeamRole } from "@/lib/mock/team";

export function TeamRoleBadge({ role }: { role: TeamRole }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800">
      {formatTeamRole(role)}
    </span>
  );
}
