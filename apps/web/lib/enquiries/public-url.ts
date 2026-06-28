const DEFAULT_SITE_URL = "https://venudue.app";

export function getPublicEnquiryPath(publicSlug: string): string {
  return `/enquire/${publicSlug}`;
}

export function getPublicEnquiryUrl(publicSlug: string, origin?: string): string {
  const base = (origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, "");
  return `${base}${getPublicEnquiryPath(publicSlug)}`;
}
