import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EventDetailView } from "@/components/events/event-detail-view";
import { loadEventForPage } from "@/lib/events/data";
import { buildPlaceholderFunctionSheetFromEvent } from "@/lib/mock/function-sheet";
import { getRotaBuilderByEventId } from "@/lib/mock/rota";

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

  const functionSheet = buildPlaceholderFunctionSheetFromEvent(event);
  const hasRotaBuilder = Boolean(getRotaBuilderByEventId(eventId));

  return (
    <DashboardShell title="Event detail" description={event.title}>
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>
        <EventDetailView
          event={event}
          functionSheet={functionSheet}
          hasRotaBuilder={hasRotaBuilder}
        />
      </div>
    </DashboardShell>
  );
}
