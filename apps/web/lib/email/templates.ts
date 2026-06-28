import { getPublicProposalUrl } from "@/lib/enquiries/public-url";

export type EnquiryEmailTemplate = "proposal" | "follow_up" | "confirmation_follow_up";

export const enquiryEmailTemplateLabels: Record<EnquiryEmailTemplate, string> = {
  proposal: "Proposal email",
  follow_up: "Follow-up email",
  confirmation_follow_up: "Confirmation follow-up",
};

export interface EmailTemplateContext {
  clientName: string;
  eventName: string;
  venueName: string;
  proposalToken?: string | null;
  includeProposalLink?: boolean;
}

export function resolveProposalUrl(token: string | null | undefined): string | null {
  if (!token?.trim()) {
    return null;
  }
  return getPublicProposalUrl(token.trim());
}

export function buildEnquiryEmailTemplate(
  template: EnquiryEmailTemplate,
  context: EmailTemplateContext,
): { subject: string; body: string } {
  const proposalUrl =
    context.includeProposalLink !== false && context.proposalToken
      ? resolveProposalUrl(context.proposalToken)
      : null;

  switch (template) {
    case "proposal":
      return buildProposalEmailTemplate({ ...context, proposalUrl });
    case "confirmation_follow_up":
      return buildConfirmationFollowUpTemplate(context);
    case "follow_up":
    default:
      return buildFollowUpEmailTemplate({ ...context, proposalUrl });
  }
}

function buildProposalEmailTemplate(params: {
  clientName: string;
  eventName: string;
  venueName: string;
  proposalUrl: string | null;
}): { subject: string; body: string } {
  const subject = `Proposal for ${params.eventName} at ${params.venueName}`;
  const lines = [
    `Hi ${params.clientName},`,
    "",
    "Thank you for your enquiry.",
    "",
  ];

  if (params.proposalUrl) {
    lines.push("You can view your proposal here:", params.proposalUrl, "");
  }

  lines.push(
    "Please have a look and let us know if you have any questions.",
    "",
    "Best,",
    params.venueName,
  );

  return { subject, body: lines.join("\n") };
}

function buildFollowUpEmailTemplate(params: {
  clientName: string;
  eventName: string;
  venueName: string;
  proposalUrl: string | null;
}): { subject: string; body: string } {
  const subject = `Following up on your enquiry — ${params.eventName}`;
  const lines = [
    `Hi ${params.clientName},`,
    "",
    `Just following up on your enquiry for ${params.eventName}.`,
    "",
  ];

  if (params.proposalUrl) {
    lines.push(
      "You can review your proposal here:",
      params.proposalUrl,
      "",
    );
  }

  lines.push(
    "Let us know if you have any questions or if you would like us to adjust the proposal.",
    "",
    "Best,",
    params.venueName,
  );

  return { subject, body: lines.join("\n") };
}

function buildConfirmationFollowUpTemplate(params: {
  clientName: string;
  eventName: string;
  venueName: string;
}): { subject: string; body: string } {
  const subject = `Next steps for ${params.eventName}`;
  const body = [
    `Hi ${params.clientName},`,
    "",
    `Thank you for confirming ${params.eventName}.`,
    "",
    "We wanted to check in and see if you need anything else from us ahead of the event.",
    "",
    "Best,",
    params.venueName,
  ].join("\n");

  return { subject, body };
}

export function formatEmailForClipboard(
  recipient: string,
  subject: string,
  body: string,
): string {
  return [`To: ${recipient}`, `Subject: ${subject}`, "", body].join("\n");
}
