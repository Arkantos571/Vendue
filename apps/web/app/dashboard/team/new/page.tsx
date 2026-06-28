import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NewTeamMemberForm } from "@/components/team/new-team-member-form";

export const metadata: Metadata = {
  title: "Add team member",
};

export default function NewTeamMemberPage() {
  return (
    <DashboardShell
      title="Add team member"
      description="Add staff to your venue roster."
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/dashboard/team"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to team
        </Link>
        <NewTeamMemberForm />
      </div>
    </DashboardShell>
  );
}
