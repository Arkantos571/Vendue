"use server";

import { randomUUID } from "crypto";
import { requireAuthenticatedClient } from "@/lib/auth/session";
import { toMockEnquiry, type EnquiryRowWithJoins } from "@/lib/enquiries/mappers";

const ENQUIRY_SELECT = `
  id, venue_id, event_name, client_name, client_email, client_phone,
  company, client_preferences, requested_date, preferred_start_time,
  preferred_end_time, event_type_id, space_id, guest_count, budget_estimate,
  estimated_value, status, source, priority, assigned_profile_id,
  last_contact_at, next_follow_up_at, proposal_notes, proposed_package,
  proposal_valid_until, proposal_title, proposal_intro, proposal_inclusions,
  proposal_terms, proposal_internal_notes, proposal_token, proposal_published_at,
  proposal_viewed_at, proposal_status, proposal_client_response, proposal_client_message,
  proposal_responded_at, lost_reason, notes, internal_notes, activity,
  converted_event_id, converted_at, created_at,
  event_types ( name ),
  spaces ( name ),
  profiles!enquiries_assigned_profile_id_fkey ( full_name ),
  events!enquiries_converted_event_id_fkey ( id, title, status, starts_at, ends_at )
`;
import { isEmailProviderConfigured } from "@/lib/email/env";
import { sendEmail } from "@/lib/email/send";
import type { EnquiryEmailTemplate } from "@/lib/email/templates";
import type { EnquiryActivityItem, MockEnquiry } from "@/lib/mock/enquiries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { EnquiryStatus } from "@/types";

export type EmailActionResult<T> =
  | ({ success: true } & T)
  | { success: false; error: string; providerNotConfigured?: boolean };

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function dbErrorMessage(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong. Please try again.";
}

async function getManagingVenueId(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("venue_members")
    .select("venue_id")
    .eq("profile_id", userId)
    .not("joined_at", "is", null)
    .in("role", ["owner", "admin", "manager"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(dbErrorMessage(error));
  }

  return data?.venue_id ?? null;
}

async function getActorName(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>["supabase"],
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  return data?.full_name?.trim() || "Team member";
}

function appendEnquiryActivity(
  existing: unknown,
  entry: EnquiryActivityItem,
): EnquiryActivityItem[] {
  const current = Array.isArray(existing)
    ? existing.filter(
        (item): item is EnquiryActivityItem =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "title" in item,
      )
    : [];
  return [...current, entry];
}

function buildEmailActivity(
  template: EnquiryEmailTemplate,
  recipient: string,
  actorName: string,
): EnquiryActivityItem {
  const now = new Date().toISOString();
  const isProposal = template === "proposal";

  return {
    id: randomUUID(),
    type: isProposal ? "proposal_sent" : "follow_up",
    title: isProposal ? "Proposal email sent" : "Follow-up email sent",
    description: `Email sent to ${recipient}.`,
    timestamp: now,
    actor: actorName,
  };
}

export type SendEnquiryEmailInput = {
  enquiry_id: string;
  recipient_email: string;
  subject: string;
  body: string;
  template: EnquiryEmailTemplate;
  mark_proposal_sent?: boolean;
};

export async function getEmailProviderStatusAction(): Promise<
  EmailActionResult<{ configured: boolean; provider: "resend" | "postmark" | null }>
> {
  if (!isSupabaseConfigured()) {
    return { success: true, configured: false, provider: null };
  }

  try {
    await requireAuthenticatedClient("/sign-in?redirect=/dashboard/enquiries");
    const configured = isEmailProviderConfigured();

    let provider: "resend" | "postmark" | null = null;
    if (configured) {
      if (process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim()) {
        provider = "resend";
      } else if (process.env.POSTMARK_SERVER_TOKEN?.trim() && process.env.EMAIL_FROM?.trim()) {
        provider = "postmark";
      }
    }

    return { success: true, configured, provider };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check email provider.";
    return { success: false, error: message };
  }
}

export async function saveEnquiryEmailDraftAction(input: {
  enquiry_id: string;
  recipient_email: string;
  subject: string;
  body: string;
}): Promise<EmailActionResult<{ ok: true }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  const recipient = input.recipient_email.trim().toLowerCase();
  const subject = input.subject.trim();
  const body = input.body.trim();

  if (!recipient || !EMAIL_PATTERN.test(recipient)) {
    return { success: false, error: "Enter a valid recipient email." };
  }

  if (!subject || !body) {
    return { success: false, error: "Subject and message are required." };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/enquiries/${input.enquiry_id}`,
    );
    const venueId = await getManagingVenueId(supabase, user.id);

    if (!venueId) {
      return { success: false, error: "Only venue managers can draft emails." };
    }

    const { data: enquiry, error: loadError } = await supabase
      .from("enquiries")
      .select("id")
      .eq("id", input.enquiry_id)
      .eq("venue_id", venueId)
      .maybeSingle();

    if (loadError) {
      return { success: false, error: dbErrorMessage(loadError) };
    }

    if (!enquiry) {
      return { success: false, error: "Enquiry not found." };
    }

    const { error } = await supabase.from("email_logs").insert({
      venue_id: venueId,
      enquiry_id: input.enquiry_id,
      recipient_email: recipient,
      subject,
      body,
      status: "draft",
    });

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    return { success: true, ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save draft.";
    return { success: false, error: message };
  }
}

export async function sendEnquiryEmailAction(
  input: SendEnquiryEmailInput,
): Promise<EmailActionResult<{ enquiry?: MockEnquiry; sent: boolean }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  const recipient = input.recipient_email.trim().toLowerCase();
  const subject = input.subject.trim();
  const body = input.body.trim();

  if (!recipient || !EMAIL_PATTERN.test(recipient)) {
    return { success: false, error: "Enter a valid recipient email." };
  }

  if (!subject || !body) {
    return { success: false, error: "Subject and message are required." };
  }

  if (!isEmailProviderConfigured()) {
    return {
      success: false,
      error: "Email provider is not configured yet. Copy the email instead.",
      providerNotConfigured: true,
    };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/enquiries/${input.enquiry_id}`,
    );
    const venueId = await getManagingVenueId(supabase, user.id);

    if (!venueId) {
      return { success: false, error: "Only venue managers can send emails." };
    }

    const { data: existing, error: loadError } = await supabase
      .from("enquiries")
      .select("id, status, activity, converted_event_id")
      .eq("id", input.enquiry_id)
      .eq("venue_id", venueId)
      .maybeSingle();

    if (loadError) {
      return { success: false, error: dbErrorMessage(loadError) };
    }

    if (!existing) {
      return { success: false, error: "Enquiry not found." };
    }

    if (existing.converted_event_id) {
      return { success: false, error: "Converted enquiries cannot be emailed from here." };
    }

    const sendResult = await sendEmail({ to: recipient, subject, body });
    const now = new Date().toISOString();

    if (!sendResult.ok) {
      await supabase.from("email_logs").insert({
        venue_id: venueId,
        enquiry_id: input.enquiry_id,
        recipient_email: recipient,
        subject,
        body,
        status: "failed",
        provider: sendResult.provider ?? null,
      });

      return {
        success: false,
        error: sendResult.error ?? "We could not send this email. Try copying it instead.",
      };
    }

    await supabase.from("email_logs").insert({
      venue_id: venueId,
      enquiry_id: input.enquiry_id,
      recipient_email: recipient,
      subject,
      body,
      status: "sent",
      provider: sendResult.provider ?? null,
      provider_message_id: sendResult.providerMessageId ?? null,
      sent_at: now,
    });

    const actorName = await getActorName(supabase, user.id);
    const activity = appendEnquiryActivity(
      existing.activity,
      buildEmailActivity(input.template, recipient, actorName),
    );

    const shouldMarkProposalSent =
      input.mark_proposal_sent ||
      (input.template === "proposal" && existing.status !== "confirmed" && existing.status !== "lost");

    const enquiryUpdate: {
      last_contact_at: string;
      activity: EnquiryActivityItem[];
      status?: EnquiryStatus;
    } = {
      last_contact_at: now,
      activity,
    };

    if (shouldMarkProposalSent && existing.status !== "proposal_sent") {
      enquiryUpdate.status = "proposal_sent";
    }

    const { data, error } = await supabase
      .from("enquiries")
      .update(enquiryUpdate)
      .eq("id", input.enquiry_id)
      .eq("venue_id", venueId)
      .select(ENQUIRY_SELECT)
      .maybeSingle();

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    return {
      success: true,
      sent: true,
      enquiry: data ? toMockEnquiry(data as EnquiryRowWithJoins) : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email.";
    return { success: false, error: message };
  }
}

export async function logCopiedEnquiryEmailAction(input: {
  enquiry_id: string;
  recipient_email: string;
  subject: string;
  body: string;
  template: EnquiryEmailTemplate;
}): Promise<EmailActionResult<{ enquiry?: MockEnquiry }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  const recipient = input.recipient_email.trim().toLowerCase();
  const subject = input.subject.trim();
  const body = input.body.trim();

  if (!recipient || !EMAIL_PATTERN.test(recipient)) {
    return { success: false, error: "Enter a valid recipient email." };
  }

  if (!subject || !body) {
    return { success: false, error: "Subject and message are required." };
  }

  try {
    const { supabase, user } = await requireAuthenticatedClient(
      `/sign-in?redirect=/dashboard/enquiries/${input.enquiry_id}`,
    );
    const venueId = await getManagingVenueId(supabase, user.id);

    if (!venueId) {
      return { success: false, error: "Only venue managers can log copied emails." };
    }

    const { data: existing, error: loadError } = await supabase
      .from("enquiries")
      .select("id, status, activity, converted_event_id")
      .eq("id", input.enquiry_id)
      .eq("venue_id", venueId)
      .maybeSingle();

    if (loadError) {
      return { success: false, error: dbErrorMessage(loadError) };
    }

    if (!existing) {
      return { success: false, error: "Enquiry not found." };
    }

    const now = new Date().toISOString();

    await supabase.from("email_logs").insert({
      venue_id: venueId,
      enquiry_id: input.enquiry_id,
      recipient_email: recipient,
      subject,
      body,
      status: "copied",
    });

    const actorName = await getActorName(supabase, user.id);
    const activity = appendEnquiryActivity(
      existing.activity,
      {
        ...buildEmailActivity(input.template, recipient, actorName),
        title: "Email copied",
        description: `Email copied for ${recipient}.`,
      },
    );

    const { data, error } = await supabase
      .from("enquiries")
      .update({
        last_contact_at: now,
        activity,
      })
      .eq("id", input.enquiry_id)
      .eq("venue_id", venueId)
      .select(ENQUIRY_SELECT)
      .maybeSingle();

    if (error) {
      return { success: false, error: dbErrorMessage(error) };
    }

    return {
      success: true,
      enquiry: data ? toMockEnquiry(data as EnquiryRowWithJoins) : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to log copied email.";
    return { success: false, error: message };
  }
}
