import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TeamMemberDetailView } from "@/components/team/team-member-detail-view";
import { getTeamMemberById } from "@/lib/mock/team";

interface TeamMemberDetailPageProps {
  params: Promise<{ teamMemberId: string }>;
}

export async function generateMetadata({ params }: TeamMemberDetailPageProps): Promise<Metadata> {
  const { teamMemberId } = await params;
  const member = getTeamMemberById(teamMemberId);

  return {
    title: member?.fullName ?? "Team member",
  };
}

export default async function TeamMemberDetailPage({ params }: TeamMemberDetailPageProps) {
  const { teamMemberId } = await params;
  const member = getTeamMemberById(teamMemberId);

  if (!member) {
    notFound();
  }

  return (
    <DashboardShell
      title="Team member"
      description={member.fullName}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/dashboard/team"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to team
        </Link>
        <TeamMemberDetailView member={member} />
      </div>
    </DashboardShell>
  );
}
