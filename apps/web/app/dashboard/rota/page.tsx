import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RotaOverviewList } from "@/components/rota/rota-overview-list";

export const metadata: Metadata = {
  title: "Rota",
};

export default function RotaPage() {
  return (
    <DashboardShell
      title="Rota"
      description="Build and publish event staffing schedules"
    >
      <div className="mx-auto max-w-7xl">
        <RotaOverviewList />
      </div>
    </DashboardShell>
  );
}
