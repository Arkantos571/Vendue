"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { loadEnquiryFormOptionsAction, updateEnquiryAction } from "@/lib/enquiries/actions";
import {
  EVENT_START_TIME_OPTIONS,
  endSelectionKey,
  getEndTimeOptionsForStart,
  parseEndTimeSelection,
} from "@/lib/events/event-time";
import { enquirySourceOptions, type MockEnquiry } from "@/lib/mock/enquiries";
import type { EnquiryPriority, EnquiryStatus } from "@/types";

const enquiryStatusOptions: { value: EnquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "proposal_sent", label: "Proposal sent" },
  { value: "confirmed", label: "Confirmed" },
  { value: "lost", label: "Lost" },
];

export function EditEnquiryForm({ enquiry }: { enquiry: MockEnquiry }) {
  const router = useRouter();
  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>([]);
  const [eventTypes, setEventTypes] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(enquiry.preferredStartTime);
  const [endSelection, setEndSelection] = useState(
    enquiry.preferredEndTime
      ? endSelectionKey(enquiry.preferredEndTime, enquiry.preferredEndIsNextDay ?? false)
      : "",
  );

  const endOptions = useMemo(() => {
    if (!startTime) return { sameDay: [], nextDay: [] };
    return getEndTimeOptionsForStart(startTime);
  }, [startTime]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const result = await loadEnquiryFormOptionsAction();
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
    const { time: endTime, nextDay: endIsNextDay } = endSelection
      ? parseEndTimeSelection(endSelection)
      : { time: "", nextDay: false };
    const budgetRaw = String(formData.get("budget_estimate") ?? "");
    const result = await updateEnquiryAction({
      enquiry_id: enquiry.id,
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
      guest_count: Number(formData.get("guest_count")) || undefined,
      budget_estimate: budgetRaw ? Number(budgetRaw) : undefined,
      source: String(formData.get("enquiry_source") ?? "website") as MockEnquiry["source"],
      priority: String(formData.get("priority") ?? "medium") as EnquiryPriority,
      status: String(formData.get("status") ?? enquiry.status) as EnquiryStatus,
      notes: String(formData.get("notes") ?? "") || undefined,
    });
    setIsSubmitting(false);
    if (!result.success) { setError(result.error); return; }
    router.push(`/dashboard/enquiries/${enquiry.id}`);
    router.refresh();
  }

  if (isLoading) return <div className="v-empty"><p className="text-sm text-slate-500 dark:text-slate-400">Loading form…</p></div>;

  const budgetDefault = enquiry.budgetEstimate || enquiry.estimatedValue || "";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</div> : null}
      {enquiry.convertedEventId ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          This enquiry is linked to an event. Editing details here will not change the linked event.
        </div>
      ) : null}
      <section className="v-panel dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Enquiry details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="event_name">Event name</Label><Input id="event_name" name="event_name" required defaultValue={enquiry.eventName} /></div>
          <div className="space-y-2"><Label htmlFor="client_name">Client name</Label><Input id="client_name" name="client_name" required defaultValue={enquiry.clientName} /></div>
          <div className="space-y-2"><Label htmlFor="client_email">Client email</Label><Input id="client_email" name="client_email" type="email" required defaultValue={enquiry.clientEmail} /></div>
          <div className="space-y-2"><Label htmlFor="client_phone">Client phone</Label><Input id="client_phone" name="client_phone" type="tel" defaultValue={enquiry.clientPhone ?? ""} /></div>
          <div className="space-y-2"><Label htmlFor="enquiry_source">Source</Label><Select id="enquiry_source" name="enquiry_source" defaultValue={enquiry.source}>{enquirySourceOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</Select></div>
          <div className="space-y-2"><Label htmlFor="priority">Priority</Label><Select id="priority" name="priority" defaultValue={enquiry.priority}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></Select></div>
          <div className="space-y-2"><Label htmlFor="status">Status</Label><Select id="status" name="status" defaultValue={enquiry.status}>{enquiryStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></div>
        </div>
      </section>
      <section className="v-panel dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Event request</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="requested_date">Requested date</Label><Input id="requested_date" name="requested_date" type="date" required defaultValue={enquiry.requestedDate} /></div>
          <div className="space-y-2"><Label htmlFor="event_type">Event type</Label><Select id="event_type" name="event_type" required defaultValue={enquiry.eventTypeId}>{eventTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></div>
          <div className="space-y-2"><Label htmlFor="space_preference">Space preference</Label><Select id="space_preference" name="space_preference" defaultValue={enquiry.spacePreferenceId ?? ""}><option value="">No preference</option>{spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></div>
          <div className="space-y-2"><Label htmlFor="guest_count">Guest count</Label><Input id="guest_count" name="guest_count" type="number" min={1} defaultValue={enquiry.guestCount || ""} /></div>
          <div className="space-y-2"><Label htmlFor="budget_estimate">Estimated value / budget (£)</Label><Input id="budget_estimate" name="budget_estimate" type="number" min={0} step={100} defaultValue={budgetDefault} /></div>
          <div className="space-y-2"><Label htmlFor="preferred_start">Preferred start</Label><Select id="preferred_start" value={startTime} onChange={(e) => setStartTime(e.target.value)}><option value="">Not specified</option>{EVENT_START_TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></div>
          <div className="space-y-2"><Label htmlFor="preferred_end">Preferred end</Label><Select id="preferred_end" value={endSelection} disabled={!startTime} onChange={(e) => setEndSelection(e.target.value)}><option value="">Not specified</option>{endOptions.sameDay.map((o) => <option key={endSelectionKey(o.value, false)} value={endSelectionKey(o.value, false)}>{o.label}</option>)}{endOptions.nextDay.map((o) => <option key={endSelectionKey(o.value, true)} value={endSelectionKey(o.value, true)}>{o.label} next day</option>)}</Select></div>
        </div>
      </section>
      <section className="v-panel dark:bg-slate-900"><h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Notes</h2><div className="mt-5"><Textarea id="notes" name="notes" rows={4} defaultValue={enquiry.notes ?? ""} /></div></section>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={`/dashboard/enquiries/${enquiry.id}`} className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">Cancel</Link>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save changes"}</Button>
      </div>
    </form>
  );
}
