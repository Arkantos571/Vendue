"use client";

import Link from "next/link";
import { FileDown, Printer, Save, Users } from "lucide-react";
import {
  FunctionSheetSaveStatus,
  type FunctionSheetSaveStatus as SaveStatus,
} from "@/components/function-sheet/function-sheet-save-status";
import { Button } from "@/components/ui/button";

interface FunctionSheetActionsProps {
  eventId: string;
  hasRotaBuilder: boolean;
  saveStatus: SaveStatus;
  saveError?: string | null;
  isSaving: boolean;
  onSaveNow: () => void;
}

export function FunctionSheetActions({
  eventId,
  hasRotaBuilder,
  saveStatus,
  saveError,
  isSaving,
  onSaveNow,
}: FunctionSheetActionsProps) {
  return (
    <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
      <FunctionSheetSaveStatus status={saveStatus} error={saveError} />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isSaving || saveStatus === "saved"}
          onClick={onSaveNow}
        >
          <Save className="h-4 w-4" />
          Save now
        </Button>
        <Button type="button" variant="outline" size="sm" disabled className="gap-2">
          <FileDown className="h-4 w-4" />
          Export PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
        {hasRotaBuilder ? (
          <Link
            href={`/dashboard/rota/${eventId}`}
            className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 dark:text-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <Users className="h-4 w-4" />
            Build rota
          </Link>
        ) : (
          <Button type="button" variant="outline" size="sm" disabled className="gap-2">
            <Users className="h-4 w-4" />
            Build rota
          </Button>
        )}
      </div>
    </div>
  );
}
