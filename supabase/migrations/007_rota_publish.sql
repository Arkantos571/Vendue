-- Event-level rota publish state and staff visibility for published rotas only.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS rota_status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS rota_published_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_rota_status_check'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_rota_status_check
      CHECK (rota_status IN ('draft', 'ready_to_publish', 'published'));
  END IF;
END $$;

COMMENT ON COLUMN public.events.rota_status IS 'Rota workflow state: draft, ready_to_publish, or published.';
COMMENT ON COLUMN public.events.rota_published_at IS 'When the event rota was last published to staff.';

CREATE INDEX IF NOT EXISTS events_venue_rota_status_idx ON public.events (venue_id, rota_status);

DROP POLICY IF EXISTS "rota_shifts_select_self" ON public.rota_shifts;

CREATE OR REPLACE FUNCTION public.event_rota_is_published(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = p_event_id
      AND e.rota_status = 'published'
  );
$$;

CREATE OR REPLACE FUNCTION public.user_staff_published_event_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT rs.event_id
  FROM public.rota_shifts rs
  INNER JOIN public.events e ON e.id = rs.event_id
  WHERE rs.team_member_id IN (SELECT public.user_team_member_ids())
    AND rs.event_id IS NOT NULL
    AND e.rota_status = 'published';
$$;

GRANT EXECUTE ON FUNCTION public.event_rota_is_published(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_staff_published_event_ids() TO authenticated;

CREATE POLICY "rota_shifts_select_self" ON public.rota_shifts
  FOR SELECT TO authenticated
  USING (
    team_member_id IN (SELECT public.user_team_member_ids())
    AND (
      public.can_manage_venue(venue_id)
      OR (
        event_id IS NOT NULL
        AND public.event_rota_is_published(event_id)
      )
    )
  );

DROP POLICY IF EXISTS "events_select_staff_shift" ON public.events;

CREATE POLICY "events_select_staff_shift" ON public.events
  FOR SELECT TO authenticated
  USING (
    public.can_manage_venue(venue_id)
    OR id IN (SELECT public.user_staff_published_event_ids())
  );

CREATE OR REPLACE FUNCTION public.notify_staff_rota_published(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event record;
BEGIN
  SELECT e.id, e.venue_id, e.title, e.rota_status
  INTO v_event
  FROM public.events e
  WHERE e.id = p_event_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF NOT public.can_manage_venue(v_event.venue_id) THEN
    RAISE EXCEPTION 'Not authorized to notify staff for this event';
  END IF;

  IF v_event.rota_status <> 'published' THEN
    RETURN;
  END IF;

  INSERT INTO public.notifications (venue_id, profile_id, type, title, body, metadata)
  SELECT DISTINCT
    v_event.venue_id,
    tm.profile_id,
    'rota_published',
    'Rota published',
    'Your shift roster for ' || v_event.title || ' is now available.',
    jsonb_build_object('event_id', p_event_id)
  FROM public.rota_shifts rs
  JOIN public.team_members tm ON tm.id = rs.team_member_id
  WHERE rs.event_id = p_event_id
    AND rs.status <> 'cancelled'
    AND tm.profile_id IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_staff_rota_published(uuid) TO authenticated;
