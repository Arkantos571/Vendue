"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UnavailabilityInput } from "@/lib/availability/types";

interface AddUnavailabilityFormProps {
  isSubmitting?: boolean;
  defaultStatusLabel?: string;
  onSubmit: (input: UnavailabilityInput) => Promise<void>;
  onCancel?: () => void;
}

export function AddUnavailabilityForm({
  isSubmitting = false,
  defaultStatusLabel,
  onSubmit,
  onCancel,
}: AddUnavailabilityFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await onSubmit({
        start_date: startDate,
        end_date: endDate,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        reason: reason || undefined,
      });
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setReason("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/60 p-4 dark:border-stone-700 dark:bg-stone-900/40">
      {defaultStatusLabel ? (
        <p className="text-xs text-stone-500 dark:text-stone-400">
          New entries will be saved as {defaultStatusLabel.toLowerCase()}.
        </p>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="unavail-start-date">Start date</Label>
          <Input
            id="unavail-start-date"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unavail-end-date">End date</Label>
          <Input
            id="unavail-end-date"
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unavail-start-time">Start time (optional)</Label>
          <Input
            id="unavail-start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unavail-end-time">End time (optional)</Label>
          <Input
            id="unavail-end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="unavail-reason">Reason (optional)</Label>
        <Textarea
          id="unavail-reason"
          rows={3}
          placeholder="Holiday, medical appointment, other commitment…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <p className="text-xs text-stone-500 dark:text-stone-400">
        Leave times empty to block full days. Overnight times are supported (e.g. 22:00 – 01:00).
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save unavailability"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
