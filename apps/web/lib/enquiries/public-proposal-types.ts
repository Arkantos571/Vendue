import type { ProposalClientResponse, ProposalShareStatus } from "@/lib/mock/enquiries";

export interface PublicProposal {
  venueName: string;
  venueType: string;
  venueCity: string | null;
  accentColour: string | null;
  eventName: string;
  clientName: string;
  requestedDate: string | null;
  preferredStartTime: string;
  preferredEndTime: string;
  preferredEndIsNextDay: boolean;
  guestCount: number;
  eventTypeName: string | null;
  spaceName: string | null;
  proposedPackage: string | null;
  estimatedValue: number;
  proposalTitle: string | null;
  proposalIntro: string | null;
  proposalInclusions: string | null;
  proposalTerms: string | null;
  proposalValidUntil: string | null;
  proposalShareStatus: ProposalShareStatus;
  proposalClientResponse: ProposalClientResponse | null;
  proposalClientMessage: string | null;
  proposalRespondedAt: string | null;
}
