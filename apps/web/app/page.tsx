import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
  UserSquare2,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const workflowSteps = [
  { step: "01", title: "Capture enquiry", description: "Log client details, dates, and requirements from first contact." },
  { step: "02", title: "Create event", description: "Turn confirmed enquiries into booked events with spaces and timings." },
  { step: "03", title: "Build function sheet", description: "Document F&B, setup, and operational notes for service." },
  { step: "04", title: "Assign team", description: "Schedule shifts on the rota against each event." },
  { step: "05", title: "Run the event", description: "Everyone sees the same plan — from office to floor." },
];

const features = [
  { icon: Inbox, title: "Enquiry pipeline", description: "Track new leads from first contact through proposal to confirmed booking." },
  { icon: CalendarDays, title: "Event calendar", description: "See what's on across spaces with clear dates, times, and overnight events." },
  { icon: ClipboardList, title: "Function sheets", description: "Operational run sheets for F&B, setup, and service requirements." },
  { icon: UserSquare2, title: "Rota builder", description: "Assign staff to events with roles, sections, and labour cost visibility." },
  { icon: Users, title: "Team management", description: "Maintain your roster with roles, rates, and availability." },
  { icon: Settings, title: "Venue setup", description: "Configure spaces, event types, and defaults once — use everywhere." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b v-divider bg-background-elevated">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-brand-600 dark:text-brand-400">Hospitality event operations</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Run enquiries, events, and rotas in one calm workspace.</h1>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">Venudue helps venues manage enquiries, events, rotas, function sheets, and teams in one place — so your team knows what is happening, where, and when.</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/sign-up" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:opacity-90">Start managing events<ArrowRight className="h-4 w-4" /></Link>
                  <Link href="/enquire" className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:bg-muted">Submit an enquiry</Link>
                </div>
              </div>
              <div className="v-card overflow-hidden p-0">
                <div className="border-b border-slate-100 bg-brand-950 px-5 py-4 dark:border-slate-800">
                  <div className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4 text-brand-300" /><span className="text-sm font-medium text-white">Venudue dashboard</span></div>
                </div>
                <div className="space-y-3 p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 bg-muted"><p className="text-xs text-muted-foreground">New enquiries</p><p className="mt-1 text-2xl font-semibold text-foreground">12</p></div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 bg-muted"><p className="text-xs text-muted-foreground">Events this week</p><p className="mt-1 text-2xl font-semibold text-foreground">8</p></div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs font-medium text-muted-foreground">Tonight — Main Ballroom</p><p className="mt-1 text-sm font-medium text-foreground">Corporate dinner · 85 guests</p><p className="mt-1 text-xs text-muted-foreground">18:00 – 00:00 +1 · Rota 92% staffed</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="border-b v-divider v-section-alt py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl"><h2 className="text-2xl font-semibold text-foreground">How it works</h2><p className="mt-3 text-muted-foreground">A simple path from first enquiry to service day.</p></div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{workflowSteps.map((item) => (<div key={item.step} className="v-card p-5"><p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">{item.step}</p><h3 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p></div>))}</div>
          </div>
        </section>
        <section id="features" className="bg-background-elevated py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl"><h2 className="text-2xl font-semibold text-foreground">Built for venue operations</h2><p className="mt-3 text-muted-foreground">Modern, premium tooling that stays clear on busy service days.</p></div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{features.map(({ icon: Icon, title, description }) => (<div key={title} className="v-card p-6"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"><Icon className="h-5 w-5" /></div><h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></div>))}</div>
          </div>
        </section>
        <section id="pricing" className="border-t v-divider v-section-alt py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-foreground">Simple pricing</h2>
            <p className="mt-3 text-muted-foreground">Pricing plans for single venues and groups are coming soon. Start with a free account today.</p>
            <Link href="/sign-up" className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-brand-700 px-6 text-sm font-medium text-white shadow-sm hover:opacity-90">Create your venue account</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
