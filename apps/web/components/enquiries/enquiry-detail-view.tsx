"use client";

import { useEffect, useState } from "react";
import { EnquiryActions } from "@/components/enquiries/enquiry-actions";
import { LinkedEventCard } from "@/components/enquiries/linked-event-card";
import { EnquiryActivitySection } from "@/components/enquiries/enquiry-activity-section";
import { EnquiryClientSection } from "@/components/enquiries/enquiry-client-section";
import { EnquiryEventRequestSection } from "@/components/enquiries/enquiry-event-request-section";
import { EnquiryNotesSection } from "@/components/enquiries/enquiry-notes-section";
import { EnquiryOverviewSection } from "@/components/enquiries/enquiry-overview-section";
import { EnquiryStatusBadge } from "@/components/enquiries/enquiry-status-badge";
import { cn } from "@/lib/utils";
import type { MockEnquiry } from "@/lib/mock/enquiries";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "client", label: "Client" },
  { id: "event-request", label: "Event request" },
  { id: "activity", label: "Activity" },
  { id: "notes", label: "Notes" },
] as const;

type EnquiryTab = (typeof tabs)[number]["id"];

export function EnquiryDetailView({ enquiry: initialEnquiry }: { enquiry: MockEnquiry }) {
  const [activeTab, setActiveTab] = useState<EnquiryTab>("overview");
  const [enquiry, setEnquiry] = useState(initialEnquiry);

  useEffect(() => {
    setEnquiry(initialEnquiry);
  }, [initialEnquiry]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-stone-900">{enquiry.eventName}</h2>
            <EnquiryStatusBadge status={enquiry.status} />
          </div>
          <p className="mt-1 text-sm text-stone-500">{enquiry.clientName}</p>
        </div>
        <EnquiryActions enquiry={enquiry} onUpdated={setEnquiry} />
      </div>

      {enquiry.linkedEvent && <LinkedEventCard event={enquiry.linkedEvent} />}

      <nav className="flex gap-1 overflow-x-auto border-b border-stone-200" aria-label="Enquiry sections">
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

      {activeTab === "overview" && <EnquiryOverviewSection enquiry={enquiry} />}
      {activeTab === "client" && <EnquiryClientSection enquiry={enquiry} />}
      {activeTab === "event-request" && <EnquiryEventRequestSection enquiry={enquiry} />}
      {activeTab === "activity" && <EnquiryActivitySection enquiry={enquiry} />}
      {activeTab === "notes" && <EnquiryNotesSection enquiry={enquiry} />}
    </div>
  );
}
