"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { employmentTypeOptions, teamRoleOptions, type EmploymentType, type MockTeamMember, type TeamRole } from "@/lib/mock/team";
import { updateTeamMemberAction } from "@/lib/team/actions";
import type { TeamMemberStatus } from "@/types";

const statusOptions: { value: TeamMemberStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "inactive", label: "Inactive" },
];

export function EditTeamMemberForm({ member }: { member: MockTeamMember }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(member.email);

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(formEvent.currentTarget);
    const hourlyRateRaw = String(formData.get("hourly_rate") ?? "").trim();
    const hourlyRate = hourlyRateRaw ? Number(hourlyRateRaw) : undefined;
    const result = await updateTeamMemberAction({
      team_member_id: member.id,
      first_name: String(formData.get("first_name") ?? ""),
      last_name: String(formData.get("last_name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? "") || undefined,
      role: String(formData.get("role") ?? "") as TeamRole,
      employment_type: String(formData.get("employment_type") ?? "") as EmploymentType,
      hourly_rate: Number.isFinite(hourlyRate) ? hourlyRate : undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
      status: String(formData.get("status") ?? member.status) as TeamMemberStatus,
    });
    setIsSubmitting(false);
    if (!result.success) { setError(result.error); return; }
    router.push(`/dashboard/team/${member.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</div> : null}
      {email !== member.email ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Staff login matching uses email, so changing this may affect staff access.
        </div>
      ) : null}
      <section className="v-panel dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Personal details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="first_name">First name</Label><Input id="first_name" name="first_name" required defaultValue={member.firstName} /></div>
          <div className="space-y-2"><Label htmlFor="last_name">Last name</Label><Input id="last_name" name="last_name" required defaultValue={member.lastName} /></div>
          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" type="tel" defaultValue={member.phone ?? ""} /></div>
        </div>
      </section>
      <section className="v-panel dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Role & employment</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="role">Role</Label><Select id="role" name="role" required defaultValue={member.role}>{teamRoleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></div>
          <div className="space-y-2"><Label htmlFor="employment_type">Employment type</Label><Select id="employment_type" name="employment_type" required defaultValue={member.employmentType}>{employmentTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></div>
          <div className="space-y-2"><Label htmlFor="hourly_rate">Hourly rate (£)</Label><Input id="hourly_rate" name="hourly_rate" type="number" min={0} step={0.25} defaultValue={member.hourlyRate ?? ""} /></div>
          <div className="space-y-2"><Label htmlFor="status">Status</Label><Select id="status" name="status" defaultValue={member.status}>{statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></div>
        </div>
      </section>
      <section className="v-panel dark:bg-slate-900"><h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Notes</h2><div className="mt-5"><Textarea id="notes" name="notes" rows={4} defaultValue={member.notes ?? ""} /></div></section>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={`/dashboard/team/${member.id}`} className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">Cancel</Link>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save changes"}</Button>
      </div>
    </form>
  );
}
