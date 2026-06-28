"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AddUnavailabilityForm } from "@/components/availability/add-unavailability-form";
import { UnavailabilityList } from "@/components/availability/unavailability-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UNAVAILABILITY_SCHEMA_HINT } from "@/lib/availability/constants";
import {
  createManagerUnavailabilityAction,
  deleteManagerUnavailabilityAction,
  loadTeamMemberUnavailabilityAction,
} from "@/lib/availability/actions";
import type { UnavailabilityPeriod } from "@/lib/availability/types";

interface TeamMemberUnavailabilitySectionProps {
  teamMemberId: string;
}

export function TeamMemberUnavailabilitySection({
  teamMemberId,
}: TeamMemberUnavailabilitySectionProps) {
  const [periods, setPeriods] = useState<UnavailabilityPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    const result = await loadTeamMemberUnavailabilityAction(teamMemberId);

    if (!result.success) {
      setError(result.error);
      setPeriods([]);
      return;
    }

    setPeriods(result.periods);
    setMigrationRequired(Boolean(result.migrationRequired));
  }, [teamMemberId]);

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

  async function handleCreate(input: Parameters<typeof createManagerUnavailabilityAction>[1]) {
    setIsSubmitting(true);
    setError(null);

    const result = await createManagerUnavailabilityAction(teamMemberId, input);
    setIsSubmitting(false);

    if (!result.success) {
      throw new Error(result.error);
    }

    setShowForm(false);
    await reload();
  }

  async function handleDelete(periodId: string) {
    setDeletingId(periodId);
    setError(null);

    const result = await deleteManagerUnavailabilityAction(periodId, teamMemberId);
    setDeletingId(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    await reload();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Availability / Unavailability</CardTitle>
            <CardDescription>Upcoming dates and times this team member cannot work.</CardDescription>
          </div>
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 text-sm font-medium text-white hover:bg-brand-800"
            >
              <Plus className="h-4 w-4" />
              Add unavailability
            </button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
        {showForm ? (
          <AddUnavailabilityForm
            isSubmitting={isSubmitting}
            defaultStatusLabel="Approved"
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        ) : null}
        {isLoading ? (
          <p className="text-sm text-stone-500">Loading unavailability…</p>
        ) : (
          <UnavailabilityList periods={periods} deletingId={deletingId} onDelete={handleDelete} />
        )}
      </CardContent>
    </Card>
  );
}
