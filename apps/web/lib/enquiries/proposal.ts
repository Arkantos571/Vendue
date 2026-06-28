import { formatEnquiryTimeRange } from "@/lib/enquiries/mappers";
import { formatEnquiryCurrency, type MockEnquiry } from "@/lib/mock/enquiries";
import { formatDate } from "@/lib/utils";
import { venueTypeLabel } from "@/lib/venue-setup/venue-types";
import type { VenueType } from "@/types";

export interface ProposalVenueSummary {
  name: string;
  venueType: string;
  city: string | null;
  accentColour: string | null;
}

export interface ProposalPreviewData {
  venue: ProposalVenueSummary;
  enquiry: MockEnquiry;
  title: string;
  intro: string;
  packageName: string;
  inclusions: string;
  terms: string;
  estimatedValue: number;
  validUntil: string | null;
}

const DEFAULT_TERMS = `This proposal is subject to venue availability and final contract terms. A deposit may be required to confirm your booking. Prices exclude VAT unless stated otherwise.`;

const DEFAULT_NEXT_STEPS = `To proceed, please confirm your acceptance before the validity date. Our team will then send formal booking documentation.`;

export function defaultProposalTitle(enquiry: MockEnquiry, venueName: string): string {
  return enquiry.proposalTitle?.trim() || `${enquiry.eventName} — ${venueName}`;
}

export function defaultProposalIntro(enquiry: MockEnquiry, venue: ProposalVenueSummary): string {
  if (enquiry.proposalIntro?.trim()) {
    return enquiry.proposalIntro.trim();
  }

  return `Thank you for your enquiry, ${enquiry.clientName}. We are pleased to share this proposal for your ${enquiry.eventType.toLowerCase()} at ${venue.name}.`;
}

export function buildProposalPreviewData(
  enquiry: MockEnquiry,
  venue: ProposalVenueSummary,
): ProposalPreviewData {
  return {
    venue,
    enquiry,
    title: defaultProposalTitle(enquiry, venue.name),
    intro: defaultProposalIntro(enquiry, venue),
    packageName: enquiry.proposedPackage?.trim() || "Package details to be confirmed",
    inclusions: enquiry.proposalInclusions?.trim() || "Inclusions will be confirmed with your event coordinator.",
    terms: enquiry.proposalTerms?.trim() || DEFAULT_TERMS,
    estimatedValue: enquiry.estimatedValue,
    validUntil: enquiry.proposalValidUntil,
  };
}

export function formatProposalSchedule(enquiry: MockEnquiry): string {
  const date = enquiry.requestedDate ? formatDate(enquiry.requestedDate) : "Date TBC";
  const time = formatEnquiryTimeRange(enquiry);
  const space = enquiry.spacePreference !== "No preference" ? enquiry.spacePreference : null;

  return [date, time !== "—" ? time : null, space].filter(Boolean).join(" · ");
}

export function formatProposalText(preview: ProposalPreviewData): string {
  const { enquiry, venue, title, intro, packageName, inclusions, terms, estimatedValue, validUntil } =
    preview;
  const lines: string[] = [];

  lines.push(title.toUpperCase());
  lines.push(venue.name);
  if (venue.city) lines.push(venue.city);
  lines.push("");
  lines.push(`Prepared for: ${enquiry.clientName}`);
  if (enquiry.company) lines.push(`Company: ${enquiry.company}`);
  if (enquiry.clientEmail) lines.push(`Email: ${enquiry.clientEmail}`);
  lines.push("");
  lines.push(intro);
  lines.push("");
  lines.push("EVENT SUMMARY");
  lines.push(`Event: ${enquiry.eventName}`);
  lines.push(`Type: ${enquiry.eventType}`);
  lines.push(`Schedule: ${formatProposalSchedule(enquiry)}`);
  lines.push(`Guests: ${enquiry.guestCount}`);
  lines.push("");
  lines.push("PROPOSED PACKAGE");
  lines.push(packageName);
  lines.push("");
  lines.push(`Estimated value: ${formatEnquiryCurrency(estimatedValue)}`);
  lines.push("");
  lines.push("INCLUSIONS");
  lines.push(inclusions);
  lines.push("");
  if (enquiry.proposalNotes?.trim()) {
    lines.push("NOTES");
    lines.push(enquiry.proposalNotes.trim());
    lines.push("");
  }
  if (validUntil) {
    lines.push(`Valid until: ${formatDate(validUntil)}`);
    lines.push("");
  }
  lines.push("NEXT STEPS");
  lines.push(DEFAULT_NEXT_STEPS);
  lines.push("");
  lines.push("TERMS");
  lines.push(terms);

  return lines.join("\n");
}

export function toProposalVenueSummary(row: {
  name: string;
  venue_type: VenueType;
  venue_type_custom: string | null;
  city: string | null;
  accent_colour: string | null;
}): ProposalVenueSummary {
  return {
    name: row.name,
    venueType: venueTypeLabel(row.venue_type, row.venue_type_custom),
    city: row.city,
    accentColour: row.accent_colour,
  };
}
