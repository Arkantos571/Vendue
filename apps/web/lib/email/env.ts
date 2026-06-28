export type EmailProviderName = "resend" | "postmark";

export interface EmailProviderConfig {
  provider: EmailProviderName;
  from: string;
  apiKey: string;
}

export function getEmailProviderConfig(): EmailProviderConfig | null {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    return null;
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    return { provider: "resend", from, apiKey: resendKey };
  }

  const postmarkToken = process.env.POSTMARK_SERVER_TOKEN?.trim();
  if (postmarkToken) {
    return { provider: "postmark", from, apiKey: postmarkToken };
  }

  return null;
}

export function isEmailProviderConfigured(): boolean {
  return getEmailProviderConfig() !== null;
}
