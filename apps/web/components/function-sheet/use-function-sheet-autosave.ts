"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FunctionSheetSaveStatus } from "@/components/function-sheet/function-sheet-save-status";
import { saveFunctionSheetAction } from "@/lib/function-sheets/actions";
import type { FunctionSheet } from "@/lib/mock/function-sheet";

const AUTOSAVE_DEBOUNCE_MS = 800;

interface UseFunctionSheetAutosaveOptions {
  eventId: string;
  initialFunctionSheet: FunctionSheet;
}

export function useFunctionSheetAutosave({
  eventId,
  initialFunctionSheet,
}: UseFunctionSheetAutosaveOptions) {
  const router = useRouter();
  const [functionSheet, setFunctionSheet] = useState(initialFunctionSheet);
  const [saveStatus, setSaveStatus] = useState<FunctionSheetSaveStatus>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);

  const latestSheetRef = useRef(functionSheet);
  const editVersionRef = useRef(0);
  const savedVersionRef = useRef(0);
  const hasUserEditedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);
  const pendingAfterFlightRef = useRef(false);

  useEffect(() => {
    if (hasUserEditedRef.current && editVersionRef.current !== savedVersionRef.current) {
      return;
    }

    setFunctionSheet(initialFunctionSheet);
    latestSheetRef.current = initialFunctionSheet;
    editVersionRef.current = 0;
    savedVersionRef.current = 0;
    hasUserEditedRef.current = false;
    setSaveStatus("saved");
    setSaveError(null);
  }, [initialFunctionSheet]);

  useEffect(() => {
    latestSheetRef.current = functionSheet;
  }, [functionSheet]);

  const flushSave = useCallback(async () => {
    if (!hasUserEditedRef.current) {
      return;
    }

    if (editVersionRef.current === savedVersionRef.current) {
      setSaveStatus("saved");
      return;
    }

    if (saveInFlightRef.current) {
      pendingAfterFlightRef.current = true;
      return;
    }

    saveInFlightRef.current = true;
    pendingAfterFlightRef.current = false;
    const versionAtSaveStart = editVersionRef.current;
    const sheetToSave = latestSheetRef.current;

    setSaveStatus("saving");
    setSaveError(null);

    const result = await saveFunctionSheetAction({
      event_id: eventId,
      function_sheet_id: sheetToSave.id,
      running_order: sheetToSave.runningOrder,
      setup: sheetToSave.setup,
      food_and_beverage: sheetToSave.foodAndBeverage,
      checklist: sheetToSave.checklist,
      internal_notes: sheetToSave.internalNotes,
    });

    saveInFlightRef.current = false;

    if (!result.success) {
      setSaveStatus("error");
      setSaveError(result.error);
      if (pendingAfterFlightRef.current) {
        pendingAfterFlightRef.current = false;
        void flushSave();
      }
      return;
    }

    setFunctionSheet((current) => {
      const next = {
        ...current,
        id: result.functionSheet.id ?? current.id,
        status: result.functionSheet.status ?? current.status,
      };
      latestSheetRef.current = next;
      return next;
    });

    if (editVersionRef.current === versionAtSaveStart) {
      savedVersionRef.current = versionAtSaveStart;
      setSaveStatus("saved");
      router.refresh();
    } else {
      setSaveStatus("unsaved");
    }

    if (pendingAfterFlightRef.current || editVersionRef.current > versionAtSaveStart) {
      pendingAfterFlightRef.current = false;
      void flushSave();
    }
  }, [eventId, router]);

  const scheduleSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      void flushSave();
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [flushSave]);

  const updateFunctionSheet = useCallback(
    (updater: (current: FunctionSheet) => FunctionSheet) => {
      hasUserEditedRef.current = true;
      editVersionRef.current += 1;
      setSaveStatus("unsaved");
      setSaveError(null);

      setFunctionSheet((current) => {
        const next = updater(current);
        latestSheetRef.current = next;
        return next;
      });

      scheduleSave();
    },
    [scheduleSave],
  );

  const saveNow = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    void flushSave();
  }, [flushSave]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (saveStatus === "unsaved" || saveStatus === "saving") {
        event.preventDefault();
        event.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    functionSheet,
    saveStatus,
    saveError,
    updateFunctionSheet,
    saveNow,
    isSaving: saveStatus === "saving",
  };
}
