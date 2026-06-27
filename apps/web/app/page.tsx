import Link from "next/link";
import { ArrowRight, CalendarDays, Smartphone, Users } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const workflowSteps = [
  { step: "01", title: "Venue", description: "Configure spaces, event types, and operational defaults." },
  { step: "02", title: "Event", description: "Plan bookings with client details, timing, and requirements." },
  { step: "03", title: "Staff", description: "Build your team roster with roles and availability." },
  { step: "04", title: "Rota", description: "Assign shifts to events and keep coverage visible." },
  { step: "05", title: "Mobile", description: "Give frontline staff a clear view on the day." },
];

const features = [
  {
    icon: CalendarDays,
    title: "Event operations",
    description: "A single place to manage hospitality events from enquiry to service.",
  },
  {
    icon: Users,
    title: "Team & rota",
    description: "Coordinate staff assignments against live event schedules.",
  },
  {
    icon: Smartphone,
    title: "Built for the floor",
    description: "Designed around the venue → event → staff → rota workflow.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-widest text-brand-700">
                Hospitality events management
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
                Run events with clarity from setup to service.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-stone-600">
                Venudue helps venues coordinate bookings, teams, and rotas in one operational
                workspace — so your staff know what is happening, where, and when.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-800"
                >
                  Start free setup
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-stone-300 bg-white px-5 text-sm font-medium text-stone-900 hover:bg-stone-50"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="border-b border-stone-200 bg-stone-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold text-stone-900">The core workflow</h2>
              <p className="mt-3 text-stone-600">
                Everything in Venudue follows the path your team already thinks in.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {workflowSteps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                    {item.step}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-stone-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold text-stone-900">Operational by design</h2>
              <p className="mt-3 text-stone-600">
                Simple, premium tooling for venues that need reliability on busy service days.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-xl border border-stone-200 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-stone-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
