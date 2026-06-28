"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { confirmStaffShiftAction } from "@/lib/staff/actions";
import type { StaffShift } from "@/lib/staff/types";

export function StaffShiftActions({ shift }: { shift: StaffShift }) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
        <Button
          type="button"
          disabled={isConfirming || shift.status !== "scheduled"}
          onClick={handleConfirm}
        >
          {shift.status === "confirmed" ? "Shift confirmed" : isConfirming ? "Confirming…" : "Confirm shift"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled
          title="Messaging is coming in a later phase"
        >
          I have a question
        </Button>
      </div>
    </div>
  );
}
