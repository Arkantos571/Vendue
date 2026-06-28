"use client";

import Link from "next/link";
import { FileDown, Printer, Save, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FunctionSheetActionsProps {
  eventId: string;
  hasRotaBuilder: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export function FunctionSheetActions({
  eventId,
  hasRotaBuilder,
  isSaving,
  onSave,
}: FunctionSheetActionsProps) {
  return (
    <div className="space-y-3 print:hidden">
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="gap-2" disabled={isSaving} onClick={onSave}>
          <Save className="h-4 w-4" />
          {isSaving ? "Saving…" : "Save function sheet"}
        </Button>
        <Button type="button" variant="outline" disabled className="gap-2">
          <FileDown className="h-4 w-4" />
          Export PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
        {hasRotaBuilder ? (
          <Link
            href={`/dashboard/rota/${eventId}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
          >
            <Users className="h-4 w-4" />
            Build rota
          </Link>
        ) : (
          <Button type="button" variant="outline" disabled className="gap-2">
            <Users className="h-4 w-4" />
            Build rota
          </Button>
        )}
      </div>
    </div>
  );
}
