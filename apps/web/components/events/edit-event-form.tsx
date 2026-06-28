"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { loadEventFormOptionsAction, updateEventAction } from "@/lib/events/actions";
import {
  EVENT_START_TIME_OPTIONS,
  endSelectionKey,
  getEndTimeOptionsForStart,
  parseEndTimeSelection,
  resolveEventTimestamps,
} from "@/lib/events/event-time";
import type { MockEvent } from "@/lib/mock/events";
import type { EventStatus } from "@/types";

const eventStatusOptions: { value: EventStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function EditEventForm({ event }: { event: MockEvent }) {
  const router = useRouter();
  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>([]);
  const [eventTypes, setEventTypes] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(event.startTime);
  const [endSelection, setEndSelection] = useState(
    endSelectionKey(event.endTime, event.endsNextDay ?? false),
  );

  const endOptions = useMemo(() => {
    if (!startTime) return { sameDay: [], nextDay: [] };
    return getEndTimeOptionsForStart(startTime);
  }, [startTime]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const result = await loadEventFormOptionsAction();
      if (cancelled) return;
      if (result.success) {
        setSpaces(result.spaces);
        setEventTypes(result.eventTypes);
      } else setError(result.error);
      setIsLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(formEvent.currentTarget);
    const eventDate = String(formData.get("event_date") ?? "");
    const { time: endTime, nextDay: endIsNextDay } = parseEndTimeSelection(endSelection);
    const clientValidation = resolveEventTimestamps(eventDate, startTime, endTime, { endIsNextDay });
    if ("error" in clientValidation) {
      setIsSubmitting(false);
      setError(clientValidation.error);
      return;
    }
    const result = await updateEventAction({
      event_id: event.id,
      title: String(formData.get("title") ?? ""),
      client_name: String(formData.get("client_name") ?? ""),
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      end_is_next_day: endIsNextDay,
      space_id: String(formData.get("space") ?? ""),
      event_type_id: String(formData.get("event_type") ?? ""),
      guest_count: Number(formData.get("guest_count")),
      client_email: String(formData.get("client_email") ?? "") || undefined,
      client_phone: String(formData.get("client_phone") ?? "") || undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
      status: String(formData.get("status") ?? event.status) as EventStatus,
    });
    setIsSubmitting(false);
    if (!result.success) { setError(result.error); return; }
    router.push(`/dashboard/events/${event.id}`);
    router.refresh();
  }

  if (isLoading) return <div className="v-empty"><p className="text-sm text-muted-foreground">Loading form…</p></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</div> : null}
      <section className="v-panel">
        <h2 className="text-base font-semibold text-foreground">Event details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="title">Event name</Label><Input id="title" name="title" required defaultValue={event.title} /></div>
          <div className="space-y-2"><Label htmlFor="event_type">Event type</Label><Select id="event_type" name="event_type" required defaultValue={event.eventTypeId}>{eventTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></div>
          <div className="space-y-2"><Label htmlFor="guest_count">Guest count</Label><Input id="guest_count" name="guest_count" type="number" min={1} required defaultValue={event.guestCount} /></div>
          <div className="space-y-2"><Label htmlFor="status">Status</Label><Select id="status" name="status" defaultValue={event.status}>{eventStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></div>
        </div>
      </section>
      <section className="v-panel">
        <h2 className="text-base font-semibold text-foreground">Client details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="client_name">Client name</Label><Input id="client_name" name="client_name" required defaultValue={event.clientName} /></div>
          <div className="space-y-2"><Label htmlFor="client_email">Client email</Label><Input id="client_email" name="client_email" type="email" defaultValue={event.clientEmail} /></div>
          <div className="space-y-2"><Label htmlFor="client_phone">Client phone</Label><Input id="client_phone" name="client_phone" type="tel" defaultValue={event.clientPhone ?? ""} /></div>
        </div>
      </section>
      <section className="v-panel">
        <h2 className="text-base font-semibold text-foreground">Schedule & space</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="event_date">Event date</Label><Input id="event_date" name="event_date" type="date" required defaultValue={event.date} /></div>
          <div className="space-y-2"><Label htmlFor="space">Space</Label><Select id="space" name="space" required defaultValue={event.spaceId}>{spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></div>
          <div className="space-y-2"><Label htmlFor="start_time">Start time</Label><Select id="start_time" required value={startTime} onChange={(e) => setStartTime(e.target.value)}>{EVENT_START_TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></div>
          <div className="space-y-2"><Label htmlFor="end_time">End time</Label><Select id="end_time" required value={endSelection} disabled={!startTime} onChange={(e) => setEndSelection(e.target.value)}><option value="" disabled>Select end time</option>{endOptions.sameDay.length > 0 && <optgroup label="Same day">{endOptions.sameDay.map((o) => <option key={endSelectionKey(o.value, false)} value={endSelectionKey(o.value, false)}>{o.label}</option>)}</optgroup>}{endOptions.nextDay.length > 0 && <optgroup label="Next day">{endOptions.nextDay.map((o) => <option key={endSelectionKey(o.value, true)} value={endSelectionKey(o.value, true)}>{o.label}</option>)}</optgroup>}</Select></div>
        </div>
      </section>
      <section className="v-panel"><h2 className="text-base font-semibold text-foreground">Notes</h2><div className="mt-5"><Textarea id="notes" name="notes" rows={4} defaultValue={event.notes ?? ""} /></div></section>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={`/dashboard/events/${event.id}`} className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-foreground hover:bg-slate-50">Cancel</Link>
        <Button type="submit" disabled={isSubmitting || !startTime || !endSelection}>{isSubmitting ? "Saving…" : "Save changes"}</Button>
      </div>
    </form>
  );
}
