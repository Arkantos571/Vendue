import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RotaBuilder } from "@/components/rota/rota-builder";
import { eventExistsForVenue, loadRotaBuilderForPage } from "@/lib/rota/data";

interface RotaBuilderPageProps {
  params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: RotaBuilderPageProps): Promise<Metadata> {
  const { eventId } = await params;
  const data = await loadRotaBuilderForPage(eventId);

  return {
    title: data ? `Rota — ${data.eventName}` : "Rota builder",
  };
}

export default async function RotaBuilderPage({ params }: RotaBuilderPageProps) {
  const { eventId } = await params;
  const exists = await eventExistsForVenue(eventId);

  if (!exists) {
    notFound();
  }

  const initialData = await loadRotaBuilderForPage(eventId);

  return (
    <DashboardShell
      title="Rota builder"
      description={initialData?.eventName ?? "Event rota"}
    >
      <div className="mx-auto max-w-7xl">
        <RotaBuilder eventId={eventId} initialData={initialData} />
      </div>
    </DashboardShell>
  );
}
