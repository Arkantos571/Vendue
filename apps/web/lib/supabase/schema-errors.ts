export const ROTA_PUBLISH_SCHEMA_HINT =
  "Database update required: open Supabase → SQL Editor, run supabase/migrations/007_rota_publish.sql, then reload this page.";

export function isMissingColumnError(
  error: { message?: string } | null,
  column: string,
): boolean {
  const message = (error?.message ?? "").toLowerCase();
  return message.includes("does not exist") && message.includes(column.toLowerCase());
}

export function isRotaPublishSchemaMissing(error: { message?: string } | null): boolean {
  return isMissingColumnError(error, "rota_status");
}

export function rotaPublishSchemaError(
  error: { message?: string } | null,
): { success: false; error: string } | null {
  if (isRotaPublishSchemaMissing(error)) {
    return { success: false, error: ROTA_PUBLISH_SCHEMA_HINT };
  }
  return null;
}
