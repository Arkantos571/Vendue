"use client";

import { useEffect, useState } from "react";
import { EnquiryPipelineCards } from "@/components/enquiries/enquiry-pipeline-cards";
import { EnquiriesList } from "@/components/enquiries/enquiries-list";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import { loadEnquiriesAction } from "@/lib/enquiries/actions";
import type { EnquiryPipelineStats, MockEnquiry } from "@/lib/mock/enquiries";

const emptyStats: EnquiryPipelineStats = {
  newEnquiries: 0,
  awaitingReply: 0,
  proposalSent: 0,
  openEnquiries: 0,
  conversionRate: 0,
};

export function EnquiriesPageContent() {
  const [enquiries, setEnquiries] = useState<MockEnquiry[]>([]);
  const [pipelineStats, setPipelineStats] = useState<EnquiryPipelineStats>(emptyStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noVenue, setNoVenue] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      const result = await loadEnquiriesAction();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error);
        setEnquiries([]);
        setPipelineStats(emptyStats);
        setNoVenue(false);
      } else {
        setEnquiries(result.enquiries);
        setPipelineStats(result.pipelineStats);
        setNoVenue(Boolean(result.noVenue));
      }

      setIsLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="v-empty">
        <p className="text-sm text-muted-foreground">Loading enquiries…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-red-900">Could not load enquiries</p>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (noVenue) {
    return (
      <VenueRequiredEmptyState
        message="Set up your venue before managing enquiries"
        description="Add your venue details, spaces, and event types in Settings first."
      />
    );
  }

  return (
    <div className="space-y-6">
      <EnquiryPipelineCards stats={pipelineStats} />
      <EnquiriesList enquiries={enquiries} />
    </div>
  );
}
