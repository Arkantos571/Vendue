-- Notifications MVP: team-member targeting, related entities, and expanded RPC helpers.

ALTER TABLE public.notifications
  ALTER COLUMN profile_id DROP NOT NULL;

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS recipient_team_member_id uuid REFERENCES public.team_members (id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS related_event_id uuid REFERENCES public.events (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS related_shift_id uuid REFERENCES public.rota_shifts (id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_recipient_check'
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_recipient_check
      CHECK (profile_id IS NOT NULL OR recipient_team_member_id IS NOT NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS notifications_team_member_id_idx
  ON public.notifications (recipient_team_member_id);
CREATE INDEX IF NOT EXISTS notifications_related_event_id_idx
  ON public.notifications (related_event_id);
CREATE INDEX IF NOT EXISTS notifications_related_shift_id_idx
  ON public.notifications (related_shift_id);

UPDATE public.notifications
SET
  related_event_id = COALESCE(
    related_event_id,
    NULLIF(metadata ->> 'event_id', '')::uuid
  ),
  related_shift_id = COALESCE(
    related_shift_id,
    NULLIF(metadata ->> 'shift_id', '')::uuid
  )
WHERE metadata IS NOT NULL;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;

CREATE POLICY "notifications_select_recipient" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR recipient_team_member_id IN (SELECT public.user_team_member_ids())
  );

CREATE POLICY "notifications_update_recipient" ON public.notifications
  FOR UPDATE TO authenticated
  USING (
    profile_id = auth.uid()
    OR recipient_team_member_id IN (SELECT public.user_team_member_ids())
  )
  WITH CHECK (
    profile_id = auth.uid()
    OR recipient_team_member_id IN (SELECT public.user_team_member_ids())
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
  SELECT e.id, e.venue_id, e.title, e.starts_at, e.rota_status
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

  INSERT INTO public.notifications (
    venue_id, profile_id, recipient_team_member_id, type, title, body,
    related_event_id, related_shift_id, metadata
  )
  SELECT
    v_event.venue_id,
    tm.profile_id,
    tm.id,
    'rota_published',
    'New rota published',
    'You have been assigned to ' || v_event.title || ' on '
      || to_char(v_event.starts_at AT TIME ZONE 'UTC', 'DD Mon YYYY'),
    p_event_id,
    rs.id,
    jsonb_build_object(
      'event_id', p_event_id,
      'shift_id', rs.id,
      'team_member_id', tm.id
    )
  FROM public.rota_shifts rs
  JOIN public.team_members tm ON tm.id = rs.team_member_id
  WHERE rs.event_id = p_event_id
    AND rs.status <> 'cancelled';

  INSERT INTO public.notifications (
    venue_id, profile_id, type, title, body, related_event_id, metadata
  )
  SELECT
    v_event.venue_id,
    vm.profile_id,
    'rota_published',
    'Rota published',
    'Rota for ' || v_event.title || ' has been published',
    p_event_id,
    jsonb_build_object('event_id', p_event_id)
  FROM public.venue_members vm
  WHERE vm.venue_id = v_event.venue_id
    AND vm.role IN ('owner', 'admin', 'manager')
    AND vm.profile_id IS NOT NULL
    AND vm.joined_at IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_managers_shift_confirmed(p_shift_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shift record;
BEGIN
  SELECT
    rs.id,
    rs.venue_id,
    rs.event_id,
    rs.team_member_id,
    tm.full_name AS staff_name,
    e.title AS event_title
  INTO v_shift
  FROM public.rota_shifts rs
  JOIN public.team_members tm ON tm.id = rs.team_member_id
  LEFT JOIN public.events e ON e.id = rs.event_id
  WHERE rs.id = p_shift_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF NOT (v_shift.team_member_id IN (SELECT public.user_team_member_ids())) THEN
    RAISE EXCEPTION 'Not authorized to notify for this shift';
  END IF;

  INSERT INTO public.notifications (
    venue_id, profile_id, type, title, body,
    related_event_id, related_shift_id, metadata
  )
  SELECT
    v_shift.venue_id,
    vm.profile_id,
    'shift_confirmed',
    'Shift confirmed',
    v_shift.staff_name || ' confirmed their shift for '
      || coalesce(v_shift.event_title, 'an event'),
    v_shift.event_id,
    p_shift_id,
    jsonb_build_object(
      'shift_id', p_shift_id,
      'event_id', v_shift.event_id,
      'team_member_id', v_shift.team_member_id
    )
  FROM public.venue_members vm
  WHERE vm.venue_id = v_shift.venue_id
    AND vm.role IN ('owner', 'admin', 'manager')
    AND vm.profile_id IS NOT NULL
    AND vm.joined_at IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_managers_shift_declined(p_shift_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shift record;
BEGIN
  SELECT
    rs.id,
    rs.venue_id,
    rs.event_id,
    rs.team_member_id,
    tm.full_name AS staff_name,
    e.title AS event_title
  INTO v_shift
  FROM public.rota_shifts rs
  JOIN public.team_members tm ON tm.id = rs.team_member_id
  LEFT JOIN public.events e ON e.id = rs.event_id
  WHERE rs.id = p_shift_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF NOT (v_shift.team_member_id IN (SELECT public.user_team_member_ids())) THEN
    RAISE EXCEPTION 'Not authorized to notify for this shift';
  END IF;

  INSERT INTO public.notifications (
    venue_id, profile_id, type, title, body,
    related_event_id, related_shift_id, metadata
  )
  SELECT
    v_shift.venue_id,
    vm.profile_id,
    'shift_declined',
    'Shift declined',
    v_shift.staff_name || ' declined their shift for '
      || coalesce(v_shift.event_title, 'an event'),
    v_shift.event_id,
    p_shift_id,
    jsonb_build_object(
      'shift_id', p_shift_id,
      'event_id', v_shift.event_id,
      'team_member_id', v_shift.team_member_id
    )
  FROM public.venue_members vm
  WHERE vm.venue_id = v_shift.venue_id
    AND vm.role IN ('owner', 'admin', 'manager')
    AND vm.profile_id IS NOT NULL
    AND vm.joined_at IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_staff_shift_added(p_shift_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shift record;
BEGIN
  SELECT
    rs.id,
    rs.venue_id,
    rs.event_id,
    rs.team_member_id,
    tm.profile_id,
    e.title AS event_title,
    e.rota_status
  INTO v_shift
  FROM public.rota_shifts rs
  JOIN public.team_members tm ON tm.id = rs.team_member_id
  JOIN public.events e ON e.id = rs.event_id
  WHERE rs.id = p_shift_id;

  IF NOT FOUND OR v_shift.rota_status <> 'published' THEN
    RETURN;
  END IF;

  IF NOT public.can_manage_venue(v_shift.venue_id) THEN
    RAISE EXCEPTION 'Not authorized to notify for this shift';
  END IF;

  INSERT INTO public.notifications (
    venue_id, profile_id, recipient_team_member_id, type, title, body,
    related_event_id, related_shift_id, metadata
  )
  VALUES (
    v_shift.venue_id,
    v_shift.profile_id,
    v_shift.team_member_id,
    'shift_added',
    'Shift added',
    'You have been added to ' || coalesce(v_shift.event_title, 'an event'),
    v_shift.event_id,
    p_shift_id,
    jsonb_build_object(
      'shift_id', p_shift_id,
      'event_id', v_shift.event_id,
      'team_member_id', v_shift.team_member_id
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_staff_shift_updated(
  p_shift_id uuid,
  p_team_member_id uuid,
  p_event_id uuid,
  p_venue_id uuid,
  p_event_title text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  IF NOT public.can_manage_venue(p_venue_id) THEN
    RAISE EXCEPTION 'Not authorized to notify for this shift';
  END IF;

  SELECT tm.profile_id INTO v_profile_id
  FROM public.team_members tm
  WHERE tm.id = p_team_member_id;

  INSERT INTO public.notifications (
    venue_id, profile_id, recipient_team_member_id, type, title, body,
    related_event_id, related_shift_id, metadata
  )
  VALUES (
    p_venue_id,
    v_profile_id,
    p_team_member_id,
    'shift_updated',
    'Shift updated',
    'Your shift for ' || coalesce(p_event_title, 'an event') || ' has been updated',
    p_event_id,
    p_shift_id,
    jsonb_build_object(
      'shift_id', p_shift_id,
      'event_id', p_event_id,
      'team_member_id', p_team_member_id
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_staff_rota_published(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_managers_shift_confirmed(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_managers_shift_declined(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_staff_shift_added(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_staff_shift_updated(uuid, uuid, uuid, uuid, text) TO authenticated;
