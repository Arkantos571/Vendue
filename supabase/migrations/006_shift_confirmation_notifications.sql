-- Shift confirmation timestamps and staff decline support.
-- Prerequisite: run 006a_rota_shift_status_declined.sql first (enum must commit separately).

ALTER TABLE public.rota_shifts
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS declined_at timestamptz,
  ADD COLUMN IF NOT EXISTS response_note text;

COMMENT ON COLUMN public.rota_shifts.confirmed_at IS 'When the assigned staff member confirmed this shift.';
COMMENT ON COLUMN public.rota_shifts.declined_at IS 'When the assigned staff member declined this shift.';
COMMENT ON COLUMN public.rota_shifts.response_note IS 'Optional staff response note when confirming or declining.';

-- Allow staff to confirm or decline their own shifts.
DROP POLICY IF EXISTS "rota_shifts_update_self_confirm" ON public.rota_shifts;

CREATE POLICY "rota_shifts_update_self_response" ON public.rota_shifts
  FOR UPDATE TO authenticated
  USING (team_member_id IN (SELECT public.user_team_member_ids()))
  WITH CHECK (
    team_member_id IN (SELECT public.user_team_member_ids())
    AND status IN ('scheduled', 'confirmed', 'declined')
  );

-- Notify venue managers when staff confirms a shift.
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

  INSERT INTO public.notifications (venue_id, profile_id, type, title, body, metadata)
  SELECT
    v_shift.venue_id,
    vm.profile_id,
    'shift_confirmed',
    'Shift confirmed',
    v_shift.staff_name || ' confirmed ' || coalesce(v_shift.event_title, 'a shift'),
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

GRANT EXECUTE ON FUNCTION public.notify_managers_shift_confirmed(uuid) TO authenticated;
