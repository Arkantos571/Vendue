import type { VenueOnboardingDraft } from "@/types";

export const emptySpace = () => ({ name: "", capacity: null as number | null, description: "" });

export const emptyEventType = () => ({
  name: "",
  description: "",
  default_duration_minutes: 180 as number | null,
});

export function createEmptyVenueDraft(): VenueOnboardingDraft {
  return {
    venue_id: null,
    name: "",
    venue_type: "other",
    venue_type_custom: "",
    accent_colour: "#5c4b8a",
    default_opening_hours: "",
    public_slug: "",
    enquiry_form_enabled: true,
    spaces: [emptySpace()],
    event_types: [emptyEventType()],
  };
}
