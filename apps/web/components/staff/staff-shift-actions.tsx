"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { confirmStaffShiftAction, declineStaffShiftAction } from "@/lib/staff/actions";
import type { StaffShift } from "@/lib/staff/types";

export function StaffShiftActions({ shift }: { shift: StaffShift }) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canRespond = shift.status === "scheduled";
  const isBusy = isConfirming || isDeclining;

  async function handleConfirm() {
    setIsConfirming(true);
    setError(null);
    setMessage(null);

    const result = await confirmStaffShiftAction(shift.id);
    setIsConfirming(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setMessage("Shift confirmed. See you there.");
    router.refresh();
  }

  async function handleDecline() {
    if (!window.confirm("Decline this shift? Your manager will be notified in a future update.")) {
      return;
    }

    setIsDeclining(true);
    setError(null);
    setMessage(null);

    const result = await declineStaffShiftAction(shift.id);
    setIsDeclining(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setMessage("Shift declined. Your manager has been updated.");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          {message}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="button" disabled={isBusy || !canRespond} onClick={handleConfirm}>
          {shift.status === "confirmed"
            ? "Shift confirmed"
            : isConfirming
              ? "Confirming…"
              : "Confirm shift"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isBusy || !canRespond}
          onClick={handleDecline}
          className="text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        >
          {shift.status === "declined"
            ? "Shift declined"
            : isDeclining
              ? "Declining…"
              : "Decline shift"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled
          className="sm:col-span-2"
          title="Messaging is coming in a later phase"
        >
          I have a question
        </Button>
      </div>
    </div>
  );
}
