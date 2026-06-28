"use server";

import {
  inferPreferredEndIsNextDay,
  normalizeTimeValue,
} from "@/lib/enquiries/mappers";
import type { PublicProposal } from "@/lib/enquiries/public-proposal-types";
import type { DbClient } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { venueTypeLabel } from "@/lib/venue-setup/venue-types";
import type { ProposalClientResponse, ProposalShareStatus } from "@/lib/mock/enquiries";
import type { VenueType } from "@/types";

export type PublicProposalActionResult<T> =
  | ({ success: true } & T)
  | { success: false; error: string };

type RpcProposalRow = {
  venue_name: string;
  venue_type: VenueType;
  venue_type_custom: string | null;
  venue_city: string | null;
  accent_colour: string | null;
  event_name: string;
  client_name: string;
  requested_date: string | null;
  preferred_start_time: string | null;
  preferred_end_time: string | null;
  guest_count: number | null;
  event_type_name: string | null;
  space_name: string | null;
  proposed_package: string | null;
  estimated_value: number | string | null;
  proposal_title: string | null;
  proposal_intro: string | null;
  proposal_inclusions: string | null;
  proposal_terms: string | null;
  proposal_valid_until: string | null;
  proposal_status: ProposalShareStatus;
  proposal_client_response: ProposalClientResponse | null;
  proposal_client_message: string | null;
  proposal_responded_at: string | null;
};

type RpcSubmitResponseRow = {
  proposal_status: ProposalShareStatus;
  proposal_client_response: ProposalClientResponse;
  proposal_client_message: string | null;
  proposal_responded_at: string;
};

function parseAmount(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDateOnly(iso: string | null): string | null {
  if (!iso) return null;
  return iso.slice(0, 10);
}

function mapRpcProposal(row: RpcProposalRow): PublicProposal {
  const startTime = normalizeTimeValue(row.preferred_start_time);
  const endTime = normalizeTimeValue(row.preferred_end_time);

  return {
    venueName: row.venue_name,
    venueType: venueTypeLabel(row.venue_type, row.venue_type_custom),
    venueCity: row.venue_city,
    accentColour: row.accent_colour,
    eventName: row.event_name,
    clientName: row.client_name,
    requestedDate: row.requested_date,
    preferredStartTime: startTime,
    preferredEndTime: endTime,
    preferredEndIsNextDay: inferPreferredEndIsNextDay(startTime, endTime),
    guestCount: row.guest_count ?? 0,
    eventTypeName: row.event_type_name,
    spaceName: row.space_name,
    proposedPackage: row.proposed_package,
    estimatedValue: parseAmount(row.estimated_value),
    proposalTitle: row.proposal_title,
    proposalIntro: row.proposal_intro,
    proposalInclusions: row.proposal_inclusions,
    proposalTerms: row.proposal_terms,
    proposalValidUntil: row.proposal_valid_until,
    proposalShareStatus: row.proposal_status ?? "shared",
    proposalClientResponse: row.proposal_client_response,
    proposalClientMessage: row.proposal_client_message,
    proposalRespondedAt: toDateOnly(row.proposal_responded_at),
  };
}

function dbErrorMessage(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong. Please try again.";
}

export async function loadPublicProposalAction(
  token: string,
): Promise<PublicProposalActionResult<{ proposal: PublicProposal }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Proposal is not available right now." };
  }

  const trimmed = token.trim();
  if (!trimmed) {
    return { success: false, error: "Proposal not found." };
  }

  try {
    const supabase = (await createClient()) as unknown as DbClient;
    const { data, error } = await supabase.rpc("get_public_proposal", {
      p_token: trimmed,
    });

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    if (!data || typeof data !== "object") {
      return { success: false, error: "Proposal not found." };
    }

    return {
      success: true,
      proposal: mapRpcProposal(data as RpcProposalRow),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load proposal.";
    return { success: false, error: message };
  }
}

export async function submitPublicProposalResponseAction(input: {
  token: string;
  response: ProposalClientResponse;
  message?: string | null;
}): Promise<
  PublicProposalActionResult<{
    proposalShareStatus: ProposalShareStatus;
    proposalClientResponse: ProposalClientResponse;
    proposalClientMessage: string | null;
    proposalRespondedAt: string | null;
  }>
> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Proposal is not available right now." };
  }

  const trimmed = input.token.trim();
  if (!trimmed) {
    return { success: false, error: "Proposal not found." };
  }

  try {
    const supabase = (await createClient()) as unknown as DbClient;
    const { data, error } = await supabase.rpc("submit_public_proposal_response", {
      p_token: trimmed,
      p_response: input.response,
      p_message: input.message ?? null,
    });

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    if (!data || typeof data !== "object") {
      return { success: false, error: "Proposal not found." };
    }

    const row = data as RpcSubmitResponseRow;

    return {
      success: true,
      proposalShareStatus: row.proposal_status,
      proposalClientResponse: row.proposal_client_response,
      proposalClientMessage: row.proposal_client_message,
      proposalRespondedAt: toDateOnly(row.proposal_responded_at),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send response.";
    return { success: false, error: message };
  }
}
