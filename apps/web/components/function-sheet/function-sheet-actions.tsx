"use client";

import Link from "next/link";
import { FileDown, Pencil, Printer, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FunctionSheetActionsProps {
  eventId: string;
  hasRotaBuilder: boolean;
}

export function FunctionSheetActions({ eventId, hasRotaBuilder }: FunctionSheetActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button type="button" variant="outline" disabled className="gap-2">
        <Pencil className="h-4 w-4" />
        Edit function sheet
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
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800"
        >
          <Users className="h-4 w-4" />
          Build rota
        </Link>
      ) : (
        <Button type="button" disabled className="gap-2">
          <Users className="h-4 w-4" />
          Build rota
        </Button>
      )}
    </div>
  );
}
