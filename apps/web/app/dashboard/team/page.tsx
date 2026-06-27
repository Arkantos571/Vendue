import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TeamList } from "@/components/team/team-list";

export const metadata: Metadata = {
  title: "Team",
};

export default function TeamPage() {
  return (
    <DashboardShell
      title="Team"
      description="Manage staff roster and prepare for rota scheduling."
    >
      <div className="mx-auto max-w-7xl">
        <TeamList />
      </div>
    </DashboardShell>
  );
}
