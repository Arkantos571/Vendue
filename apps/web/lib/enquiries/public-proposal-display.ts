import { formatEnquiryTimeRange } from "@/lib/enquiries/mappers";
import type { PublicProposal } from "@/lib/enquiries/public-proposal-types";
import { formatDate } from "@/lib/utils";

const DEFAULT_TERMS =
  "This proposal is subject to venue availability and final contract terms. A deposit may be required to confirm your booking. Prices exclude VAT unless stated otherwise.";

const DEFAULT_INTRO_SUFFIX = (clientName: string, eventType: string, venueName: string) =>
  `Thank you for your enquiry, ${clientName}. We are pleased to share this proposal for your ${eventType.toLowerCase()} at ${venueName}.`;

export function publicProposalTitle(proposal: PublicProposal): string {
  return proposal.proposalTitle?.trim() || `${proposal.eventName} — ${proposal.venueName}`;
}

export function publicProposalIntro(proposal: PublicProposal): string {
  if (proposal.proposalIntro?.trim()) {
    return proposal.proposalIntro.trim();
  }

  const eventType = proposal.eventTypeName ?? "event";
  return DEFAULT_INTRO_SUFFIX(proposal.clientName, eventType, proposal.venueName);
}

export function publicProposalPackage(proposal: PublicProposal): string {
  return proposal.proposedPackage?.trim() || "Package details to be confirmed";
}

export function publicProposalInclusions(proposal: PublicProposal): string {
  return (
    proposal.proposalInclusions?.trim() ||
    "Inclusions will be confirmed with your event coordinator."
  );
}

export function publicProposalTerms(proposal: PublicProposal): string {
  return proposal.proposalTerms?.trim() || DEFAULT_TERMS;
}

export function publicProposalSchedule(proposal: PublicProposal): string {
  const date = proposal.requestedDate ? formatDate(proposal.requestedDate) : "Date TBC";
  const time =
    proposal.preferredStartTime && proposal.preferredEndTime
      ? formatEnquiryTimeRange({
          preferredStartTime: proposal.preferredStartTime,
          preferredEndTime: proposal.preferredEndTime,
          preferredEndIsNextDay: proposal.preferredEndIsNextDay,
        })
      : null;
  const space = proposal.spaceName;

  return [date, time, space].filter(Boolean).join(" · ");
}
