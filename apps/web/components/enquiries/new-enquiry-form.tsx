"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import {
  createEnquiryAction,
  loadEnquiryFormOptionsAction,
} from "@/lib/enquiries/actions";
import {
  EVENT_START_TIME_OPTIONS,
  getEndTimeOptionsForStart,
} from "@/lib/events/event-time";
import { enquirySourceOptions } from "@/lib/mock/enquiries";

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

export function NewEnquiryForm() {
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

      const result = await loadEnquiryFormOptionsAction();

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

  async function submitForm(form: HTMLFormElement, redirectToDetail: boolean) {
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(form);
    const { time: endTime, nextDay: endIsNextDay } = parseEndSelectionKey(endSelection);
    const guestCountRaw = String(formData.get("guest_count") ?? "");
    const budgetRaw = String(formData.get("budget_estimate") ?? "");

    const result = await createEnquiryAction({
      event_name: String(formData.get("event_name") ?? ""),
      client_name: String(formData.get("client_name") ?? ""),
      client_email: String(formData.get("client_email") ?? ""),
      client_phone: String(formData.get("client_phone") ?? "") || undefined,
      requested_date: String(formData.get("requested_date") ?? ""),
      preferred_start_time: startTime || undefined,
      preferred_end_time: endTime || undefined,
      end_is_next_day: endIsNextDay,
      event_type_id: String(formData.get("event_type") ?? ""),
      space_id: String(formData.get("space_preference") ?? "") || undefined,
      guest_count: guestCountRaw ? Number(guestCountRaw) : undefined,
      budget_estimate: budgetRaw ? Number(budgetRaw) : undefined,
      source: String(formData.get("enquiry_source") ?? "website") as
        | "website"
        | "phone"
        | "email"
        | "referral"
        | "walk_in"
        | "agency",
      priority: String(formData.get("priority") ?? "medium") as "low" | "medium" | "high",
      notes: String(formData.get("notes") ?? "") || undefined,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(
      redirectToDetail ? `/dashboard/enquiries/${result.enquiryId}` : "/dashboard/enquiries",
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-stone-500">Loading form…</p>
      </div>
    );
  }

  if (noVenue) {
    return (
      <VenueRequiredEmptyState
        message="Set up your venue before managing enquiries"
        description="Add your venue details, spaces, and event types in Settings first."
      />
    );
  }

  return (
    <form
      id="new-enquiry-form"
      onSubmit={(e) => {
        e.preventDefault();
        void submitForm(e.currentTarget, true);
      }}
      className="space-y-8"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-stone-900">Enquiry details</h2>
        <p className="mt-1 text-sm text-stone-500">Event and client information from first contact.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="event_name">Event name</Label>
            <Input id="event_name" name="event_name" required placeholder="Summer Product Launch Dinner" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_name">Client name</Label>
            <Input id="client_name" name="client_name" required placeholder="Sarah Chen" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_email">Client email</Label>
            <Input id="client_email" name="client_email" type="email" required placeholder="client@company.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_phone">Client phone</Label>
            <Input id="client_phone" name="client_phone" type="tel" placeholder="+44 7700 900000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="enquiry_source">Enquiry source</Label>
            <Select id="enquiry_source" name="enquiry_source" required defaultValue="website">
              {enquirySourceOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Internal priority</Label>
            <Select id="priority" name="priority" defaultValue="medium">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-stone-900">Event request</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="requested_date">Requested event date</Label>
            <Input id="requested_date" name="requested_date" type="date" required />
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
            <Label htmlFor="start_time">Preferred start time</Label>
            <Select
              id="start_time"
              value={startTime}
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
              disabled={!startTime}
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
            <Label htmlFor="space_preference">Space preference</Label>
            <Select id="space_preference" name="space_preference" defaultValue="">
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
            <Input id="guest_count" name="guest_count" type="number" min={1} placeholder="80" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="budget_estimate">Budget estimate (£)</Label>
            <Input id="budget_estimate" name="budget_estimate" type="number" min={0} step={100} placeholder="12000" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} placeholder="Client requirements, dietary needs, AV, etc." />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => {
            const form = document.getElementById("new-enquiry-form");
            if (form instanceof HTMLFormElement) {
              void submitForm(form, false);
            }
          }}
        >
          {isSubmitting ? "Saving…" : "Save enquiry"}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save and view enquiry"}
        </Button>
      </div>
    </form>
  );
}
