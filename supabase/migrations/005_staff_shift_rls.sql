-- Staff-facing shift view: allow team members to read their own rows and linked event/venue data.
-- Matching is by profile_id or auth email on team_members.email (MVP staff access).

CREATE OR REPLACE FUNCTION public.user_team_member_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tm.id
  FROM public.team_members tm
  WHERE tm.profile_id = auth.uid()
     OR lower(tm.email) = lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

COMMENT ON FUNCTION public.user_team_member_ids() IS
  'Team member row IDs belonging to the authenticated user (profile or email match).';

CREATE POLICY "team_members_select_self" ON public.team_members
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

CREATE POLICY "rota_shifts_select_self" ON public.rota_shifts
  FOR SELECT TO authenticated
  USING (team_member_id IN (SELECT public.user_team_member_ids()));

CREATE POLICY "rota_shifts_update_self_confirm" ON public.rota_shifts
  FOR UPDATE TO authenticated
  USING (team_member_id IN (SELECT public.user_team_member_ids()))
  WITH CHECK (
    team_member_id IN (SELECT public.user_team_member_ids())
    AND status IN ('scheduled', 'confirmed', 'completed', 'cancelled')
  );

CREATE POLICY "venues_select_staff_shift" ON public.venues
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT rs.venue_id
      FROM public.rota_shifts rs
      WHERE rs.team_member_id IN (SELECT public.user_team_member_ids())
    )
  );

CREATE POLICY "events_select_staff_shift" ON public.events
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT rs.event_id
      FROM public.rota_shifts rs
      WHERE rs.team_member_id IN (SELECT public.user_team_member_ids())
        AND rs.event_id IS NOT NULL
    )
  );

CREATE POLICY "spaces_select_staff_shift" ON public.spaces
  FOR SELECT TO authenticated
  USING (
    venue_id IN (
      SELECT rs.venue_id
      FROM public.rota_shifts rs
      WHERE rs.team_member_id IN (SELECT public.user_team_member_ids())
    )
  );

CREATE POLICY "event_types_select_staff_shift" ON public.event_types
  FOR SELECT TO authenticated
  USING (
    venue_id IN (
      SELECT rs.venue_id
      FROM public.rota_shifts rs
      WHERE rs.team_member_id IN (SELECT public.user_team_member_ids())
    )
  );
