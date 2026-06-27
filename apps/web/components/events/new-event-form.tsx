"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockEventTypes, mockSpaces } from "@/lib/mock/events";

export function NewEventForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    router.push("/dashboard/events");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
              {mockEventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest_count">Guest count</Label>
            <Input id="guest_count" name="guest_count" type="number" min={1} placeholder="120" />
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
              {mockSpaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_time">Start time</Label>
            <Input id="start_time" name="start_time" type="time" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End time</Label>
            <Input id="end_time" name="end_time" type="time" required />
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create event"}
        </Button>
      </div>
    </form>
  );
}
