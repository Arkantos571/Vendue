"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import {
  createEventAction,
  loadEventFormOptionsAction,
} from "@/lib/events/actions";
import {
  EVENT_START_TIME_OPTIONS,
  getEndTimeOptionsForStart,
  resolveEventTimestamps,
} from "@/lib/events/event-time";

function endSelectionKey(time: string, nextDay: boolean): string {
  return nextDay ? `next|${time}` : `same|${time}`;
}

function parseEndSelectionKey(key: string): { time: string; nextDay: boolean } {
  if (key.startsWith("next|")) {
    return { time: key.slice(5), nextDay: true };
  }
  if (key.startsWith("same|")) {
    return { time: key.slice(5), nextDay: false };
  }
  return { time: key, nextDay: false };
}

export function NewEventForm() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>([]);
  const [eventTypes, setEventTypes] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noVenue, setNoVenue] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endSelection, setEndSelection] = useState("");

  const endOptions = useMemo(() => {
    if (!startTime) {
      return { sameDay: [], nextDay: [] };
    }
    return getEndTimeOptionsForStart(startTime);
  }, [startTime]);

  useEffect(() => {
    if (!endSelection) {
      return;
    }

    const { time, nextDay } = parseEndSelectionKey(endSelection);
    const isStillValid =
      endOptions.sameDay.some((option) => option.value === time && !nextDay) ||
      endOptions.nextDay.some((option) => option.value === time && nextDay);

    if (!isStillValid) {
      setEndSelection("");
    }
  }, [endOptions, endSelection]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      const result = await loadEventFormOptionsAction();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error);
        setSpaces([]);
        setEventTypes([]);
        setNoVenue(false);
      } else {
        setSpaces(result.spaces);
        setEventTypes(result.eventTypes);
        setNoVenue(Boolean(result.noVenue));
      }

      setIsLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const eventDate = String(formData.get("event_date") ?? "");
    const { time: endTime, nextDay: endIsNextDay } = parseEndSelectionKey(endSelection);

    const clientValidation = resolveEventTimestamps(eventDate, startTime, endTime, {
      endIsNextDay,
    });

    if ("error" in clientValidation) {
      setIsSubmitting(false);
      setError(clientValidation.error);
      return;
    }

    const guestCountRaw = String(formData.get("guest_count") ?? "").trim();
    const guestCount = Number(guestCountRaw);

    const result = await createEventAction({
      title: String(formData.get("title") ?? ""),
      client_name: String(formData.get("client_name") ?? ""),
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      end_is_next_day: endIsNextDay,
      space_id: String(formData.get("space") ?? ""),
      event_type_id: String(formData.get("event_type") ?? ""),
      guest_count: guestCount,
      client_email: String(formData.get("client_email") ?? "") || undefined,
      client_phone: String(formData.get("client_phone") ?? "") || undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`/dashboard/events/${result.eventId}`);
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-stone-500">Loading form…</p>
      </div>
    );
  }

  if (noVenue) {
    return <VenueRequiredEmptyState />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-stone-900">Event details</h2>
        <p className="mt-1 text-sm text-stone-500">Core information for this booking.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Event name</Label>
            <Input id="title" name="title" required placeholder="Corporate Dinner — Meridian Group" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_type">Event type</Label>
            <Select id="event_type" name="event_type" required defaultValue="">
              <option value="" disabled>
                Select type
              </option>
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest_count">Guest count</Label>
            <Input id="guest_count" name="guest_count" type="number" min={1} required placeholder="120" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-stone-900">Client details</h2>
        <p className="mt-1 text-sm text-stone-500">Primary contact for this event.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="client_name">Client name</Label>
            <Input id="client_name" name="client_name" required placeholder="Sarah Chen" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_email">Client email</Label>
            <Input id="client_email" name="client_email" type="email" placeholder="sarah@company.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_phone">Client phone</Label>
            <Input id="client_phone" name="client_phone" type="tel" placeholder="+44 7700 900000" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-stone-900">Schedule & space</h2>
        <p className="mt-1 text-sm text-stone-500">When and where the event takes place.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="event_date">Event date</Label>
            <Input id="event_date" name="event_date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="space">Space</Label>
            <Select id="space" name="space" required defaultValue="">
              <option value="" disabled>
                Select space
              </option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_time">Start time</Label>
            <Select
              id="start_time"
              name="start_time"
              required
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            >
              <option value="" disabled>
                Select start time
              </option>
              {EVENT_START_TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End time</Label>
            <Select
              id="end_time"
              name="end_time"
              required
              value={endSelection}
              disabled={!startTime}
              onChange={(event) => setEndSelection(event.target.value)}
            >
              <option value="" disabled>
                {startTime ? "Select end time" : "Select start time first"}
              </option>
              {endOptions.sameDay.length > 0 && (
                <optgroup label="Same day">
                  {endOptions.sameDay.map((option) => (
                    <option
                      key={endSelectionKey(option.value, false)}
                      value={endSelectionKey(option.value, false)}
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              )}
              {endOptions.nextDay.length > 0 && (
                <optgroup label="Next day">
                  {endOptions.nextDay.map((option) => (
                    <option
                      key={endSelectionKey(option.value, true)}
                      value={endSelectionKey(option.value, true)}
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              )}
            </Select>
            <p className="text-xs text-stone-500">
              For events past midnight, pick an option under Next day (e.g. 00:00 next day).
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-stone-900">Notes</h2>
        <p className="mt-1 text-sm text-stone-500">Operational notes for your team.</p>
        <div className="mt-5">
          <Textarea
            id="notes"
            name="notes"
            placeholder="Dietary requirements, AV needs, special instructions…"
            rows={4}
          />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/events"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-900 hover:bg-stone-50"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isSubmitting || !startTime || !endSelection}>
          {isSubmitting ? "Creating…" : "Create event"}
        </Button>
      </div>
    </form>
  );
}
