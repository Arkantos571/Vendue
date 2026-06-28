export function slugifyVenueName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return base || "venue";
}

export function uniqueVenueSlug(name: string): string {
  const base = slugifyVenueName(name);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export const PUBLIC_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizePublicSlug(value: string): string {
  return slugifyVenueName(value);
}

export function isValidPublicSlug(slug: string): boolean {
  return slug.length >= 2 && PUBLIC_SLUG_PATTERN.test(slug);
}
