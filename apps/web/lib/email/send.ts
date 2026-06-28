import { getEmailProviderConfig, type EmailProviderName } from "@/lib/email/env";

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}

export interface SendEmailResult {
  ok: boolean;
  provider?: EmailProviderName;
  providerMessageId?: string;
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const config = getEmailProviderConfig();

  if (!config) {
    return { ok: false, error: "Email provider is not configured." };
  }

  try {
    if (config.provider === "resend") {
      return await sendViaResend(config.from, config.apiKey, input);
    }

    return await sendViaPostmark(config.from, config.apiKey, input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email.";
    return { ok: false, provider: config.provider, error: message };
  }
}

async function sendViaResend(
  from: string,
  apiKey: string,
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.body,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };

  if (!response.ok) {
    return {
      ok: false,
      provider: "resend",
      error: payload.message ?? "Resend rejected the email.",
    };
  }

  return {
    ok: true,
    provider: "resend",
    providerMessageId: payload.id,
  };
}

async function sendViaPostmark(
  from: string,
  serverToken: string,
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": serverToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      From: from,
      To: input.to,
      Subject: input.subject,
      TextBody: input.body,
      MessageStream: "outbound",
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    MessageID?: string;
    Message?: string;
  };

  if (!response.ok) {
    return {
      ok: false,
      provider: "postmark",
      error: payload.Message ?? "Postmark rejected the email.",
    };
  }

  return {
    ok: true,
    provider: "postmark",
    providerMessageId: payload.MessageID,
  };
}
