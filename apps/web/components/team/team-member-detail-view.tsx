import Link from "next/link";
import { Briefcase, CalendarDays, Mail, Pencil, Phone, Send, UserPlus } from "lucide-react";
import { TeamMemberUnavailabilitySection } from "@/components/team/team-member-unavailability-section";
import { AvailabilityBadge } from "@/components/team/availability-badge";
import { TeamRoleBadge } from "@/components/team/team-role-badge";
import { TeamStatusBadge } from "@/components/team/team-status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type MockTeamMember, type TeamRole, formatEmploymentType, formatHourlyRate, formatTeamRole } from "@/lib/mock/team";
import { formatDate, formatTime } from "@/lib/utils";

interface TeamMemberDetailViewProps { member: MockTeamMember; }

export function TeamMemberDetailView({ member }: TeamMemberDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-lg font-semibold text-brand-800">
            {member.firstName[0]}{member.lastName[0]}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">{member.fullName}</h2>
              <TeamStatusBadge status={member.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <TeamRoleBadge role={member.role} />
              <AvailabilityBadge status={member.availabilityStatus} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/team/${member.id}/edit`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-800">
            <Pencil className="h-4 w-4" />Edit profile
          </Link>
          <Link href="/dashboard/events" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-card px-4 text-sm font-medium text-foreground hover:bg-muted">
            <UserPlus className="h-4 w-4" />Assign to event
          </Link>
          <button type="button" disabled={member.status === "active"} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-800 disabled:opacity-50">
            <Send className="h-4 w-4" />Send invite
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile summary</CardTitle>
            <CardDescription>Role, employment, and compensation.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem icon={Briefcase} label="Role" value={formatTeamRole(member.role)} />
              <DetailItem icon={Briefcase} label="Employment type" value={formatEmploymentType(member.employmentType)} />
              <DetailItem icon={Briefcase} label="Hourly rate" value={formatHourlyRate(member.hourlyRate)} />
              <DetailItem icon={CalendarDays} label="Upcoming shifts" value={String(member.upcomingShiftsCount)} />
            </dl>
            {member.notes && (
              <div className="mt-6 rounded-lg border border-border bg-muted/50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{member.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contact details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <DetailItem icon={Mail} label="Email" value={member.email} />
            <DetailItem icon={Phone} label="Phone" value={member.phone ?? "Not provided"} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming shifts</CardTitle>
          <CardDescription>Assigned rota slots for this team member.</CardDescription>
        </CardHeader>
        <CardContent>
          {member.upcomingShifts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming shifts assigned.</p>
          ) : (
            <ul className="divide-y divide-stone-100 rounded-lg border border-border">
              {member.upcomingShifts.map((shift) => (
                <li key={shift.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{shift.eventTitle}</p>
                    <p className="text-xs text-muted-foreground">{shift.roleLabel}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(shift.date)} · {shift.startTime} – {shift.endTime}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <TeamMemberUnavailabilitySection teamMemberId={member.id} />

      <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"><CalendarDays className="h-4 w-4" /></div>
              <div>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Changes and rota updates for this member.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {member.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <ul className="space-y-3">
                {member.recentActivity.map((item) => (
                  <li key={item.id} className="text-sm">
                    <p className="text-foreground">{item.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(item.timestamp)} at {formatTime(item.timestamp)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon?: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}
