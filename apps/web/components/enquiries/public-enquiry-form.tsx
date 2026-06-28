"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  loadPublicEnquiryFormOptionsAction,
  loadPublicVenuesAction,
  submitPublicEnquiryAction,
  type PublicVenueOption,
} from "@/lib/enquiries/public-actions";
import {
  endSelectionKey,
  EVENT_START_TIME_OPTIONS,
  getEndTimeOptionsForStart,
  parseEndSelectionKey,
} from "@/lib/events/event-time";

type PublicEnquiryFormProps = {
  initialVenueId?: string;
  fixedVenue?: {
    id: string;
    name: string;
  };
};

export function PublicEnquiryForm({ initialVenueId, fixedVenue }: PublicEnquiryFormProps) {
  const [venues, setVenues] = useState<PublicVenueOption[]>([]);
  const [venueId, setVenueId] = useState(fixedVenue?.id ?? initialVenueId ?? "");
  const [venueName, setVenueName] = useState("");
  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>([]);
  const [eventTypes, setEventTypes] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(!fixedVenue);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endSelection, setEndSelection] = useState("");

  const endOptions = useMemo(() => {
    if (!startTime) {
      return { sameDay: [], nextDay: [] };
    }
    return getEndTimeOptionsForStart(startTime);
  }, [startTime]);

  const showVenueSelector = !fixedVenue && venues.length > 1;

  useEffect(() => {
    if (fixedVenue) {
      setVenueName(fixedVenue.name);
      return;
    }

    let cancelled = false;

    async function loadVenues() {
      setIsLoadingVenues(true);
      setError(null);

      const result = await loadPublicVenuesAction();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error);
        setVenues([]);
        setIsLoadingVenues(false);
        return;
      }

      const nextVenues = result.venues;
      setVenues(nextVenues);

      const queryVenueValid =
        initialVenueId && nextVenues.some((venue) => venue.id === initialVenueId);
      const resolvedVenueId =
        (queryVenueValid ? initialVenueId : undefined) ??
        (nextVenues.length === 1 ? nextVenues[0]?.id : "") ??
        "";

      setVenueId(resolvedVenueId);
      setIsLoadingVenues(false);
    }

    void loadVenues();

    return () => {
      cancelled = true;
    };
  }, [fixedVenue, initialVenueId]);

  useEffect(() => {
    if (!venueId) {
      setVenueName("");
      setSpaces([]);
      setEventTypes([]);
      return;
    }

    let cancelled = false;

    async function loadOptions() {
      setIsLoadingOptions(true);
      setError(null);

      const result = await loadPublicEnquiryFormOptionsAction(venueId);

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error);
        setVenueName("");
        setSpaces([]);
        setEventTypes([]);
      } else if (!result.options) {
        setError("This venue is not available for enquiries.");
        setVenueName("");
        setSpaces([]);
        setEventTypes([]);
      } else {
        setVenueName(result.options.venueName);
        setSpaces(result.options.spaces);
        setEventTypes(result.options.eventTypes);
      }

      setIsLoadingOptions(false);
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [venueId]);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const { time: endTime, nextDay: endIsNextDay } = parseEndSelectionKey(endSelection);
    const guestCountRaw = String(formData.get("guest_count") ?? "");
    const budgetRaw = String(formData.get("budget_estimate") ?? "");

    const result = await submitPublicEnquiryAction({
      venue_id: venueId,
      event_name: String(formData.get("event_name") ?? ""),
      client_name: String(formData.get("client_name") ?? ""),
      client_email: String(formData.get("client_email") ?? ""),
      client_phone: String(formData.get("client_phone") ?? "") || undefined,
      requested_date: String(formData.get("requested_date") ?? ""),
      preferred_start_time: startTime || undefined,
      preferred_end_time: endTime || undefined,
      end_is_next_day: endIsNextDay,
      event_type_id: String(formData.get("event_type") ?? "") || undefined,
      space_id: String(formData.get("space_preference") ?? "") || undefined,
      guest_count: Number(guestCountRaw),
      budget_estimate: budgetRaw ? Number(budgetRaw) : undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <div className="v-panel text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-foreground">
          Enquiry sent
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enquiry sent. The venue team will get back to you soon.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button type="button" variant="secondary" onClick={() => setSubmitted(false)}>
            Submit another enquiry
          </Button>
          <Link
            href="/"
            className="text-sm font-medium text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingVenues) {
    return (
      <div className="v-panel">
        <p className="text-sm text-muted-foreground">Loading enquiry form…</p>
      </div>
    );
  }

  if (!fixedVenue && venues.length === 0) {
    return (
      <div className="v-panel">
        <h2 className="text-base font-semibold text-foreground">
          Enquiries unavailable
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No venues are accepting enquiries online at the moment. Please contact the venue directly.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex text-sm font-medium text-brand-700 hover:text-brand-800 dark:text-brand-400"
        >
          Back to homepage
        </Link>
      </div>
    );
  }

  const formDisabled = !venueId || isLoadingOptions || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </div>
      )}

      {showVenueSelector && (
        <section className="v-panel">
          <h2 className="text-base font-semibold text-foreground">Venue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the venue you would like to enquire with.
          </p>
          <div className="mt-5 space-y-2">
            <Label htmlFor="venue_id">Venue</Label>
            <Select
              id="venue_id"
              required
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
            >
              <option value="" disabled>
                Select venue
              </option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </Select>
          </div>
        </section>
      )}

      {!fixedVenue && !showVenueSelector && venueName && (
        <section className="v-panel">
          <p className="text-sm text-muted-foreground">Enquiring with</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{venueName}</p>
        </section>
      )}

      <section className="v-panel">
        <h2 className="text-base font-semibold text-foreground">Your details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="event_name">Event name / occasion</Label>
            <Input
              id="event_name"
              name="event_name"
              required
              disabled={formDisabled}
              placeholder="Summer celebration dinner"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_name">Your name</Label>
            <Input id="client_name" name="client_name" required disabled={formDisabled} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_email">Email</Label>
            <Input
              id="client_email"
              name="client_email"
              type="email"
              required
              disabled={formDisabled}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="client_phone">Phone (optional)</Label>
            <Input id="client_phone" name="client_phone" type="tel" disabled={formDisabled} />
          </div>
        </div>
      </section>

      <section className="v-panel">
        <h2 className="text-base font-semibold text-foreground">Event request</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="requested_date">Requested event date</Label>
            <Input
              id="requested_date"
              name="requested_date"
              type="date"
              required
              disabled={formDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_type">Event type (optional)</Label>
            <Select id="event_type" name="event_type" disabled={formDisabled} defaultValue="">
              <option value="">No preference</option>
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_time">Preferred start time</Label>
            <Select
              id="start_time"
              value={startTime}
              disabled={formDisabled}
              onChange={(e) => setStartTime(e.target.value)}
            >
              <option value="">No preference</option>
              {EVENT_START_TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">Preferred end time</Label>
            <Select
              id="end_time"
              value={endSelection}
              disabled={formDisabled || !startTime}
              onChange={(e) => setEndSelection(e.target.value)}
            >
              <option value="">
                {startTime ? "No preference" : "Select start time first"}
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="space_preference">Space preference (optional)</Label>
            <Select
              id="space_preference"
              name="space_preference"
              disabled={formDisabled}
              defaultValue=""
            >
              <option value="">No preference</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest_count">Guest count</Label>
            <Input
              id="guest_count"
              name="guest_count"
              type="number"
              min={1}
              required
              disabled={formDisabled}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="budget_estimate">Budget estimate (optional)</Label>
            <Input
              id="budget_estimate"
              name="budget_estimate"
              type="number"
              min={0}
              step={1}
              disabled={formDisabled}
              placeholder="e.g. 5000"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes / message (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              disabled={formDisabled}
              placeholder="Tell us about your event, dietary needs, or setup preferences."
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          By submitting, you agree the venue may contact you about this enquiry.
        </p>
        <Button type="submit" disabled={formDisabled} className="sm:min-w-40">
          {isSubmitting ? "Sending…" : "Send enquiry"}
        </Button>
      </div>
    </form>
  );
}
