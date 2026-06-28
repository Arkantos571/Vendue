-- Fix infinite recursion between rota_shifts and events RLS policies (007).
-- Policies must not query each other directly; use SECURITY DEFINER helpers instead.

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

DROP POLICY IF EXISTS "rota_shifts_select_self" ON public.rota_shifts;

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
