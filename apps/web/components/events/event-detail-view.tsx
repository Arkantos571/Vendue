"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Users } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EventClientSection } from "@/components/events/event-client-section";
import { EventNotesSection } from "@/components/events/event-notes-section";
import { EventOverviewSection } from "@/components/events/event-overview-section";
import { EventRotaSection } from "@/components/events/event-rota-section";
import { FunctionSheetView } from "@/components/function-sheet/function-sheet-view";
import { cn } from "@/lib/utils";
import type { MockEvent } from "@/lib/mock/events";
import type { FunctionSheetPageData } from "@/lib/function-sheets/data";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "function-sheet", label: "Function sheet" },
  { id: "rota", label: "Rota" },
  { id: "client", label: "Client" },
  { id: "notes", label: "Notes" },
] as const;

type EventDetailTab = (typeof tabs)[number]["id"];

interface EventDetailViewProps {
  event: MockEvent;
  functionSheetData: FunctionSheetPageData;
  hasRotaBuilder: boolean;
}

export function EventDetailView({ event, functionSheetData, hasRotaBuilder }: EventDetailViewProps) {
  const [activeTab, setActiveTab] = useState<EventDetailTab>("overview");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-stone-900">{event.title}</h2>
            <StatusBadge status={event.status} />
          </div>
          <p className="mt-1 text-sm text-stone-500">{event.eventType}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/events/${event.id}/edit`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-900 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
          >
            <Pencil className="h-4 w-4" />
            Edit event
          </Link>
          {hasRotaBuilder ? (
            <Link
              href={`/dashboard/rota/${event.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-800"
            >
              <Users className="h-4 w-4" />
              Build rota
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-stone-200 px-4 text-sm font-medium text-stone-400"
            >
              <Users className="h-4 w-4" />
              Build rota
            </button>
          )}
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-b border-stone-200 print:hidden"
        aria-label="Event sections"
      >
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === id
                ? "border-brand-700 text-brand-700"
                : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700",
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <EventOverviewSection event={event} />
            {event.notes && (
              <div className="rounded-xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Quick note</p>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{event.notes}</p>
              </div>
            )}
          </div>
          <EventClientSection event={event} />
        </div>
      )}

      {activeTab === "function-sheet" && (
        <FunctionSheetView
          event={event}
          initialFunctionSheet={functionSheetData.functionSheet}
          initialStaffingPlan={functionSheetData.staffingPlan}
          isPersisted={functionSheetData.isPersisted}
          hasRotaBuilder={hasRotaBuilder}
        />
      )}

      {activeTab === "rota" && (
        <EventRotaSection event={event} hasRotaBuilder={hasRotaBuilder} />
      )}

      {activeTab === "client" && <EventClientSection event={event} />}

      {activeTab === "notes" && <EventNotesSection event={event} />}
    </div>
  );
}
