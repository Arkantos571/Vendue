import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EventDetailView } from "@/components/events/event-detail-view";
import { buildDefaultFunctionSheet } from "@/lib/function-sheets/defaults";
import { loadFunctionSheetForPage } from "@/lib/function-sheets/data";
import { loadEventForPage } from "@/lib/events/data";
import { eventExistsForVenue } from "@/lib/rota/data";

interface EventDetailPageProps {
  params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { eventId } = await params;
  const event = await loadEventForPage(eventId);

  return {
    title: event?.title ?? "Event",
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;
  const event = await loadEventForPage(eventId);

  if (!event) {
    notFound();
  }

  const [functionSheetData, hasRotaBuilder] = await Promise.all([
    loadFunctionSheetForPage(eventId, event),
    eventExistsForVenue(eventId),
  ]);

  const sheetBundle = functionSheetData ?? {
    functionSheet: buildDefaultFunctionSheet(event),
    staffingPlan: buildDefaultFunctionSheet(event).staffingPlan,
    isPersisted: false,
  };

  return (
    <DashboardShell title="Event detail" description={event.title}>
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 print:hidden dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>
        <EventDetailView
          event={event}
          functionSheetData={sheetBundle}
          hasRotaBuilder={hasRotaBuilder}
        />
      </div>
    </DashboardShell>
  );
}
