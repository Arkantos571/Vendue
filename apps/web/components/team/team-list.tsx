"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ScheduleAvailabilityBadge } from "@/components/availability/schedule-availability-badge";
import { TeamRoleBadge } from "@/components/team/team-role-badge";
import { TeamStatusBadge } from "@/components/team/team-status-badge";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type MockTeamMember,
  type TeamRoleFilter,
  type TeamStatusFilter,
  formatEmploymentType,
  formatHourlyRate,
  teamRoleOptions,
} from "@/lib/mock/team";
import { loadTeamMembersAction } from "@/lib/team/actions";
import { loadTeamScheduleIndicatorsAction } from "@/lib/availability/actions";
import type { ScheduleAvailabilityIndicator } from "@/lib/availability/types";

const statusFilters: { value: TeamStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "inactive", label: "Inactive" },
];

const roleFilters: { value: TeamRoleFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...teamRoleOptions,
];

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-brand-700 text-white"
          : "bg-white text-muted-foreground ring-1 ring-border hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

export function TeamList() {
  const [members, setMembers] = useState<MockTeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noVenue, setNoVenue] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<TeamRoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<TeamStatusFilter>("all");
  const [scheduleIndicators, setScheduleIndicators] = useState<Record<string, ScheduleAvailabilityIndicator>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      const [membersResult, indicatorsResult] = await Promise.all([
        loadTeamMembersAction(),
        loadTeamScheduleIndicatorsAction(),
      ]);

      if (cancelled) {
        return;
      }

      if (!membersResult.success) {
        setError(membersResult.error);
        setMembers([]);
        setNoVenue(false);
        setScheduleIndicators({});
      } else {
        setMembers(membersResult.members);
        setNoVenue(Boolean(membersResult.noVenue));
        setScheduleIndicators(
          indicatorsResult.success ? indicatorsResult.indicators : {},
        );
      }

      setIsLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;
      const matchesSearch =
        !query ||
        member.fullName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        (member.phone?.toLowerCase().includes(query) ?? false);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [members, search, roleFilter, statusFilter]);

  if (isLoading) {
    return (
      <div className="v-empty">
        <p className="text-sm text-muted-foreground">Loading team…</p>
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
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link
          href="/dashboard/team/new"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800"
        >
          <Plus className="h-4 w-4" />
          Add team member
        </Link>
      </div>

      <div className="space-y-3">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</p>
          <div className="flex flex-wrap gap-2">
            {roleFilters.map(({ value, label }) => (
              <FilterChip
                key={value}
                label={label}
                active={roleFilter === value}
                onClick={() => setRoleFilter(value)}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map(({ value, label }) => (
              <FilterChip
                key={value}
                label={label}
                active={statusFilter === value}
                onClick={() => setStatusFilter(value)}
              />
            ))}
          </div>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="v-empty">
          <p className="text-sm font-medium text-foreground">No team members found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters, or add a new team member.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-background shadow-sm lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Employment</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Shifts</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMembers.map((member) => (
                  <TeamTableRow key={member.id} member={member} scheduleIndicator={scheduleIndicators[member.id] ?? "available"} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {filteredMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} scheduleIndicator={scheduleIndicators[member.id] ?? "available"} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TeamTableRow({ member, scheduleIndicator }: { member: MockTeamMember; scheduleIndicator: ScheduleAvailabilityIndicator }) {
  const router = useRouter();

  function navigate() {
    router.push(`/dashboard/team/${member.id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate();
    }
  }

  return (
    <tr
      role="link"
      tabIndex={0}
      onClick={navigate}
      onKeyDown={handleKeyDown}
      className="cursor-pointer transition-colors hover:bg-muted/80 focus-visible:bg-muted/80 focus-visible:outline-none"
      aria-label={`View ${member.fullName}`}
    >
      <td className="px-6 py-4">
        <span className="font-medium text-foreground">{member.fullName}</span>
      </td>
      <td className="px-4 py-4">
        <p className="text-foreground/90">{member.email}</p>
        <p className="text-xs text-muted-foreground">{member.phone ?? "—"}</p>
      </td>
      <td className="px-4 py-4">
        <TeamRoleBadge role={member.role} />
      </td>
      <td className="px-4 py-4 text-muted-foreground">{formatEmploymentType(member.employmentType)}</td>
      <td className="px-4 py-4 text-muted-foreground">{formatHourlyRate(member.hourlyRate)}</td>
      <td className="px-4 py-4 text-muted-foreground">{member.upcomingShiftsCount}</td>
      <td className="px-4 py-4">
        <ScheduleAvailabilityBadge indicator={scheduleIndicator} />
      </td>
      <td className="px-6 py-4">
        <TeamStatusBadge status={member.status} />
      </td>
    </tr>
  );
}

export function TeamMemberCard({ member, scheduleIndicator }: { member: MockTeamMember; scheduleIndicator: ScheduleAvailabilityIndicator }) {
  return (
    <Link
      href={`/dashboard/team/${member.id}`}
      className="block v-card p-5 transition-colors hover:border-slate-300 hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{member.fullName}</p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{member.email}</p>
        </div>
        <TeamStatusBadge status={member.status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <TeamRoleBadge role={member.role} />
        <ScheduleAvailabilityBadge indicator={scheduleIndicator} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Employment</dt>
          <dd className="mt-0.5 text-foreground/90">{formatEmploymentType(member.employmentType)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Hourly rate</dt>
          <dd className="mt-0.5 text-foreground/90">{formatHourlyRate(member.hourlyRate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Upcoming shifts</dt>
          <dd className="mt-0.5 text-foreground/90">{member.upcomingShiftsCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Phone</dt>
          <dd className="mt-0.5 text-foreground/90">{member.phone ?? "—"}</dd>
        </div>
      </dl>
    </Link>
  );
}
