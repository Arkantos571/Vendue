"use client";

import { useCallback, useEffect, useState } from "react";
import { AddUnavailabilityForm } from "@/components/availability/add-unavailability-form";
import { UnavailabilityList } from "@/components/availability/unavailability-list";
import { UNAVAILABILITY_SCHEMA_HINT } from "@/lib/availability/constants";
import {
  createStaffUnavailabilityAction,
  deleteStaffUnavailabilityAction,
  loadStaffUnavailabilityAction,
} from "@/lib/availability/actions";
import type { UnavailabilityPeriod } from "@/lib/availability/types";

export function StaffAvailabilityView() {
  const [periods, setPeriods] = useState<UnavailabilityPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    const result = await loadStaffUnavailabilityAction();

    if (!result.success) {
      setError(result.error);
      setPeriods([]);
      return;
    }

    setPeriods(result.periods);
    setMigrationRequired(Boolean(result.migrationRequired));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      await reload();
      if (!cancelled) {
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reload]);

  async function handleCreate(input: Parameters<typeof createStaffUnavailabilityAction>[0]) {
    setIsSubmitting(true);
    setError(null);

    const result = await createStaffUnavailabilityAction(input);
    setIsSubmitting(false);

    if (!result.success) {
      throw new Error(result.error);
    }

    await reload();
  }

  async function handleDelete(periodId: string) {
    setDeletingId(periodId);
    setError(null);

    const result = await deleteStaffUnavailabilityAction(periodId);
    setDeletingId(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    await reload();
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Your availability</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Tell your manager when you cannot work. Entries are saved as pending until reviewed.
        </p>
      </section>

      {migrationRequired ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {UNAVAILABILITY_SCHEMA_HINT}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <AddUnavailabilityForm
        isSubmitting={isSubmitting}
        defaultStatusLabel="Pending"
        onSubmit={handleCreate}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Upcoming unavailability
        </h2>
        {isLoading ? (
          <p className="text-sm text-stone-500">Loading…</p>
        ) : (
          <UnavailabilityList
            periods={periods}
            deletingId={deletingId}
            canDelete={(period) => period.status === "pending" || period.status === "approved"}
            onDelete={handleDelete}
          />
        )}
      </section>
    </div>
  );
}
