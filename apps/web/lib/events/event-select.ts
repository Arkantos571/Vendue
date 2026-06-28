import type { EventRowWithJoins } from "@/lib/events/mappers";
import { isRotaPublishSchemaMissing } from "@/lib/supabase/schema-errors";
import type { DbClient } from "@/lib/supabase/db";

const EVENT_JOINS = `
  space_id, event_type_id,
  spaces ( name ),
  event_types ( name )
`;

export const EVENT_SELECT_BASE = `
  id, title, status, starts_at, ends_at, guest_count,
  client_name, client_email, client_phone, notes,
  ${EVENT_JOINS}
`;

export const EVENT_SELECT_WITH_ROTA = `
  id, title, status, starts_at, ends_at, guest_count,
  client_name, client_email, client_phone, notes,
  rota_status, rota_published_at,
  ${EVENT_JOINS}
`;

export interface EventQueryResult {
  rows: EventRowWithJoins[];
  rotaPublishSchemaReady: boolean;
}

type EventsQueryResult = PromiseLike<{ data: unknown; error: { message: string } | null }>;

function normalizeEventRows(data: unknown): EventRowWithJoins[] {
  if (data === null) return [];
  if (Array.isArray(data)) return data as EventRowWithJoins[];
  return [data as EventRowWithJoins];
}

export async function queryVenueEvents(
  buildQuery: (select: string) => EventsQueryResult,
): Promise<EventQueryResult> {
  const withRota = await buildQuery(EVENT_SELECT_WITH_ROTA);

  if (!withRota.error) {
    return {
      rows: normalizeEventRows(withRota.data),
      rotaPublishSchemaReady: true,
    };
  }

  if (!isRotaPublishSchemaMissing(withRota.error)) {
    throw new Error(withRota.error.message);
  }

  const fallback = await buildQuery(EVENT_SELECT_BASE);

  if (fallback.error) {
    throw new Error(fallback.error.message);
  }

  return {
    rows: normalizeEventRows(fallback.data),
    rotaPublishSchemaReady: false,
  };
}

export async function queryVenueEventById(
  supabase: DbClient,
  venueId: string,
  eventId: string,
): Promise<{ row: EventRowWithJoins | null; rotaPublishSchemaReady: boolean }> {
  const result = await queryVenueEvents((select) =>
    supabase
      .from("events")
      .select(select)
      .eq("id", eventId)
      .eq("venue_id", venueId)
      .maybeSingle(),
  );

  return {
    row: result.rows[0] ?? null,
    rotaPublishSchemaReady: result.rotaPublishSchemaReady,
  };
}
