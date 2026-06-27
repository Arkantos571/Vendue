"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  enquirySourceOptions,
  mockEventTypes,
  mockSpaces,
} from "@/lib/mock/enquiries";

export function NewEnquiryForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function saveEnquiry(redirectTo: "/dashboard/enquiries" | "/dashboard/events/new") {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    router.push(redirectTo);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveEnquiry("/dashboard/enquiries");
      }}
      className="space-y-8"
    >
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
              {mockEventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_time">Preferred start time</Label>
            <Input id="start_time" name="start_time" type="time" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">Preferred end time</Label>
            <Input id="end_time" name="end_time" type="time" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="space_preference">Space preference</Label>
            <Select id="space_preference" name="space_preference" defaultValue="">
              <option value="">No preference</option>
              {mockSpaces.map((space) => (
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
        <Button type="submit" variant="outline" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save enquiry"}
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={() => saveEnquiry("/dashboard/events/new")}
        >
          Save and create event
        </Button>
      </div>
    </form>
  );
}
