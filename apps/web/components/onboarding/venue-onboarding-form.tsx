"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockEventTypes, mockSpaces } from "@/lib/mock/events";
import type { VenueOnboardingDraft, VenueType } from "@/types";

const venueTypeOptions: { value: VenueType; label: string }[] = [
  { value: "hotel", label: "Hotel" },
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "conference_centre", label: "Conference centre" },
  { value: "wedding_venue", label: "Wedding venue" },
  { value: "private_members_club", label: "Private members club" },
  { value: "other", label: "Other" },
];

const emptySpace = () => ({ name: "", capacity: null as number | null, description: "" });
const emptyEventType = () => ({ name: "", description: "", default_duration_minutes: 180 as number | null });

const initialDraft: VenueOnboardingDraft = {
  name: "The Grand Assembly",
  venue_type: "wedding_venue",
  accent_colour: "#5c4b8a",
  default_opening_hours: "Mon–Fri 09:00–23:00, Sat–Sun 10:00–00:00",
  spaces: mockSpaces.map((space) => ({
    name: space.name,
    capacity: space.name === "Main Ballroom" ? 250 : space.name === "Garden Terrace" ? 120 : 40,
    description: "",
  })),
  event_types: mockEventTypes.map((type) => ({
    name: type.name,
    description: "",
    default_duration_minutes: 180,
  })),
};

export function VenueOnboardingForm() {
  const [draft, setDraft] = useState<VenueOnboardingDraft>(initialDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateSpace(index: number, field: keyof VenueOnboardingDraft["spaces"][number], value: string) {
    setDraft((prev) => ({
      ...prev,
      spaces: prev.spaces.map((space, i) =>
        i === index
          ? {
              ...space,
              [field]: field === "capacity" ? (value === "" ? null : Number(value)) : value,
            }
          : space,
      ),
    }));
  }

  function updateEventType(
    index: number,
    field: keyof VenueOnboardingDraft["event_types"][number],
    value: string,
  ) {
    setDraft((prev) => ({
      ...prev,
      event_types: prev.event_types.map((eventType, i) =>
        i === index
          ? {
              ...eventType,
              [field]:
                field === "default_duration_minutes"
                  ? value === ""
                    ? null
                    : Number(value)
                  : value,
            }
          : eventType,
      ),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSaved(false);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Venue details</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Name and type shown across the dashboard.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="venue_name">Venue name</Label>
            <Input
              id="venue_name"
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="The Grand Assembly"
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="venue_type">Venue type</Label>
            <Select
              id="venue_type"
              value={draft.venue_type}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, venue_type: e.target.value as VenueType }))
              }
            >
              {venueTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="accent_colour">Branding / accent colour</Label>
            <div className="flex items-center gap-3">
              <Input
                id="accent_colour"
                type="color"
                value={draft.accent_colour}
                onChange={(e) => setDraft((prev) => ({ ...prev, accent_colour: e.target.value }))}
                className="h-10 w-14 cursor-pointer p-1"
              />
              <Input
                value={draft.accent_colour}
                onChange={(e) => setDraft((prev) => ({ ...prev, accent_colour: e.target.value }))}
                placeholder="#5c4b8a"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">Used for client-facing materials when branding is enabled.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-stone-100 dark:border-stone-800 pt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Spaces</h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Rooms, halls, and areas where events take place.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDraft((prev) => ({ ...prev, spaces: [...prev.spaces, emptySpace()] }))}
          >
            <Plus className="h-4 w-4" />
            Add space
          </Button>
        </div>

        <div className="space-y-4">
          {draft.spaces.map((space, index) => (
            <div key={index} className="rounded-lg border border-stone-200 bg-stone-50/50 dark:border-stone-700 dark:bg-stone-800/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Space {index + 1}</p>
                {draft.spaces.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        spaces: prev.spaces.filter((_, i) => i !== index),
                      }))
                    }
                    className="rounded p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 dark:hover:bg-stone-700 dark:text-stone-300"
                    aria-label={`Remove space ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`space_name_${index}`}>Name</Label>
                  <Input
                    id={`space_name_${index}`}
                    value={space.name}
                    onChange={(e) => updateSpace(index, "name", e.target.value)}
                    placeholder="Main ballroom"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`space_capacity_${index}`}>Capacity</Label>
                  <Input
                    id={`space_capacity_${index}`}
                    type="number"
                    min={1}
                    value={space.capacity ?? ""}
                    onChange={(e) => updateSpace(index, "capacity", e.target.value)}
                    placeholder="200"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`space_description_${index}`}>Description</Label>
                  <Textarea
                    id={`space_description_${index}`}
                    value={space.description ?? ""}
                    onChange={(e) => updateSpace(index, "description", e.target.value)}
                    placeholder="Ground floor, natural light, AV included"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 border-t border-stone-100 dark:border-stone-800 pt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Event types</h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Templates that speed up event creation and staffing.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setDraft((prev) => ({ ...prev, event_types: [...prev.event_types, emptyEventType()] }))
            }
          >
            <Plus className="h-4 w-4" />
            Add type
          </Button>
        </div>

        <div className="space-y-4">
          {draft.event_types.map((eventType, index) => (
            <div key={index} className="rounded-lg border border-stone-200 bg-stone-50/50 dark:border-stone-700 dark:bg-stone-800/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Event type {index + 1}</p>
                {draft.event_types.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        event_types: prev.event_types.filter((_, i) => i !== index),
                      }))
                    }
                    className="rounded p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 dark:hover:bg-stone-700 dark:text-stone-300"
                    aria-label={`Remove event type ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`event_type_name_${index}`}>Name</Label>
                  <Input
                    id={`event_type_name_${index}`}
                    value={eventType.name}
                    onChange={(e) => updateEventType(index, "name", e.target.value)}
                    placeholder="Wedding reception"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`event_type_duration_${index}`}>Default duration (minutes)</Label>
                  <Input
                    id={`event_type_duration_${index}`}
                    type="number"
                    min={30}
                    step={15}
                    value={eventType.default_duration_minutes ?? ""}
                    onChange={(e) => updateEventType(index, "default_duration_minutes", e.target.value)}
                    placeholder="180"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`event_type_description_${index}`}>Description</Label>
                  <Textarea
                    id={`event_type_description_${index}`}
                    value={eventType.description ?? ""}
                    onChange={(e) => updateEventType(index, "description", e.target.value)}
                    placeholder="Evening service, seated dining, bar until midnight"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      <section className="space-y-4 border-t border-stone-100 dark:border-stone-800 pt-8">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Default opening hours</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Placeholder for venue-wide hours used when scheduling events.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="default_opening_hours">Opening hours</Label>
          <Textarea
            id="default_opening_hours"
            value={draft.default_opening_hours}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, default_opening_hours: e.target.value }))
            }
            placeholder="Mon–Fri 09:00–23:00, Sat–Sun 10:00–00:00"
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t border-stone-100 dark:border-stone-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        {saved && (
          <p className="text-sm text-brand-700 dark:text-brand-300">Changes saved locally. Database sync coming next.</p>
        )}
        <Button type="submit" className="sm:ml-auto" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
