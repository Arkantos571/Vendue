import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RotaBuilder } from "@/components/rota/rota-builder";
import { getRotaBuilderByEventId } from "@/lib/mock/rota";

interface RotaBuilderPageProps {
  params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: RotaBuilderPageProps): Promise<Metadata> {
  const { eventId } = await params;
  const data = getRotaBuilderByEventId(eventId);

  return {
    title: data ? `Rota — ${data.eventName}` : "Rota builder",
  };
}

export default async function RotaBuilderPage({ params }: RotaBuilderPageProps) {
  const { eventId } = await params;
  const data = getRotaBuilderByEventId(eventId);

  if (!data) {
    notFound();
  }

  return (
    <DashboardShell
      title="Rota builder"
      description={data.eventName}
    >
      <div className="mx-auto max-w-7xl">
        <RotaBuilder initialData={data} />
      </div>
    </DashboardShell>
  );
}
