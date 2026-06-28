"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConvertEnquiryModal } from "@/components/enquiries/convert-enquiry-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateEnquiryStatusAction } from "@/lib/enquiries/actions";
import type { EnquiryStatus, MockEnquiry } from "@/lib/mock/enquiries";

interface EnquiryActionsProps {
  enquiry: MockEnquiry;
  onUpdated?: (enquiry: MockEnquiry) => void;
}

const convertibleStatuses: EnquiryStatus[] = ["new", "contacted", "proposal_sent", "confirmed"];

function canConvertEnquiry(enquiry: MockEnquiry): boolean {
  return !enquiry.convertedEventId && convertibleStatuses.includes(enquiry.status);
}

function convertButtonLabel(status: EnquiryStatus): string {
  return status === "confirmed" ? "Create event from enquiry" : "Convert to event";
}

export function EnquiryActions({ enquiry, onUpdated }: EnquiryActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);

  const isConverted = Boolean(enquiry.convertedEventId);
  const showConvert = canConvertEnquiry(enquiry);
  const isConfirmedConvert = enquiry.status === "confirmed" && showConvert;

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

  return (
    <>
      <div className="space-y-3">
        {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}
        {placeholderMessage && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {placeholderMessage}
          </p>
        )}
        {isConverted && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            Converted to event
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isUpdating || enquiry.status === "contacted" || isConverted}
            onClick={() => updateStatus("contacted", true)}
          >
            Mark contacted
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isUpdating || isConverted}
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
          {showConvert && (
            <Button
              type="button"
              size={isConfirmedConvert ? "lg" : "md"}
              disabled={isUpdating}
              className={cn(isConfirmedConvert && "shadow-md")}
              onClick={() => {
                setError(null);
                setConvertOpen(true);
              }}
            >
              {convertButtonLabel(enquiry.status)}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={isUpdating || enquiry.status === "lost" || isConverted}
            onClick={() => updateStatus("lost")}
          >
            Mark lost
          </Button>
        </div>
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
