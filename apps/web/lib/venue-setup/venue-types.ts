import type { VenueType } from "@/types";

export const venueTypeOptions: { value: VenueType; label: string }[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "pub", label: "Pub" },
  { value: "hotel", label: "Hotel" },
  { value: "event_venue", label: "Event Venue" },
  { value: "private_members_club", label: "Private Members Club" },
  { value: "wedding_venue", label: "Wedding Venue" },
  { value: "conference_centre", label: "Conference Centre" },
  { value: "cafe", label: "Café" },
  { value: "nightclub", label: "Nightclub" },
  { value: "gallery_museum", label: "Gallery / Museum" },
  { value: "outdoor_space", label: "Outdoor Space" },
  { value: "coworking_space", label: "Co-working Space" },
  { value: "theatre_performance_space", label: "Theatre / Performance Space" },
  { value: "other", label: "Other" },
];

export function venueTypeLabel(type: VenueType, custom?: string | null): string {
  if (type === "other" && custom?.trim()) {
    return custom.trim();
  }

  return venueTypeOptions.find((option) => option.value === type)?.label ?? type;
}
