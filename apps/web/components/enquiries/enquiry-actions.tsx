"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConvertEnquiryModal } from "@/components/enquiries/convert-enquiry-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { markProposalSentAction, updateEnquiryStatusAction } from "@/lib/enquiries/actions";
import type { EnquiryStatus, MockEnquiry } from "@/lib/mock/enquiries";

interface EnquiryActionsProps {
  enquiry: MockEnquiry;
  onUpdated?: (enquiry: MockEnquiry) => void;
}

function canConvertEnquiry(enquiry: MockEnquiry): boolean {
  return (
    !enquiry.convertedEventId &&
    enquiry.status !== "lost" &&
    ["new", "contacted", "proposal_sent", "confirmed"].includes(enquiry.status)
  );
}

function canReopenEnquiry(enquiry: MockEnquiry): boolean {
  return (
    !enquiry.convertedEventId &&
    (enquiry.status === "lost" || enquiry.status === "confirmed")
  );
}

export function EnquiryActions({ enquiry, onUpdated }: EnquiryActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalNotice, setProposalNotice] = useState<string | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [lostReason, setLostReason] = useState(enquiry.lostReason ?? "");

  const isConverted = Boolean(enquiry.convertedEventId);
  const showConvert = canConvertEnquiry(enquiry);
  const showReopen = canReopenEnquiry(enquiry);
  const isConfirmedConvert = enquiry.status === "confirmed" && showConvert;
  const isLost = enquiry.status === "lost";
  const isTerminal = isLost || isConverted;

  async function updateStatus(
    status: EnquiryStatus,
    options: { setLastContact?: boolean; lostReason?: string | null; reopen?: boolean } = {},
  ) {
    setIsUpdating(true);
    setError(null);
    setProposalNotice(null);

    const result = await updateEnquiryStatusAction({
      enquiry_id: enquiry.id,
      status,
      set_last_contact: options.setLastContact,
      lost_reason: options.lostReason,
      reopen: options.reopen,
    });

    setIsUpdating(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onUpdated?.(result.enquiry);
    router.refresh();
    setLostOpen(false);
  }

  async function handleMarkProposalSent() {
    setIsUpdating(true);
    setError(null);
    setProposalNotice(null);

    const result = await markProposalSentAction({
      enquiry_id: enquiry.id,
      estimated_value: enquiry.estimatedValue,
      proposal_notes: enquiry.proposalNotes,
      proposed_package: enquiry.proposedPackage,
      proposal_valid_until: enquiry.proposalValidUntil,
      next_follow_up_date: enquiry.nextFollowUpDate,
    });

    setIsUpdating(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onUpdated?.(result.enquiry);
    router.refresh();
    setProposalNotice("Email sending will be connected later.");
  }

  return (
    <>
      <div className="space-y-3">
        {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}
        {proposalNotice && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {proposalNotice}
          </p>
        )}
        {isConverted && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            Converted to event
          </p>
        )}
        {isLost && enquiry.lostReason && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-foreground/90">
            Lost reason: {enquiry.lostReason}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {!isTerminal && enquiry.status === "new" && (
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating}
              onClick={() => updateStatus("contacted", { setLastContact: true })}
            >
              {isUpdating ? "Updating…" : "Mark contacted"}
            </Button>
          )}

          {!isTerminal && enquiry.status !== "proposal_sent" && enquiry.status !== "confirmed" && (
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating}
              onClick={handleMarkProposalSent}
            >
              Mark proposal sent
            </Button>
          )}

          {!isTerminal && enquiry.status !== "confirmed" && (
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating}
              onClick={() => updateStatus("confirmed", { setLastContact: true })}
            >
              Mark confirmed
            </Button>
          )}

          {showConvert && (
            <Button
              type="button"
              size={isConfirmedConvert ? "lg" : "md"}
              variant={isConfirmedConvert ? "primary" : "outline"}
              disabled={isUpdating}
              className={cn(
                isConfirmedConvert && "shadow-md",
                isLost && "opacity-50",
              )}
              onClick={() => {
                setError(null);
                setConvertOpen(true);
              }}
            >
              {enquiry.status === "confirmed" ? "Create event from enquiry" : "Convert to event"}
            </Button>
          )}

          {!isTerminal && !lostOpen && (
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating}
              onClick={() => setLostOpen(true)}
            >
              Mark lost
            </Button>
          )}

          {showReopen && (
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating}
              onClick={() => updateStatus("contacted", { reopen: true })}
            >
              Reopen enquiry
            </Button>
          )}
        </div>

        {lostOpen && !isConverted && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 /50">
            <label htmlFor="lost-reason" className="text-sm font-medium text-foreground/90">
              Lost reason (optional)
            </label>
            <Textarea
              id="lost-reason"
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              rows={2}
              className="mt-2"
              placeholder="e.g. Chose another venue, budget mismatch"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isUpdating}
                onClick={() => updateStatus("lost", { lostReason })}
              >
                Confirm lost
              </Button>
              <Button type="button" variant="ghost" disabled={isUpdating} onClick={() => setLostOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConvertEnquiryModal
        enquiry={enquiry}
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        onConverted={(updated) => {
          setConvertOpen(false);
          onUpdated?.(updated);
          router.refresh();
        }}
      />
    </>
  );
}
