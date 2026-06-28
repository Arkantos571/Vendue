import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EditTeamMemberForm } from "@/components/team/edit-team-member-form";
import { loadTeamMemberForPage } from "@/lib/team/data";

interface Props { params: Promise<{ teamMemberId: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { teamMemberId } = await params;
  const member = await loadTeamMemberForPage(teamMemberId);
  return { title: member ? `Edit ${member.fullName}` : "Edit team member" };
}

export default async function EditTeamMemberPage({ params }: Props) {
  const { teamMemberId } = await params;
  const member = await loadTeamMemberForPage(teamMemberId);
  if (!member) notFound();

  return (
    <DashboardShell title="Edit profile" description={member.fullName}>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href={`/dashboard/team/${teamMemberId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-100">
          <ArrowLeft className="h-4 w-4" />Back to profile
        </Link>
        <EditTeamMemberForm member={member} />
      </div>
    </DashboardShell>
  );
}
