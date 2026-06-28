"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Pencil } from "lucide-react";
import { EnquiryActions } from "@/components/enquiries/enquiry-actions";
import { LinkedEventCard } from "@/components/enquiries/linked-event-card";
import { EnquiryActivitySection } from "@/components/enquiries/enquiry-activity-section";
import { EnquiryClientSection } from "@/components/enquiries/enquiry-client-section";
import { EnquiryEventRequestSection } from "@/components/enquiries/enquiry-event-request-section";
import { EnquiryNotesSection } from "@/components/enquiries/enquiry-notes-section";
import { EnquiryOverviewSection } from "@/components/enquiries/enquiry-overview-section";
import { EnquiryPipelineBar } from "@/components/enquiries/enquiry-pipeline-bar";
import { EnquiryProposalSection } from "@/components/enquiries/enquiry-proposal-section";
import { EmailComposerModal } from "@/components/enquiries/email-composer-modal";
import { ProposalResponseSummary } from "@/components/enquiries/proposal-response-summary";
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

export function EnquiryDetailView({
  enquiry: initialEnquiry,
  venueName,
}: {
  enquiry: MockEnquiry;
  venueName: string;
}) {
  const [activeTab, setActiveTab] = useState<EnquiryTab>("overview");
  const [enquiry, setEnquiry] = useState(initialEnquiry);
  const [emailOpen, setEmailOpen] = useState(false);

  useEffect(() => {
    setEnquiry(initialEnquiry);
  }, [initialEnquiry]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">{enquiry.eventName}</h2>
            <EnquiryStatusBadge status={enquiry.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{enquiry.clientName}</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Link
            href={`/dashboard/enquiries/${enquiry.id}/edit`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />
            Edit enquiry
          </Link>
          <button
            type="button"
            onClick={() => setEmailOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Mail className="h-4 w-4" />
            Email client
          </button>
          <EnquiryActions enquiry={enquiry} onUpdated={setEnquiry} />
        </div>
      </div>

      <EnquiryPipelineBar status={enquiry.status} />

      {enquiry.linkedEvent && <LinkedEventCard event={enquiry.linkedEvent} />}

      <nav className="flex gap-1 overflow-x-auto border-b border-border" aria-label="Enquiry sections">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === id
                ? "border-brand-700 text-brand-700"
                : "border-transparent text-muted-foreground hover:border-slate-300 hover:text-foreground/90",
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <EnquiryOverviewSection enquiry={enquiry} />
          <EnquiryProposalSection enquiry={enquiry} onUpdated={setEnquiry} />
          <ProposalResponseSummary enquiry={enquiry} />
        </div>
      )}
      {activeTab === "client" && <EnquiryClientSection enquiry={enquiry} />}
      {activeTab === "event-request" && <EnquiryEventRequestSection enquiry={enquiry} />}
      {activeTab === "activity" && <EnquiryActivitySection enquiry={enquiry} />}
      {activeTab === "notes" && <EnquiryNotesSection enquiry={enquiry} />}
          <EmailComposerModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        enquiry={enquiry}
        venueName={venueName}
        mode="enquiry"
        onUpdated={setEnquiry}
      />
    </div>
  );
}
