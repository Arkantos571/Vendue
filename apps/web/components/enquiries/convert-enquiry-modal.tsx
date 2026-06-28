"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { convertEnquiryToEventAction } from "@/lib/enquiries/actions";
import { formatEnquiryTimeRange } from "@/lib/enquiries/mappers";
import { loadEventFormOptionsAction } from "@/lib/events/actions";
import {
  EVENT_START_TIME_OPTIONS,
  getEndTimeOptionsForStart,
  resolveEventTimestamps,
} from "@/lib/events/event-time";
import {
  formatEnquiryCurrency,
  type MockEnquiry,
} from "@/lib/mock/enquiries";
import { formatDate } from "@/lib/utils";
import type { EventStatus } from "@/types";

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

interface ConvertEnquiryModalProps {
  enquiry: MockEnquiry;
  open: boolean;
  onClose: () => void;
  onConverted?: (enquiry: MockEnquiry) => void;
}

export function ConvertEnquiryModal({
  enquiry,
  open,
  onClose,
  onConverted,
}: ConvertEnquiryModalProps) {
  const router = useRouter();
  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>([]);
  const [eventTypes, setEventTypes] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(enquiry.eventName);
  const [eventDate, setEventDate] = useState(enquiry.requestedDate);
  const [startTime, setStartTime] = useState(enquiry.preferredStartTime);
  const [endSelection, setEndSelection] = useState(() =>
    enquiry.preferredEndTime
      ? endSelectionKey(enquiry.preferredEndTime, Boolean(enquiry.preferredEndIsNextDay))
      : "",
  );
  const [spaceId, setSpaceId] = useState(enquiry.spacePreferenceId ?? "");
  const [eventTypeId, setEventTypeId] = useState(enquiry.eventTypeId ?? "");
  const [guestCount, setGuestCount] = useState(String(enquiry.guestCount || ""));
  const [notes, setNotes] = useState(enquiry.notes ?? "");
  const [status, setStatus] = useState<EventStatus>(
    enquiry.status === "confirmed" ? "confirmed" : "draft",
  );

  const endOptions = useMemo(() => {
    if (!startTime) {
      return { sameDay: [], nextDay: [] };
    }
    return getEndTimeOptionsForStart(startTime);
  }, [startTime]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(enquiry.eventName);
    setEventDate(enquiry.requestedDate);
    setStartTime(enquiry.preferredStartTime);
    setEndSelection(
      enquiry.preferredEndTime
        ? endSelectionKey(enquiry.preferredEndTime, Boolean(enquiry.preferredEndIsNextDay))
        : "",
    );
    setSpaceId(enquiry.spacePreferenceId ?? "");
    setEventTypeId(enquiry.eventTypeId ?? "");
    setGuestCount(String(enquiry.guestCount || ""));
    setNotes(enquiry.notes ?? "");
    setStatus(enquiry.status === "confirmed" ? "confirmed" : "draft");
    setError(null);
  }, [enquiry, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoadingOptions(true);
      const result = await loadEventFormOptionsAction();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error);
        setSpaces([]);
        setEventTypes([]);
      } else {
        setSpaces(result.spaces);
        setEventTypes(result.eventTypes);
      }

      setIsLoadingOptions(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open]);

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
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isSubmitting, onClose]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { time: endTime, nextDay: endIsNextDay } = parseEndSelectionKey(endSelection);
    const guestCountNumber = Number(guestCount.trim());

    const clientValidation = resolveEventTimestamps(eventDate, startTime, endTime, {
      endIsNextDay,
    });

    if ("error" in clientValidation) {
      setIsSubmitting(false);
      setError(clientValidation.error);
      return;
    }

    const result = await convertEnquiryToEventAction({
      enquiry_id: enquiry.id,
      title,
      client_name: enquiry.clientName,
      client_email: enquiry.clientEmail,
      client_phone: enquiry.clientPhone ?? undefined,
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      end_is_next_day: endIsNextDay,
      space_id: spaceId,
      event_type_id: eventTypeId,
      guest_count: guestCountNumber,
      notes: notes || undefined,
      status,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onConverted?.(result.enquiry);
    router.push(`/dashboard/events/${result.eventId}`);
  }

  const enquiryTimeRange =
    enquiry.preferredStartTime && enquiry.preferredEndTime
      ? formatEnquiryTimeRange(enquiry)
      : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 dark:bg-black/60"
        aria-label="Close conversion dialog"
        onClick={() => {
          if (!isSubmitting) {
            onClose();
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="convert-enquiry-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 id="convert-enquiry-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Convert enquiry to event
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review the mapped details, adjust anything needed, then create the operational event.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">From enquiry</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Event name</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">{enquiry.eventName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Client</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">
                      {enquiry.clientName}
                      <span className="block text-slate-500 dark:text-slate-400">{enquiry.clientEmail}</span>
                      {enquiry.clientPhone && (
                        <span className="block text-slate-500 dark:text-slate-400">{enquiry.clientPhone}</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Requested date</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">
                      {enquiry.requestedDate ? formatDate(enquiry.requestedDate) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Preferred time</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">{enquiryTimeRange}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Event type</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">{enquiry.eventType}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Space preference</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">{enquiry.spacePreference}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Guest count</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">{enquiry.guestCount || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Estimated value</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">
                      {formatEnquiryCurrency(enquiry.estimatedValue || enquiry.budgetEstimate)}
                    </dd>
                  </div>
                  {enquiry.notes && (
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Notes</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-slate-900 dark:text-slate-100">{enquiry.notes}</dd>
                    </div>
                  )}
                </dl>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Event to create</h3>

                {isLoadingOptions ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loading venue options…</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="convert-title">Event name</Label>
                      <Input
                        id="convert-title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="convert-event-date">Event date</Label>
                        <Input
                          id="convert-event-date"
                          type="date"
                          value={eventDate}
                          onChange={(event) => setEventDate(event.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="convert-guest-count">Guest count</Label>
                        <Input
                          id="convert-guest-count"
                          type="number"
                          min={1}
                          value={guestCount}
                          onChange={(event) => setGuestCount(event.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="convert-start-time">Start time</Label>
                        <Select
                          id="convert-start-time"
                          value={startTime}
                          onChange={(event) => setStartTime(event.target.value)}
                          required
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
                        <Label htmlFor="convert-end-time">End time</Label>
                        <Select
                          id="convert-end-time"
                          value={endSelection}
                          disabled={!startTime}
                          onChange={(event) => setEndSelection(event.target.value)}
                          required
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
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="convert-event-type">Event type</Label>
                        <Select
                          id="convert-event-type"
                          value={eventTypeId}
                          onChange={(event) => setEventTypeId(event.target.value)}
                          required
                        >
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
                        <Label htmlFor="convert-space">Space</Label>
                        <Select
                          id="convert-space"
                          value={spaceId}
                          onChange={(event) => setSpaceId(event.target.value)}
                          required
                        >
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="convert-status">Event status</Label>
                      <Select
                        id="convert-status"
                        value={status}
                        onChange={(event) => setStatus(event.target.value as EventStatus)}
                      >
                        <option value="draft">Draft</option>
                        <option value="confirmed">Confirmed</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="convert-notes">Notes</Label>
                      <Textarea
                        id="convert-notes"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={3}
                      />
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Client details ({enquiry.clientName}) will be copied to the new event.
                    </p>
                  </>
                )}
              </section>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end dark:border-slate-800">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingOptions ||
                !startTime ||
                !endSelection ||
                !spaceId ||
                !eventTypeId
              }
            >
              {isSubmitting ? "Creating event…" : "Create event from enquiry"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
