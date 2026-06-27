"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateEnquiryStatusAction } from "@/lib/enquiries/actions";
import type { EnquiryStatus, MockEnquiry } from "@/lib/mock/enquiries";

interface EnquiryActionsProps {
  enquiry: MockEnquiry;
  onUpdated?: (enquiry: MockEnquiry) => void;
}

export function EnquiryActions({ enquiry, onUpdated }: EnquiryActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(null);

  async function updateStatus(status: EnquiryStatus, setLastContact = false) {
    setIsUpdating(true);
    setError(null);
    setPlaceholderMessage(null);

    const result = await updateEnquiryStatusAction({
      enquiry_id: enquiry.id,
      status,
      set_last_contact: setLastContact,
    });

    setIsUpdating(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onUpdated?.(result.enquiry);
    router.refresh();
  }

  function showPlaceholder(message: string) {
    setPlaceholderMessage(message);
    setError(null);
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-700">{error}</p>}
      {placeholderMessage && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {placeholderMessage}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isUpdating || enquiry.status === "contacted"}
          onClick={() => updateStatus("contacted", true)}
        >
          Mark contacted
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isUpdating}
          onClick={async () => {
            setIsUpdating(true);
            setError(null);

            const result = await updateEnquiryStatusAction({
              enquiry_id: enquiry.id,
              status: "proposal_sent",
              set_last_contact: true,
            });

            setIsUpdating(false);

            if (!result.success) {
              setError(result.error);
              return;
            }

            onUpdated?.(result.enquiry);
            router.refresh();
            setPlaceholderMessage(
              "Proposal sending is not connected yet — status updated to proposal sent.",
            );
          }}
        >
          Send proposal
        </Button>
        <Button
          type="button"
          disabled={isUpdating}
          onClick={() =>
            showPlaceholder(
              "Conversion workflow will create an event from this enquiry in the next phase.",
            )
          }
        >
          Convert to event
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isUpdating || enquiry.status === "lost"}
          onClick={() => updateStatus("lost")}
        >
          Mark lost
        </Button>
      </div>
    </div>
  );
}
