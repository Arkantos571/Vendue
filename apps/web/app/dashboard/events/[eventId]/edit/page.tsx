import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EditEventForm } from "@/components/events/edit-event-form";
import { loadEventForPage } from "@/lib/events/data";

interface Props { params: Promise<{ eventId: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const event = await loadEventForPage(eventId);
  return { title: event ? `Edit ${event.title}` : "Edit event" };
}

export default async function EditEventPage({ params }: Props) {
  const { eventId } = await params;
  const event = await loadEventForPage(eventId);
  if (!event) notFound();

  return (
    <DashboardShell title="Edit event" description={event.title}>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href={`/dashboard/events/${eventId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-100">
          <ArrowLeft className="h-4 w-4" />Back to event
        </Link>
        <EditEventForm event={event} />
      </div>
    </DashboardShell>
  );
}
