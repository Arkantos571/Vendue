"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import { employmentTypeOptions, teamRoleOptions, type EmploymentType, type TeamRole } from "@/lib/mock/team";
import { createTeamMemberAction, loadTeamMembersAction } from "@/lib/team/actions";

export function NewTeamMemberForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noVenue, setNoVenue] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      const result = await loadTeamMembersAction();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error);
        setNoVenue(false);
      } else {
        setNoVenue(Boolean(result.noVenue));
      }

      setIsLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const hourlyRateRaw = String(formData.get("hourly_rate") ?? "").trim();
    const hourlyRate = hourlyRateRaw ? Number(hourlyRateRaw) : undefined;

    const result = await createTeamMemberAction({
      first_name: String(formData.get("first_name") ?? ""),
      last_name: String(formData.get("last_name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? "") || undefined,
      role: String(formData.get("role") ?? "") as TeamRole,
      employment_type: String(formData.get("employment_type") ?? "") as EmploymentType,
      hourly_rate: Number.isFinite(hourlyRate) ? hourlyRate : undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
      send_invite: sendInvite,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`/dashboard/team/${result.teamMemberId}`);
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-stone-500">Loading form…</p>
      </div>
    );
  }

  if (noVenue) {
    return (
      <VenueRequiredEmptyState
        message="Set up your venue before adding team members"
        description="Add your venue in Settings before building your team roster."
        href="/dashboard/settings"
        buttonLabel="Go to settings"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

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
              Email an invitation to join the venue on Venudue. (Invite emails are not sent yet.)
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
