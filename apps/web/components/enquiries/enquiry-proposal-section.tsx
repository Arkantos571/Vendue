"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  markProposalSentAction,
  updateEnquiryProposalAction,
  type EnquiryProposalInput,
} from "@/lib/enquiries/actions";
import type { MockEnquiry } from "@/lib/mock/enquiries";

interface EnquiryProposalSectionProps {
  enquiry: MockEnquiry;
  onUpdated?: (enquiry: MockEnquiry) => void;
}

export function EnquiryProposalSection({ enquiry, onUpdated }: EnquiryProposalSectionProps) {
  const [estimatedValue, setEstimatedValue] = useState(String(enquiry.estimatedValue || ""));
  const [proposalNotes, setProposalNotes] = useState(enquiry.proposalNotes ?? "");
  const [proposedPackage, setProposedPackage] = useState(enquiry.proposedPackage ?? "");
  const [proposalValidUntil, setProposalValidUntil] = useState(enquiry.proposalValidUntil ?? "");
  const [followUpDate, setFollowUpDate] = useState(enquiry.nextFollowUpDate ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailPlaceholder, setEmailPlaceholder] = useState<string | null>(null);

  const isConverted = Boolean(enquiry.convertedEventId);
  const isLost = enquiry.status === "lost";

  useEffect(() => {
    setEstimatedValue(String(enquiry.estimatedValue || ""));
    setProposalNotes(enquiry.proposalNotes ?? "");
    setProposedPackage(enquiry.proposedPackage ?? "");
    setProposalValidUntil(enquiry.proposalValidUntil ?? "");
    setFollowUpDate(enquiry.nextFollowUpDate ?? "");
  }, [enquiry]);

  function buildInput(): EnquiryProposalInput {
    const parsedValue = Number(estimatedValue);
    return {
      enquiry_id: enquiry.id,
      estimated_value: Number.isFinite(parsedValue) ? parsedValue : 0,
      proposal_notes: proposalNotes,
      proposed_package: proposedPackage,
      proposal_valid_until: proposalValidUntil || null,
      next_follow_up_date: followUpDate || null,
    };
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    setEmailPlaceholder(null);

    const result = await updateEnquiryProposalAction(buildInput());
    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onUpdated?.(result.enquiry);
    setSuccess("Proposal details saved.");
  }

  async function handleMarkSent() {
    setIsSending(true);
    setError(null);
    setSuccess(null);
    setEmailPlaceholder(null);

    const result = await markProposalSentAction(buildInput());
    setIsSending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onUpdated?.(result.enquiry);
    setSuccess("Marked as proposal sent.");
    setEmailPlaceholder("Email sending will be connected later.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal</CardTitle>
        <CardDescription>
          Capture proposal details before sending to the client. Status only changes when you mark
          proposal sent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}
        {success && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            {success}
          </p>
        )}
        {emailPlaceholder && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {emailPlaceholder}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="proposal-estimated-value" className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Estimated value (£)
            </label>
            <Input
              id="proposal-estimated-value"
              type="number"
              min={0}
              step={1}
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              disabled={isSaving || isSending || isConverted || isLost}
              className="mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="proposal-valid-until" className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Valid until
            </label>
            <Input
              id="proposal-valid-until"
              type="date"
              value={proposalValidUntil}
              onChange={(e) => setProposalValidUntil(e.target.value)}
              disabled={isSaving || isSending || isConverted || isLost}
              className="mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="proposed-package" className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Proposed package
            </label>
            <Input
              id="proposed-package"
              value={proposedPackage}
              onChange={(e) => setProposedPackage(e.target.value)}
              placeholder="e.g. Full day hire + AV + catering"
              disabled={isSaving || isSending || isConverted || isLost}
              className="mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="proposal-notes" className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Proposal notes
            </label>
            <Textarea
              id="proposal-notes"
              value={proposalNotes}
              onChange={(e) => setProposalNotes(e.target.value)}
              rows={4}
              placeholder="Internal proposal summary and client-facing notes"
              disabled={isSaving || isSending || isConverted || isLost}
              className="mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="follow-up-date" className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Internal follow-up date
            </label>
            <Input
              id="follow-up-date"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              disabled={isSaving || isSending || isConverted || isLost}
              className="mt-1.5"
            />
          </div>
        </div>

        {!isConverted && !isLost && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" variant="outline" disabled={isSaving || isSending} onClick={handleSave}>
              {isSaving ? "Saving…" : "Save proposal"}
            </Button>
            <Button type="button" disabled={isSaving || isSending} onClick={handleMarkSent}>
              {isSending ? "Updating…" : "Mark proposal sent"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
