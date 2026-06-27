const DEFAULT_APP_URL = "http://localhost:3000";

/** Public app origin for auth redirects, metadata, and absolute links. */
export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return DEFAULT_APP_URL;
}
