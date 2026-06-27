"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { employmentTypeOptions, teamRoleOptions } from "@/lib/mock/team";

export function NewTeamMemberForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    router.push("/dashboard/team");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-stone-900">Personal details</h2>
        <p className="mt-1 text-sm text-stone-500">Basic information for the team roster.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" name="first_name" required placeholder="Jordan" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" name="last_name" required placeholder="Lee" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="jordan@venue.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+44 7700 900000" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-stone-900">Role & employment</h2>
        <p className="mt-1 text-sm text-stone-500">Used for rota assignment and costing.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select id="role" name="role" required defaultValue="">
              <option value="" disabled>Select role</option>
              {teamRoleOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="employment_type">Employment type</Label>
            <Select id="employment_type" name="employment_type" required defaultValue="">
              <option value="" disabled>Select type</option>
              {employmentTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly rate (£)</Label>
            <Input id="hourly_rate" name="hourly_rate" type="number" min={0} step={0.25} placeholder="14.00" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-stone-900">Notes</h2>
        <p className="mt-1 text-sm text-stone-500">Availability preferences and internal notes.</p>
        <div className="mt-5">
          <Textarea id="notes" name="notes" placeholder="e.g. Available weekends only…" rows={4} />
        </div>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 bg-stone-50/50 px-4 py-3">
          <input
            type="checkbox"
            checked={sendInvite}
            onChange={(e) => setSendInvite(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500"
          />
          <span>
            <span className="block text-sm font-medium text-stone-900">Send invite</span>
            <span className="mt-0.5 block text-sm text-stone-500">
              Email an invitation to join the venue on Venudue.
            </span>
          </span>
        </label>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/dashboard/team" className="inline-flex h-10 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-900 hover:bg-stone-50">Cancel</Link>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding…" : "Add team member"}</Button>
      </div>
    </form>
  );
}
