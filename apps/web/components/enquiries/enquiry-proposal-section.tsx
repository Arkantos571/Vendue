"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText } from "lucide-react";
import { EnquiryStatusBadge } from "@/components/enquiries/enquiry-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { markProposalSentAction } from "@/lib/enquiries/actions";
import {
  enquiryStatusLabels,
  formatEnquiryCurrency,
  type MockEnquiry,
} from "@/lib/mock/enquiries";
import { formatDate } from "@/lib/utils";

interface EnquiryProposalSectionProps {
  enquiry: MockEnquiry;
  onUpdated?: (enquiry: MockEnquiry) => void;
}

export function EnquiryProposalSection({ enquiry, onUpdated }: EnquiryProposalSectionProps) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isConverted = Boolean(enquiry.convertedEventId);
  const isLost = enquiry.status === "lost";

  async function handleMarkSent() {
    setIsSending(true);
    setError(null);
    setSuccess(null);

    const result = await markProposalSentAction({
      enquiry_id: enquiry.id,
      estimated_value: enquiry.estimatedValue,
      proposal_title: enquiry.proposalTitle,
      proposal_intro: enquiry.proposalIntro,
      proposal_notes: enquiry.proposalNotes,
      proposed_package: enquiry.proposedPackage,
      proposal_inclusions: enquiry.proposalInclusions,
      proposal_terms: enquiry.proposalTerms,
      proposal_internal_notes: enquiry.proposalInternalNotes,
      proposal_valid_until: enquiry.proposalValidUntil,
      next_follow_up_date: enquiry.nextFollowUpDate,
    });

    setIsSending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onUpdated?.(result.enquiry);
    setSuccess("Marked as proposal sent. Email sending will be connected later.");
  }

  const summaryItems = [
    { label: "Status", value: enquiryStatusLabels[enquiry.status] },
    {
      label: "Proposed package",
      value: enquiry.proposedPackage?.trim() || "Not set",
    },
    {
      label: "Estimated value",
      value: formatEnquiryCurrency(enquiry.estimatedValue),
    },
    {
      label: "Valid until",
      value: enquiry.proposalValidUntil ? formatDate(enquiry.proposalValidUntil) : "Not set",
    },
    {
      label: "Follow-up",
      value: enquiry.nextFollowUpDate ? formatDate(enquiry.nextFollowUpDate) : "Not set",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>Proposal</CardTitle>
          <EnquiryStatusBadge status={enquiry.status} />
        </div>
        <CardDescription>
          Prepare a client-facing proposal preview before sending. Use the builder to edit draft
          content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}
        {success && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            {success}
          </p>
        )}

        <dl className="grid gap-4 sm:grid-cols-2">
          {summaryItems.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
              <dd className="mt-1 text-sm text-stone-900 dark:text-stone-100">{value}</dd>
            </div>
          ))}
        </dl>

        {enquiry.proposalTitle && (
          <p className="text-sm text-stone-600 dark:text-stone-400">
            <span className="font-medium text-stone-800 dark:text-stone-200">Title:</span>{" "}
            {enquiry.proposalTitle}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Link
            href={`/dashboard/enquiries/${enquiry.id}/proposal`}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-800"
          >
            <FileText className="h-4 w-4" />
            Open proposal builder
          </Link>
          {!isConverted && !isLost && (
            <Button type="button" variant="outline" disabled={isSending} onClick={handleMarkSent}>
              {isSending ? "Updating…" : "Mark proposal sent"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
