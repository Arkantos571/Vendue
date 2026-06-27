import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const quickLinks = [
  {
    href: "/dashboard/onboarding",
    title: "Complete venue setup",
    description: "Add spaces and event types to unlock faster event creation.",
    icon: Sparkles,
  },
  {
    href: "/dashboard/events",
    title: "Plan your next event",
    description: "Create bookings and assign spaces once your venue is configured.",
    icon: CalendarDays,
  },
  {
    href: "/dashboard/team",
    title: "Build your team roster",
    description: "Add staff members and prepare for rota scheduling.",
    icon: Users,
  },
];

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Overview"
      description="Your operational hub for venue, events, and staffing."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-5 py-4">
          <p className="text-sm font-medium text-brand-900">Getting started</p>
          <p className="mt-1 text-sm text-brand-800">
            Follow the core workflow: venue setup → events → team → rota → mobile view.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickLinks.map(({ href, title, description, icon: Icon }) => (
            <Card key={href}>
              <CardHeader>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
                  <Icon className="h-4 w-4" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                >
                  Open
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s snapshot</CardTitle>
            <CardDescription>Live data will appear here once connected to Supabase.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-stone-50 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Events</dt>
                <dd className="mt-1 text-2xl font-semibold text-stone-900">—</dd>
              </div>
              <div className="rounded-lg bg-stone-50 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Staff on rota</dt>
                <dd className="mt-1 text-2xl font-semibold text-stone-900">—</dd>
              </div>
              <div className="rounded-lg bg-stone-50 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Spaces</dt>
                <dd className="mt-1 text-2xl font-semibold text-stone-900">—</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
